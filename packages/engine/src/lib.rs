#![warn(unused_extern_crates)]
use sha2::{Digest, Sha256};
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;
use web_sys::js_sys::JsString;

mod nom_parser;
pub mod table_collection;
mod utils;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn table_hash(raw: JsString) -> JsString {
    set_panic_hook();

    let raw: String = raw.into();
    let hash = Sha256::digest(raw.as_bytes()).to_vec();

    JsString::from(hex::encode(hash))
}
