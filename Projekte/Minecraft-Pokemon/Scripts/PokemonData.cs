using Godot;
using System.Collections.Generic;

namespace MinecraftPokemon;

public enum StatusCondition
{
    None,
    Burned,
    Paralyzed,
    Poisoned
}

public class PokemonData
{
    public string Species { get; set; } = "Pikachu";
    public int Level { get; set; } = 5;
    public int MaxHp { get; set; } = 20;
    public int CurrentHp { get; set; } = 20;
    public int Speed { get; set; } = 15;
    public int Defense { get; set; } = 10;
    public string ElementType { get; set; } = "Elektro";
    public Color ThemeColor { get; set; } = Colors.Yellow;

    // IVs (0 - 31)
    public int IvHp { get; set; } = 15;
    public int IvAtk { get; set; } = 15;
    public int IvDef { get; set; } = 15;
    public int IvSpAtk { get; set; } = 15;
    public int IvSpDef { get; set; } = 15;
    public int IvSpeed { get; set; } = 15;

    // EVs (0 - 252, Max 510 total)
    public int EvHp { get; set; } = 0;
    public int EvAtk { get; set; } = 0;
    public int EvDef { get; set; } = 0;
    public int EvSpAtk { get; set; } = 0;
    public int EvSpDef { get; set; } = 0;
    public int EvSpeed { get; set; } = 0;

    public int CurrentXp { get; set; } = 0;
    public int NextLevelXp { get; set; } = 50;

    public bool IsMegaEvolved { get; set; } = false;
    public bool IsShiny { get; set; } = false;
    public string HeldItem { get; set; } = "Keins";
    public StatusCondition Status { get; set; } = StatusCondition.None;
    public string Nature { get; set; } = "Hart";
    public List<MoveData> Moves { get; set; } = new List<MoveData>();

    // Friendship (0 - 255)
    public int Friendship { get; set; } = 70;

    // Contest Stats (0 - 255)
    public int Coolness { get; set; } = 10;
    public int Beauty { get; set; } = 10;
    public int Cuteness { get; set; } = 10;
    public int Cleverness { get; set; } = 10;
    public int Toughness { get; set; } = 10;
    public int ContestRibbons { get; set; } = 0;

    public bool IsDynamaxed { get; set; } = false;
    public int DynamaxTurns { get; set; } = 0;
    public bool IsTerastallized { get; set; } = false;
    public string TeraType { get; set; } = "Drache";
    public string Ability { get; set; } = "Notdünger";
    public string? PendingEvolutionTarget { get; set; } = null;
    public MoveData? PendingNewMove { get; set; } = null;

    public void IncreaseFriendship(int amount = 5)
    {
        Friendship = Math.Min(255, Friendship + amount);
    }

    public bool TriggerTerastallize(string? targetTeraType = null)
    {
        if (IsTerastallized) return false;
        IsTerastallized = true;
        if (!string.IsNullOrEmpty(targetTeraType)) TeraType = targetTeraType;
        ElementType = TeraType;
        return true;
    }

    public bool TriggerDynamax()
    {
        if (IsDynamaxed) return false;
        IsDynamaxed = true;
        DynamaxTurns = 3;
        MaxHp *= 2;
        CurrentHp *= 2;
        return true;
    }

    public PokemonData() { }

    public PokemonData(string species, int level, int maxHp, string elementType, Color themeColor, bool isShiny = false)
    {
        Species = species;
        Level = level;
        MaxHp = maxHp;
        CurrentHp = maxHp;
        ElementType = elementType;
        ThemeColor = themeColor;
        IsShiny = isShiny;
        NextLevelXp = level * 20 + 30;

        // Randomize IVs (using Random.Shared for test runtime safety)
        IvHp = Random.Shared.Next(0, 32);
        IvAtk = Random.Shared.Next(0, 32);
        IvDef = Random.Shared.Next(0, 32);
        IvSpAtk = Random.Shared.Next(0, 32);
        IvSpDef = Random.Shared.Next(0, 32);
        IvSpeed = Random.Shared.Next(0, 32);

        string[] natures = new string[] { "Hart", "Scheu", "Mäßig", "Froh", "Kühn", "Mutig", "Ruhig", "Sacht", "Pfiffig" };
        Nature = natures[Random.Shared.Next(0, natures.Length)];

        RecalculateStats();

        if (IsShiny)
        {
            ThemeColor = GetShinyColor(species);
        }

        AssignAbility();
        AssignDefaultMoves();
    }

