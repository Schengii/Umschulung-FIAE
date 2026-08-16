// Minecraft-Pokemon.Tests/BattleManagerTests.cs
// Pure-logic unit tests — only tests BattleManager.GetTypeMultiplier, SaveSystem version
// constants, and QuestManager progress. None of these methods depend on Godot runtime.

using Xunit;

namespace MinecraftPokemon.Tests;

// ---------------------------------------------------------------------------
// Type-multiplier tests  (no Godot, no PokemonData/Monster stubs needed)
// ---------------------------------------------------------------------------

public class GetTypeMultiplierTests
{
    // ── Fire ──────────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Feuer",   "Pflanze",  2.0f)]
    [InlineData("Feuer",   "Eis",      2.0f)]
    [InlineData("Feuer",   "Wasser",   0.5f)]
    [InlineData("Feuer",   "Drache",   0.5f)]
    [InlineData("Feuer",   "Feuer",    0.5f)]
    [InlineData("Feuer",   "Normal",   1.0f)]
    public void Fire_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Water ──────────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Wasser",  "Feuer",    2.0f)]
    [InlineData("Wasser",  "Boden",    2.0f)]
    [InlineData("Wasser",  "Gestein",  2.0f)]
    [InlineData("Wasser",  "Wasser",   0.5f)]
    [InlineData("Wasser",  "Pflanze",  0.5f)]
    [InlineData("Wasser",  "Drache",   0.5f)]
    [InlineData("Wasser",  "Normal",   1.0f)]
    public void Water_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Electric ───────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Elektro", "Wasser",   2.0f)]
    [InlineData("Elektro", "Flug",     2.0f)]
    [InlineData("Elektro", "Boden",    0.0f)]
    [InlineData("Elektro", "Elektro",  0.5f)]
    [InlineData("Elektro", "Normal",   1.0f)]
    public void Electric_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Ice ────────────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Eis",     "Pflanze",  2.0f)]
    [InlineData("Eis",     "Drache",   2.0f)]
    [InlineData("Eis",     "Feuer",    0.5f)]
    [InlineData("Eis",     "Wasser",   0.5f)]
    public void Ice_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Dragon ─────────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Drache",  "Drache",   2.0f)]
    [InlineData("Drache",  "Stahl",    0.5f)]
    [InlineData("Drache",  "Fee",      0.0f)]
    [InlineData("Drache",  "Normal",   1.0f)]
    public void Dragon_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Ghost ──────────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Geist",   "Geist",    2.0f)]
    [InlineData("Geist",   "Psycho",   2.0f)]
    [InlineData("Geist",   "Normal",   0.0f)]
    [InlineData("Geist",   "Unlicht",  0.5f)]
    public void Ghost_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Psychic ────────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Psycho",  "Kampf",    2.0f)]
    [InlineData("Psycho",  "Gift",     2.0f)]
    [InlineData("Psycho",  "Unlicht",  0.0f)]
    [InlineData("Psycho",  "Psycho",   0.5f)]
    public void Psychic_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Poison ─────────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Gift",    "Pflanze",  2.0f)]
    [InlineData("Gift",    "Fee",      2.0f)]
    [InlineData("Gift",    "Stahl",    0.0f)]
    public void Poison_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Fairy ──────────────────────────────────────────────────────────────────
    [Theory]
    [InlineData("Fee",     "Kampf",    2.0f)]
    [InlineData("Fee",     "Drache",   2.0f)]
    [InlineData("Fee",     "Unlicht",  2.0f)]
    [InlineData("Fee",     "Feuer",    0.5f)]
    [InlineData("Fee",     "Gift",     0.5f)]
    [InlineData("Fee",     "Stahl",    0.5f)]
    public void Fairy_Multiplier_IsCorrect(string at, string dt, float expected)
        => Assert.Equal(expected, BattleManager.GetTypeMultiplier(at, dt), precision: 2);

    // ── Edge cases ─────────────────────────────────────────────────────────────
    [Fact]
    public void UnknownType_Returns1x()
        => Assert.Equal(1.0f, BattleManager.GetTypeMultiplier("UnbekannterTyp", "Normal"), precision: 2);

