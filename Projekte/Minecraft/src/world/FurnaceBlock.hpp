#ifndef FURNACEBLOCK_HPP
#define FURNACEBLOCK_HPP

#include "../inventory/ItemStack.hpp"

#include <glm/glm.hpp>
#include <unordered_map>
#include <utility>
#include <vector>

namespace Minecraft {

struct FurnaceData {
    ItemStack input{BlockType::Air, 0, 64};
    ItemStack fuel{BlockType::Air, 0, 64};
    ItemStack output{BlockType::Air, 0, 64};
    float cookTimer = 0.0f;
    float cookTimeMax = 5.0f; // 5 seconds per item
    float fuelBurnTimer = 0.0f;
};

class FurnaceManager {
public:
    FurnaceManager();
    ~FurnaceManager();

    FurnaceData* getFurnace(const glm::ivec3& pos);
    void update(float deltaTime);

    // Removes the furnace at `pos` and returns its non-empty stacks (dropped when the block is broken).
    std::vector<ItemStack> removeFurnace(const glm::ivec3& pos);

    // Persistence helpers.
    std::vector<std::pair<glm::ivec3, FurnaceData>> snapshot() const;
    void restore(const glm::ivec3& pos, const FurnaceData& data);
    size_t getFurnaceCount() const { return m_Furnaces.size(); }

    static bool isSmeltable(BlockType input);
    static BlockType getSmeltResult(BlockType input);
    static bool isFuel(BlockType fuel);

private:
    struct IVec3Hash {
        std::size_t operator()(const glm::ivec3& v) const {
            return std::hash<int>()(v.x) ^ (std::hash<int>()(v.y) << 1) ^ (std::hash<int>()(v.z) << 2);
        }
    };

    std::unordered_map<glm::ivec3, FurnaceData, IVec3Hash> m_Furnaces;
};

} // namespace Minecraft

#endif // FURNACEBLOCK_HPP
