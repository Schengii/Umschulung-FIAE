#ifndef AUDIODEVICE_HPP
#define AUDIODEVICE_HPP

#include "SoundSynth.hpp"

namespace Minecraft {

// Thin wrapper around the miniaudio playback device (WASAPI / CoreAudio / ALSA / PulseAudio ...).
// start() fails gracefully (returns false) on machines without an audio output.
class AudioDevice {
public:
    static bool start(SoundMixer& mixer);
    static void stop();
    static bool isRunning();
};

} // namespace Minecraft

#endif // AUDIODEVICE_HPP
