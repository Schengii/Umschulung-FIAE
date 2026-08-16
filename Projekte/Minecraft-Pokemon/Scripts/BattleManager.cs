using Godot;
using System;

namespace MinecraftPokemon;

public static class BattleManager
{
    public static float GetTypeMultiplier(string moveType, string defenderType)
    {
        string mt = moveType.ToLower();
        string dt = defenderType.ToLower();

        if (mt == "feuer")
        {
            if (dt == "pflanze" || dt == "eis") return 2.0f;
            if (dt == "wasser" || dt == "drache" || dt == "feuer") return 0.5f;
        }
        else if (mt == "wasser")
        {
            if (dt == "feuer" || dt == "boden" || dt == "gestein") return 2.0f;
            if (dt == "wasser" || dt == "pflanze" || dt == "drache") return 0.5f;
        }
        else if (mt == "pflanze")
        {
            if (dt == "wasser" || dt == "boden" || dt == "gestein") return 2.0f;
            if (dt == "feuer" || dt == "pflanze" || dt == "gift" || dt == "flug" || dt == "drache" || dt == "stahl") return 0.5f;
        }
        else if (mt == "elektro")
        {
            if (dt == "wasser" || dt == "flug") return 2.0f;
            if (dt == "elektro" || dt == "pflanze" || dt == "drache") return 0.5f;
            if (dt == "boden") return 0.0f;
        }
        else if (mt == "eis")
        {
            if (dt == "pflanze" || dt == "boden" || dt == "flug" || dt == "drache") return 2.0f;
            if (dt == "feuer" || dt == "wasser" || dt == "eis" || dt == "stahl") return 0.5f;
        }
        else if (mt == "drache")
        {
            if (dt == "drache") return 2.0f;
            if (dt == "stahl") return 0.5f;
            if (dt == "fee") return 0.0f;
        }
        else if (mt == "geist")
        {
            if (dt == "geist" || dt == "psycho") return 2.0f;
            if (dt == "unlicht") return 0.5f;
            if (dt == "normal") return 0.0f;
        }
        else if (mt == "psycho")
        {
            if (dt == "kampf" || dt == "gift") return 2.0f;
            if (dt == "psycho" || dt == "stahl") return 0.5f;
            if (dt == "unlicht") return 0.0f;
        }
        else if (mt == "gift")
        {
            if (dt == "pflanze" || dt == "fee") return 2.0f;
            if (dt == "gift" || dt == "boden" || dt == "gestein" || dt == "geist") return 0.5f;
            if (dt == "stahl") return 0.0f;
        }
        else if (mt == "fee")
        {
            if (dt == "kampf" || dt == "drache" || dt == "unlicht") return 2.0f;
            if (dt == "feuer" || dt == "gift" || dt == "stahl") return 0.5f;
        }

        return 1.0f;
    }

