using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

/// <summary>Snapshot of a quest's current state for serialisation.</summary>
public class QuestSaveEntry
{
    public string Id              { get; set; } = "";
    public int    CurrentProgress { get; set; } = 0;
    public bool   IsCompleted     { get; set; } = false;
}

/// <summary>Runtime descriptor of a quest.</summary>
public class QuestData
{
    public string Id              { get; set; } = "";
    public string Title           { get; set; } = "";
    public string Description     { get; set; } = "";
    public int    TargetAmount    { get; set; } = 1;
    public int    CurrentProgress { get; set; } = 0;
    public bool   IsCompleted     { get; set; } = false;
    public string RewardText      { get; set; } = "";
}

/// <summary>
/// Manages all quest state: initialisation, progress tracking,
/// save/load integration and event broadcasting.
/// </summary>
public static class QuestManager
{
    /// <summary>All quests currently tracked by the system.</summary>
    public static List<QuestData> ActiveQuests { get; private set; } = new List<QuestData>();

    /// <summary>Raised when a quest is completed, passing the completion message.</summary>
    public static event Action<string>? QuestCompleted;

    static QuestManager()
    {
        InitializeQuests();
    }

    // ── Initialisation ─────────────────────────────────────────────────────────

    /// <summary>Resets and populates the master quest list.</summary>
    public static void InitializeQuests()
    {
        ActiveQuests.Clear();

        ActiveQuests.Add(new QuestData
        {
            Id           = "berries",
            Title        = "🌾 Beeren-Ernte",
            Description  = "Ernte 5 Beeren vom Farmland im Voxel-Dorf.",
            TargetAmount = 5,
            RewardText   = "2x Sonderbonbon (+Level)"
        });

        ActiveQuests.Add(new QuestData
        {
            Id           = "gyms",
            Title        = "🏆 Arenaleiter-Herausforderung",
            Description  = "Siege in mindestens 3 Voxel-Arenen und verdiene Orden.",
            TargetAmount = 3,
            RewardText   = "1x Meisterball + TM24 Donnerblitz"
        });

        ActiveQuests.Add(new QuestData
        {
            Id           = "boss",
            Title        = "🐉 Legenden-Jäger",
            Description  = "Besiege oder fange ein legendäres Boss-Pokémon im Dungeon.",
            TargetAmount = 1,
            RewardText   = "1x Glücks-Ei + 1000 XP"
        });

        ActiveQuests.Add(new QuestData
        {
            Id           = "breeding",
            Title        = "🐣 Zucht-Meister",
            Description  = "Züchte und brüte 1 Ei in der Pokémon-Pension aus.",
            TargetAmount = 1,
            RewardText   = "1x Ewigstein + 2x Hyperball"
        });

        ActiveQuests.Add(new QuestData
        {
            Id           = "catch10",
            Title        = "🎯 Sammler-Anfänger",
            Description  = "Fange insgesamt 10 Pokémon.",
            TargetAmount = 10,
            RewardText   = "5x Superball + 1x Hyperball"
        });

        ActiveQuests.Add(new QuestData
        {
            Id           = "shiny",
            Title        = "✨ Glänzende Aussichten",
            Description  = "Fange 1 Shiny-Pokémon.",
            TargetAmount = 1,
            RewardText   = "1x Meisterball + 1x Glücks-Ei"
        });
    }

    // ── Progress ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Advances quest <paramref name="questId"/> by <paramref name="amount"/> steps.
    /// Returns <c>true</c> and sets <paramref name="completionMsg"/> when the quest
    /// transitions to completed.
    /// </summary>
    public static bool ProgressQuest(string questId, int amount, out string completionMsg)
    {
        completionMsg = "";
        foreach (var q in ActiveQuests)
        {
            if (q.Id == questId && !q.IsCompleted)
            {
                q.CurrentProgress = Math.Min(q.TargetAmount, q.CurrentProgress + amount);
                if (q.CurrentProgress >= q.TargetAmount)
                {
                    q.IsCompleted  = true;
                    completionMsg  = $"🎉 QUEST ABGESCHLOSSEN: '{q.Title}'! Belohnung: {q.RewardText}";
                    QuestCompleted?.Invoke(completionMsg);
                    return true;
                }
            }
        }
        return false;
    }

    // ── Persistence ────────────────────────────────────────────────────────────

    /// <summary>Creates a serialisable snapshot of the current quest state.</summary>
    public static List<QuestSaveEntry> ToSaveEntries()
    {
        var entries = new List<QuestSaveEntry>();
        foreach (var q in ActiveQuests)
        {
            entries.Add(new QuestSaveEntry
            {
                Id              = q.Id,
                CurrentProgress = q.CurrentProgress,
                IsCompleted     = q.IsCompleted
            });
        }
        return entries;
    }

    /// <summary>
    /// Restores quest progress from the supplied <paramref name="entries"/>.
    /// Quests not found in <paramref name="entries"/> are left at their default state.
    /// </summary>
    public static void FromSaveEntries(List<QuestSaveEntry>? entries)
    {
        if (entries == null) return;
        foreach (var entry in entries)
        {
            var q = ActiveQuests.Find(x => x.Id == entry.Id);
            if (q == null) continue;
            q.CurrentProgress = entry.CurrentProgress;
            q.IsCompleted     = entry.IsCompleted;
        }
    }
}
