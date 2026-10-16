#ifndef NETWORKCOMMANDS_HPP
#define NETWORKCOMMANDS_HPP

#include "../net/NetworkManager.hpp"

#include <sstream>
#include <string>

namespace Minecraft {

// Console commands that control multiplayer: /host [port], /connect <ip> [port], /disconnect, /netstatus.
struct NetworkCommands {
    struct Result {
        bool handled = false; // the text was a network command (even if it failed)
        bool success = false;
        std::string message; // feedback line for the player
    };

    static constexpr int DEFAULT_PORT = 25565;

    static Result run(const std::string& cmd, NetworkManager& net) {
        Result r;
        std::istringstream in(cmd);
        std::string verb;
        in >> verb;

        // Optional trailing port argument: absent -> keep the default, present -> must be a valid number.
        auto readPort = [&](int& port) {
            std::string token;
            if (!(in >> token))
                return true;
            try {
                size_t used = 0;
                port = std::stoi(token, &used);
                return used == token.size() && validPort(port);
            } catch (...) {
                return false;
            }
        };

        if (verb == "/host") {
            r.handled = true;
            int port = DEFAULT_PORT;
            if (!readPort(port)) {
                r.message = "Usage: /host [port 1024-65535]";
                return r;
            }
            r.success = net.startServer(static_cast<uint16_t>(port));
            r.message = r.success ? "Hosting on UDP port " + std::to_string(port)
                                  : "Could not host on port " + std::to_string(port);
        } else if (verb == "/connect") {
            r.handled = true;
            std::string ip;
            int port = DEFAULT_PORT;
            if (!(in >> ip)) {
                r.message = "Usage: /connect <ip> [port]";
                return r;
            }
            if (!readPort(port)) {
                r.message = "Invalid port";
                return r;
            }
            r.success = net.connectToServer(ip, static_cast<uint16_t>(port));
            r.message =
                r.success ? "Connecting to " + ip + ":" + std::to_string(port) + " ..." : "Could not connect to " + ip;
        } else if (verb == "/disconnect") {
            r.handled = true;
            r.success = net.isConnected();
            net.disconnect();
            r.message = r.success ? "Disconnected" : "Not connected";
        } else if (verb == "/netstatus") {
            r.handled = true;
            r.success = true;
            if (!net.isConnected())
                r.message = "Offline";
            else if (net.isServer())
                r.message = "Hosting, " + std::to_string(net.getPeerCount()) + " client(s)";
            else
                r.message = net.isHandshaken() ? "Connected as player " + std::to_string(net.getLocalPlayerId())
                                               : "Connecting ...";
        }
        return r;
    }

private:
    static bool validPort(int port) { return port >= 1024 && port <= 65535; }
};

} // namespace Minecraft

#endif // NETWORKCOMMANDS_HPP
