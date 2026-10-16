#ifndef INVENTORY_HPP
#define INVENTORY_HPP

#include "ItemStack.hpp"

#include <array>

namespace Minecraft {

class Inventory {
public:
    Inventory();

    ItemStack& getSlot(int index);
    const ItemStack& getSlot(int index) const;

    bool addItem(BlockType type, int count = 1);
    // Debug/creative helper: replaces the hotbar with a stack of common building blocks.
    void fillCreativeHotbar();
    void setSlot(int index, BlockType type, int count);
    void swapSlots(int indexA, int indexB);

    ItemStack& getCraftingInput(int index);
    ItemStack& getCraftingOutput();
    void updateCraftingRecipe();

private:
    std::array<ItemStack, 36> m_Slots;
    std::array<ItemStack, 4> m_CraftingInput; // 2x2 grid
    ItemStack m_CraftingOutput;
};

} // namespace Minecraft

#endif // INVENTORY_HPP
