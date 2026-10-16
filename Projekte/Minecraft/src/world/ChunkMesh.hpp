#ifndef CHUNKMESH_HPP
#define CHUNKMESH_HPP

#include "Block.hpp"

#include <cstdint>
#include <glad/glad.h>
#include <glm/glm.hpp>
#include <memory>
#include <vector>

namespace Minecraft {

class Chunk;

// Self-contained copy of a chunk plus a one-block border taken from its neighbours.
// Meshing from this snapshot lets worker threads build correct chunk-border faces,
// ambient occlusion and lighting without touching live (main-thread owned) chunks.
class MeshInput {
public:
    MeshInput(int chunkX, int chunkZ);

    // Copies chunk `c` into the slot at offset (dx, dz) in {-1,0,1}^2 relative to the centre chunk.
    void copyChunk(const Chunk& c, int dx, int dz);

    // x and z accept -1..16 (the border), y accepts 0..255.
    BlockType getBlock(int x, int y, int z) const;
    int getSunlight(int x, int y, int z) const;
    int getBlocklight(int x, int y, int z) const;

    int getChunkX() const { return m_ChunkX; }
    int getChunkZ() const { return m_ChunkZ; }

private:
    static constexpr int PADDED_X = 18;
    static constexpr int PADDED_Z = 18;
    static size_t index(int x, int y, int z) {
        return (static_cast<size_t>(x + 1) * 256 + static_cast<size_t>(y)) * PADDED_Z + static_cast<size_t>(z + 1);
    }

    int m_ChunkX;
    int m_ChunkZ;
    std::unique_ptr<BlockType[]> m_Blocks;
    std::unique_ptr<uint8_t[]> m_Light;
};

struct Vertex {
    glm::vec3 position;
    glm::vec2 texCoord;
    glm::vec3 normal;
    float light;
    float ao;
};

struct MeshData {
    std::vector<Vertex> vertices;
    std::vector<unsigned int> indices;
    std::vector<Vertex> transVertices;
    std::vector<unsigned int> transIndices;

    // Appends another mesh (index values are shifted to the new vertex offsets).
    void append(const MeshData& other) {
        const unsigned int base = static_cast<unsigned int>(vertices.size());
        vertices.insert(vertices.end(), other.vertices.begin(), other.vertices.end());
        for (unsigned int i : other.indices)
            indices.push_back(i + base);
        const unsigned int transBase = static_cast<unsigned int>(transVertices.size());
        transVertices.insert(transVertices.end(), other.transVertices.begin(), other.transVertices.end());
        for (unsigned int i : other.transIndices)
            transIndices.push_back(i + transBase);
    }

    void clear() {
        vertices.clear();
        indices.clear();
        transVertices.clear();
        transIndices.clear();
    }
};

class ChunkMesh {
public:
    ChunkMesh();
    ~ChunkMesh();

    void generate(const Chunk& chunk);
    static MeshData buildMeshData(const Chunk& chunk);
    static MeshData buildMeshData(const MeshInput& input);
    // Meshes only the vertical slab [firstSection*16, endSection*16) of the chunk.
    static MeshData buildMeshData(const MeshInput& input, int firstSection, int endSection);
    void uploadMeshData(const MeshData& data);
    void uploadMeshData(const std::vector<Vertex>& vertices, const std::vector<unsigned int>& indices);
    void render() const;
    void renderTransparent() const;
    void clear();

    static float calculateVertexAO(bool side1, bool side2, bool corner);

private:
    GLuint m_VAO = 0;
    GLuint m_VBO = 0;
    GLuint m_EBO = 0;
    size_t m_IndexCount = 0;

    GLuint m_TransVAO = 0;
    GLuint m_TransVBO = 0;
    GLuint m_TransEBO = 0;
    size_t m_TransIndexCount = 0;

    static void addFace(const Chunk& chunk, int lx, int ly, int lz, const glm::vec3& blockPos, Direction dir,
                        BlockType type, MeshData& meshData);
    static void addMergedFace(const glm::vec3& startPos, float w, float h, Direction dir, BlockType type,
                              float baseLight, const float cornerAO[4], std::vector<Vertex>& vertices,
                              std::vector<unsigned int>& indices);
};

} // namespace Minecraft

#endif // CHUNKMESH_HPP
