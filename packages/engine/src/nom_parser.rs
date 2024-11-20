use nom::{
    bytes::complete::{take_until, take_while1},
    character::complete::{digit1, line_ending, not_line_ending},
    combinator::{map_parser, opt},
    error::make_error,
    multi::{fold_many1, many0, many1, separated_list1},
    number::complete::float,
    sequence::{pair, separated_pair, tuple},
    IResult, Parser,
};
use nom_locate::LocatedSpan;
use nom_supreme::{error::ErrorTree, tag::complete::tag};
use nom_supreme::{final_parser::final_parser, parser_ext::ParserExt};

use crate::table_collection::{FilterOp, Rule, RuleInst, TableDefinition};

pub type Span<'a> = LocatedSpan<&'a str>;

type ParserResult<'a, T> = IResult<Span<'a>, T, ErrorTree<Span<'a>>>;

enum AttrValue<'a> {
    Text(Span<'a>),
    Bool(bool),
}

// --------- Tabol ---------
pub(crate) fn parse_tables(input: Span) -> Result<Vec<TableDefinition>, ErrorTree<Span>> {
    final_parser(
        separated_list1(pair(line_ending, line_ending), table)
            .context("Expected 1 or more table definitions"),
    )(input)
}

/**
 * --------- Table ---------
 *
 *   ┌───────────────────┐
 *   │    Frontmatter    │
 *   ├───────────────────┤
 *   │                   │
 *   │       Rules       │
 *   │                   │
 *   └───────────────────┘
 *
 */
fn table(input: Span) -> ParserResult<TableDefinition> {
    tuple((namespace_pragma, frontmatter, rules))
        .context("Invalid table definition")
        .map(|(namespace, frontmatter, rules)| {
            TableDefinition::new(
                frontmatter.id.to_string(),
                namespace.map(|s| s.to_string()),
                frontmatter.title.to_string(),
                frontmatter.export.unwrap(),
                rules,
            )
        })
        .parse(input)
}

fn namespace_pragma(input: Span) -> ParserResult<Option<&str>> {
    opt(namespace
        .preceded_by(tag("@@PRAGMA namespace="))
        .terminated(line_ending))
    .map_res(|s| Ok::<Option<&str>, ErrorTree<Span>>(s.map(|s| *s)))
    .parse(input)
}

struct Frontmatter<'a> {
    pub title: &'a str,
    pub id: &'a str,
    pub export: Option<bool>,
}

/**
 * Right now this parser requires that the frontmatter have `id` and `title` in
 * that order optionally followed by `export`.
 */
fn frontmatter(input: Span) -> ParserResult<Frontmatter> {
    let (input, mut attrs): (Span, Vec<(&str, AttrValue)>) =
        fold_many1(frontmatter_attr, Vec::new, |mut acc: Vec<_>, (k, v)| {
            acc.push((*k, v));
            acc
        })
        .map_res(|mut acc| {
            acc.reverse();
            Ok::<Vec<(&str, AttrValue)>, ErrorTree<Span>>(acc)
        })
        .delimited_by(
            pair(tag("---"), line_ending).context("Table attributes should be enclosed in `---`"),
        )
        .context("Invalid table attributes")
        .parse(input)?;

    // XXX: this sucks
    // - allows "title: ", but not "title:"
    // TODO: arbitary frontmatter???
    let id = if let Some(("id", AttrValue::Text(s))) = attrs.pop() {
        *s
    } else {
        return Err(nom::Err::Failure(make_error(
            input,
            // XXX: not great display
            nom::error::ErrorKind::Fail,
        )));
    };

    let title = if let Some(("title", AttrValue::Text(s))) = attrs.pop() {
        *s
    } else {
        return Err(nom::Err::Failure(make_error(
            input,
            // XXX: not great display
            nom::error::ErrorKind::Fail,
        )));
    };

    let export = if let Some(("export", AttrValue::Bool(b))) = attrs.pop() {
        Some(b)
    } else {
        Some(false)
    };

    Ok((input, Frontmatter { id, title, export }))
}

