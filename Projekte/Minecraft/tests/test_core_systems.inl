// Tests for the core-system hardening work: camera, thread-safe persistence, seeds,
// chunk-border meshing/features, game saves, tool tables and network validation.
// Included by test_engine.cpp (after the harness and all engine headers).

#include "../src/renderer/Camera.hpp"
#include "../src/world/GameSave.hpp"
#include "../src/world/SectionedBytes.hpp"

#include <algorithm>
#include <atomic>
#include <chrono>
#include <cmath>
#include <fstream>
#include <limits>
#include <set>
#include <thread>
#include <tuple>

namespace {

// Scratch directory below the working directory that is wiped before and after use.
struct ScratchDir {
    std::string path;
    explicit ScratchDir(const std::string& name) : path("test_scratch/" + name) {
        RegionManager::getInstance().clearCache();
        std::filesystem::remove_all(path);
    }
    ~ScratchDir() {
        RegionManager::getInstance().clearCache();
        std::filesystem::remove_all(path);
    }
};

void clearChunk(Chunk& chunk) {
    for (int x = 0; x < 16; ++x)
        for (int y = 0; y < 256; ++y)
            for (int z = 0; z < 16; ++z)
                chunk.setBlock(x, y, z, BlockType::Air);
}

} // namespace

void testCameraKeepsOrientationWhenMoved() {
    std::cout << "[TEST] 91. Camera keeps yaw/pitch when only the position changes..." << std::endl;
    Camera cam(glm::vec3(0.0f, 65.0f, 0.0f));
    cam.processMouseMovement(300.0f, -200.0f); // turn
    glm::vec3 frontBefore = cam.getFront();
    float yawBefore = cam.getYaw();

    cam.setPosition(glm::vec3(10.0f, 70.0f, -4.0f));
    assert(cam.getPosition() == glm::vec3(10.0f, 70.0f, -4.0f));
    assert(cam.getFront() == frontBefore);
    assert(cam.getYaw() == yawBefore);

    cam.setRotation(0.0f, 0.0f);
    assert(std::fabs(cam.getFront().x - 1.0f) < 1e-4f);
    assert(std::fabs(cam.getFront().y) < 1e-4f);

    cam.setRotation(0.0f, 200.0f); // pitch is clamped like mouse look
    assert(cam.getPitch() <= 89.0f);
    std::cout << "  -> Camera orientation tests PASSED!" << std::endl;
}

void testRegionManagerIsThreadSafe() {
    std::cout << "[TEST] 92. RegionManager concurrent save/load from worker threads..." << std::endl;
    ScratchDir dir("region_mt");

    constexpr int THREADS = 8;
    constexpr int CHUNKS_PER_THREAD = 12;
    std::atomic<int> failures{0};

    std::vector<std::thread> threads;
    for (int t = 0; t < THREADS; ++t) {
        threads.emplace_back([&, t]() {
            std::vector<BlockType> blocks(16 * 256 * 16);
            std::vector<BlockType> readBlocks(16 * 256 * 16);
            std::vector<uint8_t> light(16 * 256 * 16), readLight(16 * 256 * 16);
            auto asBlocks = [](std::vector<BlockType>& v) { return reinterpret_cast<BlockType(*)[256][16]>(v.data()); };
            auto asLight = [](std::vector<uint8_t>& v) { return reinterpret_cast<uint8_t(*)[256][16]>(v.data()); };

            for (int i = 0; i < CHUNKS_PER_THREAD; ++i) {
                uint8_t pattern = static_cast<uint8_t>(t * 16 + i + 1);
                std::fill(blocks.begin(), blocks.end(), static_cast<BlockType>(pattern % 60 + 1));
                std::fill(light.begin(), light.end(), pattern);

                if (!RegionManager::getInstance().saveChunk(t, i, asBlocks(blocks), asLight(light), dir.path)) {
                    ++failures;
                    continue;
                }
                if (!RegionManager::getInstance().loadChunk(t, i, asBlocks(readBlocks), asLight(readLight), dir.path)) {
                    ++failures;
                    continue;
                }
                if (blocks != readBlocks || light != readLight)
                    ++failures;
            }
        });
    }
    for (auto& th : threads)
        th.join();
    assert(failures == 0);

    // Everything written concurrently must also be intact when read back afterwards.
    RegionManager::getInstance().clearCache();
    std::vector<BlockType> readBlocks(16 * 256 * 16);
    std::vector<uint8_t> readLight(16 * 256 * 16);
    for (int t = 0; t < THREADS; ++t) {
        for (int i = 0; i < CHUNKS_PER_THREAD; ++i) {
            bool ok = RegionManager::getInstance().loadChunk(
                t, i, reinterpret_cast<BlockType(*)[256][16]>(readBlocks.data()),
                reinterpret_cast<uint8_t(*)[256][16]>(readLight.data()), dir.path);
            assert(ok);
            uint8_t pattern = static_cast<uint8_t>(t * 16 + i + 1);
            assert(readLight[0] == pattern);
            assert(readBlocks[0] == static_cast<BlockType>(pattern % 60 + 1));
        }
    }
    std::cout << "  -> Concurrent region access tests PASSED!" << std::endl;
}

void testRegionFileReusesSectors() {
    std::cout << "[TEST] 93. RegionFile reuses sectors instead of growing on every rewrite..." << std::endl;
    ScratchDir dir("region_sectors");

    std::vector<BlockType> blocks(16 * 256 * 16, BlockType::Stone);
    std::vector<uint8_t> light(16 * 256 * 16, 0xF0);
    auto b = reinterpret_cast<BlockType(*)[256][16]>(blocks.data());
    auto l = reinterpret_cast<uint8_t(*)[256][16]>(light.data());

    for (int i = 0; i < 25; ++i) {
        blocks[0] = static_cast<BlockType>(i % 8 + 1);
        assert(RegionManager::getInstance().saveChunk(0, 0, b, l, dir.path));
    }
    auto file = RegionFile::getRegionFilePath(0, 0, dir.path);
    auto size = std::filesystem::file_size(file);
    // header (2 sectors) + at most two copies of the chunk, not 25.
    assert(size <= static_cast<uintmax_t>(SECTOR_SIZE) * (2 + 2 * 33));

    std::vector<BlockType> back(16 * 256 * 16);
    std::vector<uint8_t> backLight(16 * 256 * 16);
    assert(RegionManager::getInstance().loadChunk(0, 0, reinterpret_cast<BlockType(*)[256][16]>(back.data()),
                                                  reinterpret_cast<uint8_t(*)[256][16]>(backLight.data()), dir.path));
    assert(back[0] == static_cast<BlockType>(24 % 8 + 1));
    std::cout << "  -> Region sector reuse tests PASSED!" << std::endl;
}

void testChunksAreOnlySavedWhenModified() {
    std::cout << "[TEST] 94. Chunks are persisted only after modification (dirty-save)..." << std::endl;
    ScratchDir dir("chunk_persist");
    const uint32_t seed = 777;

    {
        Chunk fresh(3, 3, seed, dir.path);
        assert(!fresh.needsSave());
        assert(fresh.saveIfNeeded());
    }
    // Merely generating (and "saving") an untouched chunk must not create a region file.
    assert(!std::filesystem::exists(RegionFile::getRegionFilePath(0, 0, dir.path)));

    {
        Chunk edited(3, 3, seed, dir.path);
        edited.setBlock(4, 200, 4, BlockType::EmeraldBlock);
        assert(edited.needsSave());
        assert(edited.saveIfNeeded());
        assert(!edited.needsSave());
    }
    assert(std::filesystem::exists(RegionFile::getRegionFilePath(0, 0, dir.path)));

    Chunk reloaded(3, 3, seed, dir.path);
    assert(reloaded.getBlock(4, 200, 4) == BlockType::EmeraldBlock);
    assert(!reloaded.needsSave()); // loading is not a modification

    // A different save directory is a different world.
    ScratchDir other("chunk_persist_other");
    Chunk elsewhere(3, 3, seed, other.path);
    assert(elsewhere.getBlock(4, 200, 4) == BlockType::Air);
    std::cout << "  -> Dirty-save persistence tests PASSED!" << std::endl;
}

void testSeedControlsTerrain() {
    std::cout << "[TEST] 95. World seed makes terrain deterministic and distinct..." << std::endl;
    ScratchDir dir("seed_terrain");

    auto heightSignature = [&](uint32_t seed) {
        Chunk c(5, -7, seed, dir.path + "/" + std::to_string(seed));
        std::vector<int> heights;
        for (int x = 0; x < 16; x += 3)
            for (int z = 0; z < 16; z += 3) {
                int y = 255;
                while (y > 0 && c.getBlock(x, y, z) == BlockType::Air)
                    --y;
                heights.push_back(y);
            }
        return heights;
    };

    assert(heightSignature(42) == heightSignature(42));
    assert(heightSignature(42) != heightSignature(43));
    // 0 is the default seed and reproduces the historical terrain.
    assert(heightSignature(World::DEFAULT_SEED) == heightSignature(0));

    assert(Application::seedFromString("12345") == 12345u);
    assert(Application::seedFromString("0") == 0u);
    assert(Application::seedFromString("diamonds") == Application::seedFromString("diamonds"));
    assert(Application::seedFromString("diamonds") != Application::seedFromString("diamondz"));
    assert(Application::seedFromString("12345678901234") ==
           Application::seedFromString("12345678901234")); // too long to be numeric: hashed
    std::cout << "  -> Seed tests PASSED!" << std::endl;
}

void testMeshingSeesNeighbourChunks() {
    std::cout << "[TEST] 96. Chunk-border faces and lighting come from neighbouring chunks..." << std::endl;
    Chunk a(0, 0);
    Chunk b(1, 0);
    clearChunk(a);
    clearChunk(b);
    for (int x = 0; x < 16; ++x)
        for (int y = 0; y < 10; ++y)
            for (int z = 0; z < 16; ++z) {
                a.setBlock(x, y, z, BlockType::Stone);
                b.setBlock(x, y, z, BlockType::Stone);
            }

    MeshData alone = ChunkMesh::buildMeshData(a);

    MeshInput withNeighbour(0, 0);
    withNeighbour.copyChunk(a, 0, 0);
    withNeighbour.copyChunk(b, 1, 0);
    MeshData joined = ChunkMesh::buildMeshData(withNeighbour);

    // The shared wall (16 x 10 blocks, one quad per block face, 4 vertices each) must disappear.
    assert(alone.vertices.size() - joined.vertices.size() == 16 * 10 * 4);
    assert(withNeighbour.getBlock(16, 5, 3) == BlockType::Stone);
    assert(withNeighbour.getBlock(-1, 5, 3) == BlockType::Air); // no west neighbour copied
    assert(withNeighbour.getSunlight(-1, 5, 3) == 15);

    // Border light is taken from the neighbour, not assumed.
    b.setSunlight(0, 20, 5, 3);
    MeshInput lit(0, 0);
    lit.copyChunk(a, 0, 0);
    lit.copyChunk(b, 1, 0);
    assert(lit.getSunlight(16, 20, 5) == 3);
    std::cout << "  -> Neighbour-aware meshing tests PASSED!" << std::endl;
}

