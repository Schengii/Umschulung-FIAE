using Godot;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace MinecraftPokemon;

public class BlockSaveData
{
    public int X { get; set; }
    public int Y { get; set; }
    public int Z { get; set; }
    public byte Type { get; set; }
}

public class SaveData
{
    public float PlayerPosX { get; set; }
    public float PlayerPosY { get; set; }
    public float PlayerPosZ { get; set; }

    public int PokeballCount { get; set; } = 10;
    public List<PokemonData> Party { get; set; } = new List<PokemonData>();
    public List<PokemonData> PCStorage { get; set; } = new List<PokemonData>();
    public List<BlockSaveData> ModifiedBlocks { get; set; } = new List<BlockSaveData>();
    public Dictionary<string, int> Inventory { get; set; } = new Dictionary<string, int>();

    // Tool progression & stones
    public bool HasStonePickaxe { get; set; } = false;
    public bool HasIronPickaxe { get; set; } = false;
    public int FeuersteinCount { get; set; } = 0;
    public int WassersteinCount { get; set; } = 0;
    public int DonnersteinCount { get; set; } = 0;
}

public static class SaveSystem
{
    private const string SaveFilePath = "user://savegame.json";

    public static bool SaveExists()
    {
        return Godot.FileAccess.FileExists(SaveFilePath);
    }

    public static void SaveGame(SaveData data)
    {
        try
        {
            string json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
            using var file = Godot.FileAccess.Open(SaveFilePath, Godot.FileAccess.ModeFlags.Write);
            if (file != null)
            {
                file.StoreString(json);
            }
        }
        catch (Exception ex)
        {
            GD.PrintErr("Failed to save game: " + ex.Message);
        }
    }

    public static SaveData? LoadGame()
    {
        try
        {
            if (!SaveExists()) return null;
            using var file = Godot.FileAccess.Open(SaveFilePath, Godot.FileAccess.ModeFlags.Read);
            if (file == null) return null;

            string json = file.GetAsText();
            return JsonSerializer.Deserialize<SaveData>(json);
        }
        catch (Exception ex)
        {
            GD.PrintErr("Failed to load game: " + ex.Message);
            return null;
        }
    }
}
