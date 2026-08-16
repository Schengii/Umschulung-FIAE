using Godot;
using System;

namespace MinecraftPokemon;

public partial class Monster : CharacterBody3D
{
    [Export] public string MonsterName = "Pikachu";
    [Export] public int Level = 5;
    [Export] public int MaxHp = 20;
    public int CurrentHp;

    [Export] public string ElementType = "Elektro";
    [Export] public Color ThemeColor = Colors.Yellow;
    [Export] public bool IsShiny = false;
    [Export] public string Nature = "Hart";

    [Export] public float Speed = 2.5f;
    [Export] public float WanderingTime = 3.0f;

    public bool IsCompanion = false;
    public Node3D? TargetCompanionOwner;

    private float _timer = 0.0f;
    private Vector3 _targetDirection = Vector3.Zero;
    private float _gravity = ProjectSettings.GetSetting("physics/3d/default_gravity").AsSingle();
    private Label3D _infoLabel = null!;
    private OmniLight3D? _glowLight;

    public override void _Ready()
    {
        if (CurrentHp <= 0) CurrentHp = MaxHp;

        if (!IsCompanion && GD.Randf() < 0.08f)
        {
            IsShiny = true;
        }

        SetupInfoLabel();
        BuildSpeciesModel();
        ChooseNewState();
    }

    public void SetupFromData(PokemonData data, bool isCompanion = true, Node3D? owner = null)
    {
        MonsterName = data.Species;
        Level = data.Level;
        MaxHp = data.MaxHp;
        CurrentHp = data.CurrentHp;
        ElementType = data.ElementType;
        ThemeColor = data.ThemeColor;
        IsShiny = data.IsShiny;
        Nature = data.Nature;
        IsCompanion = isCompanion;
        TargetCompanionOwner = owner;

        BuildSpeciesModel();
        UpdateInfoLabel();
    }

    private void SetupInfoLabel()
    {
        _infoLabel = new Label3D();
        _infoLabel.Billboard = BaseMaterial3D.BillboardModeEnum.Enabled;
        _infoLabel.PixelSize = 0.005f;
        _infoLabel.Position = new Vector3(0, 1.7f, 0);
        _infoLabel.FontSize = 24;
        AddChild(_infoLabel);
        UpdateInfoLabel();
    }

    public void UpdateInfoLabel()
    {
        if (_infoLabel != null)
        {
            string shinyTag = IsShiny ? "✨ SHINY " : "";
            string prefix = IsCompanion ? "[Begleiter] " : (MonsterName.StartsWith("Mega-") || MonsterName == "Mewtu" || MonsterName == "Zapdos" || MonsterName == "Arktos" ? "💥 LEGENDÄR " : "");
            _infoLabel.Text = $"{shinyTag}{prefix}{MonsterName} (Lv.{Level} | {Nature})\n[{ElementType}] HP: {CurrentHp}/{MaxHp}";
            _infoLabel.Modulate = IsShiny ? Colors.Gold : ThemeColor;
        }
    }

    public void BuildSpeciesModel()
    {
        Node3D? visuals = GetNodeOrNull<Node3D>("Visuals");
        if (visuals == null) return;

        foreach (Node child in visuals.GetChildren())
        {
            if (child.Name != "Body") child.QueueFree();
        }

        if (IsShiny)
        {
            var shinySparkles = new CpuParticles3D();
            shinySparkles.Position = new Vector3(0, 0.5f, 0);
            shinySparkles.Amount = 16;
            shinySparkles.Lifetime = 0.6f;
            shinySparkles.Mesh = new BoxMesh { Size = new Vector3(0.08f, 0.08f, 0.08f) };
            shinySparkles.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.Gold, EmissionEnabled = true, Emission = Colors.Gold };
            shinySparkles.Spread = 180.0f;
            visuals.AddChild(shinySparkles);
        }

        // Add OmniLight3D for glowing species
        if (MonsterName == "Nachtara" || MonsterName == "Glurak" || MonsterName == "Mega-Glurak X" || MonsterName == "Mewtu" || MonsterName == "Zapdos")
        {
            _glowLight = new OmniLight3D();
            _glowLight.OmniRange = 4.0f;
            _glowLight.LightEnergy = 1.5f;
            _glowLight.LightColor = MonsterName == "Mega-Glurak X" ? Colors.DeepSkyBlue : (MonsterName == "Mewtu" ? Colors.MediumOrchid : Colors.Orange);
            visuals.AddChild(_glowLight);
        }

        AddFacialFeatures(visuals);