void testWorldBordersAndNegativeCoordinates() {
    std::cout << "[TEST] 97. World coordinate math, dirty neighbours and re-meshing..." << std::endl;
    ScratchDir dir("world_coords");
    World world(1, 5, dir.path);

    // Floor semantics for negative coordinates.
    world.setBlock(-1, 80, -1, BlockType::EmeraldBlock);
    world.setBlock(-16, 81, -16, BlockType::Bookshelf);
    world.setBlock(-17, 82, 0, BlockType::Hopper);
    assert(world.getBlock(-1, 80, -1) == BlockType::EmeraldBlock);
    assert(world.getBlock(-16, 81, -16) == BlockType::Bookshelf);
    assert(world.getBlock(-17, 82, 0) == BlockType::Hopper);
    assert(world.getChunk(-1, -1) != nullptr);
    assert(world.getChunk(-2, 0) != nullptr);
    assert(world.getChunk(-1, -1)->getBlock(15, 80, 15) == BlockType::EmeraldBlock);
    assert(world.getBlock(0, -5, 0) == BlockType::Air);  // below the world
    assert(world.getBlock(0, 300, 0) == BlockType::Air); // above the world

    // Settle everything, then edit a block on a chunk border: the neighbour must be re-meshed too.
    glm::vec3 playerPos(0.0f, 70.0f, 0.0f);
    world.remeshDirtyChunks(playerPos, 100000.0);
    for (int cx = -1; cx <= 1; ++cx)
        for (int cz = -1; cz <= 1; ++cz)
            assert(!world.getChunk(cx, cz)->isDirty());

    world.setBlock(0, 90, 5, BlockType::Stone); // x = 0 -> west border of chunk (0,0)
    assert(world.getChunk(0, 0)->isDirty());
    assert(world.getChunk(-1, 0)->isDirty());
    assert(!world.getChunk(1, 0)->isDirty());
    assert(!world.getChunk(0, 1)->isDirty());

    int remeshed = world.remeshDirtyChunks(playerPos, 100000.0);
    assert(remeshed == 2);
    assert(!world.getChunk(0, 0)->isDirty() && !world.getChunk(-1, 0)->isDirty());

    // Writing the value that is already there is a no-op (no dirtying, no saving churn).
    world.setBlock(0, 90, 5, BlockType::Stone);
    assert(!world.getChunk(0, 0)->isDirty());

    // The render helpers must cope with chunks that have no GPU mesh (headless run).
    world.render(nullptr);
    world.renderTransparent(nullptr, &playerPos);
    world.renderShadowCasters(playerPos, 100.0f);
    std::cout << "  -> World border & coordinate tests PASSED!" << std::endl;
}

void testWorldSavesAndReloadsModifiedChunks() {
    std::cout << "[TEST] 98. World saves modified chunks on unload and shutdown..." << std::endl;
    ScratchDir dir("world_reload");
    const uint32_t seed = 99;

    {
        World world(1, seed, dir.path);
        world.setBlock(5, 120, 5, BlockType::DiamondOre); // chunk (0,0)
        world.setBlock(40, 121, 40, BlockType::GoldOre);  // chunk (2,2): outside the initial 3x3 -> created on demand
        assert(world.getChunk(2, 2) != nullptr);

        // Player far away: both chunks are unloaded and must be flushed to disk.
        world.unloadFarChunks(glm::vec3(100000.0f, 70.0f, 100000.0f));
        assert(world.getChunk(0, 0) == nullptr);
        assert(world.getChunk(2, 2) == nullptr);
    }
    {
        World world(1, seed, dir.path);
        assert(world.getBlock(5, 120, 5) == BlockType::DiamondOre);
        world.setBlock(6, 120, 6, BlockType::EmeraldBlock);
        // Destructor saves what is still loaded.
    }
    World again(1, seed, dir.path);
    assert(again.getBlock(5, 120, 5) == BlockType::DiamondOre);
    assert(again.getBlock(6, 120, 6) == BlockType::EmeraldBlock);
    assert(again.getBlock(40, 121, 40) == BlockType::Air); // (2,2) is not loaded in this world
    again.setBlock(40, 121, 41, BlockType::Air);           // creates + loads chunk (2,2) from disk
    assert(again.getBlock(40, 121, 40) == BlockType::GoldOre);
    std::cout << "  -> World persistence tests PASSED!" << std::endl;
}

void testDimensionsKeepSeparateSaves() {
    std::cout << "[TEST] 99. Each dimension has its own save folder and shared worker pool..." << std::endl;
    ScratchDir dir("dimensions");
    {
        DimensionManager dm(321, dir.path, 1);
        assert(dm.getSeed() == 321);
        World* overworld = dm.getCurrentWorld();
        assert(overworld->getSaveDir() == dir.path + "/overworld");
        overworld->setBlock(3, 150, 3, BlockType::Glowstone);
        dm.saveAll();
    }
    // The nether generator edits chunks at creation time, so its folder exists; overworld data is separate from it.
    assert(std::filesystem::exists(dir.path + "/nether"));
    {
        DimensionManager dm(321, dir.path, 1);
        assert(dm.getCurrentWorld()->getBlock(3, 150, 3) == BlockType::Glowstone);
        dm.switchDimension(DimensionType::Nether);
        assert(dm.getCurrentWorld()->getSaveDir() == dir.path + "/nether");
        assert(dm.getCurrentWorld()->getBlock(3, 150, 3) != BlockType::Glowstone);
    }
    std::cout << "  -> Dimension save separation tests PASSED!" << std::endl;
}

void testTreesCrossChunkBorders() {
    std::cout << "[TEST] 100. Trees growing over a chunk border are completed by the neighbour..." << std::endl;
    ScratchDir dir("trees");

    bool found = false;
    for (int cx = -25; cx <= 25 && !found; ++cx) {
        for (int cz = -25; cz <= 25 && !found; ++cz) {
            Chunk west(cx, cz, 5, dir.path);
            // A trunk in the easternmost column...
            for (int z = 2; z < 14 && !found; ++z) {
                int top = -1;
                for (int y = 255; y > 0; --y) {
                    BlockType t = west.getBlock(15, y, z);
                    if (t == BlockType::OakLog || t == BlockType::BirchLog) {
                        top = y;
                        break;
                    }
                }
                if (top < 0 || west.getBlock(15, top - 1, z) == BlockType::Air)
                    continue;

                // ...must have its canopy continue in the chunk to the east.
                Chunk east(cx + 1, cz, 5, dir.path);
                // Skip trunks whose canopy would run into higher terrain of the neighbour (hill side).
                BlockType probe = east.getBlock(0, top, z);
                if (probe != BlockType::Air && probe != BlockType::Leaves)
                    continue;
                assert(east.getBlock(0, top, z) == BlockType::Leaves ||
                       east.getBlock(0, top - 1, z) == BlockType::Leaves);
                assert(east.getBlock(1, top, z) == BlockType::Leaves ||
                       east.getBlock(1, top - 1, z) == BlockType::Leaves);
                found = true;
            }
        }
    }
    assert(found);
    std::cout << "  -> Cross-chunk tree tests PASSED!" << std::endl;
}

void testToolHardnessAndUnbreakableBlocks() {
    std::cout << "[TEST] 101. Block hardness table, obsidian tiers and unbreakable blocks..." << std::endl;
    assert(ToolSystem::getBlockHardness(BlockType::Dirt) == 0.5f);
    assert(ToolSystem::getBlockHardness(BlockType::Stone) == 1.5f);
    assert(ToolSystem::getBlockHardness(BlockType::Obsidian) == 5.0f);
    assert(ToolSystem::getBlockHardness(BlockType::Leaves) < ToolSystem::getBlockHardness(BlockType::Stone));

    assert(ToolSystem::isUnbreakable(BlockType::Bedrock));
    assert(!ToolSystem::isUnbreakable(BlockType::Stone));

    // Obsidian: pickaxe only, diamond tier required, faster with better pickaxes.
    assert(ToolSystem::canHarvest(BlockType::Obsidian, BlockType::DiamondPickaxe));
    assert(!ToolSystem::canHarvest(BlockType::Obsidian, BlockType::IronPickaxe));
    assert(!ToolSystem::canHarvest(BlockType::Obsidian, BlockType::Air));
    assert(ToolSystem::getMiningSpeed(BlockType::Obsidian, BlockType::DiamondPickaxe) >
           ToolSystem::getMiningSpeed(BlockType::Obsidian, BlockType::WoodPickaxe));

    // Other stone-class blocks need at least a wooden pickaxe.
    assert(!ToolSystem::canHarvest(BlockType::Furnace, BlockType::Air));
    assert(ToolSystem::canHarvest(BlockType::Furnace, BlockType::WoodPickaxe));
    assert(ToolSystem::canHarvest(BlockType::Dirt, BlockType::Air));
    std::cout << "  -> Tool hardness tests PASSED!" << std::endl;
}

void testInventoryStartsEmpty() {
    std::cout << "[TEST] 102. A new Inventory is empty; the creative hotbar is opt-in..." << std::endl;
    Inventory inv;
    for (int i = 0; i < 36; ++i)
        assert(inv.getSlot(i).isEmpty());

    assert(inv.addItem(BlockType::IronPickaxe, 1));
    assert(inv.getSlot(0).type == BlockType::IronPickaxe); // lands in the hotbar

    inv.fillCreativeHotbar();
    assert(inv.getSlot(0).type == BlockType::Grass && inv.getSlot(0).count == 64);
    assert(inv.getSlot(8).type == BlockType::Bedrock);
    std::cout << "  -> Inventory default tests PASSED!" << std::endl;
}

void testContainerRemovalReturnsItems() {
    std::cout << "[TEST] 103. Breaking a chest/furnace hands back its contents..." << std::endl;
    ChestManager chests;
    glm::ivec3 pos(4, 70, 4);
    chests.createChest(pos);
    chests.setSlot(pos, 0, BlockType::DiamondOre, 7);
    chests.setSlot(pos, 13, BlockType::Planks, 3);
    assert(chests.getChestCount() == 1);

    auto items = chests.removeChest(pos);
    assert(items.size() == 2);
    assert(items[0].type == BlockType::DiamondOre && items[0].count == 7);
    assert(chests.getChestCount() == 0);
    assert(chests.removeChest(pos).empty()); // removing twice must not duplicate items

    FurnaceManager furnaces;
    FurnaceData* f = furnaces.getFurnace(pos);
    f->input = ItemStack{BlockType::IronOre, 5, 64};
    f->fuel = ItemStack{BlockType::OakLog, 2, 64};
    auto fItems = furnaces.removeFurnace(pos);
    assert(fItems.size() == 2);
    assert(furnaces.getFurnaceCount() == 0);
    std::cout << "  -> Container removal tests PASSED!" << std::endl;
}

void testGameSaveRoundTripAndCorruption() {
    std::cout << "[TEST] 104. Game save file round trip, atomic write and corruption handling..." << std::endl;
    ScratchDir dir("game_save");

    GameSaveData d;
    d.seed = 4242;
    d.dimension = 1;
    d.position = glm::vec3(12.5f, 71.0f, -33.25f);
    d.yaw = 123.0f;
    d.pitch = -17.5f;
    d.health = 13.0f;
    d.hunger = 7.5f;
    d.timeTicks = 18250.0f;
    d.selectedSlot = 4;
    d.flying = true;
    d.inventory.assign(36, ItemStack{});
    d.inventory[0] = ItemStack{BlockType::DiamondPickaxe, 1, 1, 1500, 1561, 3, 2};
    d.inventory[17] = ItemStack{BlockType::Planks, 33, 64};
    d.armor[2] = ItemStack{BlockType::IronBars, 1, 1};
    d.chests.push_back({glm::ivec3(1, 2, 3), std::vector<ItemStack>(27, ItemStack{})});
    d.chests[0].second[5] = ItemStack{BlockType::Emerald, 9, 64};
    FurnaceData fd;
    fd.input = ItemStack{BlockType::Sand, 4, 64};
    fd.cookTimer = 1.25f;
    fd.fuelBurnTimer = 3.5f;
    d.furnaces.push_back({glm::ivec3(-7, 64, 9), fd});

    assert(!GameSave::exists(dir.path));
    assert(GameSave::write(d, dir.path));
    assert(GameSave::exists(dir.path));
    assert(!std::filesystem::exists(GameSave::filePath(dir.path) + ".tmp")); // atomic: no temp file left

    GameSaveData r;
    assert(GameSave::read(r, dir.path));
    assert(r.seed == 4242 && r.dimension == 1 && r.selectedSlot == 4 && r.flying);
    assert(r.position == d.position && r.yaw == 123.0f && r.pitch == -17.5f);
    assert(r.health == 13.0f && r.hunger == 7.5f && r.timeTicks == 18250.0f);
    assert(r.inventory.size() == 36);
    assert(r.inventory[0].type == BlockType::DiamondPickaxe && r.inventory[0].durability == 1500 &&
           r.inventory[0].enchantmentLevel == 3 && r.inventory[0].enchantmentType == 2);
    assert(r.inventory[17].type == BlockType::Planks && r.inventory[17].count == 33);
    assert(r.armor[2].type == BlockType::IronBars);
    assert(r.chests.size() == 1 && r.chests[0].first == glm::ivec3(1, 2, 3) && r.chests[0].second.size() == 27);
    assert(r.chests[0].second[5].type == BlockType::Emerald && r.chests[0].second[5].count == 9);
    assert(r.furnaces.size() == 1 && r.furnaces[0].first == glm::ivec3(-7, 64, 9));
    assert(r.furnaces[0].second.input.type == BlockType::Sand && r.furnaces[0].second.cookTimer == 1.25f);

    // Truncated file -> rejected, never a half-restored game.
    std::string path = GameSave::filePath(dir.path);
    auto fullSize = std::filesystem::file_size(path);
    std::filesystem::resize_file(path, fullSize / 2);
    GameSaveData broken;
    assert(!GameSave::read(broken, dir.path));

    // Foreign file -> rejected.
    {
        std::ofstream out(path, std::ios::binary | std::ios::trunc);
        out << "this is not a save file at all";
    }
    assert(!GameSave::read(broken, dir.path));

    // Missing -> rejected.
    std::filesystem::remove(path);
    assert(!GameSave::read(broken, dir.path));
    std::cout << "  -> Game save tests PASSED!" << std::endl;
}

