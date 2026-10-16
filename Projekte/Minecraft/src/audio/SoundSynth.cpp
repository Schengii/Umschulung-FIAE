#include "SoundSynth.hpp"

#include "AudioManager.hpp"

#include <algorithm>
#include <cmath>
#include <initializer_list>

namespace Minecraft {

namespace {

constexpr float TWO_PI = 6.28318530718f;

enum class Wave { Sine, Square, Saw, Noise };

struct Segment {
    Wave wave;
    float freqStart; // Hz; for Noise this is the low-pass cut-off
    float freqEnd;
    float duration; // seconds
    float volume;
};

// Small deterministic noise source (xorshift) so the same (effect, variation) always renders identically.
struct Noise {
    uint32_t state;
    explicit Noise(uint32_t seed) : state(seed * 2654435761u + 0x9E3779B9u) {
        if (state == 0)
            state = 1;
    }
    float next() {
        state ^= state << 13;
        state ^= state >> 17;
        state ^= state << 5;
        return static_cast<float>(state) / 2147483648.0f - 1.0f; // [-1, 1)
    }
};

std::vector<float> render(std::initializer_list<Segment> segments, uint32_t variation) {
    Noise noise(variation + 17);
    // +-6 % pitch spread per variation
    const float detune = 1.0f + 0.06f * (static_cast<float>(variation % 5) - 2.0f) / 2.0f;

    std::vector<float> out;
    for (const Segment& seg : segments) {
        const size_t count = static_cast<size_t>(seg.duration * SoundSynth::SAMPLE_RATE);
        const size_t attack = std::max<size_t>(1, static_cast<size_t>(0.004f * SoundSynth::SAMPLE_RATE));
        float phase = 0.0f;
        float lowpass = 0.0f;
        for (size_t i = 0; i < count; ++i) {
            const float t = count > 1 ? static_cast<float>(i) / static_cast<float>(count - 1) : 0.0f;
            const float freq = (seg.freqStart + (seg.freqEnd - seg.freqStart) * t) * detune;

            float s = 0.0f;
            switch (seg.wave) {
            case Wave::Sine:
                s = std::sin(phase);
                break;
            case Wave::Square:
                s = std::sin(phase) >= 0.0f ? 0.6f : -0.6f;
                break;
            case Wave::Saw:
                s = (phase / TWO_PI) * 2.0f - 1.0f;
                break;
            case Wave::Noise: {
                // one-pole low-pass: smaller cut-off -> duller "thud", larger -> brighter "hiss"
                const float a = std::clamp(freq / static_cast<float>(SoundSynth::SAMPLE_RATE) * TWO_PI, 0.001f, 1.0f);
                lowpass += a * (noise.next() - lowpass);
                s = lowpass * (1.0f + 2.0f * (1.0f - a));
                break;
            }
            }
            phase += TWO_PI * freq / static_cast<float>(SoundSynth::SAMPLE_RATE);
            if (phase >= TWO_PI)
                phase -= TWO_PI;

            // 4 ms linear attack, then a smooth decay to silence at the end of the segment
            const float env =
                std::min(1.0f, static_cast<float>(i + 1) / static_cast<float>(attack)) * (1.0f - t) * (1.0f - t * 0.3f);
            out.push_back(s * env * seg.volume);
        }
    }

    // Normalise so that no effect clips, but keep relative loudness between effects roughly intact.
    float peak = 0.0f;
    for (float v : out)
        peak = std::max(peak, std::fabs(v));
    if (peak > 0.9f) {
        const float scale = 0.9f / peak;
        for (float& v : out)
            v *= scale;
    }
    return out;
}

} // namespace

std::vector<float> SoundSynth::synthesize(SoundEffect effect, uint32_t variation) {
    switch (effect) {
    case SoundEffect::BlockBreak:
        return render({{Wave::Noise, 900, 500, 0.12f, 0.9f}, {Wave::Sine, 140, 80, 0.08f, 0.4f}}, variation);
    case SoundEffect::BlockPlace:
        return render({{Wave::Sine, 420, 300, 0.07f, 0.6f}, {Wave::Noise, 1500, 800, 0.04f, 0.4f}}, variation);
    case SoundEffect::Footstep:
        return render({{Wave::Noise, 700, 500, 0.07f, 0.8f}}, variation);
    case SoundEffect::Jump:
        return render({{Wave::Sine, 300, 520, 0.12f, 0.6f}}, variation);
    case SoundEffect::Explosion:
        return render({{Wave::Noise, 400, 120, 0.7f, 1.0f}, {Wave::Sine, 90, 40, 0.6f, 0.8f}}, variation);
    case SoundEffect::CreeperFuse:
        return render({{Wave::Noise, 5000, 6000, 0.5f, 0.35f}}, variation);
    case SoundEffect::ArrowShoot:
        return render({{Wave::Saw, 900, 300, 0.12f, 0.45f}}, variation);
    case SoundEffect::MobHit:
        return render({{Wave::Square, 220, 110, 0.12f, 0.6f}}, variation);
    case SoundEffect::ChestOpen:
        return render({{Wave::Sine, 450, 450, 0.06f, 0.6f}, {Wave::Sine, 520, 520, 0.09f, 0.6f}}, variation);
    case SoundEffect::WaterSplash:
        return render({{Wave::Noise, 2500, 1500, 0.25f, 0.7f}}, variation);
    case SoundEffect::WitherShoot:
        return render({{Wave::Saw, 180, 90, 0.3f, 0.6f}}, variation);
    case SoundEffect::LevelUp:
        return render({{Wave::Sine, 523, 523, 0.12f, 0.6f},
                       {Wave::Sine, 659, 659, 0.12f, 0.6f},
                       {Wave::Sine, 784, 784, 0.2f, 0.6f}},
                      variation);
    case SoundEffect::ToolBreak:
        return render({{Wave::Noise, 3000, 1500, 0.08f, 0.8f}, {Wave::Sine, 260, 120, 0.15f, 0.5f}}, variation);
    }
    return {};
}

std::vector<float> SoundSynth::synthesizeFootstep(BlockType material, uint32_t variation) {
    if (BlockData::isFluid(material)) {
        return render({{Wave::Noise, 1800, 1200, 0.12f, 0.7f}, {Wave::Sine, 300, 220, 0.06f, 0.2f}}, variation);
    }
    switch (material) {
    case BlockType::Grass:
    case BlockType::Leaves:
        return render({{Wave::Noise, 600, 400, 0.06f, 0.8f}}, variation);
    case BlockType::Stone:
    case BlockType::Obsidian:
    case BlockType::Netherrack:
    case BlockType::StoneBricks:
    case BlockType::EndStone:
        return render({{Wave::Sine, 900, 400, 0.02f, 0.5f}, {Wave::Noise, 2400, 1500, 0.05f, 0.7f}}, variation);
    case BlockType::OakLog:
    case BlockType::BirchLog:
    case BlockType::Planks:
        return render({{Wave::Noise, 1200, 800, 0.06f, 0.8f}, {Wave::Sine, 320, 260, 0.04f, 0.3f}}, variation);
    case BlockType::Sand:
    case BlockType::Dirt:
    case BlockType::SoulSand:
        return render({{Wave::Noise, 400, 300, 0.08f, 0.8f}}, variation);
    default:
        return render({{Wave::Noise, 800, 600, 0.06f, 0.8f}}, variation);
    }
}

// ----------------------------------------------------------------------------- mixer

void SoundMixer::play(std::shared_ptr<const std::vector<float>> samples, float gain, float pan) {
    if (!samples || samples->empty() || !(gain > 0.0f))
        return;
    pan = std::clamp(pan, -1.0f, 1.0f);
    const float angle = (pan + 1.0f) * 0.25f * TWO_PI * 0.5f; // 0 .. pi/2
    Voice v;
    v.samples = std::move(samples);
    v.left = gain * std::cos(angle);
    v.right = gain * std::sin(angle);

    std::lock_guard<std::mutex> lock(m_Mutex);
    if (m_Voices.size() >= MAX_VOICES)
        m_Voices.erase(m_Voices.begin());
    m_Voices.push_back(std::move(v));
}

void SoundMixer::mix(float* out, uint32_t frames) {
    std::fill(out, out + static_cast<size_t>(frames) * 2, 0.0f);

    std::lock_guard<std::mutex> lock(m_Mutex);
    for (Voice& v : m_Voices) {
        const std::vector<float>& s = *v.samples;
        const size_t n = std::min<size_t>(frames, s.size() - v.position);
        for (size_t i = 0; i < n; ++i) {
            const float sample = s[v.position + i];
            out[i * 2] += sample * v.left;
            out[i * 2 + 1] += sample * v.right;
        }
        v.position += n;
    }
    m_Voices.erase(std::remove_if(m_Voices.begin(), m_Voices.end(),
                                  [](const Voice& v) { return v.position >= v.samples->size(); }),
                   m_Voices.end());

    // Soft clip so that many simultaneous sounds never wrap or crackle.
    for (size_t i = 0; i < static_cast<size_t>(frames) * 2; ++i)
        out[i] = std::tanh(out[i]);
}

size_t SoundMixer::activeVoices() const {
    std::lock_guard<std::mutex> lock(m_Mutex);
    return m_Voices.size();
}

void SoundMixer::clear() {
    std::lock_guard<std::mutex> lock(m_Mutex);
    m_Voices.clear();
}

} // namespace Minecraft
