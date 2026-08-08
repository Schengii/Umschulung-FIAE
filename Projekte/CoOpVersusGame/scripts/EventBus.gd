extends Node

# EventBus - Autoload singleton for decoupled signal handling

signal player_hit(player: Node, damage: int)
signal player_healed(player: Node, amount: int)
signal player_downed(player: Node)
signal player_revived(player: Node)
signal enemy_killed(enemy: Node, killer: Node)
signal relic_selected(player_id: int, perk_id: String)
signal floor_cleared(floor_number: int)
signal boss_phase_changed(boss: Node, phase: int)
signal hit_flash_triggered(node: Node)
