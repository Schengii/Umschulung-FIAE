// Test-only stubs for types that exist in Player.cs (which is excluded from
// test compilation due to its deep Godot scene dependencies).
// These stubs let Monster.cs, NpcTrainer.cs etc. compile for testing purposes.

using Godot;

namespace MinecraftPokemon;

/// <summary>
/// Minimal stub of the Player class for test compilation.
/// Only the members referenced by other compiled scripts are declared here.
/// </summary>
public partial class Player : CharacterBody3D
{
    public System.Collections.Generic.List<PokemonData> Party { get; } = new();
    public void StartEvolutionCutscene(PokemonData pokemon, string targetSpecies) { }
    public void DisplayFeedback(string msg) { }
}
