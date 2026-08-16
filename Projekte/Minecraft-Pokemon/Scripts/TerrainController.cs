using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

public partial class TerrainController : Node3D
{
    [Export] public int ChunkSizeX = 64;
    [Export] public int ChunkSizeY = 32;
    [Export] public int ChunkSizeZ = 64;

    private BlockType[,,] _blocks = null!;
    private MeshInstance3D _meshInstance = null!;
    private StaticBody3D _staticBody = null!;
    private CollisionShape3D _collisionShape = null!;
    private FastNoiseLite _heightNoise = null!;
    private FastNoiseLite _caveNoise = null!;
    private FastNoiseLite _biomeNoise = null!;

    public Dictionary<Vector3I, BlockType> ModifiedBlocks { get; private set; } = new Dictionary<Vector3I, BlockType>();

    private static readonly Vector3[] Directions = new Vector3[]
    {
        Vector3.Up, Vector3.Down, Vector3.Left, Vector3.Right, Vector3.Forward, Vector3.Back
    };

    public override void _Ready()
    {
        _blocks = new BlockType[ChunkSizeX, ChunkSizeY, ChunkSizeZ];

        _meshInstance = new MeshInstance3D();
        AddChild(_meshInstance);

        _staticBody = new StaticBody3D();
        _collisionShape = new CollisionShape3D();
        _staticBody.AddChild(_collisionShape);
        AddChild(_staticBody);

        _heightNoise = new FastNoiseLite();
        _heightNoise.NoiseType = FastNoiseLite.NoiseTypeEnum.Simplex;
        _heightNoise.Frequency = 0.04f;
        _heightNoise.Seed = (int)GD.Randi();

        _caveNoise = new FastNoiseLite();
        _caveNoise.NoiseType = FastNoiseLite.NoiseTypeEnum.Perlin;
        _caveNoise.Frequency = 0.08f;
        _caveNoise.Seed = (int)GD.Randi();

        _biomeNoise = new FastNoiseLite();
        _biomeNoise.NoiseType = FastNoiseLite.NoiseTypeEnum.Simplex;
        _biomeNoise.Frequency = 0.025f;
        _biomeNoise.Seed = (int)GD.Randi();

        var grassPositions = new List<(Vector3 pos, string biome)>();
        GenerateTerrain(grassPositions);
        GenerateArenaStructure();
        GenerateVillageStructure();
        GeneratePokemonCenterStructure();
        GenerateLeagueStructure();
        GenerateBossDungeon();
        GenerateBattleTowerStructure();
        GenerateSkyTowerStructure();
        GenerateSafariZoneStructure();
        GenerateContestHallStructure();
        GenerateRaidDens();
        UpdateMesh();
        SpawnBiomedMonsters(grassPositions);
        SpawnNpcTrainer();
        SpawnVillager();
        SpawnLegendaryBoss();
        SpawnSkyTowerBosses();
        SpawnSafariMonsters();
    }

