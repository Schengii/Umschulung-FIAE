#ifndef CHUNK_HPP
#define CHUNK_HPP

#include "Block.hpp"
#include "ChunkMesh.hpp"
#include "ChunkSection.hpp"
#include "SectionVisibility.hpp"
#include "SectionedBytes.hpp"

#include <array>
#include <cstdint>
#include <glm/glm.hpp>
#include <memory>
#include <string>
#include <vector>

namespace Minecraft {

constexpr int CHUNK_SIZE_X = 16;
constexpr int CHUNK_SIZE_Y = 256;
constexpr int CHUNK_SIZE_Z = 16;

class Chunk {
public:
    // `seed` drives terrain noise; `saveDir` is where this chunk's region file lives.
    Chunk(int chunkX, int chunkZ, uint32_t seed = 0, std::string saveDir = "world_saves");
    ~Chunk();

    BlockType getBlock(int x, int y, int z) const;
    void setBlock(int x, int y, int z, BlockType type);

    int getSunlight(int x, int y, int z) const;
    void setSunlight(int x, int y, int z, int val);

    int getBlocklight(int x, int y, int z) const;
    void setBlocklight(int x, int y, int z, int val);

    uint8_t getRawLight(int x, int y, int z) const;
    void setRawLight(int x, int y, int z, uint8_t val);

    int getChunkX() const { return m_ChunkX; }
    int getChunkZ() const { return m_ChunkZ; }
    glm::ivec2 getPosition() const { return glm::ivec2(m_ChunkX, m_ChunkZ); }

    // Flat copies in [x][y][z] order (16 * 256 * 16 entries), used for saving.
    void exportBlocks(BlockType* out) const { m_Blocks.exportTo(reinterpret_cast<uint8_t*>(out)); }
    void exportLight(uint8_t* out) const { m_Light.exportTo(out); }

    // Collapses sections that became uniform (e.g. fully lit air) back to a single byte.
    void compactStorage() {
        m_Blocks.compact();
        m_Light.compact();
    }
    // Bytes currently used by block and light storage (a flat array would need 131072).
    size_t getStorageBytes() const { return m_Blocks.allocatedBytes() + m_Light.allocatedBytes(); }

    void generateTerrain();
    void buildMesh();
    void buildMeshDataAsync();
    void uploadPendingMesh();
    bool hasPendingMesh() const { return m_PendingMeshData != nullptr; }

    // Draws the sections whose bit is set in `sectionMask` (all of them by default).
    void render(uint16_t sectionMask = 0xFFFF);
    void renderTransparent(uint16_t sectionMask = 0xFFFF);

    // Face connectivity of every section (see SectionVisibility); used for occlusion culling.
    uint16_t getConnectivity(int sy) const { return m_Connectivity[sy]; }
    void recomputeConnectivity(uint16_t sectionMask = 0xFFFF);

    // Persistence: a chunk is written to disk only if it was modified after generation/loading.
    bool needsSave() const { return m_NeedsSave; }
    bool saveIfNeeded();
    uint32_t getSeed() const { return m_Seed; }
    const std::string& getSaveDir() const { return m_SaveDir; }

    bool isDirty() const { return m_IsDirty; }
    // setDirty(true) invalidates every section; setDirty(false) marks the whole mesh as up to date.
    void setDirty(bool dirty) {
        m_IsDirty = dirty;
        m_DirtySections = dirty ? ALL_SECTIONS : 0;
    }

    // Per-section dirty tracking: bit n is set when section n has to be re-meshed.
    static constexpr uint16_t ALL_SECTIONS = 0xFFFF;
    uint16_t getDirtySections() const { return m_DirtySections; }
    void markSectionsDirty(uint16_t mask) {
        m_DirtySections |= mask;
        if (mask)
            m_IsDirty = true;
    }
    // Sections touched by an edit at height y: its own and, on a boundary, the adjacent one (faces / AO / light).
    static uint16_t sectionMaskForY(int y) {
        if (y < 0 || y >= CHUNK_SIZE_Y)
            return 0;
        int sy = y >> 4;
        uint16_t mask = static_cast<uint16_t>(1u << sy);
        if ((y & 15) == 0 && sy > 0)
            mask = static_cast<uint16_t>(mask | (1u << (sy - 1)));
        if ((y & 15) == 15 && sy < 15)
            mask = static_cast<uint16_t>(mask | (1u << (sy + 1)));
        return mask;
    }

    // Sections that hold anything but air. A section that is uniform air has no faces, so a neighbour
    // appearing next to it cannot change its mesh.
    uint16_t getNonEmptySections() const {
        uint16_t mask = 0;
        for (int sy = 0; sy < 16; ++sy) {
            if (!m_Blocks.isSectionUniform(sy) || m_Blocks.get(0, sy * 16, 0) != static_cast<uint8_t>(BlockType::Air))
                mask = static_cast<uint16_t>(mask | (1u << sy));
        }
        return mask;
    }

    // Set by World::setBlock when an edit changed opacity or light emission; World relights the chunk once per frame.
    bool needsRelight() const { return m_NeedsRelight; }
    void setNeedsRelight(bool v) { m_NeedsRelight = v; }

    // Once a chunk was re-meshed per section, its geometry lives in the section meshes (one GPU buffer set each).
    bool usesSectionMeshes() const { return m_UsesSectionMeshes; }
    void setUsesSectionMeshes(bool v) { m_UsesSectionMeshes = v; }
    size_t getSectionRebuildCount() const { return m_SectionRebuilds; }
    void addSectionRebuilds(size_t n) { m_SectionRebuilds += n; }

    ChunkMesh* getMesh() { return m_Mesh.get(); }
    const ChunkMesh* getMesh() const { return m_Mesh.get(); }

    ChunkSection* getSection(int sectionY) {
        if (sectionY >= 0 && sectionY < 16)
            return m_Sections[sectionY].get();
        return nullptr;
    }

private:
    int m_ChunkX;
    int m_ChunkZ;
    SectionedBytes m_Blocks{0}; // BlockType values, Air == 0
    SectionedBytes m_Light{0};  // high nibble sunlight, low nibble block light

    void putBlock(int x, int y, int z, BlockType t) { m_Blocks.set(x, y, z, static_cast<uint8_t>(t)); }
    BlockType peekBlock(int x, int y, int z) const { return static_cast<BlockType>(m_Blocks.get(x, y, z)); }
    bool m_IsDirty = true;
    std::array<uint16_t, 16> m_Connectivity = [] {
        std::array<uint16_t, 16> a;
        a.fill(SectionVisibility::ALL_CONNECTED);
        return a;
    }();
    uint16_t m_DirtySections = 0xFFFF;
    size_t m_SectionRebuilds = 0;
    bool m_UsesSectionMeshes = false;
    bool m_NeedsSave = false;
    bool m_NeedsRelight = false;
    uint32_t m_Seed = 0;
    std::string m_SaveDir;

    std::unique_ptr<ChunkMesh> m_Mesh;
    std::unique_ptr<MeshData> m_PendingMeshData;
    std::array<std::unique_ptr<ChunkSection>, 16> m_Sections;
};

} // namespace Minecraft

#endif // CHUNK_HPP
