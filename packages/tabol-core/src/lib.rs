use wasm_bindgen::prelude::*;
use web_sys::console;
use web_sys::js_sys::JsString;

mod nom_parser;
mod tabol;

#[wasm_bindgen]
pub fn parse(raw_table: JsString) -> Result<(), JsValue> {
    let input: String = JsString::dyn_ref::<JsString>(&raw_table)
        .ok_or("Invalid input")?
        .into();

    match tabol::Tabol::new(input.trim()) {
        Ok(tabol) => {
            console::log_1(&JsValue::from(format!(
                "Table IDs: {:?}",
                tabol.table_ids()
            )));

            // @TODO: pass gen closure(s) back to JS
            match tabol.gen_many("color", 5) {
                Ok(results) => {
                    for result in results {
                        console::log_1(&JsValue::from(format!("{result}\n")));
                    }
                    Ok(())
                }
                Err(e) => Err(JsValue::from("Gen failed")),
            }
        }
        Err(_e) => Err(JsValue::from("Parse failed")),
    }
}
