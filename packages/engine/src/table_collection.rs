use crate::nom_parser::{self, Span};
use rand::distributions::{Uniform, WeightedIndex};
use rand::prelude::*;
use serde::Serialize;
use std::collections::HashMap;
use std::str::FromStr;
use thiserror::Error;
use wasm_bindgen::prelude::*;
use web_sys::console;

static UNIQUE_GEN_LIMIT: usize = 20;

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
                            // @TODO: ignore other failures?
                            // This will cause `unique(N)` to fail if it can't generate a unique result
                            // which is kind of unexpected when simply authoring a rule. It makes sense
                            // when attempting to generate a result, but not when authoring.
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
                RuleInst::Interpolation(id, filters) => {
                    self.resolve_interpolation(id, filters, tables)
                }
                RuleInst::ExternalInterpolation(_ns, _id, nsid, filters) => {
                    self.resolve_interpolation(nsid, filters, tables)
                }
            })
            .collect();

        Ok(resolved?.join(""))
    }

    /**
     * Resolves an interpolation rule by generating a result from the table. If
     * the rule involves a `unique(N)` filter, it will attempt to generate N
     * unique results and concatenate them according to a `join(S)` filter (or
     * fall back to an empty string).
     */
    fn resolve_interpolation(
        &self,
        id: &str,
        filters: &Vec<FilterOp>,
        tables: &TableCollection,
    ) -> Result<String, TableError> {
        // if `opts` contains a `FilterOp::unique(N)`, set count to N
        let count = filters
            .iter()
            .find_map(|o| match o {
                FilterOp::Unique(n) => Some(*n),
                _ => None,
            })
            // if count is None, set to 1
            .unwrap_or(1);

        // if `opts` contains a `FilterOp::join(S)`, set separator to S
        let (separator, conjunction) = filters
            .iter()
            .find_map(|o| match o {
                FilterOp::Join(s, c) => Some((s.clone(), c.clone())),
                _ => None,
            })
            // if separator is None, set to empty string
            .unwrap_or(("".to_string(), None));

        let mut results = vec![];
        let mut failed_attempts = 0;

        while results.len() < count {
            let mut result = tables._gen(id, true)?;

            for opt in filters {
                opt.apply(&mut result);
            }

            if !results.contains(&result) {
                results.push(result);
            } else {
                failed_attempts += 1;
            }

            if failed_attempts > UNIQUE_GEN_LIMIT {
                return Err(TableError::CallError(format!(
                    "Failed to generate unique result for rule {} after 20 attempts",
                    self.raw
                )));
            }
        }

        if conjunction.is_some() && results.len() > 1 {
            let conjunction = conjunction.unwrap();
            let last = results.pop().unwrap();

            Ok(format!(
                "{}{}{}",
                results.join(separator.as_str()),
                conjunction,
                last
            ))
        } else {
            Ok(results.join(separator.as_str()))
        }
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
    // (count)
    Unique(usize),
    // (separator, conjunction)
    Join(String, Option<String>),
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
            FilterOp::Unique(_count) => {}
            FilterOp::Join(_separator, _conjunction) => {}
        }
    }
}

impl FromStr for FilterOp {
    type Err = TableError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "definite" => Ok(FilterOp::DefiniteArticle),
            "indefinite" => Ok(FilterOp::IndefiniteArticle),
            "capitalize" => Ok(FilterOp::Capitalize),
            _ => Err(TableError::ParseError(format!(
                "Invalid filter operation: {}",
                s
            ))),
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

    #[test]
    fn test_rule_resolve_simple_interpolation() {
        let mut table_map = HashMap::new();

        table_map.insert(
            "parent".to_string(),
            TableDefinition::new(
                "parent".to_string(),
                None,
                "Parent".to_string(),
                false,
                vec![Rule {
                    raw: "parent {child}".to_string(),
                    weight: 1.0,
                    parts: vec![
                        RuleInst::Literal("parent ".to_string()),
                        RuleInst::Interpolation("child".to_string(), vec![]),
                    ],
                }],
            ),
        );

        table_map.insert(
            "child".to_string(),
            TableDefinition::new(
                "child".to_string(),
                None,
                "Child".to_string(),
                false,
                vec![Rule {
                    raw: "child text".to_string(),
                    weight: 1.0,
                    parts: vec![RuleInst::Literal("child text".to_string())],
                }],
            ),
        );

        let collection = TableCollection {
            table_map,
            external_identifiers: vec![],
        };

        let result = collection._gen("parent", false);

        assert!(result.is_ok());

        if let Ok(text) = result {
            assert_eq!(text, "parent child text");
        }
    }