    private void GenerateTerrain(List<(Vector3 pos, string biome)> spawnPositions)
    {
        for (int x = 0; x < ChunkSizeX; x++)
        {
            for (int z = 0; z < ChunkSizeZ; z++)
            {
                float bVal = _biomeNoise.GetNoise2D(x, z);
                string biome = bVal < -0.35f ? "Schnee" : (bVal < -0.15f ? "Strand" : (bVal > 0.35f ? "Vulkan" : (bVal > 0.15f ? "Gebirge" : "Wiese")));

                float noiseVal = _heightNoise.GetNoise2D(x, z);
                int baseHeight = biome switch
                {
                    "Schnee" => (int)((noiseVal + 1f) * 0.5f * 6) + 4,
                    "Strand" => (int)((noiseVal + 1f) * 0.5f * 4) + 2,
                    "Vulkan" => (int)((noiseVal + 1f) * 0.5f * 10) + 7,
                    "Gebirge" => (int)((noiseVal + 1f) * 0.5f * (ChunkSizeY - 8)) + 8,
                    _ => (int)((noiseVal + 1f) * 0.5f * (ChunkSizeY - 12)) + 5
                };

                for (int y = 0; y < ChunkSizeY; y++)
                {
                    if (y > baseHeight)
                    {
                        if (y <= 4 && biome == "Strand") _blocks[x, y, z] = BlockType.Water;
                        else if (y <= 5 && biome == "Schnee") _blocks[x, y, z] = BlockType.IceBlock;
                        else if (y <= 6 && biome == "Vulkan" && GD.Randf() < 0.15f) _blocks[x, y, z] = BlockType.Lava;
                        else _blocks[x, y, z] = BlockType.Air;
                    }
                    else if (y == baseHeight)
                    {
                        if (biome == "Schnee")
                        {
                            _blocks[x, y, z] = BlockType.SnowBlock;
                            spawnPositions.Add((new Vector3(x, y + 1, z), "Schnee"));
                        }
                        else if (biome == "Strand")
                        {
                            _blocks[x, y, z] = BlockType.Sand;
                            spawnPositions.Add((new Vector3(x, y + 1, z), "Strand"));
                        }
                        else if (biome == "Vulkan")
                        {
                            _blocks[x, y, z] = BlockType.Basalt;
                            spawnPositions.Add((new Vector3(x, y + 1, z), "Vulkan"));
                        }
                        else if (biome == "Gebirge")
                        {
                            _blocks[x, y, z] = BlockType.Stone;
                            spawnPositions.Add((new Vector3(x, y + 1, z), "Gebirge"));
                        }
                        else
                        {
                            if (GD.Randf() < 0.02f) _blocks[x, y, z] = BlockType.PokeballOre;
                            else
                            {
                                _blocks[x, y, z] = BlockType.Grass;
                                spawnPositions.Add((new Vector3(x, y + 1, z), "Wiese"));
                            }
                        }
                    }
                    else if (y > baseHeight - 3)
                    {
                        _blocks[x, y, z] = biome == "Schnee" ? BlockType.SnowBlock : (biome == "Strand" ? BlockType.Sand : (biome == "Vulkan" ? BlockType.Basalt : BlockType.Dirt));
                    }
                    else
                    {
                        float cVal = _caveNoise.GetNoise3D(x, y, z);
                        if (cVal > 0.35f && y > 2) _blocks[x, y, z] = BlockType.Air;
                        else
                        {
                            float oreRoll = GD.Randf();
                            if (oreRoll < 0.03f) _blocks[x, y, z] = BlockType.PokeballOre;
                            else if (oreRoll < 0.06f) _blocks[x, y, z] = BlockType.FossilBlock;
                            else if (oreRoll < 0.09f) _blocks[x, y, z] = BlockType.CrystalOre;
                            else if (oreRoll < 0.14f) _blocks[x, y, z] = BlockType.IronOre;
                            else if (oreRoll < 0.20f) _blocks[x, y, z] = BlockType.CoalOre;
                            else _blocks[x, y, z] = BlockType.Stone;
                        }
                    }
                }

                if (biome == "Wiese" && x >= 2 && x < ChunkSizeX - 2 && z >= 2 && z < ChunkSizeZ - 2)
                {
                    if (_blocks[x, baseHeight, z] == BlockType.Grass)
                    {
                        float roll = GD.Randf();
                        if (roll < 0.04f) GenerateTree(x, baseHeight + 1, z);
                        else if (roll < 0.07f) GenerateApricornTree(x, baseHeight + 1, z);
                    }
                }
            }
        }
    }

    private void GenerateApricornTree(int x, int y, int z)
    {
        if (x < 1 || x >= ChunkSizeX - 1 || z < 1 || z >= ChunkSizeZ - 1 || y + 3 >= ChunkSizeY) return;
        for (int ty = y; ty < y + 3; ty++)
        {
            _blocks[x, ty, z] = BlockType.ApricornTreeBlock;
        }
        _blocks[x, y + 3, z] = BlockType.ApricornFruitBlock;
        _blocks[x + 1, y + 2, z] = BlockType.ApricornTreeBlock;
        _blocks[x - 1, y + 2, z] = BlockType.ApricornTreeBlock;
        _blocks[x, y + 2, z + 1] = BlockType.ApricornTreeBlock;
        _blocks[x, y + 2, z - 1] = BlockType.ApricornTreeBlock;
    }

