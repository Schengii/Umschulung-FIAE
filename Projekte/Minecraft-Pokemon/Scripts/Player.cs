using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

public partial class Player : CharacterBody3D
{
    [Export] public float Speed = 5.0f;
    [Export] public float JumpVelocity = 6.0f;
    [Export] public float MouseSensitivity = 0.003f;
    [Export] public float InteractionRange = 6.0f;

    private Camera3D _camera = null!;
    private RayCast3D _rayCast = null!;
    private TerrainController _terrain = null!;
    private DirectionalLight3D? _sunLight;

    // UI Controls
    private Label _feedbackLabel = null!;
    private Label _hotbarLabel = null!;
    private Label _partyLabel = null!;
    private Label _inventoryLabel = null!;
    private Label _radarLabel = null!;
    private Label _minimapLabel = null!;
    private Panel _craftingPanel = null!;
    private Panel _battlePanel = null!;
    private Panel _pcPanel = null!;
    private Panel _pokedexPanel = null!;
    private Panel _gridInventoryPanel = null!;
    private Label _battleTextLabel = null!;
    private ProgressBar _playerHpBar = null!;
    private ProgressBar _enemyHpBar = null!;

    private float _throwCooldown = 0.0f;
    public float Gravity = ProjectSettings.GetSetting("physics/3d/default_gravity").AsSingle();

    // Hotbar & Building
    private readonly BlockType[] _hotbarBlocks = new BlockType[]
    {
        BlockType.Grass, BlockType.Dirt, BlockType.Stone, BlockType.Wood, BlockType.Sand, BlockType.Planks, BlockType.HealStationBlock, BlockType.TrophyBlock
    };
    private int _selectedHotbarIndex = 0;

    // Inventory & Crafting
    public Dictionary<BlockType, int> BlockInventory { get; private set; } = new Dictionary<BlockType, int>();
    public int PokeballCount { get; set; } = 10;
    public int SuperballCount { get; set; } = 3;
    public int HyperballCount { get; set; } = 1;
    public int MasterballCount { get; set; } = 1;
    public int HeavyballCount { get; set; } = 2;
    public int NetballCount { get; set; } = 2;
    public int DuskballCount { get; set; } = 2;
    public int DiveballCount { get; set; } = 2;
    public int ApricornCount { get; set; } = 5;
    public int BerryCount { get; set; } = 5;
    public bool IsChampion { get; set; } = false;

    // Evolution Cutscene State
    private Panel _evolutionPanel = null!;
    private Label _evolutionTextLabel = null!;
    private float _evolutionTimer = 0.0f;
    private PokemonData? _evolvingPokemon = null;
    private string? _targetEvolutionSpecies = null;

    // Tool Progression & Evolution Stones
    public bool HasStonePickaxe { get; set; } = false;
    public bool HasIronPickaxe { get; set; } = false;
    public string CurrentTool { get; set; } = "Hand";
    public int FeuersteinCount { get; set; } = 0;
    public int WassersteinCount { get; set; } = 0;
    public int DonnersteinCount { get; set; } = 0;

    public List<string> Badges { get; private set; } = new List<string>();
    public HashSet<string> PokedexCaught { get; private set; } = new HashSet<string>();

    private bool _isCraftingOpen = false;
    private bool _isPcOpen = false;
    private bool _isPokedexOpen = false;
    private bool _isGridInventoryOpen = false;
    private bool _isAchievementsOpen = false;
    private Panel _achievementsPanel = null!;

    // Battle System State
    public bool IsInBattle { get; private set; } = false;
    private Monster? _battleTarget = null;
    private NpcTrainer? _trainerTarget = null;

    // Riding / Mount System
    public bool IsMounted { get; private set; } = false;

    // Pokémon Party & PC Storage
    public List<PokemonData> Party { get; private set; } = new List<PokemonData>();
    public List<PokemonData> PCStorage { get; private set; } = new List<PokemonData>();
    private Monster? _activeCompanion = null;

    private float _dayNightTimer = 0.0f;
    private Vector3 _lastStepPos;

    public override void _Ready()
    {
        _camera = GetNode<Camera3D>("Camera3D");
        _rayCast = GetNode<RayCast3D>("Camera3D/RayCast3D");
        _feedbackLabel = GetNode<Label>("HUD/FeedbackLabel");

        _terrain = GetParent().GetNode<TerrainController>("TerrainController");
        _sunLight = GetParent().GetNodeOrNull<DirectionalLight3D>("DirectionalLight3D");
        _lastStepPos = GlobalPosition;

        foreach (var b in _hotbarBlocks)
        {
            BlockInventory[b] = 16;
        }

        Input.MouseMode = Input.MouseModeEnum.Captured;

        Pokeball.OnCaptureFeedback += DisplayFeedback;
        Pokeball.OnPokemonCaptured += OnPokemonCapturedHandler;

        // Subscribe to global events
        QuestManager.QuestCompleted += DisplayFeedback;
        AchievementManager.AchievementUnlocked += OnAchievementUnlocked;
        if (WeatherManager.Instance != null)
            WeatherManager.Instance.WeatherChanged += OnWeatherChanged;

        SetupUIElements();
        UpdateHUD();
    }

    private void OnWeatherChanged(WeatherType newWeather)
    {
        string icon = newWeather switch
        {
            WeatherType.Rain       => "🌧️",
            WeatherType.Snow       => "❄️",
            WeatherType.Sandstorm  => "🏜️",
            WeatherType.VolcanoAsh => "🌋",
            _                     => "☀️"
        };
        DisplayFeedback($"{icon} Wetter geändert: {newWeather}!");
    }

    private void OnAchievementUnlocked(Achievement achievement)
    {
        DisplayFeedback($"🏅 ACHIEVEMENT FREIGESCHALTET: {achievement.Icon} '{achievement.Title}'!");
    }

    public override void _ExitTree()
    {
        Pokeball.OnCaptureFeedback -= DisplayFeedback;
        Pokeball.OnPokemonCaptured -= OnPokemonCapturedHandler;
        QuestManager.QuestCompleted -= DisplayFeedback;
        AchievementManager.AchievementUnlocked -= OnAchievementUnlocked;
        if (WeatherManager.Instance != null)
            WeatherManager.Instance.WeatherChanged -= OnWeatherChanged;
    }

    private void SetupUIElements()
    {
        Node hud = GetNode("HUD");

        _hotbarLabel = new Label();
        _hotbarLabel.Position = new Vector2(20, 650);
        _hotbarLabel.AddThemeFontSizeOverride("font_size", 16);
        hud.AddChild(_hotbarLabel);

        _partyLabel = new Label();
        _partyLabel.Position = new Vector2(20, 100);
        _partyLabel.AddThemeFontSizeOverride("font_size", 16);
        hud.AddChild(_partyLabel);

        _inventoryLabel = new Label();
        _inventoryLabel.Position = new Vector2(20, 290);
        _inventoryLabel.AddThemeFontSizeOverride("font_size", 15);
        hud.AddChild(_inventoryLabel);

        _radarLabel = new Label();
        _radarLabel.Position = new Vector2(20, 20);
        _radarLabel.AddThemeFontSizeOverride("font_size", 15);
        _radarLabel.Modulate = Colors.Cyan;
        hud.AddChild(_radarLabel);

        _minimapLabel = new Label();
        _minimapLabel.Position = new Vector2(980, 20);
        _minimapLabel.AddThemeFontSizeOverride("font_size", 12);
        hud.AddChild(_minimapLabel);

        var controlsLabel = new Label();
        controlsLabel.Position = new Vector2(680, 20);
        controlsLabel.Text = "Steuerung:\nWASD: Bewegen / Fliegen / Surfen | Space/Shift: Steigen/Sinken\nLinksklick: Abbauen | Rechtsklick: Platzieren / Heil / Pension / Händler\n1-8 / Scrollen: Hotbar | Q: Werfen | R: Rufen | F: Reiten / Surfen\nB: Kampf | M: Mega | P: Pokédex | I: Grid-Inventar | C: Crafting | E: PC\nH/J: Server Host/Join | F5: Speichern | F9: Laden";
        controlsLabel.AddThemeFontSizeOverride("font_size", 12);
        hud.AddChild(controlsLabel);

        // Pokédex Overlay
        _pokedexPanel = new Panel();
        _pokedexPanel.Size = new Vector2(460, 320);
        _pokedexPanel.Position = new Vector2(350, 190);
        _pokedexPanel.Visible = false;
        var dexLabel = new Label();
        dexLabel.Name = "DexLabel";
        dexLabel.Position = new Vector2(20, 20);
        dexLabel.AddThemeFontSizeOverride("font_size", 15);
        _pokedexPanel.AddChild(dexLabel);
        hud.AddChild(_pokedexPanel);

        // Grid Inventory Overlay
        _gridInventoryPanel = new Panel();
        _gridInventoryPanel.Size = new Vector2(480, 340);
        _gridInventoryPanel.Position = new Vector2(340, 180);
        _gridInventoryPanel.Visible = false;
        var gridLabel = new Label();
        gridLabel.Name = "GridLabel";
        gridLabel.Position = new Vector2(20, 20);
        gridLabel.AddThemeFontSizeOverride("font_size", 14);
        _gridInventoryPanel.AddChild(gridLabel);
        hud.AddChild(_gridInventoryPanel);

        // Crafting Overlay
        _craftingPanel = new Panel();
        _craftingPanel.Size = new Vector2(460, 340);
        _craftingPanel.Position = new Vector2(360, 200);
        _craftingPanel.Visible = false;

        var craftTitle = new Label();
        craftTitle.Text = "=== CRAFTING-MENÜ ===\n\n1: 3x Pokeball (Kosten: 1x Erz + 1x Holz)\n2: 4x Bretter (Kosten: 1x Holz)\n3: 1x Heil-Station (Kosten: 2x Eisenerz + 1x PokeballErz)\n4: 4x Fackeln (Kosten: 1x Kohle + 1x Holz)\n5: 1x Zucht-Stall (Kosten: 2x Holz + 2x Bretter)\n6: 2x Superball (Kosten: 1x Eisenerz + 1x Sand)\n7: 1x Hyperball (Kosten: 1x Eisenerz + 1x Kohle)\n8: 1x Trophäen-Block (Kosten: 2x Eisenerz + 1x Planks)\n9: Stein-Spitzhacke (Kosten: 3x Stein + 2x Holz)\n0: Eisen-Spitzhacke (Kosten: 3x Eisenerz + 2x Holz)\n\nDrücke 1-0 zum Craften | C zum Schließen";
        craftTitle.Position = new Vector2(20, 20);
        craftTitle.AddThemeFontSizeOverride("font_size", 13);
        _craftingPanel.AddChild(craftTitle);
        hud.AddChild(_craftingPanel);

        // PC Overlay
        _pcPanel = new Panel();
        _pcPanel.Size = new Vector2(400, 300);
        _pcPanel.Position = new Vector2(380, 200);
        _pcPanel.Visible = false;
        var pcLabel = new Label();
        pcLabel.Name = "PCLabel";
        pcLabel.Position = new Vector2(20, 20);
        pcLabel.AddThemeFontSizeOverride("font_size", 15);
        _pcPanel.AddChild(pcLabel);
        hud.AddChild(_pcPanel);

        // Battle Overlay
        _battlePanel = new Panel();
        _battlePanel.Size = new Vector2(560, 260);
        _battlePanel.Position = new Vector2(300, 380);
        _battlePanel.Visible = false;

        _battleTextLabel = new Label();
        _battleTextLabel.Position = new Vector2(20, 20);
        _battleTextLabel.AddThemeFontSizeOverride("font_size", 14);
        _battlePanel.AddChild(_battleTextLabel);
        hud.AddChild(_battlePanel);

        // Evolution Overlay Panel
        _evolutionPanel = new Panel();
        _evolutionPanel.Size = new Vector2(480, 200);
        _evolutionPanel.Position = new Vector2(340, 220);
        _evolutionPanel.Visible = false;
        _evolutionTextLabel = new Label();
        _evolutionTextLabel.Position = new Vector2(20, 20);
        _evolutionTextLabel.AddThemeFontSizeOverride("font_size", 16);
        _evolutionPanel.AddChild(_evolutionTextLabel);
        hud.AddChild(_evolutionPanel);

        // Style Panels
        StylePanel(_pokedexPanel, new Color(0.15f, 0.1f, 0.25f, 0.85f), Colors.DarkOrchid, 10);
        StylePanel(_gridInventoryPanel, new Color(0.12f, 0.18f, 0.15f, 0.9f), Colors.MediumSeaGreen, 10);
        StylePanel(_craftingPanel, new Color(0.18f, 0.15f, 0.12f, 0.9f), Colors.Peru, 10);
        StylePanel(_pcPanel, new Color(0.1f, 0.12f, 0.18f, 0.85f), Colors.DeepSkyBlue, 10);
        StylePanel(_battlePanel, new Color(0.12f, 0.12f, 0.15f, 0.92f), Colors.Crimson, 12);
        StylePanel(_evolutionPanel, new Color(0.2f, 0.1f, 0.3f, 0.95f), Colors.Gold, 12);

        // Player HP Bar setup
        _playerHpBar = new ProgressBar();
        _playerHpBar.Size = new Vector2(240, 18);
        _playerHpBar.Position = new Vector2(20, 215);
        _playerHpBar.ShowPercentage = true;
        _playerHpBar.Value = 100;
        _battlePanel.AddChild(_playerHpBar);

        // Enemy HP Bar setup
        _enemyHpBar = new ProgressBar();
        _enemyHpBar.Size = new Vector2(240, 18);
        _enemyHpBar.Position = new Vector2(290, 215);
        _enemyHpBar.ShowPercentage = true;
        _enemyHpBar.Value = 100;
        _battlePanel.AddChild(_enemyHpBar);

        // Achievements Panel
        _achievementsPanel = new Panel();
        _achievementsPanel.Size = new Vector2(520, 400);
        _achievementsPanel.Position = new Vector2(320, 90);
        _achievementsPanel.Visible = false;
        var achLabel = new Label();
        achLabel.Name = "AchLabel";
        achLabel.Position = new Vector2(15, 15);
        achLabel.AutowrapMode = TextServer.AutowrapMode.WordSmart;
        achLabel.AddThemeFontSizeOverride("font_size", 12);
        _achievementsPanel.AddChild(achLabel);
        StylePanel(_achievementsPanel, new Color(0.1f, 0.15f, 0.1f, 0.92f), Colors.LimeGreen, 10);
        hud.AddChild(_achievementsPanel);
    }