    public static int CalculateDamage(PokemonData attacker, MoveData move, Monster defender, out string resultMsg)
    {
        if (move.CurrentPp <= 0)
        {
            resultMsg = $"{attacker.Species} versucht {move.Name}... hat aber keine PP mehr!";
            return 0;
        }

        move.CurrentPp--;

        if (attacker.Status == StatusCondition.Paralyzed && GD.Randf() < 0.25f)
        {
            resultMsg = $"{attacker.Species} ist vollkommen gelähmt und kann nicht angreifen!";
            return 0;
        }

        if (GD.Randf() > move.Accuracy)
        {
            resultMsg = $"{attacker.Species} setzt {move.Name} ein... aber der Angriff ging daneben!";
            return 0;
        }

        // Status move execution
        if (move.Category == MoveCategory.Status)
        {
            if (move.HealPercentage > 0)
            {
                int healAmt = (attacker.MaxHp * move.HealPercentage) / 100;
                attacker.CurrentHp = Math.Min(attacker.MaxHp, attacker.CurrentHp + healAmt);
                resultMsg = $"{attacker.Species} setzt {move.Name} ein und heilt {healAmt} HP!";
                return 0;
            }
            if (!string.IsNullOrEmpty(move.BuffStat))
            {
                if (move.BuffStat == "Speed") attacker.Speed += move.BuffAmount * 5;
                if (move.BuffStat == "Defense") attacker.Defense += move.BuffAmount * 5;
                resultMsg = $"{attacker.Species} setzt {move.Name} ein! {move.BuffStat} steigt deutlich!";
                return 0;
            }
            if (move.InducesStatus != StatusCondition.None)
            {
                resultMsg = $"{attacker.Species} setzt {move.Name} ein! {defender.MonsterName} leidet nun unter {move.InducesStatus}!";
                return 0;
            }
        }

        float mult = GetTypeMultiplier(move.ElementType, defender.ElementType);
        if (defender.ElementType.ToLower() == "geist" && move.ElementType == "Boden") mult = 0.0f;
        if (mult == 0.0f)
        {
            resultMsg = $"{attacker.Species} setzt {move.Name} ein... hat aber keine Wirkung auf {defender.MonsterName}!";
            return 0;
        }

        float baseDmg = (move.Power * 0.35f) + (attacker.Level * 0.85f);
        if (attacker.Status == StatusCondition.Burned && move.Category == MoveCategory.Physical)
        {
            baseDmg *= 0.5f;
        }

        // Abilities (Notdünger, Großbrand, Sturzbach)
        if (attacker.Ability == "Notdünger" && move.ElementType == "Pflanze" && attacker.CurrentHp <= attacker.MaxHp / 3) baseDmg *= 1.5f;
        if (attacker.Ability == "Großbrand" && move.ElementType == "Feuer" && attacker.CurrentHp <= attacker.MaxHp / 3) baseDmg *= 1.5f;
        if (attacker.Ability == "Sturzbach" && move.ElementType == "Wasser" && attacker.CurrentHp <= attacker.MaxHp / 3) baseDmg *= 1.5f;

        // Dynamic Weather Damage Boosts
        if (WeatherManager.Instance != null)
        {
            var w = WeatherManager.Instance.CurrentWeather;
            if (w == WeatherType.Rain)
            {
                if (move.ElementType == "Wasser") baseDmg *= 1.5f;
                if (move.ElementType == "Feuer") baseDmg *= 0.5f;
            }
            else if (w == WeatherType.Snow && move.ElementType == "Eis") baseDmg *= 1.5f;
            else if (w == WeatherType.Sandstorm && (move.ElementType == "Gestein" || move.ElementType == "Boden")) baseDmg *= 1.5f;
            else if (w == WeatherType.VolcanoAsh && move.ElementType == "Feuer") baseDmg *= 1.5f;
        }

        if (attacker.HeldItem == "Zauberwasser" && move.ElementType == "Wasser") baseDmg *= 1.25f;
        if (attacker.HeldItem == "Holzkohle" && move.ElementType == "Feuer") baseDmg *= 1.25f;

        int finalDamage = Math.Max(1, (int)(baseDmg * mult));

        if (move.HealPercentage > 0)
        {
            int drain = (finalDamage * move.HealPercentage) / 100;
            attacker.CurrentHp = Math.Min(attacker.MaxHp, attacker.CurrentHp + drain);
        }

        string effText = mult > 1.0f ? " (Sehr effektiv!)" : (mult < 1.0f ? " (Nicht sehr effektiv...)" : "");
        resultMsg = $"{attacker.Species} setzt {move.Name} ein! {finalDamage} Schaden{effText}";

        return finalDamage;
    }

