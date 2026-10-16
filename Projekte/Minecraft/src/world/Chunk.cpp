#include "Chunk.hpp"

#include "../vendor/FastNoiseLite.h"
#include "Biome.hpp"
#include "ChunkMesh.hpp"
#include "LightEngine.hpp"
#include "SaveSystem.hpp"

#include <cmath>
#include <cstring>
#include <utility>

namespace Minecraft {

Chunk::Chunk(int chunkX, int chunkZ, uint32_t seed, std::string saveDir)
    : m_ChunkX(chunkX), m_ChunkZ(chunkZ), m_Seed(seed), m_SaveDir(std::move(saveDir)) {
    m_Mesh = std::make_unique<ChunkMesh>();
    for (int sy = 0; sy < 16; ++sy) {
        m_Sections[sy] = std::make_unique<ChunkSection>(sy);
    }

    if (!SaveSystem::loadChunk(*this, m_SaveDir)) {
        // Terrain is deterministic for a given seed, so a freshly generated chunk
        // only has to be persisted once a player (or a structure) modifies it.
        generateTerrain();
    }
    compactStorage();
    m_NeedsSave = false;
}

Chunk::~Chunk() = default;

bool Chunk::saveIfNeeded() {
    if (!m_NeedsSave)
        return true;
    if (!SaveSystem::saveChunk(*this, m_SaveDir))
        return false;
    m_NeedsSave = false;
    return true;
}

BlockType Chunk::getBlock(int x, int y, int z) const {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z) {
        return BlockType::Air;
    }
    return peekBlock(x, y, z);
}

void Chunk::setBlock(int x, int y, int z, BlockType type) {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z)
        return;
    BlockType old = peekBlock(x, y, z);
    putBlock(x, y, z, type);
    m_IsDirty = true;
    m_DirtySections = static_cast<uint16_t>(m_DirtySections | sectionMaskForY(y));
    m_NeedsSave = true;

    int sy = y / 16;
    if (sy >= 0 && sy < 16 && m_Sections[sy]) {
        m_Sections[sy]->notifyBlockChange(old, type);
    }
}

int Chunk::getSunlight(int x, int y, int z) const {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z)
        return 15;
    return (m_Light.get(x, y, z) >> 4) & 0x0F;
}

void Chunk::setSunlight(int x, int y, int z, int val) {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z)
        return;
    uint8_t cur = m_Light.get(x, y, z) & 0x0F;
    m_Light.set(x, y, z, static_cast<uint8_t>((static_cast<uint8_t>(val & 0x0F) << 4) | cur));
}

int Chunk::getBlocklight(int x, int y, int z) const {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z)
        return 0;
    return m_Light.get(x, y, z) & 0x0F;
}

void Chunk::setBlocklight(int x, int y, int z, int val) {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z)
        return;
    uint8_t sun = m_Light.get(x, y, z) & 0xF0;
    m_Light.set(x, y, z, static_cast<uint8_t>(sun | static_cast<uint8_t>(val & 0x0F)));
}

uint8_t Chunk::getRawLight(int x, int y, int z) const {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z)
        return 0xFF;
    return m_Light.get(x, y, z);
}

void Chunk::setRawLight(int x, int y, int z, uint8_t val) {
    if (x < 0 || x >= CHUNK_SIZE_X || y < 0 || y >= CHUNK_SIZE_Y || z < 0 || z >= CHUNK_SIZE_Z)
        return;
    m_Light.set(x, y, z, val);
}