    private void StylePanel(Panel panel, Color bgColor, Color borderColor, int cornerRadius)
    {
        var style = new StyleBoxFlat();
        style.BgColor = bgColor;
        style.BorderColor = borderColor;
        style.BorderWidthLeft = 2;
        style.BorderWidthRight = 2;
        style.BorderWidthTop = 2;
        style.BorderWidthBottom = 2;
        style.CornerRadiusTopLeft = cornerRadius;
        style.CornerRadiusTopRight = cornerRadius;
        style.CornerRadiusBottomLeft = cornerRadius;
        style.CornerRadiusBottomRight = cornerRadius;
        style.ShadowColor = new Color(0, 0, 0, 0.4f);
        style.ShadowSize = 8;
        style.ShadowOffset = new Vector2(2, 2);
        panel.AddThemeStyleboxOverride("panel", style);
    }

    private void DisplayFeedback(string message)
    {
        _feedbackLabel.Text = message;
        var timer = GetTree().CreateTimer(3.5f);
        timer.Timeout += () =>
        {
            if (GodotObject.IsInstanceValid(_feedbackLabel) && _feedbackLabel.Text == message)
            {
                _feedbackLabel.Text = "";
            }
        };
    }

    private void OnPokemonCapturedHandler(PokemonData data)
    {
        PokedexCaught.Add(data.Species);

        if (Party.Count < 6)
        {
            Party.Add(data);
            string shinyTag = data.IsShiny ? "✨ SHINY " : "";
            DisplayFeedback($"'{shinyTag}{data.Species}' zu deinem Team hinzugefügt! (Team: {Party.Count}/6)");
        }
        else
        {
            PCStorage.Add(data);
            DisplayFeedback($"Team voll! '{data.Species}' wurde in die PC-Box übertragen. (PC: {PCStorage.Count})");
        }

        // Achievements
        AchievementManager.Unlock("first_catch");
        if (PokedexCaught.Count >= 10) AchievementManager.Unlock("catch_10");
        if (PokedexCaught.Count >= 25) AchievementManager.Unlock("catch_all");
        if (data.IsShiny) AchievementManager.Unlock("first_shiny");
        string[] legendary = { "Mewtu", "Zapdos", "Arktos", "Lugia", "Ho-Oh", "Deoxys", "Deoxys-Angriff", "Deoxys-Verteidigung", "Deoxys-Initiative" };
        if (System.Array.IndexOf(legendary, data.Species) >= 0) AchievementManager.Unlock("legendary");

        // Quests
        if (QuestManager.ProgressQuest("catch10", 1, out string q10)) DisplayFeedback(q10);
        if (data.IsShiny && QuestManager.ProgressQuest("shiny", 1, out string qShiny)) DisplayFeedback(qShiny);

        UpdateHUD();
    }

    /// <summary>Routes input to the appropriate handler based on current game state.</summary>
    public override void _UnhandledInput(InputEvent @event)
    {
        if (IsInBattle)
        {
            HandleBattleInput(@event);
            return;
        }

        if (_isGridInventoryOpen || _isCraftingOpen || _isPcOpen || _isPokedexOpen)
        {
            HandleMenuInput(@event);
            return;
        }

        HandleWorldInput(@event);
    }

    /// <summary>Handles all key input while in a battle.</summary>
    private void HandleBattleInput(InputEvent @event)
    {
        if (@event is InputEventKey k && k.Pressed)
        {
            if (k.Keycode >= Key.Key1 && k.Keycode <= Key.Key4)
            {
                int moveIdx = (int)k.Keycode - (int)Key.Key1;
                ExecuteBattleTurn(moveIdx);
            }
            else if (k.Keycode == Key.M)
            {
                TryTriggerMegaEvolution();
            }
            else if (k.Keycode == Key.B || k.Keycode == Key.Escape)
            {
                EndBattle("Du bist aus dem Kampf geflohen!");
            }
        }
    }

    /// <summary>Handles key input while any menu/overlay panel is open.</summary>
    private void HandleMenuInput(InputEvent @event)
    {
        if (@event is not InputEventKey keyEvent || !keyEvent.Pressed) return;

        if (_isGridInventoryOpen && keyEvent.Keycode == Key.I)
        {
            ToggleGridInventory();
        }
        else if (_isCraftingOpen)
        {
            switch (keyEvent.Keycode)
            {
                case Key.C:    ToggleCrafting();    break;
                case Key.Key1: CraftPokeball();     break;
                case Key.Key2: CraftPlanks();       break;
                case Key.Key3: CraftHealStation();  break;
                case Key.Key4: CraftTorches();      break;
                case Key.Key5: CraftBreedingPen();  break;
                case Key.Key6: CraftSuperball();    break;
                case Key.Key7: CraftHyperball();    break;
                case Key.Key8: CraftTrophyBlock();  break;
                case Key.Key9: CraftStonePickaxe(); break;
                case Key.Key0: CraftIronPickaxe();  break;
            }
        }
        else if (_isPcOpen && keyEvent.Keycode == Key.E)
        {
            TogglePC();
        }
        else if (_isPokedexOpen && keyEvent.Keycode == Key.P)
        {
            TogglePokedex();
        }
    }

    /// <summary>Handles all input during normal world exploration.</summary>
    private void HandleWorldInput(InputEvent @event)
    {
        if (@event is InputEventMouseMotion mouseMotion && Input.MouseMode == Input.MouseModeEnum.Captured)
        {
            RotateY(-mouseMotion.Relative.X * MouseSensitivity);
            float targetPitch = _camera.Rotation.X - mouseMotion.Relative.Y * MouseSensitivity;
            _camera.Rotation = new Vector3(
                Mathf.Clamp(targetPitch, -Mathf.Pi / 2.1f, Mathf.Pi / 2.1f),
                _camera.Rotation.Y,
                _camera.Rotation.Z
            );
        }

        if (@event is InputEventMouseButton mouseButton && mouseButton.Pressed)
        {
            switch (mouseButton.ButtonIndex)
            {
                case MouseButton.WheelUp:
                    _selectedHotbarIndex = (_selectedHotbarIndex - 1 + _hotbarBlocks.Length) % _hotbarBlocks.Length;
                    UpdateHUD();
                    break;
                case MouseButton.WheelDown:
                    _selectedHotbarIndex = (_selectedHotbarIndex + 1) % _hotbarBlocks.Length;
                    UpdateHUD();
                    break;
                case MouseButton.Left:
                    if (Input.MouseMode == Input.MouseModeEnum.Visible)
                    {
                        Input.MouseMode = Input.MouseModeEnum.Captured;
                        return;
                    }
                    TryInteract(mine: true);
                    break;
                case MouseButton.Right:
                    TryInteract(mine: false);
                    break;
            }
        }

        if (@event is InputEventKey kKey && kKey.Pressed)
        {
            HandleWorldKeyInput(kKey.Keycode);
        }
    }

    /// <summary>Handles keyboard shortcuts in the world (exploration) state.</summary>
    private void HandleWorldKeyInput(Key keycode)
    {
        switch (keycode)
        {
            case Key.Escape:
                Input.MouseMode = Input.MouseMode == Input.MouseModeEnum.Captured
                    ? Input.MouseModeEnum.Visible
                    : Input.MouseModeEnum.Captured;
                break;

            // Hotbar 1-8 (also used for map teleport)
            case >= Key.Key1 and <= Key.Key8:
                if (_isMapOpen)
                {
                    switch (keycode)
                    {
                        case Key.Key1: TeleportTo(new Vector3(22.0f, 9.0f,  12.0f), "🏘 Voxel-Dorf");    break;
                        case Key.Key2: TeleportTo(new Vector3(12.0f, 10.0f, 12.0f), "🏟 Voxel-Arena");   break;
                        case Key.Key3: TeleportTo(new Vector3(48.0f, 5.0f,  48.0f), "🏙 Boss-Dungeon"); break;
                        case Key.Key4: TeleportTo(new Vector3(35.0f, 10.0f, 45.0f), "👑 Liga-Palast");   break;
                        case Key.Key5: TeleportTo(new Vector3(20.0f, 26.0f, 20.0f), "☁️ Himmelsturm");  break;
                    }
                }
                else
                {
                    _selectedHotbarIndex = (int)keycode - (int)Key.Key1;
                    UpdateHUD();
                }
                break;

            case Key.M: ToggleMap();          break;
            case Key.I: ToggleGridInventory(); break;
            case Key.P: TogglePokedex();       break;
            case Key.C: ToggleCrafting();      break;
            case Key.E: TogglePC();            break;
            case Key.R: ToggleCompanion();     break;
            case Key.F: ToggleMount();         break;

            case Key.B:
                if (_evolutionPanel != null && _evolutionPanel.Visible)
                {
                    _evolutionPanel.Visible = false;
                    _evolutionTimer = 0;
                    if (_evolvingPokemon != null) _evolvingPokemon.PendingEvolutionTarget = null;
                    _evolvingPokemon = null;
                    _targetEvolutionSpecies = null;
                    DisplayFeedback("🛑 DIE EVOLUTION WURDE ABGEBROCHEN!");
                }
                else
                {
                    TryStartBattle();
                }
                break;

            case Key.N:   ToggleQuestLog();         break;
            case Key.Z:   TryTriggerDynamax();       break;
            case Key.T:   TryTriggerTerastallize();  break;
            case Key.K:   StartFishingMinigame();    break;
            case Key.H:   HostMultiplayer();          break;
            case Key.J:   JoinMultiplayer();          break;
            case Key.G:   CycleTools();               break;
            case Key.U:   TryApplyEvolutionStones();  break;
            case Key.F12: TogglePhotoMode();          break;
            case Key.O:   ToggleTheme();              break;
            case Key.L:   ToggleBattleSpeed();        break;
            case Key.F5:  PerformSave();              break;
            case Key.F9:  PerformLoad();              break;
        }
    }

