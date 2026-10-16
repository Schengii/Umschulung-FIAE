# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

C++20 / OpenGL 4.5 Core voxel engine modeled after Minecraft (GLFW 3.4, GLM 1.0.1, EnTT 3.13.2, all fetched by CMake `FetchContent`; glad, stb_image and FastNoiseLite are vendored in `src/vendor/`). All code lives in the `Minecraft` namespace. `README.md` is a feature list and `docs/ARCHITECTURE.md` (German) is a subsystem overview; both are marketing-heavy, so trust the code over them.

## Build, run, test

```powershell
cmake -B build -DCMAKE_BUILD_TYPE=Release          # or: cd build; cmake .. -G "NMake Makefiles" ...
cmake --build build --config Release --target Minecraft
cmake --build build --config Release --target TestEngine
.\build\Minecraft.exe
.\build\TestEngine.exe       # run from the directory the build output is in
```

- Code formatting is defined in `.clang-format` (LLVM base, 4 spaces indent, C++20). CI (`.github/workflows/build.yml`) builds and runs `TestEngine` on Windows and Ubuntu.
- Claude Code slash commands are provided in `.claude/commands/`: `/build`, `/test`, `/add-block`, `/check-secrets`.
- **Pre-Commit Security Hook**: `.githooks/pre-commit` is activated via `git config core.hooksPath .githooks`. It automatically rejects any commits containing `.env` files (except `.env.example`) or hardcoded API keys/credentials (Anthropic `sk-ant-*`, OpenAI `sk-*`, GitHub tokens, AWS keys, private keys). Never bypass or disable this hook.
- **Tests are one hand-rolled executable**: `tests/test_engine.cpp` (plus `tests/test_core_systems.inl`, which it includes) defines free functions (`testRedstone()`, `testFluids()`, ...) that use `assert` and print `[TEST] N. ...`. The file redefines `assert` so a failure *throws* (aborting only that test) and `NDEBUG` is undefined first, so the checks also run in Release builds. `main()` collects failures, prints a summary and returns non-zero.
- Run a subset with a name filter: `TestEngine.exe Network` runs every test whose function name contains `Network`. `main()` also does `remove_all("world_saves")` and mutes audio, so run it where that is safe. `ctest` runs the same executable (`add_test(EngineTests ...)`).
- New tests: add the function (use a `ScratchDir` for any file I/O) and register it with `RUN_TEST(...)` in `main()`.
- Optional sanitizer builds: `-DMC_SANITIZE=ON` (MSVC AddressSanitizer / GCC+Clang ASan+UBSan) or `-DMC_TSAN=ON` (GCC/Clang). Debug builds catch uninitialised-memory bugs that Release hides.
- The game takes smoke-test options: `Minecraft.exe --autostart --frames 300 --seed demo --render-distance 6` (starts a world immediately, exits after N frames and fails on OpenGL errors). `MC_DEBUG_SPAWN=1` additionally spawns test mobs and a portal frame.
- The `Minecraft` POST_BUILD step copies `assets/` next to the executable and writes `compile_commands.json` into the source root (it is tracked in git). Shaders in `assets/shaders/` are loaded at runtime from `assets/`, so run the exe from its build directory.

## CMake layout

All engine sources are listed once in the static library `MinecraftCore`; `Minecraft` (`src/main.cpp`) and `TestEngine` (`tests/test_engine.cpp`) only link it. There is no glob: **add every new `.cpp` to the `MinecraftCore` list**.

## Architecture

`main.cpp` just constructs `core/Application` and calls `run()`. `Application` is the hub: it owns the game loop and wires together the window, input, camera, world, renderers, GUIs, physics, mobs, audio and networking. Most cross-cutting behavior (console commands via `core/CommandParser.hpp`, continuous mining, interaction dispatch to chests, furnaces and redstone) is orchestrated there, so changes to gameplay often touch `Application.cpp`.

Source layout under `src/`: `core` (window, input, app loop, `ThreadPool`, `ModdingEngine`), `world` (voxel data and all block-simulation engines), `renderer`, `gui`, `ecs` (mobs, item entities), `physics`, `inventory`, `crafting`, `audio`, `net`.

Key design points that span several files:

