using Godot;
using System;

namespace MinecraftPokemon;

public partial class Pokeball : RigidBody3D
{
    public static event Action<string>? OnCaptureFeedback;
    public static event Action<PokemonData>? OnPokemonCaptured;

    public float CatchRateMultiplier { get; set; } = 1.0f;
    public string BallType { get; set; } = "Pokeball";
    private bool _hasCollided = false;

    public override void _Ready()
    {
        BodyEntered += OnBodyEntered;
        ContactMonitor = true;
        MaxContactsReported = 4;
    }

    private void OnBodyEntered(Node body)
    {
        if (_hasCollided) return;
        _hasCollided = true;

        if (body is Monster monster && !monster.IsCompanion)
        {
            float effectiveMultiplier = CatchRateMultiplier;
            if (BallType == "Schwerball")
            {
                string s = monster.MonsterName;
                if (s == "Garados" || s == "Turtok" || s == "Dragoran" || s == "Bisaflor" || s == "Glurak" || s == "Mewtu" || s == "Despotar" || s == "Knakrack")
                    effectiveMultiplier = 4.0f;
                else
                    effectiveMultiplier = 1.0f;
            }
            else if (BallType == "Netzball")
            {
                if (monster.ElementType == "Wasser")
                    effectiveMultiplier = 3.5f;
                else
                    effectiveMultiplier = 1.0f;
            }
            else if (BallType == "Finsterball")
            {
                if (monster.GlobalPosition.Y < 14f)
                    effectiveMultiplier = 3.0f;
                else
                    effectiveMultiplier = 1.0f;
            }
            else if (BallType == "Tauchball")
            {
                if (monster.ElementType == "Wasser")
                    effectiveMultiplier = 3.5f;
                else
                    effectiveMultiplier = 1.0f;
            }

            if (monster.TryCapture(effectiveMultiplier))
            {
                OnPokemonCaptured?.Invoke(monster.ToData());
                if (EffectsManager.Instance != null)
                {
                    EffectsManager.Instance.SpawnBlockBreakEffect(monster.GlobalPosition, Colors.Gold);
                    EffectsManager.Instance.PlaySoundEffect(1000.0f, 0.3f);
                }
                monster.QueueFree();
            }
            else
            {
                OnCaptureFeedback?.Invoke($"'{monster.MonsterName}' ist aus dem {BallType} ausgebrochen!");
                if (EffectsManager.Instance != null)
                {
                    EffectsManager.Instance.PlaySoundEffect(250.0f, 0.2f);
                }
            }
        }

        QueueFree();
    }
}