    [Fact]
    public void CaseInsensitive_LowerAndUpper_Match()
    {
        float lower = BattleManager.GetTypeMultiplier("feuer", "pflanze");
        float upper = BattleManager.GetTypeMultiplier("FEUER", "PFLANZE");
        Assert.Equal(lower, upper, precision: 2);
        Assert.Equal(2.0f, lower, precision: 2);
    }
}

// ---------------------------------------------------------------------------
// SaveSystem version tests
// ---------------------------------------------------------------------------

public class SaveSystemVersionTests
{
    [Fact]
    public void CurrentVersion_IsPositive()
        => Assert.True(SaveSystem.CurrentVersion >= 1,
               "CurrentVersion muss mindestens 1 sein.");

    [Fact]
    public void NewSaveData_HasCurrentVersion()
    {
        var data = new SaveData();
        Assert.Equal(SaveSystem.CurrentVersion, data.SaveVersion);
    }
}

// ---------------------------------------------------------------------------
// QuestManager tests
// ---------------------------------------------------------------------------

public class QuestManagerTests
{
    public QuestManagerTests() => QuestManager.InitializeQuests();

    [Fact]
    public void InitializeQuests_PopulatesActiveQuests()
        => Assert.NotEmpty(QuestManager.ActiveQuests);

    [Fact]
    public void ProgressQuest_IncrementsProgress()
    {
        QuestManager.ProgressQuest("berries", 2, out _);
        var q = QuestManager.ActiveQuests.Find(x => x.Id == "berries");
        Assert.Equal(2, q!.CurrentProgress);
    }

    [Fact]
    public void ProgressQuest_CompletesAtTarget()
    {
        bool done = QuestManager.ProgressQuest("boss", 1, out string msg);
        Assert.True(done);
        Assert.Contains("QUEST ABGESCHLOSSEN", msg);
    }

    [Fact]
    public void ProgressQuest_ClampsAtTarget()
    {
        QuestManager.ProgressQuest("boss", 999, out _);
        var q = QuestManager.ActiveQuests.Find(x => x.Id == "boss")!;
        Assert.Equal(q.TargetAmount, q.CurrentProgress);
    }

    [Fact]
    public void ProgressQuest_IgnoresAlreadyCompletedQuest()
    {
        QuestManager.ProgressQuest("boss", 1, out _);
        bool again = QuestManager.ProgressQuest("boss", 1, out _);
        Assert.False(again);
    }

    [Fact]
    public void ToSaveEntries_FromSaveEntries_RoundTrip()
    {
        QuestManager.ProgressQuest("berries", 3, out _);
        var entries = QuestManager.ToSaveEntries();

        QuestManager.InitializeQuests();
        QuestManager.FromSaveEntries(entries);

        var q = QuestManager.ActiveQuests.Find(x => x.Id == "berries")!;
        Assert.Equal(3, q.CurrentProgress);
    }

    [Fact]
    public void FromSaveEntries_WithNull_DoesNotThrow()
    {
        var ex = Record.Exception(() => QuestManager.FromSaveEntries(null));
        Assert.Null(ex);
    }
}

// ---------------------------------------------------------------------------
// Extended Feature Unit Tests (Raid-Boss, EV/IV, Moves, Breeding)
// ---------------------------------------------------------------------------

public class ExtendedFeaturesTests
{
    [Fact]
    public void RaidBoss_BarrierShield_AbsorbsDamage()
    {
        var p = new PokemonData("Pikachu", 50, 100, "Elektro", Godot.Colors.Yellow);
        var move = new MoveData("Donnerblitz", "Elektro", 90);
        int bossMax = 2500;
        int bossCur = 2500;
        int shields = 3;

        int dmg = BattleManager.CalculateRaidBossDamage(p, move, bossMax, ref bossCur, ref shields, out string log);
        Assert.Equal(2, shields);
        Assert.True(dmg < 50); // Heavily reduced by barrier
        Assert.Contains("Barriere", log);
    }

