using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

public partial class NpcTrainer : CharacterBody3D
{
    [Export] public string TrainerName = "Arenaleiter Rocko";
    [Export] public string Title = "Gestein-Arenaleiter";
    [Export] public string BadgeName = "Fels-Orden";

    public List<PokemonData> Team { get; private set; } = new List<PokemonData>();
    private Label3D _label = null!;

    public override void _Ready()
    {
        _label = new Label3D();
        _label.Billboard = BaseMaterial3D.BillboardModeEnum.Enabled;
        _label.PixelSize = 0.005f;
        _label.Position = new Vector3(0, 1.4f, 0);
        _label.FontSize = 24;
        _label.Text = $"🏆 {TrainerName}\n[{Title} | {BadgeName}]";
        _label.Modulate = Colors.Gold;
        AddChild(_label);

        if (Team.Count == 0)
        {
            SetupGymLeader(1);
        }
    }

    public void SetupGymLeader(int gymIndex)
    {
        Team.Clear();
        switch (gymIndex)
        {
            case 1:
                TrainerName = "Arenaleiter Rocko";
                Title = "Marmoria Arena (Gestein)";
                BadgeName = "Fels-Orden";
                Team.Add(new PokemonData("Despotar", 18, 65, "Gestein/Unlicht", Colors.SandyBrown));
                Team.Add(new PokemonData("Knakrack", 20, 70, "Drache/Boden", Colors.DarkSlateBlue));
                break;

            case 2:
                TrainerName = "Arenaleiterin Misty";
                Title = "Azuria Arena (Wasser)";
                BadgeName = "Quell-Orden";
                Team.Add(new PokemonData("Schillok", 22, 75, "Wasser", Colors.DeepSkyBlue));
                Team.Add(new PokemonData("Aquana", 24, 85, "Wasser", Colors.MediumPurple));
                break;

            case 3:
                TrainerName = "Arenaleiter Major Bob";
                Title = "Orania Arena (Elektro)";
                BadgeName = "Donner-Orden";
                Team.Add(new PokemonData("Raichu", 26, 90, "Elektro", Colors.Gold));
                Team.Add(new PokemonData("Blitza", 28, 95, "Elektro", Colors.Yellow));
                break;

            case 4:
                TrainerName = "Arenaleiterin Erika";
                Title = "Prismania Arena (Pflanze)";
                BadgeName = "Farb-Orden";
                Team.Add(new PokemonData("Bisaknosp", 30, 95, "Pflanze", Colors.ForestGreen));
                Team.Add(new PokemonData("Folipurba", 32, 100, "Pflanze", Colors.DarkSeaGreen));
                break;

            case 5:
                TrainerName = "Arenaleiter Koga";
                Title = "Fuchsania Arena (Gift/Geist)";
                BadgeName = "Seelen-Orden";
                Team.Add(new PokemonData("Gengar", 36, 110, "Geist/Gift", Colors.DarkMagenta));
                Team.Add(new PokemonData("Alpollo", 38, 115, "Geist/Gift", Colors.Purple));
                break;

            case 6:
                TrainerName = "Arenaleiterin Sabrina";
                Title = "Saffron Arena (Psycho)";
                BadgeName = "Sumpf-Orden";
                Team.Add(new PokemonData("Psiana", 42, 125, "Psycho", Colors.LightGreen));
                Team.Add(new PokemonData("Lucario", 44, 130, "Kampf/Stahl", Colors.DodgerBlue));
                break;

            case 7:
                TrainerName = "Arenaleiter Cinnabar";
                Title = "Cinnabar Arena (Feuer)";
                BadgeName = "Vulkan-Orden";
                Team.Add(new PokemonData("Glutexo", 48, 140, "Feuer", Colors.OrangeRed));
                Team.Add(new PokemonData("Flamara", 50, 150, "Feuer", Colors.Orange));
                break;

            case 8:
            default:
                TrainerName = "Arenaleiter Giovanni";
                Title = "Viridian Arena (Liga)";
                BadgeName = "Erd-Orden";
                Team.Add(new PokemonData("Despotar", 54, 160, "Gestein/Unlicht", Colors.DarkSlateGray));
                Team.Add(new PokemonData("Knakrack", 58, 175, "Drache/Boden", Colors.DarkSlateBlue));
                Team.Add(new PokemonData("Glurak", 60, 185, "Feuer/Flug", Colors.OrangeRed));
                break;
        }

        if (_label != null)
        {
            _label.Text = $"🏆 {TrainerName}\n[{Title} | {BadgeName}]";
        }
    }

