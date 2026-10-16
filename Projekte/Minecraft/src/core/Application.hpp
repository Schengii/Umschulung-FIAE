#ifndef APPLICATION_HPP
#define APPLICATION_HPP

#include "../ecs/ItemEntity.hpp"
#include "../ecs/MobEngine.hpp"
#include "../gui/ContainerGUI.hpp"
#include "../gui/HUD.hpp"
#include "../gui/InventoryGUI.hpp"
#include "../gui/MenuGUI.hpp"
#include "../inventory/Inventory.hpp"
#include "../inventory/PlayerStats.hpp"
#include "../net/NetworkManager.hpp"
#include "../renderer/Camera.hpp"
#include "../renderer/FrustumCuller.hpp"
#include "../renderer/ParticleEngine.hpp"
#include "../renderer/PostProcessing.hpp"
#include "../renderer/Shader.hpp"
#include "../renderer/ShadowMap.hpp"
#include "../renderer/Skybox.hpp"
#include "../vendor/glad/glad.h"
#include "../world/Block.hpp"
#include "../world/ChestBlock.hpp"
#include "../world/DimensionManager.hpp"
#include "../world/FurnaceBlock.hpp"
#include "../world/TimeManager.hpp"
#include "../world/WeatherManager.hpp"
#include "../world/World.hpp"
#include "ThreadPool.hpp"
#include "Window.hpp"

#include <glm/glm.hpp>
#include <memory>

namespace Minecraft {

struct GameSaveData;

enum class GameState { MainMenu, SettingsMenu, Playing, Paused };

// Command line options, mainly for automated smoke tests.
struct ApplicationOptions {
    bool autoStart = false; // skip the main menu and start a world immediately
    int maxFrames = 0;      // > 0: exit after this many frames
    std::string seed;       // overrides the default menu seed when non-empty
    int renderDistance = 0; // > 0: overrides the default render distance
};

class Application {
public:
    explicit Application(const ApplicationOptions& options);
    // Parses a menu seed string: numeric text is used as-is, anything else is hashed (FNV-1a).
    static uint32_t seedFromString(const std::string& text) { return parseSeed(text); }

    Application() : Application(ApplicationOptions{}) {}
    ~Application();

    void run();
    int getGlErrorCount() const { return m_GlErrorCount; }
    int getFramesRendered() const { return m_FramesRendered; }
    bool executeCommand(const std::string& cmd);

private:
    void processInput(float deltaTime);
    bool handleOpenGuis();                        // returns true when a GUI consumed this frame's input
    void handleHotkeys();                         // fly / debug / time / hotbar keys and mouse wheel
    void handleMovement(float deltaTime);         // WASD, jump, swim, footsteps, mouse look
    void handleWorldInteraction(float deltaTime); // mining, attacking, placing, using blocks
    void update(float deltaTime);
    void render();

    // World lifecycle: a world exists only after "Play" was chosen in the main menu.
    World* currentWorld() { return m_DimensionManager ? m_DimensionManager->getCurrentWorld() : nullptr; }
    void startGame();
    void respawnPlayer();

    // In-game chat / command line ('/' or Enter opens it, Enter sends, Esc cancels).
    void handleChatInput();
    void submitChat(const std::string& text);
    void addConsoleLine(const std::string& text);
    void drawConsole();
    void saveGame();
    void restoreGame(const GameSaveData& data);
    void applySettings();
    void handleSeedTyping();
    static uint32_t parseSeed(const std::string& text);
    std::string savePathForSeed(uint32_t seed) const;

    std::unique_ptr<Window> m_Window;
    std::unique_ptr<Shader> m_BlockShader;
    std::unique_ptr<Shader> m_ShadowShader;
    std::unique_ptr<ShadowMap> m_ShadowMap;
    std::unique_ptr<PostProcessing> m_PostProcessing;
    std::unique_ptr<Skybox> m_Skybox;
    std::unique_ptr<Camera> m_Camera;
    std::unique_ptr<DimensionManager> m_DimensionManager;
    std::unique_ptr<TimeManager> m_TimeManager;
    std::unique_ptr<WeatherManager> m_WeatherManager;
    std::unique_ptr<HUD> m_HUD;
    std::unique_ptr<InventoryGUI> m_InventoryGUI;
    std::unique_ptr<ContainerGUI> m_ContainerGUI;
    std::unique_ptr<MenuGUI> m_MenuGUI;
    std::unique_ptr<Inventory> m_Inventory;
    std::unique_ptr<PlayerStats> m_PlayerStats;
    std::unique_ptr<MobEngine> m_MobEngine;
    std::unique_ptr<ItemEntityManager> m_ItemEntityManager;
    std::unique_ptr<ChestManager> m_ChestManager;
    std::unique_ptr<FurnaceManager> m_FurnaceManager;
    std::unique_ptr<ParticleEngine> m_ParticleEngine;
    std::unique_ptr<FrustumCuller> m_FrustumCuller;
    std::unique_ptr<NetworkManager> m_NetworkManager;

    GameState m_State = GameState::MainMenu;
    bool m_IsRunning = true;
    bool m_IsFlying = true;
    bool m_IsGrounded = false;
    bool m_InWater = false;
    bool m_ShowDebugInfo = false;
    bool m_IsInventoryOpen = false;

    int m_RenderDistance = 8;
    float m_FOV = 75.0f;
    bool m_VSync = true;
    std::string m_WorldSeed = "12345";
    uint32_t m_ActiveSeed = 0;
    bool m_HasActiveGame = false;
    bool m_MenuMouseLast = false;
    bool m_BackspaceLast = false;

    float m_FPS = 0.0f;
    float m_FrameCounter = 0;
    float m_FpsTimer = 0.0f;
    float m_StepTimer = 0.0f;
    float m_FluidTimer = 0.0f;
    float m_NetSendTimer = 0.0f;

    struct ConsoleLine {
        std::string text;
        float age = 0.0f;
    };
    bool m_ChatOpen = false;
    std::string m_ChatInput;
    bool m_EnterLast = false;
    std::vector<ConsoleLine> m_ConsoleLines;

    ApplicationOptions m_Options;
    int m_FramesRendered = 0;
    int m_GlErrorCount = 0;

    glm::vec3 m_PlayerVelocity{0.0f};
    BlockType m_SelectedBlock = BlockType::Grass;
    int m_SelectedSlot = 0;

    float m_MiningProgress = 0.0f;
    glm::ivec3 m_MiningBlockPos{0};
    float m_ArmSwingProgress = 0.0f;
    float m_WalkBobbing = 0.0f;

    bool m_LeftMousePressedLast = false;
    bool m_RightMousePressedLast = false;
    bool m_FPressedLast = false;
    bool m_F3PressedLast = false;
    bool m_F4PressedLast = false;
    bool m_EPressedLast = false;
    bool m_EscPressedLast = false;
};

} // namespace Minecraft

#endif // APPLICATION_HPP