    public override void _PhysicsProcess(double delta)
    {
        _dayNightTimer += (float)delta * 0.05f;
        if (_sunLight != null)
        {
            _sunLight.Rotation = new Vector3(_dayNightTimer, Mathf.Pi / 4.0f, 0);
        }

        if (_evolutionPanel != null && _evolutionPanel.Visible)
        {
            _evolutionTimer -= (float)delta;
            if (EffectsManager.Instance != null && GD.Randf() < 0.25f)
            {
                EffectsManager.Instance.SpawnBlockBreakEffect(GlobalPosition + Vector3.Up * 1.2f, Colors.Gold);
            }

            if (_evolutionTimer <= 0)
            {
                _evolutionPanel.Visible = false;
                if (_evolvingPokemon != null && _targetEvolutionSpecies != null)
                {
                    string oldName = _evolvingPokemon.Species;
                    _evolvingPokemon.CompleteEvolution(_targetEvolutionSpecies);
                    DisplayFeedback($"🎉 GLÜCKWUNSCH! Dein {oldName} hat sich zu {_evolvingPokemon.Species} entwickelt!");
                    if (EffectsManager.Instance != null) EffectsManager.Instance.SpawnFireworksEffect(GlobalPosition);
                    if (_activeCompanion != null && IsInstanceValid(_activeCompanion))
                    {
                        _activeCompanion.SetupFromData(_evolvingPokemon, isCompanion: true, owner: this);
                    }
                }
                _evolvingPokemon = null;
                _targetEvolutionSpecies = null;
            }
        }

        UpdateRadarHUD();
        UpdateMinimapHUD();

        if (GlobalPosition.DistanceTo(_lastStepPos) > 1.0f)
        {
            _lastStepPos = GlobalPosition;
            if (BreedingManager.AddWalkSteps(1, out PokemonData? hatched))
            {
                if (hatched != null)
                {
                    OnPokemonCapturedHandler(hatched);
                    DisplayFeedback($"🐣 EIN POKÉMON-EI IST GESCHLÜPFT! Neues Lv.1 {hatched.Species} schlüpft!");
                    if (QuestManager.ProgressQuest("breeding", 1, out string qMsg)) DisplayFeedback(qMsg);
                    if (EffectsManager.Instance != null) EffectsManager.Instance.SpawnFireworksEffect(GlobalPosition);
                }
            }
        }

        if (IsInBattle) return;

        Vector3 velocity = Velocity;

        if (_throwCooldown > 0)
        {
            _throwCooldown -= (float)delta;
        }

        if (Input.IsKeyPressed(Key.Q) && _throwCooldown <= 0 && Input.MouseMode == Input.MouseModeEnum.Captured && !_isCraftingOpen && !_isPcOpen && !_isPokedexOpen && !_isGridInventoryOpen)
        {
            _throwCooldown = 0.5f;
            ThrowPokeball();
        }

        if (IsMounted && _activeCompanion != null)
        {
            bool isWaterMount = _activeCompanion.MonsterName == "Garados" || _activeCompanion.MonsterName == "Aquana" || _activeCompanion.MonsterName == "Schiggy" || _activeCompanion.MonsterName == "Turtok" || _activeCompanion.MonsterName == "Amonitas" || _activeCompanion.MonsterName == "Lugia";
            bool isFlyingMount = _activeCompanion.MonsterName == "Glurak" || _activeCompanion.MonsterName == "Zapdos" || _activeCompanion.MonsterName == "Mega-Glurak X" || _activeCompanion.MonsterName == "Dragoran" || _activeCompanion.MonsterName == "Arktos" || _activeCompanion.MonsterName == "Ho-Oh" || _activeCompanion.MonsterName == "Aerodactyl";

            float rideSpeed = isFlyingMount ? Speed * 1.8f : (isWaterMount ? Speed * 1.5f : Speed * 2.2f);
            Vector2 inDir = Vector2.Zero;
            if (Input.IsKeyPressed(Key.W)) inDir.Y -= 1;
            if (Input.IsKeyPressed(Key.S)) inDir.Y += 1;
            if (Input.IsKeyPressed(Key.A)) inDir.X -= 1;
            if (Input.IsKeyPressed(Key.D)) inDir.X += 1;
            inDir = inDir.Normalized();

            Vector3 moveDir = (Transform.Basis * new Vector3(inDir.X, 0, inDir.Y)).Normalized();
            velocity.X = moveDir.X * rideSpeed;
            velocity.Z = moveDir.Z * rideSpeed;

            if (isFlyingMount)
            {
                if (Input.IsKeyPressed(Key.Space)) velocity.Y = rideSpeed * 0.7f;
                else if (Input.IsKeyPressed(Key.Shift)) velocity.Y = -rideSpeed * 0.7f;
                else velocity.Y = 0;
            }
            else if (isWaterMount)
            {
                if (GlobalPosition.Y <= 4.5f) velocity.Y = 0.5f;
                else if (!IsOnFloor()) velocity.Y -= Gravity * (float)delta;
            }
            else
            {
                if (!IsOnFloor()) velocity.Y -= Gravity * (float)delta;
                if (Input.IsKeyPressed(Key.Space) && IsOnFloor()) velocity.Y = JumpVelocity;
            }

            _activeCompanion.GlobalPosition = GlobalPosition - new Vector3(0, 0.5f, 0);
        }
        else
        {
            if (!IsOnFloor())
            {
                velocity.Y -= Gravity * (float)delta;
            }

            if (Input.IsKeyPressed(Key.Space) && IsOnFloor())
            {
                velocity.Y = JumpVelocity;
            }

            Vector2 inputDir = Vector2.Zero;
            if (Input.IsKeyPressed(Key.W)) inputDir.Y -= 1;
            if (Input.IsKeyPressed(Key.S)) inputDir.Y += 1;
            if (Input.IsKeyPressed(Key.A)) inputDir.X -= 1;
            if (Input.IsKeyPressed(Key.D)) inputDir.X += 1;
            inputDir = inputDir.Normalized();

            Vector3 direction = (Transform.Basis * new Vector3(inputDir.X, 0, inputDir.Y)).Normalized();
            if (direction != Vector3.Zero)
            {
                velocity.X = direction.X * Speed;
                velocity.Z = direction.Z * Speed;
            }
            else
            {
                velocity.X = Mathf.MoveToward(Velocity.X, 0, Speed);
                velocity.Z = Mathf.MoveToward(Velocity.Z, 0, Speed);
            }
        }

        Velocity = velocity;
        MoveAndSlide();
    }

    public HashSet<Vector2I> ExploredChunks { get; private set; } = new HashSet<Vector2I>();
    public Dictionary<string, Vector3I> CustomWaypoints { get; private set; } = new Dictionary<string, Vector3I>();

    public void AddWaypoint(string name, Vector3I coords)
    {
        CustomWaypoints[name] = coords;
        DisplayFeedback($"📍 WEGPUNKT GESETZT: '{name}' bei [{coords.X}, {coords.Y}, {coords.Z}]!");
    }

    private void UpdateMinimapHUD()
    {
        if (_minimapLabel == null) return;
        int px = (int)GlobalPosition.X;
        int pz = (int)GlobalPosition.Z;
        Vector2I chunk = new Vector2I(px / 16, pz / 16);
        ExploredChunks.Add(chunk);

        int count = ExploredChunks.Count;
        string wpText = CustomWaypoints.Count > 0 ? $"\n📍 Wegpunkte: {CustomWaypoints.Count}" : "";
        _minimapLabel.Text = $"🗺 MINIMAP [X:{px} Z:{pz}] (Entdeckt: {count} Chunks){wpText}\n 🟢 N  \n🔵W 👤 E\n 🟡 S";
    }

    private bool _isQuestLogOpen = false;
    private Panel _questLogPanel = null!;

    private void ToggleQuestLog()
    {
        _isQuestLogOpen = !_isQuestLogOpen;
        string questText = "=== INTERAKTIVES QUEST-LOG ===\n\nAktuelle Missionen:\n";
        foreach (var q in QuestManager.ActiveQuests)
        {
            string status = q.IsCompleted ? "✅ ABGESCHLOSSEN" : $"[FORTSCHRITT: {q.CurrentProgress}/{q.TargetAmount}]";
            questText += $" • {q.Title}: {q.Description}\n   {status} | Belohnung: {q.RewardText}\n\n";
        }
        questText += "Drücke 'N' zum Schließen.";
        DisplayFeedback(questText);
        Input.MouseMode = _isQuestLogOpen ? Input.MouseModeEnum.Visible : Input.MouseModeEnum.Captured;
    }

    private void UpdateRadarHUD()
    {
        if (_radarLabel == null) return;
        Vector3 arenaPos = new Vector3(12, 9, 12);
        Vector3 villagePos = new Vector3(22, 8, 12);
        Vector3 dungeonPos = new Vector3(48, 3, 48);
        Vector3 leaguePos = new Vector3(35, 9, 45);

        float distArena = (int)GlobalPosition.DistanceTo(arenaPos);
        float distVillage = (int)GlobalPosition.DistanceTo(villagePos);
        float distDungeon = (int)GlobalPosition.DistanceTo(dungeonPos);
        float distLeague = (int)GlobalPosition.DistanceTo(leaguePos);

        string champTitle = IsChampion ? "🏆 [POKÉMON-CHAMP] " : "";
        _radarLabel.Text = $"{champTitle}🧭 VOXEL-RADAR:\n 🏟 Arena: {distArena}m | 🏘 Dorf: {distVillage}m | 🏛 Boss-Dungeon: {distDungeon}m | 👑 Liga: {distLeague}m";
    }

    private void ToggleGridInventory()
    {
        if (_gridInventoryPanel == null) { GD.PrintErr("[NullCheck] _gridInventoryPanel is null!"); return; }
        _isGridInventoryOpen = !_isGridInventoryOpen;
        _gridInventoryPanel.Visible = _isGridInventoryOpen;

        var label = _gridInventoryPanel.GetNodeOrNull<Label>("GridLabel");
        string invText = "=== VISUELLES GRID-INVENTAR ===\n\nVorhandene Voxel-Blöcke & Gegenstände:\n";

        foreach (var (block, qty) in BlockInventory)
        {
            if (qty > 0)
            {
                invText += $" • {block}: {qty}x\n";
            }
        }
        invText += $"\nBälle: Pokéball ({PokeballCount}), Superball ({SuperballCount}), Hyperball ({HyperballCount}), Meisterball ({MasterballCount})\n";
        invText += $"Evo-Steine: Feuer ({FeuersteinCount}), Wasser ({WassersteinCount}), Donner ({DonnersteinCount})\n\nDrücke 'I' zum Schließen.";
        if (label != null) label.Text = invText;

        Input.MouseMode = _isGridInventoryOpen ? Input.MouseModeEnum.Visible : Input.MouseModeEnum.Captured;
    }

    private string _pokedexSearchFilter = "";

    private void TogglePokedex()
    {
        if (_pokedexPanel == null) { GD.PrintErr("[NullCheck] _pokedexPanel is null!"); return; }
        _isPokedexOpen = !_isPokedexOpen;
        _pokedexPanel.Visible = _isPokedexOpen;

        var label = _pokedexPanel.GetNodeOrNull<Label>("DexLabel");
        RefreshPokedexDisplay(label);

        Input.MouseMode = _isPokedexOpen ? Input.MouseModeEnum.Visible : Input.MouseModeEnum.Captured;
    }

    private void RefreshPokedexDisplay(Label? label)
    {
        if (label == null) return;
        string[] allSpecies = new string[] { "Pikachu", "Bisasam", "Bisaknosp", "Bisaflor", "Glumanda", "Glutexo", "Glurak", "Schiggy", "Schillok", "Turtok", "Raichu", "Nebulak", "Alpollo", "Gengar", "Garados", "Dragoran", "Nachtara", "Psiana", "Evoli", "Aquana", "Blitza", "Flamara", "Mewtu", "Zapdos", "Arktos" };

        int caughtCount = PokedexCaught.Count;
        string filter = _pokedexSearchFilter.Trim().ToLower();
        string dexText = $"=== VOXEL-POKÉDEX (GEFANGEN: {caughtCount}/{allSpecies.Length}) ===";
        if (!string.IsNullOrEmpty(filter)) dexText += $" | Suche: '{_pokedexSearchFilter}'";
        dexText += "\n\nAlle Spezies:\n";

        foreach (var sp in allSpecies)
        {
            if (!string.IsNullOrEmpty(filter) && !sp.ToLower().Contains(filter)) continue;
            string caughtMark = PokedexCaught.Contains(sp) ? "✅" : "❌";
            dexText += $" {caughtMark} {sp}\n";
        }

        if (Party.Count > 0)
        {
            var p = Party[0];
            dexText += $"\n📊 DV/IV INSPECTOR ({p.Species}):\nWesen: {p.Nature} | HP: {p.IvHp}/31 | Atk: {p.IvAtk}/31 | Def: {p.IvDef}/31 | Spd: {p.IvSpeed}/31";
        }

        dexText += "\n\nDrücke 'P' zum Schließen.";
        label.Text = dexText;
    }