    public void RecalculateStats()
    {
        float natureAtk = Nature == "Hart" || Nature == "Mutig" ? 1.1f : (Nature == "Mäßig" || Nature == "Scheu" ? 0.9f : 1.0f);
        float natureDef = Nature == "Kühn" || Nature == "Pfiffig" ? 1.1f : 1.0f;
        float natureSpeed = Nature == "Froh" || Nature == "Scheu" ? 1.1f : (Nature == "Mutig" || Nature == "Ruhig" ? 0.9f : 1.0f);

        int baseHp = 10 + Level * 2 + (IvHp / 2) + (EvHp / 8);
        if (MaxHp < baseHp) MaxHp = baseHp;
        Speed = (int)((10 + Level * 2 + (IvSpeed / 2) + (EvSpeed / 8)) * natureSpeed);
        Defense = (int)((8 + Level * 2 + (IvDef / 2) + (EvDef / 8)) * natureDef);
    }

    public void GainEv(string stat, int amount = 1)
    {
        int totalEvs = EvHp + EvAtk + EvDef + EvSpAtk + EvSpDef + EvSpeed;
        if (totalEvs >= 510) return;
        amount = Math.Min(amount, 510 - totalEvs);

        switch (stat.ToLower())
        {
            case "hp": EvHp = Math.Min(252, EvHp + amount); break;
            case "atk":
            case "attack": EvAtk = Math.Min(252, EvAtk + amount); break;
            case "def":
            case "defense": EvDef = Math.Min(252, EvDef + amount); break;
            case "spatk": EvSpAtk = Math.Min(252, EvSpAtk + amount); break;
            case "spdef": EvSpDef = Math.Min(252, EvSpDef + amount); break;
            case "speed":
            case "init": EvSpeed = Math.Min(252, EvSpeed + amount); break;
        }
        RecalculateStats();
    }

    public List<MoveData> GetLearnableMovesForLevel(int lvl)
    {
        var result = new List<MoveData>();
        if (Species == "Pikachu" && lvl == 10) result.Add(new MoveData("Ruckzuckhieb", "Normal", 40, 1.0f, 30, MoveCategory.Physical));
        if (Species == "Pikachu" && lvl == 20) result.Add(new MoveData("Donnerblitz", "Elektro", 90, 1.0f, 15, MoveCategory.Special, StatusCondition.Paralyzed, 0.1f));
        if (Species == "Glumanda" && lvl == 12) result.Add(new MoveData("Feuerzahn", "Feuer", 65, 0.95f, 15, MoveCategory.Physical, StatusCondition.Burned, 0.1f));
        if (Species == "Glumanda" && lvl == 25) result.Add(new MoveData("Flammenwurf", "Feuer", 90, 1.0f, 15, MoveCategory.Special, StatusCondition.Burned, 0.1f));
        if (Species == "Schiggy" && lvl == 15) result.Add(new MoveData("Aquawelle", "Wasser", 60, 1.0f, 20, MoveCategory.Special));
        if (Species == "Schiggy" && lvl == 28) result.Add(new MoveData("Surfer", "Wasser", 90, 1.0f, 15, MoveCategory.Special));
        if (Species == "Bisasam" && lvl == 15) result.Add(new MoveData("Gigasauger", "Pflanze", 75, 1.0f, 10, MoveCategory.Special, healPercentage: 30));
        if (Species == "Bisasam" && lvl == 28) result.Add(new MoveData("Solarstrahl", "Pflanze", 120, 1.0f, 10, MoveCategory.Special));
        if (Species == "Evoli" && lvl == 15) result.Add(new MoveData("Sternschauer", "Normal", 60, 1.0f, 20, MoveCategory.Special));
        return result;
    }

    public bool TeachMove(MoveData newMove, int replaceIndex = -1)
    {
        if (Moves.Exists(m => m.Name.Equals(newMove.Name, StringComparison.OrdinalIgnoreCase)))
            return false;

        if (Moves.Count < 4)
        {
            Moves.Add(newMove);
            return true;
        }

        if (replaceIndex >= 0 && replaceIndex < Moves.Count)
        {
            Moves[replaceIndex] = newMove;
            return true;
        }

        PendingNewMove = newMove;
        return false;
    }