    public void SetupEliteFour(int index)
    {
        Team.Clear();
        switch (index)
        {
            case 1:
                TrainerName = "Top Vier Lorelei";
                Title = "Liga-Palast (Eis/Wasser)";
                BadgeName = "Top-Vier 1";
                Team.Add(new PokemonData("Glaziola", 62, 190, "Eis", Colors.MediumTurquoise));
                Team.Add(new PokemonData("Aquana", 64, 200, "Wasser", Colors.MediumPurple));
                break;
            case 2:
                TrainerName = "Top Vier Bruno";
                Title = "Liga-Palast (Kampf/Gestein)";
                BadgeName = "Top-Vier 2";
                Team.Add(new PokemonData("Lucario", 65, 205, "Kampf/Stahl", Colors.DodgerBlue));
                Team.Add(new PokemonData("Despotar", 66, 210, "Gestein/Unlicht", Colors.SandyBrown));
                break;
            case 3:
                TrainerName = "Top Vier Agathe";
                Title = "Liga-Palast (Geist/Gift)";
                BadgeName = "Top-Vier 3";
                Team.Add(new PokemonData("Gengar", 67, 215, "Geist/Gift", Colors.DarkMagenta));
                Team.Add(new PokemonData("Mega-Gengar", 68, 220, "Geist/Gift", Colors.Purple));
                break;
            case 4:
            default:
                TrainerName = "Top Vier Siegfried";
                Title = "Liga-Palast (Drache)";
                BadgeName = "Top-Vier 4";
                Team.Add(new PokemonData("Knakrack", 70, 230, "Drache/Boden", Colors.DarkSlateBlue));
                Team.Add(new PokemonData("Dragoran", 72, 240, "Drache/Flug", Colors.DarkOliveGreen));
                Team.Add(new PokemonData("Mega-Knakrack", 75, 250, "Drache/Boden", Colors.Crimson));
                break;
        }

        if (_label != null)
        {
            _label.Text = $"🏆 {TrainerName}\n[{Title}]";
        }
    }

    public void SetupTrainerRed()
    {
        Team.Clear();
        TrainerName = "Legende Trainer RED";
        Title = "Silberberg-Gipfel";
        BadgeName = "Ultimativer Champ";

        Team.Add(new PokemonData("Raichu", 88, 280, "Elektro", Colors.Gold));
        Team.Add(new PokemonData("Mega-Glurak X", 86, 300, "Feuer/Drache", Colors.DarkGray));
        Team.Add(new PokemonData("Mega-Turtok", 85, 290, "Wasser", Colors.DeepSkyBlue));
        Team.Add(new PokemonData("Mega-Lucario", 85, 290, "Kampf/Stahl", Colors.DodgerBlue));
        Team.Add(new PokemonData("Psiana", 84, 280, "Psycho", Colors.LightGreen));
        Team.Add(new PokemonData("Metagross", 85, 295, "Stahl/Psycho", Colors.SteelBlue));

        if (_label != null)
        {
            _label.Text = $"👑 {TrainerName}\n[{Title}]";
            _label.Modulate = Colors.Crimson;
        }
    }

    public void SetupTeamRocketGrunt()
    {
        Team.Clear();
        TrainerName = "Team Rocket Rüpel";
        Title = "🌙 Nacht-Invasion";
        BadgeName = "Schatten-Herausforderung";

        Team.Add(new PokemonData("Alpollo", 35, 110, "Geist/Gift", Colors.Purple));
        Team.Add(new PokemonData("Nachtara", 38, 120, "Unlicht", Colors.MidnightBlue));
        Team.Add(new PokemonData("Garados", 40, 135, "Wasser/Flug", Colors.DarkBlue));

        if (_label != null)
        {
            _label.Text = $"☠️ {TrainerName}\n[{Title}]";
            _label.Modulate = Colors.Purple;
        }
    }

    public void SetupMoonlightChallenger()
    {
        Team.Clear();
        TrainerName = "Mondschein-Astronaut";
        Title = "🌟 Kosmisches Duell";
        BadgeName = "Mond-Abzeichen";

        Team.Add(new PokemonData("Psiana", 55, 160, "Psycho", Colors.LightPink));
        Team.Add(new PokemonData("Nachtara", 58, 175, "Unlicht", Colors.DeepSkyBlue));
        Team.Add(new PokemonData("Mewtu", 60, 200, "Psycho", Colors.MediumPurple));

        if (_label != null)
        {
            _label.Text = $"✨ {TrainerName}\n[{Title}]";
            _label.Modulate = Colors.Cyan;
        }
    }
}
