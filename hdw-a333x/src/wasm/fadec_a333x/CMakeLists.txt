# flybywire-a333x-fadec-v2 CMakeLists.txt

# add additional compiler definitions for the a333x fadec-v2 build
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
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/Fadec_A333X.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/EngineControlA333X.cpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/FuelConfiguration_A333X.cpp
)

set(INCLUDE_FILES
    ${FBW_COMMON}/fadec_common/src/Fadec.h
    ${FBW_COMMON}/fadec_common/src/EngineRatios.hpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/Fadec_A333X.h
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/FadecSimData_A333X.hpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/EngineControlA333X.h
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/FuelConfiguration_A333X.h
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/ThrustLimits_A333X.hpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/Polynomials_A333X.hpp
    ${CMAKE_CURRENT_SOURCE_DIR}/src/Fadec/Tables1502_A333X.hpp
)

# create the targets
add_library(fadec-a333x OBJECT ${SOURCE_FILES} ${INCLUDE_FILES})
add_wasm_library(
    NAME fadec-a333x
    DEPENDENCIES fadec-a333x cpp-msfs-framework-a32nx
)