void testNetworkInputValidation() {
    std::cout << "[TEST] 105. Network packets are validated and bounded..." << std::endl;

    // Unknown block ids and out-of-world positions are rejected.
    BlockChangePacket good;
    good.blockPos = glm::ivec3(10, 64, -10);
    good.newBlock = BlockType::Stone;
    auto goodBytes = NetworkManager::serializeBlockChange(good);
    BlockChangePacket out;
    assert(NetworkManager::deserializeBlockChange(goodBytes.data(), goodBytes.size(), out));

    auto badBlock = goodBytes;
    badBlock.back() = 250;
    assert(!NetworkManager::deserializeBlockChange(badBlock.data(), badBlock.size(), out));

    BlockChangePacket tooHigh = good;
    tooHigh.blockPos.y = 4000;
    auto tooHighBytes = NetworkManager::serializeBlockChange(tooHigh);
    assert(!NetworkManager::deserializeBlockChange(tooHighBytes.data(), tooHighBytes.size(), out));

    // NaN / infinite / absurd positions are rejected.
    PlayerPosPacket pos;
    pos.playerId = 5;
    pos.position = glm::vec3(1.0f, 2.0f, 3.0f);
    PlayerPosPacket posOut;
    assert(
        NetworkManager::deserializePlayerPos(NetworkManager::serializePlayerPos(pos).data(), 1 + 4 + 12 + 8, posOut));
    pos.position.x = std::nanf("");
    auto nanBytes = NetworkManager::serializePlayerPos(pos);
    assert(!NetworkManager::deserializePlayerPos(nanBytes.data(), nanBytes.size(), posOut));
    pos.position = glm::vec3(1e20f, 0.0f, 0.0f);
    auto hugeBytes = NetworkManager::serializePlayerPos(pos);
    assert(!NetworkManager::deserializePlayerPos(hugeBytes.data(), hugeBytes.size(), posOut));

    // Chat: oversize rejected, control characters neutralised, truncated packets rejected.
    ChatMessagePacket chat;
    chat.senderId = 2;
    chat.message = "hi\x01there\n";
    auto chatBytes = NetworkManager::serializeChatMessage(chat);
    ChatMessagePacket chatOut;
    assert(NetworkManager::deserializeChatMessage(chatBytes.data(), chatBytes.size(), chatOut));
    assert(chatOut.message == "hi?there?");
    assert(!NetworkManager::deserializeChatMessage(chatBytes.data(), chatBytes.size() - 3, chatOut));

    ChatMessagePacket huge;
    huge.message = std::string(1000, 'x');
    auto hugeChat = NetworkManager::serializeChatMessage(huge); // serializer clamps to the maximum
    assert(NetworkManager::deserializeChatMessage(hugeChat.data(), hugeChat.size(), chatOut));
    assert(chatOut.message.size() == NetworkManager::MAX_CHAT_LENGTH);
    auto forged = hugeChat;
    uint16_t lie = 5000; // a forged length field must not be trusted
    std::memcpy(forged.data() + 1 + 4, &lie, sizeof(lie));
    assert(!NetworkManager::deserializeChatMessage(forged.data(), forged.size(), chatOut));

    // Bounded state: spoofed player ids and chat spam cannot grow memory without limit.
    NetworkManager net;
    for (uint32_t id = 1; id <= 500; ++id) {
        PlayerPosPacket p;
        p.playerId = id;
        auto bytes = NetworkManager::serializePlayerPos(p);
        net.processIncomingPacket(bytes.data(), bytes.size(), nullptr);
    }
    assert(net.getRemotePlayers().size() == NetworkManager::MAX_REMOTE_PLAYERS);
    for (int i = 0; i < 1000; ++i) {
        ChatMessagePacket c;
        c.senderId = 9;
        c.message = "spam " + std::to_string(i);
        auto bytes = NetworkManager::serializeChatMessage(c);
        net.processIncomingPacket(bytes.data(), bytes.size(), nullptr);
    }
    assert(net.getChatLog().size() == NetworkManager::MAX_CHAT_LOG_ENTRIES);
    assert(net.getChatLog().back() == "<Player 9> spam 999");

    // Garbage never crashes.
    uint8_t junk[3] = {0xFF, 0x00, 0x13};
    net.processIncomingPacket(junk, sizeof(junk), nullptr);
    net.processIncomingPacket(junk, 0, nullptr);
    net.processIncomingPacket(nullptr, 0, nullptr);
    std::cout << "  -> Network validation tests PASSED!" << std::endl;
}

namespace {

// Pumps all given managers until `done()` holds (or a timeout), like the game loop would.
template <typename Done> bool pumpNetwork(std::vector<NetworkManager*> nets, World* world, Done done) {
    for (int i = 0; i < 400; ++i) {
        for (NetworkManager* n : nets)
            n->update(world);
        if (done())
            return true;
        std::this_thread::sleep_for(std::chrono::milliseconds(5));
    }
    return false;
}

constexpr uint32_t LOOPBACK = 0x0100007F; // 127.0.0.1 in network byte order on little-endian hosts

} // namespace

void testNetworkSocketLifecycle() {
    std::cout << "[TEST] 106. UDP handshake over loop-back, port conflicts and failed binds..." << std::endl;
    NetworkManager server;
    assert(server.startServer(25611));
    assert(server.isServer() && server.isConnected() && server.isHandshaken());
    assert(server.getLocalPlayerId() == 0);

    // A second socket on the same port must fail and must not claim to be connected.
    NetworkManager second;
    assert(!second.startServer(25611));
    assert(!second.isConnected() && !second.isServer());

    NetworkManager client;
    assert(!client.connectToServer("not an ip", 25611));
    assert(!client.isConnected());
    assert(client.connectToServer("127.0.0.1", 25611));
    assert(!client.isServer());
    assert(!client.isHandshaken());

    // Game packets sent before the handshake finished are dropped, not queued or leaked.
    client.sendChatMessage("too early");

    assert(pumpNetwork({&server, &client}, nullptr, [&]() { return client.isHandshaken(); }));
    assert(server.getPeerCount() == 1);
    assert(client.getLocalPlayerId() == 1);
    assert(client.getSessionToken() != 0);

    client.sendChatMessage("loopback hello");
    bool delivered = false;
    assert(pumpNetwork({&server, &client}, nullptr, [&]() {
        for (const std::string& line : server.getChatLog())
            if (line.find("<Player 1> loopback hello") != std::string::npos)
                delivered = true;
        return delivered;
    }));
    for (const std::string& line : server.getChatLog())
        assert(line.find("too early") == std::string::npos);

    client.disconnect();
    assert(!client.isConnected() && !client.isHandshaken());
    server.disconnect();
    // The port is free again after disconnecting.
    NetworkManager third;
    assert(third.startServer(25611));
    std::cout << "  -> Socket lifecycle tests PASSED!" << std::endl;
}

void testNetworkEnvelopeAndSequences() {
    std::cout << "[TEST] 116. Packet envelope, sequence numbers and replay protection..." << std::endl;
    std::vector<uint8_t> payload = {2, 9, 8, 7};
    auto wire = NetworkManager::wrapEnvelope(0xCAFEBABEu, 42u, payload);
    assert(wire.size() == NetworkManager::ENVELOPE_SIZE + payload.size());

    uint64_t token = 0;
    uint32_t seq = 0;
    const uint8_t* body = nullptr;
    size_t bodySize = 0;
    assert(NetworkManager::unwrapEnvelope(wire.data(), wire.size(), token, seq, body, bodySize));
    assert(token == 0xCAFEBABEu && seq == 42u && bodySize == 4 && body[1] == 9);

    auto badMagic = wire;
    badMagic[0] = 'X';
    auto badVersion = wire;
    badVersion[2] = 99;
    assert(!NetworkManager::unwrapEnvelope(badMagic.data(), badMagic.size(), token, seq, body, bodySize));
    assert(!NetworkManager::unwrapEnvelope(badVersion.data(), badVersion.size(), token, seq, body, bodySize));
    assert(!NetworkManager::unwrapEnvelope(wire.data(), NetworkManager::ENVELOPE_SIZE, token, seq, body,
                                           bodySize)); // no payload
    assert(!NetworkManager::unwrapEnvelope(nullptr, 100, token, seq, body, bodySize));

    assert(NetworkManager::isNewerSequence(5, 4));
    assert(!NetworkManager::isNewerSequence(4, 4));          // duplicate
    assert(!NetworkManager::isNewerSequence(3, 4));          // old / replayed
    assert(NetworkManager::isNewerSequence(2, 0xFFFFFFFEu)); // wraps around
    assert(!NetworkManager::isNewerSequence(0xFFFFFFFEu, 2));
    std::cout << "  -> Envelope tests PASSED!" << std::endl;
}

