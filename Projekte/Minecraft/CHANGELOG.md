# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Google Gemini & Antigravity Support**:
  - `GEMINI.md`: Comprehensive development guide covering C++20 conventions, subsystem architecture, and safety rules.
  - `AGENTS.md`: Universal agent specification harmonizing workflows across Claude, Gemini, Antigravity, and Copilot.
  - `.geminiignore`: Context optimization file filtering build artifacts, world saves, and binary blobs.
- **Vercel Deployment & Web Showcase**:
  - `vercel.json` and `.vercelignore`: Edge deployment configuration with security headers, clean URLs, and asset caching.
  - `web/`: Full-featured interactive web documentation portal and 3D voxel lab with live Day/Night lighting cycle simulation, block library inspector, keybindings table, and quickstart commands.
  - `package.json`: Lightweight static asset serving scripts (`npm run dev`, `npm run start`).
- **GitHub Collaboration & CI/CD**:
  - `.github/pull_request_template.md`: Comprehensive PR checklist covering thread safety, CMake registration, and test verification.
  - `.github/ISSUE_TEMPLATE/`: Structured issue templates for bug reports and feature requests.
  - `.github/workflows/lint_format.yml`: Automated CI action checking `clang-format` compliance across all C++ headers and sources.
  - `CONTRIBUTING.md`: Developer guide with branch naming, build procedures, and PR lifecycle.
  - `SECURITY.md`: Security policy covering network packet validation and Anvil save bounds safety.
- **Configuration & Context Optimization**:
  - Environment templates `.env` and `.env.example` updated with web documentation and server settings.
  - Updated `.claudeignore` and `.gitignore` to exclude Vercel, Node.js, and agent session caches.
  - Automated Git pre-commit security hook in `.githooks/pre-commit` to prevent accidental commits of `.env` files and API keys/credentials (Anthropic, OpenAI, GitHub tokens, AWS, private keys), paired with Claude command `.claude/commands/check-secrets.md`.

---

## [0.3.0] - 2026-08-27

### Added
- **Particle System**: Integrated CPU/GPU `ParticleEngine` with configurable emitter lifetimes, velocities, gravity, and block break/place bursts.
- **Crafting & Recipes**: Recipe registry with 2x2 and 3x3 crafting grids, shapeless and shaped crafting support.
- **World Structures**: Procedural village generation, houses, paths, desert temples, and dungeon rooms.
- **Cascaded Shadow Mapping**: Configurable cascaded shadow maps (`ShadowMap`) with PCF filtering for high-fidelity directional sun shadows.
- **Post-Processing Pipeline**: Fullscreen quad FBO pipeline (`PostProcessing`) featuring HDR bloom, Screen-Space Ambient Occlusion (SSAO), volumetric god rays, and ACES filmic tonemapping.
- **Atmospheric Effects**: Realistic distance fog fading into dynamic sky colors depending on time-of-day and weather.
- **Mob & Entity Systems**:
  - Entity Component System (ECS) powered by EnTT (`ecs/Components.hpp`).
  - Hierarchical box mesh rendering for entities and remote players via `EntityRenderer`.
  - Mob AI behaviors: animal breeding, mount riding, Elytra gliding physics, and A* 3D pathfinding in `MobEngine`.
- **Multiplayer Networking**: Non-blocking UDP network manager (`NetworkManager`) supporting Windows Winsock2 and POSIX sockets, packet serialization, and multi-client state synchronization.
- **Extended Test Suite**: New engine tests covering particle emitters, crafting manager recipes, and structure generation.

### Changed
- Refactored asynchronous chunk loading and mesh generation pipeline to ensure OpenGL context isolation to the main render thread.
- Improved terrain generation performance with multi-threaded chunk section meshing.

---

## [0.2.0] - 2026-08-14

### Added
- **Multi-Dimension Support**: Dimension manager (`DimensionManager`) with Overworld, Nether, and End dimensions, portal generation, and dimension transitions.
- **Farming & Crops**: Soil tilling, crop hydration checks, growth stages, bone meal interaction, and pumpkin/melon stem growth (`CropsEngine`).
- **Economy & Villagers**: Villager profession assignment, interactive trading GUI (`TradingEngine`), and emerald currency mechanics.
- **Equipment & Combat**: Armor defense calculation, item durability degradation, weapon damage scaling, and Enchantment Table mechanics (`EnchantingEngine`).
- **Brewing System**: Potion brewing stand mechanics with ingredient heating, blaze powder fuel, and custom potion effects (`BrewingEngine`).
- **Audio System**: Sound effects integration for block breaks, footsteps, mob sounds, and ambient background music.

---

## [0.1.0] - 2026-08-02

### Added
- **Core Engine & Architecture**:
  - C++20 voxel rendering engine using OpenGL 4.5 Core and GLFW 3.4.
  - Multi-threaded task scheduling using custom `ThreadPool`.
  - Modding infrastructure (`ModdingEngine`) for loading blocks and items from JSON manifests.
- **World & Simulation**:
  - 16x16x16 chunk section data model with greedy meshing and ambient occlusion calculation.
  - Anvil-style `.mca` region-based chunk persistence (`RegionFile`, `SaveSystem`).
  - 3D FastNoiseLite terrain generation, biomes (Plains, Desert, Forest, Mountains), and cave decorators.
  - BFS flood-fill lighting engine (`LightEngine`) for sky and block light channels.
  - Cellular fluid simulation (`FluidEngine`) for water and lava flow dynamics.
  - Redstone power propagation engine (`RedstoneEngine`) with repeaters, comparators, torches, levers, and pistons.
- **Physics & Gameplay**:
  - Voxel AABB collision detection, sliding physics, gravity, jumping, and swimming mechanics.
  - Continuous block breaking with hardness values and tool tier multipliers (`ToolSystem`).
  - 36-slot inventory management, hotbar selection, and interactive chest/furnace containers.
- **GUI & Display**:
  - Procedural font rendering (`FontRenderer`) and procedural block texture atlas (`TextureAtlas`).
  - In-game HUD with health, hunger, armor bars, crosshair, and F3 debug overlay.
  - Main menu and pause menu screens.
- **Automated Tests**:
  - Engine test suite executable (`TestEngine`) covering fluids, redstone, lighting, saving, inventory, and physics.