    public static int CalculateDamageAgainstTrainer(PokemonData attacker, MoveData move, PokemonData defender, out string resultMsg)
    {
        if (move.CurrentPp <= 0)
        {
            resultMsg = $"{attacker.Species} versucht {move.Name}... hat aber keine PP mehr!";
            return 0;
        }

        move.CurrentPp--;

        if (attacker.Status == StatusCondition.Paralyzed && GD.Randf() < 0.25f)
        {
            resultMsg = $"{attacker.Species} ist vollkommen gelähmt und kann nicht angreifen!";
            return 0;
        }

        if (GD.Randf() > move.Accuracy)
        {
            resultMsg = $"{attacker.Species} setzt {move.Name} ein... aber der Angriff ging daneben!";
            return 0;
        }

        if (move.Category == MoveCategory.Status)
        {
            if (move.HealPercentage > 0)
            {
                int healAmt = (attacker.MaxHp * move.HealPercentage) / 100;
                attacker.CurrentHp = Math.Min(attacker.MaxHp, attacker.CurrentHp + healAmt);
                resultMsg = $"{attacker.Species} setzt {move.Name} ein und heilt {healAmt} HP!";
                return 0;
            }
            if (!string.IsNullOrEmpty(move.BuffStat))
            {
                if (move.BuffStat == "Speed") attacker.Speed += move.BuffAmount * 5;
                if (move.BuffStat == "Defense") attacker.Defense += move.BuffAmount * 5;
                resultMsg = $"{attacker.Species} setzt {move.Name} ein! {move.BuffStat} steigt deutlich!";
                return 0;
            }
            if (move.InducesStatus != StatusCondition.None)
            {
                defender.Status = move.InducesStatus;
                resultMsg = $"{attacker.Species} setzt {move.Name} ein! {defender.Species} erleidet {move.InducesStatus}!";
                return 0;
            }
        }

        float mult = GetTypeMultiplier(move.ElementType, defender.ElementType);
        if (defender.Ability == "Schwebe" && move.ElementType == "Boden") mult = 0.0f;
        if (mult == 0.0f)
        {
            resultMsg = $"{attacker.Species} setzt {move.Name} ein... hat aber keine Wirkung auf {defender.Species}!";
            return 0;
        }

        float baseDmg = (move.Power * 0.35f) + (attacker.Level * 0.85f);
        if (attacker.Status == StatusCondition.Burned && move.Category == MoveCategory.Physical)
        {
            baseDmg *= 0.5f;
        }

        // Abilities (Notdünger, Großbrand, Sturzbach)
        if (attacker.Ability == "Notdünger" && move.ElementType == "Pflanze" && attacker.CurrentHp <= attacker.MaxHp / 3) baseDmg *= 1.5f;
        if (attacker.Ability == "Großbrand" && move.ElementType == "Feuer" && attacker.CurrentHp <= attacker.MaxHp / 3) baseDmg *= 1.5f;
        if (attacker.Ability == "Sturzbach" && move.ElementType == "Wasser" && attacker.CurrentHp <= attacker.MaxHp / 3) baseDmg *= 1.5f;

        if (attacker.HeldItem == "Zauberwasser" && move.ElementType == "Wasser") baseDmg *= 1.25f;
        if (attacker.HeldItem == "Holzkohle" && move.ElementType == "Feuer") baseDmg *= 1.25f;
        if (attacker.HeldItem == "Wahlband" && move.Category == MoveCategory.Physical) baseDmg *= 1.50f;

        int finalDamage = Math.Max(1, (int)(baseDmg * mult));

        // Held Item: Fokus-Gurt check on defender
        if (defender.HeldItem == "Fokus-Gurt" && defender.CurrentHp == defender.MaxHp && finalDamage >= defender.CurrentHp)
        {
            finalDamage = defender.CurrentHp - 1;
        }

        if (attacker.HeldItem == "Überreste")
        {
            int regen = Math.Max(1, (int)(attacker.MaxHp * 0.1f));
            attacker.CurrentHp = Math.Min(attacker.MaxHp, attacker.CurrentHp + regen);
        }

        if (move.InducesStatus != StatusCondition.None && move.StatusChance > 0 && GD.Randf() < move.StatusChance)
        {
            defender.Status = move.InducesStatus;
        }

        if (move.HealPercentage > 0)
        {
            int drain = (finalDamage * move.HealPercentage) / 100;
            attacker.CurrentHp = Math.Min(attacker.MaxHp, attacker.CurrentHp + drain);
        }

        string effText = mult > 1.0f ? " (Sehr effektiv!)" : (mult < 1.0f ? " (Nicht sehr effektiv...)" : "");
        resultMsg = $"{attacker.Species} setzt {move.Name} ein! {finalDamage} Schaden{effText}";

        return finalDamage;
    }

