#include "World.hpp"

#include "../renderer/FrustumCuller.hpp"
#include "LightEngine.hpp"
#include "SaveSystem.hpp"

#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <deque>
#include <iostream>
#include <vector>

namespace Minecraft {

static_assert(CHUNK_SIZE_X == 16 && CHUNK_SIZE_Z == 16, "World uses shifts/masks assuming 16x16 chunks");

World::World(int renderDistance, uint32_t seed, std::string saveDir, std::shared_ptr<ThreadPool> pool)
    : m_RenderDistance(renderDistance < 1 ? 1 : renderDistance), m_Seed(seed), m_SaveDir(std::move(saveDir)),
      m_ThreadPool(pool ? std::move(pool) : std::make_shared<ThreadPool>(4)) {
    // Chunks around the origin are generated synchronously so the spawn area is solid;
    // everything further out streams in on the worker threads.
    const int syncRadius = std::min(m_RenderDistance, 2);
    for (int x = -syncRadius; x <= syncRadius; ++x) {
        for (int z = -syncRadius; z <= syncRadius; ++z) {
            m_Chunks[glm::ivec2(x, z)] = std::make_unique<Chunk>(x, z, m_Seed, m_SaveDir);
        }
    }
}

World::~World() {
    // The pool may be shared with other worlds, so wait for our own tasks explicitly;
    // they reference this object and must not outlive it.
    m_Shutdown = true;
    {
        std::unique_lock<std::mutex> lock(m_QueueMutex);
        m_TasksDone.wait(lock, [this]() { return m_InFlightTasks == 0; });
    }
    saveAll();
}

void World::saveAll() {
    for (auto& [pos, chunk] : m_Chunks) {
        if (chunk)
            chunk->saveIfNeeded();
    }
}

Chunk* World::findChunk(int chunkX, int chunkZ) {
    if (m_CachedChunk && m_CachedChunkX == chunkX && m_CachedChunkZ == chunkZ) {
        return m_CachedChunk;
    }
    auto it = m_Chunks.find(glm::ivec2(chunkX, chunkZ));
    if (it == m_Chunks.end() || !it->second)
        return nullptr;
    m_CachedChunk = it->second.get();
    m_CachedChunkX = chunkX;
    m_CachedChunkZ = chunkZ;
    return m_CachedChunk;
}

void World::markDirty(int chunkX, int chunkZ) {
    if (Chunk* c = findChunk(chunkX, chunkZ))
        c->setDirty(true);
}

void World::markSectionsDirty(int chunkX, int chunkZ, uint16_t mask) {
    if (Chunk* ch = findChunk(chunkX, chunkZ))
        ch->markSectionsDirty(mask);
}

void World::markNeighborsDirty(int chunkX, int chunkZ) {
    // Only the neighbour's sections that contain blocks can gain or lose border faces.
    const int offsets[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
    for (const auto& o : offsets) {
        if (Chunk* n = findChunk(chunkX + o[0], chunkZ + o[1]))
            n->markSectionsDirty(n->getNonEmptySections());
    }
}

void World::relightPendingChunks() {
    std::vector<Chunk*> pending;
    for (auto& [pos, chunk] : m_Chunks) {
        if (chunk && chunk->needsRelight())
            pending.push_back(chunk.get());
    }
    for (Chunk* chunk : pending) {
        chunk->setNeedsRelight(false);
        // Recompute this chunk (pushes its light into the neighbours), then pull the neighbours' light back in.
        LightEngine::calculateChunkLighting(*chunk, this);
        const int cx = chunk->getChunkX();
        const int cz = chunk->getChunkZ();
        const int offsets[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        for (const auto& o : offsets) {
            if (Chunk* n = findChunk(cx + o[0], cz + o[1]))
                LightEngine::propagateCrossChunk(*this, *n);
        }
        // Light changes can reach every height of the column, so all sections are re-meshed.
        chunk->setDirty(true);
    }
}

void World::unloadFarChunks(const glm::vec3& playerPos) {
    int playerChunkX = static_cast<int>(std::floor(playerPos.x / CHUNK_SIZE_X));
    int playerChunkZ = static_cast<int>(std::floor(playerPos.z / CHUNK_SIZE_Z));
    int maxDist = m_RenderDistance + 2;

    std::vector<glm::ivec2> chunksToUnload;
    for (const auto& [pos, chunk] : m_Chunks) {
        if (std::abs(pos.x - playerChunkX) > maxDist || std::abs(pos.y - playerChunkZ) > maxDist) {
            chunksToUnload.push_back(pos);
        }
    }
    if (chunksToUnload.empty())
        return;

    invalidateCache();
    for (const auto& pos : chunksToUnload) {
        auto it = m_Chunks.find(pos);
        if (it != m_Chunks.end()) {
            // Keep a modified chunk in memory when writing it failed; it is retried on the next pass.
            if (it->second && !it->second->saveIfNeeded())
                continue;
            m_Chunks.erase(it);
        }
    }
}

void World::update(const glm::vec3& playerPos) {
    // 1. Collect completed background-generated chunks from workers and upload in batches
    std::vector<std::unique_ptr<Chunk>> arrived;
    {
        std::lock_guard<std::mutex> lock(m_QueueMutex);
        const size_t MAX_UPLOADS_PER_FRAME = 6;
        size_t n = std::min(m_CompletedChunks.size(), MAX_UPLOADS_PER_FRAME);
        for (size_t i = 0; i < n; ++i)
            arrived.push_back(std::move(m_CompletedChunks[i]));
        m_CompletedChunks.erase(m_CompletedChunks.begin(), m_CompletedChunks.begin() + static_cast<std::ptrdiff_t>(n));
    }

    for (auto& chunk : arrived) {
        if (!chunk)
            continue;
        glm::ivec2 pos = chunk->getPosition();
        m_LoadingChunks.erase(pos);
        // setBlock may have created this chunk synchronously while the worker was busy; the live one
        // carries the newer edits (and may be referenced elsewhere), so the worker's copy is dropped.
        if (m_Chunks.find(pos) != m_Chunks.end())
            continue;
        if (chunk->hasPendingMesh()) {
            chunk->uploadPendingMesh();
        }
        invalidateCache();
        Chunk* placed = chunk.get();
        m_Chunks[pos] = std::move(chunk);
        // The background mesh was built without neighbours; fix up border faces now that some may exist.
        placed->setDirty(true);
        markNeighborsDirty(pos.x, pos.y);
    }

    int playerChunkX = static_cast<int>(std::floor(playerPos.x / CHUNK_SIZE_X));
    int playerChunkZ = static_cast<int>(std::floor(playerPos.z / CHUNK_SIZE_Z));

    // 2. Queue missing chunks for background generation, nearest first
    std::vector<glm::ivec2> missing;
    for (int x = playerChunkX - m_RenderDistance; x <= playerChunkX + m_RenderDistance; ++x) {
        for (int z = playerChunkZ - m_RenderDistance; z <= playerChunkZ + m_RenderDistance; ++z) {
            glm::ivec2 pos(x, z);
            if (m_Chunks.find(pos) == m_Chunks.end() && m_LoadingChunks.find(pos) == m_LoadingChunks.end()) {
                missing.push_back(pos);
            }
        }
    }
    std::sort(missing.begin(), missing.end(), [&](const glm::ivec2& a, const glm::ivec2& b) {
        int da = (a.x - playerChunkX) * (a.x - playerChunkX) + (a.y - playerChunkZ) * (a.y - playerChunkZ);
        int db = (b.x - playerChunkX) * (b.x - playerChunkX) + (b.y - playerChunkZ) * (b.y - playerChunkZ);
        return da < db;
    });

    const size_t MAX_CHUNKS_IN_FLIGHT = 16;
    for (const glm::ivec2& pos : missing) {
        if (m_LoadingChunks.size() >= MAX_CHUNKS_IN_FLIGHT)
            break;
        m_LoadingChunks.insert(pos);

        {
            std::lock_guard<std::mutex> lock(m_QueueMutex);
            ++m_InFlightTasks;
        }
        m_ThreadPool->enqueue([this, pos]() {
            std::unique_ptr<Chunk> newChunk;
            if (!m_Shutdown) {
                newChunk = std::make_unique<Chunk>(pos.x, pos.y, m_Seed, m_SaveDir);
                newChunk->buildMeshDataAsync();
            }
            std::lock_guard<std::mutex> lock(m_QueueMutex);
            if (newChunk)
                m_CompletedChunks.push_back(std::move(newChunk));
            --m_InFlightTasks;
            m_TasksDone.notify_all();
        });
    }

    // 3. Unload distant chunks to preserve memory (saves modified ones first)
    unloadFarChunks(playerPos);

    // 4. Re-mesh chunks whose blocks or neighbours changed
    remeshDirtyChunks(playerPos);
}

void World::remeshChunk(Chunk& chunk) {
    const int cx = chunk.getChunkX();
    const int cz = chunk.getChunkZ();

    MeshInput input(cx, cz);
    for (int dx = -1; dx <= 1; ++dx) {
        for (int dz = -1; dz <= 1; ++dz) {
            if (dx == 0 && dz == 0) {
                input.copyChunk(chunk, 0, 0);
            } else if (Chunk* n = findChunk(cx + dx, cz + dz)) {
                input.copyChunk(*n, dx, dz);
            }
        }
    }

    // Re-mesh only the sections that changed; every section owns its GPU buffers, so nothing else is touched.
    if (!chunk.usesSectionMeshes()) {
        // Switching from the worker's whole-chunk mesh to section meshes: all sections have to be built once.
        chunk.markSectionsDirty(Chunk::ALL_SECTIONS);
        if (ChunkMesh* whole = chunk.getMesh())
            whole->clear();
        chunk.setUsesSectionMeshes(true);
    }
    const uint16_t dirty = chunk.getDirtySections();
    size_t rebuilt = 0;
    for (int sy = 0; sy < SECTIONS_PER_CHUNK; ++sy) {
        if (!(dirty & (1u << sy)))
            continue;
        MeshData data = ChunkMesh::buildMeshData(input, sy, sy + 1);
        if (ChunkSection* section = chunk.getSection(sy)) {
            if (ChunkMesh* mesh = section->getMesh())
                mesh->uploadMeshData(data);
        }
        ++rebuilt;
    }
    chunk.addSectionRebuilds(rebuilt);
    chunk.recomputeConnectivity(dirty);
    chunk.setDirty(false);
}

int World::remeshDirtyChunks(const glm::vec3& playerPos, double budgetMs) {
    relightPendingChunks();
    std::vector<Chunk*> dirty;
    for (auto& [pos, chunk] : m_Chunks) {
        if (chunk && chunk->isDirty())
            dirty.push_back(chunk.get());
    }
    if (dirty.empty())
        return 0;

    int pcx = static_cast<int>(std::floor(playerPos.x / CHUNK_SIZE_X));
    int pcz = static_cast<int>(std::floor(playerPos.z / CHUNK_SIZE_Z));
    std::sort(dirty.begin(), dirty.end(), [&](const Chunk* a, const Chunk* b) {
        int da = (a->getChunkX() - pcx) * (a->getChunkX() - pcx) + (a->getChunkZ() - pcz) * (a->getChunkZ() - pcz);
        int db = (b->getChunkX() - pcx) * (b->getChunkX() - pcx) + (b->getChunkZ() - pcz) * (b->getChunkZ() - pcz);
        return da < db;
    });

    auto start = std::chrono::steady_clock::now();
    int done = 0;
    for (Chunk* chunk : dirty) {
        remeshChunk(*chunk);
        ++done;
        double elapsed = std::chrono::duration<double, std::milli>(std::chrono::steady_clock::now() - start).count();
        if (elapsed >= budgetMs)
            break;
    }
    return done;
}

bool World::isSectionVisible(int chunkX, int sectionY, int chunkZ) const {
    if (!m_VisibilityValid)
        return true;
    auto it = m_VisibleSections.find(glm::ivec2(chunkX, chunkZ));
    return it != m_VisibleSections.end() && (it->second & (1u << sectionY));
}

void World::updateVisibility(const glm::vec3& cameraPos, const FrustumCuller* culler) {
    m_VisibleSections.clear();
    m_VisibleSectionCount = 0;
    m_VisibilityValid = false;
    if (!m_OcclusionCulling)
        return;

    const int startCx = static_cast<int>(std::floor(cameraPos.x)) >> 4;
    const int startCz = static_cast<int>(std::floor(cameraPos.z)) >> 4;
    const int startSy = std::clamp(static_cast<int>(std::floor(cameraPos.y)) >> 4, 0, SECTIONS_PER_CHUNK - 1);
    if (!findChunk(startCx, startCz))
        return; // camera outside the loaded world: draw everything

    struct Node {
        int cx, sy, cz, entry;
    };
    // One visited bit per (section, face it was entered through); the start has its own pseudo entry (bit 6).
    std::unordered_map<uint64_t, uint8_t> visited;
    auto key = [](int cx, int sy, int cz) {
        // 21 bits per chunk coordinate (offset to be non-negative) + 5 bits for the section: collision free.
        constexpr int64_t OFFSET = 1 << 20;
        return (static_cast<uint64_t>((cx + OFFSET) & 0x1FFFFF) << 26) |
               (static_cast<uint64_t>((cz + OFFSET) & 0x1FFFFF) << 5) | static_cast<uint64_t>(sy);
    };

    // From the camera's own cell the view only leaves the start section through the faces of its pocket of open cells.
    Chunk* startChunk = findChunk(startCx, startCz);
    const int camX = static_cast<int>(std::floor(cameraPos.x)) & 15;
    const int camY = static_cast<int>(std::floor(cameraPos.y)) - startSy * SECTION_SIZE_Y;
    const int camZ = static_cast<int>(std::floor(cameraPos.z)) & 15;
    const unsigned startFaces = SectionVisibility::reachableFaces(
        [&](int x, int y, int z) {
            return !BlockData::isOpaque(startChunk->getBlock(x, startSy * SECTION_SIZE_Y + y, z));
        },
        camX, camY, camZ);

    std::deque<Node> queue;
    queue.push_back({startCx, startSy, startCz, 6});
    visited[key(startCx, startSy, startCz)] |= 1u << 6;

    while (!queue.empty()) {
        Node n = queue.front();
        queue.pop_front();

        Chunk* chunk = findChunk(n.cx, n.cz);
        if (!chunk)
            continue;
        m_VisibleSections[glm::ivec2(n.cx, n.cz)] |= static_cast<uint16_t>(1u << n.sy);
        const uint16_t conn = chunk->getConnectivity(n.sy);

        for (int f = 0; f < 6; ++f) {
            if (n.entry != 6 && f == n.entry)
                continue;
            if (n.entry == 6 && !(startFaces & (1u << f)))
                continue;
            // Having entered through `entry`, the view can only leave through faces connected to it.
            if (n.entry != 6 && !SectionVisibility::connects(conn, n.entry, f))
                continue;

            const int nx = n.cx + SectionVisibility::DX[f];
            const int ny = n.sy + SectionVisibility::DY[f];
            const int nz = n.cz + SectionVisibility::DZ[f];
            if (ny < 0 || ny >= SECTIONS_PER_CHUNK)
                continue;
            if (!findChunk(nx, nz))
                continue;

            if (culler) {
                glm::vec3 lo(nx * CHUNK_SIZE_X, ny * SECTION_SIZE_Y, nz * CHUNK_SIZE_Z);
                if (!culler->isBoxVisible(lo, lo + glm::vec3(CHUNK_SIZE_X, SECTION_SIZE_Y, CHUNK_SIZE_Z)))
                    continue;
            }

            const int entryBit = SectionVisibility::opposite(f);
            uint8_t& seen = visited[key(nx, ny, nz)];
            if (seen & (1u << entryBit))
                continue;
            seen |= static_cast<uint8_t>(1u << entryBit);
            queue.push_back({nx, ny, nz, entryBit});
        }
    }

    for (const auto& [pos, mask] : m_VisibleSections) {
        for (int sy = 0; sy < SECTIONS_PER_CHUNK; ++sy)
            if (mask & (1u << sy))
                ++m_VisibleSectionCount;
    }
    m_VisibilityValid = true;
}

void World::render(const FrustumCuller* culler) {
    for (auto& [pos, chunk] : m_Chunks) {
        if (!chunk)
            continue;
        if (culler) {
            glm::vec3 minAABB(pos.x * CHUNK_SIZE_X, 0.0f, pos.y * CHUNK_SIZE_Z);
            glm::vec3 maxAABB(minAABB.x + CHUNK_SIZE_X, static_cast<float>(CHUNK_SIZE_Y), minAABB.z + CHUNK_SIZE_Z);
            if (!culler->isBoxVisible(minAABB, maxAABB)) {
                continue;
            }
        }
        if (m_VisibilityValid) {
            auto vis = m_VisibleSections.find(pos);
            if (vis == m_VisibleSections.end())
                continue;
            chunk->render(vis->second);
        } else {
            chunk->render();
        }
    }
}

void World::renderTransparent(const FrustumCuller* culler, const glm::vec3* cameraPos) {
    std::vector<std::pair<float, Chunk*>> visible;
    for (auto& [pos, chunk] : m_Chunks) {
        if (!chunk)
            continue;
        glm::vec3 minAABB(pos.x * CHUNK_SIZE_X, 0.0f, pos.y * CHUNK_SIZE_Z);
        glm::vec3 maxAABB(minAABB.x + CHUNK_SIZE_X, static_cast<float>(CHUNK_SIZE_Y), minAABB.z + CHUNK_SIZE_Z);
        if (culler && !culler->isBoxVisible(minAABB, maxAABB)) {
            continue;
        }
        float dist = 0.0f;
        if (cameraPos) {
            glm::vec2 centre(minAABB.x + CHUNK_SIZE_X * 0.5f, minAABB.z + CHUNK_SIZE_Z * 0.5f);
            dist = glm::length(centre - glm::vec2(cameraPos->x, cameraPos->z));
        }
        if (m_VisibilityValid && m_VisibleSections.find(pos) == m_VisibleSections.end())
            continue;
        visible.emplace_back(dist, chunk.get());
    }
    if (cameraPos) {
        std::sort(visible.begin(), visible.end(), [](const auto& a, const auto& b) { return a.first > b.first; });
    }
    for (auto& [dist, chunk] : visible) {
        uint16_t mask = Chunk::ALL_SECTIONS;
        if (m_VisibilityValid) {
            auto vis = m_VisibleSections.find(chunk->getPosition());
            if (vis != m_VisibleSections.end())
                mask = vis->second;
        }
        chunk->renderTransparent(mask);
    }
}

void World::renderShadowCasters(const glm::vec3& center, float radius) {
    // Chunk centres within radius (plus half a chunk diagonal so border chunks still cast shadows).
    const float reach = radius + CHUNK_SIZE_X;
    for (auto& [pos, chunk] : m_Chunks) {
        if (!chunk)
            continue;
        float cx = pos.x * CHUNK_SIZE_X + CHUNK_SIZE_X * 0.5f;
        float cz = pos.y * CHUNK_SIZE_Z + CHUNK_SIZE_Z * 0.5f;
        float dx = cx - center.x;
        float dz = cz - center.z;
        if (dx * dx + dz * dz > reach * reach)
            continue;
        chunk->render();
    }
}

Chunk* World::getChunk(int chunkX, int chunkZ) {
    return findChunk(chunkX, chunkZ);
}

BlockType World::getBlock(int worldX, int worldY, int worldZ) {
    // Arithmetic shifts implement floor-division / modulo for negative coordinates.
    Chunk* chunk = findChunk(worldX >> 4, worldZ >> 4);
    if (!chunk)
        return BlockType::Air;
    return chunk->getBlock(worldX & 15, worldY, worldZ & 15);
}

void World::setBlock(int worldX, int worldY, int worldZ, BlockType type) {
    if (worldY < 0 || worldY >= CHUNK_SIZE_Y)
        return;
    int chunkX = worldX >> 4;
    int chunkZ = worldZ >> 4;

    Chunk* chunk = findChunk(chunkX, chunkZ);
    if (!chunk) {
        auto newChunk = std::make_unique<Chunk>(chunkX, chunkZ, m_Seed, m_SaveDir);
        chunk = newChunk.get();
        m_Chunks[glm::ivec2(chunkX, chunkZ)] = std::move(newChunk);
        invalidateCache();
        markNeighborsDirty(chunkX, chunkZ);
    }
    int localX = worldX & 15;
    int localZ = worldZ & 15;
    const BlockType previous = chunk->getBlock(localX, worldY, localZ);
    if (previous == type)
        return;
    chunk->setBlock(localX, worldY, localZ, type);
    if (BlockData::isOpaque(previous) != BlockData::isOpaque(type) ||
        LightEngine::getLightEmission(previous) != LightEngine::getLightEmission(type)) {
        chunk->setNeedsRelight(true);
    }

    // Border edits change the visible faces / AO of the adjacent chunk too, but only in the sections around the edit.
    const uint16_t mask = Chunk::sectionMaskForY(worldY);
    const int dx = localX == 0 ? -1 : (localX == CHUNK_SIZE_X - 1 ? 1 : 0);
    const int dz = localZ == 0 ? -1 : (localZ == CHUNK_SIZE_Z - 1 ? 1 : 0);
    if (dx != 0)
        markSectionsDirty(chunkX + dx, chunkZ, mask);
    if (dz != 0)
        markSectionsDirty(chunkX, chunkZ + dz, mask);
    if (dx != 0 && dz != 0)
        markSectionsDirty(chunkX + dx, chunkZ + dz, mask); // diagonal chunk: corner ambient occlusion
}

BlockType World::getTopBlock(int worldX, int worldZ, int& outY) {
    Chunk* chunk = findChunk(worldX >> 4, worldZ >> 4);
    if (!chunk) {
        outY = 0;
        return BlockType::Air;
    }
    int localX = worldX & 15;
    int localZ = worldZ & 15;
    for (int y = 250; y >= 1; --y) {
        BlockType b = chunk->getBlock(localX, y, localZ);
        if (b != BlockType::Air) {
            outY = y;
            return b;
        }
    }
    outY = 0;
    return BlockType::Air;
}

glm::vec3 World::getMapColor(int worldX, int worldZ) {
    int topY = 0;
    BlockType b = getTopBlock(worldX, worldZ, topY);
    switch (b) {
    case BlockType::Grass:
        return glm::vec3(0.4f, 0.7f, 0.2f);
    case BlockType::Dirt:
        return glm::vec3(0.55f, 0.4f, 0.25f);
    case BlockType::Stone:
    case BlockType::Bedrock:
        return glm::vec3(0.5f, 0.5f, 0.5f);
    case BlockType::Sand:
        return glm::vec3(0.85f, 0.82f, 0.55f);
    case BlockType::Water:
    case BlockType::FlowingWater1:
    case BlockType::FlowingWater2:
    case BlockType::FlowingWater3:
    case BlockType::FlowingWater4:
    case BlockType::FlowingWater5:
    case BlockType::FlowingWater6:
        return glm::vec3(0.2f, 0.4f, 0.8f);
    case BlockType::Lava:
    case BlockType::FlowingLava1:
    case BlockType::FlowingLava2:
    case BlockType::FlowingLava3:
        return glm::vec3(0.9f, 0.35f, 0.1f);
    case BlockType::Leaves:
        return glm::vec3(0.25f, 0.55f, 0.15f);
    case BlockType::OakLog:
    case BlockType::BirchLog:
    case BlockType::Planks:
        return glm::vec3(0.6f, 0.45f, 0.25f);
    case BlockType::Snow:
        return glm::vec3(0.95f, 0.95f, 0.98f);
    case BlockType::Netherrack:
        return glm::vec3(0.45f, 0.1f, 0.1f);
    case BlockType::EndStone:
        return glm::vec3(0.85f, 0.85f, 0.65f);
    default:
        return glm::vec3(0.3f, 0.3f, 0.3f);
    }
}

} // namespace Minecraft
