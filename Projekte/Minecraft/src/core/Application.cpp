#include "Application.hpp"

#include "../audio/AudioManager.hpp"
#include "../gui/FontRenderer.hpp"
#include "../inventory/FoodSystem.hpp"
#include "../physics/PhysicsEngine.hpp"
#include "../renderer/EntityRenderer.hpp"
#include "../vendor/glad/glad.h"
#include "../world/ExplosionEngine.hpp"
#include "../world/FluidEngine.hpp"
#include "../world/GameSave.hpp"
#include "../world/Raycast.hpp"
#include "../world/RedstoneEngine.hpp"
#include "../world/StructureGenerator.hpp"
#include "../world/ToolSystem.hpp"
#include "CommandParser.hpp"
#include "Input.hpp"
#include "NetworkCommands.hpp"

#include <algorithm>
#include <cctype>
#include <chrono>
#include <cstdlib>
#include <glm/glm.hpp>
#include <iostream>
#include <memory>

namespace Minecraft {

Application::Application(const ApplicationOptions& options) : m_Options(options) {
    if (!m_Options.seed.empty())
        m_WorldSeed = m_Options.seed;
    if (m_Options.renderDistance > 0)
        m_RenderDistance = m_Options.renderDistance;
    m_Window = std::make_unique<Window>(1280, 720, "Minecraft C++ OpenGL 1:1 Engine");
    Input::init(m_Window->getNativeWindow());
    AudioManager::init();

    m_Camera = std::make_unique<Camera>(glm::vec3(0.0f, 65.0f, 0.0f));
    m_BlockShader = std::make_unique<Shader>("assets/shaders/block.vert", "assets/shaders/block.frag");
    m_ShadowShader = std::make_unique<Shader>("assets/shaders/shadow.vert", "assets/shaders/shadow.frag");
    m_ShadowMap = std::make_unique<ShadowMap>(2048, 2048);
    m_PostProcessing = std::make_unique<PostProcessing>(m_Window->getWidth(), m_Window->getHeight());

    // The DimensionManager (and thus the world) is created by startGame() once a seed was chosen.
    m_TimeManager = std::make_unique<TimeManager>();
    m_WeatherManager = std::make_unique<WeatherManager>();
    m_HUD = std::make_unique<HUD>(m_Window->getWidth(), m_Window->getHeight());
    m_InventoryGUI = std::make_unique<InventoryGUI>(m_Window->getWidth(), m_Window->getHeight());
    m_ContainerGUI = std::make_unique<ContainerGUI>(m_Window->getWidth(), m_Window->getHeight());
    m_MenuGUI = std::make_unique<MenuGUI>(m_Window->getWidth(), m_Window->getHeight());
    m_Skybox = std::make_unique<Skybox>();
    m_Inventory = std::make_unique<Inventory>();
    m_PlayerStats = std::make_unique<PlayerStats>();

    m_MobEngine = std::make_unique<MobEngine>();
    m_ItemEntityManager = std::make_unique<ItemEntityManager>();
    m_ChestManager = std::make_unique<ChestManager>();
    m_FurnaceManager = std::make_unique<FurnaceManager>();
    m_ParticleEngine = std::make_unique<ParticleEngine>();
    m_FrustumCuller = std::make_unique<FrustumCuller>();
    m_NetworkManager = std::make_unique<NetworkManager>();

    EntityRenderer::getInstance().init();
    FontRenderer::getInstance().init();

    applySettings();

    if (m_Options.autoStart) {
        startGame();
        m_State = GameState::Playing;
        m_Window->setCursorCaptured(true);
    }
}

void Application::startGame() {
    m_ActiveSeed = parseSeed(m_WorldSeed);
    m_DimensionManager.reset(); // Flush the previous world (if any) before opening a new one.
    m_DimensionManager =
        std::make_unique<DimensionManager>(m_ActiveSeed, savePathForSeed(m_ActiveSeed), std::min(m_RenderDistance, 4));
    if (World* w = currentWorld())
        w->setRenderDistance(m_RenderDistance);

    m_Inventory = std::make_unique<Inventory>();
    m_PlayerStats = std::make_unique<PlayerStats>();
    m_MobEngine = std::make_unique<MobEngine>();
    m_ItemEntityManager = std::make_unique<ItemEntityManager>();
    m_ChestManager = std::make_unique<ChestManager>();
    m_FurnaceManager = std::make_unique<FurnaceManager>();
    m_TimeManager = std::make_unique<TimeManager>();
    m_WeatherManager = std::make_unique<WeatherManager>();
    m_PlayerVelocity = glm::vec3(0.0f);
    m_IsInventoryOpen = false;
    m_IsFlying = false;
    m_MiningProgress = 0.0f;
    m_Camera->setRotation(-90.0f, 0.0f);

    World* world = currentWorld();
    GameSaveData saved;
    bool restored = GameSave::exists(savePathForSeed(m_ActiveSeed)) &&
                    GameSave::read(saved, savePathForSeed(m_ActiveSeed)) && saved.seed == m_ActiveSeed;

    if (restored) {
        restoreGame(saved);
    } else {
        // Fresh world: starter hotbar & tools, standing on the surface at the world origin.
        m_Inventory->addItem(BlockType::IronPickaxe, 1);
        m_Inventory->addItem(BlockType::WoodAxe, 1);
        m_Inventory->addItem(BlockType::IronSword, 1);
        m_Inventory->addItem(BlockType::CookedPorkchop, 16);
        m_Inventory->addItem(BlockType::OakLog, 32);
        m_Inventory->addItem(BlockType::RedstoneTorch, 16);
        m_Inventory->addItem(BlockType::Chest, 4);
        m_Inventory->addItem(BlockType::Furnace, 2);
        m_Inventory->addItem(BlockType::CraftingTable, 2);
        m_SelectedSlot = 0;
        m_SelectedBlock = m_Inventory->getSlot(0).type;

        if (world) {
            int topY = 0;
            world->getTopBlock(0, 0, topY);
            m_Camera->setPosition(glm::vec3(0.5f, static_cast<float>(topY) + 2.5f, 0.5f));
        }
    }

    // Debug aid: MC_DEBUG_SPAWN=1 spawns a set of test mobs and structures next to the spawn point.
    if (world && std::getenv("MC_DEBUG_SPAWN")) {
        glm::vec3 base = m_Camera->getPosition();
        m_MobEngine->spawnMob(MobType::Zombie, base + glm::vec3(5.0f, 0.0f, 5.0f));
        m_MobEngine->spawnMob(MobType::Skeleton, base + glm::vec3(12.0f, 0.0f, -8.0f));
        m_MobEngine->spawnMob(MobType::Creeper, base + glm::vec3(-10.0f, 0.0f, 10.0f));
        m_MobEngine->spawnMob(MobType::Pig, base + glm::vec3(-5.0f, 0.0f, 3.0f));
        m_MobEngine->spawnMob(MobType::Cow, base + glm::vec3(-8.0f, 0.0f, -4.0f));
        StructureGenerator::generateNetherPortalFrame(*world, -3, static_cast<int>(base.y), -3);
    }

    m_HasActiveGame = true;
}

uint32_t Application::parseSeed(const std::string& text) {
    if (text.empty()) {
        return static_cast<uint32_t>(std::chrono::steady_clock::now().time_since_epoch().count());
    }
    bool numeric = text.size() <= 9;
    for (char c : text) {
        if (c < '0' || c > '9') {
            numeric = false;
            break;
        }
    }
    if (numeric) {
        return static_cast<uint32_t>(std::stoul(text));
    }
    uint32_t hash = 2166136261u; // FNV-1a
    for (unsigned char c : text) {
        hash ^= c;
        hash *= 16777619u;
    }
    return hash;
}

std::string Application::savePathForSeed(uint32_t seed) const {
    return "world_saves/seed_" + std::to_string(seed);
}

void Application::applySettings() {
    if (m_Window)
        m_Window->setVSync(m_VSync);
    if (World* w = currentWorld())
        w->setRenderDistance(m_RenderDistance);
}

void Application::respawnPlayer() {
    World* world = currentWorld();
    if (!world || !m_PlayerStats || !m_Camera)
        return;

    // Back to the Overworld spawn with full stats; the inventory is kept.
    if (m_DimensionManager->getCurrentDimension() != DimensionType::Overworld) {
        m_DimensionManager->switchDimension(DimensionType::Overworld);
        world = currentWorld();
    }
    int topY = 0;
    world->getTopBlock(0, 0, topY);
    m_Camera->setPosition(glm::vec3(0.5f, static_cast<float>(topY) + 2.5f, 0.5f));
    m_PlayerVelocity = glm::vec3(0.0f);
    m_PlayerStats->setHealth(20.0f);
    m_PlayerStats->setHunger(20.0f);
    m_PlayerStats->setOxygen(300.0f);
    m_PlayerStats->setFireTicks(0.0f);
    m_PlayerStats->resetFallDistance();
    AudioManager::playSound(SoundEffect::LevelUp);
    std::cout << "[Player] You died - respawned at the world spawn." << std::endl;
}

void Application::saveGame() {
    if (!m_DimensionManager)
        return;
    m_DimensionManager->saveAll();
    if (!m_HasActiveGame)
        return;

    GameSaveData d;
    d.seed = m_ActiveSeed;
    d.dimension = static_cast<int>(m_DimensionManager->getCurrentDimension());
    d.position = m_Camera->getPosition();
    d.yaw = m_Camera->getYaw();
    d.pitch = m_Camera->getPitch();
    d.health = m_PlayerStats->getHealth();
    d.hunger = m_PlayerStats->getHunger();
    d.timeTicks = m_TimeManager->getTimeTicks();
    d.selectedSlot = m_SelectedSlot;
    d.flying = m_IsFlying;
    for (int i = 0; i < 36; ++i)
        d.inventory.push_back(m_Inventory->getSlot(i));
    for (int i = 0; i < 4; ++i)
        d.armor[i] = m_PlayerStats->getArmorSlot(i);
    d.chests = m_ChestManager->snapshot();
    d.furnaces = m_FurnaceManager->snapshot();
    for (const Mob& mob : m_MobEngine->getMobs()) {
        SavedMob sm;
        sm.type = static_cast<uint8_t>(mob.type);
        sm.position = mob.position;
        sm.health = mob.health;
        sm.maxHealth = mob.maxHealth;
        sm.yaw = mob.yaw;
        sm.age = mob.age;
        sm.saddled = mob.isSaddled;
        d.mobs.push_back(sm);
    }

    if (!GameSave::write(d, savePathForSeed(m_ActiveSeed))) {
        std::cerr << "[Save] Could not write game.dat for seed " << m_ActiveSeed << std::endl;
    }
}

void Application::restoreGame(const GameSaveData& d) {
    if (d.dimension != static_cast<int>(DimensionType::Overworld)) {
        m_DimensionManager->switchDimension(static_cast<DimensionType>(d.dimension));
    }
    m_Camera->setPosition(d.position);
    m_Camera->setRotation(d.yaw, d.pitch);
    m_PlayerStats->setHealth(d.health);
    m_PlayerStats->setHunger(d.hunger);
    m_TimeManager->setTimeOfDay(d.timeTicks);
    m_IsFlying = d.flying;

    for (size_t i = 0; i < d.inventory.size() && i < 36; ++i)
        m_Inventory->getSlot(static_cast<int>(i)) = d.inventory[i];
    for (int i = 0; i < 4; ++i)
        m_PlayerStats->getArmorSlot(i) = d.armor[i];
    for (const auto& [pos, slots] : d.chests)
        m_ChestManager->restore(pos, slots);
    for (const auto& [pos, furnace] : d.furnaces)
        m_FurnaceManager->restore(pos, furnace);
    for (const SavedMob& sm : d.mobs) {
        m_MobEngine->restoreMob(static_cast<MobType>(sm.type), sm.position, sm.health, sm.maxHealth, sm.yaw, sm.age,
                                sm.saddled);
    }

    m_SelectedSlot = std::clamp(d.selectedSlot, 0, 8);
    m_SelectedBlock = m_Inventory->getSlot(m_SelectedSlot).type;
}

void Application::handleSeedTyping() {
    std::string typed = Input::consumeTypedChars();
    for (char c : typed) {
        if (m_WorldSeed.size() < 16 && std::isalnum(static_cast<unsigned char>(c))) {
            m_WorldSeed.push_back(c);
        }
    }
    bool backspace = Input::isKeyPressed(GLFW_KEY_BACKSPACE);
    if (backspace && !m_BackspaceLast && !m_WorldSeed.empty()) {
        m_WorldSeed.pop_back();
    }
    m_BackspaceLast = backspace;
}

Application::~Application() {
    saveGame();
    AudioManager::shutdown();
}

void Application::run() {
    float lastTime = static_cast<float>(glfwGetTime());

    while (!m_Window->shouldClose() && m_IsRunning) {
        float currentTime = static_cast<float>(glfwGetTime());
        float deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // FPS Calculation
        m_FrameCounter++;
        m_FpsTimer += deltaTime;
        if (m_FpsTimer >= 1.0f) {
            m_FPS = m_FrameCounter / m_FpsTimer;
            m_FrameCounter = 0;
            m_FpsTimer = 0.0f;
        }

        m_Window->pollEvents();
        m_HUD->resize(m_Window->getWidth(), m_Window->getHeight());
        m_InventoryGUI->resize(m_Window->getWidth(), m_Window->getHeight());
        m_ContainerGUI->resize(m_Window->getWidth(), m_Window->getHeight());
        if (m_PostProcessing) {
            m_PostProcessing->resize(m_Window->getWidth(), m_Window->getHeight());
        }

        processInput(deltaTime);
        update(deltaTime);
        render();
        m_Window->swapBuffers();

        // Mouse deltas / scroll accumulate between frames; drop whatever the menus left unused.
        Input::updateMouseDelta();
        Input::resetScroll();

        ++m_FramesRendered;
        while (glGetError && glGetError() != GL_NO_ERROR) {
            ++m_GlErrorCount;
        }
        if (m_Options.maxFrames > 0 && m_FramesRendered >= m_Options.maxFrames) {
            m_IsRunning = false;
        }
    }
}

void Application::processInput(float deltaTime) {
    bool escPressedNow = Input::isKeyPressed(GLFW_KEY_ESCAPE);
    if (escPressedNow && !m_EscPressedLast) {
        if (m_State == GameState::Playing) {
            if (m_ChatOpen) {
                m_ChatOpen = false;
                m_ChatInput.clear();
            } else if (m_ContainerGUI->isOpen()) {
                m_ContainerGUI->close();
                m_Window->setCursorCaptured(true);
            } else if (m_IsInventoryOpen) {
                m_IsInventoryOpen = false;
                m_Window->setCursorCaptured(true);
            } else {
                m_State = GameState::Paused;
                m_Window->setCursorCaptured(false);
            }
        } else if (m_State == GameState::Paused) {
            m_State = GameState::Playing;
            m_Window->setCursorCaptured(true);
        } else if (m_State == GameState::SettingsMenu) {
            applySettings();
            m_State = m_HasActiveGame ? GameState::Paused : GameState::MainMenu;
        }
    }
    m_EscPressedLast = escPressedNow;

    if (m_State != GameState::Playing) {
        return;
    }

    // Typed text edits the chat line while it is open; otherwise Enter or '/' opens it.
    if (m_ChatOpen) {
        handleChatInput();
        return;
    }
    {
        std::string typed = Input::consumeTypedChars();
        bool enterNow = Input::isKeyPressed(GLFW_KEY_ENTER);
        bool slashTyped = typed.find('/') != std::string::npos;
        if (!m_IsInventoryOpen && !m_ContainerGUI->isOpen() && ((enterNow && !m_EnterLast) || slashTyped)) {
            m_ChatOpen = true;
            m_ChatInput = slashTyped ? "/" : "";
        }
        m_EnterLast = enterNow;
        if (m_ChatOpen)
            return;
    }

    // Toggle Inventory with 'E' key
    bool ePressedNow = Input::isKeyPressed(GLFW_KEY_E);
    if (ePressedNow && !m_EPressedLast) {
        if (m_ContainerGUI->isOpen()) {
            m_ContainerGUI->close();
            m_Window->setCursorCaptured(true);
        } else {
            m_IsInventoryOpen = !m_IsInventoryOpen;
            m_Window->setCursorCaptured(!m_IsInventoryOpen);
            std::cout << "[GUI] Inventory: " << (m_IsInventoryOpen ? "OPENED" : "CLOSED") << std::endl;
        }
    }
    m_EPressedLast = ePressedNow;

    // The inventory / container screens swallow all other gameplay input.
    if (handleOpenGuis()) {
        return;
    }

    handleHotkeys();
    handleMovement(deltaTime);
    handleWorldInteraction(deltaTime);
}

bool Application::handleOpenGuis() {
    // Handle open Container (Chest/Furnace) GUI
    if (m_ContainerGUI->isOpen()) {
        bool leftMouseNow = Input::isMouseButtonPressed(GLFW_MOUSE_BUTTON_LEFT);
        if (leftMouseNow && !m_LeftMousePressedLast) {
            m_ContainerGUI->handleMouseClick(*m_Inventory, Input::getMouseX(), Input::getMouseY(),
                                             GLFW_MOUSE_BUTTON_LEFT);
        }
        m_LeftMousePressedLast = leftMouseNow;
        return true;
    }

    // Handle open Inventory GUI
    if (m_IsInventoryOpen) {
        bool leftMouseNow = Input::isMouseButtonPressed(GLFW_MOUSE_BUTTON_LEFT);
        if (leftMouseNow && !m_LeftMousePressedLast) {
            m_InventoryGUI->handleMouseClick(*m_Inventory, Input::getMouseX(), Input::getMouseY(),
                                             GLFW_MOUSE_BUTTON_LEFT);
        }
        m_LeftMousePressedLast = leftMouseNow;
        return true;
    }

    return false;
}

void Application::handleHotkeys() {
    // Toggle Flying mode with 'F' key
    bool fPressedNow = Input::isKeyPressed(GLFW_KEY_F);
    if (fPressedNow && !m_FPressedLast) {
        m_IsFlying = !m_IsFlying;
        std::cout << "[Player] Flying Mode: " << (m_IsFlying ? "ENABLED" : "DISABLED") << std::endl;
    }
    m_FPressedLast = fPressedNow;

    // Toggle F3 Debug Info
    bool f3PressedNow = Input::isKeyPressed(GLFW_KEY_F3);
    if (f3PressedNow && !m_F3PressedLast) {
        m_ShowDebugInfo = !m_ShowDebugInfo;
        std::cout << "[Debug HUD] F3 Debug Screen: " << (m_ShowDebugInfo ? "SHOW" : "HIDE") << std::endl;
    }
    m_F3PressedLast = f3PressedNow;

    // F4 Key: Cycle Time of Day
    bool f4PressedNow = Input::isKeyPressed(GLFW_KEY_F4);
    if (f4PressedNow && !m_F4PressedLast) {
        float currentTicks = m_TimeManager->getTimeTicks();
        if (currentTicks < 6000.0f)
            m_TimeManager->setTimeOfDay(6000.0f);
        else if (currentTicks < 12000.0f)
            m_TimeManager->setTimeOfDay(12000.0f);
        else if (currentTicks < 18000.0f)
            m_TimeManager->setTimeOfDay(18000.0f);
        else
            m_TimeManager->setTimeOfDay(0.0f);
    }
    m_F4PressedLast = f4PressedNow;

    // 'T' Key: Fast forward time
    if (Input::isKeyPressed(GLFW_KEY_T)) {
        m_TimeManager->advanceTime(100.0f);
    }

    // Hotbar Block selection (1-9)
    for (int slot = 0; slot < 9; ++slot) {
        if (Input::isKeyPressed(GLFW_KEY_1 + slot)) {
            m_SelectedSlot = slot;
            m_SelectedBlock = m_Inventory->getSlot(slot).type;
        }
    }

    // Mouse Scroll Wheel Hotbar selection
    double scrollY = Input::getScrollY();
    if (scrollY != 0.0) {
        if (scrollY > 0.0) {
            m_SelectedSlot = (m_SelectedSlot - 1 + 9) % 9;
        } else {
            m_SelectedSlot = (m_SelectedSlot + 1) % 9;
        }
        m_SelectedBlock = m_Inventory->getSlot(m_SelectedSlot).type;
    }
}

void Application::handleMovement(float deltaTime) {
    // Movement Controls
    glm::vec3 front = m_Camera->getFront();
    glm::vec3 right = glm::normalize(glm::cross(front, glm::vec3(0, 1, 0)));

    bool isSprinting = Input::isKeyPressed(GLFW_KEY_LEFT_CONTROL);

    if (!m_IsFlying && !m_InWater) {
        front.y = 0.0f;
        front = glm::normalize(front);
    }

    float speed = m_IsFlying ? 15.0f : (m_InWater ? 4.0f : (isSprinting ? 9.0f : 6.0f));

    if (Input::isKeyPressed(GLFW_KEY_W))
        m_PlayerVelocity += front * speed;
    if (Input::isKeyPressed(GLFW_KEY_S))
        m_PlayerVelocity -= front * speed;
    if (Input::isKeyPressed(GLFW_KEY_A))
        m_PlayerVelocity -= right * speed;
    if (Input::isKeyPressed(GLFW_KEY_D))
        m_PlayerVelocity += right * speed;

    if (m_IsFlying) {
        if (Input::isKeyPressed(GLFW_KEY_SPACE))
            m_PlayerVelocity.y += speed;
        if (Input::isKeyPressed(GLFW_KEY_LEFT_SHIFT))
            m_PlayerVelocity.y -= speed;
    } else if (m_InWater) {
        if (Input::isKeyPressed(GLFW_KEY_SPACE)) {
            m_PlayerVelocity.y += 6.0f * deltaTime;
        }
    } else {
        if (Input::isKeyPressed(GLFW_KEY_SPACE) && m_IsGrounded) {
            m_PlayerVelocity.y = 8.5f;
            m_IsGrounded = false;
            if (m_PlayerStats)
                m_PlayerStats->addExhaustion(0.2f);
            AudioManager::playSound(SoundEffect::Jump);
        }
    }

    // Footstep audio on movement
    if (!m_IsFlying && m_PlayerStats) {
        float horizSpeed = glm::length(glm::vec2(m_PlayerVelocity.x, m_PlayerVelocity.z));
        m_PlayerStats->addExhaustion(horizSpeed * deltaTime * (isSprinting ? 0.05f : 0.01f));

        if (m_IsGrounded && horizSpeed > 0.8f) {
            m_StepTimer += deltaTime;
            float stepInterval = isSprinting ? 0.28f : 0.42f;
            if (m_StepTimer >= stepInterval) {
                m_StepTimer = 0.0f;
                World* curWorld = currentWorld();
                BlockType groundType = BlockType::Grass;
                if (curWorld) {
                    int gx = static_cast<int>(std::floor(m_Camera->getPosition().x));
                    int gy = static_cast<int>(std::floor(m_Camera->getPosition().y - 1.2f));
                    int gz = static_cast<int>(std::floor(m_Camera->getPosition().z));
                    groundType = curWorld->getBlock(gx, gy, gz);
                }
                AudioManager::playMaterialFootstep(groundType, m_Camera->getPosition(), m_Camera->getPosition(),
                                                   m_Camera->getFront());
            }
        } else {
            m_StepTimer = 0.0f;
        }
    }

    // Mouse camera look
    if (m_Window->isCursorCaptured()) {
        float dx = static_cast<float>(Input::getMouseDX());
        float dy = static_cast<float>(Input::getMouseDY());
        m_Camera->processMouseMovement(dx, dy);
    }
    // (mouse delta is reset once per frame in run())
}

void Application::handleWorldInteraction(float deltaTime) {
    // Raycast Block & Mob Interactions
    World* world = currentWorld();
    bool leftMouseNow = Input::isMouseButtonPressed(GLFW_MOUSE_BUTTON_LEFT);
    bool rightMouseNow = Input::isMouseButtonPressed(GLFW_MOUSE_BUTTON_RIGHT);

    if (world) {
        // Continuous Left-Click Mining & Attack
        if (leftMouseNow) {
            int damage = ToolSystem::getDamageDealt(m_SelectedBlock);
            bool mobHit = false;
            if (!m_LeftMousePressedLast) {
                mobHit = m_MobEngine->checkPlayerAttack(m_Camera->getPosition(), m_Camera->getFront(), 4.5f, damage,
                                                        m_ItemEntityManager.get());
                if (mobHit) {
                    m_ArmSwingProgress = 0.1f;
                    m_ParticleEngine->spawnHitCrit(m_Camera->getPosition() + m_Camera->getFront() * 2.5f);
                }
            }

            if (!mobHit) {
                RaycastResult hit = Raycast::raycast(*world, m_Camera->getPosition(), m_Camera->getFront(), 5.5f);
                if (hit.hit) {
                    BlockType hitType = world->getBlock(hit.blockPos.x, hit.blockPos.y, hit.blockPos.z);
                    if (hitType != BlockType::Air && (m_IsFlying || !ToolSystem::isUnbreakable(hitType))) {
                        m_ArmSwingProgress += deltaTime * 6.0f;
                        if (m_ArmSwingProgress >= 1.0f)
                            m_ArmSwingProgress = 0.0f;

                        if (hit.blockPos == m_MiningBlockPos) {
                            float hardness = ToolSystem::getBlockHardness(hitType);

                            float speedMult = ToolSystem::getMiningSpeed(hitType, m_SelectedBlock);
                            m_MiningProgress += (deltaTime * speedMult) / hardness;

                            if (rand() % 6 == 0) {
                                m_ParticleEngine->spawnBlockBreak(glm::vec3(hit.blockPos));
                            }

                            if (m_MiningProgress >= 1.0f) {
                                if (ToolSystem::canHarvest(hitType, m_SelectedBlock)) {
                                    m_ItemEntityManager->spawnItemDrop(hitType, 1, glm::vec3(hit.blockPos));
                                }
                                if (m_PlayerStats)
                                    m_PlayerStats->addExhaustion(0.05f);
                                m_ParticleEngine->spawnBlockBreak(glm::vec3(hit.blockPos));
                                std::vector<ItemStack> contents;
                                if (hitType == BlockType::Chest)
                                    contents = m_ChestManager->removeChest(hit.blockPos);
                                else if (hitType == BlockType::Furnace)
                                    contents = m_FurnaceManager->removeFurnace(hit.blockPos);
                                for (const ItemStack& stack : contents) {
                                    m_ItemEntityManager->spawnItemDrop(stack.type, stack.count,
                                                                       glm::vec3(hit.blockPos));
                                }
                                world->setBlock(hit.blockPos.x, hit.blockPos.y, hit.blockPos.z, BlockType::Air);
                                m_NetworkManager->sendBlockChange(hit.blockPos, BlockType::Air);
                                AudioManager::playSound3D(SoundEffect::BlockBreak, glm::vec3(hit.blockPos),
                                                          m_Camera->getPosition(), m_Camera->getFront());
                                m_MiningProgress = 0.0f;
                            }
                        } else {
                            m_MiningBlockPos = hit.blockPos;
                            m_MiningProgress = 0.0f;
                        }
                    }
                } else {
                    m_MiningProgress = 0.0f;
                }
            }
        } else {
            m_MiningProgress = 0.0f;
        }

        // Right-Click Actions (Place block, Eat food, Open Container)
        if (rightMouseNow && !m_RightMousePressedLast) {
            if (FoodSystem::isFood(m_SelectedBlock)) {
                if (m_PlayerStats && FoodSystem::eatFood(*m_PlayerStats, m_SelectedBlock)) {
                    auto& slot = m_Inventory->getSlot(m_SelectedSlot);
                    if (!slot.isEmpty()) {
                        slot.count--;
                        if (slot.count == 0)
                            slot.clear();
                    }
                    m_SelectedBlock = m_Inventory->getSlot(m_SelectedSlot).type;
                    AudioManager::playSound(SoundEffect::Footstep);
                }
            } else {
                RaycastResult hit = Raycast::raycast(*world, m_Camera->getPosition(), m_Camera->getFront(), 5.5f);
                if (hit.hit) {
                    BlockType hitType = world->getBlock(hit.blockPos.x, hit.blockPos.y, hit.blockPos.z);
                    if (hitType == BlockType::Chest) {
                        m_ChestManager->createChest(hit.blockPos);
                        m_ContainerGUI->openChest(hit.blockPos, m_ChestManager->getChestInventory(hit.blockPos));
                        m_Window->setCursorCaptured(false);
                        AudioManager::playSound3D(SoundEffect::ChestOpen, glm::vec3(hit.blockPos),
                                                  m_Camera->getPosition(), m_Camera->getFront());
                    } else if (hitType == BlockType::Furnace) {
                        m_ContainerGUI->openFurnace(hit.blockPos, m_FurnaceManager->getFurnace(hit.blockPos));
                        m_Window->setCursorCaptured(false);
                        AudioManager::playSound3D(SoundEffect::ChestOpen, glm::vec3(hit.blockPos),
                                                  m_Camera->getPosition(), m_Camera->getFront());
                    } else if (hitType == BlockType::Lever) {
                        RedstoneEngine::updateRedstoneNetwork(*world, hit.blockPos);
                        AudioManager::playSound3D(SoundEffect::BlockPlace, glm::vec3(hit.blockPos),
                                                  m_Camera->getPosition(), m_Camera->getFront());
                    } else if (hitType == BlockType::TNT) {
                        ExplosionEngine::createExplosion(*world, glm::vec3(hit.blockPos) + glm::vec3(0.5f), 4.0f,
                                                         &m_PlayerVelocity, &m_Camera->getPosition());
                    } else {
                        BlockType toPlace = m_SelectedBlock;
                        if (toPlace != BlockType::Air && !ToolSystem::isTool(toPlace)) {
                            world->setBlock(hit.previousPos.x, hit.previousPos.y, hit.previousPos.z, toPlace);
                            m_NetworkManager->sendBlockChange(hit.previousPos, toPlace);
                            RedstoneEngine::updateRedstoneNetwork(*world, hit.previousPos);
                            AudioManager::playSound3D(SoundEffect::BlockPlace, glm::vec3(hit.previousPos),
                                                      m_Camera->getPosition(), m_Camera->getFront());

                            auto& slot = m_Inventory->getSlot(m_SelectedSlot);
                            if (!slot.isEmpty() && !m_IsFlying) {
                                slot.count--;
                                if (slot.count == 0)
                                    slot.clear();
                                m_SelectedBlock = slot.type;
                            }
                        }
                    }
                }
            }
        }
    }

    m_LeftMousePressedLast = leftMouseNow;
    m_RightMousePressedLast = rightMouseNow;
}

void Application::update(float deltaTime) {
    // Menus and the pause screen freeze the simulation.
    if (m_State != GameState::Playing || !m_DimensionManager) {
        return;
    }

    if (m_TimeManager) {
        m_TimeManager->update(deltaTime);
    }

    if (m_FurnaceManager) {
        m_FurnaceManager->update(deltaTime);
    }

    if (m_PlayerStats) {
        m_PlayerStats->update(deltaTime);
    }

    World* world = currentWorld();

    if (world && m_Camera) {
        glm::vec3 currentPos = m_Camera->getPosition();

        // Wait for the chunk under the player to stream in; otherwise they would fall through the void.
        if (!world->getChunk(static_cast<int>(std::floor(currentPos.x)) >> 4,
                             static_cast<int>(std::floor(currentPos.z)) >> 4)) {
            m_DimensionManager->update(currentPos, deltaTime);
            return;
        }

        bool isSneaking = !m_IsFlying && Input::isKeyPressed(GLFW_KEY_LEFT_SHIFT);
        bool isGliding = (m_PlayerStats && m_PlayerStats->isGliding());
        bool wasGrounded = m_IsGrounded;
        PhysicsEngine::updatePlayer(*world, currentPos, m_PlayerVelocity, m_IsGrounded, m_InWater, m_IsFlying,
                                    isSneaking, deltaTime, isGliding, m_Camera->getFront());

        // Fall Damage Tracking
        if (m_PlayerStats && !m_IsFlying && !m_InWater) {
            if (!m_IsGrounded && m_PlayerVelocity.y < 0.0f) {
                m_PlayerStats->addFallDistance(-m_PlayerVelocity.y * deltaTime);
            } else if (m_IsGrounded && !wasGrounded) {
                float dmg = m_PlayerStats->applyFallDamage(m_PlayerStats->getFallDistance());
                if (dmg > 0.0f) {
                    AudioManager::playSound(SoundEffect::MobHit);
                }
                m_PlayerStats->resetFallDistance();
            }
        } else if (m_PlayerStats) {
            m_PlayerStats->resetFallDistance();
        }

        if (m_PlayerStats && m_PlayerStats->getHealth() <= 0.0f) {
            respawnPlayer();
            return;
        }

        // Environmental Effects: Oxygen / Drowning / Fire / Lava
        if (m_PlayerStats) {
            bool isHeadUnderwater = PhysicsEngine::isHeadUnderwater(*world, currentPos);
            bool inLava = PhysicsEngine::isPointInLava(*world, currentPos + glm::vec3(0.0f, 0.5f, 0.0f));
            m_PlayerStats->updateEnvironmentalEffects(isHeadUnderwater, inLava, m_InWater, deltaTime);
        }

        // Fluid simulation step
        // Fluids tick at 4 Hz (like the 5-game-tick water rate) instead of scanning every frame.
        m_FluidTimer += deltaTime;
        if (m_FluidTimer >= 0.25f) {
            m_FluidTimer = 0.0f;
            FluidEngine::updateFluids(*world, currentPos);
        }

        // Weather Manager update
        if (m_WeatherManager) {
            m_WeatherManager->update(currentPos, deltaTime);
        }

        // Mob Engine update & AI
        if (m_MobEngine) {
            float playerHp = m_PlayerStats ? m_PlayerStats->getHealth() : 20.0f;
            m_MobEngine->update(*world, currentPos, m_PlayerVelocity, playerHp, deltaTime, m_ItemEntityManager.get());
            if (m_PlayerStats)
                m_PlayerStats->setHealth(playerHp);
        }

        // Dropped Items update
        if (m_ItemEntityManager) {
            std::vector<std::pair<BlockType, int>> pickedUp;
            m_ItemEntityManager->update(*world, currentPos, pickedUp, deltaTime);
            for (auto& [type, count] : pickedUp) {
                m_Inventory->addItem(type, count);
            }
        }

        // Nether & End portal teleport check
        glm::vec3 telePos;
        if (m_DimensionManager->checkPortalTeleport(currentPos, telePos)) {
            currentPos = telePos;
            m_PlayerVelocity = glm::vec3(0.0f);
        }

        // Particle Engine update
        if (m_ParticleEngine) {
            m_ParticleEngine->update(deltaTime);
        }

        // Network manager update; our own position goes out 20 times per second
        if (m_NetworkManager) {
            m_NetworkManager->update(world);
            m_NetSendTimer += deltaTime;
            if (m_NetSendTimer >= 0.05f) {
                m_NetSendTimer = 0.0f;
                if (m_NetworkManager->isConnected()) {
                    m_NetworkManager->sendPlayerPosition(currentPos, m_Camera->getYaw(), m_Camera->getPitch());
                }
            }
        }

        for (ConsoleLine& line : m_ConsoleLines)
            line.age += deltaTime;
        m_ConsoleLines.erase(std::remove_if(m_ConsoleLines.begin(), m_ConsoleLines.end(),
                                            [](const ConsoleLine& l) { return l.age > 10.0f; }),
                             m_ConsoleLines.end());

        // Update Walk Bobbing animation
        float horizSpeed = glm::length(glm::vec2(m_PlayerVelocity.x, m_PlayerVelocity.z));
        if (m_IsGrounded && horizSpeed > 0.5f) {
            m_WalkBobbing += deltaTime * 12.0f;
        } else {
            m_WalkBobbing = 0.0f;
        }

        // Only move the camera; re-constructing it would reset yaw/pitch every frame.
        m_Camera->setPosition(currentPos);

        m_DimensionManager->update(currentPos, deltaTime);
    }
}

void Application::render() {
    World* world = currentWorld();
    glm::vec3 skyColor = m_TimeManager->getSkyColor();
    float currentTime = static_cast<float>(glfwGetTime());

    DimensionType dimension = m_DimensionManager ? m_DimensionManager->getCurrentDimension() : DimensionType::Overworld;
    if (dimension == DimensionType::Nether) {
        skyColor = glm::vec3(0.18f, 0.04f, 0.04f);
    } else if (dimension == DimensionType::TheEnd) {
        skyColor = glm::vec3(0.06f, 0.02f, 0.09f);
    }

    // 1. Shadow Map Pass
    if (m_ShadowMap && m_ShadowShader && world) {
        m_ShadowMap->bindForWriting();
        m_ShadowShader->use();
        glm::mat4 lightSpaceMatrix =
            m_ShadowMap->getLightSpaceMatrix(m_TimeManager->getSunDirection(), m_Camera->getPosition());
        m_ShadowShader->setMat4("u_LightSpaceMatrix", lightSpaceMatrix);
        m_ShadowShader->setMat4("u_Model", glm::mat4(1.0f));
        world->renderShadowCasters(m_Camera->getPosition(), 100.0f);
        m_ShadowMap->unbind(m_Window->getWidth(), m_Window->getHeight());
    }

    // 2. Offscreen Framebuffer Pass (Post Processing)
    if (m_PostProcessing) {
        m_PostProcessing->bindForWriting();
    }

    glClearColor(skyColor.r, skyColor.g, skyColor.b, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // 3. Render 3D World
    if (m_BlockShader && m_Camera && world && m_TimeManager) {
        m_BlockShader->use();

        glm::mat4 projection = m_Camera->getProjectionMatrix(m_Window->getAspectRatio(), m_FOV);
        glm::mat4 view = m_Camera->getViewMatrix();
        glm::mat4 model = glm::mat4(1.0f);

        if (m_FrustumCuller) {
            m_FrustumCuller->update(projection * view);
        }

        world->updateVisibility(m_Camera->getPosition(), m_FrustumCuller.get());

        m_BlockShader->setMat4("u_Projection", projection);
        m_BlockShader->setMat4("u_View", view);
        m_BlockShader->setMat4("u_Model", model);

        m_BlockShader->setVec3("u_SunDirection", m_TimeManager->getSunDirection());
        m_BlockShader->setVec3("u_SunColor", m_TimeManager->getSunColor());
        m_BlockShader->setVec3("u_SkyColor", skyColor);
        m_BlockShader->setFloat("u_AmbientLight", m_TimeManager->getAmbientLight());
        m_BlockShader->setBool("u_IsUnderwater", m_InWater);

        bool holdingTorch = (m_SelectedBlock == BlockType::RedstoneTorch || m_SelectedBlock == BlockType::RedstoneWire);
        m_BlockShader->setVec3("u_PlayerPos", m_Camera->getPosition());
        m_BlockShader->setBool("u_HasHandheldLight", holdingTorch);

        if (m_ShadowMap && glActiveTexture) {
            glActiveTexture(GL_TEXTURE0 + 1);
            glBindTexture(GL_TEXTURE_2D, m_ShadowMap->getDepthMapTexture());
            m_BlockShader->setInt("u_ShadowMap", 1);
            glm::mat4 lightSpaceMatrix =
                m_ShadowMap->getLightSpaceMatrix(m_TimeManager->getSunDirection(), m_Camera->getPosition());
            m_BlockShader->setMat4("u_LightSpaceMatrix", lightSpaceMatrix);
        }

        // Render Opaque World Geometry
        world->render(m_FrustumCuller.get());

        // Render 3D Entities, Mobs, Items, Arrows, Wither & Remote Players
        if (m_MobEngine && m_ItemEntityManager) {
            EntityRenderer::getInstance().render(*m_Camera, *m_MobEngine, *m_ItemEntityManager, currentTime,
                                                 m_NetworkManager.get());
        }

        // Render 3D Procedural Skybox Clouds at Y=128
        if (m_Skybox) {
            m_Skybox->renderClouds(*m_Camera, m_TimeManager->getTimeOfDay(), currentTime);
        }

        // Render 3D View-space First-Person Hand & Held Item Model
        if (!m_IsInventoryOpen && !m_ContainerGUI->isOpen()) {
            EntityRenderer::getInstance().renderFirstPersonHand(*m_Camera, m_SelectedBlock, m_ArmSwingProgress,
                                                                m_WalkBobbing, currentTime);
        }

        // 3D Particles
        if (m_ParticleEngine) {
            m_ParticleEngine->render(*m_Camera);
        }

        // Transparent pass (water, glass)
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        world->renderTransparent(m_FrustumCuller.get(), &m_Camera->getPosition());
        glDisable(GL_BLEND);
    }

    // Render screen quad with Post-Processing
    if (m_PostProcessing) {
        m_PostProcessing->unbindAndRender(m_InWater, m_PlayerStats && m_PlayerStats->hasNightVision(),
                                          m_PostProcessing->isBloomEnabled(), m_PostProcessing->isSSAOEnabled(),
                                          m_PostProcessing->isGodRaysEnabled());
    }

    // 4. Render 2D HUD Layer
    if (m_HUD && m_Camera && !m_IsInventoryOpen && !m_ContainerGUI->isOpen() && m_State == GameState::Playing) {
        float hp = m_PlayerStats ? m_PlayerStats->getHealth() : 20.0f;
        float hunger = m_PlayerStats ? m_PlayerStats->getHunger() : 20.0f;
        m_HUD->render(m_SelectedSlot, m_ShowDebugInfo, m_FPS, m_Camera->getPosition(), m_Camera->getFront(), m_IsFlying,
                      hp, hunger, m_Inventory.get());
        drawConsole();
    }

    // 5. Render 2D Inventory GUI Layer
    if (m_InventoryGUI && m_Inventory && m_State == GameState::Playing && m_IsInventoryOpen) {
        m_InventoryGUI->render(*m_Inventory, m_IsInventoryOpen);
    }

    // 6. Render Container GUI Layer (Chest / Furnace)
    if (m_ContainerGUI && m_Inventory && m_State == GameState::Playing && m_ContainerGUI->isOpen()) {
        m_ContainerGUI->render(*m_Inventory);
    }

    // 7. Render Menu GUI Layer
    if (m_MenuGUI) {
        m_MenuGUI->resize(m_Window->getWidth(), m_Window->getHeight());
        double mx = Input::getMouseX();
        double my = Input::getMouseY();
        // Menus react to the press edge only; a held button must not re-trigger every frame.
        bool mouseDown = Input::isMouseButtonPressed(GLFW_MOUSE_BUTTON_LEFT);
        bool mouseClicked = mouseDown && !m_MenuMouseLast;
        m_MenuMouseLast = mouseDown;

        if (m_State == GameState::MainMenu) {
            m_Window->setCursorCaptured(false);
            handleSeedTyping();
            MenuAction action = m_MenuGUI->renderMainMenu(mx, my, mouseClicked, m_WorldSeed);
            if (action == MenuAction::StartNewWorld) {
                startGame();
                m_State = GameState::Playing;
                m_Window->setCursorCaptured(true);
            } else if (action == MenuAction::OpenSettings) {
                m_State = GameState::SettingsMenu;
            } else if (action == MenuAction::QuitGame) {
                m_IsRunning = false;
            }
        } else if (m_State == GameState::Paused) {
            MenuAction action = m_MenuGUI->renderPauseMenu(mx, my, mouseClicked);
            if (action == MenuAction::ResumeGame) {
                m_State = GameState::Playing;
                m_Window->setCursorCaptured(true);
            } else if (action == MenuAction::OpenSettings) {
                m_State = GameState::SettingsMenu;
            } else if (action == MenuAction::QuitGame) {
                saveGame();
                m_HasActiveGame = false;
                m_State = GameState::MainMenu;
            }
        } else if (m_State == GameState::SettingsMenu) {
            MenuAction action = m_MenuGUI->renderSettingsMenu(mx, my, mouseClicked, m_RenderDistance, m_FOV, m_VSync);
            if (action == MenuAction::CloseSettings) {
                applySettings();
                m_State = m_HasActiveGame ? GameState::Paused : GameState::MainMenu;
            }
        }
    }
}

void Application::addConsoleLine(const std::string& text) {
    m_ConsoleLines.push_back({text, 0.0f});
    if (m_ConsoleLines.size() > 8)
        m_ConsoleLines.erase(m_ConsoleLines.begin());
}

void Application::handleChatInput() {
    std::string typed = Input::consumeTypedChars();
    for (char c : typed) {
        if (c >= 32 && c < 127 && m_ChatInput.size() < 200)
            m_ChatInput.push_back(c);
    }

    bool backspace = Input::isKeyPressed(GLFW_KEY_BACKSPACE);
    if (backspace && !m_BackspaceLast && !m_ChatInput.empty())
        m_ChatInput.pop_back();
    m_BackspaceLast = backspace;

    bool enter = Input::isKeyPressed(GLFW_KEY_ENTER);
    if (enter && !m_EnterLast) {
        std::string text = m_ChatInput;
        m_ChatOpen = false;
        m_ChatInput.clear();
        if (!text.empty())
            submitChat(text);
    }
    m_EnterLast = enter;
}

void Application::submitChat(const std::string& text) {
    if (text.empty())
        return;
    if (text == "/occlusion" || text.rfind("/occlusion ", 0) == 0) {
        World* world = currentWorld();
        if (text.find(" off") != std::string::npos) {
            if (world)
                world->setOcclusionCulling(false);
        } else if (text.find(" on") != std::string::npos) {
            if (world)
                world->setOcclusionCulling(true);
        }
        addConsoleLine(world
                           ? std::string("Occlusion culling: ") + (world->isOcclusionCullingEnabled() ? "on" : "off") +
                                 " (" + std::to_string(world->getVisibleSectionCount()) + " sections visible)"
                           : "No world loaded");
        return;
    }
    if (text[0] == '/') {
        NetworkCommands::Result net = NetworkCommands::run(text, *m_NetworkManager);
        if (net.handled) {
            addConsoleLine(net.message);
            return;
        }
        addConsoleLine(executeCommand(text) ? text : "Unknown or invalid command: " + text);
        return;
    }
    if (m_NetworkManager->isConnected()) {
        m_NetworkManager->sendChatMessage(text);
    } else {
        addConsoleLine("<You> " + text);
    }
}

void Application::drawConsole() {
    const float height = static_cast<float>(m_Window->getHeight());
    const glm::vec4 white(1.0f);
    std::vector<std::string> lines;
    for (const ConsoleLine& l : m_ConsoleLines)
        lines.push_back(l.text);
    if (m_NetworkManager->isConnected()) {
        const auto& log = m_NetworkManager->getChatLog();
        size_t from = log.size() > 5 ? log.size() - 5 : 0;
        for (size_t i = from; i < log.size(); ++i)
            lines.push_back(log[i]);
    }
    if (lines.size() > 8)
        lines.erase(lines.begin(), lines.end() - 8);
    if (lines.empty() && !m_ChatOpen)
        return;

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glDisable(GL_DEPTH_TEST);
    float y = height - 70.0f - 14.0f * static_cast<float>(lines.size());
    for (const std::string& line : lines) {
        FontRenderer::getInstance().renderText(line, 10.0f, y, 1.0f, white);
        y += 14.0f;
    }
    if (m_ChatOpen) {
        FontRenderer::getInstance().renderText("> " + m_ChatInput + "_", 10.0f, height - 50.0f, 1.0f,
                                               glm::vec4(1.0f, 1.0f, 0.6f, 1.0f));
    }
    glEnable(GL_DEPTH_TEST);
}

bool Application::executeCommand(const std::string& cmd) {
    return CommandParser::execute(cmd, m_TimeManager.get(), m_WeatherManager.get(), m_PlayerStats.get(),
                                  m_Inventory.get(), m_Camera.get(), &m_IsFlying);
}

} // namespace Minecraft
