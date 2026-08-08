extends Node

# RelicManager - Manages passive perks, relic card selection, and perk effects.

signal relic_applied(perk_id: String)
signal offer_relics(perk_options: Array)

var available_perks: Dictionary = {
	"vampirism": {
		"id": "vampirism",
		"title": "Vampirismus",
		"description": "Heilt bei jedem Treffer 3 Lebenspunkte.",
		"icon": "🩸"
	},
	"chain_lightning": {
		"id": "chain_lightning",
		"title": "Kettenblitz",
		"description": "Geschosse springen auf bis zu 2 nahe Gegner über.",
		"icon": "⚡"
	},
	"thorns": {
		"id": "thorns",
		"title": "Dornenrüstung",
		"description": "Wirft 30% des erlittenen Schadens auf den Angreifer zurück.",
		"icon": "🌵"
	},
	"explosive_rounds": {
		"id": "explosive_rounds",
		"title": "Explosivschüsse",
		"description": "25% Chance, dass Schüsse kleine Explosionen auslösen.",
		"icon": "💥"
	},
	"swiftness": {
		"id": "swiftness",
		"title": "Geschwindigkeit",
		"description": "+25% Lauftempo und -20% Dash-Abklingzeit.",
		"icon": "⚡"
	},
	"double_dash": {
		"id": "double_dash",
		"title": "Doppel-Dash",
		"description": "Dash lädt 50% schneller wieder auf.",
		"icon": "🌀"
	}
}

# Player perks dictionary: key = player_instance_id or network_id, value = Array of perk_ids
var player_perks: Dictionary = {}

func _ready() -> void:
	add_to_group("relic_manager")

func get_random_perks(count: int = 3) -> Array:
	var keys = available_perks.keys()
	keys.shuffle()
	var selected = []
	for i in range(min(count, keys.size())):
		selected.append(available_perks[keys[i]])
	return selected

func apply_perk(player: Node, perk_id: String) -> void:
	var p_id = player.get_instance_id()
	if not player_perks.has(p_id):
		player_perks[p_id] = []
	if not player_perks[p_id].has(perk_id):
		player_perks[p_id].append(perk_id)
		
	# Instant stat adjustments if applicable
	if perk_id == "swiftness" and "speed" in player:
		player.speed *= 1.25
	elif perk_id == "double_dash" and "dash_cooldown" in player:
		player.dash_cooldown *= 0.5
		
	emit_signal("relic_applied", perk_id)

func has_perk(player: Node, perk_id: String) -> bool:
	var p_id = player.get_instance_id()
	return player_perks.has(p_id) and player_perks[p_id].has(perk_id)

func clear_perks(player: Node) -> void:
	var p_id = player.get_instance_id()
	if player_perks.has(p_id):
		player_perks.erase(p_id)