fn frontmatter_attr(input: Span) -> ParserResult<(Span, AttrValue)> {
    id_attr
        .or(title_attr)
        .or(export_attr)
        .context("Table attributes should be formatted like `name: value`")
        .terminated(line_ending)
        .parse(input)
}

fn id_attr(input: Span) -> ParserResult<(Span, AttrValue)> {
    separated_pair(
        tag("id").context("Table attributes can only contain alphanumeric characters"),
        tag(": ").context("Missing table attribute separator, expected `:`"),
        ident.map_res(|s| Ok::<AttrValue, ErrorTree<Span>>(AttrValue::Text(s))),
    )
    .parse(input)
}

fn title_attr(input: Span) -> ParserResult<(Span, AttrValue)> {
    separated_pair(
        tag("title").context("Table attributes can only contain alphanumeric characters"),
        tag(": ").context("Missing table attribute separator, expected `:`"),
        map_parser(not_line_ending, literal)
            .map_res(|s| Ok::<AttrValue, ErrorTree<Span>>(AttrValue::Text(s))),
    )
    .parse(input)
}

fn export_attr(input: Span) -> ParserResult<(Span, AttrValue)> {
    separated_pair(
        tag("export").context("Table attributes can only contain alphanumeric characters"),
        tag(": ").context("Missing table attribute separator, expected `:`"),
        tag("true")
            .or(tag("false"))
            .map_res(|b: Span| Ok::<AttrValue, ErrorTree<Span>>(AttrValue::Bool(*b == "true"))),
    )
    .parse(input)
}

// --------- Rules ---------
fn rules(input: Span) -> ParserResult<Vec<Rule>> {
    separated_list1(line_ending, rule_line).parse(input)
}

fn rule_line(input: Span) -> ParserResult<Rule> {
    // the `map_parser(not_line_ending, rule_line)` is important, so that
    // `rule_line` doesn't parse past '\n' at the end of the current line
    map_parser(
        not_line_ending,
        separated_pair(
            float.context("Invalid rule weight, expected an integer or float"),
            tag(": ").context("Missing rule separator, expected `:`"),
            rule,
        )
        .context("Rule should start with a weight, followed by a `:` and then the rule text")
        .map(|(weight, (raw, parts))| Rule {
            raw: (*raw).to_string(),
            weight,
            parts,
        }),
    )
    .parse(input)
}

// --------- Rule ---------
pub fn rule(input: Span) -> ParserResult<(Span, Vec<RuleInst>)> {
    many1(rule_dice_roll.or(imported_rule_interpolation).or(rule_interpolation).or(rule_literal))
        .context("Invalid rule text, expected a dice roll (`2d4`), an interpolation (`{other}`) or a literal")
        .with_recognized()
        .parse(input)
}

fn rule_dice_roll(input: Span) -> ParserResult<RuleInst> {
    tuple((
        digit1.map_res(|s: Span| s.parse::<usize>()),
        digit1
            .map_res(|s: Span| s.parse::<usize>())
            .preceded_by(tag("d")),
    ))
    .or(digit1
        .map_res(|s: Span| s.parse::<usize>())
        .preceded_by(tag("d"))
        .map(|sides| (1, sides)))
    .preceded_by(tag("{"))
    .terminated(tag("}"))
    .context("dice roll literal")
    .map(|(count, sides)| RuleInst::DiceRoll(count, sides))
    .parse(input)
}

fn rule_literal(input: Span) -> ParserResult<RuleInst> {
    // can't just do `take_until("{").or(not_line_ending)` or else we'll
    // successfully parse "" which causes many1 to fail
    map_parser(take_until("{").or(not_line_ending), literal)
        .context("rule literal")
        .map(|x| RuleInst::Literal((*x).to_string()))
        .parse(input)
}