void testNetworkServerIsAuthoritative() {
    std::cout << "[TEST] 117. Server authenticates clients, ignores forgeries and relays validated edits..."
              << std::endl;
    ScratchDir dir("net_world");
    World world(1, 3, dir.path);
    world.setBlock(0, 100, 0, BlockType::Air);

    NetworkManager server, alice, bob;
    assert(server.startServer(25612));
    assert(alice.connectToServer("127.0.0.1", 25612));
    assert(bob.connectToServer("127.0.0.1", 25612));
    assert(pumpNetwork({&server, &alice, &bob}, &world, [&]() { return alice.isHandshaken() && bob.isHandshaken(); }));
    assert(server.getPeerCount() == 2);
    assert(alice.getLocalPlayerId() != bob.getLocalPlayerId());
    assert(alice.getLocalPlayerId() >= 1 && bob.getLocalPlayerId() >= 1);

    // Positions are relayed to the other clients, with the id the server assigned.
    alice.sendPlayerPosition(glm::vec3(2.0f, 100.0f, 2.0f), 45.0f, 5.0f);
    assert(pumpNetwork({&server, &alice, &bob}, &world,
                       [&]() { return !bob.getRemotePlayers().empty() && !server.getRemotePlayers().empty(); }));
    assert(bob.getRemotePlayers()[0].playerId == alice.getLocalPlayerId());
    assert(bob.getRemotePlayers()[0].position == glm::vec3(2.0f, 100.0f, 2.0f));
    for (const auto& rp : alice.getRemotePlayers())
        assert(rp.playerId != alice.getLocalPlayerId()); // never shown to herself

    // A nearby edit is applied by the server and relayed; a far-away edit is rejected.
    alice.sendBlockChange(glm::ivec3(3, 100, 2), BlockType::EmeraldBlock);
    alice.sendBlockChange(glm::ivec3(14, 100, 2), BlockType::Glowstone); // 12 blocks away: out of reach
    assert(pumpNetwork({&server, &alice, &bob}, &world,
                       [&]() { return world.getBlock(3, 100, 2) == BlockType::EmeraldBlock; }));
    pumpNetwork({&server, &alice, &bob}, &world, []() { return false; }); // let everything drain
    assert(world.getBlock(14, 100, 2) == BlockType::Air);

    // A client that never reported a position cannot edit anything.
    bob.sendBlockChange(glm::ivec3(1, 100, 1), BlockType::Glowstone);
    pumpNetwork({&server, &alice, &bob}, &world, []() { return false; });
    assert(world.getBlock(1, 100, 1) == BlockType::Air);

    // Chat is relayed with the server-assigned sender id.
    bob.sendChatMessage("hello alice");
    std::string expected = "<Player " + std::to_string(bob.getLocalPlayerId()) + "> hello alice";
    assert(pumpNetwork({&server, &alice, &bob}, &world, [&]() {
        for (const auto& l : alice.getChatLog())
            if (l == expected)
                return true;
        return false;
    }));

    // --- forgery, replay and unknown senders on the server side ---------------------------------
    const uint16_t port = 40001;
    PlayerPosPacket spoof;
    spoof.playerId = 77; // pretends to be someone else
    auto posAt = [&](float x) {
        spoof.position = glm::vec3(x, 100.0f, 5.0f);
        return NetworkManager::serializePlayerPos(spoof);
    };
    auto findRemote = [&](uint32_t id, glm::vec3& out) {
        for (const auto& rp : server.getRemotePlayers())
            if (rp.playerId == id) {
                out = rp.position;
                return true;
            }
        return false;
    };

    // Data from an address without a session is ignored.
    auto stranger = NetworkManager::wrapEnvelope(0x12345678u, 1, posAt(1.0f));
    server.handleDatagram(stranger.data(), stranger.size(), LOOPBACK, port, &world);
    assert(server.getPeerCount() == 2);

    // A handshake with the wrong protocol version creates no session; the right one does.
    std::vector<uint8_t> oldHello = {static_cast<uint8_t>(PacketType::Handshake), 0};
    auto oldWire = NetworkManager::wrapEnvelope(0, 0, oldHello);
    server.handleDatagram(oldWire.data(), oldWire.size(), LOOPBACK, port, &world);
    assert(server.getPeerCount() == 2);
    std::vector<uint8_t> hello = {static_cast<uint8_t>(PacketType::Handshake), NetworkManager::PROTOCOL_VERSION};
    auto helloWire = NetworkManager::wrapEnvelope(0, 0, hello);
    server.handleDatagram(helloWire.data(), helloWire.size(), LOOPBACK, port, &world);
    assert(server.getPeerCount() == 3);
    uint64_t token = 0;
    assert(server.findPeerToken(LOOPBACK, port, token) && token != 0);
    server.handleDatagram(helloWire.data(), helloWire.size(), LOOPBACK, port, &world); // repeated request: same session
    assert(server.getPeerCount() == 3);
    uint64_t sameToken = 0;
    assert(server.findPeerToken(LOOPBACK, port, sameToken) && sameToken == token);

    // Valid token + newer sequence is accepted; the claimed player id is replaced by the assigned one.
    auto first = NetworkManager::wrapEnvelope(token, 5, posAt(10.0f));
    server.handleDatagram(first.data(), first.size(), LOOPBACK, port, &world);
    glm::vec3 where;
    assert(!findRemote(77, where));
    uint32_t assigned = 0;
    for (const auto& rp : server.getRemotePlayers())
        if (rp.position == glm::vec3(10.0f, 100.0f, 5.0f))
            assigned = rp.playerId;
    assert(assigned != 0 && assigned != 77);

    // Replay of the same datagram and an older sequence are dropped (a later position would show up otherwise).
    auto older = NetworkManager::wrapEnvelope(token, 3, posAt(20.0f));
    server.handleDatagram(first.data(), first.size(), LOOPBACK, port, &world);
    server.handleDatagram(older.data(), older.size(), LOOPBACK, port, &world);
    assert(findRemote(assigned, where) && where.x == 10.0f);

    // Wrong token with a fresh sequence is dropped; the right token is accepted.
    auto wrongToken = NetworkManager::wrapEnvelope(token ^ 0xFFu, 6, posAt(30.0f));
    server.handleDatagram(wrongToken.data(), wrongToken.size(), LOOPBACK, port, &world);
    assert(findRemote(assigned, where) && where.x == 10.0f);
    auto good = NetworkManager::wrapEnvelope(token, 6, posAt(40.0f));
    server.handleDatagram(good.data(), good.size(), LOOPBACK, port, &world);
    assert(findRemote(assigned, where) && where.x == 40.0f);

    // NaN positions inside an authenticated packet are rejected by the payload validation.
    spoof.position = glm::vec3(std::nanf(""), 0, 0);
    auto nanWire = NetworkManager::wrapEnvelope(token, 7, NetworkManager::serializePlayerPos(spoof));
    server.handleDatagram(nanWire.data(), nanWire.size(), LOOPBACK, port, &world);
    assert(findRemote(assigned, where) && where.x == 40.0f);

    // A rejected edit is rolled back on the client: it predicted a block the server refuses.
    {
        ScratchDir aliceDir("net_world_alice");
        World aliceWorld(1, 3, aliceDir.path);
        aliceWorld.setBlock(14, 100, 2, BlockType::Glowstone); // local prediction
        alice.sendBlockChange(glm::ivec3(14, 100, 2), BlockType::Glowstone);
        bool rolledBack = false;
        for (int i = 0; i < 400 && !rolledBack; ++i) {
            server.update(&world);
            alice.update(&aliceWorld);
            bob.update(&world);
            rolledBack = aliceWorld.getBlock(14, 100, 2) == BlockType::Air;
            if (!rolledBack)
                std::this_thread::sleep_for(std::chrono::milliseconds(5));
        }
        assert(rolledBack);
    }

    // Peers are capped.
    for (int i = 0; i < 40; ++i) {
        server.handleDatagram(helloWire.data(), helloWire.size(), LOOPBACK, static_cast<uint16_t>(41000 + i), &world);
    }
    assert(server.getPeerCount() == NetworkManager::MAX_PEERS);
    std::cout << "  -> Authoritative server tests PASSED!" << std::endl;
}

void testAudioMuteAndBoundedQueue() {
    std::cout << "[TEST] 107. Audio requests are muted/bounded instead of spawning threads..." << std::endl;
    AudioManager::setMuted(true);
    for (int i = 0; i < 100; ++i) {
        AudioManager::playSound(SoundEffect::BlockBreak);
        AudioManager::playMaterialFootstep(BlockType::Stone, glm::vec3(0), glm::vec3(0), glm::vec3(0, 0, -1));
    }
    assert(AudioManager::isMuted());
    assert(AudioManager::getPendingSoundCount() == 0);
    assert(!AudioManager::isDeviceRunning()); // muted tests never open the sound card

    // Out of earshot -> never queued even when unmuted.
    AudioManager::setMuted(false);
    AudioManager::playSound3D(SoundEffect::BlockBreak, glm::vec3(500, 0, 0), glm::vec3(0), glm::vec3(0, 0, -1));
    assert(AudioManager::getPendingSoundCount() == 0);
    AudioManager::setMuted(true);
    std::cout << "  -> Audio queue tests PASSED!" << std::endl;
}

void testChunkPositionHashDistribution() {
    std::cout << "[TEST] 108. Chunk position hash spreads neighbouring chunks..." << std::endl;
    ChunkPosHash hasher;
    std::set<size_t> hashes;
    for (int x = -50; x < 50; ++x)
        for (int z = -50; z < 50; ++z)
            hashes.insert(hasher(glm::ivec2(x, z)));
    // 10,000 distinct positions: allow only a handful of collisions.
    assert(hashes.size() > 9990);
    assert(hasher(glm::ivec2(1, 2)) != hasher(glm::ivec2(2, 1)));
    std::cout << "  -> Hash distribution tests PASSED!" << std::endl;
}

void testFluidTickStillSpreadsWater() {
    std::cout << "[TEST] 109. Fluid update keeps working through the world cache..." << std::endl;
    ScratchDir dir("fluids");
    World world(1, 3, dir.path);
    for (int x = 0; x < 16; ++x)
        for (int z = 0; z < 16; ++z) {
            world.setBlock(x, 200, z, BlockType::Stone);
            world.setBlock(x, 201, z, BlockType::Air);
        }
    world.setBlock(5, 201, 5, BlockType::Water);
    world.setBlock(7, 201, 5, BlockType::Water);
    assert(world.getBlock(6, 201, 5) == BlockType::Air);
    FluidEngine::updateFluids(world, glm::vec3(5, 201, 5));
    // An air block on solid ground between two water sources becomes a new (infinite) source.
    assert(world.getBlock(6, 201, 5) == BlockType::Water);
    std::cout << "  -> Fluid tests PASSED!" << std::endl;
}

void testWorldStreamsChunksAsynchronously() {
    std::cout << "[TEST] 110. World::update streams, meshes and unloads chunks on worker threads..." << std::endl;
    ScratchDir dir("streaming");
    World world(3, 11, dir.path);
    // Only the 5x5 spawn area is generated synchronously; the rest has to arrive via the workers.
    assert(world.getLoadedChunkCount() == 25);

    auto settle = [&](const glm::vec3& pos) {
        for (int i = 0; i < 2000; ++i) {
            world.update(pos);
            int pcx = static_cast<int>(std::floor(pos.x)) >> 4;
            int pcz = static_cast<int>(std::floor(pos.z)) >> 4;
            bool complete = true;
            for (int x = pcx - 3; x <= pcx + 3 && complete; ++x)
                for (int z = pcz - 3; z <= pcz + 3; ++z) {
                    Chunk* c = world.getChunk(x, z);
                    if (!c || c->isDirty()) {
                        complete = false;
                        break;
                    }
                }
            if (complete)
                return true;
            std::this_thread::sleep_for(std::chrono::milliseconds(2));
        }
        return false;
    };

    assert(settle(glm::vec3(8.0f, 70.0f, 8.0f)));
    assert(world.getLoadedChunkCount() >= 49);

    // Walk far away: the new area streams in and the old one is released again.
    glm::vec3 distantPos(16.0f * 40, 70.0f, 16.0f * -25);
    assert(settle(distantPos));
    assert(world.getChunk(0, 0) == nullptr);
    assert(world.getChunk(40, -25) != nullptr);
    assert(world.getLoadedChunkCount() <= (2 * (3 + 2) + 1) * (2 * (3 + 2) + 1));

    // Chunks next to each other must have been meshed with their neighbours' borders in the end.
    Chunk* c = world.getChunk(40, -25);
    assert(c && !c->isDirty());
    std::cout << "  -> Asynchronous streaming tests PASSED!" << std::endl;
}

void testWorldShutdownWithTasksInFlight() {
    std::cout << "[TEST] 111. Destroying a World while chunk tasks are still running is safe..." << std::endl;
    ScratchDir dir("shutdown");
    auto pool = std::make_shared<ThreadPool>(3);
    for (int round = 0; round < 15; ++round) {
        World world(4, 100 + round, dir.path, pool);         // pool outlives the world, like DimensionManager's
        world.update(glm::vec3(16.0f * round, 70.0f, 0.0f)); // queues up to 16 generation tasks
        // ~World must wait for them instead of leaving tasks that touch freed memory.
    }
    // The shared pool is still healthy afterwards.
    auto fut = pool->enqueue([]() { return 7; });
    assert(fut.get() == 7);
    std::cout << "  -> World shutdown safety tests PASSED!" << std::endl;
}

void testMobsArePersisted() {
    std::cout << "[TEST] 112. Mobs survive a save/load round trip and old v1 saves still load..." << std::endl;
    ScratchDir dir("mob_save");

    MobEngine mobs;
    mobs.spawnMob(MobType::Pig, glm::vec3(1.0f, 70.0f, 2.0f));
    mobs.spawnMob(MobType::Wither, glm::vec3(-9.5f, 90.0f, 4.25f));
    assert(mobs.getMobs().size() == 2);

    GameSaveData d;
    d.seed = 5;
    d.inventory.assign(36, ItemStack{});
    for (const Mob& m : mobs.getMobs()) {
        SavedMob sm;
        sm.type = static_cast<uint8_t>(m.type);
        sm.position = m.position;
        sm.health = m.health - 1.0f;
        sm.maxHealth = m.maxHealth;
        sm.yaw = 33.0f;
        sm.age = -12.5f;
        sm.saddled = (m.type == MobType::Pig);
        d.mobs.push_back(sm);
    }
    assert(GameSave::write(d, dir.path));

    GameSaveData r;
    assert(GameSave::read(r, dir.path));
    assert(r.mobs.size() == 2);

    MobEngine loaded;
    for (const SavedMob& sm : r.mobs) {
        assert(loaded.restoreMob(static_cast<MobType>(sm.type), sm.position, sm.health, sm.maxHealth, sm.yaw, sm.age,
                                 sm.saddled));
    }
    assert(loaded.getMobs().size() == 2);
    assert(loaded.getMobs()[0].type == MobType::Pig && loaded.getMobs()[0].isSaddled);
    assert(loaded.getMobs()[0].health == 9.0f && loaded.getMobs()[0].age == -12.5f && loaded.getMobs()[0].yaw == 33.0f);
    assert(loaded.getMobs()[1].type == MobType::Wither &&
           loaded.getMobs()[1].position == glm::vec3(-9.5f, 90.0f, 4.25f));

    // Bad data from a damaged save is refused instead of creating broken mobs.
    MobEngine strict;
    assert(!strict.restoreMob(static_cast<MobType>(99), glm::vec3(0), 5, 10, 0, 0, false));
    assert(!strict.restoreMob(MobType::Cow, glm::vec3(std::nanf(""), 0, 0), 5, 10, 0, 0, false));
    assert(!strict.restoreMob(MobType::Cow, glm::vec3(0), -1.0f, 10, 0, 0, false));
    assert(!strict.restoreMob(MobType::Cow, glm::vec3(0), 50.0f, 10, 0, 0, false));
    assert(strict.getMobs().empty());

    // A version-1 file (no mob section) must still be accepted.
    GameSaveData noMobs;
    noMobs.inventory.assign(36, ItemStack{});
    ScratchDir v1("mob_save_v1");
    assert(GameSave::write(noMobs, v1.path));
    std::string path = GameSave::filePath(v1.path);
    auto size = std::filesystem::file_size(path);
    std::filesystem::resize_file(path, size - sizeof(uint32_t));
    {
        std::fstream f(path, std::ios::in | std::ios::out | std::ios::binary);
        f.seekp(4);
        uint32_t one = 1;
        f.write(reinterpret_cast<const char*>(&one), sizeof(one));
    }
    GameSaveData old;
    assert(GameSave::read(old, v1.path));
    assert(old.mobs.empty());

    // Unknown future versions are rejected.
    {
        std::fstream f(path, std::ios::in | std::ios::out | std::ios::binary);
        f.seekp(4);
        uint32_t future = 99;
        f.write(reinterpret_cast<const char*>(&future), sizeof(future));
    }
    assert(!GameSave::read(old, v1.path));
    std::cout << "  -> Mob persistence tests PASSED!" << std::endl;
}