    /// <summary>
    /// Calculates multi-phase raid boss damage with dynamic shield and barrier mechanics.
    /// </summary>
    public static int CalculateRaidBossDamage(PokemonData attacker, MoveData move, int bossMaxHp, ref int bossCurrentHp, ref int bossShieldLayers, out string combatLog)
    {
        if (move.CurrentPp > 0) move.CurrentPp--;

        if (bossShieldLayers > 0)
        {
            bossShieldLayers--;
            combatLog = $"{attacker.Species} greift an! Die Raid-Boss-Barriere schwächt den Angriff ab! (Noch {bossShieldLayers} Schilde übrig)";
            int chipped = Math.Max(5, (int)(move.Power * 0.2f));
            bossCurrentHp = Math.Max(0, bossCurrentHp - chipped);
            return chipped;
        }

        float mult = GetTypeMultiplier(move.ElementType, "Drache"); // Raid boss base type
        int dmg = Math.Max(15, (int)((move.Power * 0.6f + attacker.Level * 1.2f) * mult));
        
        // Critical cheer/synergy bonus
        if (attacker.HeldItem == "Wahlband") dmg = (int)(dmg * 1.5f);
        
        bossCurrentHp = Math.Max(0, bossCurrentHp - dmg);
        
        // Trigger barrier phase when crossing HP thresholds (75%, 50%, 25%)
        float hpPercent = (float)bossCurrentHp / bossMaxHp;
        if (hpPercent < 0.5f && hpPercent > 0.45f && bossShieldLayers == 0)
        {
            bossShieldLayers = 3;
            combatLog = $"{attacker.Species} trifft kritisch für {dmg} Schaden! Der Raid-Boss errichtet eine energetische Schutzbarriere!";
        }
        else
        {
            combatLog = $"{attacker.Species} landet einen gewaltigen Treffer für {dmg} Schaden!";
        }

        return dmg;
    }

    /// <summary>
    /// Tactical AI helper for trainer decision making (Potion use or switching)
    /// </summary>
    public static string EvaluateTrainerTactics(PokemonData currentMon, PokemonData playerMon, int potionsLeft)
    {
        if (currentMon.CurrentHp <= currentMon.MaxHp * 0.25f && potionsLeft > 0)
        {
            return "USE_POTION";
        }

        float incomingThreat = GetTypeMultiplier(playerMon.ElementType, currentMon.ElementType);
        if (incomingThreat >= 2.0f && currentMon.CurrentHp < currentMon.MaxHp * 0.6f)
        {
            return "SWITCH_TACTIC";
        }

        return "ATTACK";
    }

    /// <summary>
    /// Generates a randomised Battle Frontier challenge team tailored to specific rulesets.
    /// </summary>
    public static List<PokemonData> GenerateBattleFrontierTeam(int streak, string ruleType = "Standard")
    {
        var team = new List<PokemonData>();
        string[] allSpecies = new string[] { "Glurak", "Turtok", "Bisaflor", "Gengar", "Lucario", "Knakrack", "Despotar", "Metagross", "Dragoran", "Raichu" };
        int level = Math.Min(100, 50 + (streak * 2));

        for (int i = 0; i < 3; i++)
        {
            string species = allSpecies[(streak + i * 3) % allSpecies.Length];
            var poke = new PokemonData(species, level, 120 + level * 2, "Drache", Colors.Gold);
            poke.IvHp = 31;
            poke.IvAtk = 31;
            poke.IvSpeed = 31;
            poke.RecalculateStats();
            team.Add(poke);
        }
        return team;
    }
}
