#ifndef SECTIONEDBYTES_HPP
#define SECTIONEDBYTES_HPP

#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <memory>

namespace Minecraft {

// A 16 x 256 x 16 byte volume stored as 16 vertical sections of 16 x 16 x 16.
// A section is either "uniform" (one byte value, no memory) or "dense" (4096 bytes). Open sky above the
// terrain and solid rock below it are uniform, which cuts the memory of a typical chunk by more than half.
class SectionedBytes {
public:
    static constexpr int SECTIONS = 16;
    static constexpr int SECTION_VOLUME = 16 * 16 * 16;
    static constexpr int TOTAL_VOLUME = SECTIONS * SECTION_VOLUME;

    explicit SectionedBytes(uint8_t fill = 0) {
        for (Section& s : m_Sections)
            s.uniform = fill;
    }

    // No bounds checks: callers validate x/z in [0,16) and y in [0,256).
    uint8_t get(int x, int y, int z) const {
        const Section& s = m_Sections[y >> 4];
        return s.data ? s.data[index(x, y, z)] : s.uniform;
    }

    void set(int x, int y, int z, uint8_t value) {
        Section& s = m_Sections[y >> 4];
        if (!s.data) {
            if (value == s.uniform)
                return; // writing the value that is already there allocates nothing
            s.data = std::make_unique<uint8_t[]>(SECTION_VOLUME);
            std::memset(s.data.get(), s.uniform, SECTION_VOLUME);
        }
        s.data[index(x, y, z)] = value;
    }

    void fill(uint8_t value) {
        for (Section& s : m_Sections) {
            s.data.reset();
            s.uniform = value;
        }
    }

    // Turns dense sections whose bytes are all equal back into uniform ones.
    void compact() {
        for (Section& s : m_Sections) {
            if (!s.data)
                continue;
            const uint8_t first = s.data[0];
            bool same = true;
            for (int i = 1; i < SECTION_VOLUME && same; ++i)
                same = s.data[i] == first;
            if (same) {
                s.uniform = first;
                s.data.reset();
            }
        }
    }

    bool isSectionUniform(int section) const { return !m_Sections[section].data; }
    size_t allocatedBytes() const {
        size_t bytes = 0;
        for (const Section& s : m_Sections)
            if (s.data)
                bytes += SECTION_VOLUME;
        return bytes;
    }

    // Flat copies in [x][y][z] order (the layout of region files and of a BlockType[16][256][16] array).
    void exportTo(uint8_t* out) const {
        for (int x = 0; x < 16; ++x)
            for (int y = 0; y < 256; ++y)
                for (int z = 0; z < 16; ++z)
                    out[(x * 256 + y) * 16 + z] = get(x, y, z);
    }

private:
    struct Section {
        uint8_t uniform = 0;
        std::unique_ptr<uint8_t[]> data; // null while uniform
    };

    static int index(int x, int y, int z) { return (((y & 15) * 16) + z) * 16 + x; }

    Section m_Sections[SECTIONS];
};

} // namespace Minecraft

#endif // SECTIONEDBYTES_HPP
