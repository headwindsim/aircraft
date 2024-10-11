# folder structure
set(OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../../../build-su95x/out/headwindsim-aircraft-su100-95/SimObjects/Airplanes/Headwind_SU95/panel)

# add compiler definitions
add_definitions(-DA32NX)

add_subdirectory(extra-backend-a32nx)
add_subdirectory(fadec_su95x)

# these are only here to allow CMake compatible IDEs (JetBrains' Clion for example) to show systax
# highlighting and allow code navigation
if (WIN32)
    add_subdirectory(fbw_a320)
endif ()