#ifndef BLOCK_HPP
#define BLOCK_HPP

#include <cstdint>
#include <glm/glm.hpp>

namespace Minecraft {

enum class BlockType : uint8_t {
    Air = 0,
    Grass,
    Dirt,
    Stone,
    Bedrock,
    OakLog,
    Leaves,
    Glass,
    Water,
    Sand,
    Planks,
    CoalOre,
    IronOre,
    GoldOre,
    DiamondOre,
    Lava,
    CraftingTable,
    Stick,
    Cactus,
    Snow,
    BirchLog,
    RedstoneWire,
    RedstoneTorch,
    Lever,
    RedstoneLamp,
    TNT,
    Chest,
    Furnace,
    Piston,
    StickyPiston,
    Repeater,
    Netherrack,
    SoulSand,
    Glowstone,
    NetherPortal,
    Obsidian,
    ItemDrop,
    WoodPickaxe,
    StonePickaxe,
    IronPickaxe,
    DiamondPickaxe,
    WoodAxe,
    IronSword,
    DiamondSword,
    Apple,
    Bread,
    RawPorkchop,
    CookedPorkchop,
    GoldenApple,
    Bamboo,
    EndStone,
    EndPortal,
    PurpurBlock,
    Rail,
    PoweredRail,
    WheatCrop,
    CarrotCrop,
    PotatoCrop,
    Minecart,
    Boat,
    Emerald,
    EmeraldBlock,
    EnchantingTable,
    Bookshelf,
    Sugar,
    Hopper,
    Comparator,
    StoneBricks,
    EndPortalFrame,
    IronBars,
    Spawner,
    // Flowing fluids: the number is the distance from the source (the plain Water / Lava blocks are sources).
    FlowingWater1,
    FlowingWater2,
    FlowingWater3,
    FlowingWater4,
    FlowingWater5,
    FlowingWater6,
    FlowingLava1,
    FlowingLava2,
    FlowingLava3
};

enum Direction { TOP = 0, BOTTOM, NORTH, SOUTH, EAST, WEST };

struct BlockData {
    BlockType type = BlockType::Air;

    // Highest valid BlockType value (used to validate untrusted input such as network packets).
    static constexpr BlockType LAST_TYPE = BlockType::FlowingLava3;

    static bool isWater(BlockType t) {
        return t == BlockType::Water || (t >= BlockType::FlowingWater1 && t <= BlockType::FlowingWater6);
    }
    static bool isLava(BlockType t) {
        return t == BlockType::Lava || (t >= BlockType::FlowingLava1 && t <= BlockType::FlowingLava3);
    }
    static bool isFluid(BlockType t) { return isWater(t) || isLava(t); }
    // 0 for sources, 1.. for flowing blocks, -1 for non-fluids.
    static int fluidLevel(BlockType t) {
        if (t == BlockType::Water || t == BlockType::Lava)
            return 0;
        if (isWater(t))
            return static_cast<int>(t) - static_cast<int>(BlockType::FlowingWater1) + 1;
        if (isLava(t))
            return static_cast<int>(t) - static_cast<int>(BlockType::FlowingLava1) + 1;
        return -1;
    }
    static BlockType flowingWater(int level) {
        if (level <= 0)
            return BlockType::Water;
        if (level > 6)
            level = 6;
        return static_cast<BlockType>(static_cast<int>(BlockType::FlowingWater1) + level - 1);
    }
    static BlockType flowingLava(int level) {
        if (level <= 0)
            return BlockType::Lava;
        if (level > 3)
            level = 3;
        return static_cast<BlockType>(static_cast<int>(BlockType::FlowingLava1) + level - 1);
    }

    static bool isOpaque(BlockType type) {
        return type != BlockType::Air && type != BlockType::Glass && !isFluid(type) &&
               type != BlockType::RedstoneWire && type != BlockType::RedstoneTorch && type != BlockType::NetherPortal &&
               type != BlockType::EndPortal && type != BlockType::ItemDrop && type != BlockType::Apple &&
               type != BlockType::Bread && type != BlockType::RawPorkchop && type != BlockType::CookedPorkchop &&
               type != BlockType::GoldenApple && type != BlockType::Bamboo && type != BlockType::Rail &&
               type != BlockType::PoweredRail && type != BlockType::WheatCrop && type != BlockType::CarrotCrop &&
               type != BlockType::PotatoCrop && type != BlockType::Minecart && type != BlockType::Boat &&
               type != BlockType::Sugar && type != BlockType::Hopper && type != BlockType::Comparator &&
               type != BlockType::IronBars && type != BlockType::Spawner;
    }

    static bool isSolid(BlockType type) {
        return type != BlockType::Air && !isFluid(type) && type != BlockType::RedstoneWire &&
               type != BlockType::RedstoneTorch && type != BlockType::NetherPortal && type != BlockType::EndPortal &&
               type != BlockType::ItemDrop && type != BlockType::Apple && type != BlockType::Bread &&
               type != BlockType::RawPorkchop && type != BlockType::CookedPorkchop && type != BlockType::GoldenApple &&
               type != BlockType::Bamboo && type != BlockType::Rail && type != BlockType::PoweredRail &&
               type != BlockType::WheatCrop && type != BlockType::CarrotCrop && type != BlockType::PotatoCrop &&
               type != BlockType::Minecart && type != BlockType::Boat && type != BlockType::Sugar &&
               type != BlockType::Comparator;
    }

