using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

public class QuestData
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int TargetAmount { get; set; } = 1;
    public int CurrentProgress { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public string RewardText { get; set; } = "";
}

public static class QuestManager
{
    public static List<QuestData> ActiveQuests { get; private set; } = new List<QuestData>();

    static QuestManager()
    {
        InitializeQuests();
    }

    public static void InitializeQuests()
    {
        ActiveQuests.Clear();
        ActiveQuests.Add(new QuestData
        {
            Id = "berries",
            Title = "🌾 Beeren-Ernte",
            Description = "Ernte 5 Beeren vom Farmland im Voxel-Dorf.",
            TargetAmount = 5,
            RewardText = "2x Sonderbonbon (+Level)"
        });

        ActiveQuests.Add(new QuestData
        {
            Id = "gyms",
            Title = "🏆 Arenaleiter-Herausforderung",
            Description = "Siege in mindestens 3 Voxel-Arenen und verdiene Orden.",
            TargetAmount = 3,
            RewardText = "1x Meisterball + TM24 Donnerblitz"
        });

        ActiveQuests.Add(new QuestData
        {
            Id = "boss",
            Title = "🐉 Legenden-Jäger",
            Description = "Besiege oder fange ein legendäres Boss-Pokémon im Dungeon.",
            TargetAmount = 1,
            RewardText = "1x Glücks-Ei + 1000 XP"
        });

        ActiveQuests.Add(new QuestData
        {
            Id = "breeding",
            Title = "🐣 Zucht-Meister",
            Description = "Züchte und brüte 1 Ei in der Pokémon-Pension aus.",
            TargetAmount = 1,
            RewardText = "1x Ewigstein + 2x Hyperball"
        });
    }

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
                    q.IsCompleted = true;
                    completionMsg = $"🎉 QUEST ABGESCHLOSSEN: '{q.Title}'! Belohnung: {q.RewardText}";
                    return true;
                }
            }
        }
        return false;
    }
}
