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
}
