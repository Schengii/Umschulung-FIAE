#ifndef DIMENSIONMANAGER_HPP
#define DIMENSIONMANAGER_HPP

#include "World.hpp"

#include <glm/glm.hpp>
#include <memory>

namespace Minecraft {

enum class DimensionType { Overworld, Nether, TheEnd };

class DimensionManager {
public:
    // Each dimension keeps its own region files below `baseSaveDir` and shares one worker pool.
    explicit DimensionManager(uint32_t seed = World::DEFAULT_SEED, std::string baseSaveDir = "world_saves",
                              int overworldRenderDistance = 4);
    ~DimensionManager();

    void update(const glm::vec3& playerPos, float deltaTime);
    void switchDimension(DimensionType newDim);

    World* getCurrentWorld() { return m_CurrentWorld.get(); }
    uint32_t getSeed() const { return m_Seed; }
    void saveAll();
    DimensionType getCurrentDimension() const { return m_CurrentDimension; }
    bool checkPortalTeleport(const glm::vec3& playerPos, glm::vec3& outTeleportPos);

private:
    uint32_t m_Seed;
    DimensionType m_CurrentDimension = DimensionType::Overworld;
    std::unique_ptr<World> m_Overworld;
    std::unique_ptr<World> m_NetherWorld;
    std::unique_ptr<World> m_EndWorld;
    std::unique_ptr<World> m_CurrentWorld;

    void generateNetherTerrain(World& nether);
    void generateEndTerrain(World& endWorld);
};

} // namespace Minecraft

#endif // DIMENSIONMANAGER_HPP
