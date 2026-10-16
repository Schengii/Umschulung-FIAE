---
description: Build and run the engine automated test suite
---

Build and run `TestEngine`:

1. Build the test target:
   ```powershell
   cmake --build build --config Release --target TestEngine
   ```
2. Run the test binary from the directory where the build output is located (or pass the full path):
   ```powershell
   .\build\TestEngine.exe
   ```
3. Check the exit code and verify all tests printed `[TEST] ... OK`.
   Note: `TestEngine` cleans up `world_saves` on startup, which is expected.