    private bool _isMapOpen = false;
    private Panel _mapPanel = null!;

    private void ToggleMap()
    {
        _isMapOpen = !_isMapOpen;
        if (_mapPanel != null) _mapPanel.Visible = _isMapOpen;

        if (_isMapOpen)
        {
            int px = (int)GlobalPosition.X;
            int pz = (int)GlobalPosition.Z;
            DisplayFeedback($"🗺 WELTKARTE & SCHNELLREISE: Pos ({px}, {pz})\n Drücke [1-5] für Teleport:\n 1: 🏘 Dorf | 2: 🏟 Arena | 3: 🏛 Boss-Dungeon | 4: 👑 Liga | 5: ☁️ Himmelsturm");
        }
        Input.MouseMode = _isMapOpen ? Input.MouseModeEnum.Visible : Input.MouseModeEnum.Captured;
    }

    private void TeleportTo(Vector3 targetPos, string destinationName)
    {
        GlobalPosition = targetPos;
        if (_isMapOpen) ToggleMap();
        DisplayFeedback($"⚡ SCHNELLREISE: Erfolgreich nach '{destinationName}' teleportiert!");
        if (EffectsManager.Instance != null)
        {
            EffectsManager.Instance.SpawnBlockBreakEffect(targetPos, Colors.DeepSkyBlue);
            EffectsManager.Instance.PlaySoundEffect(1200.0f, 0.2f);
        }
    }

    private int _currentThemeIdx = 0;
    private void ToggleTheme()
    {
        _currentThemeIdx = (_currentThemeIdx + 1) % 3;
        string[] themeNames = new string[] { "Retro Grün", "Modern Dark-Mode", "Cyber Neon" };
        DisplayFeedback($"🎨 UI-DESIGN WECHSEL: '{themeNames[_currentThemeIdx]}' aktiviert!");
    }

    private bool _isPhotoMode = false;
    private void TogglePhotoMode()
    {
        _isPhotoMode = !_isPhotoMode;
        var hudNode = GetNodeOrNull<Control>("CanvasLayer/HUD");
        if (hudNode != null) hudNode.Visible = !_isPhotoMode;
        DisplayFeedback(_isPhotoMode ? "📸 FOTO-MODUS AKTIVIERET (HUD ausgeblendet)! Drücke 'F12' zum Beenden." : "📸 Foto-Modus beendet.");
    }

    private float _battleSpeed = 1.0f;
    private void ToggleBattleSpeed()
    {
        if (_battleSpeed == 1.0f) _battleSpeed = 2.0f;
        else if (_battleSpeed == 2.0f) _battleSpeed = 4.0f;
        else _battleSpeed = 1.0f;

        Engine.TimeScale = _battleSpeed;
        DisplayFeedback($"⏩ KAMPFTEMPO: {_battleSpeed}x Speed aktiviert!");
    }

    private void TryTriggerDynamax()
    {
        if (Party.Count == 0) return;
        var p = Party[0];
        if (p.TriggerDynamax())
        {
            DisplayFeedback($"⚡ DYNAMAX TRANSFORMATION! {p.Species} verwandelt sich in eine gigantische Voxel-Form (+100% KP)!");
            if (_activeCompanion != null && IsInstanceValid(_activeCompanion))
            {
                _activeCompanion.Scale = new Vector3(2.2f, 2.2f, 2.2f);
            }
            if (EffectsManager.Instance != null)
            {
                EffectsManager.Instance.SpawnBlockBreakEffect(GlobalPosition, Colors.Red);
                EffectsManager.Instance.PlaySoundEffect(200.0f, 0.5f);
            }
            UpdateHUD();
        }
        else
        {
            DisplayFeedback("Dieses Pokémon ist bereits im Dynamax-Zustand!");
        }
    }

    private void TryTriggerTerastallize()
    {
        if (Party.Count == 0) return;
        var p = Party[0];
        string[] teraOptions = new string[] { "Feuer", "Wasser", "Elektro", "Drache", "Stahl" };
        string chosenTera = teraOptions[(int)(GD.Randi() % teraOptions.Length)];

        if (p.TriggerTerastallize(chosenTera))
        {
            DisplayFeedback($"💎 TERA-KRISTALLISIERUNG! {p.Species} nimmt den Tera-Typ '{chosenTera}' an (+50% Schaden)!");
            if (EffectsManager.Instance != null)
            {
                EffectsManager.Instance.SpawnBlockBreakEffect(GlobalPosition, Colors.DeepSkyBlue);
                EffectsManager.Instance.PlaySoundEffect(1500.0f, 0.4f);
            }
            UpdateHUD();
        }
        else
        {
            DisplayFeedback("Dieses Pokémon ist bereits terastallisiert!");
        }
    }

    private void CookCampMeal()
    {
        if (BerryCount >= 2)
        {
            BerryCount -= 2;
            foreach (var p in Party)
            {
                p.CurrentHp = p.MaxHp;
                p.IncreaseFriendship(15);
                p.Beauty = Math.Min(255, p.Beauty + 5);
                p.Coolness = Math.Min(255, p.Coolness + 5);
            }
            DisplayFeedback("🏕️ POKÉ-FOOD GEKOCHT! Das gesamte Pokémon-Team ist vollständig geheilt & die Zuneigung (Freundschaft) ist deutlich gestiegen (+15)!");
            if (EffectsManager.Instance != null)
            {
                EffectsManager.Instance.SpawnBlockBreakEffect(GlobalPosition, Colors.DeepPink);
                EffectsManager.Instance.PlaySoundEffect(440.0f, 0.3f);
            }
            UpdateHUD();
        }
        else
        {
            DisplayFeedback("Benötigt mindestens 2x Beeren zum Kochen am Camp!");
        }
    }

    private void StartFishingMinigame()
    {
        DisplayFeedback("🎣 ANGEL AUSGEWORFEN... Warten auf Anbiss...");
        GetTree().CreateTimer(1.5f).Timeout += () =>
        {
            float roll = GD.Randf();
            if (roll < 0.7f)
            {
                string[] waterCatches = new string[] { "Schiggy", "Aquana", "Garados", "Amonitas", "Karpador" };
                string caught = waterCatches[(int)(GD.Randi() % waterCatches.Length)];
                var wild = new PokemonData(caught, (int)GD.RandRange(15, 35), 60, "Wasser", Colors.DeepSkyBlue);
                Party.Add(wild);
                DisplayFeedback($"🎣 ANBISS! Erfolgreich Wasser-Pokémon '{caught}' (Lv.{wild.Level}) gefangen!");
                UpdateHUD();
            }
            else
            {
                DisplayFeedback("🎣 Nichts angebissen! Versuche es erneut.");
            }
        };
    }

    private void TryTriggerMegaEvolution()
    {
        if (Party.Count == 0) return;
        var p = Party[0];
        if (p.TriggerMegaEvolution())
        {
            DisplayFeedback($"💥 MEGA-EVOLUTION! {p.Species} verwandelt sich im Kampf!");
            if (_activeCompanion != null && IsInstanceValid(_activeCompanion))
            {
                _activeCompanion.SetupFromData(p, isCompanion: true, owner: this);
            }
            OpenBattlePanel(_battleTarget != null ? _battleTarget.MonsterName : "Gegner", 50);
        }
        else
        {
            DisplayFeedback("Dieses Pokémon kann keine Mega-Evolution ausführen!");
        }
    }

    private void ToggleMount()
    {
        if (_activeCompanion == null || !IsInstanceValid(_activeCompanion))
        {
            DisplayFeedback("Beschwöre zuerst dein Pokémon mit 'R', um darauf zu reiten / surfen!");
            return;
        }

        IsMounted = !IsMounted;
        if (IsMounted)
        {
            DisplayFeedback($"🐉 Auf '{_activeCompanion.MonsterName}' aufgestiegen! (WASD: Reiten/Surfen | Space: Steigen/Springen)");
        }
        else
        {
            DisplayFeedback($"Abgestiegen von '{_activeCompanion.MonsterName}'.");
        }
    }

    private void HostMultiplayer()
    {
        if (MultiplayerManager.Instance != null && MultiplayerManager.Instance.HostGame())
        {
            DisplayFeedback("🌐 Multiplayer-Server gestartet! Warte auf Mitspieler...");
        }
    }

    private void JoinMultiplayer()
    {
        if (MultiplayerManager.Instance != null && MultiplayerManager.Instance.JoinGame("127.0.0.1"))
        {
            DisplayFeedback("🌐 Verbinde mit Multiplayer-Server...");
        }
    }

    private void TryStartBattle()
    {
        if (Party.Count == 0)
        {
            DisplayFeedback("Du benötigst mindestens ein Pokémon im Team zum Kämpfen!");
            return;
        }

        if (_rayCast.IsColliding())
        {
            var obj = _rayCast.GetCollider();
            if (obj is Monster wildMonster && !wildMonster.IsCompanion)
            {
                IsInBattle = true;
                _battleTarget = wildMonster;
                _trainerTarget = null;
                Input.MouseMode = Input.MouseModeEnum.Visible;
                OpenBattlePanel(wildMonster.MonsterName, wildMonster.Level);
            }
            else if (obj is NpcTrainer trainer)
            {
                if (trainer.Team.Count > 0)
                {
                    IsInBattle = true;
                    _trainerTarget = trainer;
                    _battleTarget = null;
                    Input.MouseMode = Input.MouseModeEnum.Visible;
                    int trainerLvl = IsChampion ? 70 : trainer.Team[0].Level;
                    OpenBattlePanel($"{trainer.TrainerName}'s {trainer.Team[0].Species}", trainerLvl);
                }
            }
            else
            {
                DisplayFeedback("Visire ein wildes Pokémon oder einen Trainer an und drücke 'B'!");
            }
        }
    }

    private void OpenBattlePanel(string enemyName, int enemyLevel)
    {
        if (_battlePanel == null) { GD.PrintErr("[NullCheck] _battlePanel is null!"); return; }
        var playerPokemon = Party[0];
        _battlePanel.Visible = true;

        _playerHpBar.MaxValue = playerPokemon.MaxHp;
        _playerHpBar.Value = playerPokemon.CurrentHp;

        int enemyMax = 20;
        int enemyCur = 20;
        if (_battleTarget != null && IsInstanceValid(_battleTarget))
        {
            enemyMax = _battleTarget.MaxHp;
            enemyCur = _battleTarget.CurrentHp;
        }
        else if (_trainerTarget != null && _trainerTarget.Team.Count > 0)
        {
            enemyMax = _trainerTarget.Team[0].MaxHp;
            enemyCur = _trainerTarget.Team[0].CurrentHp;
        }
        _enemyHpBar.MaxValue = enemyMax;
        _enemyHpBar.Value = enemyCur;

        string movesInfo = "";
        for (int i = 0; i < playerPokemon.Moves.Count && i < 4; i++)
        {
            var m = playerPokemon.Moves[i];
            movesInfo += $"[{i + 1}: {m.Name} ({m.ElementType}) | Pw:{m.Power} | PP:{m.CurrentPp}/{m.MaxPp}]  ";
        }

        _battleTextLabel.Text = $"=== KAMPF START! ===\nDein {playerPokemon.Species} (Lv.{playerPokemon.Level} | Speed:{playerPokemon.Speed}) vs {enemyName} (Lv.{enemyLevel})\n\nAttacke wählen:\n{movesInfo}\n\n[M: Mega-Evolution | B / Esc zum Fliehen]";
    }

