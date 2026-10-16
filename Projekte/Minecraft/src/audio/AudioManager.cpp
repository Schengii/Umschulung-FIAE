#include "AudioManager.hpp"

#include "AudioDevice.hpp"
#include "SoundSynth.hpp"

#include <algorithm>
#include <atomic>
#include <cmath>
#include <map>
#include <memory>
#include <mutex>

namespace Minecraft {

float AudioManager::s_MasterVolume = 1.0f;

namespace {

std::atomic<bool> g_Muted{false};
std::atomic<bool> g_Headless{false};
std::atomic<bool> g_DeviceTried{false};

SoundMixer& mixer() {
    static SoundMixer instance;
    return instance;
}

// Stops the device before static destruction so the audio thread never touches a destroyed mixer.
struct DeviceGuard {
    ~DeviceGuard() { AudioDevice::stop(); }
};
DeviceGuard g_DeviceGuard;

constexpr uint32_t VARIANTS = 4;

// Synthesized sounds are cached: key = (footstep, effect-or-material, variant).
std::shared_ptr<const std::vector<float>> cachedSound(bool footstep, int id, uint32_t variant) {
    static std::mutex cacheMutex;
    static std::map<uint32_t, std::shared_ptr<const std::vector<float>>> cache;
    const uint32_t key = (footstep ? 1u << 24 : 0u) | (static_cast<uint32_t>(id) << 8) | variant;

    std::lock_guard<std::mutex> lock(cacheMutex);
    auto it = cache.find(key);
    if (it != cache.end())
        return it->second;

    auto samples = std::make_shared<const std::vector<float>>(
        footstep ? SoundSynth::synthesizeFootstep(static_cast<BlockType>(id), variant)
                 : SoundSynth::synthesize(static_cast<SoundEffect>(id), variant));
    cache[key] = samples;
    return samples;
}

uint32_t nextVariant() {
    static std::atomic<uint32_t> counter{0};
    return counter++ % VARIANTS;
}

// Hands a sound to the mixer if somebody will actually consume it (device running or headless mode).
void submit(std::shared_ptr<const std::vector<float>> samples, float gain, float pan) {
    if (g_Muted)
        return;
    if (!g_Headless && !AudioDevice::isRunning()) {
        // Open the output lazily on the first sound; machines without audio stay silent.
        if (!g_DeviceTried.exchange(true))
            AudioDevice::start(mixer());
        if (!AudioDevice::isRunning())
            return;
    }
    mixer().play(std::move(samples), gain, pan);
}

} // namespace

void AudioManager::init() {
    std::cout << "[AudioManager] 3D Spatial Sound System Initialized (Master Volume: " << s_MasterVolume << ")."
              << std::endl;
}

void AudioManager::shutdown() {
    AudioDevice::stop();
    mixer().clear();
    g_DeviceTried = false;
}

void AudioManager::setMuted(bool muted) {
    g_Muted = muted;
}

bool AudioManager::isMuted() {
    return g_Muted;
}

void AudioManager::setHeadless(bool headless) {
    g_Headless = headless;
}

bool AudioManager::isDeviceRunning() {
    return AudioDevice::isRunning();
}

size_t AudioManager::getPendingSoundCount() {
    return mixer().activeVoices();
}

void AudioManager::mixInto(float* interleavedStereo, uint32_t frames) {
    mixer().mix(interleavedStereo, frames);
}

float AudioManager::calculateDistanceGain(const glm::vec3& soundPos, const glm::vec3& listenerPos, float maxDistance) {
    float dist = glm::distance(soundPos, listenerPos);
    if (dist >= maxDistance)
        return 0.0f;
    float gain = 1.0f - (dist / maxDistance);
    return std::max(0.0f, gain * gain); // Inverse square approximation
}

float AudioManager::calculateStereoPan(const glm::vec3& soundPos, const glm::vec3& listenerPos,
                                       const glm::vec3& listenerFront) {
    glm::vec3 toSound = soundPos - listenerPos;
    if (glm::length(toSound) < 0.001f)
        return 0.0f;
    toSound = glm::normalize(toSound);

    glm::vec3 listenerRight = glm::normalize(glm::cross(listenerFront, glm::vec3(0, 1, 0)));
    float pan = glm::dot(toSound, listenerRight);
    return glm::clamp(pan, -1.0f, 1.0f);
}

void AudioManager::playSound(SoundEffect effect, float volume) {
    playSound3D(effect, glm::vec3(0.0f), glm::vec3(0.0f), glm::vec3(0.0f, 0.0f, -1.0f), volume);
}

void AudioManager::playSound3D(SoundEffect effect, const glm::vec3& soundPos, const glm::vec3& listenerPos,
                               const glm::vec3& listenerFront, float volume) {
    float gain = calculateDistanceGain(soundPos, listenerPos);
    if (gain <= 0.001f && effect != SoundEffect::Explosion) {
        return;
    }
    // Explosions are always audible, even far away, just very quiet.
    if (effect == SoundEffect::Explosion)
        gain = std::max(gain, 0.1f);

    float finalVol = volume * gain * s_MasterVolume;
    if (finalVol <= 0.01f || g_Muted)
        return;

    float pan = calculateStereoPan(soundPos, listenerPos, listenerFront);
    submit(cachedSound(false, static_cast<int>(effect), nextVariant()), finalVol, pan);
}

void AudioManager::playMaterialFootstep(BlockType block, const glm::vec3& soundPos, const glm::vec3& listenerPos,
                                        const glm::vec3& listenerFront, float volume) {
    float gain = calculateDistanceGain(soundPos, listenerPos);
    float finalVol = volume * gain * s_MasterVolume;
    if (gain <= 0.001f || finalVol <= 0.01f || g_Muted)
        return;

    float pan = calculateStereoPan(soundPos, listenerPos, listenerFront);
    submit(cachedSound(true, static_cast<int>(block), nextVariant()), finalVol * 0.6f,
           pan); // footsteps sit below effects in the mix
}

} // namespace Minecraft
