#ifndef NOMINMAX
#define NOMINMAX
#endif

#include "NetworkManager.hpp"

#include "../world/World.hpp"

#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstring>
#include <iostream>
#include <random>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
typedef int socklen_t;
#else
#include <arpa/inet.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>
#endif

namespace Minecraft {

namespace {

constexpr uintptr_t NO_SOCKET = ~static_cast<uintptr_t>(0);

#ifdef _WIN32
using NativeSocket = SOCKET;
inline NativeSocket toNative(uintptr_t s) {
    return static_cast<SOCKET>(s);
}
inline bool isValidNative(NativeSocket s) {
    return s != INVALID_SOCKET;
}
inline bool setNonBlocking(NativeSocket s) {
    u_long nonBlocking = 1;
    return ioctlsocket(s, FIONBIO, &nonBlocking) == 0;
}
inline void closeNative(NativeSocket s) {
    closesocket(s);
}
#else
using NativeSocket = int;
inline NativeSocket toNative(uintptr_t s) {
    return static_cast<int>(s);
}
inline bool isValidNative(NativeSocket s) {
    return s >= 0;
}
inline bool setNonBlocking(NativeSocket s) {
    int flags = fcntl(s, F_GETFL, 0);
    return flags >= 0 && fcntl(s, F_SETFL, flags | O_NONBLOCK) == 0;
}
inline void closeNative(NativeSocket s) {
    close(s);
}
#endif

// Coordinates beyond this are not reachable in the world; reject them as malformed / hostile.
constexpr float MAX_COORDINATE = 30000000.0f;

bool isFiniteCoordinate(float v) {
    return std::isfinite(v) && std::fabs(v) <= MAX_COORDINATE;
}

} // namespace

NetworkManager::NetworkManager() {
#ifdef _WIN32
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif
}

NetworkManager::~NetworkManager() {
    disconnect();
#ifdef _WIN32
    WSACleanup();
#endif
}

bool NetworkManager::isValidBlockType(uint8_t value) {
    return value <= static_cast<uint8_t>(BlockData::LAST_TYPE);
}

// ---------------------------------------------------------------------------------------------
// Transport envelope:  'M' 'C' | version u8 | session token u64 | sequence u32 | payload...
// The token is chosen by the server during the handshake and is required on every later packet,
// so third parties cannot inject packets. Sequence numbers must increase, which drops
// duplicated / replayed / badly reordered datagrams.
// ---------------------------------------------------------------------------------------------

std::vector<uint8_t> NetworkManager::wrapEnvelope(uint64_t token, uint32_t seq, const std::vector<uint8_t>& payload) {
    std::vector<uint8_t> out;
    out.reserve(ENVELOPE_SIZE + payload.size());
    out.push_back('M');
    out.push_back('C');
    out.push_back(PROTOCOL_VERSION);
    const uint8_t* t = reinterpret_cast<const uint8_t*>(&token);
    out.insert(out.end(), t, t + sizeof(token));
    const uint8_t* s = reinterpret_cast<const uint8_t*>(&seq);
    out.insert(out.end(), s, s + sizeof(seq));
    out.insert(out.end(), payload.begin(), payload.end());
    return out;
}

bool NetworkManager::unwrapEnvelope(const uint8_t* data, size_t size, uint64_t& token, uint32_t& seq,
                                    const uint8_t*& payload, size_t& payloadSize) {
    if (!data || size <= ENVELOPE_SIZE)
        return false;
    if (data[0] != 'M' || data[1] != 'C' || data[2] != PROTOCOL_VERSION)
        return false;
    std::memcpy(&token, data + 3, sizeof(token));
    std::memcpy(&seq, data + 3 + sizeof(token), sizeof(seq));
    payload = data + ENVELOPE_SIZE;
    payloadSize = size - ENVELOPE_SIZE;
    return true;
}

bool NetworkManager::isNewerSequence(uint32_t incoming, uint32_t last) {
    return incoming != last && static_cast<uint32_t>(incoming - last) < 0x80000000u;
}

// Session tokens are the only thing standing between a stranger and the server's world, so they come
// straight from the OS entropy source (two 32-bit draws) rather than from a seeded, predictable generator.
uint64_t NetworkManager::randomToken() {
    std::random_device rd;
    uint64_t token = 0;
    do {
        token = (static_cast<uint64_t>(rd()) << 32) | static_cast<uint64_t>(rd());
    } while (token == 0);
    return token;
}

double NetworkManager::now() const {
    using clock = std::chrono::steady_clock;
    static const clock::time_point start = clock::now();
    return std::chrono::duration<double>(clock::now() - start).count();
}

bool NetworkManager::startServer(uint16_t port) {
    disconnect();

    NativeSocket sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (!isValidNative(sock)) {
        std::cerr << "[NetworkManager] Failed to create UDP server socket." << std::endl;
        return false;
    }
    if (!setNonBlocking(sock)) {
        std::cerr << "[NetworkManager] Failed to set the server socket to non-blocking mode." << std::endl;
        closeNative(sock);
        return false;
    }

    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
    serverAddr.sin_port = htons(port);

    if (bind(sock, reinterpret_cast<sockaddr*>(&serverAddr), sizeof(serverAddr)) != 0) {
        std::cerr << "[NetworkManager] Failed to bind server socket to port " << port << std::endl;
        closeNative(sock);
        return false;
    }

    m_Socket = static_cast<uintptr_t>(sock);
    m_IsServer = true;
    m_IsConnected = true;
    m_Handshaken = true;
    m_LocalPlayerId = 0; // the host is player 0, clients are numbered from 1
    m_NextPlayerId = 1;
    m_RemotePort = port;
    std::cout << "[NetworkManager] UDP Server started listening on port " << port << std::endl;
    return true;
}

bool NetworkManager::connectToServer(const std::string& ip, uint16_t port) {
    disconnect();

    in_addr parsed{};
    if (inet_pton(AF_INET, ip.c_str(), &parsed) != 1) {
        std::cerr << "[NetworkManager] Invalid server address: " << ip << std::endl;
        return false;
    }

    NativeSocket sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (!isValidNative(sock)) {
        std::cerr << "[NetworkManager] Failed to create UDP client socket." << std::endl;
        return false;
    }
    if (!setNonBlocking(sock)) {
        std::cerr << "[NetworkManager] Failed to set the client socket to non-blocking mode." << std::endl;
        closeNative(sock);
        return false;
    }

    m_Socket = static_cast<uintptr_t>(sock);
    m_IsServer = false;
    m_IsConnected = true;
    m_Handshaken = false;
    m_SessionToken = 0;
    m_SendSeq = 0;
    m_LastServerSeq = 0;
    m_RemoteIP = ip;
    m_RemotePort = port;
    m_RemoteAddr = parsed.s_addr;
    sendHandshakeRequest();
    std::cout << "[NetworkManager] Connecting to server at " << ip << ":" << port << std::endl;
    return true;
}

void NetworkManager::disconnect() {
    if (m_IsConnected) {
        if (m_Socket != NO_SOCKET) {
            closeNative(toNative(m_Socket));
            m_Socket = NO_SOCKET;
        }
        std::cout << "[NetworkManager] Network session disconnected." << std::endl;
        m_IsConnected = false;
        m_IsServer = false;
        m_RemotePlayers.clear();
    }
    m_Peers.clear();
    m_Handshaken = false;
    m_SessionToken = 0;
    m_SendSeq = 0;
    m_LastServerSeq = 0;
    m_LocalPlayerId = 1;
}

bool NetworkManager::findPeerToken(uint32_t ip, uint16_t port, uint64_t& tokenOut) const {
    for (const Peer& p : m_Peers) {
        if (p.ip == ip && p.port == port) {
            tokenOut = p.token;
            return true;
        }
    }
    return false;
}

void NetworkManager::sendRaw(uint32_t ip, uint16_t port, const std::vector<uint8_t>& bytes) {
    if (!m_IsConnected || m_Socket == NO_SOCKET)
        return;

    sockaddr_in destAddr{};
    destAddr.sin_family = AF_INET;
    destAddr.sin_port = htons(port);
    destAddr.sin_addr.s_addr = ip;

    sendto(toNative(m_Socket), reinterpret_cast<const char*>(bytes.data()), static_cast<int>(bytes.size()), 0,
           reinterpret_cast<sockaddr*>(&destAddr), sizeof(destAddr));
}

void NetworkManager::sendHandshakeRequest() {
    std::vector<uint8_t> payload = {static_cast<uint8_t>(PacketType::Handshake), PROTOCOL_VERSION};
    sendRaw(m_RemoteAddr, m_RemotePort, wrapEnvelope(0, 0, payload));
    m_LastHandshakeAttempt = now();
}

void NetworkManager::sendToPeer(Peer& peer, const std::vector<uint8_t>& payload) {
    sendRaw(peer.ip, peer.port, wrapEnvelope(peer.token, ++peer.sendSeq, payload));
}

void NetworkManager::broadcast(const std::vector<uint8_t>& payload, const Peer* except) {
    for (Peer& p : m_Peers) {
        if (&p != except)
            sendToPeer(p, payload);
    }
}

void NetworkManager::sendPayload(const std::vector<uint8_t>& payload) {
    if (!m_IsConnected)
        return;
    if (m_IsServer) {
        broadcast(payload, nullptr);
    } else if (m_Handshaken) {
        sendRaw(m_RemoteAddr, m_RemotePort, wrapEnvelope(m_SessionToken, ++m_SendSeq, payload));
    }
    // A client that has not finished the handshake yet simply drops outgoing game packets.
}

void NetworkManager::update(World* world) {
    if (!m_IsConnected || m_Socket == NO_SOCKET)
        return;

    // Clients keep asking for a session until the server answers (UDP may lose the first request).
    if (!m_IsServer && !m_Handshaken && now() - m_LastHandshakeAttempt > 0.5) {
        sendHandshakeRequest();
    }

    uint8_t buffer[2048];
    // A flood of packets must not stall the frame: handle a bounded number per update.
    for (size_t handled = 0; handled < MAX_PACKETS_PER_UPDATE; ++handled) {
        sockaddr_in fromAddr{};
        socklen_t fromLen = sizeof(fromAddr);
        int bytesReceived =
            static_cast<int>(recvfrom(toNative(m_Socket), reinterpret_cast<char*>(buffer), sizeof(buffer), 0,
                                      reinterpret_cast<sockaddr*>(&fromAddr), &fromLen));
        if (bytesReceived <= 0)
            break;

        handleDatagram(buffer, static_cast<size_t>(bytesReceived), fromAddr.sin_addr.s_addr, ntohs(fromAddr.sin_port),
                       world);
    }

    if (m_IsServer) {
        // Forget clients that went silent.
        double t = now();
        for (size_t i = 0; i < m_Peers.size();) {
            if (t - m_Peers[i].lastSeen > PEER_TIMEOUT_SECONDS) {
                uint32_t id = m_Peers[i].playerId;
                m_RemotePlayers.erase(std::remove_if(m_RemotePlayers.begin(), m_RemotePlayers.end(),
                                                     [id](const PlayerPosPacket& p) { return p.playerId == id; }),
                                      m_RemotePlayers.end());
                appendChat("* Player " + std::to_string(id) + " timed out");
                m_Peers.erase(m_Peers.begin() + static_cast<std::ptrdiff_t>(i));
            } else {
                ++i;
            }
        }
    }
}

void NetworkManager::handleDatagram(const uint8_t* data, size_t size, uint32_t ip, uint16_t port, World* world) {
    uint64_t token = 0;
    uint32_t seq = 0;
    const uint8_t* payload = nullptr;
    size_t payloadSize = 0;
    if (!unwrapEnvelope(data, size, token, seq, payload, payloadSize))
        return;

    const PacketType type = static_cast<PacketType>(payload[0]);

    // ---------------------------------------------------------------- client side
    if (!m_IsServer) {
        if (ip != m_RemoteAddr || port != m_RemotePort)
            return; // only the server we connected to may talk to us

        if (type == PacketType::Handshake) {
            if (m_Handshaken || payloadSize < 1 + sizeof(uint32_t) + sizeof(uint64_t) || token == 0)
                return;
            uint32_t playerId = 0;
            uint64_t announcedToken = 0;
            std::memcpy(&playerId, payload + 1, sizeof(uint32_t));
            std::memcpy(&announcedToken, payload + 1 + sizeof(uint32_t), sizeof(uint64_t));
            if (announcedToken != token)
                return;
            m_LocalPlayerId = playerId;
            m_SessionToken = token;
            m_LastServerSeq = seq;
            m_Handshaken = true;
            std::cout << "[NetworkManager] Joined as player " << playerId << std::endl;
            return;
        }

        if (!m_Handshaken || token != m_SessionToken || !isNewerSequence(seq, m_LastServerSeq))
            return;
        m_LastServerSeq = seq;
        if (type == PacketType::PlayerPosition && payloadSize >= 1 + sizeof(uint32_t)) {
            uint32_t sender = 0;
            std::memcpy(&sender, payload + 1, sizeof(uint32_t));
            if (sender == m_LocalPlayerId)
                return; // the server echoes nothing of ours, but never show ourselves as remote
        }
        processIncomingPacket(payload, payloadSize, world);
        return;
    }

    // ---------------------------------------------------------------- server side
    Peer* peer = nullptr;
    for (Peer& p : m_Peers) {
        if (p.ip == ip && p.port == port) {
            peer = &p;
            break;
        }
    }

    if (type == PacketType::Handshake) {
        if (payloadSize < 2 || payload[1] != PROTOCOL_VERSION)
            return;
        if (!peer) {
            if (m_Peers.size() >= MAX_PEERS)
                return;
            Peer fresh;
            fresh.ip = ip;
            fresh.port = port;
            fresh.token = randomToken();
            fresh.playerId = m_NextPlayerId++;
            fresh.lastSeen = now();
            m_Peers.push_back(fresh);
            peer = &m_Peers.back();
            appendChat("* Player " + std::to_string(peer->playerId) + " joined");
        }
        peer->lastSeen = now();
        std::vector<uint8_t> reply = {static_cast<uint8_t>(PacketType::Handshake)};
        const uint8_t* id = reinterpret_cast<const uint8_t*>(&peer->playerId);
        reply.insert(reply.end(), id, id + sizeof(uint32_t));
        const uint8_t* tk = reinterpret_cast<const uint8_t*>(&peer->token);
        reply.insert(reply.end(), tk, tk + sizeof(uint64_t));
        sendToPeer(*peer, reply); // idempotent: a repeated request just gets the same session again
        return;
    }

    if (!peer || token != peer->token || !isNewerSequence(seq, peer->lastSeq))
        return; // unknown sender / forged / replayed
    peer->lastSeq = seq;
    peer->lastSeen = now();

    if (type == PacketType::PlayerPosition) {
        PlayerPosPacket pkt;
        if (!deserializePlayerPos(payload, payloadSize, pkt))
            return;
        pkt.playerId = peer->playerId; // never trust a client-supplied id
        peer->lastPos = pkt.position;
        peer->hasPos = true;
        std::vector<uint8_t> bytes = serializePlayerPos(pkt);
        processIncomingPacket(bytes.data(), bytes.size(), world);
        broadcast(bytes, peer);
    } else if (type == PacketType::BlockChange) {
        BlockChangePacket pkt;
        if (!deserializeBlockChange(payload, payloadSize, pkt))
            return;
        // The server is authoritative: the edit must be near the sender and inside a loaded chunk.
        auto rejectEdit = [&]() {
            // Tell the sender what the block really is so its prediction is rolled back.
            if (world && world->getChunk(pkt.blockPos.x >> 4, pkt.blockPos.z >> 4)) {
                BlockChangePacket truth = pkt;
                truth.newBlock = world->getBlock(pkt.blockPos.x, pkt.blockPos.y, pkt.blockPos.z);
                sendToPeer(*peer, serializeBlockChange(truth));
            }
        };
        glm::vec3 centre = glm::vec3(pkt.blockPos) + glm::vec3(0.5f);
        if (!peer->hasPos || glm::distance(centre, peer->lastPos) > MAX_BLOCK_REACH) {
            rejectEdit();
            return;
        }
        if (world) {
            if (!world->getChunk(pkt.blockPos.x >> 4, pkt.blockPos.z >> 4))
                return;
            world->setBlock(pkt.blockPos.x, pkt.blockPos.y, pkt.blockPos.z, pkt.newBlock);
        }
        broadcast(serializeBlockChange(pkt), peer);
    } else if (type == PacketType::ChatMessage) {
        ChatMessagePacket pkt;
        if (!deserializeChatMessage(payload, payloadSize, pkt))
            return;
        pkt.senderId = peer->playerId;
        appendChat("<Player " + std::to_string(pkt.senderId) + "> " + pkt.message);
        broadcast(serializeChatMessage(pkt), peer);
    }
}

void NetworkManager::sendPlayerPosition(const glm::vec3& pos, float yaw, float pitch) {
    if (!m_IsConnected)
        return;
    PlayerPosPacket pkt;
    pkt.playerId = m_LocalPlayerId;
    pkt.position = pos;
    pkt.yaw = yaw;
    pkt.pitch = pitch;
    sendPayload(serializePlayerPos(pkt));
}

void NetworkManager::sendBlockChange(const glm::ivec3& blockPos, BlockType type) {
    if (!m_IsConnected)
        return;
    BlockChangePacket pkt;
    pkt.blockPos = blockPos;
    pkt.newBlock = type;
    sendPayload(serializeBlockChange(pkt));
}

void NetworkManager::sendChatMessage(const std::string& message) {
    if (!m_IsConnected)
        return;
    ChatMessagePacket pkt;
    pkt.senderId = m_LocalPlayerId;
    pkt.message = message.substr(0, MAX_CHAT_LENGTH);

    appendChat("<Player " + std::to_string(m_LocalPlayerId) + "> " + pkt.message);
    sendPayload(serializeChatMessage(pkt));
}

void NetworkManager::appendChat(const std::string& line) {
    m_ChatLog.push_back(line);
    if (m_ChatLog.size() > MAX_CHAT_LOG_ENTRIES) {
        m_ChatLog.erase(m_ChatLog.begin(),
                        m_ChatLog.begin() + static_cast<std::ptrdiff_t>(m_ChatLog.size() - MAX_CHAT_LOG_ENTRIES));
    }
}

std::vector<uint8_t> NetworkManager::serializePlayerPos(const PlayerPosPacket& packet) {
    std::vector<uint8_t> buffer;
    buffer.push_back(static_cast<uint8_t>(PacketType::PlayerPosition));

    uint32_t pid = packet.playerId;
    const uint8_t* pIdBytes = reinterpret_cast<const uint8_t*>(&pid);
    buffer.insert(buffer.end(), pIdBytes, pIdBytes + sizeof(uint32_t));

    const uint8_t* posBytes = reinterpret_cast<const uint8_t*>(&packet.position);
    buffer.insert(buffer.end(), posBytes, posBytes + sizeof(glm::vec3));

    const uint8_t* yawBytes = reinterpret_cast<const uint8_t*>(&packet.yaw);
    buffer.insert(buffer.end(), yawBytes, yawBytes + sizeof(float));

    const uint8_t* pitchBytes = reinterpret_cast<const uint8_t*>(&packet.pitch);
    buffer.insert(buffer.end(), pitchBytes, pitchBytes + sizeof(float));

    return buffer;
}

bool NetworkManager::deserializePlayerPos(const uint8_t* data, size_t size, PlayerPosPacket& outPacket) {
    size_t expectedSize = 1 + sizeof(uint32_t) + sizeof(glm::vec3) + sizeof(float) * 2;
    if (!data || size < expectedSize || data[0] != static_cast<uint8_t>(PacketType::PlayerPosition)) {
        return false;
    }

    PlayerPosPacket tmp;
    size_t offset = 1;
    std::memcpy(&tmp.playerId, data + offset, sizeof(uint32_t));
    offset += sizeof(uint32_t);

    std::memcpy(&tmp.position, data + offset, sizeof(glm::vec3));
    offset += sizeof(glm::vec3);

    std::memcpy(&tmp.yaw, data + offset, sizeof(float));
    offset += sizeof(float);

    std::memcpy(&tmp.pitch, data + offset, sizeof(float));

    // NaN / infinite / absurd values would poison interpolation and chunk lookups downstream.
    if (!isFiniteCoordinate(tmp.position.x) || !isFiniteCoordinate(tmp.position.y) ||
        !isFiniteCoordinate(tmp.position.z) || !std::isfinite(tmp.yaw) || !std::isfinite(tmp.pitch)) {
        return false;
    }

    outPacket = tmp;
    return true;
}

std::vector<uint8_t> NetworkManager::serializeBlockChange(const BlockChangePacket& packet) {
    std::vector<uint8_t> buffer;
    buffer.push_back(static_cast<uint8_t>(PacketType::BlockChange));

    const uint8_t* posBytes = reinterpret_cast<const uint8_t*>(&packet.blockPos);
    buffer.insert(buffer.end(), posBytes, posBytes + sizeof(glm::ivec3));

    buffer.push_back(static_cast<uint8_t>(packet.newBlock));
    return buffer;
}

bool NetworkManager::deserializeBlockChange(const uint8_t* data, size_t size, BlockChangePacket& outPacket) {
    size_t expectedSize = 1 + sizeof(glm::ivec3) + 1;
    if (!data || size < expectedSize || data[0] != static_cast<uint8_t>(PacketType::BlockChange)) {
        return false;
    }

    glm::ivec3 pos;
    std::memcpy(&pos, data + 1, sizeof(glm::ivec3));
    uint8_t blockValue = data[1 + sizeof(glm::ivec3)];

    // Reject unknown block ids and positions outside the playable volume.
    if (!isValidBlockType(blockValue))
        return false;
    if (pos.y < 0 || pos.y >= CHUNK_SIZE_Y)
        return false;
    // Compared as int64 and without abs(): abs(INT_MIN) overflows.
    constexpr int64_t LIMIT = static_cast<int64_t>(MAX_COORDINATE);
    if (pos.x < -LIMIT || pos.x > LIMIT || pos.z < -LIMIT || pos.z > LIMIT)
        return false;

    outPacket.blockPos = pos;
    outPacket.newBlock = static_cast<BlockType>(blockValue);
    return true;
}

std::vector<uint8_t> NetworkManager::serializeChatMessage(const ChatMessagePacket& packet) {
    std::vector<uint8_t> buffer;
    buffer.push_back(static_cast<uint8_t>(PacketType::ChatMessage));

    uint32_t sid = packet.senderId;
    const uint8_t* sidBytes = reinterpret_cast<const uint8_t*>(&sid);
    buffer.insert(buffer.end(), sidBytes, sidBytes + sizeof(uint32_t));

    uint16_t msgLen = static_cast<uint16_t>(std::min(packet.message.length(), MAX_CHAT_LENGTH));
    const uint8_t* lenBytes = reinterpret_cast<const uint8_t*>(&msgLen);
    buffer.insert(buffer.end(), lenBytes, lenBytes + sizeof(uint16_t));

    buffer.insert(buffer.end(), packet.message.begin(), packet.message.begin() + msgLen);
    return buffer;
}

bool NetworkManager::deserializeChatMessage(const uint8_t* data, size_t size, ChatMessagePacket& outPacket) {
    if (!data || size < 1 + sizeof(uint32_t) + sizeof(uint16_t) ||
        data[0] != static_cast<uint8_t>(PacketType::ChatMessage)) {
        return false;
    }

    size_t offset = 1;
    uint32_t senderId = 0;
    std::memcpy(&senderId, data + offset, sizeof(uint32_t));
    offset += sizeof(uint32_t);

    uint16_t msgLen = 0;
    std::memcpy(&msgLen, data + offset, sizeof(uint16_t));
    offset += sizeof(uint16_t);

    if (msgLen > MAX_CHAT_LENGTH || size < offset + msgLen)
        return false;

    std::string message(reinterpret_cast<const char*>(data + offset), msgLen);
    // Control characters have no business in chat text (they could corrupt log/terminal output).
    for (char& c : message) {
        if (static_cast<unsigned char>(c) < 32 || c == 127)
            c = '?';
    }

    outPacket.senderId = senderId;
    outPacket.message = std::move(message);
    return true;
}

void NetworkManager::processIncomingPacket(const uint8_t* buffer, size_t size, World* world) {
    if (!buffer || size == 0)
        return;

    PacketType type = static_cast<PacketType>(buffer[0]);
    if (type == PacketType::PlayerPosition) {
        PlayerPosPacket pkt;
        if (deserializePlayerPos(buffer, size, pkt)) {
            bool found = false;
            for (auto& remote : m_RemotePlayers) {
                if (remote.playerId == pkt.playerId) {
                    remote.position = pkt.position;
                    remote.yaw = pkt.yaw;
                    remote.pitch = pkt.pitch;
                    found = true;
                    break;
                }
            }
            // Spoofed player ids must not be able to grow this list without bound.
            if (!found && m_RemotePlayers.size() < MAX_REMOTE_PLAYERS) {
                m_RemotePlayers.push_back(pkt);
            }
        }
    } else if (type == PacketType::BlockChange) {
        BlockChangePacket pkt;
        if (deserializeBlockChange(buffer, size, pkt)) {
            if (world) {
                world->setBlock(pkt.blockPos.x, pkt.blockPos.y, pkt.blockPos.z, pkt.newBlock);
            }
        }
    } else if (type == PacketType::ChatMessage) {
        ChatMessagePacket pkt;
        if (deserializeChatMessage(buffer, size, pkt)) {
            appendChat("<Player " + std::to_string(pkt.senderId) + "> " + pkt.message);
        }
    }
}

glm::vec3 NetworkManager::interpolateDeadReckoning(const glm::vec3& currentPos, const glm::vec3& targetPos,
                                                   const glm::vec3& velocity, float alpha, float deltaTime) {
    glm::vec3 predictedPos = targetPos + velocity * deltaTime;
    return glm::mix(currentPos, predictedPos, std::clamp(alpha, 0.0f, 1.0f));
}

float NetworkManager::interpolateAngle(float currentAngle, float targetAngle, float alpha) {
    // Shortest signed distance in [-180, 180]; std::fmod keeps the sign of its dividend, so fold explicitly.
    float diff = std::fmod(targetAngle - currentAngle, 360.0f);
    if (diff > 180.0f)
        diff -= 360.0f;
    else if (diff < -180.0f)
        diff += 360.0f;
    return currentAngle + diff * std::clamp(alpha, 0.0f, 1.0f);
}

void NetworkManager::queueIncomingPacket(const std::vector<uint8_t>& packet) {
    if (!packet.empty() && m_IncomingPacketQueue.size() < MAX_QUEUED_PACKETS) {
        m_IncomingPacketQueue.push_back(packet);
    }
}

void NetworkManager::flushIncomingPackets(World* world) {
    for (const auto& pkt : m_IncomingPacketQueue) {
        processIncomingPacket(pkt.data(), pkt.size(), world);
    }
    m_IncomingPacketQueue.clear();
}

} // namespace Minecraft
