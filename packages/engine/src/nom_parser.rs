use nom::{
    bytes::complete::{take_until, take_while1},
    character::complete::{digit1, line_ending, multispace0, not_line_ending},
    combinator::map_parser,
    error::make_error,
    multi::{fold_many1, many0, many1, separated_list1},
    number::complete::float,
    sequence::{pair, separated_pair, tuple},
    IResult, Parser,
};
use nom_locate::LocatedSpan;
use nom_supreme::{error::ErrorTree, tag::complete::tag};
use nom_supreme::{final_parser::final_parser, parser_ext::ParserExt};
use std::collections::HashMap;

use crate::table_collection::{FilterOp, Rule, RuleInst, TableDefinition};

pub type Span<'a> = LocatedSpan<&'a str>;

enum AttrValue<'a> {
    Text(Span<'a>),
    Bool(bool),
}

// --------- Tabol ---------
pub(crate) fn parse_tables(input: Span) -> Result<Vec<TableDefinition>, ErrorTree<Span>> {
    final_parser(many1(table).context("Expected 1 or more table definitions"))(input)
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
fn table(input: Span) -> IResult<Span, TableDefinition, ErrorTree<Span>> {
    tuple((frontmatter, rules))
        .context("Invalid table definition")
        .map(|(frontmatter, rules)| {
            TableDefinition::new(
                frontmatter.id.to_string(),
                frontmatter.title.to_string(),
                frontmatter.export.unwrap(),
                rules,
            )
        })
        .parse(input)
}

struct Frontmatter<'a> {
    pub title: &'a str,
    pub id: &'a str,
    pub export: Option<bool>,
}

fn frontmatter(input: Span) -> IResult<Span, Frontmatter, ErrorTree<Span>> {
    let (input, attrs): (Span, HashMap<&str, AttrValue>) = fold_many1(
        frontmatter_attr,
        HashMap::new,
        |mut acc: HashMap<_, _>, (k, v)| {
            acc.insert(*k, v);
            acc
        },
    )
    .delimited_by(
        pair(tag("---"), line_ending).context("Table attributes should be enclosed in `---`"),
    )
    .context("Invalid table attributes")
    .parse(input)?;

    // XXX: this sucks
    // - allows "title: ", but not "title:"
    // TODO: arbitary frontmatter???
    let id = (match attrs.get("id") {
        Some(AttrValue::Text(s)) => Some(s.fragment()),
        _ => None,
    })
    .ok_or(nom::Err::Failure(make_error(
        input,
        // XXX: not great display
        nom::error::ErrorKind::Many1,
    )))?;

    let title = (match attrs.get("title") {
        Some(AttrValue::Text(s)) => Some(s.fragment()),
        _ => None,
    })
    .ok_or(nom::Err::Failure(make_error(
        input,
        // XXX: not great display
        nom::error::ErrorKind::Many1,
    )))?;

    let export = (match attrs.get("export") {
        Some(AttrValue::Bool(b)) => Some(*b),
        _ => None,
    })
    .or(Some(false));

    Ok((input, Frontmatter { id, title, export }))
}

fn frontmatter_attr(input: Span) -> IResult<Span, (Span, AttrValue), ErrorTree<Span>> {
    id_attr
        .or(title_attr)
        .or(export_attr)
        .context("Table attributes should be formatted like `name: value`")
        .terminated(line_ending)
        .parse(input)
}

fn id_attr(input: Span) -> IResult<Span, (Span, AttrValue), ErrorTree<Span>> {
    separated_pair(
        tag("id").context("Table attributes can only contain alphanumeric characters"),
        tag(": ").context("Missing table attribute separator, expected `:`"),
        ident.map_res(|s| Ok::<AttrValue, ErrorTree<Span>>(AttrValue::Text(s))),
    )
    .parse(input)
}

fn title_attr(input: Span) -> IResult<Span, (Span, AttrValue), ErrorTree<Span>> {
    separated_pair(
        tag("title").context("Table attributes can only contain alphanumeric characters"),
        tag(": ").context("Missing table attribute separator, expected `:`"),
        map_parser(not_line_ending, literal)
            .map_res(|s| Ok::<AttrValue, ErrorTree<Span>>(AttrValue::Text(s))),
    )
    .parse(input)
}