    private void GenerateArenaStructure()
    {
        int arenaX = 12, arenaZ = 12;
        int groundY = 8;

        for (int dx = -3; dx <= 3; dx++)
        {
            for (int dz = -3; dz <= 3; dz++)
            {
                int x = arenaX + dx;
                int z = arenaZ + dz;
                if (x < 0 || x >= ChunkSizeX || z < 0 || z >= ChunkSizeZ) continue;

                _blocks[x, groundY, z] = BlockType.Planks;

                if (Math.Abs(dx) == 3 || Math.Abs(dz) == 3)
                {
                    for (int h = 1; h <= 3; h++)
                    {
                        if (groundY + h < ChunkSizeY) _blocks[x, groundY + h, z] = BlockType.Stone;
                    }
                }
                else
                {
                    for (int h = 1; h <= 3; h++)
                    {
                        if (groundY + h < ChunkSizeY) _blocks[x, groundY + h, z] = BlockType.Air;
                    }
                }
            }
        }
        _blocks[arenaX, groundY + 1, arenaZ + 3] = BlockType.Air;
        _blocks[arenaX, groundY + 2, arenaZ + 3] = BlockType.Air;
        _blocks[arenaX - 2, groundY + 1, arenaZ - 2] = BlockType.HealStationBlock;
    }

    private void GeneratePokemonCenterStructure()
    {
        int pcX = 26, pcZ = 14;
        int groundY = 7;

        for (int dx = -3; dx <= 3; dx++)
        {
            for (int dz = -3; dz <= 3; dz++)
            {
                int x = pcX + dx;
                int z = pcZ + dz;
                if (x < 0 || x >= ChunkSizeX || z < 0 || z >= ChunkSizeZ) continue;

                _blocks[x, groundY, z] = BlockType.Planks;

                if (Math.Abs(dx) == 3 || Math.Abs(dz) == 3)
                {
                    for (int h = 1; h <= 3; h++)
                    {
                        if (groundY + h < ChunkSizeY) _blocks[x, groundY + h, z] = BlockType.Stone;
                    }
                }
                else
                {
                    for (int h = 1; h <= 3; h++)
                    {
                        if (groundY + h < ChunkSizeY) _blocks[x, groundY + h, z] = BlockType.Air;
                    }
                }

                // Center Roof
                if (groundY + 4 < ChunkSizeY)
                {
                    _blocks[x, groundY + 4, z] = BlockType.CenterRoofBlock;
                }
            }
        }
        _blocks[pcX, groundY + 1, pcZ + 3] = BlockType.Air;
        _blocks[pcX, groundY + 2, pcZ + 3] = BlockType.Air;
        _blocks[pcX, groundY + 1, pcZ - 2] = BlockType.HealStationBlock;
        _blocks[pcX + 1, groundY + 1, pcZ - 2] = BlockType.JoyNpcBlock;
    }

    private void GenerateLeagueStructure()
    {
        int lX = 35, lZ = 45;
        int groundY = 9;

        for (int dx = -4; dx <= 4; dx++)
        {
            for (int dz = -4; dz <= 4; dz++)
            {
                int x = lX + dx;
                int z = lZ + dz;
                if (x < 0 || x >= ChunkSizeX || z < 0 || z >= ChunkSizeZ) continue;

                _blocks[x, groundY, z] = BlockType.Obsidian;

                if (Math.Abs(dx) == 4 || Math.Abs(dz) == 4)
                {
                    for (int h = 1; h <= 4; h++)
                    {
                        if (groundY + h < ChunkSizeY) _blocks[x, groundY + h, z] = BlockType.DungeonStone;
                    }
                }
                else
                {
                    for (int h = 1; h <= 4; h++)
                    {
                        if (groundY + h < ChunkSizeY) _blocks[x, groundY + h, z] = BlockType.Air;
                    }
                }
            }
        }
        _blocks[lX, groundY + 1, lZ + 4] = BlockType.Air;
        _blocks[lX, groundY + 2, lZ + 4] = BlockType.Air;
    }

    private void GenerateVillageStructure()
    {
        int vX = 22, vZ = 12;
        int groundY = 7;

        for (int dx = -2; dx <= 2; dx++)
        {
            for (int dz = -2; dz <= 2; dz++)
            {
                int x = vX + dx;
                int z = vZ + dz;
                if (x < 0 || x >= ChunkSizeX || z < 0 || z >= ChunkSizeZ) continue;

                _blocks[x, groundY, z] = BlockType.Planks;

                if (Math.Abs(dx) == 2 || Math.Abs(dz) == 2)
                {
                    for (int h = 1; h <= 2; h++)
                    {
                        if (groundY + h < ChunkSizeY) _blocks[x, groundY + h, z] = BlockType.Wood;
                    }
                }
                else
                {
                    for (int h = 1; h <= 2; h++)
                    {
                        if (groundY + h < ChunkSizeY) _blocks[x, groundY + h, z] = BlockType.Air;
                    }
                }
            }
        }

        _blocks[vX + 3, groundY, vZ] = BlockType.Farmland;
        _blocks[vX + 3, groundY + 1, vZ] = BlockType.BerryBushBlock;
        _blocks[vX - 3, groundY, vZ] = BlockType.JuicerBlock;
        _blocks[vX - 3, groundY + 1, vZ] = BlockType.ExtractorBlock;
    }