        switch (MonsterName)
        {
            case "Evoli":
                ThemeColor = IsShiny ? Colors.Silver : new Color(0.68f, 0.45f, 0.22f);
                ElementType = "Normal";

                var evoliEars = new MeshInstance3D();
                evoliEars.Mesh = new BoxMesh { Size = new Vector3(0.12f, 0.4f, 0.1f) };
                evoliEars.Position = new Vector3(-0.2f, 0.65f, 0.1f);
                evoliEars.RotationDegrees = new Vector3(0, 0, -20);
                evoliEars.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = ThemeColor });
                visuals.AddChild(evoliEars);

                var evoliEarsR = new MeshInstance3D();
                evoliEarsR.Mesh = evoliEars.Mesh;
                evoliEarsR.Position = new Vector3(0.2f, 0.65f, 0.1f);
                evoliEarsR.RotationDegrees = new Vector3(0, 0, 20);
                evoliEarsR.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = ThemeColor });
                visuals.AddChild(evoliEarsR);
                break;

            case "Aquana":
                ThemeColor = IsShiny ? Colors.MediumPurple : new Color(0.15f, 0.55f, 0.85f);
                ElementType = "Wasser";

                var aFin = new MeshInstance3D();
                aFin.Mesh = new BoxMesh { Size = new Vector3(0.4f, 0.5f, 0.1f) };
                aFin.Position = new Vector3(0, 0.7f, -0.1f);
                aFin.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.LightSkyBlue });
                visuals.AddChild(aFin);
                break;

            case "Blitza":
                ThemeColor = IsShiny ? Colors.Lime : Colors.Yellow;
                ElementType = "Elektro";

                var bSpikes = new MeshInstance3D();
                bSpikes.Mesh = new BoxMesh { Size = new Vector3(0.6f, 0.3f, 0.3f) };
                bSpikes.Position = new Vector3(0, 0.5f, -0.2f);
                bSpikes.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.White });
                visuals.AddChild(bSpikes);
                break;

            case "Flamara":
                ThemeColor = IsShiny ? Colors.Orange : Colors.OrangeRed;
                ElementType = "Feuer";

                var fMane = new MeshInstance3D();
                fMane.Mesh = new BoxMesh { Size = new Vector3(0.55f, 0.4f, 0.4f) };
                fMane.Position = new Vector3(0, 0.45f, 0.1f);
                fMane.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Yellow });
                visuals.AddChild(fMane);
                break;

            case "Lucario":
                ThemeColor = IsShiny ? Colors.Gold : new Color(0.2f, 0.4f, 0.75f);
                ElementType = "Kampf/Stahl";

                var lChestSpike = new MeshInstance3D();
                lChestSpike.Mesh = new BoxMesh { Size = new Vector3(0.1f, 0.1f, 0.2f) };
                lChestSpike.Position = new Vector3(0, 0.5f, 0.35f);
                lChestSpike.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.White });
                visuals.AddChild(lChestSpike);
                break;

            case "Knakrack":
                ThemeColor = IsShiny ? Colors.LightCyan : new Color(0.15f, 0.25f, 0.55f);
                ElementType = "Drache/Boden";
                MaxHp = 135;

                var kFins = new MeshInstance3D();
                kFins.Mesh = new BoxMesh { Size = new Vector3(1.1f, 0.4f, 0.15f) };
                kFins.Position = new Vector3(0, 0.6f, -0.1f);
                kFins.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkSlateBlue });
                visuals.AddChild(kFins);
                break;

            case "Despotar":
                ThemeColor = IsShiny ? Colors.SandyBrown : new Color(0.35f, 0.55f, 0.25f);
                ElementType = "Gestein/Unlicht";
                MaxHp = 140;

                var dArmor = new MeshInstance3D();
                dArmor.Mesh = new BoxMesh { Size = new Vector3(0.7f, 0.8f, 0.7f) };
                dArmor.Position = new Vector3(0, 0.5f, 0);
                dArmor.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = ThemeColor });
                visuals.AddChild(dArmor);
                break;

            case "Folipurba":
                ThemeColor = IsShiny ? Colors.DarkSeaGreen : new Color(0.85f, 0.9f, 0.65f);
                ElementType = "Pflanze";

                var fLeafTail = new MeshInstance3D();
                fLeafTail.Mesh = new BoxMesh { Size = new Vector3(0.12f, 0.5f, 0.12f) };
                fLeafTail.Position = new Vector3(0, 0.6f, -0.4f);
                fLeafTail.RotationDegrees = new Vector3(30, 0, 0);
                fLeafTail.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.ForestGreen });
                visuals.AddChild(fLeafTail);
                break;

            case "Glaziola":
                ThemeColor = IsShiny ? Colors.MediumTurquoise : new Color(0.55f, 0.85f, 0.95f);
                ElementType = "Eis";

                var gIceCrest = new MeshInstance3D();
                gIceCrest.Mesh = new BoxMesh { Size = new Vector3(0.3f, 0.4f, 0.1f) };
                gIceCrest.Position = new Vector3(0, 0.65f, 0.2f);
                gIceCrest.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Cyan });
                visuals.AddChild(gIceCrest);
                break;

            case "Lugia":
                ThemeColor = IsShiny ? Colors.Crimson : Colors.Snow;
                ElementType = "Psycho/Flug";
                MaxHp = 180;

                var lWings = new MeshInstance3D();
                lWings.Mesh = new BoxMesh { Size = new Vector3(1.6f, 0.45f, 0.1f) };
                lWings.Position = new Vector3(0, 0.7f, -0.2f);
                lWings.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.RoyalBlue });
                visuals.AddChild(lWings);
                break;

            case "Ho-Oh":
                ThemeColor = IsShiny ? Colors.Gold : Colors.OrangeRed;
                ElementType = "Feuer/Flug";
                MaxHp = 180;

                var hFeathers = new MeshInstance3D();
                hFeathers.Mesh = new BoxMesh { Size = new Vector3(1.7f, 0.5f, 0.12f) };
                hFeathers.Position = new Vector3(0, 0.75f, -0.2f);
                hFeathers.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Gold });
                visuals.AddChild(hFeathers);
                break;

            case "Amonitas":
                ThemeColor = new Color(0.85f, 0.75f, 0.55f);
                ElementType = "Gestein/Wasser";

                var shell = new MeshInstance3D();
                shell.Mesh = new BoxMesh { Size = new Vector3(0.5f, 0.5f, 0.5f) };
                shell.Position = new Vector3(0, 0.5f, -0.1f);
                shell.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Burlywood });
                visuals.AddChild(shell);
                break;

            case "Kabuto":
                ThemeColor = new Color(0.45f, 0.3f, 0.15f);
                ElementType = "Gestein/Wasser";

                var dome = new MeshInstance3D();
                dome.Mesh = new BoxMesh { Size = new Vector3(0.6f, 0.35f, 0.6f) };
                dome.Position = new Vector3(0, 0.35f, 0);
                dome.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.SaddleBrown });
                visuals.AddChild(dome);
                break;

            case "Aerodactyl":
                ThemeColor = Colors.SlateGray;
                ElementType = "Gestein/Flug";
                MaxHp = 140;

                var aWings = new MeshInstance3D();
                aWings.Mesh = new BoxMesh { Size = new Vector3(1.5f, 0.35f, 0.1f) };
                aWings.Position = new Vector3(0, 0.65f, -0.2f);
                aWings.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkOrchid });
                visuals.AddChild(aWings);
                break;

            case "Mega-Lucario":
                ThemeColor = new Color(0.15f, 0.35f, 0.85f);
                ElementType = "Kampf/Stahl";

                var mSpikes = new CpuParticles3D();
                mSpikes.Position = new Vector3(0, 0.5f, 0);
                mSpikes.Amount = 20;
                mSpikes.Lifetime = 0.5f;
                mSpikes.Mesh = new BoxMesh { Size = new Vector3(0.12f, 0.12f, 0.12f) };
                mSpikes.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.DodgerBlue, EmissionEnabled = true, Emission = Colors.DodgerBlue };
                visuals.AddChild(mSpikes);
                break;

            case "Mega-Knakrack":
                ThemeColor = new Color(0.1f, 0.2f, 0.5f);
                ElementType = "Drache/Boden";

                var mKnakFins = new MeshInstance3D();
                mKnakFins.Mesh = new BoxMesh { Size = new Vector3(1.4f, 0.5f, 0.2f) };
                mKnakFins.Position = new Vector3(0, 0.7f, -0.1f);
                mKnakFins.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Crimson });
                visuals.AddChild(mKnakFins);
                break;

            case "Mega-Despotar":
                ThemeColor = new Color(0.3f, 0.5f, 0.2f);
                ElementType = "Gestein/Unlicht";

                var mDespSpikes = new MeshInstance3D();
                mDespSpikes.Mesh = new BoxMesh { Size = new Vector3(0.85f, 0.95f, 0.85f) };
                mDespSpikes.Position = new Vector3(0, 0.55f, 0);
                mDespSpikes.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkGreen });
                visuals.AddChild(mDespSpikes);
                break;

            case "Mega-Garados":
                ThemeColor = new Color(0.1f, 0.15f, 0.35f);
                ElementType = "Wasser/Unlicht";

                var mGarSpikes = new MeshInstance3D();
                mGarSpikes.Mesh = new BoxMesh { Size = new Vector3(0.5f, 0.8f, 1.0f) };
                mGarSpikes.Position = new Vector3(0, 0.85f, 0.1f);
                mGarSpikes.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Crimson });
                visuals.AddChild(mGarSpikes);
                break;

            case "Mega-Gengar":
                ThemeColor = new Color(0.8f, 0.9f, 0.95f);
                ElementType = "Geist/Gift";

                var mGenSpikes = new CpuParticles3D();
                mGenSpikes.Position = new Vector3(0, 0.4f, 0);
                mGenSpikes.Amount = 24;
                mGenSpikes.Lifetime = 0.5f;
                mGenSpikes.Mesh = new BoxMesh { Size = new Vector3(0.12f, 0.12f, 0.12f) };
                mGenSpikes.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.GhostWhite, EmissionEnabled = true, Emission = Colors.Purple };
                visuals.AddChild(mGenSpikes);
                break;

            case "Mega-Mewtu X":
                ThemeColor = Colors.MediumOrchid;
                ElementType = "Psycho/Kampf";
                MaxHp = 220;

                var mxArms = new MeshInstance3D();
                mxArms.Mesh = new BoxMesh { Size = new Vector3(0.9f, 0.4f, 0.4f) };
                mxArms.Position = new Vector3(0, 0.7f, 0.2f);
                mxArms.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkMagenta, EmissionEnabled = true, Emission = Colors.Magenta });
                visuals.AddChild(mxArms);
                break;

            case "Mega-Mewtu Y":
                ThemeColor = Colors.Lavender;
                ElementType = "Psycho";
                MaxHp = 210;

                var myTailHead = new MeshInstance3D();
                myTailHead.Mesh = new BoxMesh { Size = new Vector3(0.3f, 0.7f, 0.3f) };
                myTailHead.Position = new Vector3(0, 0.85f, -0.3f);
                myTailHead.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Plum, EmissionEnabled = true, Emission = Colors.DeepSkyBlue });
                visuals.AddChild(myTailHead);
                break;

            case "Rayquaza":
            case "Mega-Rayquaza":
                ThemeColor = MonsterName == "Mega-Rayquaza" ? Colors.DarkGreen : Colors.MediumSeaGreen;
                ElementType = "Drache/Flug";
                MaxHp = 220;

                var rSerpent = new MeshInstance3D();
                rSerpent.Mesh = new BoxMesh { Size = new Vector3(0.4f, 1.8f, 0.4f) };
                rSerpent.Position = new Vector3(0, 0.9f, 0);
                rSerpent.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = ThemeColor, EmissionEnabled = true, Emission = Colors.LimeGreen });
                visuals.AddChild(rSerpent);
                break;

            case "Groudon":
            case "Proto-Groudon":
                ThemeColor = MonsterName == "Proto-Groudon" ? Colors.Crimson : Colors.Firebrick;
                ElementType = "Boden/Feuer";
                MaxHp = 220;

                var gArmor = new MeshInstance3D();
                gArmor.Mesh = new BoxMesh { Size = new Vector3(1.2f, 1.2f, 1.2f) };
                gArmor.Position = new Vector3(0, 0.6f, 0);
                gArmor.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = ThemeColor, EmissionEnabled = true, Emission = Colors.OrangeRed });
                visuals.AddChild(gArmor);
                break;

            case "Kyogre":
            case "Proto-Kyogre":
                ThemeColor = MonsterName == "Proto-Kyogre" ? Colors.DeepSkyBlue : Colors.MediumBlue;
                ElementType = "Wasser";
                MaxHp = 220;

                var kFinsLarge = new MeshInstance3D();
                kFinsLarge.Mesh = new BoxMesh { Size = new Vector3(1.8f, 0.4f, 1.2f) };
                kFinsLarge.Position = new Vector3(0, 0.5f, 0);
                kFinsLarge.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = ThemeColor, EmissionEnabled = true, Emission = Colors.Cyan });
                visuals.AddChild(kFinsLarge);
                break;

            case "Scherox":
                ThemeColor = IsShiny ? Colors.LimeGreen : Colors.Crimson;
                ElementType = "Käfer/Stahl";
                MaxHp = 130;

                var sPincers = new MeshInstance3D();
                sPincers.Mesh = new BoxMesh { Size = new Vector3(0.8f, 0.3f, 0.3f) };
                sPincers.Position = new Vector3(0, 0.55f, 0.3f);
                sPincers.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkSlateGray });
                visuals.AddChild(sPincers);
                break;

            case "Tauros":
                ThemeColor = IsShiny ? Colors.SandyBrown : new Color(0.6f, 0.4f, 0.2f);
                ElementType = "Normal";

                var tHorns = new MeshInstance3D();
                tHorns.Mesh = new BoxMesh { Size = new Vector3(0.9f, 0.15f, 0.15f) };
                tHorns.Position = new Vector3(0, 0.7f, 0.3f);
                tHorns.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Ivory });
                visuals.AddChild(tHorns);
                break;

            case "Pinsir":
                ThemeColor = IsShiny ? Colors.Purple : Colors.SaddleBrown;
                ElementType = "Käfer";

                var pHornsBig = new MeshInstance3D();
                pHornsBig.Mesh = new BoxMesh { Size = new Vector3(0.5f, 0.6f, 0.2f) };
                pHornsBig.Position = new Vector3(0, 0.85f, 0);
                pHornsBig.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Beige });
                visuals.AddChild(pHornsBig);
                break;

            case "Kangama":
                ThemeColor = IsShiny ? Colors.DarkGray : Colors.Sienna;
                ElementType = "Normal";
                MaxHp = 145;

                var kPouch = new MeshInstance3D();
                kPouch.Mesh = new BoxMesh { Size = new Vector3(0.4f, 0.4f, 0.2f) };
                kPouch.Position = new Vector3(0, 0.4f, 0.3f);
                kPouch.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkKhaki });
                visuals.AddChild(kPouch);
                break;

            case "Deoxys":
            case "Deoxys-Angriff":
            case "Deoxys-Verteidigung":
            case "Deoxys-Initiative":
                ThemeColor = IsShiny ? Colors.YellowGreen : Colors.OrangeRed;
                ElementType = "Psycho";
                MaxHp = 180;

                var dCore = new MeshInstance3D();
                dCore.Mesh = new BoxMesh { Size = new Vector3(0.35f, 0.35f, 0.35f) };
                dCore.Position = new Vector3(0, 0.6f, 0.1f);
                dCore.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Cyan, EmissionEnabled = true, Emission = Colors.DeepSkyBlue });
                visuals.AddChild(dCore);
                break;

            case "Metagross":
                ThemeColor = IsShiny ? Colors.Gold : Colors.LightSteelBlue;
                ElementType = "Stahl/Psycho";
                MaxHp = 160;

                var mCross = new MeshInstance3D();
                mCross.Mesh = new BoxMesh { Size = new Vector3(0.8f, 0.8f, 0.8f) };
                mCross.Position = new Vector3(0, 0.5f, 0);
                mCross.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.SteelBlue, EmissionEnabled = true, Emission = Colors.Cyan });
                visuals.AddChild(mCross);
                break;

            case "Aagron":
                ThemeColor = IsShiny ? Colors.LightSlateGray : Colors.SlateGray;
                ElementType = "Stahl/Gestein";
                MaxHp = 165;

                var aArmor = new MeshInstance3D();
                aArmor.Mesh = new BoxMesh { Size = new Vector3(0.85f, 0.85f, 0.85f) };
                aArmor.Position = new Vector3(0, 0.55f, 0);
                aArmor.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Silver });
                visuals.AddChild(aArmor);
                break;

            case "Kapoera":
                ThemeColor = IsShiny ? Colors.SandyBrown : Colors.Chocolate;
                ElementType = "Kampf";

                var kTop = new MeshInstance3D();
                kTop.Mesh = new BoxMesh { Size = new Vector3(0.3f, 0.5f, 0.3f) };
                kTop.Position = new Vector3(0, 0.6f, 0);
                kTop.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkOrange });
                visuals.AddChild(kTop);
                break;

            case "Nachtara":
                ThemeColor = IsShiny ? Colors.DeepSkyBlue : new Color(0.12f, 0.12f, 0.15f);
                ElementType = "Unlicht";

                var nRings = new MeshInstance3D();
                nRings.Mesh = new BoxMesh { Size = new Vector3(0.25f, 0.25f, 0.25f) };
                nRings.Position = new Vector3(0, 0.6f, 0.2f);
                nRings.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Yellow, EmissionEnabled = true, Emission = Colors.Yellow });
                visuals.AddChild(nRings);
                break;

            case "Psiana":
                ThemeColor = IsShiny ? Colors.LightGreen : new Color(0.85f, 0.65f, 0.85f);
                ElementType = "Psycho";

                var pGem = new MeshInstance3D();
                pGem.Mesh = new BoxMesh { Size = new Vector3(0.12f, 0.12f, 0.08f) };
                pGem.Position = new Vector3(0, 0.65f, 0.31f);
                pGem.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Crimson, EmissionEnabled = true, Emission = Colors.Crimson });
                visuals.AddChild(pGem);
                break;

            case "Garados":
                ThemeColor = IsShiny ? Colors.Crimson : new Color(0.15f, 0.5f, 0.85f);
                ElementType = "Wasser/Flug";
                MaxHp = 120;

                var gCrest = new MeshInstance3D();
                gCrest.Mesh = new BoxMesh { Size = new Vector3(0.3f, 0.6f, 0.8f) };
                gCrest.Position = new Vector3(0, 0.8f, 0.1f);
                gCrest.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.LightYellow });
                visuals.AddChild(gCrest);
                break;

            case "Gengar":
                ThemeColor = IsShiny ? Colors.MediumVioletRed : new Color(0.45f, 0.2f, 0.6f);
                ElementType = "Geist/Gift";
                MaxHp = 100;

                var gSpikes = new MeshInstance3D();
                gSpikes.Mesh = new BoxMesh { Size = new Vector3(0.5f, 0.4f, 0.2f) };
                gSpikes.Position = new Vector3(0, 0.5f, -0.35f);
                gSpikes.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = ThemeColor });
                visuals.AddChild(gSpikes);
                break;

            case "Dragoran":
                ThemeColor = IsShiny ? Colors.DarkOliveGreen : new Color(0.95f, 0.65f, 0.2f);
                ElementType = "Drache/Flug";
                MaxHp = 130;

                var dWingL = new MeshInstance3D();
                dWingL.Mesh = new BoxMesh { Size = new Vector3(0.5f, 0.35f, 0.06f) };
                dWingL.Position = new Vector3(-0.4f, 0.6f, -0.2f);
                dWingL.RotationDegrees = new Vector3(0, -25, 15);
                dWingL.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Teal });
                visuals.AddChild(dWingL);

                var dWingR = new MeshInstance3D();
                dWingR.Mesh = dWingL.Mesh;
                dWingR.Position = new Vector3(0.4f, 0.6f, -0.2f);
                dWingR.RotationDegrees = new Vector3(0, 25, -15);
                dWingR.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Teal });
                visuals.AddChild(dWingR);
                break;

            case "Mega-Glurak X":
                ThemeColor = new Color(0.15f, 0.15f, 0.2f);
                ElementType = "Feuer/Drache";

                var blueFlame = new CpuParticles3D();
                blueFlame.Position = new Vector3(0, 0.4f, -0.5f);
                blueFlame.Amount = 24;
                blueFlame.Lifetime = 0.5f;
                blueFlame.Mesh = new BoxMesh { Size = new Vector3(0.15f, 0.15f, 0.15f) };
                blueFlame.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.DeepSkyBlue, EmissionEnabled = true, Emission = Colors.DeepSkyBlue };
                visuals.AddChild(blueFlame);
                break;

            case "Mega-Bisaflor":
                ThemeColor = new Color(0.1f, 0.6f, 0.35f);
                ElementType = "Pflanze";

                var megaBloom = new MeshInstance3D();
                megaBloom.Mesh = new BoxMesh { Size = new Vector3(0.85f, 0.7f, 0.85f) };
                megaBloom.Position = new Vector3(0, 0.75f, -0.1f);
                megaBloom.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Crimson });
                visuals.AddChild(megaBloom);
                break;

            case "Arktos":
                ThemeColor = Colors.LightSkyBlue;
                ElementType = "Eis/Flug";

                var iceWings = new MeshInstance3D();
                iceWings.Mesh = new BoxMesh { Size = new Vector3(1.3f, 0.4f, 0.1f) };
                iceWings.Position = new Vector3(0, 0.6f, -0.2f);
                iceWings.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Cyan });
                visuals.AddChild(iceWings);
                break;

            case "Mewtu":
                ThemeColor = new Color(0.85f, 0.75f, 0.95f);
                ElementType = "Psycho";

                var auraM = new CpuParticles3D();
                auraM.Position = new Vector3(0, 0.4f, 0);
                auraM.Amount = 24;
                auraM.Lifetime = 0.6f;
                auraM.Mesh = new BoxMesh { Size = new Vector3(0.15f, 0.15f, 0.15f) };
                auraM.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.MediumOrchid, EmissionEnabled = true, Emission = Colors.MediumOrchid };
                auraM.Spread = 180.0f;
                visuals.AddChild(auraM);
                break;

            case "Zapdos":
                ThemeColor = Colors.Gold;
                ElementType = "Elektro/Flug";

                var zWings = new MeshInstance3D();
                zWings.Mesh = new BoxMesh { Size = new Vector3(1.2f, 0.3f, 0.1f) };
                zWings.Position = new Vector3(0, 0.6f, -0.2f);
                zWings.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Yellow });
                visuals.AddChild(zWings);
                break;

            case "Bisasam":
            case "Bisaknosp":
            case "Bisaflor":
                ThemeColor = MonsterName == "Bisaflor" ? new Color(0.15f, 0.65f, 0.4f) : new Color(0.2f, 0.75f, 0.45f);
                ElementType = "Pflanze";

                var bulb = new MeshInstance3D();
                bulb.Mesh = new BoxMesh { Size = MonsterName == "Bisaflor" ? new Vector3(0.7f, 0.6f, 0.7f) : new Vector3(0.45f, 0.45f, 0.45f) };
                bulb.Position = new Vector3(0, 0.65f, -0.1f);
                var bulbColor = MonsterName == "Bisaflor" ? Colors.HotPink : (MonsterName == "Bisaknosp" ? Colors.MediumVioletRed : new Color(0.1f, 0.45f, 0.2f));
                bulb.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = bulbColor });
                visuals.AddChild(bulb);
                break;

            case "Glumanda":
            case "Glutexo":
            case "Glurak":
                ThemeColor = MonsterName == "Glutexo" ? new Color(0.85f, 0.25f, 0.1f) : new Color(0.95f, 0.45f, 0.1f);
                ElementType = MonsterName == "Glurak" ? "Feuer/Flug" : "Feuer";

                if (MonsterName == "Glurak")
                {
                    var wingL = new MeshInstance3D();
                    wingL.Mesh = new BoxMesh { Size = new Vector3(0.6f, 0.4f, 0.08f) };
                    wingL.Position = new Vector3(-0.45f, 0.6f, -0.2f);
                    wingL.RotationDegrees = new Vector3(0, -30, 20);
                    wingL.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkCyan });
                    visuals.AddChild(wingL);

                    var wingR = new MeshInstance3D();
                    wingR.Mesh = wingL.Mesh;
                    wingR.Position = new Vector3(0.45f, 0.6f, -0.2f);
                    wingR.RotationDegrees = new Vector3(0, 30, -20);
                    wingR.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.DarkCyan });
                    visuals.AddChild(wingR);
                }

                var flame = new CpuParticles3D();
                flame.Position = new Vector3(0, 0.35f, -0.5f);
                flame.Amount = MonsterName == "Glurak" ? 16 : 8;
                flame.Lifetime = 0.4f;
                flame.Mesh = new BoxMesh { Size = new Vector3(0.12f, 0.12f, 0.12f) };
                flame.MaterialOverride = new StandardMaterial3D { AlbedoColor = Colors.OrangeRed, EmissionEnabled = true, Emission = Colors.OrangeRed };
                flame.Direction = new Vector3(0, 1, -0.5f);
                flame.Spread = 30.0f;
                flame.InitialVelocityMin = 1.2f;
                visuals.AddChild(flame);
                break;

            default:
                ThemeColor = IsShiny ? Colors.Gold : new Color(0.95f, 0.85f, 0.1f);
                ElementType = "Elektro";

                var cheekL = new MeshInstance3D();
                cheekL.Mesh = new BoxMesh { Size = new Vector3(0.12f, 0.12f, 0.05f) };
                cheekL.Position = new Vector3(-0.25f, 0.35f, 0.31f);
                cheekL.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Crimson });
                visuals.AddChild(cheekL);

                var cheekR = new MeshInstance3D();
                cheekR.Mesh = cheekL.Mesh;
                cheekR.Position = new Vector3(0.25f, 0.35f, 0.31f);
                cheekR.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Crimson });
                visuals.AddChild(cheekR);

                var tail = new MeshInstance3D();
                tail.Mesh = new BoxMesh { Size = new Vector3(0.1f, 0.4f, 0.1f) };
                tail.Position = new Vector3(0, 0.5f, -0.4f);
                tail.RotationDegrees = new Vector3(25, 0, 15);
                tail.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = Colors.Gold });
                visuals.AddChild(tail);
                break;
        }

        var bodyMesh = GetNodeOrNull<MeshInstance3D>("Visuals/Body");
        if (bodyMesh != null)
        {
            bodyMesh.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = ThemeColor });
        }

        UpdateInfoLabel();
    }

    private bool IsNight()
    {
        var sun = GetTree().Root.GetNodeOrNull<DirectionalLight3D>("Main/DirectionalLight3D");
        if (sun != null)
        {
            return Math.Sin(sun.Rotation.X) < -0.1f;
        }
        return false;
    }

    public override void _PhysicsProcess(double delta)
    {
        Vector3 velocity = Velocity;

        // Procedural Voxel Walking/Floating Animation
        var visuals = GetNodeOrNull<Node3D>("Visuals");
        if (visuals != null && velocity.Length() > 0.2f)
        {
            float bobbing = Mathf.Sin((float)Time.GetTicksMsec() * 0.012f) * 0.08f;
            visuals.Position = new Vector3(0, bobbing, 0);
        }

        // Overworld Aggression Check: Pursuit Player if wild boss / aggressive
        var player = GetTree().Root.GetNodeOrNull<Player>("Main/Player");
        if (!IsCompanion && player != null && IsInstanceValid(player))
        {
            float playerDist = GlobalPosition.DistanceTo(player.GlobalPosition);
            if (playerDist < 6.0f && (MonsterName == "Mewtu" || MonsterName == "Zapdos" || MonsterName == "Arktos" || MonsterName == "Garados" || Level >= 30))
            {
                Vector3 pursueDir = (player.GlobalPosition - GlobalPosition).Normalized();
                pursueDir.Y = 0;
                _targetDirection = pursueDir;
            }
        }

        bool isSwimming = false;
        var terrain = GetTree().Root.GetNodeOrNull<TerrainController>("Main/TerrainController");
        if (terrain != null)
        {
            Vector3I coords = new Vector3I(Mathf.RoundToInt(GlobalPosition.X), Mathf.RoundToInt(GlobalPosition.Y - 0.2f), Mathf.RoundToInt(GlobalPosition.Z));
            if (terrain.GetBlock(coords) == BlockType.Water)
            {
                isSwimming = true;
            }
        }

        if (isSwimming)
        {
            velocity.Y = Mathf.Sin((float)Time.GetTicksMsec() * 0.005f) * 0.3f;
        }
        else if (!IsOnFloor())
        {
            velocity.Y -= _gravity * (float)delta;
        }

        bool isNight = IsNight();
        bool isNocturnal = MonsterName == "Nachtara" || MonsterName == "Gengar" || MonsterName == "Nebulak" || MonsterName == "Alpollo";
        bool shouldSleep = (!IsCompanion) && ((isNight && !isNocturnal) || (!isNight && isNocturnal));

        if (visuals != null)
        {
            if (shouldSleep)
            {
                visuals.RotationDegrees = new Vector3(0, 0, 90);
                if (!_infoLabel.Text.Contains("[SCHLÄFT]"))
                {
                    _infoLabel.Text = "[SCHLÄFT] " + _infoLabel.Text;
                }
            }
            else
            {
                visuals.RotationDegrees = Vector3.Zero;
                if (_infoLabel.Text.Contains("[SCHLÄFT] "))
                {
                    _infoLabel.Text = _infoLabel.Text.Replace("[SCHLÄFT] ", "");
                }
            }
        }

        if (IsCompanion && TargetCompanionOwner != null && IsInstanceValid(TargetCompanionOwner))
        {
            Vector3 dist = TargetCompanionOwner.GlobalPosition - GlobalPosition;
            dist.Y = 0;
            if (dist.Length() > 2.5f)
            {
                _targetDirection = dist.Normalized();
                velocity.X = _targetDirection.X * (Speed * 1.3f);
                velocity.Z = _targetDirection.Z * (Speed * 1.3f);

                Vector3 lookTarget = GlobalPosition + _targetDirection;
                lookTarget.Y = GlobalPosition.Y;
                if (GlobalPosition.DistanceSquaredTo(lookTarget) > 0.001f)
                {
                    LookAt(lookTarget, Vector3.Up);
                }
            }
            else
            {
                velocity.X = Mathf.MoveToward(Velocity.X, 0, Speed);
                velocity.Z = Mathf.MoveToward(Velocity.Z, 0, Speed);
            }
        }
        else
        {
            if (shouldSleep)
            {
                velocity.X = 0;
                velocity.Z = 0;
            }
            else
            {
                _timer -= (float)delta;
                if (_timer <= 0.0f)
                {
                    ChooseNewState();
                }

                if (_targetDirection != Vector3.Zero)
                {
                    float currentSpeed = isSwimming ? Speed * 0.5f : Speed;
                    velocity.X = _targetDirection.X * currentSpeed;
                    velocity.Z = _targetDirection.Z * currentSpeed;

                    Vector3 lookTarget = GlobalPosition + _targetDirection;
                    lookTarget.Y = GlobalPosition.Y;
                    if (GlobalPosition.DistanceSquaredTo(lookTarget) > 0.001f)
                    {
                        LookAt(lookTarget, Vector3.Up);
                    }
                }
                else
                {
                    velocity.X = Mathf.MoveToward(Velocity.X, 0, Speed);
                    velocity.Z = Mathf.MoveToward(Velocity.Z, 0, Speed);
                }
            }
        }

        Velocity = velocity;
        MoveAndSlide();

        if (GlobalPosition.Y < -10)
        {
            QueueFree();
        }
    }

    private void ChooseNewState()
    {
        _timer = (float)GD.RandRange(2.0f, WanderingTime);

        if (GD.Randf() < 0.5f)
        {
            _targetDirection = Vector3.Zero;
        }
        else
        {
            float angle = (float)GD.RandRange(0.0f, Mathf.Pi * 2.0f);
            _targetDirection = new Vector3(Mathf.Cos(angle), 0, Mathf.Sin(angle)).Normalized();
        }
    }

    public void TakeDamage(int damage)
    {
        CurrentHp = Math.Max(0, CurrentHp - damage);
        UpdateInfoLabel();
    }

    public bool TryCapture(float ballCatchRate)
    {
        float hpRatio = (float)CurrentHp / MaxHp;
        float catchChance = (1.0f - (hpRatio * 0.5f)) * ballCatchRate;
        if (MonsterName == "Mewtu" || MonsterName == "Zapdos" || MonsterName == "Arktos" || MonsterName == "Garados") catchChance *= 0.35f;
        float roll = GD.Randf();
        return roll < catchChance;
    }

    public PokemonData ToData()
    {
        var data = new PokemonData(MonsterName, Level, MaxHp, ElementType, ThemeColor, IsShiny)
        {
            CurrentHp = this.CurrentHp,
            Nature = this.Nature
        };
        data.AssignDefaultMoves();
        return data;
    }

    private void AddFacialFeatures(Node3D visuals)
    {
        Color eyeColor = MonsterName switch
        {
            "Pikachu" or "Raichu" or "Glumanda" or "Schiggy" => Colors.Black,
            "Gengar" or "Nebulak" or "Alpollo" => Colors.Red,
            "Mewtu" or "Psiana" => Colors.DeepPink,
            "Nachtara" => Colors.Red,
            "Zapdos" or "Arktos" => Colors.Cyan,
            _ => Colors.Black
        };

        Color? cheekColor = (MonsterName == "Pikachu" || MonsterName == "Raichu") ? Colors.Red : null;

        var eyeL = new MeshInstance3D();
        eyeL.Mesh = new BoxMesh { Size = new Vector3(0.08f, 0.08f, 0.02f) };
        eyeL.Position = new Vector3(-0.14f, 0.55f, 0.28f);
        eyeL.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = eyeColor, EmissionEnabled = (eyeColor == Colors.Red || eyeColor == Colors.Cyan), Emission = eyeColor });
        visuals.AddChild(eyeL);

        var eyeR = new MeshInstance3D();
        eyeR.Mesh = eyeL.Mesh;
        eyeR.Position = new Vector3(0.14f, 0.55f, 0.28f);
        eyeR.SetSurfaceOverrideMaterial(0, eyeL.GetSurfaceOverrideMaterial(0));
        visuals.AddChild(eyeR);

        if (cheekColor.HasValue)
        {
            var cheekL = new MeshInstance3D();
            cheekL.Mesh = new BoxMesh { Size = new Vector3(0.09f, 0.09f, 0.02f) };
            cheekL.Position = new Vector3(-0.21f, 0.44f, 0.28f);
            cheekL.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = cheekColor.Value, EmissionEnabled = true, Emission = cheekColor.Value });
            visuals.AddChild(cheekL);

            var cheekR = new MeshInstance3D();
            cheekR.Mesh = cheekL.Mesh;
            cheekR.Position = new Vector3(0.21f, 0.44f, 0.28f);
            cheekR.SetSurfaceOverrideMaterial(0, cheekL.GetSurfaceOverrideMaterial(0));
            visuals.AddChild(cheekR);
        }
    }
}
