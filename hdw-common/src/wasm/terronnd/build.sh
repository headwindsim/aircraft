#!/bin/bash

# get directory of this script relative to root
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Check for aircraft flag options
case "$1" in
  --a380x)
    AIRCRAFT_FLAG="A380X"
    ;;
  --a32nx)
    AIRCRAFT_FLAG="A32NX"
    ;;
  --a339x)
    AIRCRAFT_FLAG="A339X"
    ;;
  --a333x)
    AIRCRAFT_FLAG="A333X"
    ;;
  --su95x)
    AIRCRAFT_FLAG="SU95X"
    ;;
  *)
    echo "Usage: $0 [--a380x | --a32nx | --a333x | --a339x | --su95x]"
    exit 1
    ;;
esac

OUTPUT="${DIR}/out/terronnd_${AIRCRAFT_FLAG}.wasm"

if [ "$2" == "--debug" ]; then
  CLANG_ARGS="-g"
else
  WASMLD_ARGS="--strip-debug"
fi

set -e

# create temporary folder for o files
mkdir -p "${DIR}/obj/${AIRCRAFT_FLAG}"
pushd "${DIR}/obj/${AIRCRAFT_FLAG}"

# compile c++ code
clang++ \
  -c \
  ${CLANG_ARGS} \
  -std=c++20 \
  -W \
  -Wall \
  -Wextra \
  -Wc++20-compat \
  -Wno-unused-command-line-argument \
  -Wno-ignored-attributes \
  -Wno-macro-redefined \
  -Wshadow \
  -Wdouble-promotion \
  -Wundef \
  -Wconversion \
  --sysroot "${MSFS_SDK}/WASM/wasi-sysroot" \
  -target wasm32-unknown-wasi \
  -D_MSFS_WASM=1 \
  -D__wasi__ \
  -D_LIBCC_NO_EXCEPTIONS \
  -D_LIBCPP_HAS_NO_THREADS \
  -D_WINDLL \
  -D_MBCS \
  -D${AIRCRAFT_FLAG} \
  -mthread-model single \
  -fno-exceptions \
  -fms-extensions \
  -fvisibility=hidden \
  -fno-common \
  -fstack-usage \
  -fdata-sections \
  -fno-stack-protector \
  -fstack-size-section \
  -mbulk-memory \
  -Werror=return-type \
  -O2 \
  -I "${MSFS_SDK}/WASM/include" \
  -I "${MSFS_SDK}/SimConnect SDK/include" \
  -I "${DIR}/../cpp-msfs-framework/lib/" \
  "${DIR}/src/main.cpp" \
  "${DIR}/src/nanovg/nanovg.cpp" \
  "${DIR}/src/navigationdisplay/collection.cpp" \
  "${DIR}/src/navigationdisplay/displaybase.cpp" \
  "${DIR}/src/simconnect/connection.cpp" \

# restore directory
popd

# create the output folder
mkdir -p "${DIR}/out"

# link modules
wasm-ld \
  --no-entry \
  --allow-undefined \
  -L "${MSFS_SDK}/WASM/wasi-sysroot/lib/wasm32-wasi" \
  -lc "${MSFS_SDK}/WASM/wasi-sysroot/lib/wasm32-wasi/libclang_rt.builtins-wasm32.a" \
  --export __wasm_call_ctors \
  --export-dynamic \
  --export malloc \
  --export free \
  --export __wasm_call_ctors \
  --export mallinfo \
  --export mchunkit_begin \
  --export mchunkit_next \
  --export get_pages_state \
  --export mark_decommit_pages \
  --export-table \
  --gc-sections \
  ${WASMLD_ARGS} \
  -O2 \
  -lc++ -lc++abi \
  ${DIR}/obj/${AIRCRAFT_FLAG}/*.o \
  -o $OUTPUT