namespace {

void buildPlatform(World& world, int y, int half) {
    for (int x = -half; x <= half; ++x)
        for (int z = -half; z <= half; ++z) {
            world.setBlock(x, y, z, BlockType::Stone);
            for (int h = 1; h <= 8; ++h)
                world.setBlock(x, y + h, z, BlockType::Air);
        }
}

} // namespace

void testWaterFlowsWithLevelsAndDrains() {
    std::cout << "[TEST] 113. Water spreads a limited distance, falls, and drains without a source..." << std::endl;
    ScratchDir dir("fluid_levels");
    World world(1, 4, dir.path);
    buildPlatform(world, 200, 12);
    const glm::vec3 pos(0, 201, 0);

    world.setBlock(0, 201, 0, BlockType::Water);
    for (int i = 0; i < 40; ++i)
        FluidEngine::updateFluids(world, pos);

    // Level grows by one per block and stops after 6 (no endless flooding).
    assert(world.getBlock(0, 201, 0) == BlockType::Water);
    assert(BlockData::fluidLevel(world.getBlock(1, 201, 0)) == 1);
    assert(BlockData::fluidLevel(world.getBlock(0, 201, -3)) == 3);
    assert(BlockData::fluidLevel(world.getBlock(6, 201, 0)) == 6);
    assert(world.getBlock(7, 201, 0) == BlockType::Air);
    assert(BlockData::isWater(world.getBlock(3, 201, 3))); // Manhattan distance 6
    assert(world.getBlock(4, 201, 3) == BlockType::Air);   // distance 7
    // Lower levels render lower.
    assert(FluidEngine::getFluidHeight(world, 5, 201, 0) < FluidEngine::getFluidHeight(world, 1, 201, 0));

    // Remove the source: the flowing water dries up completely.
    world.setBlock(0, 201, 0, BlockType::Air);
    for (int i = 0; i < 40; ++i)
        FluidEngine::updateFluids(world, pos);
    for (int x = -8; x <= 8; ++x)
        for (int z = -8; z <= 8; ++z)
            assert(world.getBlock(x, 201, z) == BlockType::Air);

    // A source above a hole makes a waterfall that spreads again on the floor below.
    buildPlatform(world, 190, 12);
    world.setBlock(0, 200, 0, BlockType::Air); // hole in the upper platform
    world.setBlock(0, 201, 0, BlockType::Water);
    for (int i = 0; i < 60; ++i)
        FluidEngine::updateFluids(world, glm::vec3(0, 195, 0));
    assert(BlockData::isWater(world.getBlock(0, 200, 0)));
    assert(BlockData::isWater(world.getBlock(0, 195, 0)));
    assert(BlockData::isWater(world.getBlock(0, 191, 0)));
    assert(BlockData::isWater(world.getBlock(3, 191, 0))); // spread on the lower floor
    assert(world.getBlock(8, 191, 0) == BlockType::Air);
    std::cout << "  -> Water level tests PASSED!" << std::endl;
}

void testLavaFlowsSlowerAndShorter() {
    std::cout << "[TEST] 114. Lava creeps a shorter distance than water and cools into stone/obsidian..." << std::endl;
    ScratchDir dir("fluid_lava");
    World world(1, 4, dir.path);
    buildPlatform(world, 200, 12);
    const glm::vec3 pos(0, 201, 0);

    world.setBlock(0, 201, 0, BlockType::Lava);
    FluidEngine::resetTimers();
    FluidEngine::updateFluids(world, pos); // tick 0: lava acts
    assert(BlockData::fluidLevel(world.getBlock(1, 201, 0)) == 1);
    FluidEngine::updateFluids(world, pos); // ticks 1-5: lava waits
    assert(world.getBlock(2, 201, 0) == BlockType::Air);

    for (int i = 0; i < 6 * 10; ++i)
        FluidEngine::updateFluids(world, pos);
    assert(BlockData::isLava(world.getBlock(3, 201, 0)));
    assert(world.getBlock(4, 201, 0) == BlockType::Air);

    // Water poured next to lava: source lava -> obsidian, flowing lava -> stone.
    world.setBlock(0, 202, 0, BlockType::Water); // above the lava source
    for (int i = 0; i < 12; ++i)
        FluidEngine::updateFluids(world, pos);
    assert(world.getBlock(0, 201, 0) == BlockType::Obsidian);
    bool anyStone = false;
    for (int x = 1; x <= 3; ++x)
        if (world.getBlock(x, 201, 0) == BlockType::Stone)
            anyStone = true;
    assert(anyStone);
    std::cout << "  -> Lava flow tests PASSED!" << std::endl;
}

void testFluidBlockHelpers() {
    std::cout << "[TEST] 115. Fluid block helpers, textures and network validation cover flowing blocks..."
              << std::endl;
    for (int level = 0; level <= 6; ++level) {
        BlockType w = BlockData::flowingWater(level);
        assert(BlockData::isWater(w) && !BlockData::isLava(w));
        assert(BlockData::fluidLevel(w) == level);
        assert(!BlockData::isOpaque(w) && !BlockData::isSolid(w));
        assert(BlockData::getTextureUV(w, TOP) == BlockData::getTextureUV(BlockType::Water, TOP));
    }
    for (int level = 0; level <= 3; ++level) {
        BlockType l = BlockData::flowingLava(level);
        assert(BlockData::isLava(l) && BlockData::fluidLevel(l) == level);
        assert(BlockData::getTextureUV(l, TOP) == BlockData::getTextureUV(BlockType::Lava, TOP));
    }
    assert(BlockData::fluidLevel(BlockType::Stone) == -1);
    assert(BlockData::flowingWater(99) == BlockType::FlowingWater6);
    assert(PhysicsEngine::isPointInWater(*std::make_unique<World>(1).get(), glm::vec3(0, 0, 0)) == false);

    // Every enumerator up to LAST_TYPE is accepted over the network, the next value is not.
    assert(NetworkManager::isValidBlockType(static_cast<uint8_t>(BlockData::LAST_TYPE)));
    assert(!NetworkManager::isValidBlockType(static_cast<uint8_t>(BlockData::LAST_TYPE) + 1));
    std::cout << "  -> Fluid helper tests PASSED!" << std::endl;
}

#include "../src/core/NetworkCommands.hpp"

void testNetworkConsoleCommands() {
    std::cout << "[TEST] 118. /host, /connect, /disconnect and /netstatus console commands..." << std::endl;
    NetworkManager host, guest;

    auto r = NetworkCommands::run("/gamemode creative", host);
    assert(!r.handled); // other commands fall through to the normal command parser
    assert(!NetworkCommands::run("hello", host).handled);

    r = NetworkCommands::run("/netstatus", host);
    assert(r.handled && r.message == "Offline");

    r = NetworkCommands::run("/host 80", host); // privileged / invalid port
    assert(r.handled && !r.success && r.message.find("Usage") != std::string::npos);
    r = NetworkCommands::run("/host banana", host);
    assert(r.handled && !r.success);
    assert(!host.isConnected());

    r = NetworkCommands::run("/host 25613", host);
    assert(r.handled && r.success && host.isServer());
    r = NetworkCommands::run("/netstatus", host);
    assert(r.message.find("Hosting") != std::string::npos);

    r = NetworkCommands::run("/connect", guest);
    assert(r.handled && !r.success);
    r = NetworkCommands::run("/connect 127.0.0.1 99999", guest);
    assert(r.handled && !r.success && !guest.isConnected());
    r = NetworkCommands::run("/connect 999.1.1.1", guest);
    assert(r.handled && !r.success && !guest.isConnected());
    r = NetworkCommands::run("/connect 127.0.0.1 25613", guest);
    assert(r.handled && r.success && guest.isConnected());
    assert(pumpNetwork({&host, &guest}, nullptr, [&]() { return guest.isHandshaken(); }));
    r = NetworkCommands::run("/netstatus", guest);
    assert(r.message.find("Connected as player") != std::string::npos);
    r = NetworkCommands::run("/netstatus", host);
    assert(r.message.find("1 client") != std::string::npos);

    r = NetworkCommands::run("/disconnect", guest);
    assert(r.handled && r.success && !guest.isConnected());
    r = NetworkCommands::run("/disconnect", guest);
    assert(r.handled && !r.success);
    std::cout << "  -> Network console command tests PASSED!" << std::endl;
}

#include "../src/audio/SoundSynth.hpp"

void testSoundSynthesis() {
    std::cout << "[TEST] 119. Procedural sound synthesis: every effect renders audible, clean samples..." << std::endl;
    auto stats = [](const std::vector<float>& s, float& peak, float& zcr) {
        peak = 0.0f;
        int crossings = 0;
        for (size_t i = 0; i < s.size(); ++i) {
            assert(std::isfinite(s[i]));
            peak = std::max(peak, std::fabs(s[i]));
            if (i > 0 && (s[i] >= 0.0f) != (s[i - 1] >= 0.0f))
                ++crossings;
        }
        zcr = s.empty() ? 0.0f : static_cast<float>(crossings) / static_cast<float>(s.size());
    };

    for (int e = 0; e <= static_cast<int>(SoundEffect::ToolBreak); ++e) {
        auto effect = static_cast<SoundEffect>(e);
        auto s = SoundSynth::synthesize(effect, 0);
        float peak, zcr;
        stats(s, peak, zcr);
        assert(!s.empty());
        double seconds = static_cast<double>(s.size()) / SoundSynth::SAMPLE_RATE;
        assert(seconds > 0.05 && seconds < 1.5);
        assert(peak > 0.05f && peak <= 0.9001f);
        assert(SoundSynth::synthesize(effect, 0) == s); // deterministic
        assert(SoundSynth::synthesize(effect, 2) != s); // variations differ
        assert(std::fabs(s.back()) < 0.05f);            // ends faded out, no click
    }

    // Materials sound different: a stone step is brighter (more zero crossings) than a sand step.
    float stonePeak, stoneZcr, sandPeak, sandZcr;
    stats(SoundSynth::synthesizeFootstep(BlockType::Stone, 1), stonePeak, stoneZcr);
    stats(SoundSynth::synthesizeFootstep(BlockType::Sand, 1), sandPeak, sandZcr);
    assert(stoneZcr > sandZcr * 1.5f);
    assert(SoundSynth::synthesizeFootstep(BlockType::Grass, 0) != SoundSynth::synthesizeFootstep(BlockType::Planks, 0));
    assert(!SoundSynth::synthesizeFootstep(BlockType::Water, 0).empty());
    assert(!SoundSynth::synthesizeFootstep(BlockType::DiamondOre, 0).empty()); // unknown material -> default step
    std::cout << "  -> Sound synthesis tests PASSED!" << std::endl;
}