    public void AssignAbility()
    {
        Ability = Species switch
        {
            "Bisasam" or "Bisaknosp" or "Bisaflor" or "Mega-Bisaflor" => "Notdünger",
            "Glumanda" or "Glutexo" or "Glurak" or "Mega-Glurak X" => "Großbrand",
            "Schiggy" or "Schillok" or "Turtok" or "Mega-Turtok" => "Sturzbach",
            "Pikachu" or "Raichu" => "Statik",
            "Garados" => "Bedroher",
            "Nebulak" or "Alpollo" or "Gengar" => "Schwebe",
            "Evoli" or "Aquana" or "Blitza" or "Flamara" or "Nachtara" or "Psiana" => "Synchro",
            "Lucario" => "Temposchub",
            "Knakrack" => "Bedroher",
            _ => "Notdünger"
        };
    }

    private Color GetShinyColor(string species)
    {
        return species switch
        {
            "Glurak" or "Mega-Glurak X" => Colors.DarkGray,
            "Pikachu" or "Raichu" => Colors.Gold,
            "Schiggy" or "Schillok" or "Turtok" => Colors.LimeGreen,
            "Garados" => Colors.Crimson,
            "Gengar" => Colors.DarkMagenta,
            "Dragoran" => Colors.DarkOliveGreen,
            "Nachtara" => Colors.DeepSkyBlue,
            "Psiana" => Colors.LightGreen,
            "Evoli" => Colors.Silver,
            "Aquana" => Colors.MediumPurple,
            "Blitza" => Colors.Lime,
            "Flamara" => Colors.Orange,
            "Lucario" => Colors.Gold,
            "Knakrack" => Colors.LightCyan,
            "Despotar" => Colors.SandyBrown,
            "Folipurba" => Colors.DarkSeaGreen,
            "Glaziola" => Colors.MediumTurquoise,
            "Lugia" => Colors.DarkRed,
            "Ho-Oh" => Colors.Gold,
            "Scherox" => Colors.LimeGreen,
            "Tauros" => Colors.SandyBrown,
            "Pinsir" => Colors.Purple,
            "Kangama" => Colors.DarkGray,
            "Metagross" => Colors.Gold,
            "Aagron" => Colors.LightSlateGray,
            "Kapoera" => Colors.SandyBrown,
            "Deoxys" or "Deoxys-Angriff" or "Deoxys-Verteidigung" or "Deoxys-Initiative" => Colors.YellowGreen,
            _ => Colors.LightPink
        };
    }