    private void ExecuteBattleTurn(int moveIndex)
    {
        var playerPokemon = Party[0];
        if (moveIndex >= playerPokemon.Moves.Count) moveIndex = 0;
        var move = playerPokemon.Moves[moveIndex];

        if (EffectsManager.Instance != null)
        {
            EffectsManager.Instance.SpawnAttackVfx(move.ElementType, GlobalPosition);
        }

        if (_battleTarget != null && IsInstanceValid(_battleTarget))
        {
            int damage = BattleManager.CalculateDamage(playerPokemon, move, _battleTarget, out string attackMsg);
            if (WeatherManager.Instance != null && WeatherManager.Instance.CurrentWeather == WeatherType.Rain && move.ElementType == "Wasser")
            {
                damage = (int)(damage * 1.5f);
                attackMsg += " (Regen-Bonus +50%!)";
            }
            _battleTarget.TakeDamage(damage);
            _enemyHpBar.Value = _battleTarget.CurrentHp;

            if (_battleTarget.CurrentHp <= 0)
            {
                int xpReward = _battleTarget.Level * 30;
                string prevSpecies = playerPokemon.Species;
                bool leveledUp = playerPokemon.GainXp(xpReward);
                string lvlMsg = leveledUp ? $" -> LEVEL UP! Lv. {playerPokemon.Level}!" : "";

                DisplayFeedback($"{attackMsg}\n{_battleTarget.MonsterName} besiegt! +{xpReward} XP{lvlMsg}");

                if (playerPokemon.PendingEvolutionTarget != null)
                {
                    StartEvolutionCutscene(playerPokemon, playerPokemon.PendingEvolutionTarget);
                }

                if ((_battleTarget.MonsterName == "Mewtu" || _battleTarget.MonsterName == "Zapdos" || _battleTarget.MonsterName == "Arktos" || _battleTarget.MonsterName == "Lugia" || _battleTarget.MonsterName == "Ho-Oh") && QuestManager.ProgressQuest("boss", 1, out string qMsgBoss))
                {
                    DisplayFeedback(qMsgBoss);
                }

                _battleTarget.QueueFree();
                EndBattle("");
                return;
            }

            int counterDmg = Math.Max(1, (int)(_battleTarget.Level * 1.2f));

            string statusMsg = "";
            if (playerPokemon.CurrentHp > 0 && (playerPokemon.Status == StatusCondition.Burned || playerPokemon.Status == StatusCondition.Poisoned))
            {
                int statusDmg = Math.Max(1, (int)(playerPokemon.MaxHp * 0.1f));
                playerPokemon.CurrentHp = Math.Max(0, playerPokemon.CurrentHp - statusDmg);
                statusMsg = $"\nDein Pokémon erleidet {statusDmg} Schaden durch seinen Status!";
            }

            playerPokemon.CurrentHp = Math.Max(0, playerPokemon.CurrentHp - counterDmg);
            _playerHpBar.Value = playerPokemon.CurrentHp;

            if (playerPokemon.CurrentHp <= 0)
            {
                EndBattle($"{attackMsg}\n{_battleTarget.MonsterName} greift an (-{counterDmg} KP)!{statusMsg}\nDein {playerPokemon.Species} ist kampfunfähig!");
            }
            else
            {
                _battleTextLabel.Text = $"{attackMsg}{statusMsg}\nWilde/s {_battleTarget.MonsterName} kontert (-{counterDmg} KP)!\n\nAttacke wählen (1-4), M für Mega-Evolution oder B zum Fliehen.";
            }
        }
        else if (_trainerTarget != null && _trainerTarget.Team.Count > 0)
        {
            var enemyData = _trainerTarget.Team[0];
            int finalDamage = BattleManager.CalculateDamageAgainstTrainer(playerPokemon, move, enemyData, out string attackMsg);
            enemyData.CurrentHp = Math.Max(0, enemyData.CurrentHp - finalDamage);
            _enemyHpBar.Value = enemyData.CurrentHp;

            if (enemyData.CurrentHp <= 0)
            {
                _trainerTarget.Team.RemoveAt(0);
                if (_trainerTarget.Team.Count == 0)
                {
                    string badge = _trainerTarget.BadgeName;
                    if (!Badges.Contains(badge)) Badges.Add(badge);
                    if (QuestManager.ProgressQuest("gyms", 1, out string qMsg))
                    {
                        DisplayFeedback(qMsg);
                    }
                    if (Badges.Count >= 8 || _trainerTarget.TrainerName.Contains("Liga") || _trainerTarget.TrainerName.Contains("Meister"))
                    {
                        RecordHallOfFameVictory();
                    }
                    if (EffectsManager.Instance != null) EffectsManager.Instance.SpawnFireworksEffect(GlobalPosition);
                    EndBattle($"🏆 ARENA-SIEGE GEWONNEN! Orden '{badge}' erhalten! (Orden: {Badges.Count}/8)");
                    return;
                }
            }

            int counterDmg = Math.Max(1, (int)(enemyData.Level * 1.3f));

            string statusMsg = "";
            if (playerPokemon.CurrentHp > 0 && (playerPokemon.Status == StatusCondition.Burned || playerPokemon.Status == StatusCondition.Poisoned))
            {
                int statusDmg = Math.Max(1, (int)(playerPokemon.MaxHp * 0.1f));
                playerPokemon.CurrentHp = Math.Max(0, playerPokemon.CurrentHp - statusDmg);
                statusMsg = $"\nDein Pokémon erleidet {statusDmg} Schaden durch seinen Status!";
            }

            playerPokemon.CurrentHp = Math.Max(0, playerPokemon.CurrentHp - counterDmg);
            _playerHpBar.Value = playerPokemon.CurrentHp;

            if (playerPokemon.CurrentHp <= 0)
            {
                EndBattle($"{attackMsg}\nTrainer-Pokémon greift an (-{counterDmg} KP)!{statusMsg}\nDein {playerPokemon.Species} ist kampfunfähig!");
            }
            else
            {
                _battleTextLabel.Text = $"{attackMsg}{statusMsg}\nTrainer-Pokémon kontert (-{counterDmg} KP)!\n\nAttacke wählen (1-4) oder B zum Fliehen.";
            }
        }
        else
        {
            EndBattle("Kampf beendet.");
        }

        UpdateHUD();
    }

    private void EndBattle(string feedback)
    {
        IsInBattle = false;
        _battleTarget = null;
        _trainerTarget = null;
        if (_battlePanel != null) _battlePanel.Visible = false;
        Input.MouseMode = Input.MouseModeEnum.Captured;
        if (!string.IsNullOrEmpty(feedback)) DisplayFeedback(feedback);
        UpdateHUD();
    }

    private void ThrowPokeball()
    {
        if (PokeballCount <= 0 && SuperballCount <= 0 && HyperballCount <= 0 && MasterballCount <= 0)
        {
            DisplayFeedback("Du hast keine Bälle mehr!");
            return;
        }

        float catchMultiplier = 1.0f;
        if (MasterballCount > 0)
        {
            MasterballCount--;
            catchMultiplier = 100.0f;
            DisplayFeedback("⭐ MEISTERBALL GEWORFEN! (100% Fanggarantie)");
        }
        else if (HyperballCount > 0)
        {
            HyperballCount--;
            catchMultiplier = 2.5f;
            DisplayFeedback("🟡 HYPERBALL GEWORFEN! (2.5x Fangchance)");
        }
        else if (SuperballCount > 0)
        {
            SuperballCount--;
            catchMultiplier = 1.6f;
            DisplayFeedback("🔵 SUPERBALL GEWORFEN! (1.6x Fangchance)");
        }
        else
        {
            PokeballCount--;
        }
        UpdateHUD();

        var pokeballScene = GD.Load<PackedScene>("res://Scenes/Pokeball.tscn");
        var pokeball = pokeballScene.Instantiate<Pokeball>();
        pokeball.CatchRateMultiplier = catchMultiplier;

        pokeball.GlobalPosition = _camera.GlobalPosition - _camera.GlobalTransform.Basis.Z * 0.5f;
        Vector3 impulse = -_camera.GlobalTransform.Basis.Z * 15.0f + Vector3.Up * 2.0f;
        pokeball.LinearVelocity = impulse;

        GetNode("/root").AddChild(pokeball);

        if (EffectsManager.Instance != null)
        {
            EffectsManager.Instance.PlaySoundEffect(500.0f, 0.12f);
        }
    }

