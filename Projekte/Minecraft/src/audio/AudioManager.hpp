#ifndef AUDIOMANAGER_HPP
#define AUDIOMANAGER_HPP

#include "../world/Block.hpp"

#include <cstddef>
#include <cstdint>
#include <glm/glm.hpp>
#include <iostream>
#include <string>

namespace Minecraft {

enum class SoundEffect {
    BlockBreak,
    BlockPlace,
    Footstep,
    Jump,
    Explosion,
    CreeperFuse,
    ArrowShoot,
    MobHit,
    ChestOpen,
    WaterSplash,
    WitherShoot,
    LevelUp,
    ToolBreak
};

class AudioManager {
public:
    static void init();
    static void playSound(SoundEffect effect, float volume = 1.0f);
    static void playSound3D(SoundEffect effect, const glm::vec3& soundPos, const glm::vec3& listenerPos,
                            const glm::vec3& listenerFront, float volume = 1.0f);
    static void playMaterialFootstep(BlockType block, const glm::vec3& soundPos, const glm::vec3& listenerPos,
                                     const glm::vec3& listenerFront, float volume = 1.0f);

    // Muted managers drop every request (used by the unit tests so they stay silent).
    static void setMuted(bool muted);
    static bool isMuted();
    // Headless mode accepts sounds into the mixer without opening an audio device (tests drain it with mixInto()).
    static void setHeadless(bool headless);
    static bool isDeviceRunning();
    // Sounds currently playing (bounded by SoundMixer::MAX_VOICES).
    static size_t getPendingSoundCount();
    // Renders the next `frames` stereo frames of everything that is playing (the audio thread does this in the game).
    static void mixInto(float* interleavedStereo, uint32_t frames);
    // Stops the audio device; it is reopened lazily by the next sound.
    static void shutdown();

    static float getMasterVolume() { return s_MasterVolume; }
    static void setMasterVolume(float vol) { s_MasterVolume = glm::clamp(vol, 0.0f, 1.0f); }

    static float calculateDistanceGain(const glm::vec3& soundPos, const glm::vec3& listenerPos,
                                       float maxDistance = 40.0f);
    static float calculateStereoPan(const glm::vec3& soundPos, const glm::vec3& listenerPos,
                                    const glm::vec3& listenerFront);

private:
    static float s_MasterVolume;
};

} // namespace Minecraft

#endif // AUDIOMANAGER_HPP
