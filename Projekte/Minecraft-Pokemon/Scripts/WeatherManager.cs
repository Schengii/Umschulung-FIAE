using Godot;
using System;

namespace MinecraftPokemon;

public enum WeatherType
{
    Clear,
    Rain,
    Snow,
    Sandstorm,
    VolcanoAsh
}

public partial class WeatherManager : Node
{
    public static WeatherManager Instance { get; private set; } = null!;
    public WeatherType CurrentWeather { get; private set; } = WeatherType.Clear;

    private float _timer = 0.0f;
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
        if (_timer >= 40.0f)
        {
            _timer = 0.0f;
            float roll = GD.Randf();
            CurrentWeather = roll < 0.35f ? WeatherType.Clear : (roll < 0.6f ? WeatherType.Rain : (roll < 0.8f ? WeatherType.Snow : (roll < 0.9f ? WeatherType.Sandstorm : WeatherType.VolcanoAsh)));
            ApplyWeatherEffects();
        }
    }

    private void ApplyWeatherEffects()
    {
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
                _weatherParticles.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.DarkGray, EmissionEnabled = true, Emission = Colors.OrangeRed };
                break;
        }
    }
}