void testSoundMixerAndSpatialAudio() {
    std::cout << "[TEST] 120. Mixer: voices, stereo panning, voice cap and draining (headless)..." << std::endl;
    AudioManager::shutdown();
    AudioManager::setHeadless(true);
    AudioManager::setMuted(false);
    assert(AudioManager::getPendingSoundCount() == 0);

    const glm::vec3 listener(0, 64, 0);
    const glm::vec3 front(0, 0, -1); // looking towards -z, so +x is to the right
    std::vector<float> buffer(512 * 2);

    auto energy = [&](float& left, float& right) {
        left = right = 0.0f;
        for (size_t i = 0; i < buffer.size(); i += 2) {
            left += buffer[i] * buffer[i];
            right += buffer[i + 1] * buffer[i + 1];
        }
    };
    auto drain = [&]() {
        for (int i = 0; i < 400 && AudioManager::getPendingSoundCount() > 0; ++i)
            AudioManager::mixInto(buffer.data(), 512);
    };

    // A sound on the right ends up (mostly) in the right channel, one on the left in the left channel.
    AudioManager::playSound3D(SoundEffect::BlockBreak, glm::vec3(5, 64, 0), listener, front);
    assert(AudioManager::getPendingSoundCount() == 1);
    AudioManager::mixInto(buffer.data(), 512);
    float l, r;
    energy(l, r);
    assert(r > l * 4.0f && r > 0.0f);
    drain();
    AudioManager::playSound3D(SoundEffect::BlockBreak, glm::vec3(-5, 64, 0), listener, front);
    AudioManager::mixInto(buffer.data(), 512);
    energy(l, r);
    assert(l > r * 4.0f && l > 0.0f);
    drain();

    // Nearer = louder; out of range = silent (not even queued).
    AudioManager::playSound3D(SoundEffect::Jump, glm::vec3(30, 64, 0), listener, front);
    AudioManager::mixInto(buffer.data(), 256);
    float farEnergy = 0.0f;
    for (float v : buffer)
        farEnergy += v * v;
    drain();
    AudioManager::playSound3D(SoundEffect::Jump, glm::vec3(2, 64, 0), listener, front);
    AudioManager::mixInto(buffer.data(), 256);
    float nearEnergy = 0.0f;
    for (float v : buffer)
        nearEnergy += v * v;
    drain();
    assert(nearEnergy > farEnergy * 2.0f);
    AudioManager::playSound3D(SoundEffect::Jump, glm::vec3(500, 64, 0), listener, front);
    assert(AudioManager::getPendingSoundCount() == 0);

    // Footsteps are mixed too; the voice count is capped and everything drains by itself.
    AudioManager::playMaterialFootstep(BlockType::Stone, listener, listener, front);
    assert(AudioManager::getPendingSoundCount() == 1);
    for (int i = 0; i < 100; ++i)
        AudioManager::playSound(SoundEffect::Explosion);
    assert(AudioManager::getPendingSoundCount() <= SoundMixer::MAX_VOICES);
    drain();
    assert(AudioManager::getPendingSoundCount() == 0);

    // Many loud voices at once never exceed full scale (soft clipping).
    for (int i = 0; i < 16; ++i)
        AudioManager::playSound(SoundEffect::Explosion);
    AudioManager::mixInto(buffer.data(), 512);
    for (float v : buffer)
        assert(std::fabs(v) <= 1.0f);

    // Muted = nothing is accepted.
    AudioManager::shutdown();
    AudioManager::setMuted(true);
    AudioManager::playSound(SoundEffect::LevelUp);
    assert(AudioManager::getPendingSoundCount() == 0);
    AudioManager::setHeadless(false);
    std::cout << "  -> Mixer & spatial audio tests PASSED!" << std::endl;
}

void testSectionMeshingMatchesFullMesh() {
    std::cout << "[TEST] 121. Per-section meshing equals whole-chunk meshing and re-meshes only touched sections..."
              << std::endl;
    ScratchDir dir("sections");

    // Real terrain with caves and trees: the 16 section meshes together must be the full mesh.
    Chunk chunk(3, -2, 21, dir.path);
    MeshInput input(3, -2);
    input.copyChunk(chunk, 0, 0);
    MeshData full = ChunkMesh::buildMeshData(input);
    assert(full.vertices.size() > 1000);

    MeshData joined;
    for (int sy = 0; sy < SECTIONS_PER_CHUNK; ++sy)
        joined.append(ChunkMesh::buildMeshData(input, sy, sy + 1));
    assert(joined.vertices.size() == full.vertices.size());
    assert(joined.indices.size() == full.indices.size());
    assert(joined.transVertices.size() == full.transVertices.size());

    auto key = [](const Vertex& v) {
        return std::make_tuple(v.position.x, v.position.y, v.position.z, v.normal.x, v.normal.y, v.normal.z,
                               v.texCoord.x, v.texCoord.y, v.light, v.ao);
    };
    auto sorted = [&](std::vector<Vertex> v) {
        std::sort(v.begin(), v.end(), [&](const Vertex& a, const Vertex& b) { return key(a) < key(b); });
        return v;
    };
    auto a = sorted(full.vertices), b = sorted(joined.vertices);
    for (size_t i = 0; i < a.size(); ++i)
        assert(key(a[i]) == key(b[i]));

    // Geometry of one section only lies inside its height range.
    MeshData slab = ChunkMesh::buildMeshData(input, 4, 5);
    for (const Vertex& v : slab.vertices)
        assert(v.position.y >= 64.0f && v.position.y <= 80.0f);
    // An out-of-range request is clamped instead of crashing.
    assert(ChunkMesh::buildMeshData(input, 12, 40).vertices.size() ==
           ChunkMesh::buildMeshData(input, 12, 16).vertices.size());
    assert(ChunkMesh::buildMeshData(input, 5, 5).vertices.empty());

    // Dirty masks: an edit marks its own section, boundary edits also the neighbour section.
    assert(Chunk::sectionMaskForY(40) == (1u << 2));
    assert(Chunk::sectionMaskForY(32) == ((1u << 2) | (1u << 1)));
    assert(Chunk::sectionMaskForY(47) == ((1u << 2) | (1u << 3)));
    assert(Chunk::sectionMaskForY(0) == 1u);
    assert(Chunk::sectionMaskForY(255) == (1u << 15));
    assert(Chunk::sectionMaskForY(-1) == 0 && Chunk::sectionMaskForY(256) == 0);

    // World level: after settling, an edit rebuilds exactly the touched section(s).
    // (Glass is used: opaque blocks also change the light of the whole column, see testEditsRelightTheChunk.)
    World world(1, 8, dir.path + "/world");
    glm::vec3 pos(8, 70, 8);
    world.remeshDirtyChunks(pos, 100000.0);
    Chunk* c = world.getChunk(0, 0);
    assert(c && !c->isDirty() && c->usesSectionMeshes() && c->getDirtySections() == 0);
    size_t before = c->getSectionRebuildCount();

    world.setBlock(5, 100, 5, BlockType::Glass); // y=100 -> section 6, interior of the chunk
    assert(c->getDirtySections() == (1u << 6));
    world.remeshDirtyChunks(pos, 100000.0);
    assert(c->getSectionRebuildCount() - before == 1);
    assert(!c->isDirty());

    world.setBlock(6, 96, 6, BlockType::Glass); // y=96 is the bottom layer of section 6 -> also section 5
    assert(c->getDirtySections() == ((1u << 6) | (1u << 5)));
    before = c->getSectionRebuildCount();
    world.remeshDirtyChunks(pos, 100000.0);
    assert(c->getSectionRebuildCount() - before == 2);

    // An edit on the east border dirties only the matching section of the east neighbour.
    Chunk* east = world.getChunk(1, 0);
    assert(east && !east->isDirty());
    world.setBlock(15, 70, 3, BlockType::Glass); // y=70 -> section 4
    assert(east->getDirtySections() == (1u << 4));
    // A corner edit also reaches the diagonal chunk.
    world.remeshDirtyChunks(pos, 100000.0);
    world.setBlock(15, 70, 15, BlockType::Glass);
    Chunk* diagonal = world.getChunk(1, 1);
    assert(diagonal && diagonal->getDirtySections() == (1u << 4));
    assert(world.getChunk(1, 0)->getDirtySections() == (1u << 4));
    assert(world.getChunk(0, 1)->getDirtySections() == (1u << 4));
    std::cout << "  -> Section meshing tests PASSED!" << std::endl;
}

void testAudioDeviceSmoke() {
    std::cout << "[TEST] 122. Opening the real audio device either works or fails gracefully..." << std::endl;
    AudioManager::shutdown();
    AudioManager::setHeadless(false);
    AudioManager::setMuted(false);
    float oldVolume = AudioManager::getMasterVolume();
    AudioManager::setMasterVolume(0.05f); // keep it quiet if a sound card exists

    AudioManager::playSound(SoundEffect::BlockPlace); // lazily opens the device
    bool running = AudioManager::isDeviceRunning();
    if (running) {
        std::this_thread::sleep_for(std::chrono::milliseconds(150)); // the audio thread consumes the sound
        assert(AudioManager::getPendingSoundCount() <= 1);
    } else {
        assert(AudioManager::getPendingSoundCount() == 0); // no device: sounds are dropped, never stuck in the mixer
    }
    std::cout << "  (audio device " << (running ? "available" : "not available") << ")" << std::endl;

    AudioManager::shutdown();
    assert(!AudioManager::isDeviceRunning());
    AudioManager::setMasterVolume(oldVolume);
    AudioManager::setMuted(true);
    std::cout << "  -> Audio device smoke tests PASSED!" << std::endl;
}

void testSectionedStorageSavesMemory() {
    std::cout << "[TEST] 123. Chunk storage: uniform sections cost nothing, dense ones behave like a flat array..."
              << std::endl;
    SectionedBytes bytes(7);
    assert(bytes.allocatedBytes() == 0);
    assert(bytes.get(3, 100, 9) == 7);

    bytes.set(3, 100, 9, 7); // writing the existing value allocates nothing
    assert(bytes.allocatedBytes() == 0);
    bytes.set(3, 100, 9, 9);
    assert(bytes.allocatedBytes() == SectionedBytes::SECTION_VOLUME);
    assert(bytes.get(3, 100, 9) == 9);
    assert(bytes.get(4, 100, 9) == 7); // the rest of the section keeps the old uniform value
    assert(bytes.get(3, 99, 9) == 7 && bytes.get(3, 101, 9) == 7);
    assert(!bytes.isSectionUniform(100 >> 4) && bytes.isSectionUniform(0));

    bytes.set(3, 100, 9, 7);
    bytes.compact(); // all equal again -> uniform
    assert(bytes.allocatedBytes() == 0 && bytes.get(3, 100, 9) == 7);

    // Corners of the volume and a section boundary.
    bytes.set(0, 0, 0, 1);
    bytes.set(15, 255, 15, 2);
    bytes.set(8, 15, 8, 3);
    bytes.set(8, 16, 8, 4);
    assert(bytes.get(0, 0, 0) == 1 && bytes.get(15, 255, 15) == 2 && bytes.get(8, 15, 8) == 3 &&
           bytes.get(8, 16, 8) == 4);
    std::vector<uint8_t> flat(SectionedBytes::TOTAL_VOLUME);
    bytes.exportTo(flat.data());
    assert(flat[(0 * 256 + 0) * 16 + 0] == 1);
    assert(flat[(15 * 256 + 255) * 16 + 15] == 2);
    assert(flat[(8 * 256 + 15) * 16 + 8] == 3);
    assert(flat[(8 * 256 + 16) * 16 + 8] == 4);
    assert(flat[(1 * 256 + 1) * 16 + 1] == 7);
    bytes.fill(0);
    assert(bytes.allocatedBytes() == 0 && bytes.get(0, 0, 0) == 0);

    // A real chunk: much less than the 131072 bytes of two flat arrays, and nothing changes semantically.
    ScratchDir dir("storage");
    Chunk terrain(2, 2, 13, dir.path);
    assert(terrain.getStorageBytes() < 131072 * 7 / 10);
    Chunk reference(2, 2, 13, dir.path);
    for (int x = 0; x < 16; x += 3)
        for (int y = 0; y < 256; y += 7)
            for (int z = 0; z < 16; z += 5) {
                assert(terrain.getBlock(x, y, z) == reference.getBlock(x, y, z));
                assert(terrain.getRawLight(x, y, z) == reference.getRawLight(x, y, z));
            }

    Chunk empty(40, 40, 13, dir.path);
    for (int x = 0; x < 16; ++x)
        for (int y = 0; y < 256; ++y)
            for (int z = 0; z < 16; ++z)
                empty.setBlock(x, y, z, BlockType::Air);
    empty.compactStorage();
    assert(empty.getBlock(5, 5, 5) == BlockType::Air);
    assert(empty.getStorageBytes() <= SectionedBytes::SECTION_VOLUME * 16); // light only; no block bytes left

    // Round trip through the region file keeps every block and light value of a dense chunk.
    terrain.setBlock(1, 1, 1, BlockType::EmeraldBlock);
    assert(terrain.saveIfNeeded());
    RegionManager::getInstance().clearCache();
    Chunk loaded(2, 2, 13, dir.path);
    assert(loaded.getBlock(1, 1, 1) == BlockType::EmeraldBlock);
    for (int x = 0; x < 16; ++x)
        for (int y = 0; y < 256; y += 11)
            for (int z = 0; z < 16; ++z) {
                assert(loaded.getBlock(x, y, z) == terrain.getBlock(x, y, z));
                assert(loaded.getRawLight(x, y, z) == terrain.getRawLight(x, y, z));
            }
    std::cout << "  -> Sectioned storage tests PASSED!" << std::endl;
}

