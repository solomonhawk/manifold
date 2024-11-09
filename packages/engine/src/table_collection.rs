use crate::nom_parser::{self, Span};
use rand::distributions::{Uniform, WeightedIndex};
use rand::prelude::*;
use serde::Serialize;
use std::collections::HashMap;
use thiserror::Error;
use wasm_bindgen::prelude::*;
use web_sys::console;

#[derive(Debug, Clone, Error)]
pub enum TableError {
    #[error("Failed to parse: {0}")]
    ParseError(String),
    #[error("Invalid definition: {0}")]
    InvalidDefinition(String),
    #[error("Invalid call: {0}")]
    CallError(String),
    #[error("Missing dependency: {0}")]
    MissingDependencyError(String, String),
}

#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct TableCollection {
    table_map: HashMap<String, TableDefinition>,
    external_identifiers: Vec<String>,
}

#[wasm_bindgen]
impl TableCollection {
    #[wasm_bindgen(constructor)]
    pub fn new(table_definitions: &str) -> Result<TableCollection, JsError> {
        let mut table_map = HashMap::new();
        let tables = nom_parser::parse_tables(Span::new(table_definitions))
            // @TODO: do something with `e`, better errors plz
            .map_err(|_e| TableError::ParseError(table_definitions.to_string()))?;

        let mut external_identifiers: Vec<String> = vec![];

        for table in tables {
            if table.namespace.is_none() {
                external_identifiers.extend(table.external_identifiers());
            }

            table_map.insert(table.id.clone(), table);
        }

        Ok(Self {
            table_map,
            external_identifiers,
        })
    }

    // @TODO: this should be able to say "here are the unresolved tables"
    pub fn validate_tables(&self) -> Result<Vec<String>, JsError> {
        let mut missing_identifiers: Vec<String> = vec![];

        for (table_id, table) in self.table_map.iter() {
            // only validate non-imported table definitions
            // @ASSUMPTION: the imported tables are valid
            if table.namespace.is_none() {
                for rule in table.rules.iter() {
                    if let Err(err) = rule.resolve(self) {
                        console::log_1(&format!("{:?}", err).into());
                        // only if the call error is missing table and the table is an external table?
                        // always return all external references?
                        match err {
                            TableError::MissingDependencyError(_, id) => {
                                missing_identifiers.push(id);
                            }
                            e => {
                                return Err(TableError::InvalidDefinition(format!(
                                    "in table \"{}\" for rule \"{}\". Original error: \"{}\"",
                                    table_id, rule.raw, e
                                ))
                                .into())
                            }
                        };
                    }
                }
            }
        }

        Ok(missing_identifiers)
    }

    pub fn table_metadata(&self) -> Vec<JsValue> {
        let mut tables = self.table_map.values().collect::<Vec<&TableDefinition>>();

        tables.sort_by(|a, b| a.title.cmp(&b.title));

        tables
            .into_iter()
            .map(|def| serde_wasm_bindgen::to_value(&def).unwrap())
            .collect()
    }

    pub fn dependencies(&self) -> Vec<String> {
        self.external_identifiers.clone()
    }

    fn _gen(&self, id: &str, is_external: bool) -> Result<String, TableError> {
        self.table_map
            .get(id)
            .ok_or(if is_external {
                TableError::MissingDependencyError(
                    format!("Missing dependency with id {}", id),
                    id.to_string(),
                )
            } else {
                TableError::CallError(format!("No table found with id {}", id))
            })
            .and_then(|table| table.gen(self))
    }

    pub fn gen(&self, id: &str, is_external: bool) -> Result<String, JsError> {
        self._gen(id, is_external).map_err(|e| e.into())
    }

    fn _gen_many(&self, id: &str, count: usize) -> Result<Vec<String>, JsError> {
        let table = self.table_map.get(id).ok_or(TableError::CallError(format!(
            "No table found with id {}",
            id
        )))?;

        let mut results = Vec::with_capacity(count);

        for _ in 0..count {
            results.push(table.gen(self)?);
        }

        Ok(results)
    }

