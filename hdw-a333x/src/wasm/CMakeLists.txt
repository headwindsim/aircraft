# folder structure
set(OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../../../build-a333x/out/headwindsim-aircraft-a330-300/SimObjects/Airplanes/Headwind_A330_300/panel)

# add compiler definitions
add_definitions(-DA32NX)

add_subdirectory(extra-backend-a333x)
add_subdirectory(fadec_a333x)

# these are only here to allow CMake compatible IDEs (JetBrains' Clion for example) to show systax
# highlighting and allow code navigation
if (WIN32)
    add_subdirectory(fbw_a330)
endif ()