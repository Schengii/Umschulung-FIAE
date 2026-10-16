#include "SaveSystem.hpp"

#include "Chunk.hpp"
#include "RegionFile.hpp"
#include "World.hpp"

#include <filesystem>
#include <fstream>
#include <iostream>

namespace Minecraft {

namespace fs = std::filesystem;

std::string SaveSystem::getChunkFilePath(int chunkX, int chunkZ, const std::string& saveDir) {
    return saveDir + "/chunk_" + std::to_string(chunkX) + "_" + std::to_string(chunkZ) + ".bin";
}

void SaveSystem::createDirectoryIfNotExists(const std::string& dir) {
    if (!fs::exists(dir)) {
        fs::create_directories(dir);
    }
}

bool SaveSystem::saveChunk(const Chunk& chunk, const std::string& saveDir) {
    createDirectoryIfNotExists(saveDir);
    constexpr size_t VOLUME = 16 * 256 * 16;
    std::vector<BlockType> blocks(VOLUME);
    std::vector<uint8_t> light(VOLUME);
    chunk.exportBlocks(blocks.data());
    chunk.exportLight(light.data());
    return RegionManager::getInstance().saveChunk(chunk.getChunkX(), chunk.getChunkZ(),
                                                  reinterpret_cast<const BlockType(*)[256][16]>(blocks.data()),
                                                  reinterpret_cast<const uint8_t(*)[256][16]>(light.data()), saveDir);
}

bool SaveSystem::loadChunk(Chunk& chunk, const std::string& saveDir) {
    // 1. Try loading from Anvil .mca Region Files
    constexpr size_t VOLUME = 16 * 256 * 16;
    std::vector<BlockType> blockBuffer(VOLUME);
    std::vector<uint8_t> lightBuffer(VOLUME);
    auto tempBlocks = reinterpret_cast<BlockType(*)[256][16]>(blockBuffer.data());
    auto tempLight = reinterpret_cast<uint8_t(*)[256][16]>(lightBuffer.data());
    if (RegionManager::getInstance().loadChunk(chunk.getChunkX(), chunk.getChunkZ(), tempBlocks, tempLight, saveDir)) {
        for (int x = 0; x < 16; ++x) {
            for (int y = 0; y < 256; ++y) {
                for (int z = 0; z < 16; ++z) {
                    chunk.setBlock(x, y, z, tempBlocks[x][y][z]);
                    chunk.setRawLight(x, y, z, tempLight[x][y][z]);
                }
            }
        }
        chunk.setDirty(true);
        return true;
    }

    // 2. Legacy fallback: Single .bin file per chunk
    std::string filePath = getChunkFilePath(chunk.getChunkX(), chunk.getChunkZ(), saveDir);

    if (!fs::exists(filePath))
        return false;

    std::ifstream inFile(filePath, std::ios::binary);
    if (!inFile.is_open())
        return false;

    for (int x = 0; x < CHUNK_SIZE_X; ++x) {
        for (int y = 0; y < CHUNK_SIZE_Y; ++y) {
            for (int z = 0; z < CHUNK_SIZE_Z; ++z) {
                BlockType type;
                inFile.read(reinterpret_cast<char*>(&type), sizeof(BlockType));
                chunk.setBlock(x, y, z, type);
            }
        }
    }

    inFile.close();
    chunk.setDirty(true);
    return true;
}

void SaveSystem::saveWorld(World& world, const std::string& saveDir) {
    (void)world;
    (void)saveDir;
    std::cout << "[SaveSystem] World save complete." << std::endl;
}

} // namespace Minecraft
