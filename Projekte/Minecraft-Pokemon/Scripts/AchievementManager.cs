using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

/// <summary>Defines a single achievement milestone.</summary>
public class Achievement
{
    /// <summary>Unique identifier used for persistence.</summary>
    public string Id            { get; init; } = "";
    /// <summary>Display name shown in the achievements panel.</summary>
    public string Title         { get; init; } = "";
    /// <summary>Short description of how to earn this achievement.</summary>
    public string Description   { get; init; } = "";
    /// <summary>Emoji icon shown next to the title.</summary>
    public string Icon          { get; init; } = "🏅";
    /// <summary>Whether the player has unlocked this achievement.</summary>
    public bool   IsUnlocked    { get; set; }  = false;
    /// <summary>Timestamp of when the achievement was unlocked (UTC).</summary>
    public string UnlockedAt    { get; set; }  = "";
}

/// <summary>Snapshot of a single achievement's state for serialisation.</summary>
public class AchievementSaveEntry
{
    public string Id         { get; set; } = "";
    public bool   IsUnlocked { get; set; } = false;
    public string UnlockedAt { get; set; } = "";
}

/// <summary>
/// Manages the global achievement list, handles unlock logic,
/// fires <see cref="AchievementUnlocked"/> when a milestone is reached,
/// and provides save/load helpers.
/// </summary>
public static class AchievementManager
{
    /// <summary>All achievements tracked by the system.</summary>
    public static IReadOnlyList<Achievement> All => _achievements;
    private static readonly List<Achievement> _achievements = new List<Achievement>();

    /// <summary>Raised when an achievement is unlocked for the first time.</summary>
    public static event Action<Achievement>? AchievementUnlocked;

    static AchievementManager()
    {
        InitializeAchievements();
    }

    // ── Initialisation ─────────────────────────────────────────────────────────

    /// <summary>Populates the master achievement list.</summary>
    public static void InitializeAchievements()
    {
        _achievements.Clear();

        _achievements.Add(new Achievement
        {
            Id          = "first_catch",
            Title       = "Erster Fang!",
            Description = "Fange dein erstes Pokémon.",
            Icon        = "🎉"
        });

        _achievements.Add(new Achievement
        {
            Id          = "catch_10",
            Title       = "Sammler",
            Description = "Fange 10 verschiedene Pokémon.",
            Icon        = "🎒"
        });

        _achievements.Add(new Achievement
        {
            Id          = "catch_all",
            Title       = "Voxel-Pokédex vollständig!",
            Description = "Fange alle 25 Pokémon-Spezies.",
            Icon        = "📖"
        });

        _achievements.Add(new Achievement
        {
            Id          = "first_shiny",
            Title       = "Glanz im Voxel",
            Description = "Fange dein erstes Shiny-Pokémon.",
            Icon        = "✨"
        });

        _achievements.Add(new Achievement
        {
            Id          = "first_badge",
            Title       = "Arena-Debüt",
            Description = "Besiege deinen ersten Arenaleiter.",
            Icon        = "🏅"
        });

        _achievements.Add(new Achievement
        {
            Id          = "champion",
            Title       = "Pokémon-Champion!",
            Description = "Besiege alle Arenaleiter und die Elite Vier.",
            Icon        = "🏆"
        });

        _achievements.Add(new Achievement
        {
            Id          = "first_evolution",
            Title       = "Evolution!",
            Description = "Entwickle dein erstes Pokémon.",
            Icon        = "💥"
        });

        _achievements.Add(new Achievement
        {
            Id          = "first_mega",
            Title       = "Mega-Evolution!",
            Description = "Führe eine Mega-Evolution durch.",
            Icon        = "⚡"
        });

        _achievements.Add(new Achievement
        {
            Id          = "dynamax",
            Title       = "Dynamax-Power!",
            Description = "Setze Dynamax im Kampf ein.",
            Icon        = "🐉"
        });

        _achievements.Add(new Achievement
        {
            Id          = "hatch_egg",
            Title       = "Aus dem Ei geschlüpft",
            Description = "Brüte ein Pokémon-Ei aus.",
            Icon        = "🐣"
        });

        _achievements.Add(new Achievement
        {
            Id          = "legendary",
            Title       = "Legendenjäger",
            Description = "Fange ein legendäres Pokémon.",
            Icon        = "🌟"
        });

        _achievements.Add(new Achievement
        {
            Id          = "explorer_100",
            Title       = "Voxel-Entdecker",
            Description = "Erkunde 100 Chunks.",
            Icon        = "🗺"
        });

        _achievements.Add(new Achievement
        {
            Id          = "master_builder",
            Title       = "Master Builder",
            Description = "Platziere 500 Blöcke.",
            Icon        = "🧱"
        });

        _achievements.Add(new Achievement
        {
            Id          = "first_craft",
            Title       = "Handwerker",
            Description = "Craftte deinen ersten Gegenstand.",
            Icon        = "🛠"
        });

        _achievements.Add(new Achievement
        {
            Id          = "iron_pickaxe",
            Title       = "Eisenzeit",
            Description = "Stelle eine Eisen-Spitzhacke her.",
            Icon        = "⛏"
        });

        _achievements.Add(new Achievement
        {
            Id          = "masterball_obtained",
            Title       = "Meisterball!",
            Description = "Erhalte deinen ersten Meisterball.",
            Icon        = "⭐"
        });

        _achievements.Add(new Achievement
        {
            Id          = "multiplayer_host",
            Title       = "Gastgeber",
            Description = "Hoste deinen ersten Multiplayer-Server.",
            Icon        = "🌐"
        });
    }

