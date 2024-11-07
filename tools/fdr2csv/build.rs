use std::env;
use std::path::PathBuf;

use bindgen::callbacks::ParseCallbacks;

#[derive(Debug)]
struct CustomDeriveCallback {}
impl CustomDeriveCallback {
    fn new() -> CustomDeriveCallback {
        CustomDeriveCallback {}
    }
}
impl ParseCallbacks for CustomDeriveCallback {
    fn add_derives(&self, _info: &bindgen::callbacks::DeriveInfo<'_>) -> Vec<String> {
        vec!["Serialize".into(), "AnyBitPattern".into(), "Default".into()]
    }
}

fn main() {
    // Tell cargo to look for shared libraries in the specified directory
    println!("cargo:rustc-link-search=../../hdw-a339x/src/wasm/fbw_a330/src/model");

    // The bindgen::Builder is the main entry point
    // to bindgen, and lets you build up options for
    // the resulting bindings.
    let bindings_a339x = bindgen::Builder::default()
        // The input header we would like to generate
        // bindings for.
        .header("a339x_wrapper.hpp")
        .clang_arg("-std=c++20")
        // Tell cargo to invalidate the built crate whenever any of the
        // included header files changed.
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .parse_callbacks(Box::new(CustomDeriveCallback::new()))
        // Finish the builder and generate the bindings.
        .generate()
        // Unwrap the Result and panic on failure.
        .expect("Unable to generate bindings");

    let bindings_a333x = bindgen::Builder::default()
        // The input header we would like to generate
        // bindings for.
        .header("a333x_wrapper.hpp")
        .clang_arg("-std=c++20")
        // Tell cargo to invalidate the built crate whenever any of the
        // included header files changed.
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .parse_callbacks(Box::new(CustomDeriveCallback::new()))
        // Finish the builder and generate the bindings.
        .generate()
        // Unwrap the Result and panic on failure.
        .expect("Unable to generate bindings");

    let bindings_su95x = bindgen::Builder::default()
        // The input header we would like to generate
        // bindings for.
        .header("su95x_wrapper.hpp")
        .clang_arg("-std=c++20")
        // Tell cargo to invalidate the built crate whenever any of the
        // included header files changed.
        .parse_callbacks(Box::new(bindgen::CargoCallbacks::new()))
        .parse_callbacks(Box::new(CustomDeriveCallback::new()))
        // Finish the builder and generate the bindings.
        .generate()
        // Unwrap the Result and panic on failure.
        .expect("Unable to generate bindings");

    // Write the bindings to the $OUT_DIR/bindings.rs file.
    let out_path = PathBuf::from(env::var("OUT_DIR").unwrap());
    bindings_a339x
        .write_to_file(out_path.join("bindings_a339x.rs"))
        .expect("Couldn't write bindings!");

    bindings_a333x
        .write_to_file(out_path.join("bindings_a333x.rs"))
        .expect("Couldn't write bindings!");

    bindings_su95x
        .write_to_file(out_path.join("bindings_su95x.rs"))
        .expect("Couldn't write bindings!");
}