    private void GenerateBattleTowerStructure()
    {
        int tX = 12, tZ = 50;
        int groundY = 8;

        for (int dx = -3; dx <= 3; dx++)
        {
            for (int dz = -3; dz <= 3; dz++)
            {
                for (int h = 0; h <= 10; h++)
                {
                    int x = tX + dx;
                    int y = groundY + h;
                    int z = tZ + dz;
                    if (x < 0 || x >= ChunkSizeX || y < 0 || y >= ChunkSizeY || z < 0 || z >= ChunkSizeZ) continue;

                    if (h == 0) _blocks[x, y, z] = BlockType.Obsidian;
                    else if (Math.Abs(dx) == 3 || Math.Abs(dz) == 3 || h == 10) _blocks[x, y, z] = BlockType.TowerStone;
                    else _blocks[x, y, z] = BlockType.Air;
                }
            }
        }
        _blocks[tX, groundY + 1, tZ + 3] = BlockType.Air;
        _blocks[tX, groundY + 2, tZ + 3] = BlockType.Air;
    }

    private void GenerateBossDungeon()
    {
        int dX = 48, dY = 2, dZ = 48;
        for (int dx = -3; dx <= 3; dx++)
        {
            for (int dz = -3; dz <= 3; dz++)
            {
                for (int dy = 0; dy <= 4; dy++)
                {
                    int x = dX + dx;
                    int y = dY + dy;
                    int z = dZ + dz;

                    if (x < 0 || x >= ChunkSizeX || y < 0 || y >= ChunkSizeY || z < 0 || z >= ChunkSizeZ) continue;

                    if (dy == 0) _blocks[x, y, z] = BlockType.Obsidian;
                    else if (Math.Abs(dx) == 3 || Math.Abs(dz) == 3 || dy == 4) _blocks[x, y, z] = BlockType.DungeonStone;
                    else _blocks[x, y, z] = BlockType.Air;
                }
            }
        }
    }

    private void GenerateSkyTowerStructure()
    {
        int sX = 20, sZ = 20;
        int sY = 24;

        for (int dx = -3; dx <= 3; dx++)
        {
            for (int dz = -3; dz <= 3; dz++)
            {
                for (int h = 0; h <= 6; h++)
                {
                    int x = sX + dx;
                    int y = sY + h;
                    int z = sZ + dz;
                    if (x < 0 || x >= ChunkSizeX || y < 0 || y >= ChunkSizeY || z < 0 || z >= ChunkSizeZ) continue;

                    if (h == 0) _blocks[x, y, z] = BlockType.Obsidian;
                    else if (Math.Abs(dx) == 3 || Math.Abs(dz) == 3 || h == 6) _blocks[x, y, z] = BlockType.SkyTowerStone;
                    else _blocks[x, y, z] = BlockType.Air;
                }
            }
        }
    }

    private void GenerateSafariZoneStructure()
    {
        int sfX = 50, sfZ = 30;
        int groundY = 4;

        for (int dx = -4; dx <= 4; dx++)
        {
            for (int dz = -4; dz <= 4; dz++)
            {
                int x = sfX + dx;
                int z = sfZ + dz;
                if (x < 0 || x >= ChunkSizeX || z < 0 || z >= ChunkSizeZ) continue;

                if (Math.Abs(dx) == 4 || Math.Abs(dz) == 4)
                {
                    _blocks[x, groundY + 1, z] = BlockType.Wood;
                    _blocks[x, groundY + 2, z] = BlockType.Leaves;
                }
                else
                {
                    _blocks[x, groundY, z] = BlockType.Farmland;
                }
            }
        }
    }