    pub fn gen_many(&self, id: &str, count: usize) -> Result<Vec<String>, JsError> {
        self._gen_many(id, count)
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct TableDefinition {
    pub id: String,
    pub namespace: Option<String>,
    pub title: String,
    pub export: bool,
    #[allow(unused)]
    pub rules: Vec<Rule>,
    #[allow(unused)]
    pub weights: Vec<f32>,
    #[serde(skip)]
    pub distribution: WeightedIndex<f32>,
}

impl TableDefinition {
    pub fn new(
        id: String,
        namespace: Option<String>,
        title: String,
        export: bool,
        mut rules: Vec<Rule>,
    ) -> Self {
        let weights: Vec<f32> = rules.iter().map(|rule| rule.weight).collect();
        let identifier = format_namespaced_id(&namespace, id);

        namespaced_rules(&namespace, &mut rules);

        Self {
            id: identifier,
            namespace: namespace.clone(),
            title,
            export,
            rules,
            weights: weights.to_owned(),
            distribution: WeightedIndex::new(&weights).unwrap(),
        }
    }

    pub fn gen(&self, tables: &TableCollection) -> Result<String, TableError> {
        let mut rng = rand::thread_rng();
        let rule = &self.rules[self.distribution.sample(&mut rng)];

        rule.resolve(tables)
    }

    pub fn external_identifiers(&self) -> Vec<String> {
        self.rules
            .iter()
            .flat_map(|r| r.external_identifiers())
            .collect()
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Rule {
    pub raw: String,
    pub weight: f32,
    pub parts: Vec<RuleInst>,
}

impl Rule {
    pub fn resolve(&self, tables: &TableCollection) -> Result<String, TableError> {
        // keep track of context
        // forward pass to resolve all interpolations
        // backwards pass to resolve built-ins (e.g. article)
        let resolved: Result<Vec<String>, TableError> = self
            .parts
            .iter()
            .map(|part| match part {
                RuleInst::DiceRoll(count, sides) => Ok(roll_dice(*count, *sides).to_string()),
                RuleInst::Literal(str) => Ok(str.to_string()),
                RuleInst::Interpolation(id, opts) => {
                    let mut resolved = tables._gen(id, false)?;

                    for opt in opts {
                        opt.apply(&mut resolved);
                    }

                    Ok(resolved)
                }
                RuleInst::ExternalInterpolation(_ns, _id, nsid, opts) => {
                    let mut resolved = tables._gen(nsid, true)?;

                    for opt in opts {
                        opt.apply(&mut resolved);
                    }

                    Ok(resolved)
                }
            })
            .collect();

        Ok(resolved?.join(""))
    }

    pub fn external_identifiers(&self) -> Vec<String> {
        self.parts
            .iter()
            .filter_map(|p| match p {
                RuleInst::ExternalInterpolation(ns, _id, _nsid, _vec) => Some(ns.to_string()),
                _ => None,
            })
            .collect::<Vec<String>>()
    }
}

#[derive(Debug, Clone, Serialize)]
pub enum RuleInst {
    DiceRoll(usize, usize), // (count, sides)
    Literal(String),
    // (table id, filters)
    Interpolation(String, Vec<FilterOp>),
    // (namespace, table id, namespaced id, filters)
    ExternalInterpolation(String, String, String, Vec<FilterOp>),
}

#[derive(Debug, Clone, Serialize)]
pub enum FilterOp {
    DefiniteArticle,
    IndefiniteArticle,
    Capitalize,
}

impl FilterOp {
    pub fn apply(&self, value: &mut String) {
        match self {
            FilterOp::DefiniteArticle => {
                value.insert_str(0, "the ");
            }
            FilterOp::IndefiniteArticle
                if value.starts_with('a')
                    || value.starts_with('e')
                    || value.starts_with('i')
                    || value.starts_with('o')
                    || value.starts_with('u') =>
            {
                value.insert_str(0, "an ");
            }
            FilterOp::IndefiniteArticle => {
                value.insert_str(0, "a ");
            }
            FilterOp::Capitalize => {
                let mut chars = value.chars();
                if let Some(first) = chars.next() {
                    *value = format!("{}{}", first.to_uppercase(), chars.as_str());
                }
            }
        }
    }
}

pub fn roll_dice(count: usize, sides: usize) -> usize {
    let mut rng = rand::thread_rng();
    let mut total = 0;

    for _ in 0..count {
        total += rng.sample(Uniform::new(1, sides + 1));
    }

    total
}

pub fn format_namespaced_id(namespace: &Option<String>, id: String) -> String {
    if namespace.is_some() {
        format!("{}/{id}", namespace.clone().unwrap())
    } else {
        id
    }
}

/**
 * Replaces Interpolation table ID's with a namespace-prefixed id if there is
 * a namespace that's being used.
 */
pub fn namespaced_rules<'a>(namespace: &Option<String>, rules: &'a mut [Rule]) -> &'a mut [Rule] {
    if namespace.is_some() {
        for rule in rules.iter_mut() {
            for part in rule.parts.iter_mut() {
                if let RuleInst::Interpolation(id, filters) = part {
                    *part = RuleInst::Interpolation(
                        format_namespaced_id(namespace, id.to_string()),
                        filters.clone(),
                    );
                }
            }
        }
    }

    rules
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_roll_dice() {
        for _ in 0..10000 {
            let roll = roll_dice(1, 6);
            assert!(roll >= 1);
            assert!(roll <= 6);
        }

        for _ in 0..10000 {
            let roll = roll_dice(5, 10);
            assert!(roll >= 5);
            assert!(roll <= 50);
        }
    }
}
