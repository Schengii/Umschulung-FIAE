#include "ChunkMesh.hpp"

#include "Chunk.hpp"

#include <algorithm>

namespace Minecraft {

ChunkMesh::ChunkMesh() {
    // Chunks (and therefore their meshes) are constructed on worker threads that have no OpenGL
    // context, so no GL objects are created here; uploadMeshData() creates them on the main thread.
}

ChunkMesh::~ChunkMesh() {
    clear();
    if (m_VAO && glDeleteVertexArrays)
        glDeleteVertexArrays(1, &m_VAO);
    if (m_VBO && glDeleteBuffers)
        glDeleteBuffers(1, &m_VBO);
    if (m_EBO && glDeleteBuffers)
        glDeleteBuffers(1, &m_EBO);

    if (m_TransVAO && glDeleteVertexArrays)
        glDeleteVertexArrays(1, &m_TransVAO);
    if (m_TransVBO && glDeleteBuffers)
        glDeleteBuffers(1, &m_TransVBO);
    if (m_TransEBO && glDeleteBuffers)
        glDeleteBuffers(1, &m_TransEBO);
}

void ChunkMesh::clear() {
    m_IndexCount = 0;
    m_TransIndexCount = 0;
}

void ChunkMesh::render() const {
    if (m_VAO == 0 || m_IndexCount == 0)
        return;
    glBindVertexArray(m_VAO);
    glDrawElements(GL_TRIANGLES, static_cast<GLsizei>(m_IndexCount), GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}

void ChunkMesh::renderTransparent() const {
    if (m_TransVAO == 0 || m_TransIndexCount == 0)
        return;
    glBindVertexArray(m_TransVAO);
    glDrawElements(GL_TRIANGLES, static_cast<GLsizei>(m_TransIndexCount), GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}

float ChunkMesh::calculateVertexAO(bool side1, bool side2, bool corner) {
    if (side1 && side2) {
        return 0.25f; // Deep corner shadow
    }
    int count = (side1 ? 1 : 0) + (side2 ? 1 : 0) + (corner ? 1 : 0);
    return 1.0f - (count * 0.22f);
}

void ChunkMesh::generate(const Chunk& chunk) {
    MeshData meshData = buildMeshData(chunk);
    uploadMeshData(meshData);
}

struct FaceInfo {
    bool active = false;
    BlockType type = BlockType::Air;
    uint8_t light = 0;

    bool operator==(const FaceInfo& o) const { return active == o.active && type == o.type && light == o.light; }
    bool operator!=(const FaceInfo& o) const { return !(*this == o); }
};

MeshInput::MeshInput(int chunkX, int chunkZ)
    : m_ChunkX(chunkX), m_ChunkZ(chunkZ), m_Blocks(new BlockType[PADDED_X * CHUNK_SIZE_Y * PADDED_Z]),
      m_Light(new uint8_t[PADDED_X * CHUNK_SIZE_Y * PADDED_Z]) {
    // Missing neighbours behave like open sky: Air with full sunlight.
    std::fill(m_Blocks.get(), m_Blocks.get() + PADDED_X * CHUNK_SIZE_Y * PADDED_Z, BlockType::Air);
    std::fill(m_Light.get(), m_Light.get() + PADDED_X * CHUNK_SIZE_Y * PADDED_Z, static_cast<uint8_t>(0xF0));
}

void MeshInput::copyChunk(const Chunk& c, int dx, int dz) {
    auto range = [](int d, int& s0, int& s1, int& p0) {
        if (d < 0) {
            s0 = s1 = CHUNK_SIZE_X - 1;
            p0 = 0;
        } else if (d == 0) {
            s0 = 0;
            s1 = CHUNK_SIZE_X - 1;
            p0 = 1;
        } else {
            s0 = s1 = 0;
            p0 = CHUNK_SIZE_X + 1;
        }
    };
    int sx0, sx1, px0, sz0, sz1, pz0;
    range(dx, sx0, sx1, px0);
    range(dz, sz0, sz1, pz0);

    for (int x = sx0; x <= sx1; ++x) {
        for (int y = 0; y < CHUNK_SIZE_Y; ++y) {
            for (int z = sz0; z <= sz1; ++z) {
                size_t i = index(px0 + (x - sx0) - 1, y, pz0 + (z - sz0) - 1);
                m_Blocks[i] = c.getBlock(x, y, z);
                m_Light[i] = c.getRawLight(x, y, z);
            }
        }
    }
}

BlockType MeshInput::getBlock(int x, int y, int z) const {
    if (y < 0 || y >= CHUNK_SIZE_Y || x < -1 || x > CHUNK_SIZE_X || z < -1 || z > CHUNK_SIZE_Z)
        return BlockType::Air;
    return m_Blocks[index(x, y, z)];
}

int MeshInput::getSunlight(int x, int y, int z) const {
    if (y < 0 || y >= CHUNK_SIZE_Y || x < -1 || x > CHUNK_SIZE_X || z < -1 || z > CHUNK_SIZE_Z)
        return 15;
    return (m_Light[index(x, y, z)] >> 4) & 0x0F;
}

int MeshInput::getBlocklight(int x, int y, int z) const {
    if (y < 0 || y >= CHUNK_SIZE_Y || x < -1 || x > CHUNK_SIZE_X || z < -1 || z > CHUNK_SIZE_Z)
        return 0;
    return m_Light[index(x, y, z)] & 0x0F;
}

MeshData ChunkMesh::buildMeshData(const Chunk& chunk) {
    MeshInput in(chunk.getChunkX(), chunk.getChunkZ());
    in.copyChunk(chunk, 0, 0);
    return buildMeshData(in);
}

MeshData ChunkMesh::buildMeshData(const MeshInput& in) {
    return buildMeshData(in, 0, SECTIONS_PER_CHUNK);
}

MeshData ChunkMesh::buildMeshData(const MeshInput& in, int firstSection, int endSection) {
    MeshData data;
    int worldChunkX = in.getChunkX() * CHUNK_SIZE_X;
    int worldChunkZ = in.getChunkZ() * CHUNK_SIZE_Z;

    // Only the vertical range of the requested sections is meshed. Merged rectangles never cross a
    // section boundary, so the geometry of a section is the same whether it is built alone or together
    // with the others (this is what makes per-section re-meshing possible).
    firstSection = std::max(0, firstSection);
    endSection = std::min(SECTIONS_PER_CHUNK, endSection);
    const int yBegin = firstSection * SECTION_SIZE_Y;
    const int yEnd = endSection * SECTION_SIZE_Y;
    auto sectionTop = [](int y) { return ((y >> 4) + 1) << 4; };

    // 1. Greedy meshing for TOP (+Y) and BOTTOM (-Y)
    for (int dirIdx = 0; dirIdx < 2; ++dirIdx) {
        Direction dir = (dirIdx == 0) ? TOP : BOTTOM;
        int dy = (dir == TOP) ? 1 : -1;

        for (int y = yBegin; y < yEnd; ++y) {
            FaceInfo mask[CHUNK_SIZE_X][CHUNK_SIZE_Z];

            for (int x = 0; x < CHUNK_SIZE_X; ++x) {
                for (int z = 0; z < CHUNK_SIZE_Z; ++z) {
                    BlockType type = in.getBlock(x, y, z);
                    if (type == BlockType::Air)
                        continue;

                    int ny = y + dy;
                    bool visible = (ny < 0 || ny >= CHUNK_SIZE_Y || !BlockData::isOpaque(in.getBlock(x, ny, z)));
                    if (visible) {
                        if (ny >= 0 && ny < CHUNK_SIZE_Y) {
                            uint8_t s = in.getSunlight(x, ny, z);
                            uint8_t b = in.getBlocklight(x, ny, z);
                            mask[x][z] = {true, type, static_cast<uint8_t>(std::max(s, b))};
                        } else {
                            mask[x][z] = {true, type, 15};
                        }
                    }
                }
            }

            for (int z = 0; z < CHUNK_SIZE_Z; ++z) {
                for (int x = 0; x < CHUNK_SIZE_X; ++x) {
                    if (!mask[x][z].active)
                        continue;

                    FaceInfo current = mask[x][z];
                    int w = 1, h = 1;

                    while (x + w < CHUNK_SIZE_X && mask[x + w][z] == current) {
                        w++;
                    }

                    bool canExtend = true;
                    while (z + h < CHUNK_SIZE_Z && canExtend) {
                        for (int k = 0; k < w; ++k) {
                            if (mask[x + k][z + h] != current) {
                                canExtend = false;
                                break;
                            }
                        }
                        if (canExtend)
                            h++;
                    }

                    glm::vec3 pos(worldChunkX + x, y, worldChunkZ + z);
                    float baseLight = std::max(0.12f, static_cast<float>(current.light) / 15.0f);

                    // Vertex Ambient Occlusion calculation for corners
                    int ny = (dir == TOP) ? y + 1 : y - 1;
                    bool sLeft = BlockData::isOpaque(in.getBlock(x - 1, ny, z));
                    bool sRight = BlockData::isOpaque(in.getBlock(x + w, ny, z));
                    bool sBack = BlockData::isOpaque(in.getBlock(x, ny, z - 1));
                    bool sFront = BlockData::isOpaque(in.getBlock(x, ny, z + h));

                    bool c0 = BlockData::isOpaque(in.getBlock(x - 1, ny, z - 1));
                    bool c1 = BlockData::isOpaque(in.getBlock(x + w, ny, z - 1));
                    bool c2 = BlockData::isOpaque(in.getBlock(x + w, ny, z + h));
                    bool c3 = BlockData::isOpaque(in.getBlock(x - 1, ny, z + h));

                    float cornerAO[4] = {calculateVertexAO(sLeft, sBack, c0), calculateVertexAO(sRight, sBack, c1),
                                         calculateVertexAO(sRight, sFront, c2), calculateVertexAO(sLeft, sFront, c3)};

                    bool isTrans = (BlockData::isWater(current.type) || current.type == BlockType::Glass ||
                                    current.type == BlockType::Leaves || current.type == BlockType::Bamboo);
                    auto& targetVerts = isTrans ? data.transVertices : data.vertices;
                    auto& targetIndices = isTrans ? data.transIndices : data.indices;

                    addMergedFace(pos, static_cast<float>(w), static_cast<float>(h), dir, current.type, baseLight,
                                  cornerAO, targetVerts, targetIndices);

                    for (int dz = 0; dz < h; ++dz) {
                        for (int dx = 0; dx < w; ++dx) {
                            mask[x + dx][z + dz].active = false;
                        }
                    }
                }
            }
        }
    }

    // 2. Greedy meshing for NORTH (+Z) and SOUTH (-Z)
    for (int dirIdx = 0; dirIdx < 2; ++dirIdx) {
        Direction dir = (dirIdx == 0) ? NORTH : SOUTH;
        int dz = (dir == NORTH) ? 1 : -1;

        for (int z = 0; z < CHUNK_SIZE_Z; ++z) {
            std::vector<std::vector<FaceInfo>> mask(CHUNK_SIZE_X, std::vector<FaceInfo>(CHUNK_SIZE_Y));

            for (int x = 0; x < CHUNK_SIZE_X; ++x) {
                for (int y = yBegin; y < yEnd; ++y) {
                    BlockType type = in.getBlock(x, y, z);
                    if (type == BlockType::Air)
                        continue;

                    int nz = z + dz;
                    bool visible = !BlockData::isOpaque(in.getBlock(x, y, nz));
                    if (visible) {
                        uint8_t s = in.getSunlight(x, y, nz);
                        uint8_t b = in.getBlocklight(x, y, nz);
                        mask[x][y] = {true, type, static_cast<uint8_t>(std::max(s, b))};
                    }
                }
            }

            for (int y = yBegin; y < yEnd; ++y) {
                for (int x = 0; x < CHUNK_SIZE_X; ++x) {
                    if (!mask[x][y].active)
                        continue;

                    FaceInfo current = mask[x][y];
                    int w = 1, h = 1;

                    while (x + w < CHUNK_SIZE_X && mask[x + w][y] == current) {
                        w++;
                    }

                    bool canExtend = true;
                    while (y + h < sectionTop(y) && canExtend) {
                        for (int k = 0; k < w; ++k) {
                            if (mask[x + k][y + h] != current) {
                                canExtend = false;
                                break;
                            }
                        }
                        if (canExtend)
                            h++;
                    }

                    glm::vec3 pos(worldChunkX + x, y, worldChunkZ + z);
                    float baseLight = std::max(0.12f, static_cast<float>(current.light) / 15.0f);

                    int nz = (dir == NORTH) ? z + 1 : z - 1;
                    bool sLeft = BlockData::isOpaque(in.getBlock(x - 1, y, nz));
                    bool sRight = BlockData::isOpaque(in.getBlock(x + w, y, nz));
                    bool sDown = (y > 0) && BlockData::isOpaque(in.getBlock(x, y - 1, nz));
                    bool sUp = (y + h < CHUNK_SIZE_Y) && BlockData::isOpaque(in.getBlock(x, y + h, nz));

                    float cornerAO[4] = {calculateVertexAO(sLeft, sDown, false),
                                         calculateVertexAO(sRight, sDown, false), calculateVertexAO(sRight, sUp, false),
                                         calculateVertexAO(sLeft, sUp, false)};

                    bool isTrans = (BlockData::isWater(current.type) || current.type == BlockType::Glass ||
                                    current.type == BlockType::Leaves || current.type == BlockType::Bamboo);
                    auto& targetVerts = isTrans ? data.transVertices : data.vertices;
                    auto& targetIndices = isTrans ? data.transIndices : data.indices;

                    addMergedFace(pos, static_cast<float>(w), static_cast<float>(h), dir, current.type, baseLight,
                                  cornerAO, targetVerts, targetIndices);

                    for (int dy = 0; dy < h; ++dy) {
                        for (int dx = 0; dx < w; ++dx) {
                            mask[x + dx][y + dy].active = false;
                        }
                    }
                }
            }
        }
    }

    // 3. Greedy meshing for EAST (+X) and WEST (-X)
    for (int dirIdx = 0; dirIdx < 2; ++dirIdx) {
        Direction dir = (dirIdx == 0) ? EAST : WEST;
        int dx = (dir == EAST) ? 1 : -1;

        for (int x = 0; x < CHUNK_SIZE_X; ++x) {
            std::vector<std::vector<FaceInfo>> mask(CHUNK_SIZE_Z, std::vector<FaceInfo>(CHUNK_SIZE_Y));

            for (int z = 0; z < CHUNK_SIZE_Z; ++z) {
                for (int y = yBegin; y < yEnd; ++y) {
                    BlockType type = in.getBlock(x, y, z);
                    if (type == BlockType::Air)
                        continue;

                    int nx = x + dx;
                    bool visible = !BlockData::isOpaque(in.getBlock(nx, y, z));
                    if (visible) {
                        uint8_t s = in.getSunlight(nx, y, z);
                        uint8_t b = in.getBlocklight(nx, y, z);
                        mask[z][y] = {true, type, static_cast<uint8_t>(std::max(s, b))};
                    }
                }
            }

            for (int y = yBegin; y < yEnd; ++y) {
                for (int z = 0; z < CHUNK_SIZE_Z; ++z) {
                    if (!mask[z][y].active)
                        continue;

                    FaceInfo current = mask[z][y];
                    int w = 1, h = 1;

                    while (z + w < CHUNK_SIZE_Z && mask[z + w][y] == current) {
                        w++;
                    }

                    bool canExtend = true;
                    while (y + h < sectionTop(y) && canExtend) {
                        for (int k = 0; k < w; ++k) {
                            if (mask[z + k][y + h] != current) {
                                canExtend = false;
                                break;
                            }
                        }
                        if (canExtend)
                            h++;
                    }

                    glm::vec3 pos(worldChunkX + x, y, worldChunkZ + z);
                    float baseLight = std::max(0.12f, static_cast<float>(current.light) / 15.0f);

                    int nx = (dir == EAST) ? x + 1 : x - 1;
                    bool sLeft = BlockData::isOpaque(in.getBlock(nx, y, z - 1));
                    bool sRight = BlockData::isOpaque(in.getBlock(nx, y, z + w));
                    bool sDown = (y > 0) && BlockData::isOpaque(in.getBlock(nx, y - 1, z));
                    bool sUp = (y + h < CHUNK_SIZE_Y) && BlockData::isOpaque(in.getBlock(nx, y + h, z));

                    float cornerAO[4] = {calculateVertexAO(sLeft, sDown, false),
                                         calculateVertexAO(sRight, sDown, false), calculateVertexAO(sRight, sUp, false),
                                         calculateVertexAO(sLeft, sUp, false)};

                    bool isTrans = (BlockData::isWater(current.type) || current.type == BlockType::Glass ||
                                    current.type == BlockType::Leaves || current.type == BlockType::Bamboo);
                    auto& targetVerts = isTrans ? data.transVertices : data.vertices;
                    auto& targetIndices = isTrans ? data.transIndices : data.indices;

                    addMergedFace(pos, static_cast<float>(w), static_cast<float>(h), dir, current.type, baseLight,
                                  cornerAO, targetVerts, targetIndices);

                    for (int dy = 0; dy < h; ++dy) {
                        for (int dz = 0; dz < w; ++dz) {
                            mask[z + dz][y + dy].active = false;
                        }
                    }
                }
            }
        }
    }

    return data;
}

void ChunkMesh::uploadMeshData(const MeshData& data) {
    uploadMeshData(data.vertices, data.indices);

    m_TransIndexCount = data.transIndices.size();
    if (m_TransIndexCount > 0 && glBindVertexArray) {
        if (!m_TransVAO && glGenVertexArrays)
            glGenVertexArrays(1, &m_TransVAO);
        if (!m_TransVBO && glGenBuffers)
            glGenBuffers(1, &m_TransVBO);
        if (!m_TransEBO && glGenBuffers)
            glGenBuffers(1, &m_TransEBO);

        glBindVertexArray(m_TransVAO);

        glBindBuffer(GL_ARRAY_BUFFER, m_TransVBO);
        glBufferData(GL_ARRAY_BUFFER, data.transVertices.size() * sizeof(Vertex), data.transVertices.data(),
                     GL_STATIC_DRAW);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_TransEBO);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, data.transIndices.size() * sizeof(unsigned int), data.transIndices.data(),
                     GL_STATIC_DRAW);

        glEnableVertexAttribArray(0);
        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, position));

