---
description: Build the Minecraft game and TestEngine targets with CMake
---

Build the project using CMake with the following steps:

1. Ensure the build directory exists and is configured:
   ```powershell
   cmake -B build -DCMAKE_BUILD_TYPE=Release
   ```
2. Build the main executable and the test engine target:
   ```powershell
   cmake --build build --config Release --target Minecraft
   cmake --build build --config Release --target TestEngine
   ```
3. Report any compiler warnings or errors, paying close attention to link errors caused by differences between `SOURCES` and `TEST_SOURCES` in `CMakeLists.txt`.