void Chunk::generateTerrain() {
    const int seed = static_cast<int>(m_Seed);
    FastNoiseLite heightNoise(seed + 1337);
    heightNoise.SetNoiseType(FastNoiseLite::NoiseType_OpenSimplex2);
    heightNoise.SetFrequency(0.015f);

    FastNoiseLite tempNoise(seed + 5555);
    tempNoise.SetFrequency(0.005f);

    FastNoiseLite moistureNoise(seed + 7777);
    moistureNoise.SetFrequency(0.005f);

    FastNoiseLite caveNoise(seed + 4242);
    caveNoise.SetNoiseType(FastNoiseLite::NoiseType_OpenSimplex2);
    caveNoise.SetFrequency(0.04f);

    FastNoiseLite oreNoise(seed + 9999);
    oreNoise.SetNoiseType(FastNoiseLite::NoiseType_Cellular);
    oreNoise.SetFrequency(0.1f);

    // Biome and surface height of a world column; pure function of (seed, x, z),
    // which lets neighbouring chunks agree on features that cross chunk borders.
    struct Column {
        BiomeType biome;
        int height;
    };
    auto sampleColumn = [&](int wx, int wz) {
        float fx = static_cast<float>(wx);
        float fz = static_cast<float>(wz);
        BiomeType biome = Biome::getBiome(tempNoise.GetNoise(fx, fz), moistureNoise.GetNoise(fx, fz));
        float heightMultiplier = (biome == BiomeType::Mountains) ? 35.0f : 20.0f;
        int height = static_cast<int>(55 + heightNoise.GetNoise(fx, fz) * heightMultiplier);
        if (height >= CHUNK_SIZE_Y - 10)
            height = CHUNK_SIZE_Y - 10;
        return Column{biome, height};
    };

    for (int x = 0; x < CHUNK_SIZE_X; ++x) {
        for (int z = 0; z < CHUNK_SIZE_Z; ++z) {
            int wx = m_ChunkX * CHUNK_SIZE_X + x;
            int wz = m_ChunkZ * CHUNK_SIZE_Z + z;
            float worldX = static_cast<float>(wx);
            float worldZ = static_cast<float>(wz);

            Column col = sampleColumn(wx, wz);
            int height = col.height;

            BlockType topBlock = Biome::getSurfaceBlock(col.biome, height);
            BlockType subBlock = Biome::getSubSurfaceBlock(col.biome);

            for (int y = 0; y < CHUNK_SIZE_Y; ++y) {
                if (y == 0) {
                    putBlock(x, y, z, BlockType::Bedrock);
                } else if (y < height - 4) {
                    float caveVal = caveNoise.GetNoise(worldX, static_cast<float>(y), worldZ);
                    if (caveVal > 0.42f) {
                        if (y < 10) {
                            putBlock(x, y, z, BlockType::Lava);
                        } else {
                            putBlock(x, y, z, BlockType::Air);
                        }
                    } else {
                        float oreVal = oreNoise.GetNoise(worldX + y, static_cast<float>(y), worldZ);
                        if (y <= 16 && oreVal > 0.75f) {
                            putBlock(x, y, z, BlockType::DiamondOre);
                        } else if (y <= 30 && oreVal > 0.68f) {
                            putBlock(x, y, z, BlockType::GoldOre);
                        } else if (y <= 45 && oreVal > 0.60f) {
                            putBlock(x, y, z, BlockType::IronOre);
                        } else if (y <= 60 && oreVal > 0.52f) {
                            putBlock(x, y, z, BlockType::CoalOre);
                        } else {
                            putBlock(x, y, z, (y < 16) ? BlockType::Obsidian : BlockType::Stone); // Deepslate layer
                        }
                    }
                } else if (y < height) {
                    putBlock(x, y, z, subBlock);
                } else if (y == height) {
                    putBlock(x, y, z, topBlock);
                } else {
                    putBlock(x, y, z, BlockType::Air);
                }

                // Update section non-air count
                int sy = y / 16;
                if (peekBlock(x, y, z) != BlockType::Air && m_Sections[sy]) {
                    m_Sections[sy]->notifyBlockChange(BlockType::Air, peekBlock(x, y, z));
                }
            }
        }
    }

    // Biome feature pass (trees, cactus, bamboo). Features are evaluated for a margin of
    // columns around the chunk and only the blocks that fall inside this chunk are written,
    // so trees can straddle chunk borders without being cut off.
    constexpr int FEATURE_MARGIN = 2;
    auto place = [&](int lx, int y, int lz, BlockType type, bool onlyIntoAir) {
        if (lx < 0 || lx >= CHUNK_SIZE_X || lz < 0 || lz >= CHUNK_SIZE_Z || y < 0 || y >= CHUNK_SIZE_Y)
            return;
        if (onlyIntoAir && peekBlock(lx, y, lz) != BlockType::Air)
            return;
        BlockType old = peekBlock(lx, y, lz);
        putBlock(lx, y, lz, type);
        int sy = y / 16;
        if (m_Sections[sy])
            m_Sections[sy]->notifyBlockChange(old, type);
    };
    auto canopy = [&](int cx, int cz, int baseY, int fromY, int toY) {
        for (int lx = -2; lx <= 2; ++lx)
            for (int lz = -2; lz <= 2; ++lz)
                for (int ly = fromY; ly <= toY; ++ly)
                    place(cx + lx, baseY + ly, cz + lz, BlockType::Leaves, true);
    };

    for (int fx = -FEATURE_MARGIN; fx < CHUNK_SIZE_X + FEATURE_MARGIN; ++fx) {
        for (int fz = -FEATURE_MARGIN; fz < CHUNK_SIZE_Z + FEATURE_MARGIN; ++fz) {
            int wx = m_ChunkX * CHUNK_SIZE_X + fx;
            int wz = m_ChunkZ * CHUNK_SIZE_Z + fz;
            Column col = sampleColumn(wx, wz);
            int height = col.height;
            float treeChance =
                std::abs(heightNoise.GetNoise(static_cast<float>(wx) * 5.0f, static_cast<float>(wz) * 5.0f));

            if (col.biome == BiomeType::Desert && treeChance > 0.75f) {
                for (int ch = 1; ch <= 3; ++ch)
                    place(fx, height + ch, fz, BlockType::Cactus, false);
            } else if (col.biome == BiomeType::Jungle) {
                if (treeChance > 0.65f) {
                    const int trunkHeight = 8;
                    for (int th = 1; th <= trunkHeight; ++th)
                        place(fx, height + th, fz, BlockType::OakLog, false);
                    canopy(fx, fz, height, trunkHeight - 2, trunkHeight + 1);
                } else if (treeChance > 0.35f) {
                    int bambooHeight = 3 + static_cast<int>(treeChance * 8.0f) % 4;
                    for (int bh = 1; bh <= bambooHeight; ++bh)
                        place(fx, height + bh, fz, BlockType::Bamboo, true);
                }
            } else if ((col.biome == BiomeType::Forest || col.biome == BiomeType::Plains) && treeChance > 0.60f) {
                BlockType logType =
                    (col.biome == BiomeType::Forest && treeChance > 0.8f) ? BlockType::BirchLog : BlockType::OakLog;
                const int trunkHeight = 5;
                for (int th = 1; th <= trunkHeight; ++th)
                    place(fx, height + th, fz, logType, false);
                canopy(fx, fz, height, trunkHeight - 1, trunkHeight + 1);
            }
        }
    }

    LightEngine::calculateChunkLighting(*this);
    compactStorage();
    m_IsDirty = true;
}