    static glm::vec2 getTextureUV(BlockType type, Direction face) {
        int tileIndex = 0;
        if (isWater(type))
            type = BlockType::Water;
        else if (isLava(type))
            type = BlockType::Lava;

        switch (type) {
        case BlockType::Grass:
            if (face == TOP)
                tileIndex = 0;
            else if (face == BOTTOM)
                tileIndex = 2;
            else
                tileIndex = 1;
            break;
        case BlockType::Dirt:
            tileIndex = 2;
            break;
        case BlockType::Stone:
            tileIndex = 3;
            break;
        case BlockType::Bedrock:
            tileIndex = 4;
            break;
        case BlockType::OakLog:
            if (face == TOP || face == BOTTOM)
                tileIndex = 6;
            else
                tileIndex = 5;
            break;
        case BlockType::Leaves:
            tileIndex = 7;
            break;
        case BlockType::Sand:
            tileIndex = 8;
            break;
        case BlockType::Planks:
            tileIndex = 9;
            break;
        case BlockType::Glass:
            tileIndex = 10;
            break;
        case BlockType::CoalOre:
            tileIndex = 11;
            break;
        case BlockType::IronOre:
            tileIndex = 12;
            break;
        case BlockType::GoldOre:
            tileIndex = 13;
            break;
        case BlockType::DiamondOre:
            tileIndex = 14;
            break;
        case BlockType::Lava:
            tileIndex = 15;
            break;
        case BlockType::CraftingTable:
            tileIndex = 6;
            break;
        case BlockType::Stick:
            tileIndex = 9;
            break;
        case BlockType::Cactus:
            tileIndex = 7;
            break;
        case BlockType::Snow:
            tileIndex = 0;
            break;
        case BlockType::BirchLog:
            tileIndex = 5;
            break;
        case BlockType::RedstoneWire:
            tileIndex = 11;
            break;
        case BlockType::RedstoneTorch:
            tileIndex = 13;
            break;
        case BlockType::Lever:
            tileIndex = 9;
            break;
        case BlockType::RedstoneLamp:
            tileIndex = 14;
            break;
        case BlockType::Chest:
            tileIndex = 6;
            break;
        case BlockType::Furnace:
            tileIndex = 3;
            break;
        case BlockType::Piston:
        case BlockType::StickyPiston:
            tileIndex = 6;
            break;
        case BlockType::Repeater:
            tileIndex = 11;
            break;
        case BlockType::Netherrack:
            tileIndex = 15;
            break;
        case BlockType::SoulSand:
            tileIndex = 2;
            break;
        case BlockType::Glowstone:
            tileIndex = 14;
            break;
        case BlockType::NetherPortal:
            tileIndex = 15;
            break;
        case BlockType::Obsidian:
            tileIndex = 4;
            break;
        case BlockType::Apple:
        case BlockType::Bread:
        case BlockType::RawPorkchop:
        case BlockType::CookedPorkchop:
        case BlockType::GoldenApple:
            tileIndex = 12;
            break;
        case BlockType::Bamboo:
            tileIndex = 7;
            break;
        case BlockType::EndStone:
            tileIndex = 8;
            break;
        case BlockType::EndPortal:
            tileIndex = 15;
            break;
        case BlockType::PurpurBlock:
            tileIndex = 10;
            break;
        case BlockType::Rail:
        case BlockType::PoweredRail:
            tileIndex = 11;
            break;
        case BlockType::WheatCrop:
        case BlockType::CarrotCrop:
        case BlockType::PotatoCrop:
            tileIndex = 1;
            break;
        case BlockType::Minecart:
        case BlockType::Boat:
            tileIndex = 9;
            break;
        case BlockType::Emerald:
            tileIndex = 13;
            break;
        case BlockType::EmeraldBlock:
            tileIndex = 14;
            break;
        case BlockType::EnchantingTable:
            tileIndex = 6;
            break;
        case BlockType::Bookshelf:
            tileIndex = 5;
            break;
        case BlockType::Sugar:
            tileIndex = 8;
            break;
        case BlockType::Hopper:
            tileIndex = 3;
            break;
        case BlockType::Comparator:
            tileIndex = 11;
            break;
        case BlockType::StoneBricks:
            tileIndex = 3;
            break;
        case BlockType::EndPortalFrame:
            tileIndex = 8;
            break;
        case BlockType::IronBars:
            tileIndex = 12;
            break;
        case BlockType::Spawner:
            tileIndex = 10;
            break;
        default:
            tileIndex = 2;
            break;
        }

        int tileX = tileIndex % 16;
        int tileY = tileIndex / 16;
        float u = static_cast<float>(tileX) / 16.0f;
        float v = static_cast<float>(tileY) / 16.0f;

        return glm::vec2(u, v);
    }
};

} // namespace Minecraft

#endif // BLOCK_HPP