#include "../src/world/SectionVisibility.hpp"

void testSectionConnectivity() {
    std::cout << "[TEST] 124. Section face connectivity for open, solid and tunnelled cubes..." << std::endl;
    using SV = SectionVisibility;
    auto compute = [](auto isOpen) { return SV::computeConnectivity(isOpen); };

    assert(compute([](int, int, int) { return true; }) == SV::ALL_CONNECTED); // empty cube
    assert(compute([](int, int, int) { return false; }) == 0);                // solid cube

    // Straight tunnel along x (west <-> east) through the middle.
    uint16_t tunnel = compute([](int, int y, int z) { return y == 8 && z == 8; });
    assert(SV::connects(tunnel, SV::WEST, SV::EAST));
    assert(!SV::connects(tunnel, SV::WEST, SV::UP) && !SV::connects(tunnel, SV::NORTH, SV::SOUTH));
    assert(tunnel == (1u << SV::pairBit(SV::WEST, SV::EAST)));

    // L-shaped tunnel: west -> middle -> up.
    uint16_t bend = compute([](int x, int y, int z) { return z == 8 && ((y == 8 && x <= 8) || (x == 8 && y >= 8)); });
    assert(SV::connects(bend, SV::WEST, SV::UP));
    assert(!SV::connects(bend, SV::WEST, SV::EAST) && !SV::connects(bend, SV::DOWN, SV::UP));

    // Two separate tunnels: they connect their own faces only.
    uint16_t two = compute([](int x, int y, int z) { return (y == 2 && z == 2) || (x == 13 && z == 13); });
    assert(SV::connects(two, SV::WEST, SV::EAST) && SV::connects(two, SV::DOWN, SV::UP));
    assert(!SV::connects(two, SV::WEST, SV::UP) && !SV::connects(two, SV::EAST, SV::DOWN));

    // A cave that touches a single face connects nothing; a blocked-off middle layer splits up from down.
    assert(compute([](int x, int y, int z) { return y == 0 && x == 8 && z == 8; }) == 0);
    uint16_t floorWall = compute([](int, int y, int) { return y != 8; });
    assert(SV::connects(floorWall, SV::WEST, SV::EAST) && !SV::connects(floorWall, SV::DOWN, SV::UP));

    // pairBit enumerates the 15 pairs exactly once.
    std::set<int> bits;
    for (int a = 0; a < 6; ++a) {
        for (int b = a + 1; b < 6; ++b) {
            bits.insert(SV::pairBit(a, b));
            assert(SV::pairBit(a, b) == SV::pairBit(b, a));
        }
    }
    assert(bits.size() == 15 && *bits.begin() == 0 && *bits.rbegin() == 14);
    assert(SV::opposite(SV::UP) == SV::DOWN && SV::opposite(SV::WEST) == SV::EAST &&
           SV::opposite(SV::NORTH) == SV::SOUTH);
    std::cout << "  -> Section connectivity tests PASSED!" << std::endl;
}

void testOcclusionCullingScenario() {
    std::cout << "[TEST] 125. Occlusion culling shows tunnelled-to sections and hides sealed ones..." << std::endl;
    ScratchDir dir("occlusion");
    World world(1, 2, dir.path);

    // A solid slab of sections 12..13 (y 192..223) over 3x3 chunks, then carve rooms in it.
    for (int x = -16; x < 32; ++x)
        for (int z = -16; z < 32; ++z)
            for (int y = 192; y < 224; ++y)
                world.setBlock(x, y, z, BlockType::Stone);
    auto carve = [&](int x0, int x1, int y0, int y1, int z0, int z1) {
        for (int x = x0; x <= x1; ++x)
            for (int y = y0; y <= y1; ++y)
                for (int z = z0; z <= z1; ++z)
                    world.setBlock(x, y, z, BlockType::Air);
    };
    carve(2, 13, 194, 205, 2, 13);   // camera room, chunk (0,0), section 12
    carve(14, 17, 199, 200, 7, 8);   // tunnel east, crossing into chunk (1,0)
    carve(18, 29, 194, 205, 2, 13);  // room in chunk (1,0), section 12
    carve(2, 13, 194, 205, 18, 29);  // sealed room in chunk (0,1)
    carve(-14, -3, 194, 205, 2, 13); // sealed room in chunk (-1,0)
    carve(22, 23, 206, 215, 7, 8);   // shaft up from the east room into section 13
    carve(18, 29, 210, 218, 2, 13);  // room above, chunk (1,0), section 13 (y 208..223)
    world.remeshDirtyChunks(glm::vec3(8, 200, 8), 100000.0);

    glm::vec3 camera(7.5f, 200.0f, 7.5f);
    world.updateVisibility(camera, nullptr);
    assert(world.getVisibleSectionCount() > 0);
    assert(world.isSectionVisible(0, 12, 0));   // where the camera is
    assert(world.isSectionVisible(1, 12, 0));   // through the tunnel
    assert(world.isSectionVisible(1, 13, 0));   // and up the shaft
    assert(!world.isSectionVisible(0, 12, 1));  // sealed room next door
    assert(!world.isSectionVisible(-1, 12, 0)); // sealed room on the other side
    assert(!world.isSectionVisible(0, 8, 0));   // rock below

    // Opening a hole into the sealed room makes it visible again; sealing the tunnel hides the east.
    carve(7, 8, 199, 200, 14, 17); // from the camera room into chunk (0,1)
    world.remeshDirtyChunks(glm::vec3(8, 200, 8), 100000.0);
    world.updateVisibility(camera, nullptr);
    assert(world.isSectionVisible(0, 12, 1));
    for (int y = 199; y <= 200; ++y)
        for (int z = 7; z <= 8; ++z)
            world.setBlock(15, y, z, BlockType::Stone);
    world.remeshDirtyChunks(glm::vec3(8, 200, 8), 100000.0);
    world.updateVisibility(camera, nullptr);
    assert(!world.isSectionVisible(1, 12, 0));
    assert(!world.isSectionVisible(1, 13, 0));

    // Switching it off (or never computing) means: everything counts as visible.
    world.setOcclusionCulling(false);
    assert(world.isSectionVisible(1, 13, 0) && world.isSectionVisible(-1, 3, 1));
    world.updateVisibility(camera, nullptr);
    assert(world.getVisibleSectionCount() == 0);
    world.setOcclusionCulling(true);
    world.updateVisibility(camera, nullptr);
    world.render(nullptr); // headless render with visibility data must not crash
    world.renderTransparent(nullptr, &camera);
    std::cout << "  -> Occlusion culling scenario tests PASSED!" << std::endl;
}

void testOcclusionCullingNeverHidesVisibleTerrain() {
    std::cout << "[TEST] 126. Soundness: every section a ray can reach is inside the visible set..." << std::endl;
    ScratchDir dir("occlusion_rays");
    World world(3, 77, dir.path);
    for (int i = 0; i < 400 && world.getLoadedChunkCount() < 49; ++i) {
        world.update(glm::vec3(8, 70, 8));
        std::this_thread::sleep_for(std::chrono::milliseconds(2));
    }
    world.remeshDirtyChunks(glm::vec3(8, 70, 8), 100000.0);
    assert(world.getLoadedChunkCount() >= 49);

    // Camera positions: on the surface, and inside the first cave pocket we can find.
    std::vector<glm::vec3> cameras;
    {
        int topY = 0;
        world.getTopBlock(8, 8, topY);
        cameras.push_back(glm::vec3(8.5f, static_cast<float>(topY) + 2.5f, 8.5f));
        bool found = false;
        for (int y = 12; y < 60 && !found; ++y)
            for (int x = -20; x < 36 && !found; ++x)
                for (int z = -20; z < 36 && !found; ++z)
                    if (world.getBlock(x, y, z) == BlockType::Air && world.getBlock(x, y + 1, z) == BlockType::Air &&
                        world.getBlock(x, y - 1, z) != BlockType::Air) {
                        cameras.push_back(glm::vec3(x + 0.5f, y + 1.0f, z + 0.5f));
                        found = true;
                    }
        assert(found);
    }

    uint32_t rng = 12345;
    auto nextf = [&]() {
        rng = rng * 1664525u + 1013904223u;
        return (static_cast<float>(rng >> 8) / 8388608.0f) - 1.0f;
    };
    size_t checkedSections = 0;
    for (const glm::vec3& cam : cameras) {
        world.updateVisibility(cam, nullptr);
        assert(world.getVisibleSectionCount() > 0);
        for (int ray = 0; ray < 1500; ++ray) {
            glm::vec3 dir(nextf(), nextf(), nextf());
            if (glm::length(dir) < 0.1f)
                continue;
            dir = glm::normalize(dir);
            // Amanatides & Woo voxel traversal: visits face-adjacent cells only, like a real line of sight.
            int bx = static_cast<int>(std::floor(cam.x)), by = static_cast<int>(std::floor(cam.y)),
                bz = static_cast<int>(std::floor(cam.z));
            const int stepX = dir.x > 0 ? 1 : -1, stepY = dir.y > 0 ? 1 : -1, stepZ = dir.z > 0 ? 1 : -1;
            auto firstBoundary = [](float origin, int cell, int step, float d) {
                if (std::fabs(d) < 1e-8f)
                    return 1e30f;
                float edge = static_cast<float>(step > 0 ? cell + 1 : cell);
                return (edge - origin) / d;
            };
            float tMaxX = firstBoundary(cam.x, bx, stepX, dir.x), tMaxY = firstBoundary(cam.y, by, stepY, dir.y),
                  tMaxZ = firstBoundary(cam.z, bz, stepZ, dir.z);
            const float tDeltaX = std::fabs(dir.x) < 1e-8f ? 1e30f : std::fabs(1.0f / dir.x);
            const float tDeltaY = std::fabs(dir.y) < 1e-8f ? 1e30f : std::fabs(1.0f / dir.y);
            const float tDeltaZ = std::fabs(dir.z) < 1e-8f ? 1e30f : std::fabs(1.0f / dir.z);
            for (int steps = 0; steps < 300; ++steps) {
                if (by < 0 || by >= 256)
                    break;
                if (!world.getChunk(bx >> 4, bz >> 4))
                    break;
                // The cell the ray is in (open air or the opaque block it hits) must belong to a visible section.
                if (!world.isSectionVisible(bx >> 4, by >> 4, bz >> 4)) {
                    std::cout << "  cam=(" << cam.x << "," << cam.y << "," << cam.z << ") cell=(" << bx << "," << by
                              << "," << bz << ") section=(" << (bx >> 4) << "," << (by >> 4) << "," << (bz >> 4)
                              << ") steps=" << steps << " visible=" << world.getVisibleSectionCount() << std::endl;
                }
                assert(world.isSectionVisible(bx >> 4, by >> 4, bz >> 4));
                ++checkedSections;
                if (BlockData::isOpaque(world.getBlock(bx, by, bz)))
                    break;
                if (tMaxX < tMaxY && tMaxX < tMaxZ) {
                    bx += stepX;
                    tMaxX += tDeltaX;
                } else if (tMaxY < tMaxZ) {
                    by += stepY;
                    tMaxY += tDeltaY;
                } else {
                    bz += stepZ;
                    tMaxZ += tDeltaZ;
                }
            }
        }
    }
    assert(checkedSections > 10000);

    // ... and it really culls: standing on the surface hides most of the solid underground.
    world.updateVisibility(cameras.front(), nullptr);
    size_t undergroundVisible = 0, undergroundTotal = 0;
    for (int cx = -3; cx <= 3; ++cx)
        for (int cz = -3; cz <= 3; ++cz)
            for (int sy = 0; sy < 3; ++sy) { // y < 48: below the lowest terrain
                ++undergroundTotal;
                if (world.isSectionVisible(cx, sy, cz))
                    ++undergroundVisible;
            }
    std::cout << "  (underground sections visible from the surface: " << undergroundVisible << " of "
              << undergroundTotal << ")" << std::endl;
    assert(undergroundVisible < undergroundTotal); // the solid parts of the underground are really skipped
    std::cout << "  -> Occlusion soundness tests PASSED! (" << checkedSections << " ray samples)" << std::endl;
}

