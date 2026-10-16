# GEMINI.md - Google Gemini & Antigravity Developer Guide

This document defines core instructions, architectural standards, and workflow practices for Google Gemini and Antigravity agents when working with the **Minecraft C++ Voxel Engine** codebase.

---

## 1. Project Overview

- **Language & Standard**: C++20 (`/std:c++20` on MSVC, `-std=c++20` on GCC/Clang)
- **Graphics API**: OpenGL 4.5 Core Profile
- **Primary Dependencies**:
  - `GLFW 3.4` (Windowing and Input, fetched via CMake `FetchContent`)
  - `GLM 1.0.1` (Mathematics and Vector/Matrix computations, fetched via `FetchContent`)
  - `EnTT 3.13.2` (Entity Component System for mobs/entities, fetched via `FetchContent`)
  - `glad`, `stb_image`, `FastNoiseLite` (Vendored in [src/vendor/](file:///src/vendor/))
- **Namespace**: All engine code strictly resides in the `Minecraft` namespace.
- **Build System**: CMake (minimum version 3.20) with static engine library `MinecraftCore`.

---

## 2. Build, Run, and Testing Workflows

### Configure & Build with CMake (Powershell)

```powershell
# 1. Configure the project
cmake -B build -DCMAKE_BUILD_TYPE=Release

# 2. Build the main game executable
cmake --build build --config Release --target Minecraft

# 3. Build the engine unit test suite
cmake --build build --config Release --target TestEngine
```

### Running the Game

```powershell
# Normal launch (displays main menu and seed selector)
.\build\Minecraft.exe

# Skip menu, autostart specific seed with custom render distance
.\build\Minecraft.exe --autostart --seed myworld --render-distance 8

# Headless / Smoke test (runs 300 frames, validates OpenGL state, and exits 0 on success)
.\build\Minecraft.exe --autostart --frames 300
```

> **Note**: Assets in `assets/shaders/` are copied to the build folder during the post-build step. Always execute `Minecraft.exe` from its build output directory so shaders are located properly.

### Running Engine Tests

```powershell
# Run all tests directly (returns non-zero on failure)
.\build\TestEngine.exe

# Run filtered tests (e.g., only network tests)
.\build\TestEngine.exe Network

# Run via CTest
ctest --test-dir build --output-on-failure -C Release
```

- Tests are implemented in [tests/test_engine.cpp](file:///tests/test_engine.cpp) and [tests/test_core_systems.inl](file:///tests/test_core_systems.inl).
- Failures throw custom assertions caught in `main()`, which reports exact failures and returns a non-zero exit code.
- Whenever you add file operations to tests, always wrap them in a `ScratchDir` or clean up temporary files.

---

## 3. Architecture & Subsystem Layout

```
src/
├── core/         # Application main loop, Window, Input, ThreadPool, ModdingEngine, CommandParser
├── world/        # World, Chunk, ChunkSection, Block definitions, Biome generation, Simulation Engines
├── renderer/     # Shader, ChunkMesh, TextureAtlas, FontRenderer, ShadowMap, PostProcessing
├── gui/          # HUD, InventoryGUI, ContainerGUI, InGameMenu, ChatGUI, DebugOverlay
├── ecs/          # EnTT components, EntityRenderer, MobEngine (AI & A* 3D pathfinding)
├── physics/      # AABB collision detection, Raycast (Amanatides & Woo DDA), Fluid physics
├── inventory/    # ItemStack, Inventory, Chest, Smelting Furnace data structures
├── crafting/     # CraftingManager, Recipe registry (2x2 and 3x3 grids), Smithing Table
├── audio/        # Spatial AudioEngine, Sound buffers, Material sound triggers
├── net/          # NetworkManager, UDP Winsock/POSIX sockets, Packet serialization
└── vendor/       # glad (OpenGL loader), stb_image, FastNoiseLite
```

### Critical Architectural Rules

1. **Static Engine Library (`CMakeLists.txt`)**:
   - `CMakeLists.txt` does **NOT** glob source files.
   - Whenever you create a new `.cpp` file, you **MUST** register it in the `MinecraftCore` sources list in [CMakeLists.txt](file:///CMakeLists.txt).
2. **OpenGL Context Isolation**:
   - **Only the main thread owns the OpenGL context.**
   - Worker threads in `ThreadPool` generate raw vertex/index data (`MeshData`) through `ChunkMesh::buildMeshData`.
   - Never call `glGen*`, `glBind*`, `glBuffer*`, or any OpenGL function inside worker threads.
   - Buffer uploads and shader draws must happen strictly on the main thread during `World::remeshDirtyChunks` and render passes.
3. **Chunk Mesh & Light Relighting**:
   - A chunk is partitioned vertically into 16 `ChunkSection`s ($16 \times 16 \times 16$ blocks).
   - When a block is edited, flag the section dirty along with affected neighboring chunks.
   - If a block edit alters opacity or illumination, set `needsRelight = true`.
   - `World::remeshDirtyChunks` relights the column via `LightEngine` and meshes the geometry within a frame budget.
4. **Anvil Region Persistence**:
   - World data is persisted in `world_saves/seed_<seed>/` using Anvil `.mca` files via `RegionManager` and `RegionFile`.
   - Only modified chunks (`Chunk::needsSave`) are written out during chunk unload or world save.
5. **Multiplayer Networking (`NetworkManager`)**:
   - Built on non-blocking UDP sockets (`ws2_32` on Windows, POSIX on Unix).
   - Handshakes establish a 64-bit session token generated from OS entropy.
   - Incoming datagrams are queued and processed synchronously on the main thread.

---

## 4. Coding Conventions & Best Practices

- **Code Style**: Conforms to [.clang-format](file:///.clang-format) (LLVM style, 4 spaces indent, 120 column limit).
- **Modern C++**: Prefer `std::span`, `std::string_view`, structured bindings, `constexpr`, and standard concepts where appropriate.
- **Header Guards**: Use `#pragma once` at the top of all headers.
- **Error Handling**: Use explicit error logging or exceptions for unrecoverable errors; do not silently fail or swallow errors.
- **Resource Management**: Strictly adhere to RAII. Wrap OpenGL handles (VAO, VBO, EBO, FBO) in RAII wrappers or class destructors.

---

## 5. Collaboration Guidelines (Claude, Gemini, GitHub & Vercel)

- **Claude & Gemini Harmony**:
  - Claude uses [CLAUDE.md](file:///CLAUDE.md) and [.claude/](file:///.claude/).
  - Gemini uses [GEMINI.md](file:///GEMINI.md) and Antigravity guidelines.
  - Universal rules and project invariants are mirrored in [AGENTS.md](file:///AGENTS.md).
  - Both agents share the same build commands, ignore lists ([.claudeignore](file:///.claudeignore), [.geminiignore](file:///.geminiignore)), and Git conventions.
- **Git Commit Messages**: Use concise, imperative messages: `feat: add ...`, `fix: resolve ...`, `docs: update ...`.
- **Pre-Commit Verification**: Always run `cmake --build build --config Release --target TestEngine` and execute `TestEngine.exe` before finalizing any code modifications.
- **Pre-Commit Security Hook**: The repository enforces `.githooks/pre-commit` (configured via `git config core.hooksPath .githooks`). It prevents accidental commits of `.env` files and API keys/secrets (Anthropic, OpenAI, GitHub PAT, AWS, private keys). Never bypass or disable this hook.
