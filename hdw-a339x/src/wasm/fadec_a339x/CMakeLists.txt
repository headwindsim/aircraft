# flybywire-a339x-fadec-v2 CMakeLists.txt

# add additional compiler definitions for the a339x fadec-v2 build
add_definitions()

# add the local include directories
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec
    ${FBW_COMMON}/cpp-msfs-framework/
    ${FBW_COMMON}/fadec_common/src/
)

# define the source files
set(SOURCE_FILES
    ${FBW_COMMON}/fadec_common/src/Fadec.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Gauge_Fadec_v2.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/Fadec_A339X.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/EngineControlA339X.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/FuelConfiguration_A339X.cpp
)

set(INCLUDE_FILES
    ${FBW_COMMON}/fadec_common/src/Fadec.h
    ${FBW_COMMON}/fadec_common/src/EngineRatios.hpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/Fadec_A339X.h
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/FadecSimData_A339X.hpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/EngineControlA339X.h
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/FuelConfiguration_A339X.h
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/ThrustLimits_A339X.hpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/Polynomials_A339X.hpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/Tables1502_A339X.hpp
)

# create the targets
add_library(fadec-a339x OBJECT ${SOURCE_FILES} ${INCLUDE_FILES})
add_wasm_library(
    NAME fadec-a339x
    DEPENDENCIES fadec-a339x cpp-msfs-framework-a32nx
)