    private void GenerateContestHallStructure()
    {
        int cX = 25, cZ = 38;
        int groundY = 4;

        for (int dx = -3; dx <= 3; dx++)
        {
            for (int dz = -3; dz <= 3; dz++)
            {
                int x = cX + dx;
                int z = cZ + dz;
                if (x < 0 || x >= ChunkSizeX || z < 0 || z >= ChunkSizeZ) continue;

                if (Math.Abs(dx) == 3 || Math.Abs(dz) == 3)
                {
                    _blocks[x, groundY + 1, z] = BlockType.Planks;
                    _blocks[x, groundY + 2, z] = BlockType.ContestRibbonBlock;
                }
                else
                {
                    _blocks[x, groundY, z] = BlockType.Planks;
                }
            }
        }

        // Place Meteor Block on mountain
        _blocks[12, 19, 50] = BlockType.MeteorBlock;
    }

    private void SpawnSafariMonsters()
    {
        PackedScene monsterScene = GD.Load<PackedScene>("res://Scenes/Monster.tscn");
        string[] safariSpecies = new string[] { "Scherox", "Tauros", "Pinsir", "Kangama" };

        for (int i = 0; i < safariSpecies.Length; i++)
        {
            var m = monsterScene.Instantiate<Monster>();
            m.GlobalPosition = new Vector3(48.0f + i * 2, 5.5f, 28.0f + i * 2);
            m.MonsterName = safariSpecies[i];
            m.Level = 35;
            GetNode("/root").CallDeferred("add_child", m);
        }
    }

    private void SpawnNpcTrainer()
    {
        Vector3[] gymPositions = new Vector3[]
        {
            new Vector3(12.0f, 9.5f, 12.0f),
            new Vector3(50.0f, 5.5f, 12.0f),
            new Vector3(20.0f, 8.5f, 50.0f),
            new Vector3(12.0f, 8.5f, 35.0f),
            new Vector3(50.0f, 8.5f, 35.0f),
            new Vector3(30.0f, 9.5f, 20.0f),
            new Vector3(50.0f, 11.5f, 50.0f),
            new Vector3(35.0f, 10.5f, 45.0f)
        };

        for (int i = 0; i < gymPositions.Length; i++)
        {
            var trainer = new NpcTrainer();
            trainer.GlobalPosition = gymPositions[i];
            trainer.SetupGymLeader(i + 1);
            GetNode("/root").CallDeferred("add_child", trainer);
        }

        // Spawn Top Four Trainers inside League Palace
        Vector3[] e4Positions = new Vector3[]
        {
            new Vector3(33.0f, 11.5f, 43.0f),
            new Vector3(37.0f, 11.5f, 43.0f),
            new Vector3(33.0f, 11.5f, 47.0f),
            new Vector3(37.0f, 11.5f, 47.0f)
        };

        for (int i = 0; i < e4Positions.Length; i++)
        {
            var e4Trainer = new NpcTrainer();
            e4Trainer.GlobalPosition = e4Positions[i];
            e4Trainer.SetupEliteFour(i + 1);
            GetNode("/root").CallDeferred("add_child", e4Trainer);
        }

        // Spawn Trainer RED on Silberberg Peak
        var redTrainer = new NpcTrainer();
        redTrainer.GlobalPosition = new Vector3(12.0f, 18.5f, 50.0f);
        redTrainer.SetupTrainerRed();
        GetNode("/root").CallDeferred("add_child", redTrainer);
    }

    private void SpawnVillager()
    {
        var villager = new NpcVillager();
        villager.GlobalPosition = new Vector3(22.0f, 8.5f, 12.0f);
        GetNode("/root").CallDeferred("add_child", villager);

        var merchant = new NpcVillager();
        merchant.GlobalPosition = new Vector3(32.0f, 5.5f, 32.0f);
        merchant.VillagerName = "Wanderhändler Kanto";
        GetNode("/root").CallDeferred("add_child", merchant);
    }

    private void SpawnLegendaryBoss()
    {
        PackedScene monsterScene = GD.Load<PackedScene>("res://Scenes/Monster.tscn");
        var boss = monsterScene.Instantiate<Monster>();
        boss.GlobalPosition = new Vector3(48.0f, 3.5f, 48.0f);
        boss.MonsterName = GD.Randf() < 0.5f ? "Mewtu" : "Zapdos";
        boss.Level = 50;
        boss.MaxHp = 200;
        boss.CurrentHp = 200;

        GetNode("/root").CallDeferred("add_child", boss);
    }

