# Minecraft C++ OpenGL Voxel Engine (1:1 Remake & Modern Voxel Engine)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![C++20](https://img.shields.io/badge/C%2B%2B-20-blue.svg)](https://en.cppreference.com/w/cpp/20)
[![OpenGL](https://img.shields.io/badge/OpenGL-4.5-green.svg)](https://www.opengl.org/)
[![CMake](https://img.shields.io/badge/CMake-%3E%3D3.20-orange.svg)](https://cmake.org/)
[![Build & Test](https://github.com/Schengii/Minecraft/actions/workflows/build.yml/badge.svg)](.github/workflows/build.yml)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Ready-blueviolet.svg)](CLAUDE.md)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Supported-4285F4.svg)](GEMINI.md)
[![Vercel](https://img.shields.io/badge/Vercel-Showcase%20Ready-black.svg?logo=vercel)](vercel.json)

A high-performance, modular 3D voxel game engine written in **C++20** and **OpenGL 4.5**, modeled after Minecraft. Features high-throughput multithreaded chunk generation, $16 \times 16 \times 16$ sub-chunk section slicing, asynchronous CPU meshing with exact atlas UV tiling, Amanatides & Woo 3D DDA fast voxel raycasting, real-time cascaded dynamic shadow mapping with 3x3 PCF filtering, volumetric God-Ray solar light shafts, multi-story Woodland Mansion procedural generation, Smithing Table Netherite equipment upgrading, GPU instanced explosion debris emitters, shoreline water foam & crest highlights, multi-threaded asynchronous network packet queuing, procedural pixel-art texture atlas generation, 3D hierarchical mob models, 3-headed Wither boss mechanics, multiplayer remote player models with nametags, client-side prediction with dead-reckoning interpolation, screen-space ambient occlusion (SSAO), procedural skybox clouds at $Y=128$, PBR specular & Fresnel water shaders, environmental player hazards (oxygen/drowning, fire/lava burning, fall damage), animal breeding & feeding mechanics, pig & horse mount saddling and steering, dynamic fluid flow level height calculations, Ocean Monuments, Sunken Shipwrecks, Nether Bastion remnants, Elytra aerodynamic gliding physics, End City towers, atmospheric distance fog with sun in-scattering, mouse scroll hotbar selection, right-click stack splitting, infinite water source generation, console command engine, first-person hand animations, bitmap typography rendering, interactive container GUIs (chests and animated furnaces), continuous mining with tool speed multipliers, non-blocking UDP socket multiplayer networking, vertex ambient occlusion (smooth lighting), ACES filmic tone mapping & bloom post-processing, data-driven modding engine, brewing stand & status effect systems, cellular automaton redstone, hopper item transfer & comparator reading, piston mechanics, 3D A* mob pathfinding, fluid dynamics, Anvil region saving, and material-based spatial audio.

---

## 🌟 Feature Overview & State

### 🏰 Multi-Story Woodland Mansions (`StructureGenerator.cpp`)
- **Grand Dark Oak Mansions**: $15 \times 12 \times 15$ procedural multi-story mansions featuring grand dining rooms, upper libraries, Evoker/Illager spawners, and hidden emerald treasury vaults.

---

### 🔨 Smithing Table & Netherite Upgrades (`CraftingManager.cpp`)
- **Equipment Veredelung**: Upgrade Diamond Swords and Diamond Pickaxes with Netherrack/Obsidian into reinforced Netherite-tier gear preserving enchantments and boosting tool stats.

---

### 💥 GPU Explosion Emitter & Dynamic Debris (`ParticleEngine.cpp`)
- **Explosion & Smoke Debris**: High-throughput GPU particle emitter (`spawnExplosionDebris`) triggering multi-colored fire and smoke particles upon TNT and Creeper detonations.

---

### 🌊 Shoreline Water Foam & Crest Highlights (`block.frag`)
- **Dynamic Wave Foam**: Mathematical shoreline surface wave and crest highlight calculations adding realistic white water foam at coasts and lake banks.

---

### 🎯 Fast Voxel Traversal DDA Raycasting (`Raycast.cpp`)
- **Amanatides & Woo 3D Grid DDA**: Exact grid traversal algorithm with zero sampling gaps and sub-voxel boundary intersection precision.
- **Accurate Hit Surface Normals**: Guarantees mathematically exact face normal calculations for block placement and mining across chunk boundaries.

---

### ☀️ Cascaded Dynamic Shadow Mapping & PCF Filtering (`ShadowMap` & `block.frag`)
- **Multi-Distance Cascaded Frustums**: Calculates localized near-cascade ($r=15\text{m}$), mid-cascade ($r=40\text{m}$), and far-cascade ($r=90\text{m}$) light-space projection matrices.
- **3x3 Percentage-Closer Filtering (PCF)**: Smooth, anti-aliased soft shadow edges with slope-scaled adaptive depth bias preventing shadow acne.

---

### ✨ Volumetric God-Rays & Solar Light Shafts (`postprocess.frag` & `PostProcessing.cpp`)
- **Radial Raymarch Sampling**: Multi-sample screen-space illumination raymarching creating authentic warm golden sunbeams streaming across landscapes, tree canopies, and horizons.

---

### 🏛️ Ocean Monuments & Sunken Shipwrecks (`StructureGenerator.cpp`)
- **Submerged Ocean Monuments**: $13 \times 9 \times 13$ underwater stone fortresses featuring glowing sea lantern pillars, central gold treasure vault, and Guardian spawners.
- **Sunken Shipwrecks**: $12 \times 6 \times 5$ wooden hulls with oak ribs, mast, and captain's loot chest.

---

### 🗺️ Top-Down World Surface & Map Color Sampling (`World.cpp`)
- **Minimap Elevation Queries**: Live vertical surface scanning (`getTopBlock`) and biome/block color mapping (`getMapColor`) for live overhead maps.

---

### 🌑 Screen-Space Ambient Occlusion (SSAO) (`postprocess.frag` & `PostProcessing.cpp`)
- **Contact Shadow Occlusion**: Post-processing screen-space curvature and depth-gradient sampling producing localized contact darkening on block recesses and corners.

---

### 🌐 Multi-Threaded Async Packet Queuing & Dead-Reckoning (`NetworkManager.cpp`)
- **Non-Blocking Packet Queue**: Asynchronously batches incoming multiplayer packets (`queueIncomingPacket`) and executes transactional world state flushes (`flushIncomingPackets`).
- **Velocity-Compensated Dead-Reckoning**: Predicts remote entity movement trajectories ($\vec{p}_{\text{pred}} = \vec{p}_{\text{target}} + \vec{v} \cdot \Delta t$) with smooth alpha blending to prevent network stutter.
- **Shortest-Path Angle Interpolation**: Seamless heading yaw and pitch smoothing across the 360-degree boundary.

---

### 🌫️ Atmospheric Distance Fog & Sun In-Scattering (`block.frag`)
- **Exponential Squared Distance Fog**: $1.0 - e^{-(\text{dist} \times \text{density})^2}$ smoothly dissolves distant chunk edges into the horizon and skybox without clipping pop-in.
- **Sun Ray In-Scattering**: Computes forward Rayleigh/Mie solar scattering $\max(-\vec{v} \cdot \vec{l}, 0)^4$ adding warm golden volumetric glows when looking toward the sun.

---

### 🐎 Mount Saddling & Steered Riding (`MobEngine` & `PlayerStats`)
- **Saddle Equipment**: Right-clicking an adult pig or cow with a saddle equips the mount with full ridable capabilities.
- **Player-Steered Velocity**: Mounted players directly steer the animal with accelerated directional velocity ($6.0\,\text{m/s}$).

---

### 🦅 Elytra Aerodynamic Gliding Physics (`PhysicsEngine.cpp` & `PlayerStats.cpp`)
- **Pitch-to-Thrust Translation**: Translates downward gravitational potential energy into forward horizontal aerodynamic thrust ($\vec{v}_{\text{horiz}} += \vec{d}_{\text{look}} \times 14.0\,\text{m/s}^2$).
- **Cushioned Descent**: Clamps maximum downward glide velocity to $-2.5\,\text{m/s}$ for smooth panoramic aerial travel.

---

### 🐷 Animal Breeding & Feeding Mechanics (`MobEngine.hpp` & `MobEngine.cpp`)
- **Food Acceptance & Love Mode**: Feeding pigs (carrots, potatoes, apples) or cows (wheat, apples) initiates a 30-second breeding state with hearts.
- **Pair Reproduction & Baby Spawning**: When two animals in love meet ($\text{dist} < 3.5\text{m}$), they spawn a miniature baby animal with an age growth timer ($300\text{s}$).

---

### 🌊 Dynamic Fluid Flow Levels & Infinite Sources (`FluidEngine.cpp`)
- **Fluid Height Leveling**: Computes distance from source ($1 \dots 7$), supplying proportional surface heights ($h = 1.0 - \text{level} \times 0.12$).
- **2-Source Infinite Well Formation**: Air blocks with a solid floor and $\ge 2$ horizontally adjacent water source blocks automatically form new infinite water source blocks.
- **Lava + Water Obsidian Reaction**: Flowing water touching stationary lava blocks instantly transforms them into solid Obsidian.

---

### 🏛️ Advanced Structures: Nether Bastions, End Cities & Strongholds (`StructureGenerator`)
- **Nether Bastion Remnants**: $11 \times 8 \times 11$ fortified fortresses with gold deposits, central treasure vault chest, and magma cube spawners.
- **End City Towers**: $7 \times 14 \times 7$ Obsidian/Stone Brick fortresses in The End with floor dividers, floating overhang balconies, Shulker spawners, and loot chests.
- **Stronghold Portal Chamber**: $9 \times 6 \times 9$ Stone Brick dungeon featuring suspended $3 \times 3$ End Portal frame blocks around a central lava pool, silverfish spawner, and iron bar archways.
- **Ocean Ruins & Desert Pyramids**: Submerged underwater structures and multi-room sandstone temples with TNT basement traps.

---

### 🔲 Tiled Greedy Meshing & Zero UV Distortion (`ChunkMesh.cpp`)
- **Per-Block UV Sub-Sprite Clamping**: Coplanar faces of the same block and light level are grouped (for ambient-occlusion sampling), and one quad is emitted per block face, each mapped precisely to $[u, u+1/16] \times [v, v+1/16]$ atlas texture tiles.
- **Bilinear AO Interpolation**: Preserves smooth per-vertex ambient occlusion gradients across merged surfaces without texture stretching or atlas bleeding.

---

### 🫁 Player Survival Mechanics & Environmental Hazards (`PlayerStats` & `PhysicsEngine`)
- **Oxygen & Drowning**: 300-tick air gauge that depletes when submerged underwater ($30\,\text{ticks/sec}$), causing $1.0\,\text{HP}$ damage every 1.25 seconds when out of air. Surfaces instantly recover oxygen.
- **Lava & Fire Burning**: Immersion in lava or contact with fire ignites the player for 100 ticks ($1.0\,\text{HP}$ per second). Immersion in water immediately extinguishes all burning ticks.
- **Fall Damage & Armor Protection**: Accumulates fall distance while airborne. Impacts above 3 blocks deal $1.0\,\text{HP}$ damage per block fallen, mitigated by equipped diamond/iron/gold/leather armor damage reduction ratios.

---

### 🖱️ Mouse Scroll Wheel & Inventory Stack-Splitting (`Input`, `InventoryGUI` & `ContainerGUI`)
- **Mouse Wheel Hotbar Selection**: Smooth hotbar slot cycling ($0 \dots 8$) via GLFW scroll events.
- **Right-Click Half-Stack Pickup**: Right-clicking an item stack in inventory or chest picks up $\lfloor \text{count} / 2 \rfloor$ items.
- **Single-Item Drop & Distribution**: Right-clicking a destination slot while holding an item stack deposits exactly 1 item.

---

### 💻 In-Game Console Command Engine (`CommandParser.hpp` & `Application.cpp`)
- **Full Console Command Parser**:
  - `/gamemode <creative|survival>`: Toggles flight mode and survival physics.
  - `/time set <day|noon|sunset|night|midnight|sunrise|ticks>`: Real-time celestial time manipulation.
  - `/tp <x> <y> <z>`: Direct player coordinate teleportation.
  - `/give <item> [count]`: Adds items and tools directly into player inventory.
  - `/weather <clear|rain|thunder>`: Changes atmospheric precipitation and lightning states.
  - `/heal` & `/kill`: Instantly restores or zeroes player health and oxygen.

---

### 🔴 Redstone Comparator & Hopper Automation (`RedstoneEngine`)
- **Redstone Comparator (`BlockType::Comparator`)**: Measures chest/furnace/hopper container inventory fullness and outputs proportional redstone analog power ($0 \dots 15$).
- **Hopper Item Transfers (`BlockType::Hopper`)**: Automatically extracts and deposits items between connected containers on 20Hz ticks; locks and pauses transfer when powered by redstone.

---

### 🌿 Biome Colormap Blending (`Biome.hpp` & `Biome.cpp`)
- **Dynamic Grass & Foliage Colors**: Calculates authentic RGB tinting based on biome temperature and humidity:
  - 🌴 Jungle: Vibrant emerald green `(0.35, 0.80, 0.22)`.
  - 🏜️ Desert: Parched olive-yellow `(0.75, 0.71, 0.38)`.
  - 🌲 Taiga: Dark pine teal-green `(0.40, 0.65, 0.50)`.
  - 🐸 Swamp: Murky olive-brown `(0.42, 0.52, 0.27)`.

---

### ☁️ Procedural Dynamic Clouds (`Skybox`)
- **Atmospheric Clouds at $Y=128$**: Infinite drifting 2.5D/3D procedural cloud plane scrolling with continuous wind vectors ($v_x = 1.5, v_z = 0.8$).
- **Time-of-Day Color Grading**: Automatic sunset gold/orange tinting ($t \in [12000, 14000]$) and night dark indigo lighting ($t \in [14000, 22000]$) blended into the cloud layer.

---

### ✨ PBR Specular & Fresnel Highlights (`block.frag`)
- **Blinn-Phong Specular Reflections**: Real-time sun glint based on normal vectors, light direction, and view camera angle.
- **Fresnel Water Translucency**: Angle-dependent surface reflectance ($F_0 + (1-F_0)(1-\cos\theta)^4$) for realistic ocean, river, and ice rendering.

---

### ☠️ Wither 3-Headed Boss Engine (`MobEngine` & `EntityRenderer`)
- **3-Headed Geometric Box Model**: Dark floating ribcage body with hovering sine motion and independent left/right side-head yaw rotations.
- **Boss AI & Explosive Skulls**: 300 HP hovering combat AI firing ballistic Wither Skulls every 2.2 seconds that trigger spherical block destruction on impact.
- **Nether Star Drops**: High-value boss drop upon defeat.

---

### 👥 Multiplayer Remote Players & 3D Nametags (`NetworkManager` & `EntityRenderer`)
- **Remote Player 3D Models**: Renders complete Steve character models (cyan shirt, blue pants, skin tones) with synchronized limb swing animations.
- **3D Floating Nametags**: Renders player names/IDs above head level facing the camera.
- **UDP Socket Pipeline**: Non-blocking UDP packet transmission with binary serialization for coordinates, yaw/pitch, and block edits.

---

### 👾 3D Entity & Mob Renderer (`EntityRenderer`)
- **Hierarchical Mob Models**: 3D geometric box-model rendering with real-time limb-swing animations, head rotation tracking, and hurt-flash red tinting for:
  - 🧟 **Zombie**: Forward-raised arms, dynamic limb swinging, and damage feedback.
  - 🏹 **Skeleton**: Ranged humanoid model shooting 3D ballistic arrow projectiles.
  - 💥 **Creeper**: 4-legged quadruped model with pulsing white swelling animation during fuse countdown.
  - 🐷 **Pig & Cow**: Horizontal quadruped body with walking leg cycles and drops.
  - 👨‍🌾 **Villager**: Humanoid model with trading interaction support.
  - 🦾 **Iron Golem**: Heavy village defender model with high-damage knockback.
  - 🐉 **Ender Dragon**: Multi-part boss model with flapping wings ($\sin(\text{time} \times 8)$), tail segments, and 3D aerial pathfinding.
- **First-Person Hand & Held Item Model**: Dynamic view-space arm and held block/tool rendering featuring walk bobbing and attack/mining swing arcs.
- **Item Drops & Arrow Projectiles**: 3D spinning and bobbing voxel miniature block entities with magnetic player attraction, plus velocity-oriented ballistic arrows.

---

### 🔤 Procedural Bitmap Typography Engine (`FontRenderer`)
- **Procedural 8x8 ASCII Font Atlas**: Generates a $128 \times 128$ texture atlas from binary pixel matrices covering all standard printable ASCII characters (32–126).
- **Text Formatting & Shadows**: Dynamic string batching with drop shadows, color styling, and scale adjustments for HUD, F3 debug screen, inventory counts, and menus.

---

### 📦 Interactive Containers & Crafting (`ContainerGUI` & `InventoryGUI`)
- **27-Slot Chest GUI**: Interactive chest interface supporting full stack transfers, slot click dragging, right-click half stack pickup, and audio feedback.
- **Animated Smelting Furnace**: Interactive furnace screen with dynamic burning fire flame gauge and green smelting progress arrow.
- **2x2 & 3x3 Crafting Grids**: Real-time recipe matching for tools, weapons, armors, and utility blocks.

---

### ⛏️ Continuous Mining & Tool System (`ToolSystem`)
- **Block Hardness & Tool Multipliers**: Continuous left-click mining with hardness formulas (Dirt $0.5\text{s}$, Stone $1.5\text{s}$, Obsidian $5.0\text{s}$). Pickaxes, axes, and shovels dramatically accelerate harvest speed according to tier (Wood, Stone, Iron, Diamond).
- **Debris Particles & Breaking Decals**: Mining generates real-time particle sparks and block-break debris.

---

### 🌲 Natural Mob Spawning & World Ecology (`MobEngine`)
- **Radius-Based Spawner**: Spawns passive animals on grass surfaces during daylight and hostile monsters in dark areas ($r = 24 \dots 48$ blocks).
- **Mob Cap & Distance Despawning**: Strict mob cap limit (24 mobs) and automatic despawning of entities further than 72 blocks from the player.

---

### 🎨 Visual & Shader Pipeline (`ChunkMesh`, `TextureAtlas` & Shaders)
- **Pixel-Art Texture Atlas**: Integrated $256 \times 256$ texture atlas generator with authentic pixel art patterns for all voxel blocks, ores, flora, and liquids with `GL_NEAREST_MIPMAP_LINEAR` filtering.
- **Smooth Lighting / Vertex AO**: Dynamic per-vertex ambient occlusion calculation ($0.25 \dots 1.0$) based on 3-voxel corner neighborhood checks.
- **Waving Foliage & Wind Flutter**: Real-time vertex displacement in `block.vert` simulating wind sway for tree canopies, tall grass, crops, and water ripples.
- **Post-Processing (Bloom & ACES Filmic)**: Multi-pass FBO pipeline in `postprocess.frag` with Bloom extraction, ACES HDR tonemapping, Vignette, and Night Vision luminance amplification.
- **Asynchronous CPU Meshing**: Worker threads generate vertex/index data without OpenGL context locks; main thread performs bounded batch GPU buffer uploads.

---

### 🧩 Sub-Chunk Vertical Slicing (`ChunkSection`)
- **$16 \times 16 \times 16$ Chunk Sections**: Chunks are partitioned into 16 vertical sections that track their non-air block counts. Block edits flag the affected chunk (and bordering neighbours) dirty; `World::remeshDirtyChunks` rebuilds them within a per-frame time budget, using a snapshot that includes the neighbouring chunks' border blocks and light.

---

### 🔌 Data-Driven Modding & Addon Registry (`ModdingEngine`)
- **Custom Blocks & Recipes**: Dynamic runtime registration of custom block definitions (hardness, light emission, solid/opacity flags) and custom crafting recipes via JSON manifests.

---

### ⚗️ Brewing Stand Engine & Status Effects (`BrewingEngine` & `PlayerStats`)
- **Brewing Stand Recipes**: Synthesis of Awkward Potions, Swiftness (Speed I), Leaping (Jump Boost I), Night Vision, Healing (Instant Health), Regeneration, and Poison.
- **Dynamic Status Modifiers**: Live acceleration of player movement velocity, jump height elevation, continuous health regeneration, and poison damage tick timers.

---

## ⌨️ Controls & Keybindings

| Key / Input | Action |
|-------------|--------|
| `Escape` | Open Pause Menu / Close UI / Back |
| `E` | Open / Close Inventory & Crafting GUI |
| `W / A / S / D` | Movement (Forward, Left, Backward, Right) |
| `Space` | Jump / Swim upward in water / Ascend in Fly Mode |
| `L-Shift` | Sneak (prevents falling off ledges) / Descend in Fly Mode |
| `L-Ctrl` | Sprint (increases movement speed and FOV) |
| `F` | Toggle Fly Mode vs Physics Mode |
| `F3` | Toggle Debug HUD (FPS, Position, Chunk, Facing, Biome, Light) |
| `F4` | Cycle Time of Day (Day -> Sunset -> Night -> Sunrise) |
| `T` | Fast Forward Time |
| `1 - 9` / `Mouse Wheel` | Select Hotbar Item Slot |
| `Left Click (Hold)` | Continuous Mining / Attack Mob |
| `Right Click` | Place block / Interact (Chest, Furnace, Lever, Food, Redstone, Smithing Table) / Half-Stack Pick / Single Item Deposit |
| `Mouse Move` | Look around (Pitch / Yaw) |

---

## 🏗️ Build & Compilation

### Requirements
- **Compiler**: C++20 compatible (MSVC 2019+, GCC 10+, Clang 11+)
- **CMake**: Version >= 3.20
- **Libraries** (automatically fetched via CMake): GLFW 3.4, GLM 1.0.1, EnTT 3.13.2, OpenGL 4.5 Core

### Windows Build (MSVC)
```powershell
mkdir build
cd build
cmake .. -G "NMake Makefiles" -DCMAKE_BUILD_TYPE=Release
nmake Minecraft
```

### Running the Engine
```powershell
.\build\Minecraft.exe
.\build\Minecraft.exe --autostart --seed myworld --render-distance 8   # skip the menu
.\build\Minecraft.exe --autostart --frames 300                          # smoke test: exits, fails on GL errors
```
Worlds are stored per seed in `world_saves/seed_<seed>/` (chunks, player, inventory, chests, furnaces). Type a seed in the main menu (empty = random); numbers are used directly, any other text is hashed.

### Running Automated Engine Unit Tests
```powershell
cmake --build build --target TestEngine
.\build\TestEngine.exe            # all tests (non-zero exit code on failure)
.\build\TestEngine.exe Network    # only tests whose name contains "Network"
ctest --test-dir build --output-on-failure
```
Optional: `-DMC_SANITIZE=ON` (AddressSanitizer) or `-DMC_TSAN=ON` (ThreadSanitizer, GCC/Clang).
> **111 automated tests** (assertions are active in every build type). They execute and validate every engine subsystem across DDA raycasting, Woodland Mansions, Smithing Table upgrades, GPU explosion emitters, Shoreline Water Foam, Cascaded Shadow Mapping (CSM), Volumetric God-Rays, Ocean Monuments, Sunken Shipwrecks, Screen-Space Ambient Occlusion (SSAO), async network packet queuing, dead-reckoning client prediction, volumetric distance fog, animal breeding, mount riding & saddling, dynamic fluid levels, Nether Bastions, Elytra gliding aerodynamics, End City structures, player hazards (oxygen, lava, fall damage), mouse scroll selection, inventory stack-splitting, infinite water fluids, console commands, Redstone Comparators, Hopper automation, Biome colormaps, Stronghold dungeons, mob AI, procedural clouds, and UDP socket networking.

---

## ⚙️ Environment Configuration (`.env`)

Engine parameters, graphics quality presets, networking hosts, and test behavior can be configured using environment variables or a local `.env` file (copied from [.env.example](.env.example)):

```powershell
# Copy template to local configuration
copy .env.example .env
```

| Variable | Default | Description |
|:---|:---|:---|
| `APP_ENV` | `development` | Runtime environment mode (`development`, `production`, `testing`) |
| `LOG_LEVEL` | `INFO` | Console logging verbosity (`TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`) |
| `VIEW_DISTANCE` | `12` | Active chunk render distance radius |
| `SHADOWS_ENABLED` | `1` | Enable 3-stage Cascaded Dynamic Shadow Mapping (CSM) |
| `SHADOW_RESOLUTION` | `2048` | Depth map resolution for shadow cascades |
| `BLOOM_ENABLED` | `1` | Fullscreen quad HDR bloom extraction pass |
| `SSAO_ENABLED` | `1` | Screen-Space Ambient Occlusion post-processing |
| `DEFAULT_SEED` | `133742` | Default world generation seed |
| `SERVER_HOST` / `PORT`| `127.0.0.1` / `25565` | UDP multiplayer network socket binding |
| `WEB_DOCS_PORT` | `3000` | Local port for the web documentation & showcase preview |

---

## 🤖 AI Assistant Workflows (Claude Code & Google Gemini)

This repository is optimized for seamless, high-signal collaboration with modern AI coding agents:

- **Claude Code**: Detailed architectural rules and invariant definitions are located in [`CLAUDE.md`](CLAUDE.md). Claude-specific slash commands are ready in `.claude/commands/`:
  - `/build` — CMake build execution with target diagnostics
  - `/test` — TestEngine execution and failure reporting
  - `/add-block` — Scaffolding instructions for adding new voxel blocks
  - `/check-secrets` — Validate staged commits against secret & .env leak rules
- **Google Gemini & Antigravity**: Comprehensive instructions are provided in [`GEMINI.md`](GEMINI.md). Universal agent rules are codified in [`AGENTS.md`](AGENTS.md).
- **Pre-Commit Security Guard**: Activated via `git config core.hooksPath .githooks`. Automatically blocks `.env` files and API keys (Anthropic, OpenAI, GitHub PAT, AWS) from being staged or committed.
- **Context Optimization**: Large compilation databases, world save files, binary objects, and build folders are strictly excluded via [`.claudeignore`](.claudeignore) and [`.geminiignore`](.geminiignore) to keep agent context windows focused and efficient.

---

## 🌐 Interactive Web Showcase & Vercel Deployment

A high-tech documentation portal and interactive 3D voxel simulator is available in the [`web/`](web/) directory:

- **Interactive 3D Voxel Lab**: Live browser-based canvas simulating sunlight angles, smooth vertex ambient occlusion, and Day/Night atmospheric sky palettes.
- **Subsystem & Block Browser**: Filterable registry detailing block hardness, harvest tools, light emission, and Anvil save structures.
- **Controls & Keybindings**: Searchable cheatsheet for game controls.

### Local Web Preview
```powershell
# Run using Node / npx
npm run dev
# or: npx serve web -p 3000
```

### Instant Deployment to Vercel
The repository includes a ready-to-use [`vercel.json`](vercel.json) deployment manifest with clean URLs and HTTP security headers:
```powershell
# Deploy with Vercel CLI
vercel --prod
```
Or import the repository directly into your [Vercel Dashboard](https://vercel.com/new).

---

## 🤝 Contributing & Community

Please review our community guidelines before submitting pull requests:
- [CONTRIBUTING.md](CONTRIBUTING.md) — Coding conventions, C++20 rules, and branching strategy.
- [SECURITY.md](SECURITY.md) — UDP packet parsing security and vulnerability reporting.
- [CHANGELOG.md](CHANGELOG.md) — Historical log of engine releases and additions.
- [.github/pull_request_template.md](.github/pull_request_template.md) — Pre-flight checklist for pull requests.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
