use miette::{
    DebugReportHandler, GraphicalReportHandler, GraphicalTheme, JSONReportHandler,
    NarratableReportHandler,
};
use nom_supreme::error::{BaseErrorKind, ErrorTree, GenericErrorTree};
use nom_supreme::final_parser::Location;
use rand::distributions::{Uniform, WeightedIndex};
use rand::prelude::*;
use std::error::Error;
use std::{collections::HashMap, fmt};

use crate::nom_parser::{self, Span};

type TableId<'a> = &'a str;

#[derive(thiserror::Error, Debug, miette::Diagnostic)]
#[error("bad input")]
struct LocatedError<'a> {
    #[source_code]
    src: &'a str,

    #[label("{kind}")]
    span: miette::SourceSpan,

    kind: &'a BaseErrorKind<&'a str, Box<dyn std::error::Error + Send + Sync>>,
}

#[derive(Debug)]
pub enum TableError<'a> {
    ParseError(&'a str, ErrorTree<Span<'a>>),
    InvalidDefinition(String),
    CallError(String),
}

// TODO: just derive miette errors here?
// #[derive(Debug, thiserror::Error, miette::Diagnostic)]
// pub enum TableError<'a> {
//     #[error("syntax error")]
//     #[diagnostic(code(tabol::parse_tables))]
//     ParseError {
//         src: &'a str, ErrorTree<Span<'a>>
//     },

//     #[error("definition error")]
//     InvalidDefinition(String),

//     #[error("call error")]
//     CallError(String),
// }

impl<'a> TableError<'a> {
    fn write_located_error(&self, f: &mut fmt::Formatter, error: LocatedError<'a>) -> fmt::Result {
        // TODO: use JSONReportHandler to send contextual feedback across?
        GraphicalReportHandler::new_themed(GraphicalTheme::unicode_nocolor())
            .render_report(f, &error)
    }
}

impl<'a> Error for TableError<'a> {}

impl<'a> fmt::Display for TableError<'a> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            TableError::ParseError(source, e) => {
                match e {
                    GenericErrorTree::Base { location, kind } => {
                        self.write_located_error(
                            f,
                            LocatedError {
                                src: source,
                                span: miette::SourceSpan::new(location.location_offset().into(), 0),
                                kind,
                            },
                        )?;
                    }
                    GenericErrorTree::Stack { base, contexts: _ } => {
                        if let GenericErrorTree::Base { location, kind } = base.as_ref() {
                            self.write_located_error(
                                f,
                                LocatedError {
                                    src: source,
                                    span: miette::SourceSpan::new(
                                        location.location_offset().into(),
                                        0,
                                    ),
                                    kind,
                                },
                            )?;
                        }

                        // for (span, ctx) in contexts.iter() {
                        //   TODO: include contexts in miette error
                        // }
                    }
                    GenericErrorTree::Alt { .. } => {
                        writeln!(f, "alt")?;
                    }
                }
            }
            TableError::InvalidDefinition(msg) => {
                write!(f, "invalid table definition: {}", msg)?;
            }
            TableError::CallError(msg) => {
                write!(f, "invalid table call: {}", msg)?;
            }
        }

        Ok(())
    }
}

#[derive(Debug)]
pub struct Tabol<'a> {
    table_map: HashMap<&'a str, TableDefinition<'a>>,
}

impl<'a> Tabol<'a> {
    pub fn new(table_definitions: &'a str) -> Result<Self, TableError<'a>> {
        let mut table_map = HashMap::new();
        let tables = nom_parser::parse_tables(Span::new(table_definitions))
            .map_err(|e| TableError::ParseError(table_definitions, e))?;

        for table in tables {
            table_map.insert(table.id, table);
        }

        let tabol = Self { table_map };

        tabol.validate_tables()
    }

    fn validate_tables(self) -> Result<Self, TableError<'a>> {
        for (table_id, table) in self.table_map.iter() {
            for rule in table.rules.iter() {
                if let Err(err) = rule.resolve(&self) {
                    return Err(TableError::InvalidDefinition(format!(
                        "in table \"{}\" for rule \"{}\". Original error: \"{}\"",
                        table_id, rule.raw, err
                    )));
                }
            }
        }

        Ok(self)
    }

    pub fn table_ids(&self) -> Vec<&str> {
        self.table_map.keys().copied().collect()
    }

    pub fn gen(&self, id: &str) -> Result<String, TableError> {
        self.table_map
            .get(id)
            .ok_or(TableError::CallError(format!(
                "No table found with id {}",
                id
            )))
            .and_then(|table| table.gen(self))
    }

    pub fn gen_many(&self, id: &str, count: u8) -> Result<Vec<String>, TableError> {
        let table = self.table_map.get(id).ok_or(TableError::CallError(format!(
            "No table found with id {}",
            id
        )))?;

        let mut results = Vec::with_capacity(count as usize);

        for _ in 0..count {
            results.push(table.gen(self)?);
        }

        Ok(results)
    }
}

#[derive(Debug)]
pub struct TableDefinition<'a> {
    pub id: TableId<'a>,
    #[allow(unused)]
    pub title: &'a str,
    #[allow(unused)]
    pub rules: Vec<Rule<'a>>,
    #[allow(unused)]
    pub weights: Vec<f32>,
    pub distribution: WeightedIndex<f32>,
}

impl<'a> TableDefinition<'a> {
    pub fn new(title: &'a str, id: &'a str, rules: Vec<Rule<'a>>) -> Self {
        let weights: Vec<f32> = rules.iter().map(|rule| rule.weight).collect();

        Self {
            title,
            id,
            rules,
            weights: weights.to_owned(),
            distribution: WeightedIndex::new(&weights).unwrap(),
        }
    }

    pub fn gen(&self, tables: &'a Tabol) -> Result<String, TableError> {
        let mut rng = rand::thread_rng();
        let rule = &self.rules[self.distribution.sample(&mut rng)];

        rule.resolve(tables)
    }
}

#[derive(Debug, Clone)]
pub struct Rule<'a> {
    pub raw: &'a str,
    pub weight: f32,
    pub parts: Vec<RuleInst<'a>>,
}

impl<'a> Rule<'a> {
    pub fn resolve(&self, tables: &'a Tabol) -> Result<String, TableError> {
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
                    let mut resolved = tables.gen(id)?;

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

#[derive(Debug, Clone)]
pub enum RuleInst<'a> {
    DiceRoll(usize, usize), // (count, sides)
    Literal(&'a str),
    Interpolation(TableId<'a>, Vec<FilterOp>),
}

#[derive(Debug, Clone)]
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
