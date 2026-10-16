#include "core/Application.hpp"

#include <cstdlib>
#include <exception>
#include <iostream>
#include <string>

int main(int argc, char** argv) {
    Minecraft::ApplicationOptions options;
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--autostart") {
            options.autoStart = true;
        } else if (arg == "--frames" && i + 1 < argc) {
            options.maxFrames = std::atoi(argv[++i]);
        } else if (arg == "--seed" && i + 1 < argc) {
            options.seed = argv[++i];
        } else if (arg == "--render-distance" && i + 1 < argc) {
            options.renderDistance = std::atoi(argv[++i]);
        } else {
            std::cerr << "Usage: Minecraft [--autostart] [--frames N] [--seed TEXT] [--render-distance N]" << std::endl;
            return EXIT_FAILURE;
        }
    }

    std::cout << "========================================" << std::endl;
    std::cout << " Starting Minecraft C++ OpenGL Engine  " << std::endl;
    std::cout << "========================================" << std::endl;

    try {
        Minecraft::Application app(options);
        app.run();
        if (options.maxFrames > 0) {
            std::cout << "[Smoke] frames=" << app.getFramesRendered() << " glErrors=" << app.getGlErrorCount()
                      << std::endl;
            if (app.getGlErrorCount() > 0)
                return EXIT_FAILURE;
        }
    } catch (const std::exception& e) {
        std::cerr << "[Engine Error] Unhandled Exception: " << e.what() << std::endl;
        return EXIT_FAILURE;
    }

    std::cout << "[Engine] Shutdown complete successfully." << std::endl;
    return EXIT_SUCCESS;
}
