use crate::nom_parser::{self, Span};
use rand::distributions::{Uniform, WeightedIndex};
use rand::prelude::*;
use serde::Serialize;
use std::collections::HashMap;
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Error)]
pub enum TableError {
    #[error("Failed to parse: {0}")]
    ParseError(String),
    #[error("Invalid definition: {0}")]
    InvalidDefinition(String),
    #[error("Invalid call: {0}")]
    CallError(String),
}

#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct Tabol {
    table_map: HashMap<String, TableDefinition>,
}

#[wasm_bindgen]
impl Tabol {
    #[wasm_bindgen(constructor)]
    pub fn new(table_definitions: &str) -> Result<Tabol, JsError> {
        let mut table_map = HashMap::new();
        let tables = nom_parser::parse_tables(Span::new(table_definitions))
            .map_err(|_e| TableError::ParseError(table_definitions.to_string()))?;

        for table in tables {
            table_map.insert(table.id.clone(), table);
        }

        let tabol = Self { table_map };

        tabol.validate_tables()
    }

    fn validate_tables(self) -> Result<Tabol, JsError> {
        for (table_id, table) in self.table_map.iter() {
            for rule in table.rules.iter() {
                if let Err(err) = rule.resolve(&self) {
                    return Err(TableError::InvalidDefinition(format!(
                        "in table \"{}\" for rule \"{}\". Original error: \"{}\"",
                        table_id, rule.raw, err
                    ))
                    .into());
                }
            }
        }

        Ok(self)
    }

    pub fn table_metadata(&self) -> Vec<JsValue> {
        let mut tables = self.table_map.values().collect::<Vec<&TableDefinition>>();

        tables.sort_by(|a, b| a.title.cmp(&b.title));

        tables
            .into_iter()
            .map(|def| serde_wasm_bindgen::to_value(&def).unwrap())
            .collect()
    }

    fn _gen(&self, id: &str) -> Result<String, TableError> {
        self.table_map
            .get(id)
            .ok_or(TableError::CallError(format!(
                "No table found with id {}",
                id
            )))
            .and_then(|table| table.gen(self))
    }

    pub fn gen(&self, id: &str) -> Result<String, JsError> {
        self._gen(id).map_err(|e| e.into())
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
    pub fn new(id: String, title: String, export: bool, rules: Vec<Rule>) -> Self {
        let weights: Vec<f32> = rules.iter().map(|rule| rule.weight).collect();

        Self {
            id,
            title,
            export,
            rules,
            weights: weights.to_owned(),
            distribution: WeightedIndex::new(&weights).unwrap(),
        }
    }

    pub fn gen(&self, tables: &Tabol) -> Result<String, TableError> {
        let mut rng = rand::thread_rng();
        let rule = &self.rules[self.distribution.sample(&mut rng)];

        rule.resolve(tables)
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Rule {
    pub raw: String,
    pub weight: f32,
    pub parts: Vec<RuleInst>,
}

impl Rule {
    pub fn resolve(&self, tables: &Tabol) -> Result<String, TableError> {
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
                    let mut resolved = tables._gen(id)?;

                    for opt in opts {
                        opt.apply(&mut resolved);
                    }

                    Ok(resolved)
                }
            })
            .collect();

        Ok(resolved?.join(""))
    }
}

#[derive(Debug, Clone, Serialize)]
pub enum RuleInst {
    DiceRoll(usize, usize), // (count, sides)
    Literal(String),
    Interpolation(String, Vec<FilterOp>),
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
