using Godot;
using System;

namespace MinecraftPokemon;

public partial class EffectsManager : Node
{
    public static EffectsManager Instance { get; private set; } = null!;

    public override void _Ready()
    {
        Instance = this;
    }

    public void SpawnBlockBreakEffect(Vector3 position, Color color)
    {
        var particles = new CpuParticles3D();
        particles.Position = position;
        particles.Amount = 16;
        particles.Lifetime = 0.4f;
        particles.OneShot = true;
        particles.Explosiveness = 1.0f;
        particles.Spread = 180.0f;
        particles.InitialVelocityMin = 2.0f;
        particles.InitialVelocityMax = 5.0f;

        var mesh = new BoxMesh();
        mesh.Size = new Vector3(0.12f, 0.12f, 0.12f);
        particles.Mesh = mesh;

        var mat = new StandardMaterial3D();
        mat.AlbedoColor = color;
        particles.MaterialOverride = mat;

        AddChild(particles);
        particles.Emitting = true;

        var timer = GetTree().CreateTimer(0.5f);
        timer.Timeout += () => particles.QueueFree();
    }

    public void SpawnFireworksEffect(Vector3 position)
    {
        var fireworks = new CpuParticles3D();
        fireworks.Position = position + new Vector3(0, 5, 0);
        fireworks.Amount = 40;
        fireworks.Lifetime = 1.2f;
        fireworks.OneShot = true;
        fireworks.Explosiveness = 0.9f;
        fireworks.Spread = 180.0f;
        fireworks.InitialVelocityMin = 8.0f;
        fireworks.InitialVelocityMax = 12.0f;

        var mesh = new BoxMesh();
        mesh.Size = new Vector3(0.18f, 0.18f, 0.18f);
        fireworks.Mesh = mesh;

        var mat = new StandardMaterial3D();
        mat.AlbedoColor = Colors.Gold;
        mat.EmissionEnabled = true;
        mat.Emission = Colors.OrangeRed;
        fireworks.MaterialOverride = mat;

        AddChild(fireworks);
        fireworks.Emitting = true;

        PlaySoundEffect(1200.0f, 0.5f);

        var timer = GetTree().CreateTimer(1.5f);
        timer.Timeout += () => fireworks.QueueFree();
    }

    public void PlayPokemonCry(string species)
    {
        float freq = species switch
        {
            "Pikachu" or "Raichu" => 900.0f,
            "Glumanda" or "Glutexo" or "Glurak" or "Flamara" => 450.0f,
            "Bisasam" or "Bisaknosp" or "Bisaflor" => 550.0f,
            "Schiggy" or "Schillok" or "Turtok" or "Aquana" => 650.0f,
            "Nachtara" or "Psiana" or "Evoli" or "Blitza" => 800.0f,
            "Garados" => 350.0f,
            "Mewtu" or "Zapdos" or "Arktos" => 1100.0f,
            _ => 600.0f
        };
        PlaySoundEffect(freq, 0.25f);
    }

    public void PlayBattleStartJingle()
    {
        PlaySoundEffect(523.25f, 0.1f); // C5
        GetTree().CreateTimer(0.12f).Timeout += () => PlaySoundEffect(659.25f, 0.1f); // E5
        GetTree().CreateTimer(0.24f).Timeout += () => PlaySoundEffect(783.99f, 0.2f); // G5
    }

    public void PlaySoundEffect(float frequency, float duration)
    {
        var player = new AudioStreamPlayer();
        var generator = new AudioStreamGenerator();
        generator.MixRate = 44100;

        player.Stream = generator;
        AddChild(player);
        player.Play();

        var playback = (AudioStreamGeneratorPlayback)player.GetStreamPlayback();
        int sampleCount = (int)(44100 * duration);
        float phase = 0.0f;
        float phaseInc = frequency / 44100.0f;

        for (int i = 0; i < sampleCount; i++)
        {
            float sample = Mathf.Sin(phase * Mathf.Tau);
            playback.PushFrame(new Vector2(sample, sample) * 0.2f);
            phase = (phase + phaseInc) % 1.0f;
        }

        var timer = GetTree().CreateTimer(duration + 0.1f);
        timer.Timeout += () =>
        {
            player.Stop();
            player.QueueFree();
        };
    }