    public void AssignDefaultMoves()
    {
        Moves.Clear();
        Moves.Add(new MoveData("Tackle", "Normal", 35, 0.95f, 35, MoveCategory.Physical));

        switch (Species)
        {
            case "Pikachu":
                Moves.Add(new MoveData("Donnerschock", "Elektro", 40, 1.0f, 30, MoveCategory.Special));
                Moves.Add(new MoveData("Ruckzuckhieb", "Normal", 40, 1.0f, 30, MoveCategory.Physical));
                Moves.Add(new MoveData("Donnerwelle", "Elektro", 0, 0.90f, 20, MoveCategory.Status, StatusCondition.Paralyzed, 1.0f));
                break;
            case "Raichu":
                Moves.Add(new MoveData("Donner", "Elektro", 90, 0.75f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Donnerschock", "Elektro", 40, 1.0f, 30, MoveCategory.Special));
                Moves.Add(new MoveData("Agilität", "Normal", 0, 1.0f, 30, MoveCategory.Status, buffStat: "Speed", buffAmount: 2));
                break;
            case "Bisasam":
                Moves.Add(new MoveData("Rankenhieb", "Pflanze", 45, 1.0f, 25, MoveCategory.Physical));
                Moves.Add(new MoveData("Toxin", "Gift", 0, 0.90f, 10, MoveCategory.Status, StatusCondition.Poisoned, 1.0f));
                Moves.Add(new MoveData("Genesung", "Normal", 0, 1.0f, 10, MoveCategory.Status, healPercentage: 50));
                break;
            case "Bisaknosp":
                Moves.Add(new MoveData("Rasierblatt", "Pflanze", 55, 0.95f, 25, MoveCategory.Physical));
                Moves.Add(new MoveData("Toxin", "Gift", 0, 0.90f, 10, MoveCategory.Status, StatusCondition.Poisoned, 1.0f));
                Moves.Add(new MoveData("Genesung", "Normal", 0, 1.0f, 10, MoveCategory.Status, healPercentage: 50));
                break;
            case "Bisaflor":
            case "Mega-Bisaflor":
                Moves.Add(new MoveData("Giga-Sauger", "Pflanze", 75, 1.0f, 10, MoveCategory.Special, healPercentage: 30));
                Moves.Add(new MoveData("Solarstrahl", "Pflanze", 120, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Matschbombe", "Gift", 90, 1.0f, 10, MoveCategory.Special, StatusCondition.Poisoned, 0.3f));
                break;
            case "Glumanda":
                Moves.Add(new MoveData("Glut", "Feuer", 40, 1.0f, 25, MoveCategory.Special, StatusCondition.Burned, 0.1f));
                Moves.Add(new MoveData("Kratzer", "Normal", 40, 1.0f, 35, MoveCategory.Physical));
                Moves.Add(new MoveData("Schwerttanz", "Normal", 0, 1.0f, 20, MoveCategory.Status, buffStat: "Attack", buffAmount: 2));
                break;
            case "Glutexo":
                Moves.Add(new MoveData("Drachenwut", "Drache", 60, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Flammenwurf", "Feuer", 90, 1.0f, 15, MoveCategory.Special, StatusCondition.Burned, 0.1f));
                Moves.Add(new MoveData("Schwerttanz", "Normal", 0, 1.0f, 20, MoveCategory.Status, buffStat: "Attack", buffAmount: 2));
                break;
            case "Glurak":
            case "Mega-Glurak X":
                Moves.Add(new MoveData("Lohekanonade", "Feuer", 110, 0.90f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Flammenwurf", "Feuer", 90, 1.0f, 15, MoveCategory.Special, StatusCondition.Burned, 0.1f));
                Moves.Add(new MoveData("Drachenklaue", "Drache", 80, 1.0f, 15, MoveCategory.Physical));
                break;
            case "Schiggy":
                Moves.Add(new MoveData("Aquaknarre", "Wasser", 40, 1.0f, 25, MoveCategory.Special));
                Moves.Add(new MoveData("Panzerschutz", "Normal", 0, 1.0f, 40, MoveCategory.Status, buffStat: "Defense", buffAmount: 1));
                Moves.Add(new MoveData("Biss", "Unlicht", 60, 1.0f, 25, MoveCategory.Physical));
                break;
            case "Schillok":
                Moves.Add(new MoveData("Blubbstrahl", "Wasser", 65, 1.0f, 20, MoveCategory.Special));
                Moves.Add(new MoveData("Panzerschutz", "Normal", 0, 1.0f, 40, MoveCategory.Status, buffStat: "Defense", buffAmount: 1));
                Moves.Add(new MoveData("Biss", "Unlicht", 60, 1.0f, 25, MoveCategory.Physical));
                break;
            case "Turtok":
            case "Mega-Turtok":
                Moves.Add(new MoveData("Aquahaubitze", "Wasser", 110, 0.90f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Hydropumpe", "Wasser", 110, 0.80f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Eisstrahl", "Eis", 90, 1.0f, 10, MoveCategory.Special));
                break;
            case "Evoli":
                Moves.Add(new MoveData("Ruckzuckhieb", "Normal", 40, 1.0f, 30, MoveCategory.Physical));
                Moves.Add(new MoveData("Biss", "Unlicht", 60, 1.0f, 25, MoveCategory.Physical));
                Moves.Add(new MoveData("Agilität", "Normal", 0, 1.0f, 30, MoveCategory.Status, buffStat: "Speed", buffAmount: 2));
                break;
            case "Aquana":
                Moves.Add(new MoveData("Hydropumpe", "Wasser", 110, 0.80f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Säurepanzer", "Gift", 0, 1.0f, 20, MoveCategory.Status, buffStat: "Defense", buffAmount: 2));
                Moves.Add(new MoveData("Genesung", "Normal", 0, 1.0f, 10, MoveCategory.Status, healPercentage: 50));
                break;
            case "Blitza":
                Moves.Add(new MoveData("Donner", "Elektro", 110, 0.70f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Donnerwelle", "Elektro", 0, 0.90f, 20, MoveCategory.Status, StatusCondition.Paralyzed, 1.0f));
                Moves.Add(new MoveData("Agilität", "Normal", 0, 1.0f, 30, MoveCategory.Status, buffStat: "Speed", buffAmount: 2));
                break;
            case "Flamara":
                Moves.Add(new MoveData("Flammenwurf", "Feuer", 90, 1.0f, 15, MoveCategory.Special, StatusCondition.Burned, 0.1f));
                Moves.Add(new MoveData("Feuerzahn", "Feuer", 65, 0.95f, 15, MoveCategory.Physical, StatusCondition.Burned, 0.1f));
                Moves.Add(new MoveData("Schwerttanz", "Normal", 0, 1.0f, 20, MoveCategory.Status, buffStat: "Attack", buffAmount: 2));
                break;
            case "Nebulak":
            case "Alpollo":
                Moves.Add(new MoveData("Spukball", "Geist", 80, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Hypnose", "Psycho", 0, 0.60f, 20, MoveCategory.Status, StatusCondition.Paralyzed, 1.0f));
                Moves.Add(new MoveData("Matschbombe", "Gift", 90, 1.0f, 10, MoveCategory.Special, StatusCondition.Poisoned, 0.3f));
                break;
            case "Gengar":
                Moves.Add(new MoveData("Schattenball", "Geist", 80, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Matschbombe", "Gift", 90, 1.0f, 10, MoveCategory.Special, StatusCondition.Poisoned, 0.3f));
                Moves.Add(new MoveData("Finsteraura", "Unlicht", 80, 1.0f, 15, MoveCategory.Special));
                break;
            case "Garados":
                Moves.Add(new MoveData("Hyperstrahl", "Normal", 150, 0.90f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Nassschweif", "Wasser", 90, 0.90f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Eiszahn", "Eis", 65, 0.95f, 15, MoveCategory.Physical));
                break;
            case "Dragoran":
                Moves.Add(new MoveData("Wutanfall", "Drache", 120, 1.0f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Drachenklaue", "Drache", 80, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Feuersturm", "Feuer", 110, 0.85f, 5, MoveCategory.Special));
                break;
            case "Nachtara":
                Moves.Add(new MoveData("Finsteraura", "Unlicht", 80, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Spukball", "Geist", 80, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Genesung", "Normal", 0, 1.0f, 10, MoveCategory.Status, healPercentage: 50));
                break;
            case "Psiana":
                Moves.Add(new MoveData("Psychokinese", "Psycho", 90, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Zauberschein", "Fee", 80, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Genesung", "Normal", 0, 1.0f, 10, MoveCategory.Status, healPercentage: 50));
                break;
            case "Mewtu":
                Moves.Add(new MoveData("Psycho-Stoß", "Psycho", 100, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Psychokinese", "Psycho", 90, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Spukball", "Geist", 80, 1.0f, 15, MoveCategory.Special));
                break;
            case "Arktos":
                Moves.Add(new MoveData("Eisstrahl", "Eis", 90, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Blizzard", "Eis", 110, 0.70f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Orkan", "Flug", 110, 0.70f, 10, MoveCategory.Special));
                break;
            case "Zapdos":
                Moves.Add(new MoveData("Donner", "Elektro", 110, 0.70f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Bohrschnabel", "Flug", 80, 1.0f, 20, MoveCategory.Physical));
                Moves.Add(new MoveData("Hitzewelle", "Feuer", 95, 0.90f, 10, MoveCategory.Special));
                break;
            case "Lucario":
                Moves.Add(new MoveData("Aurasphäre", "Kampf", 90, 1.0f, 20, MoveCategory.Special));
                Moves.Add(new MoveData("Patronenhieb", "Stahl", 40, 1.0f, 30, MoveCategory.Physical));
                Moves.Add(new MoveData("Nahkampf", "Kampf", 120, 1.0f, 5, MoveCategory.Physical));
                break;
            case "Knakrack":
                Moves.Add(new MoveData("Erdbeben", "Boden", 100, 1.0f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Drachenklaue", "Drache", 80, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Steinhagel", "Gestein", 75, 0.90f, 10, MoveCategory.Physical));
                break;
            case "Despotar":
                Moves.Add(new MoveData("Steinkante", "Gestein", 100, 0.80f, 5, MoveCategory.Physical));
                Moves.Add(new MoveData("Knirscher", "Unlicht", 80, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Erdbeben", "Boden", 100, 1.0f, 10, MoveCategory.Physical));
                break;
            case "Folipurba":
                Moves.Add(new MoveData("Laubklinge", "Pflanze", 90, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Ruckzuckhieb", "Normal", 40, 1.0f, 30, MoveCategory.Physical));
                Moves.Add(new MoveData("Schwerttanz", "Normal", 0, 1.0f, 20, MoveCategory.Status, buffStat: "Attack", buffAmount: 2));
                break;
            case "Glaziola":
                Moves.Add(new MoveData("Eisstrahl", "Eis", 90, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Spukball", "Geist", 80, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Blizzard", "Eis", 110, 0.70f, 5, MoveCategory.Special));
                break;
            case "Lugia":
                Moves.Add(new MoveData("Luftstoß", "Flug", 100, 0.95f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Psychokinese", "Psycho", 90, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Hydropumpe", "Wasser", 110, 0.80f, 5, MoveCategory.Special));
                break;
            case "Ho-Oh":
                Moves.Add(new MoveData("Läuterfeuer", "Feuer", 100, 0.95f, 5, MoveCategory.Physical, StatusCondition.Burned, 0.5f));
                Moves.Add(new MoveData("Sturzflug", "Flug", 120, 1.0f, 5, MoveCategory.Physical));
                Moves.Add(new MoveData("Solarstrahl", "Pflanze", 120, 1.0f, 10, MoveCategory.Special));
                break;
            case "Amonitas":
                Moves.Add(new MoveData("Aquaknarre", "Wasser", 40, 1.0f, 25, MoveCategory.Special));
                Moves.Add(new MoveData("Antik-Kraft", "Gestein", 60, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Hydropumpe", "Wasser", 110, 0.80f, 5, MoveCategory.Special));
                break;
            case "Kabuto":
                Moves.Add(new MoveData("Kratzer", "Normal", 40, 1.0f, 35, MoveCategory.Physical));
                Moves.Add(new MoveData("Antik-Kraft", "Gestein", 60, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Aquawelle", "Wasser", 60, 1.0f, 20, MoveCategory.Special));
                break;
            case "Aerodactyl":
                Moves.Add(new MoveData("Steinhagel", "Gestein", 75, 0.90f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Flügelschlag", "Flug", 60, 1.0f, 35, MoveCategory.Physical));
                Moves.Add(new MoveData("Hyperstrahl", "Normal", 150, 0.90f, 5, MoveCategory.Special));
                break;
            case "Mega-Lucario":
                Moves.Add(new MoveData("Aurasphäre", "Kampf", 100, 1.0f, 20, MoveCategory.Special));
                Moves.Add(new MoveData("Nahkampf", "Kampf", 130, 1.0f, 5, MoveCategory.Physical));
                Moves.Add(new MoveData("Patronenhieb", "Stahl", 50, 1.0f, 30, MoveCategory.Physical));
                break;
            case "Mega-Knakrack":
                Moves.Add(new MoveData("Erdbeben", "Boden", 120, 1.0f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Drachenklaue", "Drache", 95, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Steinkante", "Gestein", 100, 0.80f, 5, MoveCategory.Physical));
                break;
            case "Mega-Despotar":
                Moves.Add(new MoveData("Steinkante", "Gestein", 110, 0.85f, 5, MoveCategory.Physical));
                Moves.Add(new MoveData("Knirscher", "Unlicht", 95, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Erdbeben", "Boden", 110, 1.0f, 10, MoveCategory.Physical));
                break;
            case "Mega-Garados":
                Moves.Add(new MoveData("Nassschweif", "Wasser", 110, 0.90f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Knirscher", "Unlicht", 95, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Hyperstrahl", "Normal", 150, 0.90f, 5, MoveCategory.Special));
                break;
            case "Mega-Gengar":
                Moves.Add(new MoveData("Schattenball", "Geist", 100, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Matschbombe", "Gift", 100, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Finsteraura", "Unlicht", 90, 1.0f, 15, MoveCategory.Special));
                break;
            case "Rayquaza":
            case "Mega-Rayquaza":
                Moves.Add(new MoveData("Zenitstürmer", "Flug", 120, 1.0f, 5, MoveCategory.Physical));
                Moves.Add(new MoveData("Drachenpuls", "Drache", 85, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Turbotempo", "Normal", 80, 1.0f, 5, MoveCategory.Physical));
                break;
            case "Groudon":
            case "Proto-Groudon":
                Moves.Add(new MoveData("Abgrundsklingen", "Boden", 120, 0.85f, 5, MoveCategory.Physical));
                Moves.Add(new MoveData("Eruptionswelle", "Feuer", 110, 0.90f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Solarstrahl", "Pflanze", 120, 1.0f, 10, MoveCategory.Special));
                break;
            case "Kyogre":
            case "Proto-Kyogre":
                Moves.Add(new MoveData("Ursprungswoge", "Wasser", 120, 0.85f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Eisstrahl", "Eis", 90, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Donner", "Elektro", 110, 0.70f, 10, MoveCategory.Special));
                break;
            case "Scherox":
                Moves.Add(new MoveData("Patronenhieb", "Stahl", 50, 1.0f, 30, MoveCategory.Physical));
                Moves.Add(new MoveData("Kreuzschere", "Käfer", 80, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Schwerttanz", "Normal", 0, 1.0f, 20, MoveCategory.Status, buffStat: "Attack", buffAmount: 2));
                break;
            case "Tauros":
                Moves.Add(new MoveData("Bodycheck", "Normal", 90, 0.85f, 20, MoveCategory.Physical));
                Moves.Add(new MoveData("Erdbeben", "Boden", 100, 1.0f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Steinhagel", "Gestein", 75, 0.90f, 10, MoveCategory.Physical));
                break;
            case "Pinsir":
                Moves.Add(new MoveData("Kreuzschere", "Käfer", 80, 1.0f, 15, MoveCategory.Physical));
                Moves.Add(new MoveData("Geowurf", "Kampf", 60, 1.0f, 20, MoveCategory.Physical));
                Moves.Add(new MoveData("Kraftkoloss", "Kampf", 120, 0.90f, 5, MoveCategory.Physical));
                break;
            case "Kangama":
                Moves.Add(new MoveData("Rumpfstoß", "Normal", 70, 1.0f, 25, MoveCategory.Physical));
                Moves.Add(new MoveData("Irrschlag", "Normal", 100, 0.75f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Knirscher", "Unlicht", 80, 1.0f, 15, MoveCategory.Physical));
                break;
            case "Metagross":
                Moves.Add(new MoveData("Sternenhieb", "Stahl", 90, 0.90f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Psychokinese", "Psycho", 90, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Erdbeben", "Boden", 100, 1.0f, 10, MoveCategory.Physical));
                break;
            case "Aagron":
                Moves.Add(new MoveData("Rammboss", "Stahl", 100, 1.0f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Steinkante", "Gestein", 100, 0.80f, 5, MoveCategory.Physical));
                Moves.Add(new MoveData("Drachenklaue", "Drache", 80, 1.0f, 15, MoveCategory.Physical));
                break;
            case "Kapoera":
                Moves.Add(new MoveData("Dreifachkick", "Kampf", 60, 0.90f, 10, MoveCategory.Physical));
                Moves.Add(new MoveData("Nahkampf", "Kampf", 120, 1.0f, 5, MoveCategory.Physical));
                Moves.Add(new MoveData("Turbodreher", "Normal", 50, 1.0f, 40, MoveCategory.Physical));
                break;
            case "Mega-Mewtu X":
                Moves.Add(new MoveData("Aurasphäre", "Kampf", 120, 1.0f, 15, MoveCategory.Special));
                Moves.Add(new MoveData("Psycho-Stoß", "Psycho", 110, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Nahkampf", "Kampf", 130, 1.0f, 5, MoveCategory.Physical));
                break;
            case "Mega-Mewtu Y":
                Moves.Add(new MoveData("Psycho-Stoß", "Psycho", 130, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Psychokinese", "Psycho", 100, 1.0f, 10, MoveCategory.Special));
                Moves.Add(new MoveData("Spukball", "Geist", 90, 1.0f, 15, MoveCategory.Special));
                break;
            case "Deoxys":
            case "Deoxys-Angriff":
            case "Deoxys-Verteidigung":
            case "Deoxys-Initiative":
                Moves.Add(new MoveData("Psyschub", "Psycho", 140, 0.90f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Hyperstrahl", "Normal", 150, 0.90f, 5, MoveCategory.Special));
                Moves.Add(new MoveData("Turbotempo", "Normal", 80, 1.0f, 5, MoveCategory.Physical));
                break;
        }
    }

    public bool TriggerMegaEvolution()
    {
        if (IsMegaEvolved) return false;

        if (Species == "Glurak") Species = "Mega-Glurak X";
        else if (Species == "Bisaflor") Species = "Mega-Bisaflor";
        else if (Species == "Turtok") Species = "Mega-Turtok";
        else if (Species == "Mewtu") Species = GD.Randf() < 0.5f ? "Mega-Mewtu X" : "Mega-Mewtu Y";
        else if (Species == "Lucario") Species = "Mega-Lucario";
        else if (Species == "Knakrack") Species = "Mega-Knakrack";
        else if (Species == "Despotar") Species = "Mega-Despotar";
        else if (Species == "Garados") Species = "Mega-Garados";
        else if (Species == "Gengar") Species = "Mega-Gengar";
        else if (Species == "Rayquaza") Species = "Mega-Rayquaza";
        else if (Species == "Groudon") Species = "Proto-Groudon";
        else if (Species == "Kyogre") Species = "Proto-Kyogre";
        else return false;

        IsMegaEvolved = true;
        MaxHp += 50;
        CurrentHp = MaxHp;
        Speed += 20;
        Defense += 20;
        AssignDefaultMoves();
        return true;
    }

    public bool ApplyVitamin(string vitamin)
    {
        switch (vitamin)
        {
            case "KP-Plus":
                MaxHp += 10;
                CurrentHp += 10;
                IvHp = Math.Min(31, IvHp + 5);
                return true;
            case "Protein":
                IvAtk = Math.Min(31, IvAtk + 5);
                return true;
            case "Eisen":
                Defense += 5;
                IvDef = Math.Min(31, IvDef + 5);
                return true;
            case "Karbon":
                Speed += 5;
                IvSpeed = Math.Min(31, IvSpeed + 5);
                return true;
            default:
                return false;
        }
    }

    public bool GainXp(int amount)
    {
        if (HeldItem == "Glücks-Ei") amount *= 2;
        CurrentXp += amount;
        bool leveledUp = false;
        if (CurrentXp >= NextLevelXp)
        {
            CurrentXp -= NextLevelXp;
            Level++;
            MaxHp += 5;
            CurrentHp = MaxHp;
            Speed += 2;
            Defense += 2;
            NextLevelXp = Level * 20 + 30;
            leveledUp = true;
            RecalculateStats();
            var learnable = GetLearnableMovesForLevel(Level);
            if (learnable.Count > 0)
            {
                foreach (var move in learnable)
                {
                    TeachMove(move);
                }
            }
            CheckEvolution();
        }
        return leveledUp;
    }

    public string? GetEvolutionTarget()
    {
        if (IsMegaEvolved || HeldItem == "Ewigstein") return null;
        if (Species == "Bisasam" && Level >= 16) return "Bisaknosp";
        if (Species == "Bisaknosp" && Level >= 32) return "Bisaflor";
        if (Species == "Glumanda" && Level >= 16) return "Glutexo";
        if (Species == "Glutexo" && Level >= 32) return "Glurak";
        if (Species == "Schiggy" && Level >= 16) return "Schillok";
        if (Species == "Schillok" && Level >= 32) return "Turtok";
        if (Species == "Pikachu" && Level >= 22) return "Raichu";
        if (Species == "Nebulak" && Level >= 25) return "Alpollo";
        if (Species == "Alpollo" && Level >= 36) return "Gengar";
        return null;
    }

    public void CompleteEvolution(string targetSpecies)
    {
        Species = targetSpecies;
        MaxHp += 15;
        CurrentHp = MaxHp;
        Speed += 5;
        Defense += 5;
        AssignAbility();
        AssignDefaultMoves();
        PendingEvolutionTarget = null;
    }

    public bool CheckEvolution()
    {
        string? target = GetEvolutionTarget();
        if (target != null)
        {
            PendingEvolutionTarget = target;
            return true;
        }
        return false;
    }

    public void HealAll()
    {
        CurrentHp = MaxHp;
        Status = StatusCondition.None;
        foreach (var move in Moves)
        {
            move.CurrentPp = move.MaxPp;
        }
    }

    public bool ApplyEvolutionStone(string stone)
    {
        if (IsMegaEvolved || HeldItem == "Ewigstein") return false;
        string prev = Species;

        if (stone == "Donnerstein" && Species == "Pikachu") Species = "Raichu";
        else if (stone == "Wasserstein" && Species == "Schiggy") Species = "Schillok";
        else if (stone == "Wasserstein" && Species == "Schillok") Species = "Turtok";
        else if (stone == "Feuerstein" && Species == "Glumanda") Species = "Glutexo";
        else if (stone == "Feuerstein" && Species == "Glutexo") Species = "Glurak";
        else if (stone == "Wasserstein" && Species == "Evoli") { Species = "Aquana"; ElementType = "Wasser"; ThemeColor = Colors.DeepSkyBlue; }
        else if (stone == "Donnerstein" && Species == "Evoli") { Species = "Blitza"; ElementType = "Elektro"; ThemeColor = Colors.Yellow; }
        else if (stone == "Feuerstein" && Species == "Evoli") { Species = "Flamara"; ElementType = "Feuer"; ThemeColor = Colors.OrangeRed; }

        if (Species != prev)
        {
            MaxHp += 20;
            CurrentHp = MaxHp;
            Speed += 5;
            Defense += 5;
            AssignDefaultMoves();
            return true;
        }
        return false;
    }
}
