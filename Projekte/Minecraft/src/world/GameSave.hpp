#ifndef GAMESAVE_HPP
#define GAMESAVE_HPP

#include "../inventory/ItemStack.hpp"
#include "FurnaceBlock.hpp"

#include <array>
#include <cstdint>
#include <glm/glm.hpp>
#include <string>
#include <utility>
#include <vector>

namespace Minecraft {

// A mob as stored in a save file (transient state such as paths or animation timers is rebuilt).
struct SavedMob {
    uint8_t type = 0; // MobType as integer
    glm::vec3 position{0.0f};
    float health = 20.0f;
    float maxHealth = 20.0f;
    float yaw = 0.0f;
    float age = 0.0f;
    bool saddled = false;
};

// Everything about a running game that does not live in the chunk files:
// the player, the clock and the contents of block entities (chests, furnaces).
struct GameSaveData {
    uint32_t seed = 0;
    int dimension = 0; // DimensionType as int
    glm::vec3 position{0.0f};
    float yaw = -90.0f;
    float pitch = 0.0f;
    float health = 20.0f;
    float hunger = 20.0f;
    float timeTicks = 6000.0f;
    int selectedSlot = 0;
    bool flying = false;

    std::vector<ItemStack> inventory; // 36 slots
    std::array<ItemStack, 4> armor{};
    std::vector<std::pair<glm::ivec3, std::vector<ItemStack>>> chests;
    std::vector<std::pair<glm::ivec3, FurnaceData>> furnaces;
    std::vector<SavedMob> mobs; // mobs of the dimension the player is in
};

class GameSave {
public:
    static constexpr uint32_t FORMAT_VERSION = 2; // v1 files (no mobs) are still readable

    static std::string filePath(const std::string& saveDir);
    static bool exists(const std::string& saveDir);
    // Writes atomically (temp file + rename) so a crash never leaves a half-written save.
    static bool write(const GameSaveData& data, const std::string& saveDir);
    // Returns false (leaving `out` unspecified) for missing, truncated or foreign files.
    static bool read(GameSaveData& out, const std::string& saveDir);
};

} // namespace Minecraft

#endif // GAMESAVE_HPP
