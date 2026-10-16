#ifndef CHESTBLOCK_HPP
#define CHESTBLOCK_HPP

#include "../inventory/ItemStack.hpp"

#include <glm/glm.hpp>
#include <unordered_map>
#include <utility>
#include <vector>

namespace Minecraft {

class ChestManager {
public:
    ChestManager();
    ~ChestManager();

    void createChest(const glm::ivec3& pos);
    std::vector<ItemStack>* getChestInventory(const glm::ivec3& pos);
    void setSlot(const glm::ivec3& pos, int slotIndex, BlockType type, int count);

    // Removes the chest at `pos` and returns its non-empty stacks (to be dropped when the block is broken).
    std::vector<ItemStack> removeChest(const glm::ivec3& pos);

    // Persistence helpers.
    std::vector<std::pair<glm::ivec3, std::vector<ItemStack>>> snapshot() const;
    void restore(const glm::ivec3& pos, std::vector<ItemStack> slots);
    size_t getChestCount() const { return m_Chests.size(); }

private:
    struct IVec3Hash {
        std::size_t operator()(const glm::ivec3& v) const {
            return std::hash<int>()(v.x) ^ (std::hash<int>()(v.y) << 1) ^ (std::hash<int>()(v.z) << 2);
        }
    };

    std::unordered_map<glm::ivec3, std::vector<ItemStack>, IVec3Hash> m_Chests;
};

} // namespace Minecraft

#endif // CHESTBLOCK_HPP
