# This CMakeLists.txt file is used only for syntax highlighting and navigating
# through the code in an IDE. It is not used for building the project.

cmake_minimum_required(VERSION 3.19)

project(flybywire-a32nx-fbw)

set(CMAKE_CXX_STANDARD 20)

set(CMAKE_CXX_FLAGS "-c -g -DDEBUG -Wno-unused-command-line-argument -Wno-ignored-attributes -Wno-macro-redefined --sysroot \"${MSFS_SDK}/WASM/wasi-sysroot\" -target wasm32-unknown-wasi -flto -D_MSFS_WASM=1 -D__wasi__ -D_LIBCPP_HAS_NO_THREADS -D_WINDLL -D_MBCS -mthread-model single -fno-exceptions -fms-extensions")

include_directories("${MSFS_SDK}/WASM/include")
include_directories("${MSFS_SDK}/WASM/wasi-sysroot/include")
include_directories("${MSFS_SDK}/SimConnect SDK/include")

include_directories(
    ./src
    ./src/inih
    ./src/busStructures
    ./src/elac
    ./src/fac
    ./src/failures
    ./src/fcdc
    ./src/interface
    ./src/model
    ./src/sec
    ./src/utils
    ${FBW_ROOT}/build-common/src/wasm/fadec_common/src/zlib
    ${FBW_ROOT}/build-common/src/wasm/fbw_common/src/inih
    ${FBW_ROOT}/build-common/src/wasm/fbw-common/src
)

add_executable(flybywire-a32nx-fbw
    ${FBW_ROOT}/build-common/src/wasm/fbw_common/src/zlib/zfstream.cc
    ${FBW_ROOT}/build-common/src/wasm/fbw_common/src/LocalVariable.cpp
    ${FBW_ROOT}/build-common/src/wasm/fbw_common/src/ThrottleAxisMapping.cpp
    ${FBW_ROOT}/build-common/src/wasm/fbw_common/src/InterpolatingLookupTable.cpp
    src/interface/SimConnectInterface.cpp
    src/elac/Elac.cpp
    src/sec/Sec.cpp
    src/fcdc/Fcdc.cpp
    src/fac/Fac.cpp
    src/failures/FailuresConsumer.cpp
    src/utils/ConfirmNode.cpp
    src/utils/SRFlipFLop.cpp
    src/utils/PulseNode.cpp
    src/utils/HysteresisNode.cpp
    src/model/AutopilotLaws_data.cpp
    src/model/AutopilotLaws.cpp
    src/model/AutopilotStateMachine_data.cpp
    src/model/AutopilotStateMachine.cpp
    src/model/Autothrust_data.cpp
    src/model/Autothrust.cpp
    src/model/Double2MultiWord.cpp
    src/model/ElacComputer_data.cpp
    src/model/ElacComputer.cpp
    src/model/SecComputer_data.cpp
    src/model/SecComputer.cpp
    src/model/PitchNormalLaw.cpp
    src/model/PitchAlternateLaw.cpp
    src/model/PitchDirectLaw.cpp
    src/model/LateralNormalLaw.cpp
    src/model/LateralDirectLaw.cpp
    src/model/FacComputer_data.cpp
    src/model/FacComputer.cpp
    src/model/look1_binlxpw.cpp
    src/model/look2_binlcpw.cpp
    src/model/look2_binlxpw.cpp
    src/model/binsearch_u32d.cpp"
    src/model/intrp3d_l_pw.cpp"
    src/model/plook_binx.cpp"
    src/model/mod_2RcCQkwc.cpp
    src/model/MultiWordIor.cpp
    src/model/rt_modd.cpp
    src/model/rt_remd.cpp
    src/model/uMultiWord2Double.cpp
    src/FlyByWireInterface.cpp
    src/FlightDataRecorder.cpp
    src/Arinc429.cpp
    src/Arinc429Utils.cpp
    src/SpoilersHandler.cpp
    src/CalculatedRadioReceiver.cpp
    src/main.cpp
)
