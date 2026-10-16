cmake_minimum_required(VERSION 3.20)
project(Minecraft CXX C)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
add_compile_definitions(GLM_ENABLE_EXPERIMENTAL)

include(FetchContent)

# 1. GLFW FetchContent
message(STATUS "[Minecraft CMake] Fetching GLFW 3.4...")
set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
FetchContent_Declare(
    glfw
    GIT_REPOSITORY https://github.com/glfw/glfw.git
    GIT_TAG 3.4
)
FetchContent_MakeAvailable(glfw)

# 2. GLM FetchContent
message(STATUS "[Minecraft CMake] Fetching GLM...")
FetchContent_Declare(
    glm
    GIT_REPOSITORY https://github.com/g-truc/glm.git
    GIT_TAG 1.0.1
)
FetchContent_MakeAvailable(glm)

# 3. EnTT FetchContent
message(STATUS "[Minecraft CMake] Fetching EnTT...")
FetchContent_Declare(
    entt
    GIT_REPOSITORY https://github.com/skypjack/entt.git
    GIT_TAG v3.13.2
)
FetchContent_MakeAvailable(entt)

# 5. miniaudio (single-header audio output; the sounds themselves are synthesized in code)
message(STATUS "[Minecraft CMake] Fetching miniaudio...")
set(MINIAUDIO_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(MINIAUDIO_BUILD_TESTS OFF CACHE BOOL "" FORCE)
FetchContent_Declare(
    miniaudio
    GIT_REPOSITORY https://github.com/mackron/miniaudio.git
    GIT_TAG 0.11.22
)
FetchContent_MakeAvailable(miniaudio)

find_package(OpenGL REQUIRED)
find_package(Threads REQUIRED)
option(MC_NO_AUDIO_DEVICE "Do not open an audio output device (sounds are still synthesized and mixed)" OFF)

option(MC_SANITIZE "Build with sanitizers (MSVC: AddressSanitizer, GCC/Clang: Address+UB)" OFF)
option(MC_TSAN "Build with ThreadSanitizer (GCC/Clang only, exclusive with MC_SANITIZE)" OFF)

# All engine code lives in one static library that both the game and the test
# executable link against, so a new source file only has to be listed once.
add_library(MinecraftCore STATIC
    src/vendor/glad/glad.c
    src/core/Window.cpp
    src/core/Input.cpp
    src/core/Application.cpp
    src/core/ThreadPool.cpp
    src/core/ModdingEngine.cpp
    src/renderer/Shader.cpp
    src/renderer/Camera.cpp
    src/renderer/TextureAtlas.cpp
    src/renderer/ParticleEngine.cpp
    src/renderer/EntityRenderer.cpp
    src/renderer/FrustumCuller.cpp
    src/renderer/ShadowMap.cpp
    src/renderer/PostProcessing.cpp
    src/renderer/Skybox.cpp
    src/world/Chunk.cpp
    src/world/ChunkSection.cpp
    src/world/ChunkMesh.cpp
    src/world/World.cpp
    src/world/Raycast.cpp
    src/world/SaveSystem.cpp
    src/world/GameSave.cpp
    src/world/RegionFile.cpp
    src/world/LightEngine.cpp
    src/world/TimeManager.cpp
    src/world/WeatherManager.cpp
    src/world/CaveDecorator.cpp
    src/world/FluidEngine.cpp
    src/world/Biome.cpp
    src/world/RedstoneEngine.cpp
    src/world/ToolSystem.cpp
    src/world/ExplosionEngine.cpp
    src/world/ChestBlock.cpp
    src/world/FurnaceBlock.cpp
    src/world/StructureGenerator.cpp
    src/world/DimensionManager.cpp
    src/world/CropsEngine.cpp
    src/world/VillageGenerator.cpp
    src/world/TradingEngine.cpp
    src/world/EnchantingEngine.cpp
    src/world/BrewingEngine.cpp
    src/physics/PhysicsEngine.cpp
    src/gui/FontRenderer.cpp
    src/gui/HUD.cpp
    src/gui/InventoryGUI.cpp
    src/gui/ContainerGUI.cpp
    src/gui/DebugGUI.cpp
    src/gui/MenuGUI.cpp
    src/inventory/Inventory.cpp
    src/inventory/PlayerStats.cpp
    src/inventory/FoodSystem.cpp
    src/crafting/CraftingManager.cpp
    src/ecs/MobEngine.cpp
    src/ecs/ItemEntity.cpp
    src/audio/AudioManager.cpp
    src/audio/AudioDevice.cpp
    src/audio/SoundSynth.cpp
    src/net/NetworkManager.cpp
)

target_include_directories(MinecraftCore PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/src/vendor
    ${glm_SOURCE_DIR}
    ${entt_SOURCE_DIR}/single_include
    ${miniaudio_SOURCE_DIR}
)

target_link_libraries(MinecraftCore PUBLIC
    glfw
    glm::glm
    OpenGL::GL
    Threads::Threads
    ${CMAKE_DL_LIBS}
)
if (MC_NO_AUDIO_DEVICE)
    target_compile_definitions(MinecraftCore PUBLIC MC_NO_AUDIO_DEVICE)
endif()
# miniaudio is third-party code: keep its warnings out of our build log
if (MSVC)
    set_source_files_properties(src/audio/AudioDevice.cpp PROPERTIES COMPILE_OPTIONS "/W0")
else()
    set_source_files_properties(src/audio/AudioDevice.cpp PROPERTIES COMPILE_OPTIONS "-w")
endif()
if (WIN32)
    target_link_libraries(MinecraftCore PUBLIC ws2_32)
endif()

if (MSVC)
    target_compile_definitions(MinecraftCore PRIVATE _CRT_SECURE_NO_WARNINGS)
    target_compile_options(MinecraftCore PRIVATE /W3 /permissive- /utf-8)
    if (MC_SANITIZE)
        target_compile_options(MinecraftCore PUBLIC /fsanitize=address)
    endif()
else()
    target_compile_options(MinecraftCore PRIVATE -Wall -Wextra -Wno-unused-parameter)
    if (MC_SANITIZE)
        target_compile_options(MinecraftCore PUBLIC -fsanitize=address,undefined -fno-omit-frame-pointer)
        target_link_options(MinecraftCore PUBLIC -fsanitize=address,undefined)
    elseif (MC_TSAN)
        target_compile_options(MinecraftCore PUBLIC -fsanitize=thread -fno-omit-frame-pointer)
        target_link_options(MinecraftCore PUBLIC -fsanitize=thread)
    endif()
endif()

# Game executable
add_executable(Minecraft src/main.cpp)
target_link_libraries(Minecraft PRIVATE MinecraftCore)

# Test engine executable (assert() is always enabled inside the test file itself)
add_executable(TestEngine tests/test_engine.cpp)
target_link_libraries(TestEngine PRIVATE MinecraftCore)

enable_testing()
add_test(NAME EngineTests COMMAND TestEngine)
set_tests_properties(EngineTests PROPERTIES TIMEOUT 600)

# Copy assets folder to output executable directory
add_custom_command(TARGET Minecraft POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_CURRENT_SOURCE_DIR}/assets
    $<TARGET_FILE_DIR:Minecraft>/assets
    COMMENT "[Minecraft Build] Copying assets to output directory..."
)

# compile_commands.json is only generated by the Makefile and Ninja generators. Visual Studio
# generators do not produce it, which made the post-build copy fail on Windows (MSB3073).
if(CMAKE_GENERATOR MATCHES "Makefiles|Ninja")
    add_custom_command(TARGET Minecraft POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
        ${CMAKE_CURRENT_BINARY_DIR}/compile_commands.json
        ${CMAKE_CURRENT_SOURCE_DIR}/compile_commands.json
        COMMENT "[Minecraft Build] Copying compile_commands.json to project directory..."
    )
endif()
