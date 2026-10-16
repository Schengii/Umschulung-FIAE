#ifndef FLUIDENGINE_HPP
#define FLUIDENGINE_HPP

#include <glm/glm.hpp>

namespace Minecraft {

class World;

class FluidEngine {
public:
    // Water updates on every call; lava only on every 6th call. Resets that cadence (useful for tests).
    static void resetTimers();
    static void updateFluids(World& world, const glm::vec3& playerPos);
    static int getFluidLevel(World& world, int x, int y, int z);
    static float getFluidHeight(World& world, int x, int y, int z);
};

} // namespace Minecraft

#endif // FLUIDENGINE_HPP
