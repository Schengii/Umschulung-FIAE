using Godot;
using System;

namespace MinecraftPokemon;

/// <summary>All possible weather states in the Voxel-Pokémon world.</summary>
public enum WeatherType
{
    Clear,
    Rain,
    Snow,
    Sandstorm,
    VolcanoAsh,
    Thunderstorm,
    HeavyFog
}

public enum SeasonType
{
    Spring,
    Summer,
    Autumn,
    Winter
}

/// <summary>
/// Manages the dynamic weather cycle and seasonal progression, emits <see cref="WeatherChanged"/>
/// and <see cref="SeasonChanged"/> events.
/// </summary>
public partial class WeatherManager : Node
{
    public static WeatherManager Instance { get; private set; } = null!;

    /// <summary>Raised whenever the weather changes. Subscribers receive the new <see cref="WeatherType"/>.</summary>
    public event Action<WeatherType>? WeatherChanged;

    /// <summary>Raised whenever the season changes. Subscribers receive the new <see cref="SeasonType"/>.</summary>
    public event Action<SeasonType>? SeasonChanged;

    public WeatherType CurrentWeather { get; private set; } = WeatherType.Clear;
    public SeasonType CurrentSeason { get; private set; } = SeasonType.Spring;

    // Internal timer that controls how often weather rolls
    private const float WeatherCycleDuration = 40.0f;
    private const float SeasonCycleDuration = 120.0f;
    private float _timer = 0.0f;
    private float _seasonTimer = 0.0f;
    private CpuParticles3D _weatherParticles = null!;

    public override void _Ready()
    {
        Instance = this;

        _weatherParticles = new CpuParticles3D();
        _weatherParticles.Amount = 120;
        _weatherParticles.Lifetime = 1.5f;
        _weatherParticles.Mesh = new BoxMesh { Size = new Vector3(0.06f, 0.25f, 0.06f) };
        _weatherParticles.Direction = new Vector3(0, -1, 0);
        _weatherParticles.Spread = 20.0f;
        _weatherParticles.InitialVelocityMin = 8.0f;
        _weatherParticles.Emitting = false;
        AddChild(_weatherParticles);
    }

    public override void _Process(double delta)
    {
        _timer += (float)delta;
        if (_timer >= WeatherCycleDuration)
        {
            _timer = 0.0f;
            float roll = (float)Random.Shared.NextDouble();
            WeatherType next = roll < 0.35f ? WeatherType.Clear :
                               roll < 0.55f ? WeatherType.Rain :
                               roll < 0.70f ? WeatherType.Snow :
                               roll < 0.80f ? WeatherType.Sandstorm :
                               roll < 0.90f ? WeatherType.Thunderstorm :
                                              WeatherType.VolcanoAsh;
            SetWeather(next);
        }

        _seasonTimer += (float)delta;
        if (_seasonTimer >= SeasonCycleDuration)
        {
            _seasonTimer = 0.0f;
            SeasonType nextSeason = CurrentSeason switch
            {
                SeasonType.Spring => SeasonType.Summer,
                SeasonType.Summer => SeasonType.Autumn,
                SeasonType.Autumn => SeasonType.Winter,
                SeasonType.Winter => SeasonType.Spring,
                _ => SeasonType.Spring
            };
            SetSeason(nextSeason);
        }
    }

    /// <summary>Sets the active season and triggers <see cref="SeasonChanged"/>.</summary>
    public void SetSeason(SeasonType season)
    {
        if (CurrentSeason == season) return;
        CurrentSeason = season;
        SeasonChanged?.Invoke(CurrentSeason);
        GD.Print($"[WeatherManager] 🍂 Jahreszeit wechselt zu: {CurrentSeason}");
    }

    /// <summary>
    /// Forcefully sets the weather to <paramref name="weather"/>,
    /// updates particles, and fires <see cref="WeatherChanged"/>.
    /// </summary>
    public void SetWeather(WeatherType weather)
    {
        if (CurrentWeather == weather) return; // No-op if unchanged
        CurrentWeather = weather;
        ApplyWeatherEffects();
        WeatherChanged?.Invoke(CurrentWeather);
        GD.Print($"[WeatherManager] Weather → {CurrentWeather}");
    }

    private void ApplyWeatherEffects()
    {
        if (_weatherParticles == null) return;

        switch (CurrentWeather)
        {
            case WeatherType.Clear:
                _weatherParticles.Emitting = false;
                break;

            case WeatherType.Rain:
                _weatherParticles.Emitting = true;
                _weatherParticles.Direction = new Vector3(0, -1, 0);
                _weatherParticles.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.DeepSkyBlue };
                break;

            case WeatherType.Snow:
                _weatherParticles.Emitting = true;
                _weatherParticles.Direction = new Vector3(0, -1, 0);
                _weatherParticles.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.White };
                break;

            case WeatherType.Sandstorm:
                _weatherParticles.Emitting = true;
                _weatherParticles.Direction = new Vector3(1, -0.2f, 0.5f);
                _weatherParticles.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.SandyBrown };
                break;

            case WeatherType.VolcanoAsh:
                _weatherParticles.Emitting = true;
                _weatherParticles.Direction = new Vector3(0.2f, -1, 0.2f);
                _weatherParticles.MaterialOverride = new StandardMaterial3D
                {
                    AlbedoColor = Colors.DarkGray,
                    EmissionEnabled = true,
                    Emission = Colors.OrangeRed
                };
                break;

            case WeatherType.Thunderstorm:
                _weatherParticles.Emitting = true;
                _weatherParticles.Direction = new Vector3(0.1f, -1, 0.1f);
                _weatherParticles.MaterialOverride = new StandardMaterial3D
                {
                    AlbedoColor = Colors.DarkBlue,
                    EmissionEnabled = true,
                    Emission = Colors.Gold
                };
                break;

            case WeatherType.HeavyFog:
                _weatherParticles.Emitting = true;
                _weatherParticles.Direction = new Vector3(0, 0, 0);
                _weatherParticles.MaterialOverride = new StandardMaterial3D { AlbedoColor = new Color(0.9f, 0.9f, 0.95f, 0.4f) };
                break;
        }
    }
}