        glEnableVertexAttribArray(1);
        glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, texCoord));

        glEnableVertexAttribArray(2);
        glVertexAttribPointer(2, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, normal));

        glEnableVertexAttribArray(3);
        glVertexAttribPointer(3, 1, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, light));

        glEnableVertexAttribArray(4);
        glVertexAttribPointer(4, 1, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, ao));

        glBindVertexArray(0);
    }
}

void ChunkMesh::uploadMeshData(const std::vector<Vertex>& vertices, const std::vector<unsigned int>& indices) {
    m_IndexCount = indices.size();
    if (m_IndexCount == 0 || !glBindVertexArray)
        return;

    if (!m_VAO && glGenVertexArrays)
        glGenVertexArrays(1, &m_VAO);
    if (!m_VBO && glGenBuffers)
        glGenBuffers(1, &m_VBO);
    if (!m_EBO && glGenBuffers)
        glGenBuffers(1, &m_EBO);

    glBindVertexArray(m_VAO);

    glBindBuffer(GL_ARRAY_BUFFER, m_VBO);
    glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizeof(Vertex), vertices.data(), GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, m_EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.size() * sizeof(unsigned int), indices.data(), GL_STATIC_DRAW);

    // Position
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, position));

    // TexCoord
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, texCoord));

    // Normal
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(2, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, normal));

    // Light
    glEnableVertexAttribArray(3);
    glVertexAttribPointer(3, 1, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, light));

    // AO
    glEnableVertexAttribArray(4);
    glVertexAttribPointer(4, 1, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void*)offsetof(Vertex, ao));

    glBindVertexArray(0);
}

