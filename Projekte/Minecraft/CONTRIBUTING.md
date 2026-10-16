# Contributing to Minecraft C++ OpenGL Voxel Engine

Thank you for your interest in contributing to the Minecraft C++ Voxel Engine! This document outlines guidelines for developers, AI assistants, and maintainers.

---

## 1. Development Principles

1. **Modern C++20 Standards**: All code must conform to C++20 (`std::span`, `std::string_view`, concepts, RAII).
2. **OpenGL Context Rules**: Only the main thread may execute OpenGL API commands. Worker threads in `ThreadPool` generate vertex/index data without touching GL state.
3. **Explicit Source Registration**: Do not glob files in `CMakeLists.txt`. Register all new `.cpp` files under the `MinecraftCore` static library.
4. **Zero Test Regressions**: All 111+ tests in `tests/test_engine.cpp` must pass before opening a Pull Request.

---

## 2. Setting Up Your Environment

### Prerequisites
- **Compiler**: MSVC 2019+, GCC 10+, or Clang 11+ with C++20 support.
- **CMake**: Version >= 3.20.
- **Graphics Driver**: Hardware supporting OpenGL 4.5 Core Profile.

### Local Setup
```powershell
# 1. Copy environment configuration
copy .env.example .env

# 2. Activate pre-commit security hook (blocks .env & API keys)
git config core.hooksPath .githooks

# 3. Configure and build
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release --target Minecraft
cmake --build build --config Release --target TestEngine

# 4. Run unit tests
.\build\TestEngine.exe
```

---

## 3. Working with AI Assistants (Claude & Gemini)

- **Claude Code**: Refer to [CLAUDE.md](file:///CLAUDE.md) and slash commands in `.claude/commands/`.
- **Google Gemini**: Refer to [GEMINI.md](file:///GEMINI.md) and [AGENTS.md](file:///AGENTS.md).
- Both agents should respect [.claudeignore](file:///.claudeignore) and [.geminiignore](file:///.geminiignore).

---

## 4. Pull Request Process

1. Fork the repo and create a descriptive branch: `feature/your-feature-name` or `fix/issue-description`.
2. Format your changes with `clang-format -i <file>`.
3. Verify that `TestEngine.exe` exits with code 0.
4. Fill out the [Pull Request Template](file:///.github/pull_request_template.md).
5. Ensure CI builds pass on both Windows and Linux.