    public void PlayJukeboxMusic()
    {
        PlayBattleStartJingle();
        GetTree().CreateTimer(0.35f).Timeout += () => PlaySoundEffect(880.0f, 0.3f);
        GetTree().CreateTimer(0.70f).Timeout += () => PlaySoundEffect(1046.50f, 0.4f);
    }

    public void SpawnAttackVfx(string moveType, Vector3 targetPos)
    {
        string type = moveType.ToLower();
        var particles = new CpuParticles3D();
        particles.Position = targetPos + new Vector3(0, 1.2f, 0);
        particles.Amount = 24;
        particles.Lifetime = 0.6f;
        particles.OneShot = true;
        particles.Explosiveness = 0.85f;
        particles.Spread = 180.0f;
        particles.InitialVelocityMin = 3.0f;
        particles.InitialVelocityMax = 7.0f;

        var mesh = new BoxMesh();
        mesh.Size = type == "feuer" ? new Vector3(0.2f, 0.4f, 0.2f) : (type == "eis" ? new Vector3(0.25f, 0.25f, 0.05f) : new Vector3(0.15f, 0.15f, 0.15f));
        particles.Mesh = mesh;

        Color color = type switch
        {
            "feuer" => Colors.OrangeRed,
            "wasser" => Colors.DeepSkyBlue,
            "elektro" => Colors.Gold,
            "eis" => Colors.LightCyan,
            "pflanze" => Colors.LimeGreen,
            "geist" or "gift" => Colors.DarkMagenta,
            "drache" => Colors.Crimson,
            _ => Colors.White
        };

        var mat = new StandardMaterial3D();
        mat.AlbedoColor = color;
        mat.EmissionEnabled = true;
        mat.Emission = color;
        particles.MaterialOverride = mat;

        AddChild(particles);
        particles.Emitting = true;

        float freq = type == "elektro" ? 1100.0f : (type == "feuer" ? 350.0f : (type == "wasser" ? 600.0f : 500.0f));
        PlaySoundEffect(freq, 0.25f);

        var timer = GetTree().CreateTimer(0.7f);
        timer.Timeout += () => particles.QueueFree();
    }

    private string _currentBgmTheme = "";
    public void PlayBgmTheme(string theme)
    {
        if (_currentBgmTheme == theme) return;
        _currentBgmTheme = theme;

        float[] notes = theme switch
        {
            "Kampf" => new float[] { 440.0f, 523.25f, 659.25f, 587.33f, 659.25f, 783.99f },
            "Hoehle" => new float[] { 220.0f, 261.63f, 329.63f, 293.66f },
            _ => new float[] { 523.25f, 659.25f, 783.99f, 1046.50f, 783.99f, 659.25f }
        };

        for (int i = 0; i < notes.Length; i++)
        {
            float note = notes[i];
            float delay = i * 0.25f;
            GetTree().CreateTimer(delay).Timeout += () => PlaySoundEffect(note, 0.2f);
        }
    }

    public void PlayBiomeAmbience(string biome)
    {
        float baseTone = biome switch
        {
            "Vulkan" => 150.0f,
            "Gebirge" => 880.0f,
            "Schnee" => 1200.0f,
            "Strand" => 330.0f,
            _ => 523.25f
        };
        PlaySoundEffect(baseTone, 0.4f);
    }

    public void PlayCustomSynthMelody()
    {
        float[] notes = new float[] { 523.25f, 587.33f, 659.25f, 698.46f, 783.99f, 880.0f, 987.77f, 1046.50f };
        for (int i = 0; i < notes.Length; i++)
        {
            float note = notes[i];
            float delay = i * 0.15f;
            GetTree().CreateTimer(delay).Timeout += () => PlaySoundEffect(note, 0.12f);
        }
    }
}