void ChunkMesh::addMergedFace(const glm::vec3& p, float w, float h, Direction dir, BlockType type, float baseLight,
                              const float cornerAO[4], std::vector<Vertex>& vertices,
                              std::vector<unsigned int>& indices) {
    glm::vec3 normal(0.0f);
    glm::vec2 baseUV = BlockData::getTextureUV(type, dir);
    float tw = 1.0f / 16.0f;
    glm::vec2 uv0 = baseUV;
    glm::vec2 uv1 = baseUV + glm::vec2(tw, 0.0f);
    glm::vec2 uv2 = baseUV + glm::vec2(tw, tw);
    glm::vec2 uv3 = baseUV + glm::vec2(0.0f, tw);

    int countW = static_cast<int>(w);
    int countH = static_cast<int>(h);

    for (int dw = 0; dw < countW; ++dw) {
        for (int dh = 0; dh < countH; ++dh) {
            unsigned int startIndex = static_cast<unsigned int>(vertices.size());

            // Interpolate corner AO factors across the merged quad
            float uFraction0 = static_cast<float>(dw) / std::max(1.0f, w);
            float uFraction1 = static_cast<float>(dw + 1) / std::max(1.0f, w);
            float vFraction0 = static_cast<float>(dh) / std::max(1.0f, h);
            float vFraction1 = static_cast<float>(dh + 1) / std::max(1.0f, h);

            float ao0 = glm::mix(glm::mix(cornerAO[0], cornerAO[1], uFraction0),
                                 glm::mix(cornerAO[3], cornerAO[2], uFraction0), vFraction0);
            float ao1 = glm::mix(glm::mix(cornerAO[0], cornerAO[1], uFraction1),
                                 glm::mix(cornerAO[3], cornerAO[2], uFraction1), vFraction0);
            float ao2 = glm::mix(glm::mix(cornerAO[0], cornerAO[1], uFraction1),
                                 glm::mix(cornerAO[3], cornerAO[2], uFraction1), vFraction1);
            float ao3 = glm::mix(glm::mix(cornerAO[0], cornerAO[1], uFraction0),
                                 glm::mix(cornerAO[3], cornerAO[2], uFraction0), vFraction1);

            switch (dir) {
            case TOP:
                normal = glm::vec3(0, 1, 0);
                vertices.push_back({p + glm::vec3(dw, 1, dh), uv0, normal, baseLight * 1.00f, ao0});
                vertices.push_back({p + glm::vec3(dw + 1, 1, dh), uv1, normal, baseLight * 0.95f, ao1});
                vertices.push_back({p + glm::vec3(dw + 1, 1, dh + 1), uv2, normal, baseLight * 0.90f, ao2});
                vertices.push_back({p + glm::vec3(dw, 1, dh + 1), uv3, normal, baseLight * 0.95f, ao3});
                break;
            case BOTTOM:
                normal = glm::vec3(0, -1, 0);
                vertices.push_back({p + glm::vec3(dw, 0, dh + 1), uv0, normal, baseLight * 0.50f, ao0});
                vertices.push_back({p + glm::vec3(dw + 1, 0, dh + 1), uv1, normal, baseLight * 0.50f, ao1});
                vertices.push_back({p + glm::vec3(dw + 1, 0, dh), uv2, normal, baseLight * 0.50f, ao2});
                vertices.push_back({p + glm::vec3(dw, 0, dh), uv3, normal, baseLight * 0.50f, ao3});
                break;
            case NORTH:
                normal = glm::vec3(0, 0, 1);
                vertices.push_back({p + glm::vec3(dw, dh, 1), uv0, normal, baseLight * 0.85f, ao0});
                vertices.push_back({p + glm::vec3(dw + 1, dh, 1), uv1, normal, baseLight * 0.80f, ao1});
                vertices.push_back({p + glm::vec3(dw + 1, dh + 1, 1), uv2, normal, baseLight * 0.90f, ao2});
                vertices.push_back({p + glm::vec3(dw, dh + 1, 1), uv3, normal, baseLight * 0.85f, ao3});
                break;
            case SOUTH:
                normal = glm::vec3(0, 0, -1);
                vertices.push_back({p + glm::vec3(dw + 1, dh, 0), uv0, normal, baseLight * 0.80f, ao0});
                vertices.push_back({p + glm::vec3(dw, dh, 0), uv1, normal, baseLight * 0.85f, ao1});
                vertices.push_back({p + glm::vec3(dw, dh + 1, 0), uv2, normal, baseLight * 0.90f, ao2});
                vertices.push_back({p + glm::vec3(dw + 1, dh + 1, 0), uv3, normal, baseLight * 0.85f, ao3});
                break;
            case EAST:
                normal = glm::vec3(1, 0, 0);
                vertices.push_back({p + glm::vec3(1, dh, dw + 1), uv0, normal, baseLight * 0.75f, ao0});
                vertices.push_back({p + glm::vec3(1, dh, dw), uv1, normal, baseLight * 0.70f, ao1});
                vertices.push_back({p + glm::vec3(1, dh + 1, dw), uv2, normal, baseLight * 0.80f, ao2});
                vertices.push_back({p + glm::vec3(1, dh + 1, dw + 1), uv3, normal, baseLight * 0.75f, ao3});
                break;
            case WEST:
                normal = glm::vec3(-1, 0, 0);
                vertices.push_back({p + glm::vec3(0, dh, dw), uv0, normal, baseLight * 0.70f, ao0});
                vertices.push_back({p + glm::vec3(0, dh, dw + 1), uv1, normal, baseLight * 0.75f, ao1});
                vertices.push_back({p + glm::vec3(0, dh + 1, dw + 1), uv2, normal, baseLight * 0.80f, ao2});
                vertices.push_back({p + glm::vec3(0, dh + 1, dw), uv3, normal, baseLight * 0.75f, ao3});
                break;
            }

            indices.push_back(startIndex + 0);
            indices.push_back(startIndex + 1);
            indices.push_back(startIndex + 2);
            indices.push_back(startIndex + 2);
            indices.push_back(startIndex + 3);
            indices.push_back(startIndex + 0);
        }
    }
}

} // namespace Minecraft
