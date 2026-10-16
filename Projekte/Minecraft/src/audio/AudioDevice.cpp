#include "AudioDevice.hpp"

#ifndef MC_NO_AUDIO_DEVICE

#define MA_NO_DECODING
#define MA_NO_ENCODING
#define MA_NO_GENERATION
#define MA_NO_ENGINE
#define MA_NO_NODE_GRAPH
#define MA_NO_RESOURCE_MANAGER
#define MINIAUDIO_IMPLEMENTATION
#include "miniaudio.h"

namespace Minecraft {

namespace {

ma_device g_Device;
bool g_Running = false;

void dataCallback(ma_device* device, void* output, const void* /*input*/, ma_uint32 frames) {
    auto* mixer = static_cast<SoundMixer*>(device->pUserData);
    mixer->mix(static_cast<float*>(output), frames);
}

} // namespace

bool AudioDevice::start(SoundMixer& mixer) {
    if (g_Running)
        return true;

    ma_device_config config = ma_device_config_init(ma_device_type_playback);
    config.playback.format = ma_format_f32;
    config.playback.channels = 2;
    config.sampleRate = SoundSynth::SAMPLE_RATE;
    config.dataCallback = dataCallback;
    config.pUserData = &mixer;

    if (ma_device_init(nullptr, &config, &g_Device) != MA_SUCCESS)
        return false;
    if (ma_device_start(&g_Device) != MA_SUCCESS) {
        ma_device_uninit(&g_Device);
        return false;
    }
    g_Running = true;
    return true;
}

void AudioDevice::stop() {
    if (!g_Running)
        return;
    ma_device_uninit(&g_Device);
    g_Running = false;
}

bool AudioDevice::isRunning() {
    return g_Running;
}

} // namespace Minecraft

#else // MC_NO_AUDIO_DEVICE: build without any audio backend

namespace Minecraft {
bool AudioDevice::start(SoundMixer&) {
    return false;
}
void AudioDevice::stop() {}
bool AudioDevice::isRunning() {
    return false;
}
} // namespace Minecraft

#endif
