using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

public class PokemonEggData
{
    public string ExpectedSpecies { get; set; } = "Pikachu";
    public int StepsRemaining { get; set; } = 100;
    public string InheritedNature { get; set; } = "Hart";
    public bool IsShinyEgg { get; set; } = false;
    public int InheritedIvHp { get; set; } = 15;
    public int InheritedIvAtk { get; set; } = 15;
    public int InheritedIvDef { get; set; } = 15;
    public int InheritedIvSpAtk { get; set; } = 15;
    public int InheritedIvSpDef { get; set; } = 15;
    public int InheritedIvSpeed { get; set; } = 15;
}

public static class BreedingManager
{
    public static List<PokemonEggData> ActiveEggs { get; private set; } = new List<PokemonEggData>();

    public static PokemonEggData CreateEgg(PokemonData p1, PokemonData p2)
    {
        string childSpecies = (Random.Shared.NextDouble() < 0.5) ? p1.Species : p2.Species;
        if (childSpecies == "Glutexo" || childSpecies == "Glurak") childSpecies = "Glumanda";
        else if (childSpecies == "Schillok" || childSpecies == "Turtok") childSpecies = "Schiggy";
        else if (childSpecies == "Bisaknosp" || childSpecies == "Bisaflor") childSpecies = "Bisasam";
        else if (childSpecies == "Raichu") childSpecies = "Pikachu";
        else if (childSpecies == "Alpollo" || childSpecies == "Gengar") childSpecies = "Nebulak";
        else if (childSpecies == "Aquana" || childSpecies == "Blitza" || childSpecies == "Flamara" || childSpecies == "Psiana" || childSpecies == "Nachtara") childSpecies = "Evoli";

        string nature = p1.HeldItem == "Ewigstein" ? p1.Nature : (p2.HeldItem == "Ewigstein" ? p2.Nature : ((Random.Shared.NextDouble() < 0.5) ? p1.Nature : p2.Nature));
        bool masudaShiny = Random.Shared.NextDouble() < 0.25; // Masuda method boosted shiny rate
        bool hasDestinyKnot = p1.HeldItem == "Fatumknoten" || p2.HeldItem == "Fatumknoten";

        var egg = new PokemonEggData
        {
            ExpectedSpecies = childSpecies,
            StepsRemaining = 80,
            InheritedNature = nature,
            IsShinyEgg = masudaShiny,
            InheritedIvHp = hasDestinyKnot ? (Random.Shared.NextDouble() < 0.5 ? p1.IvHp : p2.IvHp) : Math.Max(p1.IvHp, p2.IvHp),
            InheritedIvAtk = hasDestinyKnot ? (Random.Shared.NextDouble() < 0.5 ? p1.IvAtk : p2.IvAtk) : Math.Max(p1.IvAtk, p2.IvAtk),
            InheritedIvDef = (Random.Shared.NextDouble() < 0.5) ? p1.IvDef : p2.IvDef,
            InheritedIvSpAtk = (Random.Shared.NextDouble() < 0.5) ? p1.IvSpAtk : p2.IvSpAtk,
            InheritedIvSpDef = (Random.Shared.NextDouble() < 0.5) ? p1.IvSpDef : p2.IvSpDef,
            InheritedIvSpeed = (Random.Shared.NextDouble() < 0.5) ? p1.IvSpeed : p2.IvSpeed
        };
        ActiveEggs.Add(egg);
        return egg;
    }

    public static bool AddWalkSteps(int steps, out PokemonData? hatchedPokemon)
    {
        hatchedPokemon = null;
        if (ActiveEggs.Count == 0) return false;

        var egg = ActiveEggs[0];
        egg.StepsRemaining = Math.Max(0, egg.StepsRemaining - steps);

        if (egg.StepsRemaining <= 0)
        {
            ActiveEggs.RemoveAt(0);
            hatchedPokemon = new PokemonData(egg.ExpectedSpecies, 1, 15, "Normal", Colors.White, isShiny: egg.IsShinyEgg);
            hatchedPokemon.Nature = egg.InheritedNature;
            hatchedPokemon.IvHp = egg.InheritedIvHp;
            hatchedPokemon.IvAtk = egg.InheritedIvAtk;
            hatchedPokemon.IvDef = egg.InheritedIvDef;
            hatchedPokemon.IvSpAtk = egg.InheritedIvSpAtk;
            hatchedPokemon.IvSpDef = egg.InheritedIvSpDef;
            hatchedPokemon.IvSpeed = egg.InheritedIvSpeed;
            hatchedPokemon.RecalculateStats();
            return true;
        }
        return false;
    }
}
