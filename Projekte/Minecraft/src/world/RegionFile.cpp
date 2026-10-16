#include "RegionFile.hpp"

#include <cmath>
#include <cstring>
#include <filesystem>
#include <iostream>

namespace Minecraft {

namespace fs = std::filesystem;

std::string RegionFile::getRegionFilePath(int regionX, int regionZ, const std::string& directory) {
    return directory + "/r." + std::to_string(regionX) + "." + std::to_string(regionZ) + ".mca";
}

RegionFile::RegionFile(int regionX, int regionZ, const std::string& directory)
    : m_RegionX(regionX), m_RegionZ(regionZ) {
    m_FilePath = getRegionFilePath(regionX, regionZ, directory);
    std::memset(m_Offsets, 0, sizeof(m_Offsets));
    std::memset(m_Timestamps, 0, sizeof(m_Timestamps));
    m_SectorFree.resize(2, false); // First 2 sectors reserved for header tables

    // The file (and its directory) is only created by the first write; merely looking up a
    // chunk in a region that was never saved must not litter the save folder.
    if (fs::exists(m_FilePath)) {
        loadHeader();
    }
}

RegionFile::~RegionFile() = default;

void RegionFile::initHeader() {
    std::ofstream outFile(m_FilePath, std::ios::binary);
    if (!outFile.is_open())
        return;

    outFile.write(reinterpret_cast<const char*>(m_Offsets), sizeof(m_Offsets));
    outFile.write(reinterpret_cast<const char*>(m_Timestamps), sizeof(m_Timestamps));
    outFile.close();
}

void RegionFile::loadHeader() {
    std::ifstream inFile(m_FilePath, std::ios::binary);
    if (!inFile.is_open())
        return;

    inFile.read(reinterpret_cast<char*>(m_Offsets), sizeof(m_Offsets));
    inFile.read(reinterpret_cast<char*>(m_Timestamps), sizeof(m_Timestamps));
    inFile.close();

    // Determine allocated sectors
    size_t fileSize = fs::file_size(m_FilePath);
    size_t totalSectors = (fileSize + SECTOR_SIZE - 1) / SECTOR_SIZE;
    if (totalSectors < 2)
        totalSectors = 2;
    m_SectorFree.assign(totalSectors, true);
    m_SectorFree[0] = false; // Header
    m_SectorFree[1] = false; // Header

    for (int i = 0; i < 1024; ++i) {
        uint32_t val = m_Offsets[i];
        uint32_t sectorOffset = val >> 8;
        uint32_t sectorCount = val & 0xFF;
        if (sectorOffset != 0 && sectorOffset + sectorCount <= m_SectorFree.size()) {
            for (uint32_t s = 0; s < sectorCount; ++s) {
                m_SectorFree[sectorOffset + s] = false;
            }
        }
    }
}

bool RegionFile::writeChunk(int localChunkX, int localChunkZ, const BlockType blocks[16][256][16],
                            const uint8_t light[16][256][16]) {
    if (localChunkX < 0 || localChunkX >= 32 || localChunkZ < 0 || localChunkZ >= 32)
        return false;

    int chunkIndex = localChunkX + localChunkZ * 32;

    if (!fs::exists(m_FilePath)) {
        std::error_code ec;
        fs::create_directories(fs::path(m_FilePath).parent_path(), ec);
        initHeader();
    }

    // Package payload: blocks + light
    std::vector<char> payload;
    size_t dataSize = sizeof(BlockType) * 16 * 256 * 16 + sizeof(uint8_t) * 16 * 256 * 16;
    payload.resize(dataSize);

    std::memcpy(payload.data(), blocks, sizeof(BlockType) * 16 * 256 * 16);
    std::memcpy(payload.data() + sizeof(BlockType) * 16 * 256 * 16, light, sizeof(uint8_t) * 16 * 256 * 16);

    uint32_t totalBytes = static_cast<uint32_t>(4 + payload.size());
    uint32_t sectorsNeeded = (totalBytes + SECTOR_SIZE - 1) / SECTOR_SIZE;

    // Find continuous free sectors
    uint32_t sectorOffset = 0;
    uint32_t freeRun = 0;

    for (size_t s = 2; s < m_SectorFree.size(); ++s) {
        if (m_SectorFree[s]) {
            if (freeRun == 0)
                sectorOffset = static_cast<uint32_t>(s);
            freeRun++;
            if (freeRun >= sectorsNeeded)
                break;
        } else {
            freeRun = 0;
        }
    }

    if (freeRun < sectorsNeeded) {
        sectorOffset = static_cast<uint32_t>(m_SectorFree.size());
        m_SectorFree.resize(sectorOffset + sectorsNeeded, true);
    }

    // The old sectors stay allocated while the new data is written, so a failed or interrupted
    // write leaves the previous copy of the chunk intact (write new, then swap the header entry).
    for (uint32_t s = 0; s < sectorsNeeded; ++s) {
        m_SectorFree[sectorOffset + s] = false;
    }

    std::fstream file(m_FilePath, std::ios::in | std::ios::out | std::ios::binary);
    if (!file.is_open()) {
        for (uint32_t s = 0; s < sectorsNeeded; ++s)
            m_SectorFree[sectorOffset + s] = true;
        return false;
    }

    // Write chunk payload at the new sector offset first...
    file.seekp(static_cast<std::streamoff>(sectorOffset) * SECTOR_SIZE);
    uint32_t len = static_cast<uint32_t>(payload.size());
    file.write(reinterpret_cast<const char*>(&len), sizeof(uint32_t));
    file.write(payload.data(), static_cast<std::streamsize>(payload.size()));
    file.flush();
    if (!file) {
        for (uint32_t s = 0; s < sectorsNeeded; ++s)
            m_SectorFree[sectorOffset + s] = true;
        return false;
    }

    // ...then point the header at it.
    const uint32_t oldVal = m_Offsets[chunkIndex];
    const uint32_t newVal = (sectorOffset << 8) | (sectorsNeeded & 0xFF);
    file.seekp(static_cast<std::streamoff>(chunkIndex) * sizeof(uint32_t));
    file.write(reinterpret_cast<const char*>(&newVal), sizeof(uint32_t));
    file.flush();
    if (!file) {
        for (uint32_t s = 0; s < sectorsNeeded; ++s)
            m_SectorFree[sectorOffset + s] = true;
        return false;
    }
    m_Offsets[chunkIndex] = newVal;

    // Only now are the previous sectors of this chunk unused.
    const uint32_t oldOffset = oldVal >> 8;
    const uint32_t oldCount = oldVal & 0xFF;
    if (oldOffset >= 2) {
        for (uint32_t s = 0; s < oldCount && oldOffset + s < m_SectorFree.size(); ++s) {
            m_SectorFree[oldOffset + s] = true;
        }
    }
    return true;
}

bool RegionFile::readChunk(int localChunkX, int localChunkZ, BlockType blocks[16][256][16],
                           uint8_t light[16][256][16]) {
    if (localChunkX < 0 || localChunkX >= 32 || localChunkZ < 0 || localChunkZ >= 32)
        return false;

    int chunkIndex = localChunkX + localChunkZ * 32;
    uint32_t val = m_Offsets[chunkIndex];
    uint32_t sectorOffset = val >> 8;

    if (sectorOffset == 0)
        return false;
    if (!fs::exists(m_FilePath))
        return false;

    std::ifstream inFile(m_FilePath, std::ios::binary);
    if (!inFile.is_open())
        return false;

    inFile.seekg(sectorOffset * SECTOR_SIZE);
    uint32_t length = 0;
    inFile.read(reinterpret_cast<char*>(&length), sizeof(uint32_t));

    size_t expectedSize = sizeof(BlockType) * 16 * 256 * 16 + sizeof(uint8_t) * 16 * 256 * 16;
    if (length != expectedSize) {
        inFile.close();
        return false;
    }

    inFile.read(reinterpret_cast<char*>(blocks), sizeof(BlockType) * 16 * 256 * 16);
    inFile.read(reinterpret_cast<char*>(light), sizeof(uint8_t) * 16 * 256 * 16);

    inFile.close();
    return true;
}

RegionManager& RegionManager::getInstance() {
    static RegionManager instance;
    return instance;
}

RegionFile* RegionManager::getRegion(int chunkX, int chunkZ, const std::string& directory) {
    std::lock_guard<std::recursive_mutex> lock(m_Mutex);
    return getRegionLocked(chunkX, chunkZ, directory);
}

RegionFile* RegionManager::getRegionLocked(int chunkX, int chunkZ, const std::string& directory) {
    // Floor division on integers (chunk coordinates can be negative).
    int regionX = chunkX >= 0 ? chunkX / 32 : -((-chunkX + 31) / 32);
    int regionZ = chunkZ >= 0 ? chunkZ / 32 : -((-chunkZ + 31) / 32);

    // Regions are keyed by file path so that different dimensions / worlds never share a cache entry.
    std::string key = RegionFile::getRegionFilePath(regionX, regionZ, directory);
    auto it = m_Regions.find(key);
    if (it != m_Regions.end()) {
        return it->second.get();
    }

    auto& slot = m_Regions[key];
    slot = std::make_unique<RegionFile>(regionX, regionZ, directory);
    return slot.get();
}

bool RegionManager::saveChunk(int chunkX, int chunkZ, const BlockType blocks[16][256][16],
                              const uint8_t light[16][256][16], const std::string& directory) {
    std::lock_guard<std::recursive_mutex> lock(m_Mutex);
    RegionFile* reg = getRegionLocked(chunkX, chunkZ, directory);
    if (!reg)
        return false;

    int localX = (chunkX % 32 + 32) % 32;
    int localZ = (chunkZ % 32 + 32) % 32;
    return reg->writeChunk(localX, localZ, blocks, light);
}

bool RegionManager::loadChunk(int chunkX, int chunkZ, BlockType blocks[16][256][16], uint8_t light[16][256][16],
                              const std::string& directory) {
    std::lock_guard<std::recursive_mutex> lock(m_Mutex);
    RegionFile* reg = getRegionLocked(chunkX, chunkZ, directory);
    if (!reg)
        return false;

    int localX = (chunkX % 32 + 32) % 32;
    int localZ = (chunkZ % 32 + 32) % 32;
    return reg->readChunk(localX, localZ, blocks, light);
}

void RegionManager::clearCache() {
    std::lock_guard<std::recursive_mutex> lock(m_Mutex);
    m_Regions.clear();
}

} // namespace Minecraft
