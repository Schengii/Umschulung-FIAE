using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

public class TMData
{
    public string Number { get; set; } = "TM01";
    public MoveData Move { get; set; } = null!;

    public TMData(string number, MoveData move)
    {
        Number = number;
        Move = move;
    }
}

public static class TMManager
{
    public static List<TMData> InventoryTMs { get; private set; } = new List<TMData>();

    static TMManager()
    {
        // Default unlocked TMs
        InventoryTMs.Add(new TMData("TM13", new MoveData("Eisstrahl", "Eis", 90, 1.0f, 10, MoveCategory.Special)));
        InventoryTMs.Add(new TMData("TM24", new MoveData("Donnerblitz", "Elektro", 90, 1.0f, 15, MoveCategory.Special, StatusCondition.Paralyzed, 0.1f)));
        InventoryTMs.Add(new TMData("TM35", new MoveData("Flammenwurf", "Feuer", 90, 1.0f, 15, MoveCategory.Special, StatusCondition.Burned, 0.1f)));
        InventoryTMs.Add(new TMData("TM26", new MoveData("Erdbeben", "Boden", 100, 1.0f, 10, MoveCategory.Physical)));
        InventoryTMs.Add(new TMData("VM01", new MoveData("Zerschneider", "Normal", 50, 0.95f, 30, MoveCategory.Physical)));
        InventoryTMs.Add(new TMData("VM06", new MoveData("Zertrümmerer", "Kampf", 40, 1.0f, 15, MoveCategory.Physical)));
    }

    public static bool LearnTM(PokemonData pokemon, TMData tm, out string msg)
    {
        if (pokemon.Moves.Count >= 4)
        {
            pokemon.Moves[3] = tm.Move;
            msg = $"{pokemon.Species} hat Slot 4 vergessen und {tm.Move.Name} ({tm.Number}) erlernt!";
            return true;
        }
        else
        {
            pokemon.Moves.Add(tm.Move);
            msg = $"{pokemon.Species} hat {tm.Move.Name} ({tm.Number}) erlernt!";
            return true;
        }
    }
}
