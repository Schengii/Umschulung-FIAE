#include "GameSave.hpp"

#include "../net/NetworkManager.hpp"

#include <chrono>
#include <cmath>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <thread>
#include <type_traits>

namespace Minecraft {

namespace fs = std::filesystem;

namespace {

constexpr char MAGIC[4] = {'M', 'C', 'G', 'S'};
constexpr uint32_t MAX_ENTRIES = 1u << 20;
constexpr uint32_t MAX_SLOTS = 4096;
constexpr int32_t MAX_STACK = 1024;
constexpr int32_t MAX_DIMENSION = 2; // DimensionType::TheEnd

bool finite(float v) {
    return std::isfinite(v);
}
bool finite(const glm::vec3& v) {
    return finite(v.x) && finite(v.y) && finite(v.z);
}

class Writer {
public:
    explicit Writer(std::ofstream& out) : m_Out(out) {}
    template <typename T> void put(const T& v) {
        static_assert(std::is_trivially_copyable_v<T>);
        m_Out.write(reinterpret_cast<const char*>(&v), sizeof(T));
    }
    void putStack(const ItemStack& s) {
        put(static_cast<uint8_t>(s.type));
        put(static_cast<int32_t>(s.count));
        put(static_cast<int32_t>(s.maxStackSize));
        put(static_cast<int32_t>(s.durability));
        put(static_cast<int32_t>(s.maxDurability));
        put(static_cast<int32_t>(s.enchantmentLevel));
        put(static_cast<int32_t>(s.enchantmentType));
    }
    void putStacks(const std::vector<ItemStack>& v) {
        put(static_cast<uint32_t>(v.size()));
        for (const ItemStack& s : v)
            putStack(s);
    }
    void putPos(const glm::ivec3& p) {
        put(p.x);
        put(p.y);
        put(p.z);
    }

private:
    std::ofstream& m_Out;
};

class Reader {
public:
    explicit Reader(std::ifstream& in) : m_In(in) {}
    template <typename T> bool get(T& v) {
        static_assert(std::is_trivially_copyable_v<T>);
        m_In.read(reinterpret_cast<char*>(&v), sizeof(T));
        return static_cast<bool>(m_In);
    }
    bool getStack(ItemStack& s) {
        uint8_t type = 0;
        int32_t count, maxStack, dur, maxDur, enchLvl, enchType;
        if (!get(type) || !get(count) || !get(maxStack) || !get(dur) || !get(maxDur) || !get(enchLvl) || !get(enchType))
            return false;
        // Reject values no legitimate save can contain (corrupt or hand-edited files).
        if (!NetworkManager::isValidBlockType(type))
            return false;
        if (count < 0 || count > MAX_STACK || maxStack < 1 || maxStack > MAX_STACK)
            return false;
        s.type = static_cast<BlockType>(type);
        s.count = count;
        s.maxStackSize = maxStack;
        s.durability = dur;
        s.maxDurability = maxDur;
        s.enchantmentLevel = enchLvl;
        s.enchantmentType = enchType;
        return true;
    }
    bool getStacks(std::vector<ItemStack>& v) {
        uint32_t n = 0;
        if (!get(n) || n > MAX_SLOTS)
            return false;
        v.assign(n, ItemStack{});
        for (ItemStack& s : v) {
            if (!getStack(s))
                return false;
        }
        return true;
    }
    bool getPos(glm::ivec3& p) { return get(p.x) && get(p.y) && get(p.z); }

private:
    std::ifstream& m_In;
};

} // namespace

std::string GameSave::filePath(const std::string& saveDir) {
    return saveDir + "/game.dat";
}

bool GameSave::exists(const std::string& saveDir) {
    return fs::exists(filePath(saveDir));
}

bool GameSave::write(const GameSaveData& d, const std::string& saveDir) {
    std::error_code ec;
    fs::create_directories(saveDir, ec);

    const std::string finalPath = filePath(saveDir);
    const std::string tmpPath = finalPath + ".tmp";
    {
        std::ofstream out(tmpPath, std::ios::binary | std::ios::trunc);
        if (!out.is_open())
            return false;
        Writer w(out);
        out.write(MAGIC, sizeof(MAGIC));
        w.put(FORMAT_VERSION);
        w.put(d.seed);
        w.put(static_cast<int32_t>(d.dimension));
        w.put(d.position.x);
        w.put(d.position.y);
        w.put(d.position.z);
        w.put(d.yaw);
        w.put(d.pitch);
        w.put(d.health);
        w.put(d.hunger);
        w.put(d.timeTicks);
        w.put(static_cast<int32_t>(d.selectedSlot));
        w.put(static_cast<uint8_t>(d.flying ? 1 : 0));

        w.putStacks(d.inventory);
        for (const ItemStack& s : d.armor)
            w.putStack(s);

        w.put(static_cast<uint32_t>(d.chests.size()));
        for (const auto& [pos, slots] : d.chests) {
            w.putPos(pos);
            w.putStacks(slots);
        }
        w.put(static_cast<uint32_t>(d.furnaces.size()));
        for (const auto& [pos, f] : d.furnaces) {
            w.putPos(pos);
            w.putStack(f.input);
            w.putStack(f.fuel);
            w.putStack(f.output);
            w.put(f.cookTimer);
            w.put(f.cookTimeMax);
            w.put(f.fuelBurnTimer);
        }
        w.put(static_cast<uint32_t>(d.mobs.size()));
        for (const SavedMob& m : d.mobs) {
            w.put(m.type);
            w.put(m.position.x);
            w.put(m.position.y);
            w.put(m.position.z);
            w.put(m.health);
            w.put(m.maxHealth);
            w.put(m.yaw);
            w.put(m.age);
            w.put(static_cast<uint8_t>(m.saddled ? 1 : 0));
        }
        out.flush();
        if (!out)
            return false;
    }

    // rename() replaces an existing file in one step, so there is never a moment without a valid save.
    // On Windows the target can be locked for a moment by a virus scanner or indexer, so retry briefly.
    for (int attempt = 0; attempt < 10; ++attempt) {
        ec.clear();
        fs::rename(tmpPath, finalPath, ec);
        if (!ec)
            return true;
        std::this_thread::sleep_for(std::chrono::milliseconds(20));
    }
    return false;
}

bool GameSave::read(GameSaveData& d, const std::string& saveDir) {
    std::ifstream in(filePath(saveDir), std::ios::binary);
    if (!in.is_open())
        return false;
    Reader r(in);

    char magic[4] = {};
    in.read(magic, sizeof(magic));
    if (!in || std::memcmp(magic, MAGIC, sizeof(MAGIC)) != 0)
        return false;

    uint32_t version = 0;
    if (!r.get(version) || version < 1 || version > FORMAT_VERSION)
        return false;

    GameSaveData tmp;
    int32_t dimension = 0, selected = 0;
    uint8_t flying = 0;
    if (!r.get(tmp.seed) || !r.get(dimension) || !r.get(tmp.position.x) || !r.get(tmp.position.y) ||
        !r.get(tmp.position.z) || !r.get(tmp.yaw) || !r.get(tmp.pitch) || !r.get(tmp.health) || !r.get(tmp.hunger) ||
        !r.get(tmp.timeTicks) || !r.get(selected) || !r.get(flying))
        return false;
    if (dimension < 0 || dimension > MAX_DIMENSION || selected < 0 || selected >= 9)
        return false;
    if (!finite(tmp.position) || !finite(tmp.yaw) || !finite(tmp.pitch) || !finite(tmp.health) || !finite(tmp.hunger) ||
        !finite(tmp.timeTicks))
        return false;
    tmp.dimension = dimension;
    tmp.selectedSlot = selected;
    tmp.flying = flying != 0;

    if (!r.getStacks(tmp.inventory))
        return false;
    for (ItemStack& s : tmp.armor) {
        if (!r.getStack(s))
            return false;
    }

    uint32_t chestCount = 0;
    if (!r.get(chestCount) || chestCount > MAX_ENTRIES)
        return false;
    for (uint32_t i = 0; i < chestCount; ++i) {
        glm::ivec3 pos;
        std::vector<ItemStack> slots;
        if (!r.getPos(pos) || !r.getStacks(slots))
            return false;
        tmp.chests.emplace_back(pos, std::move(slots));
    }

    uint32_t furnaceCount = 0;
    if (!r.get(furnaceCount) || furnaceCount > MAX_ENTRIES)
        return false;
    for (uint32_t i = 0; i < furnaceCount; ++i) {
        glm::ivec3 pos;
        FurnaceData f;
        if (!r.getPos(pos) || !r.getStack(f.input) || !r.getStack(f.fuel) || !r.getStack(f.output) ||
            !r.get(f.cookTimer) || !r.get(f.cookTimeMax) || !r.get(f.fuelBurnTimer))
            return false;
        tmp.furnaces.emplace_back(pos, f);
    }

    if (version >= 2) {
        uint32_t mobCount = 0;
        if (!r.get(mobCount) || mobCount > MAX_ENTRIES)
            return false;
        for (uint32_t i = 0; i < mobCount; ++i) {
            SavedMob m;
            uint8_t saddled = 0;
            if (!r.get(m.type) || !r.get(m.position.x) || !r.get(m.position.y) || !r.get(m.position.z) ||
                !r.get(m.health) || !r.get(m.maxHealth) || !r.get(m.yaw) || !r.get(m.age) || !r.get(saddled))
                return false;
            if (!finite(m.position) || !finite(m.health) || !finite(m.maxHealth) || !finite(m.yaw) || !finite(m.age))
                return false;
            m.saddled = saddled != 0;
            tmp.mobs.push_back(m);
        }
    }

    d = std::move(tmp);
    return true;
}

} // namespace Minecraft
