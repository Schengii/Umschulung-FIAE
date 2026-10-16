#include "ToolSystem.hpp"

namespace Minecraft {

bool ToolSystem::isTool(BlockType type) {
    switch (type) {
    case BlockType::WoodPickaxe:
    case BlockType::StonePickaxe:
    case BlockType::IronPickaxe:
    case BlockType::DiamondPickaxe:
    case BlockType::WoodAxe:
    case BlockType::IronSword:
    case BlockType::DiamondSword:
        return true;
    default:
        return false;
    }
}

ToolInfo ToolSystem::getToolInfo(BlockType type) {
    switch (type) {
    case BlockType::WoodPickaxe:
        return {ToolCategory::Pickaxe, ToolTier::Wood, 59, 2.0f};
    case BlockType::StonePickaxe:
        return {ToolCategory::Pickaxe, ToolTier::Stone, 131, 4.0f};
    case BlockType::IronPickaxe:
        return {ToolCategory::Pickaxe, ToolTier::Iron, 250, 6.0f};
    case BlockType::DiamondPickaxe:
        return {ToolCategory::Pickaxe, ToolTier::Diamond, 1561, 8.0f};
    case BlockType::WoodAxe:
        return {ToolCategory::Axe, ToolTier::Wood, 59, 2.0f};
    case BlockType::IronSword:
        return {ToolCategory::Sword, ToolTier::Iron, 250, 6.0f};
    case BlockType::DiamondSword:
        return {ToolCategory::Sword, ToolTier::Diamond, 1561, 8.0f};
    default:
        return {ToolCategory::None, ToolTier::None, 0, 1.0f};
    }
}

bool ToolSystem::isPickaxeBlock(BlockType block) {
    switch (block) {
    case BlockType::Stone:
    case BlockType::CoalOre:
    case BlockType::IronOre:
    case BlockType::GoldOre:
    case BlockType::DiamondOre:
    case BlockType::Obsidian:
    case BlockType::Furnace:
    case BlockType::Netherrack:
    case BlockType::EndStone:
    case BlockType::StoneBricks:
    case BlockType::PurpurBlock:
        return true;
    default:
        return false;
    }
}

float ToolSystem::getBlockHardness(BlockType block) {
    switch (block) {
    case BlockType::Stone:
    case BlockType::CoalOre:
    case BlockType::IronOre:
    case BlockType::Furnace:
    case BlockType::Netherrack:
    case BlockType::EndStone:
    case BlockType::StoneBricks:
    case BlockType::PurpurBlock:
        return 1.5f;
    case BlockType::DiamondOre:
    case BlockType::GoldOre:
        return 2.0f;
    case BlockType::Obsidian:
        return 5.0f;
    case BlockType::Dirt:
    case BlockType::Sand:
    case BlockType::SoulSand:
        return 0.5f;
    case BlockType::Leaves:
    case BlockType::Grass:
        return 0.3f;
    default:
        return 1.0f;
    }
}

bool ToolSystem::isUnbreakable(BlockType block) {
    return block == BlockType::Bedrock || block == BlockType::EndPortal || block == BlockType::EndPortalFrame;
}

float ToolSystem::getMiningSpeed(BlockType block, BlockType tool) {
    ToolInfo info = getToolInfo(tool);

    if (isPickaxeBlock(block)) {
        if (info.category == ToolCategory::Pickaxe)
            return info.speedMultiplier;
    } else if (block == BlockType::OakLog || block == BlockType::BirchLog || block == BlockType::Planks ||
               block == BlockType::CraftingTable) {
        if (info.category == ToolCategory::Axe)
            return info.speedMultiplier;
    }

    return 1.0f;
}

bool ToolSystem::canHarvest(BlockType block, BlockType tool) {
    ToolInfo info = getToolInfo(tool);
    auto pickaxeOfTier = [&](ToolTier minTier) {
        return info.category == ToolCategory::Pickaxe && static_cast<int>(info.tier) >= static_cast<int>(minTier);
    };

    if (block == BlockType::Obsidian) {
        return pickaxeOfTier(ToolTier::Diamond);
    }
    if (block == BlockType::DiamondOre || block == BlockType::GoldOre) {
        return pickaxeOfTier(ToolTier::Iron);
    }
    if (block == BlockType::IronOre) {
        return pickaxeOfTier(ToolTier::Stone);
    }
    if (isPickaxeBlock(block)) {
        return pickaxeOfTier(ToolTier::Wood);
    }

    return true;
}

int ToolSystem::getDamageDealt(BlockType tool) {
    ToolInfo info = getToolInfo(tool);
    if (info.category == ToolCategory::Sword) {
        if (info.tier == ToolTier::Diamond)
            return 7;
        if (info.tier == ToolTier::Iron)
            return 6;
    }
    return 1;
}

} // namespace Minecraft