fn imported_rule_interpolation(input: Span) -> ParserResult<RuleInst> {
    imported_pipeline
        .preceded_by(tag("{"))
        .terminated(tag("}"))
        .context("Invalid imported rule interpolation")
        .map(|(ns, id, filters)| {
            RuleInst::ExternalInterpolation(
                ns.to_string(),
                id.to_string(),
                format!("{ns}/{id}").to_string(),
                filters,
            )
        })
        .parse(input)
}

fn imported_pipeline(input: Span) -> ParserResult<(Span, Span, Vec<FilterOp>)> {
    tuple((namespace, ident.preceded_by(tag("/")), filters))
        .context("Invalid imported interpolation pipeline")
        .parse(input)
}

fn rule_interpolation(input: Span) -> ParserResult<RuleInst> {
    pipeline
        .preceded_by(tag("{"))
        .terminated(tag("}"))
        .context("Invalid rule interpolation")
        .map(|(s, filters)| RuleInst::Interpolation((*s).to_string(), filters))
        .parse(input)
}

fn pipeline(input: Span) -> ParserResult<(Span, Vec<FilterOp>)> {
    pair(ident.cut(), filters)
        .context("Invalid interpolation pipeline")
        .parse(input)
}

fn filters(input: Span) -> ParserResult<Vec<FilterOp>> {
    many0(
        transform_filter
            .or(unique_filter)
            .or(join_filter)
            .preceded_by(tag("|")),
    )
    .parse(input)
}

fn transform_filter(input: Span) -> ParserResult<FilterOp> {
    ident
        .map_res(|s| s.parse())
        .context("Invalid filter")
        .parse(input)
}

fn unique_filter(input: Span) -> ParserResult<FilterOp> {
    digit1
        .preceded_by(tag("unique("))
        .terminated(tag(")"))
        .context("Invalid unique filter")
        .map_res(|s: Span| s.parse::<usize>())
        .map(FilterOp::Unique)
        .parse(input)
}

fn join_filter(input: Span) -> ParserResult<FilterOp> {
    take_until("')")
        .preceded_by(tag("join('"))
        .terminated(tag("')"))
        .context("Invalid join filter")
        .map(|s: Span| FilterOp::Join(s.to_string()))
        .parse(input)
}

fn literal(input: Span) -> ParserResult<Span> {
    take_while1(|c: char| {
        c.is_alphanumeric() || c == '_' || c == '-' || c.is_whitespace() || c.is_ascii_punctuation()
    })
    .context("Invalid literal")
    .parse(input)
}

// any_text_0r_numbers-and-hyphens
fn ident(input: Span) -> ParserResult<Span> {
    take_while1(|c: char| c.is_alphanumeric() || c == '_' || c == '-')
        .context("Invalid identifier, only alphanumeric characters and `_` are allowed")
        .parse(input)
}

// @namespace/identifer
fn namespace(input: Span) -> ParserResult<Span> {
    ident
        .preceded_by(tag("@"))
        .terminated(ident.preceded_by(tag("/")))
        .with_recognized()
        .map_res(|(full_match, _)| Ok::<LocatedSpan<&str>, ErrorTree<Span>>(full_match))
        .context("Invalid namespace, must be of the format `@namespace/identifier`")
        .parse(input)
}

// @namespace/identifer/identifier
#[allow(unused)]
fn namespace_ident(input: Span) -> ParserResult<Span> {
    separated_pair(
        namespace,
        tag("/"),
        ident
    )
    .with_recognized()
    .map_res(|(full_match, _)| Ok::<LocatedSpan<&str>, ErrorTree<Span>>(full_match))
    .context(
        "Invalid namespace identifier, must be of the format `@namespace/indentifier/identifier",
    )
    .parse(input)
}

#[cfg(test)]
mod tests {
    use rand::distributions::WeightedIndex;

    use super::*;

    // test id cannot come after title
    // test must have 1 new line between tables

