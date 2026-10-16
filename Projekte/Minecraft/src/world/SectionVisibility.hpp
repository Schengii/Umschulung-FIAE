#ifndef SECTIONVISIBILITY_HPP
#define SECTIONVISIBILITY_HPP

#include <cstdint>
#include <vector>

namespace Minecraft {

// Cave-style occlusion culling ("visibility graph"): for every 16x16x16 section we remember which of its six
// faces are connected through non-opaque cells. A section is only rendered when the camera can reach it by
// travelling from section to section through connected faces (see World::updateVisibility).
struct SectionVisibility {
    enum Face { DOWN = 0, UP = 1, NORTH = 2, SOUTH = 3, WEST = 4, EAST = 5 }; // -y +y -z +z -x +x

    static constexpr uint16_t ALL_CONNECTED = 0x7FFF; // 15 face pairs
    static constexpr int DX[6] = {0, 0, 0, 0, -1, 1};
    static constexpr int DY[6] = {-1, 1, 0, 0, 0, 0};
    static constexpr int DZ[6] = {0, 0, -1, 1, 0, 0};

    static int opposite(int face) { return face ^ 1; }

    // Bit index of the unordered face pair (a, b), a != b.
    static int pairBit(int a, int b) {
        if (a > b) {
            int t = a;
            a = b;
            b = t;
        }
        return a * (11 - a) / 2 + (b - a - 1);
    }
    static bool connects(uint16_t mask, int a, int b) { return (mask >> pairBit(a, b)) & 1u; }

    // Faces (as a bit mask of 1 << Face) a viewer standing in cell (sx, sy, sz) can see out of: the faces
    // touched by the pocket of open cells around that cell. Standing inside solid rock leaves every face possible
    // (the camera can be clipped into a wall), which keeps the culling conservative.
    template <typename OpenFn> static unsigned reachableFaces(OpenFn&& isOpen, int sx, int sy, int sz) {
        constexpr int N = 16;
        if (sx < 0 || sy < 0 || sz < 0 || sx >= N || sy >= N || sz >= N || !isOpen(sx, sy, sz))
            return 0x3F;
        std::vector<uint8_t> visited(N * N * N, 0);
        std::vector<int> stack;
        auto idx = [](int x, int y, int z) { return (y * N + z) * N + x; };
        unsigned touched = 0;
        stack.push_back(idx(sx, sy, sz));
        visited[idx(sx, sy, sz)] = 1;
        while (!stack.empty()) {
            int cur = stack.back();
            stack.pop_back();
            int x = cur % N, z = (cur / N) % N, y = cur / (N * N);
            if (x == 0)
                touched |= 1u << WEST;
            if (x == N - 1)
                touched |= 1u << EAST;
            if (y == 0)
                touched |= 1u << DOWN;
            if (y == N - 1)
                touched |= 1u << UP;
            if (z == 0)
                touched |= 1u << NORTH;
            if (z == N - 1)
                touched |= 1u << SOUTH;
            for (int f = 0; f < 6; ++f) {
                int nx = x + DX[f], ny = y + DY[f], nz = z + DZ[f];
                if (nx < 0 || ny < 0 || nz < 0 || nx >= N || ny >= N || nz >= N)
                    continue;
                int ni = idx(nx, ny, nz);
                if (visited[ni] || !isOpen(nx, ny, nz))
                    continue;
                visited[ni] = 1;
                stack.push_back(ni);
            }
        }
        return touched;
    }

    // `isOpen(x, y, z)` tells whether the cell (0..15 each) lets the view through.
    template <typename OpenFn> static uint16_t computeConnectivity(OpenFn&& isOpen) {
        constexpr int N = 16;
        std::vector<uint8_t> visited(N * N * N, 0);
        std::vector<int> stack;
        uint16_t result = 0;

        auto idx = [](int x, int y, int z) { return (y * N + z) * N + x; };
        for (int sy = 0; sy < N; ++sy) {
            for (int sz = 0; sz < N; ++sz) {
                for (int sx = 0; sx < N; ++sx) {
                    if (visited[idx(sx, sy, sz)] || !isOpen(sx, sy, sz))
                        continue;

                    // Flood fill one connected pocket of open cells, noting which faces of the cube it touches.
                    unsigned touched = 0;
                    stack.clear();
                    stack.push_back(idx(sx, sy, sz));
                    visited[idx(sx, sy, sz)] = 1;
                    while (!stack.empty()) {
                        int cur = stack.back();
                        stack.pop_back();
                        int x = cur % N;
                        int z = (cur / N) % N;
                        int y = cur / (N * N);
                        if (x == 0)
                            touched |= 1u << WEST;
                        if (x == N - 1)
                            touched |= 1u << EAST;
                        if (y == 0)
                            touched |= 1u << DOWN;
                        if (y == N - 1)
                            touched |= 1u << UP;
                        if (z == 0)
                            touched |= 1u << NORTH;
                        if (z == N - 1)
                            touched |= 1u << SOUTH;

                        for (int f = 0; f < 6; ++f) {
                            int nx = x + DX[f], ny = y + DY[f], nz = z + DZ[f];
                            if (nx < 0 || ny < 0 || nz < 0 || nx >= N || ny >= N || nz >= N)
                                continue;
                            int ni = idx(nx, ny, nz);
                            if (visited[ni] || !isOpen(nx, ny, nz))
                                continue;
                            visited[ni] = 1;
                            stack.push_back(ni);
                        }
                    }

                    for (int a = 0; a < 6; ++a)
                        for (int b = a + 1; b < 6; ++b)
                            if ((touched >> a & 1u) && (touched >> b & 1u))
                                result |= static_cast<uint16_t>(1u << pairBit(a, b));
                }
            }
        }
        return result;
    }
};

} // namespace Minecraft

#endif // SECTIONVISIBILITY_HPP
