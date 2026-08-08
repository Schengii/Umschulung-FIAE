using Godot;
using System;

namespace MinecraftPokemon;

public partial class Pokeball : RigidBody3D
{
    public static event Action<string>? OnCaptureFeedback;
    public static event Action<PokemonData>? OnPokemonCaptured;

    public float CatchRateMultiplier { get; set; } = 1.0f;
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
            if (monster.TryCapture(CatchRateMultiplier))
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
                OnCaptureFeedback?.Invoke($"'{monster.MonsterName}' ist aus dem Pokeball ausgebrochen!");
                if (EffectsManager.Instance != null)
                {
                    EffectsManager.Instance.PlaySoundEffect(250.0f, 0.2f);
                }
            }
        }

        QueueFree();
    }
}