    [Fact]
    public void RaidBoss_NoBarrier_DealsFullDamage()
    {
        var p = new PokemonData("Glurak", 50, 150, "Feuer", Godot.Colors.Red);
        var move = new MoveData("Drachenklaue", "Drache", 80);
        int bossMax = 2500;
        int bossCur = 2000;
        int shields = 0;

        int dmg = BattleManager.CalculateRaidBossDamage(p, move, bossMax, ref bossCur, ref shields, out string log);
        Assert.True(dmg >= 80);
        Assert.Equal(2000 - dmg, bossCur);
    }

    [Fact]
    public void TrainerAI_Tactics_EvaluatesCorrectly()
    {
        var trainerMon = new PokemonData("Glumanda", 15, 40, "Feuer", Godot.Colors.Red);
        trainerMon.CurrentHp = 5; // Under 25%
        var playerMon = new PokemonData("Schiggy", 15, 40, "Wasser", Godot.Colors.Blue);

        string tactic = BattleManager.EvaluateTrainerTactics(trainerMon, playerMon, potionsLeft: 1);
        Assert.Equal("USE_POTION", tactic);

        string switchTactic = BattleManager.EvaluateTrainerTactics(trainerMon, playerMon, potionsLeft: 0);
        Assert.Equal("SWITCH_TACTIC", switchTactic);
    }

    [Fact]
    public void PokemonData_EvGain_CapsAt510()
    {
        var p = new PokemonData("Evoli", 5, 20, "Normal", Godot.Colors.Brown);
        p.GainEv("atk", 252);
        p.GainEv("speed", 252);
        p.GainEv("hp", 100); // Should be capped at 6 remaining

        Assert.Equal(252, p.EvAtk);
        Assert.Equal(252, p.EvSpeed);
        Assert.Equal(6, p.EvHp);
    }

    [Fact]
    public void PokemonData_TeachMove_FourMoveLimit()
    {
        var p = new PokemonData("Pikachu", 5, 20, "Elektro", Godot.Colors.Yellow);
        p.Moves.Clear();
        p.Moves.Add(new MoveData("Move1", "Normal", 40));
        p.Moves.Add(new MoveData("Move2", "Normal", 40));
        p.Moves.Add(new MoveData("Move3", "Normal", 40));
        p.Moves.Add(new MoveData("Move4", "Normal", 40));

        var extraMove = new MoveData("Move5", "Normal", 40);
        bool taughtWithoutReplacing = p.TeachMove(extraMove);
        Assert.False(taughtWithoutReplacing);
        Assert.Equal(extraMove, p.PendingNewMove);

        // Replace move at index 0
        bool replaced = p.TeachMove(extraMove, replaceIndex: 0);
        Assert.True(replaced);
        Assert.Equal("Move5", p.Moves[0].Name);
    }

    [Fact]
    public void BreedingManager_DestinyKnot_InheritsStats()
    {
        var parent1 = new PokemonData("Glurak", 50, 150, "Feuer", Godot.Colors.Red);
        parent1.IvAtk = 31;
        parent1.HeldItem = "Fatumknoten";

        var parent2 = new PokemonData("Glurak", 50, 150, "Feuer", Godot.Colors.Red);
        parent2.IvDef = 31;

        var egg = BreedingManager.CreateEgg(parent1, parent2);
        Assert.NotNull(egg);
        Assert.Equal("Glumanda", egg.ExpectedSpecies);
    }

    [Fact]
    public void PokemonData_FriendshipAndContests_UpdateCorrectly()
    {
        var p = new PokemonData("Pikachu", 20, 50, "Elektro", Godot.Colors.Yellow);
        Assert.Equal(70, p.Friendship);

        p.IncreaseFriendship(50);
        Assert.Equal(120, p.Friendship);

        p.IncreaseFriendship(200); // Cap at 255
        Assert.Equal(255, p.Friendship);

        p.Coolness = 100;
        p.Beauty = 80;
        p.ContestRibbons++;
        Assert.Equal(1, p.ContestRibbons);
    }

    [Fact]
    public void BattleFrontier_GeneratesCompetitiveTeam()
    {
        var team = BattleManager.GenerateBattleFrontierTeam(streak: 5);
        Assert.Equal(3, team.Count);
        Assert.All(team, mon =>
        {
            Assert.Equal(60, mon.Level);
            Assert.Equal(31, mon.IvHp);
            Assert.Equal(31, mon.IvAtk);
        });
    }
}