void Chunk::buildMeshDataAsync() {
    m_PendingMeshData = std::make_unique<MeshData>(ChunkMesh::buildMeshData(*this));
}

void Chunk::uploadPendingMesh() {
    if (m_PendingMeshData && m_Mesh) {
        m_Mesh->uploadMeshData(*m_PendingMeshData);
        m_PendingMeshData.reset();
        m_IsDirty = false;
    }
}

void Chunk::buildMesh() {
    if (m_IsDirty && m_Mesh) {
        m_Mesh->generate(*this);
        m_IsDirty = false;
    }
}

void Chunk::render(uint16_t sectionMask) {
    // Meshes are (re)built by World::remeshDirtyChunks, which knows the neighbouring chunks.
    if (m_UsesSectionMeshes) {
        for (int sy = 0; sy < 16; ++sy) {
            if (!(sectionMask & (1u << sy)))
                continue;
            if (m_Sections[sy] && m_Sections[sy]->getMesh())
                m_Sections[sy]->getMesh()->render();
        }
    } else if (m_Mesh && sectionMask) {
        m_Mesh->render();
    }
}

void Chunk::renderTransparent(uint16_t sectionMask) {
    if (m_UsesSectionMeshes) {
        for (int sy = 0; sy < 16; ++sy) {
            if (!(sectionMask & (1u << sy)))
                continue;
            if (m_Sections[sy] && m_Sections[sy]->getMesh())
                m_Sections[sy]->getMesh()->renderTransparent();
        }
    } else if (m_Mesh && sectionMask) {
        m_Mesh->renderTransparent();
    }
}

void Chunk::recomputeConnectivity(uint16_t sectionMask) {
    for (int sy = 0; sy < 16; ++sy) {
        if (!(sectionMask & (1u << sy)))
            continue;
        const int baseY = sy * 16;
        m_Connectivity[sy] = SectionVisibility::computeConnectivity(
            [&](int x, int y, int z) { return !BlockData::isOpaque(peekBlock(x, baseY + y, z)); });
    }
}

} // namespace Minecraft