    private void SpawnSkyTowerBosses()
    {
        PackedScene monsterScene = GD.Load<PackedScene>("res://Scenes/Monster.tscn");
        Vector3[] titanPositions = new Vector3[]
        {
            new Vector3(20.0f, 25.5f, 20.0f),
            new Vector3(50.0f, 11.5f, 50.0f),
            new Vector3(50.0f, 5.5f, 12.0f)
        };
        string[] titanNames = new string[] { "Rayquaza", "Groudon", "Kyogre" };

        for (int i = 0; i < titanNames.Length; i++)
        {
            var titan = monsterScene.Instantiate<Monster>();
            titan.GlobalPosition = titanPositions[i];
            titan.MonsterName = titanNames[i];
            titan.Level = 75;
            titan.MaxHp = 250;
            titan.CurrentHp = 250;
            GetNode("/root").CallDeferred("add_child", titan);
        }

        PackedScene trainerScene = GD.Load<PackedScene>("res://Scenes/NpcTrainer.tscn");
        var red = trainerScene.Instantiate<NpcTrainer>();
        red.GlobalPosition = new Vector3(20.0f, 26.0f, 22.0f);
        red.SetupTrainerRed();
        GetNode("/root").CallDeferred("add_child", red);
    }

    private void GenerateTree(int trunkX, int trunkY, int trunkZ)
    {
        int trunkHeight = (int)GD.RandRange(3, 5);
        for (int y = 0; y < trunkHeight; y++)
        {
            int ty = trunkY + y;
            if (ty < ChunkSizeY)
            {
                _blocks[trunkX, ty, trunkZ] = BlockType.Wood;
            }
        }

        int canopyY = trunkY + trunkHeight - 1;
        for (int lx = -2; lx <= 2; lx++)
        {
            for (int lz = -2; lz <= 2; lz++)
            {
                for (int ly = 0; ly <= 2; ly++)
                {
                    if (Math.Abs(lx) == 2 && Math.Abs(lz) == 2 && ly == 2) continue;
                    int bx = trunkX + lx;
                    int by = canopyY + ly;
                    int bz = trunkZ + lz;

                    if (bx >= 0 && bx < ChunkSizeX && by >= 0 && by < ChunkSizeY && bz >= 0 && bz < ChunkSizeZ)
                    {
                        if (_blocks[bx, by, bz] == BlockType.Air)
                        {
                            _blocks[bx, by, bz] = BlockType.Leaves;
                        }
                    }
                }
            }
        }
    }

    private void SpawnBiomedMonsters(List<(Vector3 pos, string biome)> spawnPositions)
    {
        if (spawnPositions.Count == 0) return;

        PackedScene monsterScene = GD.Load<PackedScene>("res://Scenes/Monster.tscn");
        int monsterCount = Mathf.Min(spawnPositions.Count, 22);

        for (int i = 0; i < monsterCount; i++)
        {
            int index = (int)(GD.Randi() % (uint)spawnPositions.Count);
            var (spawnPos, biome) = spawnPositions[index];
            spawnPositions.RemoveAt(index);

            string species = biome switch
            {
                "Schnee" => "Arktos",
                "Vulkan" => (GD.Randf() < 0.5f ? "Glumanda" : "Glutexo"),
                "Gebirge" => (GD.Randf() < 0.35f ? "Dragoran" : (GD.Randf() < 0.5f ? "Glumanda" : "Glutexo")),
                "Strand" => (GD.Randf() < 0.35f ? "Garados" : (GD.Randf() < 0.5f ? "Schiggy" : "Schillok")),
                _ => (GD.Randf() < 0.25f ? "Evoli" : (GD.Randf() < 0.5f ? "Nachtara" : (GD.Randf() < 0.7f ? "Psiana" : "Pikachu")))
            };

            var monster = monsterScene.Instantiate<Monster>();
            monster.GlobalPosition = spawnPos;
            monster.MonsterName = species;
            monster.Level = (int)(GD.Randi() % 12) + 1;
            monster.MaxHp = 15 + monster.Level * 2;
            monster.CurrentHp = monster.MaxHp;

            GetNode("/root").CallDeferred("add_child", monster);
        }

        var creeper = new HostileMob();
        creeper.GlobalPosition = new Vector3(30.0f, 15.0f, 30.0f);
        GetNode("/root").CallDeferred("add_child", creeper);
    }