    #[test]
    fn test_frontmatter() {
        let table_definitions = parse_tables(
            "---
id: color
title: Colors
---
1: Redish Orange
3: Greenish Blue
1: Purplish Pink
3: Brownish Grey

---
id: shape
title: Shapes
---
1: Circle
1: Square
1: Triangle
1: Rectangle
1: Pentagon
1: Hexagon
1: Octagon"
                .into(),
        )
        .expect("Failed to parse");

        assert_eq!(table_definitions.len(), 2, "Expected 2 table definitions");

        if let [a, b] = table_definitions.as_slice() {
            assert_eq!(a.id, "color");
            assert_eq!(a.title, "Colors");
            assert_eq!(a.namespace, None);
            assert!(!a.export);
            assert_eq!(a.weights, vec![1.0, 3.0, 1.0, 3.0]);
            assert_eq!(
                a.distribution,
                WeightedIndex::new(vec![1.0, 3.0, 1.0, 3.0]).unwrap()
            );

            assert_eq!(b.id, "shape");
            assert_eq!(b.title, "Shapes");
            assert_eq!(b.namespace, None);
            assert!(!b.export);
            assert_eq!(b.weights, vec![1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
            assert_eq!(
                b.distribution,
                WeightedIndex::new(vec![1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]).unwrap()
            );
        }
    }

    #[test]
    fn namespace_pragma_test() {
        let result: Result<Option<&str>, ErrorTree<Span>> =
            final_parser(namespace_pragma)("@@PRAGMA namespace=@hello/there\n".into());

        assert!(result.is_ok());

        let namespace_opt = result.unwrap();

        assert!(namespace_opt.is_some());
        assert_eq!(namespace_opt.unwrap(), "@hello/there");
    }

    #[test]
    fn namespace_test() {
        let result: Result<LocatedSpan<&str>, ErrorTree<Span>> =
            final_parser(namespace)("abc@123-some/thing_else".into());

        assert!(result.is_err());

        let result: Result<LocatedSpan<&str>, ErrorTree<Span>> =
            final_parser(namespace)("@hello/there".into());

        assert!(result.is_ok());
        assert_eq!(result.unwrap().fragment(), &"@hello/there");
    }

    #[test]
    fn namespace_ident_test() {
        let result: Result<LocatedSpan<&str>, ErrorTree<Span>> =
            final_parser(namespace_ident)("@hello/there".into());

        assert!(result.is_err());

        let result: Result<LocatedSpan<&str>, ErrorTree<Span>> =
            final_parser(namespace_ident)("@hello/there/friend".into());

        assert!(result.is_ok());
        assert_eq!(result.unwrap().fragment(), &"@hello/there/friend");
    }

    #[test]
    fn imported_rule_interpolation_test() {
        let result: Result<RuleInst, ErrorTree<Span>> =
            final_parser(imported_rule_interpolation)("{@hello/there/friend|capitalize}".into());

        assert!(result.is_ok());
        let rule_inst = result.unwrap();

        assert!(matches!(rule_inst, RuleInst::ExternalInterpolation(..)));

        if let RuleInst::ExternalInterpolation(ns, id, nsid, _filters) = rule_inst {
            assert_eq!(ns.as_str(), "@hello/there");
            assert_eq!(id.as_str(), "friend");
            assert_eq!(nsid.as_str(), "@hello/there/friend");
        }
    }

    #[test]
    fn rule_line_literal_test() {
        let result: Result<Rule, ErrorTree<Span>> = final_parser(rule_line)("1: literal".into());

        assert!(result.is_ok());
        let rule = result.unwrap();

        assert_eq!(rule.weight, 1.0);
        assert_eq!(&rule.parts.len(), &1);
        assert!(matches!(&rule.parts[0], RuleInst::Literal(..)));

        if let RuleInst::Literal(lit) = &rule.parts[0] {
            assert_eq!(lit.as_str(), "literal");
        }
    }

    #[test]
    fn rule_line_dice_roll_test() {
        let result: Result<Rule, ErrorTree<Span>> = final_parser(rule_line)("1: {3d6}".into());

        assert!(result.is_ok());
        let rule = result.unwrap();

        assert_eq!(rule.weight, 1.0);
        assert_eq!(&rule.parts.len(), &1);
        assert!(matches!(&rule.parts[0], RuleInst::DiceRoll(..)));

        if let RuleInst::DiceRoll(dice_count, dice_size) = &rule.parts[0] {
            assert_eq!(*dice_count, 3);
            assert_eq!(*dice_size, 6);
        }
    }

    #[test]
    fn rule_line_interpolation_test() {
        let result: Result<Rule, ErrorTree<Span>> = final_parser(rule_line)("1: {table}".into());

        assert!(result.is_ok());
        let rule = result.unwrap();

        assert_eq!(rule.weight, 1.0);
        assert_eq!(&rule.parts.len(), &1);
        assert!(matches!(&rule.parts[0], RuleInst::Interpolation(..)));

        if let RuleInst::Interpolation(table_id, filters) = &rule.parts[0] {
            assert_eq!(table_id, &String::from("table"));
            assert_eq!(filters.len(), 0);
        }
    }

    #[test]
    fn rule_line_external_interpolation_test() {
        let result: Result<Rule, ErrorTree<Span>> =
            final_parser(rule_line)("1: {@user/collection/table}".into());

        assert!(result.is_ok());
        let rule = result.unwrap();

        assert_eq!(rule.weight, 1.0);
        assert_eq!(&rule.parts.len(), &1);
        assert!(matches!(
            &rule.parts[0],
            RuleInst::ExternalInterpolation(..)
        ));

        if let RuleInst::ExternalInterpolation(namespace, table_id, namespaced_id, filters) =
            &rule.parts[0]
        {
            assert_eq!(namespace, &String::from("@user/collection"));
            assert_eq!(table_id, &String::from("table"));
            assert_eq!(namespaced_id, &String::from("@user/collection/table"));
            assert_eq!(filters.len(), 0);
        }
    }

    #[test]
    fn rule_line_filters_test() {
        let result: Result<Rule, ErrorTree<Span>> =
            final_parser(rule_line)("1: {table|definite|indefinite|capitalize}".into());

        assert!(result.is_ok());
        let rule = result.unwrap();

        assert_eq!(rule.weight, 1.0);
        assert_eq!(&rule.parts.len(), &1);
        assert!(matches!(&rule.parts[0], RuleInst::Interpolation(..)));

        if let RuleInst::Interpolation(_table_id, filters) = &rule.parts[0] {
            assert_eq!(filters.len(), 3);
            assert!(matches!(
                filters.as_slice(),
                [
                    FilterOp::DefiniteArticle,
                    FilterOp::IndefiniteArticle,
                    FilterOp::Capitalize
                ]
            ));
        }
    }

    #[test]
    fn rule_line_filters_unique_join_test() {
        let result: Result<Rule, ErrorTree<Span>> =
            final_parser(rule_line)("1: {table|unique(3)|join(', ')}".into());

        if let Err(e) = &result {
            println!("{}", e);
        }

        assert!(result.is_ok());
        let rule = result.unwrap();

        assert_eq!(rule.weight, 1.0);
        assert_eq!(&rule.parts.len(), &1);
        assert!(matches!(&rule.parts[0], RuleInst::Interpolation(..)));

        if let RuleInst::Interpolation(_table_id, filters) = &rule.parts[0] {
            assert_eq!(filters.len(), 2);
            assert!(matches!(
                filters.as_slice(),
                [FilterOp::Unique(3), FilterOp::Join(..),]
            ));

            if let FilterOp::Join(sep) = &filters[1] {
                assert_eq!(sep, ", ");
            }
        }
    }
}