#include "../src/renderer/FrustumCuller.hpp"

void testOcclusionCullingRespectsFrustum() {
    std::cout << "[TEST] 127. Visibility traversal stays inside the view frustum..." << std::endl;
    ScratchDir dir("occlusion_frustum");
    World world(3, 5, dir.path);
    for (int i = 0; i < 400 && world.getLoadedChunkCount() < 49; ++i) {
        world.update(glm::vec3(8, 150, 8));
        std::this_thread::sleep_for(std::chrono::milliseconds(2));
    }
    world.remeshDirtyChunks(glm::vec3(8, 150, 8), 100000.0);

    Camera cam(glm::vec3(8.0f, 150.0f, 8.0f), glm::vec3(0, 1, 0), 0.0f, 0.0f); // looking along +x
    glm::mat4 viewProj = cam.getProjectionMatrix(16.0f / 9.0f, 70.0f, 0.1f, 500.0f) * cam.getViewMatrix();
    FrustumCuller culler;
    culler.update(viewProj);

    world.updateVisibility(cam.getPosition(), &culler);
    size_t withFrustum = world.getVisibleSectionCount();
    assert(withFrustum > 0);
    assert(world.isSectionVisible(0, 9, 0));   // the camera's own section
    assert(world.isSectionVisible(2, 9, 0));   // straight ahead
    assert(!world.isSectionVisible(-2, 9, 0)); // behind the camera
    assert(!world.isSectionVisible(0, 9, 3));  // far off to the side, outside a 70 degree frustum

    world.updateVisibility(cam.getPosition(), nullptr);
    assert(world.getVisibleSectionCount() > withFrustum); // without the frustum the traversal spreads everywhere
    assert(world.isSectionVisible(-2, 9, 0));
    std::cout << "  -> Frustum-limited visibility tests PASSED!" << std::endl;
}

void testNetherEditsSurviveRelaunch() {
    std::cout << "[TEST] 128. Edits in the Nether are not overwritten by the spawn generator on the next launch..."
              << std::endl;
    ScratchDir dir("nether_relaunch");
    {
        DimensionManager dm(77, dir.path, 1);
        dm.switchDimension(DimensionType::Nether);
        World* nether = dm.getCurrentWorld();
        assert(nether->getBlock(3, 60, 3) == BlockType::Air); // cave space of the generated layout
        nether->setBlock(3, 60, 3, BlockType::EmeraldBlock);
        dm.saveAll();
    }
    {
        DimensionManager dm(77, dir.path, 1);
        dm.switchDimension(DimensionType::Nether);
        assert(dm.getCurrentWorld()->getBlock(3, 60, 3) == BlockType::EmeraldBlock);
        assert(dm.getCurrentWorld()->getBlock(3, 20, 3) != BlockType::Air); // the layout itself is still there
    }
    std::cout << "  -> Nether relaunch tests PASSED!" << std::endl;
}

void testEditDuringChunkLoadIsKept() {
    std::cout << "[TEST] 129. A block edit in a chunk that is still loading survives the worker's result..."
              << std::endl;
    ScratchDir dir("edit_while_loading");
    auto pool = std::make_shared<ThreadPool>(2);
    World world(5, 9, dir.path, pool);
    world.update(glm::vec3(0.0f, 70.0f, 0.0f));        // queues chunks out to distance 5
    world.setBlock(80, 100, 80, BlockType::Glowstone); // chunk (5,5): created synchronously
    for (int i = 0; i < 300; ++i) {                    // let every worker result arrive
        world.update(glm::vec3(0.0f, 70.0f, 0.0f));
        std::this_thread::sleep_for(std::chrono::milliseconds(2));
    }
    assert(world.getBlock(80, 100, 80) == BlockType::Glowstone);
    std::cout << "  -> Edit during load tests PASSED!" << std::endl;
}

void testRegionRewriteKeepsOldDataOnFailure() {
    std::cout << "[TEST] 130. A rewritten chunk stays readable and older chunks are untouched..." << std::endl;
    ScratchDir dir("region_rewrite");
    static BlockType a[16][256][16], b[16][256][16], out[16][256][16];
    static uint8_t light[16][256][16], lightOut[16][256][16];
    for (int x = 0; x < 16; ++x)
        for (int y = 0; y < 256; ++y)
            for (int z = 0; z < 16; ++z) {
                a[x][y][z] = BlockType::Stone;
                b[x][y][z] = BlockType::Dirt;
                light[x][y][z] = 7;
            }
    RegionFile region(0, 0, dir.path);
    assert(region.writeChunk(1, 1, a, light));
    assert(region.writeChunk(2, 2, a, light));
    for (int i = 0; i < 5; ++i)
        assert(region.writeChunk(1, 1, b, light)); // repeated rewrites move between sectors
    assert(region.readChunk(1, 1, out, lightOut) && out[3][4][5] == BlockType::Dirt);
    assert(region.readChunk(2, 2, out, lightOut) && out[3][4][5] == BlockType::Stone);
    RegionFile reopened(0, 0, dir.path); // header on disk is consistent
    assert(reopened.readChunk(1, 1, out, lightOut) && out[3][4][5] == BlockType::Dirt);
    assert(reopened.readChunk(2, 2, out, lightOut) && out[3][4][5] == BlockType::Stone);
    std::cout << "  -> Region rewrite tests PASSED!" << std::endl;
}

void testGameSaveRejectsInvalidValues() {
    std::cout << "[TEST] 131. Game saves with impossible values are rejected and overwriting keeps a valid file..."
              << std::endl;
    ScratchDir dir("game_save_invalid");
    auto base = [] {
        GameSaveData d;
        d.inventory.assign(36, ItemStack{});
        return d;
    };
    GameSaveData good = base();
    assert(GameSave::write(good, dir.path));
    assert(GameSave::write(good, dir.path)); // overwrite an existing file
    GameSaveData r;
    assert(GameSave::read(r, dir.path));

    auto rejected = [&](GameSaveData d) {
        assert(GameSave::write(d, dir.path));
        GameSaveData out;
        return !GameSave::read(out, dir.path);
    };
    GameSaveData d = base();
    d.dimension = 7;
    assert(rejected(d));
    d = base();
    d.position.x = std::numeric_limits<float>::quiet_NaN();
    assert(rejected(d));
    d = base();
    d.health = std::numeric_limits<float>::infinity();
    assert(rejected(d));
    d = base();
    d.selectedSlot = 40;
    assert(rejected(d));
    d = base();
    d.inventory[0] = ItemStack{static_cast<BlockType>(255), 1, 64};
    assert(rejected(d));
    d = base();
    d.inventory[0] = ItemStack{BlockType::Stone, -5, 64};
    assert(rejected(d));
    d = base();
    d.inventory[0] = ItemStack{BlockType::Stone, 2000000, 64};
    assert(rejected(d));
    std::cout << "  -> Game save validation tests PASSED!" << std::endl;
}

void testNetworkTokenIs64BitAndCoordinatesAreSafe() {
    std::cout << "[TEST] 132. Session tokens are 64 bit and extreme block coordinates are rejected..." << std::endl;
    const uint64_t big = 0x1122334455667788ull;
    auto wire = NetworkManager::wrapEnvelope(big, 7u, {static_cast<uint8_t>(PacketType::ChatMessage), 1});
    uint64_t token = 0;
    uint32_t seq = 0;
    const uint8_t* body = nullptr;
    size_t bodySize = 0;
    assert(NetworkManager::unwrapEnvelope(wire.data(), wire.size(), token, seq, body, bodySize));
    assert(token == big && seq == 7u); // no truncation to 32 bit

    for (int bad : {std::numeric_limits<int>::min(), std::numeric_limits<int>::max(), -31000000, 31000000}) {
        BlockChangePacket pkt;
        pkt.blockPos = glm::ivec3(bad, 64, 0);
        pkt.newBlock = BlockType::Stone;
        BlockChangePacket out;
        assert(!NetworkManager::deserializeBlockChange(NetworkManager::serializeBlockChange(pkt).data(),
                                                       NetworkManager::serializeBlockChange(pkt).size(), out));
        pkt.blockPos = glm::ivec3(0, 64, bad);
        assert(!NetworkManager::deserializeBlockChange(NetworkManager::serializeBlockChange(pkt).data(),
                                                       NetworkManager::serializeBlockChange(pkt).size(), out));
    }
    BlockChangePacket ok;
    ok.blockPos = glm::ivec3(-29999999, 64, 29999999);
    ok.newBlock = BlockType::Stone;
    BlockChangePacket out;
    auto bytes = NetworkManager::serializeBlockChange(ok);
    assert(NetworkManager::deserializeBlockChange(bytes.data(), bytes.size(), out) && out.blockPos == ok.blockPos);
    std::cout << "  -> Token width and coordinate range tests PASSED!" << std::endl;
}

void testEditsRelightTheChunk() {
    std::cout << "[TEST] 133. Placing and removing light sources and roofs updates the light arrays..." << std::endl;
    ScratchDir dir("relight");
    World world(1, 5, dir.path);
    const glm::vec3 player(8.0f, 70.0f, 8.0f);
    Chunk* chunk = world.getChunk(0, 0);
    assert(chunk);

    // A torch-like emitter in open air lights its surroundings once the frame's relight pass ran.
    assert(world.getBlock(8, 150, 8) == BlockType::Air);
    world.setBlock(8, 150, 8, BlockType::Glowstone);
    world.remeshDirtyChunks(player, 1000.0);
    assert(chunk->getBlocklight(9, 150, 8) == 14);
    assert(chunk->getBlocklight(8, 153, 8) == 12);
    world.setBlock(8, 150, 8, BlockType::Air);
    world.remeshDirtyChunks(player, 1000.0);
    assert(chunk->getBlocklight(9, 150, 8) == 0);

    // A roof shades the space below, removing it brings the sunlight back.
    assert(chunk->getSunlight(4, 199, 4) == 15);
    for (int x = 2; x <= 6; ++x)
        for (int z = 2; z <= 6; ++z)
            world.setBlock(x, 200, z, BlockType::Stone);
    world.remeshDirtyChunks(player, 1000.0);
    assert(chunk->getSunlight(4, 199, 4) < 15);
    assert(chunk->getSunlight(4, 201, 4) == 15);
    for (int x = 2; x <= 6; ++x)
        for (int z = 2; z <= 6; ++z)
            world.setBlock(x, 200, z, BlockType::Air);
    world.remeshDirtyChunks(player, 1000.0);
    assert(chunk->getSunlight(4, 199, 4) == 15);

    // Every section of the relit column is queued for re-meshing, not just the edited one.
    world.setBlock(8, 150, 8, BlockType::Glowstone);
    world.remeshDirtyChunks(player, 1000.0);
    assert(chunk->getSectionRebuildCount() > 0);
    std::cout << "  -> Relight tests PASSED!" << std::endl;
}

void testNeighbourRemeshSkipsEmptySections() {
    std::cout << "[TEST] 134. A new neighbour only dirties the sections that contain blocks..." << std::endl;
    ScratchDir dir("neighbour_dirty");
    Chunk chunk(0, 0, 3, dir.path);
    uint16_t mask = chunk.getNonEmptySections();
    assert(mask & 1u);            // bedrock / stone at the bottom
    assert(!(mask & (1u << 15))); // open sky at the top
    chunk.setBlock(1, 255, 1, BlockType::Stone);
    assert(chunk.getNonEmptySections() & (1u << 15));
    std::cout << "  -> Neighbour dirty mask tests PASSED!" << std::endl;
}