    // ── Unlock ─────────────────────────────────────────────────────────────────

    /// <summary>
    /// Unlocks the achievement with the given <paramref name="id"/> if it has not
    /// been unlocked yet. Raises <see cref="AchievementUnlocked"/> on first unlock.
    /// </summary>
    /// <returns><c>true</c> if this was a fresh unlock; <c>false</c> if already unlocked.</returns>
    public static bool Unlock(string id)
    {
        var a = _achievements.Find(x => x.Id == id);
        if (a == null || a.IsUnlocked) return false;

        a.IsUnlocked = true;
        a.UnlockedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm");
        AchievementUnlocked?.Invoke(a);
        GD.Print($"[Achievement] 🏅 '{a.Title}' freigeschaltet!");
        return true;
    }

    /// <summary>Returns <c>true</c> if the achievement with <paramref name="id"/> has been unlocked.</summary>
    public static bool IsUnlocked(string id)
    {
        var a = _achievements.Find(x => x.Id == id);
        return a?.IsUnlocked ?? false;
    }

    // ── Persistence ────────────────────────────────────────────────────────────

    /// <summary>Creates a serialisable snapshot of all achievement states.</summary>
    public static List<AchievementSaveEntry> ToSaveEntries()
    {
        var entries = new List<AchievementSaveEntry>();
        foreach (var a in _achievements)
        {
            entries.Add(new AchievementSaveEntry
            {
                Id         = a.Id,
                IsUnlocked = a.IsUnlocked,
                UnlockedAt = a.UnlockedAt
            });
        }
        return entries;
    }

    /// <summary>
    /// Restores achievement state from <paramref name="entries"/>.
    /// Achievements not present in the list are left at their default (locked) state.
    /// </summary>
    public static void FromSaveEntries(List<AchievementSaveEntry>? entries)
    {
        if (entries == null) return;
        foreach (var entry in entries)
        {
            var a = _achievements.Find(x => x.Id == entry.Id);
            if (a == null) continue;
            a.IsUnlocked = entry.IsUnlocked;
            a.UnlockedAt = entry.UnlockedAt;
        }
    }

    /// <summary>Returns a formatted summary string for display in the HUD achievements panel.</summary>
    public static string BuildSummaryText()
    {
        int unlocked = _achievements.FindAll(a => a.IsUnlocked).Count;
        string text = $"=== VOXEL-ACHIEVEMENTS ({unlocked}/{_achievements.Count}) ===\n\n";
        foreach (var a in _achievements)
        {
            string mark = a.IsUnlocked ? $"✅ [{a.UnlockedAt}]" : "🔒";
            text += $"{a.Icon} {a.Title}: {a.Description}\n   {mark}\n\n";
        }
        return text;
    }
}
