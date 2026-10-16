---
description: Guide and checklist for adding a new block type to the voxel engine
---

When adding a new block type to this engine, ensure all of the following locations are updated:

1. **Enum definition**: Add the new block type to `enum class BlockType : uint8_t` in `src/world/Block.hpp`.
2. **Block attributes**: Update block transparency, hardness, luminance, and solid checks in `src/world/Block.cpp` / `Block.hpp` (`isTransparent()`, `isSolid()`, `getHardness()`, `getLightLevel()`).
3. **Texture Atlas**: Assign or procedurally generate face UV coordinates in `src/renderer/TextureAtlas.cpp` (`getBlockUVs()`).
4. **Drops & Tools**: Update tool requirements and drop tables in `src/world/ToolSystem.cpp` if applicable.
5. **Crafting & Recipes**: Add any relevant recipe in `src/crafting/CraftingManager.cpp`.
6. **CMake & Tests**: If adding any new `.cpp` files, remember to add them to **both** `SOURCES` and `TEST_SOURCES` in `CMakeLists.txt`. Then run `/test` to verify.
