#ifndef REGIONFILE_HPP
#define REGIONFILE_HPP

#include <cstdint>
#include <fstream>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>
#ifndef GLM_ENABLE_EXPERIMENTAL
#define GLM_ENABLE_EXPERIMENTAL
#endif
#include "Block.hpp"

#include <glm/glm.hpp>
#include <glm/gtx/hash.hpp>

namespace Minecraft {

constexpr int REGION_CHUNKS_X = 32;
constexpr int REGION_CHUNKS_Z = 32;
constexpr int SECTOR_SIZE = 4096;

class Chunk;

class RegionFile {
public:
    RegionFile(int regionX, int regionZ, const std::string& directory);
    ~RegionFile();

    bool writeChunk(int localChunkX, int localChunkZ, const BlockType blocks[16][256][16],
                    const uint8_t light[16][256][16]);
    bool readChunk(int localChunkX, int localChunkZ, BlockType blocks[16][256][16], uint8_t light[16][256][16]);

    static std::string getRegionFilePath(int regionX, int regionZ, const std::string& directory);

private:
    [[maybe_unused]] int m_RegionX;
    [[maybe_unused]] int m_RegionZ;
    std::string m_FilePath;

    uint32_t m_Offsets[1024];
    uint32_t m_Timestamps[1024];
    std::vector<bool> m_SectorFree;

    void initHeader();
    void loadHeader();
};

class RegionManager {
public:
    static RegionManager& getInstance();

    // The returned pointer is only valid until clearCache(); prefer saveChunk/loadChunk.
    RegionFile* getRegion(int chunkX, int chunkZ, const std::string& directory = "world_saves");
    bool saveChunk(int chunkX, int chunkZ, const BlockType blocks[16][256][16], const uint8_t light[16][256][16],
                   const std::string& directory = "world_saves");
    bool loadChunk(int chunkX, int chunkZ, BlockType blocks[16][256][16], uint8_t light[16][256][16],
                   const std::string& directory = "world_saves");
    void clearCache();

private:
    RegionManager() = default;
    RegionFile* getRegionLocked(int chunkX, int chunkZ, const std::string& directory);

    // Region files are shared by chunk worker threads and the main thread, so every
    // access to the cache and to the underlying files is serialized by this mutex.
    std::recursive_mutex m_Mutex;
    std::unordered_map<std::string, std::unique_ptr<RegionFile>> m_Regions;
};

} // namespace Minecraft

#endif // REGIONFILE_HPP
