#ifndef NETWORKMANAGER_HPP
#define NETWORKMANAGER_HPP

#include "../world/Block.hpp"

#include <cstdint>
#include <glm/glm.hpp>
#include <string>
#include <vector>

namespace Minecraft {

enum class PacketType : uint8_t { Handshake = 1, PlayerPosition, BlockChange, ChatMessage, TimeSync, EntityState };

struct PlayerPosPacket {
    uint32_t playerId = 0;
    glm::vec3 position{0.0f};
    float yaw = 0.0f;
    float pitch = 0.0f;
};

struct BlockChangePacket {
    glm::ivec3 blockPos{0};
    BlockType newBlock = BlockType::Air;
};

struct ChatMessagePacket {
    uint32_t senderId = 0;
    std::string message;
};

class NetworkManager {
public:
    NetworkManager();
    ~NetworkManager();

    bool startServer(uint16_t port = 25565);
    bool connectToServer(const std::string& ip, uint16_t port = 25565);
    void disconnect();
    void update(class World* world = nullptr);

    void sendPlayerPosition(const glm::vec3& pos, float yaw, float pitch);
    void sendBlockChange(const glm::ivec3& blockPos, BlockType type);
    void sendChatMessage(const std::string& message);

    bool isServer() const { return m_IsServer; }
    bool isConnected() const { return m_IsConnected; }

    const std::vector<PlayerPosPacket>& getRemotePlayers() const { return m_RemotePlayers; }
    const std::vector<std::string>& getChatLog() const { return m_ChatLog; }

    // Binary Packet Serialization & Deserialization
    static std::vector<uint8_t> serializePlayerPos(const PlayerPosPacket& packet);
    static bool deserializePlayerPos(const uint8_t* data, size_t size, PlayerPosPacket& outPacket);

    static std::vector<uint8_t> serializeBlockChange(const BlockChangePacket& packet);
    static bool deserializeBlockChange(const uint8_t* data, size_t size, BlockChangePacket& outPacket);

    static std::vector<uint8_t> serializeChatMessage(const ChatMessagePacket& packet);
    static bool deserializeChatMessage(const uint8_t* data, size_t size, ChatMessagePacket& outPacket);

    // Client-Side Prediction & Dead-Reckoning Interpolation
    static glm::vec3 interpolateDeadReckoning(const glm::vec3& currentPos, const glm::vec3& targetPos,
                                              const glm::vec3& velocity, float alpha, float deltaTime);
    static float interpolateAngle(float currentAngle, float targetAngle, float alpha);

    void processIncomingPacket(const uint8_t* buffer, size_t size, class World* world = nullptr);
    static constexpr size_t MAX_REMOTE_PLAYERS = 64;
    static constexpr size_t MAX_CHAT_LENGTH = 256;
    static constexpr size_t MAX_CHAT_LOG_ENTRIES = 200;
    static constexpr size_t MAX_PACKETS_PER_UPDATE = 256;
    static constexpr size_t MAX_QUEUED_PACKETS = 4096;

    // True for every BlockType value the engine knows; used to validate packets from the network.
    static bool isValidBlockType(uint8_t value);

    // Transport envelope (see NetworkManager.cpp): 'M' 'C' | version | session token | sequence | payload
    static constexpr uint8_t PROTOCOL_VERSION = 2;
    static constexpr size_t ENVELOPE_SIZE = 15;
    static constexpr size_t MAX_PEERS = 16;
    static constexpr double PEER_TIMEOUT_SECONDS = 30.0;
    static constexpr float MAX_BLOCK_REACH = 8.0f; // blocks a client may edit away from its reported position

    static std::vector<uint8_t> wrapEnvelope(uint64_t token, uint32_t seq, const std::vector<uint8_t>& payload);
    static bool unwrapEnvelope(const uint8_t* data, size_t size, uint64_t& token, uint32_t& seq,
                               const uint8_t*& payload, size_t& payloadSize);
    // Wrap-around safe "is `incoming` newer than `last`" for sequence numbers.
    static bool isNewerSequence(uint32_t incoming, uint32_t last);

    // Client: true once the server accepted us. Server: always true while running.
    bool isHandshaken() const { return m_Handshaken; }
    size_t getPeerCount() const { return m_Peers.size(); }
    uint32_t getLocalPlayerId() const { return m_LocalPlayerId; }

    void queueIncomingPacket(const std::vector<uint8_t>& packet);
    void flushIncomingPackets(class World* world = nullptr);
    size_t getQueuedPacketCount() const { return m_IncomingPacketQueue.size(); }

    // Entry point for one received datagram (envelope included). `ip` is in network byte order.
    // update() feeds it from the socket; tests use it to inject forged / replayed packets.
    void handleDatagram(const uint8_t* data, size_t size, uint32_t ip, uint16_t port, class World* world);
    uint64_t getSessionToken() const { return m_SessionToken; }
    // Server: token issued to the peer at (ip, port); false if there is no such peer. Used by tests to craft valid
    // datagrams.
    bool findPeerToken(uint32_t ip, uint16_t port, uint64_t& tokenOut) const;

private:
    struct Peer {
        uint32_t ip = 0;   // network byte order
        uint16_t port = 0; // host byte order
        uint64_t token = 0;
        uint32_t playerId = 0;
        uint32_t lastSeq = 0;
        uint32_t sendSeq = 0;
        glm::vec3 lastPos{0.0f};
        bool hasPos = false;
        double lastSeen = 0.0;
    };

    void appendChat(const std::string& line);
    double now() const;
    static uint64_t randomToken();
    void sendRaw(uint32_t ip, uint16_t port, const std::vector<uint8_t>& bytes);
    void sendHandshakeRequest();
    void sendToPeer(Peer& peer, const std::vector<uint8_t>& payload);
    void broadcast(const std::vector<uint8_t>& payload, const Peer* except);
    void sendPayload(const std::vector<uint8_t>& payload);

    std::vector<Peer> m_Peers; // server only
    uint32_t m_NextPlayerId = 1;
    bool m_Handshaken = false;
    uint64_t m_SessionToken = 0; // client only
    uint32_t m_SendSeq = 0;
    uint32_t m_LastServerSeq = 0;
    uint32_t m_RemoteAddr = 0; // client only, network byte order
    double m_LastHandshakeAttempt = 0.0;

    bool m_IsServer = false;
    bool m_IsConnected = false;
    uint32_t m_LocalPlayerId = 1;
    std::vector<PlayerPosPacket> m_RemotePlayers;
    std::vector<std::string> m_ChatLog;
    std::vector<std::vector<uint8_t>> m_IncomingPacketQueue;

    uintptr_t m_Socket = ~static_cast<uintptr_t>(0); // socket descriptor
    std::string m_RemoteIP = "127.0.0.1";
    uint16_t m_RemotePort = 25565;
};

} // namespace Minecraft

#endif // NETWORKMANAGER_HPP
