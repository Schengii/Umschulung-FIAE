#include "FluidEngine.hpp"

#include "Block.hpp"
#include "World.hpp"

#include <algorithm>
#include <cmath>
#include <tuple>
#include <unordered_map>
#include <vector>

namespace Minecraft {

namespace {

constexpr int WATER_MAX_LEVEL = 6;   // a source reaches 6 blocks over flat ground
constexpr int LAVA_MAX_LEVEL = 3;    // lava creeps much less far
constexpr int LAVA_TICK_DIVISOR = 6; // lava flows 6x slower than water
constexpr size_t MAX_CHANGES_PER_TICK = 256;

struct Cell {
    int x, y, z;
    bool operator==(const Cell& o) const { return x == o.x && y == o.y && z == o.z; }
};

struct CellHash {
    size_t operator()(const Cell& c) const {
        uint64_t k = (static_cast<uint64_t>(static_cast<uint32_t>(c.x)) * 73856093ULL) ^
                     (static_cast<uint64_t>(static_cast<uint32_t>(c.y)) * 19349663ULL) ^
                     (static_cast<uint64_t>(static_cast<uint32_t>(c.z)) * 83492791ULL);
        k ^= k >> 29;
        return static_cast<size_t>(k);
    }
};

struct PendingChange {
    BlockType type;
    int priority; // lower wins when several rules target the same cell
};

unsigned long long g_Tick = 0;

const glm::ivec3 HORIZONTAL[4] = {{1, 0, 0}, {-1, 0, 0}, {0, 0, 1}, {0, 0, -1}};

bool sameKind(BlockType a, BlockType b) {
    return (BlockData::isWater(a) && BlockData::isWater(b)) || (BlockData::isLava(a) && BlockData::isLava(b));
}

BlockType makeFluid(bool water, int level) {
    return water ? BlockData::flowingWater(level) : BlockData::flowingLava(level);
}

// Is this flowing cell still fed by something? (fluid above it, or a stronger fluid next to it that spreads)
bool isSupported(World& world, int x, int y, int z, BlockType self, int level) {
    if (sameKind(world.getBlock(x, y + 1, z), self))
        return true;
    for (const auto& d : HORIZONTAL) {
        BlockType n = world.getBlock(x + d.x, y, z + d.z);
        if (!sameKind(n, self))
            continue;
        int nl = BlockData::fluidLevel(n);
        if (nl >= level)
            continue;
        BlockType below = world.getBlock(x + d.x, y - 1, z + d.z);
        if (below != BlockType::Air && !BlockData::isFluid(below))
            return true; // neighbour spreads over solid ground
        if (sameKind(below, self))
            return true; // neighbour stands on a pool
    }
    return false;
}

} // namespace

void FluidEngine::updateFluids(World& world, const glm::vec3& playerPos) {
    const bool lavaTick = (g_Tick++ % LAVA_TICK_DIVISOR) == 0;

    int px = static_cast<int>(std::floor(playerPos.x));
    int py = static_cast<int>(std::floor(playerPos.y));
    int pz = static_cast<int>(std::floor(playerPos.z));
    const int range = 24; // Update fluids within 24 blocks of the player

    std::unordered_map<Cell, PendingChange, CellHash> changes;
    auto propose = [&](int x, int y, int z, BlockType type, int priority) {
        auto it = changes.find({x, y, z});
        if (it == changes.end() || priority < it->second.priority) {
            changes[{x, y, z}] = {type, priority};
        }
    };

    for (int x = px - range; x <= px + range; ++x) {
        for (int y = std::max(1, py - 16); y <= std::min(250, py + 16); ++y) {
            for (int z = pz - range; z <= pz + range; ++z) {
                BlockType current = world.getBlock(x, y, z);
                const bool water = BlockData::isWater(current);
                const bool lava = BlockData::isLava(current);
                if (!water && !lava) {
                    // Air above solid ground between two water sources fills up (infinite water)
                    continue;
                }
                if (lava && !lavaTick)
                    continue;

                const int level = BlockData::fluidLevel(current);
                const int maxLevel = water ? WATER_MAX_LEVEL : LAVA_MAX_LEVEL;

                // 1. Water meets lava: lava source -> obsidian, flowing lava -> stone
                if (lava) {
                    bool touchesWater = BlockData::isWater(world.getBlock(x, y + 1, z));
                    for (const auto& d : HORIZONTAL) {
                        if (BlockData::isWater(world.getBlock(x + d.x, y, z + d.z)))
                            touchesWater = true;
                    }
                    if (touchesWater) {
                        propose(x, y, z, level == 0 ? BlockType::Obsidian : BlockType::Stone, 0);
                        continue;
                    }
                }

                // 1b. Water touching lava (from any side or from above) cools it down, even while falling
                if (water) {
                    for (const auto& d : {glm::ivec3(1, 0, 0), glm::ivec3(-1, 0, 0), glm::ivec3(0, 0, 1),
                                          glm::ivec3(0, 0, -1), glm::ivec3(0, -1, 0)}) {
                        BlockType n = world.getBlock(x + d.x, y + d.y, z + d.z);
                        if (BlockData::isLava(n)) {
                            propose(x + d.x, y + d.y, z + d.z,
                                    BlockData::fluidLevel(n) == 0 ? BlockType::Obsidian : BlockType::Stone, 0);
                        }
                    }
                }

                // 2. Flowing cells without a feed dry up one step at a time
                if (level > 0 && !isSupported(world, x, y, z, current, level)) {
                    propose(x, y, z, BlockType::Air, 5);
                    continue;
                }

                // 3. Fall downwards
                BlockType below = world.getBlock(x, y - 1, z);
                if (below == BlockType::Air) {
                    propose(x, y - 1, z, makeFluid(water, 1), 1);
                    continue;
                }
                // Replace the weaker fluid of the other kind handled above; stop on fluids of the same kind
                if (BlockData::isFluid(below)) {
                    if (sameKind(below, current) && BlockData::fluidLevel(below) > 1) {
                        propose(x, y - 1, z, makeFluid(water, 1), 1); // keep falling columns at full strength
                    }
                    continue;
                }

                // 4. Spread sideways over solid ground
                if (level < maxLevel) {
                    for (const auto& d : HORIZONTAL) {
                        int nx = x + d.x, nz = z + d.z;
                        BlockType side = world.getBlock(nx, y, nz);
                        if (side == BlockType::Air) {
                            propose(nx, y, nz, makeFluid(water, level + 1), 2 + level);
                        } else if (sameKind(side, current)) {
                            int sl = BlockData::fluidLevel(side);
                            if (sl > level + 1)
                                propose(nx, y, nz, makeFluid(water, level + 1), 2 + level); // shorter path found
                        } else if (water && BlockData::isLava(side)) {
                            propose(nx, y, nz,
                                    BlockData::fluidLevel(side) == 0 ? BlockType::Obsidian : BlockType::Stone, 0);
                        }
                    }
                }
            }
        }
    }

    // Infinite water: a non-source cell on solid ground next to >= 2 water sources becomes a source.
    for (int x = px - range; x <= px + range; ++x) {
        for (int y = std::max(1, py - 16); y <= std::min(250, py + 16); ++y) {
            for (int z = pz - range; z <= pz + range; ++z) {
                BlockType here = world.getBlock(x, y, z);
                if (here != BlockType::Air && !(BlockData::isWater(here) && BlockData::fluidLevel(here) > 0))
                    continue;
                BlockType floor = world.getBlock(x, y - 1, z);
                if (!BlockData::isSolid(floor))
                    continue;
                int sources = 0;
                for (const auto& d : HORIZONTAL) {
                    if (world.getBlock(x + d.x, y, z + d.z) == BlockType::Water)
                        ++sources;
                }
                if (sources >= 2)
                    propose(x, y, z, BlockType::Water, 0);
            }
        }
    }

    // Apply nearest changes first (limit batch size for smooth performance)
    std::vector<std::pair<Cell, PendingChange>> ordered(changes.begin(), changes.end());
    std::sort(ordered.begin(), ordered.end(), [&](const auto& a, const auto& b) {
        float da = glm::distance(playerPos, glm::vec3(a.first.x, a.first.y, a.first.z));
        float db = glm::distance(playerPos, glm::vec3(b.first.x, b.first.y, b.first.z));
        if (da != db)
            return da < db;
        return std::tie(a.first.x, a.first.y, a.first.z) < std::tie(b.first.x, b.first.y, b.first.z);
    });
    size_t applyCount = std::min(ordered.size(), MAX_CHANGES_PER_TICK);
    for (size_t i = 0; i < applyCount; ++i) {
        const Cell& c = ordered[i].first;
        world.setBlock(c.x, c.y, c.z, ordered[i].second.type);
    }
}

void FluidEngine::resetTimers() {
    g_Tick = 0;
}

int FluidEngine::getFluidLevel(World& world, int x, int y, int z) {
    BlockType current = world.getBlock(x, y, z);
    if (!BlockData::isFluid(current))
        return 0;
    if (sameKind(world.getBlock(x, y + 1, z), current))
        return 0; // Submerged under another fluid block
    return std::max(0, BlockData::fluidLevel(current));
}

float FluidEngine::getFluidHeight(World& world, int x, int y, int z) {
    BlockType current = world.getBlock(x, y, z);
    if (!BlockData::isFluid(current))
        return 0.0f;
    if (sameKind(world.getBlock(x, y + 1, z), current))
        return 1.0f;

    int level = getFluidLevel(world, x, y, z);
    float h = 1.0f - static_cast<float>(level) * 0.12f;
    return std::clamp(h, 0.15f, 1.0f);
}

} // namespace Minecraft