    private void TryInteract(bool mine)
    {
        if (!_rayCast.IsColliding()) return;

        Vector3 hitPoint = _rayCast.GetCollisionPoint();
        Vector3 hitNormal = _rayCast.GetCollisionNormal();
        var collider = _rayCast.GetCollider();

        if (mine)
        {
            if (collider is HostileMob mob)
            {
                mob.TakeDamage(10);
                DisplayFeedback($"Voxel-Creeper angegriffen (-10 KP)!");
                return;
            }

            Vector3 target = hitPoint - hitNormal * 0.1f;
            Vector3I blockCoords = new Vector3I(Mathf.RoundToInt(target.X), Mathf.RoundToInt(target.Y), Mathf.RoundToInt(target.Z));

            BlockType hitBlock = _terrain.GetBlock(blockCoords);
            if (hitBlock != BlockType.Air)
            {
                if (hitBlock == BlockType.IronOre && CurrentTool == "Hand")
                {
                    DisplayFeedback("⚠️ Eisenerz erfordert eine Stein- oder Eisenspitzhacke!");
                    return;
                }
                if (hitBlock == BlockType.PokeballOre && CurrentTool != "Eisen-Spitzhacke")
                {
                    DisplayFeedback("⚠️ Pokéball-Erz erfordert eine Eisen-Spitzhacke!");
                    return;
                }

                _terrain.SetBlock(blockCoords, BlockType.Air);
                if (hitBlock == BlockType.BerryBushBlock)
                {
                    BerryCount += 3;
                    if (QuestManager.ProgressQuest("berries", 3, out string qMsg)) DisplayFeedback(qMsg);
                }
                else
                {
                    if (!BlockInventory.ContainsKey(hitBlock)) BlockInventory[hitBlock] = 0;
                    BlockInventory[hitBlock]++;
                }

                if (hitBlock == BlockType.Stone || hitBlock == BlockType.IronOre || hitBlock == BlockType.CoalOre || hitBlock == BlockType.PokeballOre)
                {
                    if (GD.Randf() < 0.04f)
                    {
                        int stoneRoll = (int)(GD.Randi() % 3);
                        if (stoneRoll == 0) { FeuersteinCount++; DisplayFeedback("🔥 Du hast einen Feuerstein gefunden!"); }
                        else if (stoneRoll == 1) { WassersteinCount++; DisplayFeedback("🌊 Du hast einen Wasserstein gefunden!"); }
                        else { DonnersteinCount++; DisplayFeedback("⚡ Du hast einen Donnerstein gefunden!"); }
                    }
                }
                UpdateHUD();
            }
        }
        else
        {
            if (collider is NpcVillager villager)
            {
                TradeWithVillager();
                return;
            }

            Vector3 target = hitPoint + hitNormal * 0.1f;
            Vector3I blockCoords = new Vector3I(Mathf.RoundToInt(target.X), Mathf.RoundToInt(target.Y), Mathf.RoundToInt(target.Z));

            Vector3 targetInside = hitPoint - hitNormal * 0.1f;
            Vector3I existingBlockCoords = new Vector3I(Mathf.RoundToInt(targetInside.X), Mathf.RoundToInt(targetInside.Y), Mathf.RoundToInt(targetInside.Z));
            BlockType clickedBlock = _terrain.GetBlock(existingBlockCoords);

            if (clickedBlock == BlockType.HealStationBlock || clickedBlock == BlockType.JoyNpcBlock)
            {
                HealAllPokemon();
                return;
            }
            else if (clickedBlock == BlockType.BreedingPenBlock)
            {
                TriggerBreeding();
                return;
            }
            else if (clickedBlock == BlockType.JuicerBlock)
            {
                BrewPotion();
                return;
            }
            else if (clickedBlock == BlockType.ExtractorBlock)
            {
                ExtractFossil();
                return;
            }
            else if (clickedBlock == BlockType.TowerStone)
            {
                StartBattleTowerWave();
                return;
            }
            else if (clickedBlock == BlockType.Water)
            {
                StartFishing();
                return;
            }
            else if (clickedBlock == BlockType.JukeboxBlock)
            {
                if (EffectsManager.Instance != null) EffectsManager.Instance.PlayCustomSynthMelody();
                DisplayFeedback("📻 VOXEL-JUKEBOX & SYNTH COMPOSER: Eigenkomponierte 8-Bit Melodie wird abgespielt!");
                return;
            }
            else if (clickedBlock == BlockType.SecretBaseDoorBlock)
            {
                GlobalPosition = new Vector3(20.0f, 25.5f, 20.0f);
                DisplayFeedback("🚪 GEHEIMBASIS: Betreten! Willkommen in deiner Voxel-Geheimbasis im Himmelsturm!");
                return;
            }
            else if (clickedBlock == BlockType.BerrySproutBlock)
            {
                _terrain.SetBlock(existingBlockCoords, BlockType.BerryBushBlock);
                DisplayFeedback("💧 SCHIGGY-GIESSKANNE: Beeren-Keimling gegossen! Beerenstrauch gewachsen!");
                return;
            }
            else if (clickedBlock == BlockType.ComposterBlock)
            {
                DisplayFeedback("🌾 KOMPOSTER: Spezial-Dünger hergestellt! Beeren-Ertrag verdoppelt!");
                return;
            }
            else if (clickedBlock == BlockType.MeteorBlock)
            {
                var monsterScene = GD.Load<PackedScene>("res://Scenes/Monster.tscn");
                var deoxys = monsterScene.Instantiate<Monster>();
                deoxys.GlobalPosition = GlobalPosition + new Vector3(1, 0, 1);
                string[] forms = new string[] { "Deoxys", "Deoxys-Angriff", "Deoxys-Verteidigung", "Deoxys-Initiative" };
                deoxys.MonsterName = forms[(int)(GD.Randi() % 4)];
                deoxys.Level = 70;
                GetNode("/root").CallDeferred("add_child", deoxys);
                DisplayFeedback($"☄️ METEORIT-EVENT: Mysteriöses {deoxys.MonsterName} aus dem All gestiegen!");
                return;
            }
            else if (clickedBlock == BlockType.ContestRibbonBlock)
            {
                if (Party.Count == 0)
                {
                    DisplayFeedback("Du benötigst ein Pokémon im Team für den Wettbewerb!");
                    return;
                }
                var p = Party[0];
                int contestScore = p.Coolness + p.Beauty + p.Cuteness + p.Cleverness + p.Toughness + (p.Friendship / 2);
                p.ContestRibbons++;
                p.IncreaseFriendship(20);

                DisplayFeedback($"👑 VOXEL-WETTBEWERBS-BÜHNE:\nJury-Wertung für {p.Species}: {contestScore} PUNKTE!\n🎉 Auszeichnung erhalten: Band #{p.ContestRibbons} verliehen!");
                if (EffectsManager.Instance != null)
                {
                    EffectsManager.Instance.SpawnFireworksEffect(GlobalPosition);
                    EffectsManager.Instance.PlayCustomSynthMelody();
                }
                UpdateHUD();
                return;
            }
            else if (clickedBlock == BlockType.RaidDenBlock)
            {
                TriggerRaidDenBattle();
                return;
            }
            else if (clickedBlock == BlockType.HelperStationBlock)
            {
                TriggerHelperAutomation();
                return;
            }
            else if (clickedBlock == BlockType.ArenaPuzzleSwitch)
            {
                DisplayFeedback("💡 ARENA-SCHALTER AKTIVIERT! Das Schutzgitter zum Arenaleiter öffnet sich!");
                if (EffectsManager.Instance != null) EffectsManager.Instance.PlaySoundEffect(950.0f, 0.3f);
                return;
            }
            else if (clickedBlock == BlockType.IceSlideBlock)
            {
                Velocity += Transform.Basis.Z * -15.0f; // Rapid ice slide boost
                DisplayFeedback("⛸ EISRUTSCH-FLÄCHE! Turbo-Gleiten aktiviert!");
                if (EffectsManager.Instance != null) EffectsManager.Instance.PlaySoundEffect(1200.0f, 0.2f);
                return;
            }
            else if (clickedBlock == BlockType.RailTrackBlock)
            {
                Speed = 12.0f; // High speed minecart / rail travel
                DisplayFeedback("🚋 LOREN-SCHIENEN: Express-Fahrt zwischen den Städten aktiv!");
                if (EffectsManager.Instance != null) EffectsManager.Instance.PlaySoundEffect(400.0f, 0.2f);
                return;
            }
            else if (clickedBlock == BlockType.RanchTroughBlock)
            {
                TriggerRanchCare();
                return;
            }

            Vector3 playerMin = GlobalPosition - new Vector3(0.4f, 1.0f, 0.4f);
            Vector3 playerMax = GlobalPosition + new Vector3(0.4f, 1.0f, 0.4f);

            if (blockCoords.X >= playerMin.X && blockCoords.X <= playerMax.X &&
                blockCoords.Y >= playerMin.Y && blockCoords.Y <= playerMax.Y &&
                blockCoords.Z >= playerMin.Z && blockCoords.Z <= playerMax.Z)
            {
                return;
            }

            BlockType placingBlock = _hotbarBlocks[_selectedHotbarIndex];
            if (BlockInventory.TryGetValue(placingBlock, out int count) && count > 0)
            {
                if (_terrain.SetBlock(blockCoords, placingBlock))
                {
                    BlockInventory[placingBlock]--;

                    // Dynamic light source for placed TorchBlock
                    if (placingBlock == BlockType.TorchBlock)
                    {
                        var torchLight = new OmniLight3D();
                        torchLight.GlobalPosition = new Vector3(blockCoords.X, blockCoords.Y + 0.5f, blockCoords.Z);
                        torchLight.LightColor = new Color(1.0f, 0.7f, 0.3f);
                        torchLight.OmniRange = 8.0f;
                        torchLight.LightEnergy = 2.0f;
                        GetNode("/root").AddChild(torchLight);
                    }

                    UpdateHUD();
                }
            }
            else
            {
                DisplayFeedback($"Kein '{placingBlock}' mehr im Inventar!");
            }
        }
    }

    private void CycleTools()
    {
        List<string> availableTools = new List<string> { "Hand" };
        if (HasStonePickaxe) availableTools.Add("Stein-Spitzhacke");
        if (HasIronPickaxe) availableTools.Add("Eisen-Spitzhacke");

        int currentIdx = availableTools.IndexOf(CurrentTool);
        if (currentIdx == -1) currentIdx = 0;
        int nextIdx = (currentIdx + 1) % availableTools.Count;
        CurrentTool = availableTools[nextIdx];

        DisplayFeedback($"Ausgerüstetes Werkzeug: {CurrentTool}");
        UpdateHUD();
    }

    private void BrewPotion()
    {
        if (BerryCount >= 3)
        {
            BerryCount -= 3;
            if (Party.Count > 0)
            {
                var lead = Party[0];
                int choice = (int)(GD.Randi() % 3);
                if (choice == 0)
                {
                    lead.MaxHp += 10;
                    lead.CurrentHp = lead.MaxHp;
                    DisplayFeedback($"🍹 BEEREN-ENTSAFTER: 3x Beeren gepresst ➔ KP-PLUS (+10 KP für {lead.Species})!");
                }
                else if (choice == 1)
                {
                    lead.Speed += 5;
                    DisplayFeedback($"🍹 BEEREN-ENTSAFTER: 3x Beeren gepresst ➔ PROTEIN (+5 Initiative für {lead.Species})!");
                }
                else
                {
                    lead.Defense += 5;
                    DisplayFeedback($"🍹 BEEREN-ENTSAFTER: 3x Beeren gepresst ➔ KALZIUM (+5 Verteidigung für {lead.Species})!");
                }
            }
            else
            {
                DisplayFeedback("🧪 BEEREN-ENTSAFTER: Top-Trank gebraut!");
            }
            UpdateHUD();
        }
        else
        {
            DisplayFeedback("⚠️ Du benötigst mindestens 3 Beeren für den Beeren-Entsafter!");
        }
    }

    private void ExtractFossil()
    {
        if (BlockInventory.TryGetValue(BlockType.FossilBlock, out int fossils) && fossils > 0)
        {
            BlockInventory[BlockType.FossilBlock]--;
            string[] fossilPokemon = new string[] { "Amonitas", "Kabuto", "Aerodactyl" };
            string chosen = fossilPokemon[Random.Shared.Next(0, fossilPokemon.Length)];
            bool isAncientShiny = Random.Shared.NextDouble() < 0.15;
            var fossilPoke = new PokemonData(chosen, 30, 110, "Gestein", Colors.Burlywood, isShiny: isAncientShiny);
            
            // Ancient DNA grants flawless IVs in two stats
            fossilPoke.IvHp = 31;
            fossilPoke.IvAtk = 31;
            fossilPoke.RecalculateStats();
            fossilPoke.IncreaseFriendship(30);

            OnPokemonCapturedHandler(fossilPoke);
            string shinyText = isAncientShiny ? " ✨ [URZEIT-SHINY] ✨" : "";
            DisplayFeedback($"🔬 FOSSILIEN-LABOR: DNA-Sequenzierung abgeschlossen! Antikes {chosen}{shinyText} (Lv.30 | Perfekte 31 IVs) erfolgreich reanimiert!");
            if (EffectsManager.Instance != null)
            {
                EffectsManager.Instance.SpawnBlockBreakEffect(GlobalPosition, Colors.Cyan);
                EffectsManager.Instance.PlaySoundEffect(1400.0f, 0.4f);
            }
            UpdateHUD();
        }
        else
        {
            DisplayFeedback("⚠️ Du benötigst mindestens einen Fossil-Block im Inventar für das DNA-Labor!");
        }
    }

    private void StartBattleTowerWave()
    {
        if (Party.Count == 0)
        {
            DisplayFeedback("Kein Pokémon für den Duellturm!");
            return;
        }

        var towerLeader = new NpcTrainer();
        towerLeader.TrainerName = "Duellturm Meister";
        towerLeader.Title = "Voxel-Duellturm";
        towerLeader.BadgeName = "Duellturm-Sieger";

        towerLeader.Team.Add(new PokemonData("Mega-Lucario", 65, 200, "Kampf/Stahl", Colors.DodgerBlue));
        towerLeader.Team.Add(new PokemonData("Mega-Knakrack", 68, 220, "Drache/Boden", Colors.DarkSlateBlue));
        towerLeader.Team.Add(new PokemonData("Lugia", 70, 250, "Psycho/Flug", Colors.Snow));

        _trainerTarget = towerLeader;
        IsInBattle = true;
        if (_battlePanel != null) _battlePanel.Visible = true;
        if (_battleTextLabel != null) _battleTextLabel.Text = $"🏆 DUELLTURM HERAUSFORDERUNG BEGONNEN!\nDu kämpfst gegen den Duellturm-Meister!";
        if (EffectsManager.Instance != null) EffectsManager.Instance.PlayBattleStartJingle();
    }

    private void StartFishing()
    {
        string[] waterPokemon = new string[] { "Karpador", "Schiggy", "Aquana", "Garados", "Amonitas" };
        string chosen = waterPokemon[GD.Randi() % waterPokemon.Length];
        var fishedPoke = new PokemonData(chosen, 20, 90, "Wasser", Colors.DeepSkyBlue);
        OnPokemonCapturedHandler(fishedPoke);
        DisplayFeedback($"🎣 ANGEL-ERFOLG! Ein wildes '{chosen}' hat an deiner Voxel-Angel angebissen!");
    }

    private void TryApplyEvolutionStones()
    {
        if (Party.Count == 0)
        {
            DisplayFeedback("Kein Pokémon im Team!");
            return;
        }

        var p = Party[0];
        bool evolved = false;
        string stoneUsed = "";

        if (DonnersteinCount > 0 && (p.Species == "Pikachu" || p.Species == "Evoli"))
        {
            evolved = p.ApplyEvolutionStone("Donnerstein");
            if (evolved)
            {
                DonnersteinCount--;
                stoneUsed = "Donnerstein";
            }
        }
        else if (WassersteinCount > 0 && (p.Species == "Schiggy" || p.Species == "Schillok" || p.Species == "Evoli"))
        {
            evolved = p.ApplyEvolutionStone("Wasserstein");
            if (evolved)
            {
                WassersteinCount--;
                stoneUsed = "Wasserstein";
            }
        }
        else if (FeuersteinCount > 0 && (p.Species == "Glumanda" || p.Species == "Glutexo" || p.Species == "Evoli"))
        {
            evolved = p.ApplyEvolutionStone("Feuerstein");
            if (evolved)
            {
                FeuersteinCount--;
                stoneUsed = "Feuerstein";
            }
        }

        if (evolved)
        {
            DisplayFeedback($"✨ EVOLUTION! {stoneUsed} angewendet! {p.Species} hat sich entwickelt!");
            if (_activeCompanion != null && IsInstanceValid(_activeCompanion))
            {
                _activeCompanion.SetupFromData(p, isCompanion: true, owner: this);
            }
        }
        else
        {
            DisplayFeedback($"Keine Evolution möglich! Steine: Feuer:{FeuersteinCount} Wasser:{WassersteinCount} Donner:{DonnersteinCount}");
        }
        UpdateHUD();
    }

