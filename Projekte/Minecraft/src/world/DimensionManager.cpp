#include "DimensionManager.hpp"

#include "../audio/AudioManager.hpp"
#include "StructureGenerator.hpp"

#include <filesystem>
#include <fstream>
#include <iostream>

namespace Minecraft {

DimensionManager::DimensionManager(uint32_t seed, std::string baseSaveDir, int overworldRenderDistance) : m_Seed(seed) {
    auto pool = std::make_shared<ThreadPool>(4);
    m_Overworld = std::make_unique<World>(overworldRenderDistance, seed, baseSaveDir + "/overworld", pool);
    m_NetherWorld = std::make_unique<World>(2, seed, baseSaveDir + "/nether", pool);
    m_EndWorld = std::make_unique<World>(2, seed, baseSaveDir + "/end", pool);

    // The hand-built spawn layouts are generated once per save; afterwards the saved chunks win,
    // otherwise every launch would overwrite whatever the player built there.
    auto generateOnce = [this](World& world, void (DimensionManager::*generate)(World&)) {
        namespace fs = std::filesystem;
        const fs::path marker = fs::path(world.getSaveDir()) / ".terrain_generated";
        if (fs::exists(marker))
            return;
        (this->*generate)(world);
        world.saveAll();
        std::error_code ec;
        fs::create_directories(world.getSaveDir(), ec);
        std::ofstream(marker).put('1');
    };
    generateOnce(*m_NetherWorld, &DimensionManager::generateNetherTerrain);
    generateOnce(*m_EndWorld, &DimensionManager::generateEndTerrain);

    m_CurrentWorld = std::move(m_Overworld);
}

DimensionManager::~DimensionManager() = default;

void DimensionManager::saveAll() {
    for (World* w : {m_Overworld.get(), m_NetherWorld.get(), m_EndWorld.get(), m_CurrentWorld.get()}) {
        if (w)
            w->saveAll();
    }
}

void DimensionManager::update(const glm::vec3& playerPos, float deltaTime) {
    if (m_CurrentWorld) {
        m_CurrentWorld->update(playerPos);
    }
}

void DimensionManager::switchDimension(DimensionType newDim) {
    if (m_CurrentDimension == newDim)
        return;

    // Save current world into its proper slot
    if (m_CurrentDimension == DimensionType::Overworld) {
        m_Overworld = std::move(m_CurrentWorld);
    } else if (m_CurrentDimension == DimensionType::Nether) {
        m_NetherWorld = std::move(m_CurrentWorld);
    } else if (m_CurrentDimension == DimensionType::TheEnd) {
        m_EndWorld = std::move(m_CurrentWorld);
    }

    // Load new world into active slot
    if (newDim == DimensionType::Nether) {
        m_CurrentWorld = std::move(m_NetherWorld);
        m_CurrentDimension = DimensionType::Nether;
        std::cout << "[DimensionManager] Teleported to THE NETHER!" << std::endl;
    } else if (newDim == DimensionType::TheEnd) {
        m_CurrentWorld = std::move(m_EndWorld);
        m_CurrentDimension = DimensionType::TheEnd;
        std::cout << "[DimensionManager] Teleported to THE END!" << std::endl;
    } else {
        m_CurrentWorld = std::move(m_Overworld);
        m_CurrentDimension = DimensionType::Overworld;
        std::cout << "[DimensionManager] Teleported to OVERWORLD!" << std::endl;
    }
    AudioManager::playSound(SoundEffect::Explosion);
}

bool DimensionManager::checkPortalTeleport(const glm::vec3& playerPos, glm::vec3& outTeleportPos) {
    if (!m_CurrentWorld)
        return false;
    int px = static_cast<int>(std::floor(playerPos.x));
    int py = static_cast<int>(std::floor(playerPos.y));
    int pz = static_cast<int>(std::floor(playerPos.z));

    BlockType currentBlock = m_CurrentWorld->getBlock(px, py, pz);

    if (currentBlock == BlockType::NetherPortal) {
        if (m_CurrentDimension == DimensionType::Overworld) {
            outTeleportPos = glm::vec3(px / 8.0f, 40.0f, pz / 8.0f);
            switchDimension(DimensionType::Nether);
        } else {
            outTeleportPos = glm::vec3(px * 8.0f, 65.0f, pz * 8.0f);
            switchDimension(DimensionType::Overworld);
        }
        return true;
    } else if (currentBlock == BlockType::EndPortal) {
        if (m_CurrentDimension == DimensionType::Overworld) {
            outTeleportPos = glm::vec3(0.0f, 60.0f, 0.0f);
            switchDimension(DimensionType::TheEnd);
        } else {
            outTeleportPos = glm::vec3(0.0f, 65.0f, 0.0f);
            switchDimension(DimensionType::Overworld);
        }
        return true;
    }
    return false;
}

void DimensionManager::generateNetherTerrain(World& nether) {
    // Fill Nether with Netherrack, Lava, SoulSand, and Glowstone
    for (int x = -16; x < 16; ++x) {
        for (int z = -16; z < 16; ++z) {
            nether.setBlock(x, 0, z, BlockType::Bedrock);
            nether.setBlock(x, 127, z, BlockType::Bedrock);

            for (int y = 1; y < 15; ++y) {
                nether.setBlock(x, y, z, BlockType::Lava);
            }
            for (int y = 15; y < 45; ++y) {
                if ((x + z) % 3 == 0)
                    nether.setBlock(x, y, z, BlockType::SoulSand);
                else
                    nether.setBlock(x, y, z, BlockType::Netherrack);
            }
            for (int y = 45; y < 90; ++y) {
                nether.setBlock(x, y, z, BlockType::Air); // Nether cave space
            }
            for (int y = 90; y < 127; ++y) {
                if (y == 100 && (x * z) % 5 == 0)
                    nether.setBlock(x, y, z, BlockType::Glowstone);
                else
                    nether.setBlock(x, y, z, BlockType::Netherrack);
            }
        }
    }
    // Generate Nether Portal at spawn
    StructureGenerator::generateNetherPortalFrame(nether, 0, 40, 0);
}

void DimensionManager::generateEndTerrain(World& endWorld) {
    // Generate Floating End Island with EndStone and Obsidian Pillars
    for (int x = -20; x <= 20; ++x) {
        for (int z = -20; z <= 20; ++z) {
            float distSq = static_cast<float>(x * x + z * z);
            if (distSq <= 300.0f) {
                // Island core (End Stone)
                int depth = 55 - static_cast<int>(distSq * 0.04f);
                for (int y = depth; y <= 58; ++y) {
                    endWorld.setBlock(x, y, z, BlockType::EndStone);
                }
            }
        }
    }

    // 4 Obsidian Pillars around the main island
    int pillarCoords[4][2] = {{10, 10}, {-10, 10}, {10, -10}, {-10, -10}};
    for (const auto& coord : pillarCoords) {
        int px = coord[0];
        int pz = coord[1];
        for (int py = 58; py <= 75; ++py) {
            endWorld.setBlock(px, py, pz, BlockType::Obsidian);
            endWorld.setBlock(px + 1, py, pz, BlockType::Obsidian);
            endWorld.setBlock(px, py, pz + 1, BlockType::Obsidian);
            endWorld.setBlock(px + 1, py, pz + 1, BlockType::Obsidian);
        }
        // Glowing crystal atop pillar
        endWorld.setBlock(px, 76, pz, BlockType::Glowstone);
    }

    // Central Exit End Portal
    for (int px = -1; px <= 1; ++px) {
        for (int pz = -1; pz <= 1; ++pz) {
            endWorld.setBlock(px, 58, pz, BlockType::EndPortal);
        }
    }
    endWorld.setBlock(0, 59, 0, BlockType::Bedrock);
}

} // namespace Minecraft