    public void UpdateMesh()
    {
        var vertices = new List<Vector3>();
        var colors = new List<Color>();
        var normals = new List<Vector3>();
        var indices = new List<int>();

        int indexCounter = 0;

        for (int x = 0; x < ChunkSizeX; x++)
        {
            for (int y = 0; y < ChunkSizeY; y++)
            {
                for (int z = 0; z < ChunkSizeZ; z++)
                {
                    BlockType block = _blocks[x, y, z];
                    if (!BlockInfo.IsSolid(block) && block != BlockType.Water && block != BlockType.IceBlock && block != BlockType.Lava) continue;

                    Color blockColor = BlockInfo.GetColor(block);

                    for (int f = 0; f < 6; f++)
                    {
                        Vector3 dir = Directions[f];
                        int nx = x + (int)dir.X;
                        int ny = y + (int)dir.Y;
                        int nz = z + (int)dir.Z;

                        bool drawFace = false;
                        if (nx < 0 || nx >= ChunkSizeX || ny < 0 || ny >= ChunkSizeY || nz < 0 || nz >= ChunkSizeZ)
                        {
                            drawFace = true;
                        }
                        else if (!BlockInfo.IsSolid(_blocks[nx, ny, nz]) && _blocks[nx, ny, nz] != block)
                        {
                            drawFace = true;
                        }

                        if (drawFace)
                        {
                            AddFace(x, y, z, f, blockColor, vertices, colors, normals, indices, ref indexCounter);
                        }
                    }
                }
            }
        }

        if (vertices.Count == 0)
        {
            _meshInstance.Mesh = null;
            _collisionShape.Shape = null;
            return;
        }

        var arrMesh = new ArrayMesh();
        var arrays = new Godot.Collections.Array();
        arrays.Resize((int)Mesh.ArrayType.Max);
        arrays[(int)Mesh.ArrayType.Vertex] = vertices.ToArray();
        arrays[(int)Mesh.ArrayType.Color] = colors.ToArray();
        arrays[(int)Mesh.ArrayType.Normal] = normals.ToArray();
        arrays[(int)Mesh.ArrayType.Index] = indices.ToArray();

        arrMesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arrays);

        var mat = new StandardMaterial3D();
        mat.ShadingMode = BaseMaterial3D.ShadingModeEnum.PerVertex;
        mat.VertexColorUseAsAlbedo = true;
        mat.Transparency = BaseMaterial3D.TransparencyEnum.Alpha;
        arrMesh.SurfaceSetMaterial(0, mat);

