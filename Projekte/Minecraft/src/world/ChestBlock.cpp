#include "ChestBlock.hpp"

namespace Minecraft {

ChestManager::ChestManager() = default;
ChestManager::~ChestManager() = default;

void ChestManager::createChest(const glm::ivec3& pos) {
    if (m_Chests.find(pos) == m_Chests.end()) {
        m_Chests[pos] = std::vector<ItemStack>(27, ItemStack{BlockType::Air, 0, 64});
    }
}

std::vector<ItemStack>* ChestManager::getChestInventory(const glm::ivec3& pos) {
    auto it = m_Chests.find(pos);
    if (it != m_Chests.end()) {
        return &it->second;
    }
    createChest(pos);
    return &m_Chests[pos];
}

std::vector<ItemStack> ChestManager::removeChest(const glm::ivec3& pos) {
    std::vector<ItemStack> items;
    auto it = m_Chests.find(pos);
    if (it == m_Chests.end())
        return items;
    for (const ItemStack& stack : it->second) {
        if (!stack.isEmpty())
            items.push_back(stack);
    }
    m_Chests.erase(it);
    return items;
}

std::vector<std::pair<glm::ivec3, std::vector<ItemStack>>> ChestManager::snapshot() const {
    return {m_Chests.begin(), m_Chests.end()};
}

void ChestManager::restore(const glm::ivec3& pos, std::vector<ItemStack> slots) {
    m_Chests[pos] = std::move(slots);
}

void ChestManager::setSlot(const glm::ivec3& pos, int slotIndex, BlockType type, int count) {
    auto* inv = getChestInventory(pos);
    if (inv && slotIndex >= 0 && slotIndex < static_cast<int>(inv->size())) {
        (*inv)[slotIndex].type = type;
        (*inv)[slotIndex].count = count;
    }
}

} // namespace Minecraft