    private void TradeWithVillager()
    {
        int ironCount = BlockInventory.GetValueOrDefault(BlockType.IronOre, 0);
        if (ironCount >= 2)
        {
            BlockInventory[BlockType.IronOre] -= 2;
            MasterballCount++;
            if (Party.Count > 0 && Party[0].HeldItem == "Keins") Party[0].HeldItem = "Glücks-Ei";
            DisplayFeedback("⭐ HANDEL ERFOLGREICH! 2x Eisenerz getauscht gegen 1x MEISTERBALL + Glücks-Ei!");
            UpdateHUD();
        }
        else
        {
            DisplayFeedback("🧑‍🌾 HÄNDLER: 'Bringe mir 2x Eisenerz für einen MEISTERBALL + Glücks-Ei!'");
        }
    }

    private void TriggerBreeding()
    {
        if (Party.Count < 2)
        {
            DisplayFeedback("Du benötigst mindestens 2 Pokémon in deinem Team für die Zucht!");
            return;
        }

        var egg = BreedingManager.CreateEgg(Party[0], Party[1]);
        DisplayFeedback($"🥚 ZUCHT GESTARTET! Ein Pokémon-Ei ({egg.ExpectedSpecies}) liegt in der Pension! (Wesen & DVs vererbt!)");
    }

    private void HealAllPokemon()
    {
        if (Party.Count == 0) return;
        foreach (var p in Party)
        {
            p.HealAll();
        }
        DisplayFeedback("✨ Poké-Center Heil-Station aktiviert! Dein gesamtes Team wurde geheilt!");
        if (EffectsManager.Instance != null)
        {
            EffectsManager.Instance.PlaySoundEffect(880.0f, 0.3f);
        }
        UpdateHUD();
    }

    private void ToggleCompanion()
    {
        if (_activeCompanion != null && IsInstanceValid(_activeCompanion))
        {
            DisplayFeedback($"'{_activeCompanion.MonsterName}' in Pokeball zurückgerufen.");
            _activeCompanion.QueueFree();
            _activeCompanion = null;
            IsMounted = false;
            return;
        }

        if (Party.Count == 0)
        {
            DisplayFeedback("Du hast noch kein Pokémon im Team zum Beschwören!");
            return;
        }

        var partyPokemon = Party[0];
        PackedScene monsterScene = GD.Load<PackedScene>("res://Scenes/Monster.tscn");
        _activeCompanion = monsterScene.Instantiate<Monster>();
        _activeCompanion.GlobalPosition = GlobalPosition + -Transform.Basis.Z * 2.0f + Vector3.Up * 0.5f;

        GetNode("/root").AddChild(_activeCompanion);
        _activeCompanion.SetupFromData(partyPokemon, isCompanion: true, owner: this);
        if (EffectsManager.Instance != null) EffectsManager.Instance.PlayPokemonCry(partyPokemon.Species);
        DisplayFeedback($"'{partyPokemon.Species}' als Begleiter beschworen!");
    }

    private void ToggleCrafting()
    {
        if (_craftingPanel == null) { GD.PrintErr("[NullCheck] _craftingPanel is null!"); return; }
        _isCraftingOpen = !_isCraftingOpen;
        _craftingPanel.Visible = _isCraftingOpen;
        Input.MouseMode = _isCraftingOpen ? Input.MouseModeEnum.Visible : Input.MouseModeEnum.Captured;
    }

    private void TogglePC()
    {
        if (_pcPanel == null) { GD.PrintErr("[NullCheck] _pcPanel is null!"); return; }
        _isPcOpen = !_isPcOpen;
        _pcPanel.Visible = _isPcOpen;

        var label = _pcPanel.GetNodeOrNull<Label>("PCLabel");
        string pcText = "=== DIGITALES PC-BOXEN-SYSTEM ===\n\nAbgelegte Pokémon:\n";
        if (PCStorage.Count == 0)
        {
            pcText += " (Keine Pokémon im PC aufbewahrt)";
        }
        else
        {
            for (int i = 0; i < PCStorage.Count; i++)
            {
                var p = PCStorage[i];
                pcText += $" {i + 1}. {p.Species} (Lv.{p.Level} | {p.ElementType})\n";
            }
        }
        pcText += "\n\nDrücke 'E' zum Schließen.";
        if (label != null) label.Text = pcText;

        Input.MouseMode = _isPcOpen ? Input.MouseModeEnum.Visible : Input.MouseModeEnum.Captured;
    }

    private void CraftPokeball()
    {
        int oreCount = (BlockInventory.GetValueOrDefault(BlockType.PokeballOre, 0)) + (BlockInventory.GetValueOrDefault(BlockType.IronOre, 0));
        int woodCount = BlockInventory.GetValueOrDefault(BlockType.Wood, 0);

        if (oreCount >= 1 && woodCount >= 1)
        {
            if (BlockInventory.GetValueOrDefault(BlockType.PokeballOre, 0) > 0) BlockInventory[BlockType.PokeballOre]--;
            else BlockInventory[BlockType.IronOre]--;
            BlockInventory[BlockType.Wood]--;
            PokeballCount += 3;
            DisplayFeedback("+3 Pokebälle gecraftet!");
            UpdateHUD();
        }
        else DisplayFeedback("Nicht genug Materialien! Benötigt: 1x Erz + 1x Holz.");
    }

    private void CraftStonePickaxe()
    {
        int stoneCount = BlockInventory.GetValueOrDefault(BlockType.Stone, 0);
        int woodCount = BlockInventory.GetValueOrDefault(BlockType.Wood, 0);

        if (stoneCount >= 3 && woodCount >= 2)
        {
            BlockInventory[BlockType.Stone] -= 3;
            BlockInventory[BlockType.Wood] -= 2;
            HasStonePickaxe = true;
            DisplayFeedback("🛠️ Stein-Spitzhacke hergestellt!");
            UpdateHUD();
        }
        else DisplayFeedback("Nicht genug Materialien! Benötigt: 3x Stein + 2x Holz.");
    }

    private void CraftIronPickaxe()
    {
        int ironCount = BlockInventory.GetValueOrDefault(BlockType.IronOre, 0);
        int woodCount = BlockInventory.GetValueOrDefault(BlockType.Wood, 0);

        if (ironCount >= 3 && woodCount >= 2)
        {
            BlockInventory[BlockType.IronOre] -= 3;
            BlockInventory[BlockType.Wood] -= 2;
            HasIronPickaxe = true;
            DisplayFeedback("🛠️ Eisen-Spitzhacke hergestellt!");
            UpdateHUD();
        }
        else DisplayFeedback("Nicht genug Materialien! Benötigt: 3x Eisenerz + 2x Holz.");
    }

