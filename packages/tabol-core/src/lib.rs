use js_sys::JsString;
use wasm_bindgen::prelude::*;

mod nom_parser;
mod tabol;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn parse(raw_table: JsString) -> Result<(), JsValue> {
    let input: String = JsString::dyn_ref::<JsString>(&raw_table)
        .ok_or("Invalid input")?
        .into();

    match tabol::Tabol::new(input.trim()) {
        Ok(tabol) => {
            log(format!("Table IDs: {:?}", tabol.table_ids()).as_str());

            // @TODO: pass gen closure(s) back to JS
            match tabol.gen_many("color", 5) {
                Ok(results) => {
                    for result in results {
                        log(format!("{result}\n").as_ref());
                    }
                    Ok(())
                }
                Err(e) => Err(JsValue::from("Gen failed")),
            }
        }
        Err(_e) => Err(JsValue::from("Parse failed")),
    }
}
