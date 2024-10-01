use tabol::Tabol;
use utils::set_panic_hook;
// use serde::{Deserialize, Serialize};
// use tabol::Tabol;
// use tsify::Tsify;
use wasm_bindgen::prelude::*;
// use serde::Serialize;
use hex;
use sha2::{Digest, Sha256};
use web_sys::console;
use web_sys::js_sys::JsString;

mod nom_parser;
mod tabol;
mod utils;

extern crate wee_alloc;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// // #[derive(Tsify, Serialize, Deserialize)]
// // #[tsify(into_wasm_abi, from_wasm_abi)]
// #[wasm_bindgen]
// pub struct SerializedTable {
//     table: Tabol<'static>, // table_ids: Vec<String>,
//                            // generate: JsValue,
//                            // generate: Closure<dyn Fn(String, usize) -> Vec<String>>,
// }

// impl SerializedTable {
//     pub fn table_ids(&self) -> Vec<String> {
//         self.table.table_ids()
//     }

//     pub fn generate(&self, id: &str, count: usize) -> Vec<String> {
//         self.table.gen_many(id, count).unwrap()
//     }
// }

#[wasm_bindgen]
pub fn table_hash(raw: JsString) -> JsString {
    set_panic_hook();

    let raw: String = raw.into();
    let hash = Sha256::digest(raw.as_bytes()).to_vec();

    JsString::from(hex::encode(hash))
}
// #[wasm_bindgen]
// pub fn parse(raw_table: JsString) -> Result<(), JsValue> {
//     let input: String = raw_table
//         .dyn_ref::<JsString>()
//         .ok_or("Invalid input")?
//         .into();

//     match tabol::Tabol::new(input.trim()) {
//         Ok(tabol) => {
//             // let a = Closure::<dyn Fn()>::new(move || {
//             //     console::log_1(&JsValue::from("hi from closure"));
//             // });
//             // let generate = Closure::<dyn Fn(String, usize) -> Vec<String>>::new(
//             //     move |id: String, count: usize| tabol.gen_many(id.as_ref(), count).unwrap(),
//             // );

//             // let t = tabol.clone();

//             // Ok(a.into_js_value())
//             // Ok(SerializedTable {
//             //     table_ids: t.table_ids(),
//             //     generate,
//             // })

//             // Ok(SerializedTable { table: tabol })

//             console::log_1(&JsValue::from(format!(
//                 "Table IDs: {:?}",
//                 tabol.table_ids()
//             )));

//             // @TODO: pass gen closure(s) back to JS
//             match tabol.gen_many("potion", 5) {
//                 Ok(results) => {
//                     for result in results {
//                         console::log_1(&JsValue::from(format!("{result}\n")));
//                     }
//                     Ok(())
//                 }
//                 Err(e) => Err(JsValue::from(e.to_string())),
//             }
//         }
//         Err(e) => Err(JsValue::from(e.to_string())),
//     }
// }

// #[wasm_bindgen]
// pub struct TableParser {
//     raw: Option<String>,
//     table: Option<Tabol>,
// }

// #[wasm_bindgen]
// impl TableParser {
//     #[wasm_bindgen(constructor)]
//     pub fn new() -> Self {
//         Self {
//             raw: None,
//             table: None,
//         }
//     }

//     pub fn parse(mut self, raw: &str) -> Option<String> {
//         self.raw = Some(raw.to_string());
//         self.table = Tabol::new(self.raw);
//     }
// }
