# AGENTS.md - Universal AI Coding Assistant Specification

This specification provides unified conventions, invariant guarantees, and operational procedures for all AI coding assistants (including **Claude Code**, **Google Gemini / Antigravity**, **Cursor**, and **GitHub Copilot**) working on the **Minecraft C++ OpenGL Voxel Engine**.

---

## 1. System Invariants & Core Rules

All agents interacting with this repository must strictly observe the following ground rules:

1. **Explicit Source Registration**:
   - `CMakeLists.txt` does not use globbing for engine sources.
   - Any new `.cpp` file created in `src/` must be added to the `MinecraftCore` static library list in [CMakeLists.txt](file:///CMakeLists.txt).
   - Any new test file or test helper in `tests/` must be linked or included in `tests/test_engine.cpp`.

2. **Thread Safety & OpenGL Ownership**:
   - The OpenGL context is exclusively owned by the main thread.
   - Worker threads in `ThreadPool` must **never** invoke OpenGL API functions (`glGen*`, `glBind*`, `glDraw*`, etc.).
   - Mesh data generation (`ChunkMesh::buildMeshData`) is pure CPU calculation and emits vertex/index arrays without GPU calls.

3. **Code Formatting**:
   - Formatting is dictated by [.clang-format](file:///.clang-format). Run `clang-format -i <file>` or follow 4-space indentation with LLVM style.

4. **Testing Invariant**:
   - Every functional change must maintain 100% test pass rate in [tests/test_engine.cpp](file:///tests/test_engine.cpp).
   - Build target `TestEngine` and run `.\build\TestEngine.exe` to verify.

5. **Configuration & Secrets**:
   - Do **NOT** commit secrets or environment overrides into `.env`.
   - Use [.env.example](file:///.env.example) as the canonical blueprint for all configurable parameters.

6. **Pre-Commit Hook Invariant**:
   - All commits are guarded by the Git pre-commit hook in [`.githooks/pre-commit`](file:///.githooks/pre-commit) (`git config core.hooksPath .githooks`).
   - The hook automatically blocks `.env` files (except `.env.example`) and API keys (Anthropic, OpenAI, GitHub PATs, AWS, private keys).
   - AI agents must never bypass this hook (e.g. do not pass `--no-verify`).

---

## 2. Agent Coordination Matrix

| Platform / Tool | Configuration File | Ignore File | Role / Responsibility |
|:---|:---|:---|:---|
| **Claude Code** | [CLAUDE.md](file:///CLAUDE.md), [.claude/commands/](file:///.claude/commands/) | [.claudeignore](file:///.claudeignore) | High-level refactoring, feature implementation, architecture validation |
| **Google Gemini / Antigravity** | [GEMINI.md](file:///GEMINI.md) | [.geminiignore](file:///.geminiignore) | Multi-modal reasoning, web documentation, subsystem integration, code reviews |
| **GitHub Actions / CI** | [.github/workflows/build.yml](file:///.github/workflows/build.yml) | [.gitignore](file:///.gitignore) | Multi-platform build verification (Windows MSVC + Linux Clang/GCC) & CTest |
| **Vercel** | [vercel.json](file:///vercel.json) | [.gitignore](file:///.gitignore), [.vercelignore](file:///.vercelignore) | Hosting the web documentation portal, technical interactive showcase, and stats |

---

## 3. Standard Commands

```powershell
# Build both game and test engine
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release --target Minecraft
cmake --build build --config Release --target TestEngine

# Run unit tests
.\build\TestEngine.exe

# Quick smoke test (300 frames headless)
.\build\Minecraft.exe --autostart --frames 300
```
