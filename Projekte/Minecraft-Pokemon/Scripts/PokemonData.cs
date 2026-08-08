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

    // IVs (DVs: 0 - 31)
    public int IvHp { get; set; } = 15;
    public int IvAtk { get; set; } = 15;
    public int IvDef { get; set; } = 15;
    public int IvSpeed { get; set; } = 15;

    public int CurrentXp { get; set; } = 0;
    public int NextLevelXp { get; set; } = 50;

    public bool IsMegaEvolved { get; set; } = false;
    public bool IsShiny { get; set; } = false;
    public string HeldItem { get; set; } = "Keins";
    public StatusCondition Status { get; set; } = StatusCondition.None;
    public string Nature { get; set; } = "Hart";

    public List<MoveData> Moves { get; set; } = new List<MoveData>();

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

        // Randomize IVs
        IvHp = (int)(GD.Randi() % 32);
        IvAtk = (int)(GD.Randi() % 32);
        IvDef = (int)(GD.Randi() % 32);
        IvSpeed = (int)(GD.Randi() % 32);

        Speed = 10 + level * 2 + IvSpeed / 3;
        Defense = 8 + level * 2 + IvDef / 3;

        string[] natures = new string[] { "Hart", "Scheu", "Mäßig", "Froh", "Kühn" };
        Nature = natures[(int)(GD.Randi() % (uint)natures.Length)];

        if (IsShiny)
        {
            ThemeColor = GetShinyColor(species);
        }

        AssignDefaultMoves();
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
            CheckEvolution();
        }
        return leveledUp;
    }

    public bool CheckEvolution()
    {
        if (IsMegaEvolved || HeldItem == "Ewigstein") return false;
        string prevSpecies = Species;
        if (Species == "Bisasam" && Level >= 16) Species = "Bisaknosp";
        else if (Species == "Bisaknosp" && Level >= 32) Species = "Bisaflor";
        else if (Species == "Glumanda" && Level >= 16) Species = "Glutexo";
        else if (Species == "Glutexo" && Level >= 32) Species = "Glurak";
        else if (Species == "Schiggy" && Level >= 16) Species = "Schillok";
        else if (Species == "Schillok" && Level >= 32) Species = "Turtok";
        else if (Species == "Pikachu" && Level >= 22) Species = "Raichu";
        else if (Species == "Nebulak" && Level >= 25) Species = "Alpollo";
        else if (Species == "Alpollo" && Level >= 36) Species = "Gengar";

        if (Species != prevSpecies)
        {
            MaxHp += 15;
            CurrentHp = MaxHp;
            Speed += 5;
            Defense += 5;
            AssignDefaultMoves();
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