    #[test]
    fn test_rule_resolve_unique_interpolation() {
        let mut table_map = HashMap::new();

        table_map.insert(
            "parent".to_string(),
            TableDefinition::new(
                "parent".to_string(),
                None,
                "Parent".to_string(),
                false,
                vec![Rule {
                    raw: "parent {child|unique(2)}".to_string(),
                    weight: 1.0,
                    parts: vec![
                        RuleInst::Literal("parent ".to_string()),
                        RuleInst::Interpolation("child".to_string(), vec![FilterOp::Unique(2)]),
                    ],
                }],
            ),
        );

        table_map.insert(
            "child".to_string(),
            TableDefinition::new(
                "child".to_string(),
                None,
                "Child".to_string(),
                false,
                vec![
                    Rule {
                        raw: "child 1".to_string(),
                        weight: 1.0,
                        parts: vec![RuleInst::Literal("child 1".to_string())],
                    },
                    Rule {
                        raw: "child 2".to_string(),
                        weight: 1.0,
                        parts: vec![RuleInst::Literal("child 2".to_string())],
                    },
                ],
            ),
        );

        let collection = TableCollection {
            table_map,
            external_identifiers: vec![],
        };

        let result = collection._gen("parent", false);

        assert!(result.is_ok());

        if let Ok(text) = result {
            assert!(text == "parent child 1child 2" || text == "parent child 2child 1");
        }
    }

    #[test]
    fn test_rule_resolve_unique_interpolation_failure() {
        let mut table_map = HashMap::new();

        table_map.insert(
            "parent".to_string(),
            TableDefinition::new(
                "parent".to_string(),
                None,
                "Parent".to_string(),
                false,
                vec![Rule {
                    raw: "parent {child|unique(2)}".to_string(),
                    weight: 1.0,
                    parts: vec![
                        RuleInst::Literal("parent ".to_string()),
                        RuleInst::Interpolation("child".to_string(), vec![FilterOp::Unique(2)]),
                    ],
                }],
            ),
        );

        table_map.insert(
            "child".to_string(),
            TableDefinition::new(
                "child".to_string(),
                None,
                "Child".to_string(),
                false,
                vec![Rule {
                    raw: "child 1".to_string(),
                    weight: 1.0,
                    parts: vec![RuleInst::Literal("child 1".to_string())],
                }],
            ),
        );

        let collection = TableCollection {
            table_map,
            external_identifiers: vec![],
        };

        let result = collection._gen("parent", false);

        assert!(result.is_err());

        if let Err(TableError::CallError(msg)) = result {
            assert_eq!(msg, "Failed to generate unique result for rule parent {child|unique(2)} after 20 attempts");
        } else {
            panic!("Unexpected result: {:?}", result);
        }
    }

    #[test]
    fn test_rule_resolve_unique_interpolation_with_filters_and_join() {
        let mut table_map = HashMap::new();

        table_map.insert(
            "parent".to_string(),
            TableDefinition::new(
                "parent".to_string(),
                None,
                "Parent".to_string(),
                false,
                vec![Rule {
                    raw: "parent {child|indefinite|capitalize|unique(2)|join(', ')}".to_string(),
                    weight: 1.0,
                    parts: vec![
                        RuleInst::Literal("parent ".to_string()),
                        RuleInst::Interpolation(
                            "child".to_string(),
                            vec![
                                FilterOp::IndefiniteArticle,
                                FilterOp::Capitalize,
                                FilterOp::Unique(2),
                                FilterOp::Join(", ".to_string(), None),
                            ],
                        ),
                    ],
                }],
            ),
        );

        table_map.insert(
            "child".to_string(),
            TableDefinition::new(
                "child".to_string(),
                None,
                "Child".to_string(),
                false,
                vec![
                    Rule {
                        raw: "child 1".to_string(),
                        weight: 1.0,
                        parts: vec![RuleInst::Literal("child 1".to_string())],
                    },
                    Rule {
                        raw: "child 2".to_string(),
                        weight: 1.0,
                        parts: vec![RuleInst::Literal("child 2".to_string())],
                    },
                ],
            ),
        );

        let collection = TableCollection {
            table_map,
            external_identifiers: vec![],
        };

        let result = collection._gen("parent", false);

        assert!(result.is_ok());

        if let Ok(text) = result {
            assert!(text == "parent A child 1, A child 2" || text == "parent A child 2, A child 1");
        }
    }
}
