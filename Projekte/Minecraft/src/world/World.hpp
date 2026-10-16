#ifndef WORLD_HPP
#define WORLD_HPP

#include "../core/ThreadPool.hpp"
#include "Chunk.hpp"

#include <atomic>
#include <condition_variable>
#include <glm/glm.hpp>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace Minecraft {

class FrustumCuller;

struct ChunkPosHash {
    size_t operator()(const glm::ivec2& v) const {
        // Pack both coordinates into 64 bits and run the MurmurHash3 finalizer: neighbouring chunks
        // (which differ in only a few bits) end up spread over the whole range.
        uint64_t k = (static_cast<uint64_t>(static_cast<uint32_t>(v.x)) << 32) | static_cast<uint32_t>(v.y);
        k ^= k >> 33;
        k *= 0xff51afd7ed558ccdULL;
        k ^= k >> 33;
        k *= 0xc4ceb9fe1a85ec53ULL;
        k ^= k >> 33;
        return static_cast<size_t>(k);
    }
};

// Not thread-safe: all public methods must be called from the main (GL) thread.
// Worker threads only generate chunks and build their first mesh in the background.
class World {
public:
    static constexpr uint32_t DEFAULT_SEED = 0;

    // `pool` may be shared between several worlds (dimensions); a private pool is created if null.
    explicit World(int renderDistance = 6, uint32_t seed = DEFAULT_SEED, std::string saveDir = "world_saves",
                   std::shared_ptr<ThreadPool> pool = nullptr);
    ~World();

    World(const World&) = delete;
    World& operator=(const World&) = delete;

    void update(const glm::vec3& playerPos);
    // Occlusion culling: updateVisibility() walks from the camera's section through connected section faces and
    // remembers which sections can be seen; render()/renderTransparent() then skip everything else.
    // Call it once per frame after the frustum was updated. Without it (or when disabled) everything in the frustum is
    // drawn.
    void updateVisibility(const glm::vec3& cameraPos, const FrustumCuller* culler);
    void setOcclusionCulling(bool enabled) {
        m_OcclusionCulling = enabled;
        if (!enabled)
            m_VisibilityValid = false;
    }
    bool isOcclusionCullingEnabled() const { return m_OcclusionCulling; }
    bool isSectionVisible(int chunkX, int sectionY, int chunkZ) const;
    size_t getVisibleSectionCount() const { return m_VisibleSectionCount; }

    void render(const FrustumCuller* culler = nullptr);
    // Back-to-front ordered when `cameraPos` is given, so blended chunks composite correctly.
    void renderTransparent(const FrustumCuller* culler = nullptr, const glm::vec3* cameraPos = nullptr);
    // Depth-only pass for the shadow map: draws just the chunks within `radius` blocks of `center`.
    void renderShadowCasters(const glm::vec3& center, float radius);

    Chunk* getChunk(int chunkX, int chunkZ);
    BlockType getBlock(int worldX, int worldY, int worldZ);
    void setBlock(int worldX, int worldY, int worldZ, BlockType type);

    int getLoadedChunkCount() const { return static_cast<int>(m_Chunks.size()); }
    int getRenderDistance() const { return m_RenderDistance; }
    void setRenderDistance(int rd) { m_RenderDistance = rd < 1 ? 1 : rd; }
    uint32_t getSeed() const { return m_Seed; }
    const std::string& getSaveDir() const { return m_SaveDir; }

    void unloadFarChunks(const glm::vec3& playerPos);

    // Writes every modified chunk to disk (also called on destruction).
    void saveAll();

    // Rebuilds meshes of chunks flagged dirty (block edits, new neighbours), nearest first,
    // stopping once `budgetMs` has been spent (at least one chunk is always processed).
    // Returns the number of chunks remeshed.
    int remeshDirtyChunks(const glm::vec3& playerPos, double budgetMs = 4.0);

    // Top-Down Minimap & Map Rendering
    BlockType getTopBlock(int worldX, int worldZ, int& outY);
    glm::vec3 getMapColor(int worldX, int worldZ);

private:
    void markDirty(int chunkX, int chunkZ);
    void markSectionsDirty(int chunkX, int chunkZ, uint16_t mask);
    void markNeighborsDirty(int chunkX, int chunkZ);
    void relightPendingChunks();
    void remeshChunk(Chunk& chunk);
    Chunk* findChunk(int chunkX, int chunkZ);
    void invalidateCache() { m_CachedChunk = nullptr; }

    int m_RenderDistance;
    uint32_t m_Seed;
    std::string m_SaveDir;

    std::unordered_map<glm::ivec2, std::unique_ptr<Chunk>, ChunkPosHash> m_Chunks;
    std::unordered_set<glm::ivec2, ChunkPosHash> m_LoadingChunks;

    bool m_OcclusionCulling = true;
    bool m_VisibilityValid = false;
    size_t m_VisibleSectionCount = 0;
    std::unordered_map<glm::ivec2, uint16_t, ChunkPosHash> m_VisibleSections; // chunk -> visible section bits

    // One-entry lookup cache for getBlock/setBlock (invalidated whenever m_Chunks changes).
    Chunk* m_CachedChunk = nullptr;
    int m_CachedChunkX = 0;
    int m_CachedChunkZ = 0;

    // Shared state between main thread and worker tasks (guarded by m_QueueMutex).
    std::mutex m_QueueMutex;
    std::condition_variable m_TasksDone;
    std::vector<std::unique_ptr<Chunk>> m_CompletedChunks;
    size_t m_InFlightTasks = 0;
    std::atomic<bool> m_Shutdown{false};

    std::shared_ptr<ThreadPool> m_ThreadPool;
};

} // namespace Minecraft

#endif // WORLD_HPP