- **World data model**: `World` → `Chunk` (16 `ChunkSection`s for bookkeeping; the chunk holds block state plus sky/block light in `SectionedBytes`: uniform sections cost one byte, dense ones 4096). Block types are the `BlockType` enum in `world/Block.hpp`. `World` takes a seed, a save directory and an optional shared `ThreadPool`; `World` is main-thread only (it caches the last looked-up chunk). Chunk terrain is a pure function of `(seed, x, z)` and trees/cacti are generated with a 2-block margin so features cross chunk borders.
- **Async chunk pipeline**: worker threads (`ThreadPool`) generate terrain and build a first `MeshData` through `ChunkMesh::buildMeshData`, which has no OpenGL dependency. The main thread uploads in bounded batches (only it owns the GL context; keep GL calls out of pool tasks). Because workers do not see neighbours, an arriving chunk and its 4 neighbours are flagged dirty and `World::remeshDirtyChunks` (time-budgeted, nearest first, also used for block edits) rebuilds them from a `MeshInput` snapshot that includes a 1-block border of the neighbouring chunks. Block edits mark only the touched sections dirty and re-mesh just those slabs (`buildMeshData(input, firstSection, endSection)`); the "greedy" pass still emits one quad per block face. An edit that changes opacity or light emission flags the chunk (`needsRelight`); `remeshDirtyChunks` relights it once per frame via `LightEngine` and re-meshes the whole column (spilled light in neighbours is only ever added, never removed). `World::updateVisibility` does cave-style occlusion culling over `SectionVisibility` face-connectivity masks.
- **Dimensions and saves**: `DimensionManager(seed, baseDir, renderDistance)` owns Overworld/Nether/End, each with its own region folder (`<baseDir>/overworld|nether|end`) and one shared worker pool. The hand-built Nether/End spawn layouts are generated once per save (marker file `.terrain_generated`).
- **Simulation engines are separate classes in `world/`** that operate on `World`: `LightEngine` (BFS sun/block light across chunks), `FluidEngine`, `RedstoneEngine` (also pistons, hoppers, comparators), `CropsEngine`, `ExplosionEngine`, `ToolSystem`, `BrewingEngine`, `EnchantingEngine`, `TradingEngine`. Generation is split among `Biome`, `CaveDecorator`, `StructureGenerator`, `VillageGenerator` and `DimensionManager` (Overworld/Nether/End).
- **Persistence**: `SaveSystem` + `RegionFile` (Anvil-style `.mca`, 32×32 chunks per region). `RegionManager` is a process-wide singleton guarded by a mutex (chunk constructors run on worker threads). A chunk is written only if it was modified (`Chunk::needsSave`), by `World::unloadFarChunks` / `World::saveAll` / the world destructor. `GameSave` (`game.dat`, atomic write) stores player, clock, inventory, chests and furnaces; mobs are saved (format v2), item entities are not. `Application` stores everything per seed under `world_saves/seed_<seed>/`.
- **Rendering**: `Shader` loads GLSL from `assets/shaders/` (`block`, `shadow`, `postprocess`, `ui`). The frame goes through `ShadowMap` (cascaded) → block pass → `PostProcessing` (FBO: bloom, SSAO, god rays, ACES). `FrustumCuller` culls chunks. `TextureAtlas` and `FontRenderer` **generate their textures procedurally in code**, so there are no image assets besides shaders.
- **Entities**: mobs and item entities use EnTT, with components in `ecs/Components.hpp` and AI and A* pathfinding in `MobEngine`. `EntityRenderer` draws mobs as hierarchical box models (including remote players).
- **Networking**: `NetworkManager` uses non-blocking UDP (Winsock2 on Windows, linked via `ws2_32`; POSIX otherwise) with a queued incoming-packet flush on the main thread. Every datagram has an envelope (`MC`, version, 64-bit session token from OS entropy, sequence number); the server answers a handshake with the token and drops unknown, forged or replayed packets. The reach check for block edits uses the position the client itself reported, so it limits mistakes but not a malicious client. `handleDatagram` is public so tests can inject packets.
- **Modding**: `ModdingEngine` registers custom blocks and recipes from JSON manifests at runtime.
- `GLM_ENABLE_EXPERIMENTAL` is defined globally, so GLM `gtx` headers are available.

## Repo notes

- `build/`, `build_msvc/` and `*.exe` are gitignored. `world_saves/` is runtime output.
- Commit messages in history are lower-case imperative summaries, for example "implement X, Y, and Z with comprehensive test suite".
