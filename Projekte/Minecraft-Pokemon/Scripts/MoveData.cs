using Godot;

namespace MinecraftPokemon;

public enum MoveCategory
{
    Physical,
    Special,
    Status
}

public class MoveData
{
    public string Name { get; set; } = "Tackle";
    public string ElementType { get; set; } = "Normal";
    public MoveCategory Category { get; set; } = MoveCategory.Physical;
    public int Power { get; set; } = 35;
    public float Accuracy { get; set; } = 0.95f;
    public int MaxPp { get; set; } = 20;
    public int CurrentPp { get; set; } = 20;

    public StatusCondition InducesStatus { get; set; } = StatusCondition.None;
    public float StatusChance { get; set; } = 0.0f;
    public int HealPercentage { get; set; } = 0;
    public string BuffStat { get; set; } = "";
    public int BuffAmount { get; set; } = 0;

    public MoveData() { }

    public MoveData(string name, string type, int power, float accuracy = 0.95f, int maxPp = 20, MoveCategory category = MoveCategory.Physical, StatusCondition inducesStatus = StatusCondition.None, float statusChance = 0.0f, int healPercentage = 0, string buffStat = "", int buffAmount = 0)
    {
        Name = name;
        ElementType = type;
        Category = category;
        Power = power;
        Accuracy = accuracy;
        MaxPp = maxPp;
        CurrentPp = maxPp;
        InducesStatus = inducesStatus;
        StatusChance = statusChance;
        HealPercentage = healPercentage;
        BuffStat = buffStat;
        BuffAmount = buffAmount;
    }
}