        _meshInstance.Mesh = arrMesh;
        _collisionShape.Shape = arrMesh.CreateTrimeshShape();
    }

    private void AddFace(
        int x, int y, int z, int faceDir, Color color,
        List<Vector3> vertices, List<Color> colors, List<Vector3> normals, List<int> indices,
        ref int indexCounter)
    {
        Vector3 center = new Vector3(x, y, z);
        Vector3 n = Directions[faceDir];

        Vector3 v0 = Vector3.Zero, v1 = Vector3.Zero, v2 = Vector3.Zero, v3 = Vector3.Zero;

        switch (faceDir)
        {
            case 0:
                v0 = new Vector3(-0.5f, 0.5f, -0.5f);
                v1 = new Vector3(0.5f, 0.5f, -0.5f);
                v2 = new Vector3(0.5f, 0.5f, 0.5f);
                v3 = new Vector3(-0.5f, 0.5f, 0.5f);
                break;
            case 1:
                v0 = new Vector3(-0.5f, -0.5f, 0.5f);
                v1 = new Vector3(0.5f, -0.5f, 0.5f);
                v2 = new Vector3(0.5f, -0.5f, -0.5f);
                v3 = new Vector3(-0.5f, -0.5f, -0.5f);
                break;
            case 2:
                v0 = new Vector3(-0.5f, -0.5f, -0.5f);
                v1 = new Vector3(-0.5f, -0.5f, 0.5f);
                v2 = new Vector3(-0.5f, 0.5f, 0.5f);
                v3 = new Vector3(-0.5f, 0.5f, -0.5f);
                break;
            case 3:
                v0 = new Vector3(0.5f, -0.5f, 0.5f);
                v1 = new Vector3(0.5f, -0.5f, -0.5f);
                v2 = new Vector3(0.5f, 0.5f, -0.5f);
                v3 = new Vector3(0.5f, 0.5f, 0.5f);
                break;
            case 4:
                v0 = new Vector3(0.5f, -0.5f, -0.5f);
                v1 = new Vector3(-0.5f, -0.5f, -0.5f);
                v2 = new Vector3(-0.5f, 0.5f, -0.5f);
                v3 = new Vector3(0.5f, 0.5f, -0.5f);
                break;
            case 5:
                v0 = new Vector3(-0.5f, -0.5f, 0.5f);
                v1 = new Vector3(0.5f, -0.5f, 0.5f);
                v2 = new Vector3(0.5f, 0.5f, 0.5f);
                v3 = new Vector3(-0.5f, 0.5f, 0.5f);
                break;
        }

        vertices.Add(center + v0);
        vertices.Add(center + v1);
        vertices.Add(center + v2);
        vertices.Add(center + v3);

        for (int i = 0; i < 4; i++)
        {
            colors.Add(color);
            normals.Add(n);
        }

        indices.Add(indexCounter);
        indices.Add(indexCounter + 2);
        indices.Add(indexCounter + 1);

        indices.Add(indexCounter);
        indices.Add(indexCounter + 3);
        indices.Add(indexCounter + 2);

        indexCounter += 4;
    }

    private void GenerateRaidDens()
    {
        // Place Raid Dens with glowing pillars in unique coordinates
        Vector3I[] denCoords = new Vector3I[]
        {
            new Vector3I(12, 10, 12),
            new Vector3I(45, 12, 48),
            new Vector3I(28, 14, 52)
        };

        foreach (var coord in denCoords)
        {
            if (coord.X >= 0 && coord.X < ChunkSizeX && coord.Z >= 0 && coord.Z < ChunkSizeZ)
            {
                int surfaceY = 0;
                for (int y = ChunkSizeY - 1; y >= 0; y--)
                {
                    if (_blocks[coord.X, y, coord.Z] != BlockType.Air)
                    {
                        surfaceY = y;
                        break;
                    }
                }

                _blocks[coord.X, surfaceY + 1, coord.Z] = BlockType.RaidDenBlock;
                _blocks[coord.X + 1, surfaceY + 1, coord.Z] = BlockType.Obsidian;
                _blocks[coord.X - 1, surfaceY + 1, coord.Z] = BlockType.Obsidian;
                _blocks[coord.X, surfaceY + 1, coord.Z + 1] = BlockType.Obsidian;
                _blocks[coord.X, surfaceY + 1, coord.Z - 1] = BlockType.Obsidian;
            }
        }
    }

    public bool SetBlock(Vector3I globalCoords, BlockType type)
    {
        if (globalCoords.X < 0 || globalCoords.X >= ChunkSizeX ||
            globalCoords.Y < 0 || globalCoords.Y >= ChunkSizeY ||
            globalCoords.Z < 0 || globalCoords.Z >= ChunkSizeZ)
        {
            return false;
        }

        BlockType oldBlock = _blocks[globalCoords.X, globalCoords.Y, globalCoords.Z];
        _blocks[globalCoords.X, globalCoords.Y, globalCoords.Z] = type;
        ModifiedBlocks[globalCoords] = type;

        if (EffectsManager.Instance != null && oldBlock != BlockType.Air && type == BlockType.Air)
        {
            EffectsManager.Instance.SpawnBlockBreakEffect(new Vector3(globalCoords.X, globalCoords.Y, globalCoords.Z), BlockInfo.GetColor(oldBlock));
            EffectsManager.Instance.PlaySoundEffect(300.0f, 0.1f);
        }
        else if (EffectsManager.Instance != null && type != BlockType.Air)
        {
            EffectsManager.Instance.PlaySoundEffect(600.0f, 0.08f);
        }

        UpdateMesh();
        return true;
    }

    public BlockType GetBlock(Vector3I globalCoords)
    {
        if (globalCoords.X < 0 || globalCoords.X >= ChunkSizeX ||
            globalCoords.Y < 0 || globalCoords.Y >= ChunkSizeY ||
            globalCoords.Z < 0 || globalCoords.Z >= ChunkSizeZ)
        {
            return BlockType.Air;
        }
        return _blocks[globalCoords.X, globalCoords.Y, globalCoords.Z];
    }
}