fn export_attr(input: Span) -> IResult<Span, (Span, AttrValue), ErrorTree<Span>> {
    separated_pair(
        tag("export").context("Table attributes can only contain alphanumeric characters"),
        tag(": ").context("Missing table attribute separator, expected `:`"),
        tag("true").or(tag("false")).map_res(|b: Span| {
            Ok::<AttrValue, ErrorTree<Span>>(AttrValue::Bool(b.fragment() == &"true"))
        }),
    )
    .parse(input)
}

// --------- Rules ---------
fn rules(input: Span) -> IResult<Span, Vec<Rule>, ErrorTree<Span>> {
    separated_list1(line_ending, rule_line)
        .terminated(multispace0)
        .parse(input)
}

fn rule_line(input: Span) -> IResult<Span, Rule, ErrorTree<Span>> {
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
pub fn rule(input: Span) -> IResult<Span, (Span, Vec<RuleInst>), ErrorTree<Span>> {
    many1(rule_dice_roll.or(rule_interpolation).or(rule_literal))
        .context("Invalid rule text, expected a dice roll (`2d4`), an interpolation (`{{other}}`) or a literal")
        .with_recognized()
        .parse(input)
}

fn rule_dice_roll(input: Span) -> IResult<Span, RuleInst, ErrorTree<Span>> {
    tuple((
        digit1.map_res(|span: Span| span.fragment().parse::<usize>()),
        digit1
            .map_res(|span: Span| span.fragment().parse::<usize>())
            .preceded_by(tag("d")),
    ))
    .or(digit1
        .map_res(|span: Span| span.fragment().parse::<usize>())
        .preceded_by(tag("d"))
        .map(|sides| (1, sides)))
    .preceded_by(tag("{{"))
    .terminated(tag("}}"))
    .context("dice roll literal")
    .map(|(count, sides)| RuleInst::DiceRoll(count, sides))
    .parse(input)
}

fn rule_literal(input: Span) -> IResult<Span, RuleInst, ErrorTree<Span>> {
    // can't just do `take_until("{{").or(not_line_ending)` or else we'll
    // successfully parse "" which causes many1 to fail
    map_parser(take_until("{{").or(not_line_ending), literal)
        .context("rule literal")
        .map(|x| RuleInst::Literal((*x).to_string()))
        .parse(input)
}

fn rule_interpolation(input: Span) -> IResult<Span, RuleInst, ErrorTree<Span>> {
    pipeline
        .preceded_by(tag("{{"))
        .terminated(tag("}}"))
        .context("rule interpolation")
        .map(|(s, filters)| RuleInst::Interpolation((*s).to_string(), filters))
        .parse(input)
}

fn pipeline(input: Span) -> IResult<Span, (Span, Vec<FilterOp>), ErrorTree<Span>> {
    pair(ident.cut(), filters)
        .context("interpolation pipeline")
        .parse(input)
}

fn filters(input: Span) -> IResult<Span, Vec<FilterOp>, ErrorTree<Span>> {
    many0(ident.preceded_by(tag("|")))
        .map(|filters| {
            filters
                .iter()
                .map(|&filter| match *filter {
                    "definite" => FilterOp::DefiniteArticle,
                    "indefinite" => FilterOp::IndefiniteArticle,
                    "capitalize" => FilterOp::Capitalize,
                    // better way to return error from `map` parser?
                    _ => panic!("unknown filter: {}", filter),
                })
                .collect()
        })
        .parse(input)
}

fn literal(input: Span) -> IResult<Span, Span, ErrorTree<Span>> {
    take_while1(|c: char| {
        c.is_alphanumeric() || c == '_' || c == '-' || c.is_whitespace() || c.is_ascii_punctuation()
    })
    .context("literal")
    .parse(input)
}

fn ident(input: Span) -> IResult<Span, Span, ErrorTree<Span>> {
    take_while1(|c: char| c.is_alphanumeric() || c == '_' || c == '-')
        .context("Invalid identifier, only alphanumeric characters and `_` are allowed")
        .parse(input)
}