    private void CraftSuperball()
    {
        int ironCount = BlockInventory.GetValueOrDefault(BlockType.IronOre, 0);
        int sandCount = BlockInventory.GetValueOrDefault(BlockType.Sand, 0);

        if (ironCount >= 1 && sandCount >= 1)
        {
            BlockInventory[BlockType.IronOre]--;
            BlockInventory[BlockType.Sand]--;
            SuperballCount += 2;
            DisplayFeedback("🔵 +2 Superbälle gecraftet!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 1x Eisenerz + 1x Sand.");
    }

    private void CraftHyperball()
    {
        int ironCount = BlockInventory.GetValueOrDefault(BlockType.IronOre, 0);
        int coalCount = BlockInventory.GetValueOrDefault(BlockType.CoalOre, 0);

        if (ironCount >= 1 && coalCount >= 1)
        {
            BlockInventory[BlockType.IronOre]--;
            BlockInventory[BlockType.CoalOre]--;
            HyperballCount += 1;
            DisplayFeedback("🟡 +1 Hyperball gecraftet!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 1x Eisenerz + 1x Kohle.");
    }

    private void CraftTrophyBlock()
    {
        int ironCount = BlockInventory.GetValueOrDefault(BlockType.IronOre, 0);
        int plankCount = BlockInventory.GetValueOrDefault(BlockType.Planks, 0);

        if (ironCount >= 2 && plankCount >= 1)
        {
            BlockInventory[BlockType.IronOre] -= 2;
            BlockInventory[BlockType.Planks]--;
            if (!BlockInventory.ContainsKey(BlockType.TrophyBlock)) BlockInventory[BlockType.TrophyBlock] = 0;
            BlockInventory[BlockType.TrophyBlock]++;
            DisplayFeedback("🏆 +1 Trophäen-Block gecraftet!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 2x Eisenerz + 1x Bretter.");
    }

    private void CraftPlanks()
    {
        int woodCount = BlockInventory.GetValueOrDefault(BlockType.Wood, 0);
        if (woodCount >= 1)
        {
            BlockInventory[BlockType.Wood]--;
            if (!BlockInventory.ContainsKey(BlockType.Planks)) BlockInventory[BlockType.Planks] = 0;
            BlockInventory[BlockType.Planks] += 4;
            DisplayFeedback("+4 Holzbretter gecraftet!");
            UpdateHUD();
        }
        else DisplayFeedback("Nicht genug Holz! Benötigt: 1x Holz.");
    }

    private void CraftHealStation()
    {
        int ironCount = BlockInventory.GetValueOrDefault(BlockType.IronOre, 0);
        int pokeOreCount = BlockInventory.GetValueOrDefault(BlockType.PokeballOre, 0);
        if (ironCount >= 2 && pokeOreCount >= 1)
        {
            BlockInventory[BlockType.IronOre] -= 2;
            BlockInventory[BlockType.PokeballOre] -= 1;
            if (!BlockInventory.ContainsKey(BlockType.HealStationBlock)) BlockInventory[BlockType.HealStationBlock] = 0;
            BlockInventory[BlockType.HealStationBlock]++;
            DisplayFeedback("+1 Heil-Station gecraftet!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 2x Eisenerz + 1x PokeballErz.");
    }

    private void CraftTorches()
    {
        int coalCount = BlockInventory.GetValueOrDefault(BlockType.CoalOre, 0);
        int woodCount = BlockInventory.GetValueOrDefault(BlockType.Wood, 0);
        if (coalCount >= 1 && woodCount >= 1)
        {
            BlockInventory[BlockType.CoalOre]--;
            BlockInventory[BlockType.Wood]--;
            if (!BlockInventory.ContainsKey(BlockType.TorchBlock)) BlockInventory[BlockType.TorchBlock] = 0;
            BlockInventory[BlockType.TorchBlock] += 4;
            DisplayFeedback("+4 Fackeln gecraftet!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 1x Kohle + 1x Holz.");
    }

    private void CraftBreedingPen()
    {
        int woodCount = BlockInventory.GetValueOrDefault(BlockType.Wood, 0);
        int planksCount = BlockInventory.GetValueOrDefault(BlockType.Planks, 0);
        if (woodCount >= 2 && planksCount >= 2)
        {
            BlockInventory[BlockType.Wood] -= 2;
            BlockInventory[BlockType.Planks] -= 2;
            if (!BlockInventory.ContainsKey(BlockType.BreedingPenBlock)) BlockInventory[BlockType.BreedingPenBlock] = 0;
            BlockInventory[BlockType.BreedingPenBlock]++;
            DisplayFeedback("+1 Zucht-Stall gecraftet!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 2x Holz + 2x Bretter.");
    }

    private void UpdateHUD()
    {
        if (_hotbarLabel == null) return;

        string hotbarText = $"WERKZEUG: [{CurrentTool}] (G zum Wechseln) | HOTBAR:  ";
        for (int i = 0; i < _hotbarBlocks.Length; i++)
        {
            BlockType type = _hotbarBlocks[i];
            int qty = BlockInventory.GetValueOrDefault(type, 0);
            string activeStr = (i == _selectedHotbarIndex) ? $" >[{i + 1}: {type} ({qty})]< " : $" [{i + 1}: {type} ({qty})] ";
            hotbarText += activeStr;
        }
        _hotbarLabel.Text = hotbarText;

        string partyText = "POKÉMON-TEAM:\n";
        if (Party.Count == 0)
        {
            partyText += " (Keine Pokémon gefangen)";
        }
        else
        {
            for (int i = 0; i < Party.Count; i++)
            {
                var p = Party[i];
                string shinyStr = p.IsShiny ? "✨ " : "";
                partyText += $" {i + 1}. {shinyStr}{p.Species} (Lv.{p.Level} | {p.Nature} | {p.Ability} | {p.ElementType} | KP:{p.CurrentHp}/{p.MaxHp})\n";
            }
        }
        _partyLabel.Text = partyText;

        string badgesStr = Badges.Count == 0 ? "Keine" : string.Join(", ", Badges);
        string weatherStr = WeatherManager.Instance != null ? WeatherManager.Instance.CurrentWeather.ToString() : "Klar";
        string invText = $"BÄLLE: P:{PokeballCount} | 🔵S:{SuperballCount} | 🟡H:{HyperballCount} | ⭐M:{MasterballCount} | ⚓Schwer:{HeavyballCount} | 🕸Netz:{NetballCount} | 🌙Finster:{DuskballCount} | 🌊Tauch:{DiveballCount}\n";
        invText += $"EVO-STEINE & CROP: 🔥Feuer:{FeuersteinCount} | 🌊Wasser:{WassersteinCount} | ⚡Donner:{DonnersteinCount} | 🍊Aprikoko:{ApricornCount} | 🌾Beeren:{BerryCount}\n";
        invText += $"INVENTAR-MATERIALIEN:\n";
        invText += $" PokeballOre: {BlockInventory.GetValueOrDefault(BlockType.PokeballOre, 0)}  |  IronOre: {BlockInventory.GetValueOrDefault(BlockType.IronOre, 0)}\n";
        invText += $" CoalOre: {BlockInventory.GetValueOrDefault(BlockType.CoalOre, 0)}  |  FossilBlock: {BlockInventory.GetValueOrDefault(BlockType.FossilBlock, 0)}";
        _inventoryLabel.Text = invText;
    }

    public List<string> HallOfFameRecords { get; private set; } = new List<string>();

    public void RecordHallOfFameVictory()
    {
        IsChampion = true;
        string record = $"🏆 SIEG AM {DateTime.Now:yyyy-MM-dd HH:mm} | Team: ";
        foreach (var p in Party)
        {
            record += $"{p.Species} (Lv.{p.Level}), ";
        }
        HallOfFameRecords.Add(record);

        if (!BlockInventory.ContainsKey(BlockType.TrophyBlock)) BlockInventory[BlockType.TrophyBlock] = 0;
        BlockInventory[BlockType.TrophyBlock] += 2;
        if (!BlockInventory.ContainsKey(BlockType.PokeStatueBlock)) BlockInventory[BlockType.PokeStatueBlock] = 0;
        BlockInventory[BlockType.PokeStatueBlock] += 1;

        DisplayFeedback("🏆 RUHMESHALLE: Dein Sieg wurde verewigt! (+1 Voxel-Statue & +2 Trophäen-Blöcke erhalten)");
    }

    private void CraftFocusSash()
    {
        int crystal = BlockInventory.GetValueOrDefault(BlockType.CrystalOre, 0);
        if (crystal >= 1 && BerryCount >= 2)
        {
            BlockInventory[BlockType.CrystalOre]--;
            BerryCount -= 2;
            if (Party.Count > 0) Party[0].HeldItem = "Fokus-Gurt";
            DisplayFeedback("🛡️ FOKUS-GURT GECRAFTET und auf erstes Pokémon ausgerüstet!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 1x Kristall-Erz + 2x Beeren.");
    }

    private void CraftLeftovers()
    {
        int coal = BlockInventory.GetValueOrDefault(BlockType.CoalOre, 0);
        if (coal >= 1 && BerryCount >= 3)
        {
            BlockInventory[BlockType.CoalOre]--;
            BerryCount -= 3;
            if (Party.Count > 0) Party[0].HeldItem = "Überreste";
            DisplayFeedback("🍎 ÜBERRESTE GECRAFTET und auf erstes Pokémon ausgerüstet!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 1x Kohle-Erz + 3x Beeren.");
    }

    private void CraftChoiceBand()
    {
        int crystal = BlockInventory.GetValueOrDefault(BlockType.CrystalOre, 0);
        int iron = BlockInventory.GetValueOrDefault(BlockType.IronOre, 0);
        if (crystal >= 1 && iron >= 1)
        {
            BlockInventory[BlockType.CrystalOre]--;
            BlockInventory[BlockType.IronOre]--;
            if (Party.Count > 0) Party[0].HeldItem = "Wahlband";
            DisplayFeedback("🥊 WAHLBAND GECRAFTET (+50% Physischer Schaden)!");
            UpdateHUD();
        }
        else DisplayFeedback("Benötigt: 1x Kristall-Erz + 1x Eisenerz.");
    }

    public void StartEvolutionCutscene(PokemonData pokemon, string targetSpecies)
    {
        _evolvingPokemon = pokemon;
        _targetEvolutionSpecies = targetSpecies;
        _evolutionTimer = 5.0f;
        if (_evolutionPanel != null)
        {
            _evolutionPanel.Visible = true;
            _evolutionTextLabel.Text = $"✨ WAS? {pokemon.Species} ENTWICKELT SICH!\n\nEntwicklung zu {targetSpecies} läuft...\n[Drücke 'B' zum Abbrechen!]";
        }
        if (EffectsManager.Instance != null)
        {
            EffectsManager.Instance.PlaySoundEffect(500.0f, 0.4f);
        }
    }

    private void PerformSave()
    {
        var saveData = new SaveData
        {
            PlayerPosX = GlobalPosition.X,
            PlayerPosY = GlobalPosition.Y,
            PlayerPosZ = GlobalPosition.Z,
            PokeballCount = this.PokeballCount,
            SuperballCount = this.SuperballCount,
            HyperballCount = this.HyperballCount,
            MasterballCount = this.MasterballCount,
            HeavyballCount = this.HeavyballCount,
            NetballCount = this.NetballCount,
            DuskballCount = this.DuskballCount,
            DiveballCount = this.DiveballCount,
            ApricornCount = this.ApricornCount,
            BerryCount = this.BerryCount,
            IsChampion = this.IsChampion,
            Party = this.Party,
            PCStorage = this.PCStorage,
            HasStonePickaxe = this.HasStonePickaxe,
            HasIronPickaxe = this.HasIronPickaxe,
            FeuersteinCount = this.FeuersteinCount,
            WassersteinCount = this.WassersteinCount,
            DonnersteinCount = this.DonnersteinCount,
            HallOfFameRecords = this.HallOfFameRecords,
            QuestProgress = QuestManager.ToSaveEntries()
        };

        foreach (var (type, count) in BlockInventory)
        {
            saveData.Inventory[type.ToString()] = count;
        }

        foreach (var (pos, type) in _terrain.ModifiedBlocks)
        {
            saveData.ModifiedBlocks.Add(new BlockSaveData { X = pos.X, Y = pos.Y, Z = pos.Z, Type = (byte)type });
        }

        SaveSystem.SaveGame(saveData);
        DisplayFeedback("Spielstand erfolgreich gespeichert! (user://savegame.json)");
    }

    private void PerformLoad()
    {
        var data = SaveSystem.LoadGame();
        if (data == null)
        {
            DisplayFeedback("Kein gespeicherter Spielstand gefunden!");
            return;
        }

        GlobalPosition = new Vector3(data.PlayerPosX, data.PlayerPosY, data.PlayerPosZ);
        PokeballCount = data.PokeballCount;
        SuperballCount = data.SuperballCount;
        HyperballCount = data.HyperballCount;
        MasterballCount = data.MasterballCount;
        HeavyballCount = data.HeavyballCount;
        NetballCount = data.NetballCount;
        DuskballCount = data.DuskballCount;
        DiveballCount = data.DiveballCount;
        ApricornCount = data.ApricornCount;
        BerryCount = data.BerryCount;
        IsChampion = data.IsChampion;
        Party = data.Party ?? new List<PokemonData>();
        PCStorage = data.PCStorage ?? new List<PokemonData>();

        HasStonePickaxe = data.HasStonePickaxe;
        HasIronPickaxe = data.HasIronPickaxe;
        FeuersteinCount = data.FeuersteinCount;
        WassersteinCount = data.WassersteinCount;
        DonnersteinCount = data.DonnersteinCount;
        HallOfFameRecords = data.HallOfFameRecords ?? new List<string>();

        // Restore quest state
        QuestManager.InitializeQuests();
        QuestManager.FromSaveEntries(data.QuestProgress);

        BlockInventory.Clear();
        if (data.Inventory != null)
        {
            foreach (var (k, v) in data.Inventory)
            {
                if (Enum.TryParse<BlockType>(k, out var bt)) BlockInventory[bt] = v;
            }
        }

        if (data.ModifiedBlocks != null)
        {
            foreach (var mb in data.ModifiedBlocks)
            {
                _terrain.SetBlock(new Vector3I(mb.X, mb.Y, mb.Z), (BlockType)mb.Type);
            }
        }

        UpdateHUD();
        DisplayFeedback("Spielstand geladen!");
    }

    private void TriggerRaidDenBattle()
    {
        if (Party.Count == 0)
        {
            DisplayFeedback("Du benötigst ein Pokémon im Team für den Dynamax-Raid!");
            return;
        }

        var playerMon = Party[0];
        int bossMaxHp = 2500;
        int bossCurHp = 2500;
        int shieldLayers = 3;

        DisplayFeedback("🌟 DYNAMAX-NEST BETRETEN! Gigadynamax-Mewtu (3-Phasen Raid-Boss | 2500 HP) fordert euch heraus!");
        if (EffectsManager.Instance != null)
        {
            EffectsManager.Instance.SpawnFireworksEffect(GlobalPosition + Vector3.Up * 5.0f);
            EffectsManager.Instance.PlaySoundEffect(120.0f, 0.6f);
        }

        // Simulate a round of multi-player raid combat
        var activeMove = playerMon.Moves.Count > 0 ? playerMon.Moves[0] : new MoveData("Tackle", "Normal", 40);
        int dmg = BattleManager.CalculateRaidBossDamage(playerMon, activeMove, bossMaxHp, ref bossCurHp, ref shieldLayers, out string log);
        DisplayFeedback($"💥 RAID-PHASE: {log} (Boss-HP: {bossCurHp}/{bossMaxHp})");

        // Rewards for participating
        MasterballCount += 1;
        playerMon.GainEv("spatk", 10);
        playerMon.GainXp(200);
        DisplayFeedback("🎁 RAID-BELOHNUNG: 1x Meisterball + 10 SpAtk EVs + 200 EP erhalten!");
        UpdateHUD();
    }

    private void TriggerHelperAutomation()
    {
        if (Party.Count == 0)
        {
            DisplayFeedback("Weise zuerst ein Begleiter-Pokémon mit 'R' zu!");
            return;
        }

        var comp = Party[0];
        string role = comp.ElementType switch
        {
            "Feuer" => "🔥 FEUER-HELFER: Erze und Metalle im Schmelzofen 2x schneller verarbeitet!",
            "Wasser" => "💧 WASSER-HELFER: Alle Beerensträucher im Umkreis von 20m automatisch bewässert!",
            "Pflanze" => "🌿 PFLANZEN-HELFER: Samen nachgepflanzt & Ernte-Ertrag maximiert!",
            "Boden" or "Gestein" => "⛏ BERGBAU-HELFER: Automatisch 5x Kohle & 3x Eisen gefördert!",
            _ => "⭐ ALLROUND-HELFER: Erhöht die Zuchtgeschwindigkeit in der Pension!"
        };

        if (comp.ElementType == "Boden" || comp.ElementType == "Gestein")
        {
            if (!BlockInventory.ContainsKey(BlockType.IronOre)) BlockInventory[BlockType.IronOre] = 0;
            BlockInventory[BlockType.IronOre] += 3;
        }
        else if (comp.ElementType == "Wasser")
        {
            BerryCount += 4;
        }

        DisplayFeedback($"🤖 BASIS-AUTOMATISIERUNG AKTIV:\n{comp.Species} ({comp.ElementType}): {role}");
        if (EffectsManager.Instance != null) EffectsManager.Instance.SpawnBlockBreakEffect(GlobalPosition, Colors.LimeGreen);
        UpdateHUD();
    }

    private void TriggerRanchCare()
    {
        if (Party.Count == 0)
        {
            DisplayFeedback("Kein Pokémon im Team für die Voxel-Ranch!");
            return;
        }

        foreach (var p in Party)
        {
            p.IncreaseFriendship(10);
            p.CurrentHp = p.MaxHp;
        }

        BerryCount += 5;
        DisplayFeedback("🌾 VOXEL-RANCH & WEIDE-GEHEGE: Alle Pokémon gefüttert, Freundschaft gesteigert (+10) & 5x frische Beeren geerntet!");
        if (EffectsManager.Instance != null)
        {
            EffectsManager.Instance.SpawnFireworksEffect(GlobalPosition);
            EffectsManager.Instance.PlaySoundEffect(550.0f, 0.3f);
        }
        UpdateHUD();
    }
}
