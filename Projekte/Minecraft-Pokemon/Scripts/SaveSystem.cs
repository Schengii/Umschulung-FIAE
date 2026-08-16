using Godot;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace MinecraftPokemon;

/// <summary>Persistent data for a single modified terrain block.</summary>
public class BlockSaveData
{
    public int X { get; set; }
    public int Y { get; set; }
    public int Z { get; set; }
    public byte Type { get; set; }
}

/// <summary>
/// Root serialisation container for all game-state.
/// Increment <see cref="CurrentVersion"/> whenever the schema changes and
/// add a migration branch in <see cref="SaveSystem.Migrate"/>.
/// </summary>
public class SaveData
{
    // ── Version guard ──────────────────────────────────────────────────────────
    /// <summary>Schema version written to disk. Bumped on every breaking change.</summary>
    public int SaveVersion { get; set; } = SaveSystem.CurrentVersion;

    // ── Player position ────────────────────────────────────────────────────────
    public float PlayerPosX { get; set; }
    public float PlayerPosY { get; set; }
    public float PlayerPosZ { get; set; }

    // ── Ball inventory ─────────────────────────────────────────────────────────
    public int PokeballCount   { get; set; } = 10;
    public int SuperballCount  { get; set; } = 3;
    public int HyperballCount  { get; set; } = 1;
    public int MasterballCount { get; set; } = 1;
    public int HeavyballCount  { get; set; } = 2;
    public int NetballCount    { get; set; } = 2;
    public int DuskballCount   { get; set; } = 2;
    public int DiveballCount   { get; set; } = 2;
    public int ApricornCount   { get; set; } = 5;
    public int BerryCount      { get; set; } = 5;

    // ── Flags ──────────────────────────────────────────────────────────────────
    public bool IsChampion { get; set; } = false;

    // ── Pokémon storage ────────────────────────────────────────────────────────
    public List<PokemonData> Party      { get; set; } = new List<PokemonData>();
    public List<PokemonData> PCStorage  { get; set; } = new List<PokemonData>();
    public List<BlockSaveData> ModifiedBlocks { get; set; } = new List<BlockSaveData>();
    public Dictionary<string, int> Inventory { get; set; } = new Dictionary<string, int>();

    // ── Tool progression & stones ─────────────────────────────────────────────
    public bool HasStonePickaxe   { get; set; } = false;
    public bool HasIronPickaxe    { get; set; } = false;
    public int  FeuersteinCount   { get; set; } = 0;
    public int  WassersteinCount  { get; set; } = 0;
    public int  DonnersteinCount  { get; set; } = 0;
    public List<string> HallOfFameRecords { get; set; } = new List<string>();
    public List<QuestSaveEntry> QuestProgress { get; set; } = new List<QuestSaveEntry>();
    public List<AchievementSaveEntry> AchievementProgress { get; set; } = new List<AchievementSaveEntry>();
}

/// <summary>Handles JSON-based save / load with schema versioning.</summary>
public static class SaveSystem
{
    /// <summary>Current save-file schema version. Increment on breaking schema changes.</summary>
    public const int CurrentVersion = 2;

    private const string SaveFilePath = "user://savegame.json";

    public static bool SaveExists() => Godot.FileAccess.FileExists(SaveFilePath);

    // ── Save ──────────────────────────────────────────────────────────────────
    public static void SaveGame(SaveData data)
    {
        try
        {
            data.SaveVersion = CurrentVersion;
            string json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
            using var file = Godot.FileAccess.Open(SaveFilePath, Godot.FileAccess.ModeFlags.Write);
            if (file != null)
                file.StoreString(json);
        }
        catch (Exception ex)
        {
            GD.PrintErr("Failed to save game: " + ex.Message);
        }
    }

    // ── Load ──────────────────────────────────────────────────────────────────
    public static SaveData? LoadGame()
    {
        try
        {
            if (!SaveExists()) return null;
            using var file = Godot.FileAccess.Open(SaveFilePath, Godot.FileAccess.ModeFlags.Read);
            if (file == null) return null;

            string json = file.GetAsText();
            var data = JsonSerializer.Deserialize<SaveData>(json);
            if (data == null) return null;

            return Migrate(data);
        }
        catch (Exception ex)
        {
            GD.PrintErr("Failed to load game: " + ex.Message);
            return null;
        }
    }

    // ── Migration ─────────────────────────────────────────────────────────────
    /// <summary>
    /// Incrementally upgrades a loaded <see cref="SaveData"/> to
    /// <see cref="CurrentVersion"/> if the on-disk version is older.
    /// Add new <c>case</c> blocks here for every future schema change.
    /// </summary>
    private static SaveData Migrate(SaveData data)
    {
        int fromVersion = data.SaveVersion;
        if (fromVersion >= CurrentVersion) return data; // nothing to do

        GD.Print($"[SaveSystem] Migrating save from v{fromVersion} → v{CurrentVersion}");

        for (int v = fromVersion; v < CurrentVersion; v++)
        {
            switch (v)
            {
                case 0:
                    // v0 → v1: HallOfFameRecords was added
                    data.HallOfFameRecords ??= new List<string>();
                    break;

                case 1:
                    // v1 → v2: SaveVersion field itself was added
                    // No data changes needed; bumping version is sufficient.
                    break;

                // ── Add future migrations here ──────────────────────────────
                // case 2:
                //     // v2 → v3: description of change
                //     break;
            }
        }

        data.SaveVersion = CurrentVersion;
        return data;
    }
}
