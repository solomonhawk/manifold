# Tabol

This is a place to explore building for the web with a local Rust WASM package
dependency.

I [previously wrote](https://github.com/solomonhawk/tabol-rust) a simple parser
for random tables using Rust. This repo expands on that, building the library
using `wasm-pack` and consuming it from a simple `vite`-based JS app.

This project is structured as a monorepo, using `turbo` for task orchestration.

## Setup

Install system dependencies:

    $ asdf install
    $ rustup update
    $ cargo install wasm-pack
    $ cargo install -f wasm-bindgen-cli

## Get to work

This command will run several tasks, including starting the vite dev server and
a watch/build task for the Rust WASM package.

    $ npm run work