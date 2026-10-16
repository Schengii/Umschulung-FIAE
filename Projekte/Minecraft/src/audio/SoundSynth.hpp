#ifndef SOUNDSYNTH_HPP
#define SOUNDSYNTH_HPP

#include "../world/Block.hpp"

#include <cstdint>
#include <memory>
#include <mutex>
#include <vector>

namespace Minecraft {

enum class SoundEffect;

// Procedural sound effects: the game ships no audio files, so every effect is synthesized
// from a few tone / noise segments. Pure CPU code with deterministic output (testable).
class SoundSynth {
public:
    static constexpr int SAMPLE_RATE = 44100;

    // Mono samples in [-1, 1]. `variation` slightly detunes the sound so repeated events do not sound identical.
    static std::vector<float> synthesize(SoundEffect effect, uint32_t variation = 0);
    static std::vector<float> synthesizeFootstep(BlockType material, uint32_t variation = 0);
};

// Mixes several playing sounds into an interleaved stereo float stream (called from the audio thread).
class SoundMixer {
public:
    static constexpr size_t MAX_VOICES = 16;

    // pan in [-1 (left), +1 (right)], constant-power law. When all voices are busy the oldest is dropped.
    void play(std::shared_ptr<const std::vector<float>> samples, float gain, float pan);
    // Overwrites `out` (frames * 2 floats) with the mix of all active voices and advances them.
    void mix(float* out, uint32_t frames);
    size_t activeVoices() const;
    void clear();

private:
    struct Voice {
        std::shared_ptr<const std::vector<float>> samples;
        size_t position = 0;
        float left = 1.0f;
        float right = 1.0f;
    };

    mutable std::mutex m_Mutex;
    std::vector<Voice> m_Voices;
};

} // namespace Minecraft

#endif // SOUNDSYNTH_HPP
