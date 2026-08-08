extends Node

# EnemySpawner – Godot 4.x
# Spawns Enemy nodes at random positions around players.
# Controlled entirely by the server and synced to clients.

@export var spawn_interval: float = 3.0
@export var max_enemies: int = 15
@export var spawn_radius: float = 400.0

var _spawn_timer: float = 0.0
var enemy_script = preload("res://scripts/Enemy.gd")

func _ready() -> void:
	add_to_group("enemy_spawners")
	_spawn_timer = spawn_interval

func _process(delta: float) -> void:
	# Stop spawning if game ended
	var gm = get_tree().get_first_node_in_group("game_manager")
	if gm and (gm.is_game_over or gm.is_victory):
		return

	# Only spawn on server
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		_spawn_timer -= delta
		if _spawn_timer <= 0.0:
			_spawn_timer = spawn_interval
			var current_enemies = get_tree().get_nodes_in_group("enemies").size()
			if current_enemies < max_enemies:
				_spawn_enemy()

func _spawn_enemy() -> void:
	var spawn_pos = Vector2(400, 300)
	var players = get_tree().get_nodes_in_group("players")

			
	if not players.is_empty():
		var target_player = players[randi() % players.size()]
		var angle = randf() * PI * 2.0
		var dist = 250.0 + randf() * (spawn_radius - 250.0)
		spawn_pos = target_player.global_position + Vector2(cos(angle), sin(angle)) * dist
	
	# Determine enemy type randomly
	# 40% Basic (0), 20% Charger (1), 20% Ranged (2), 10% Ghost (3), 10% Poison Slime (4)
	var rand_val = randf()
	var enemy_type = 0
	if rand_val < 0.40:
		enemy_type = 0 # BASIC
	elif rand_val < 0.60:
		enemy_type = 1 # CHARGER
	elif rand_val < 0.80:
		enemy_type = 2 # RANGED
	elif rand_val < 0.90:
		enemy_type = 3 # GHOST
	else:
		enemy_type = 4 # POISON_SLIME

	var enemy_id = randi()
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_spawn_enemy", enemy_id, spawn_pos, enemy_type)
	else:
		# Singleplayer fallback
		rpc_spawn_enemy(enemy_id, spawn_pos, enemy_type)

@rpc("authority", "call_local", "reliable")
func rpc_spawn_enemy(enemy_id: int, spawn_pos: Vector2, enemy_type: int) -> void:
	# Create enemy node dynamically
	var enemy = CharacterBody2D.new()
	enemy.set_script(enemy_script)
	enemy.name = "Enemy_%d" % enemy_id
	enemy.type = enemy_type
	enemy.global_position = spawn_pos
	
	# Add to the same parent as the spawner
	get_parent().add_child(enemy)

# Wave-aware spawning: shifts enemy type distribution and scales stats (#8)
func _spawn_enemy_wave(wave_number: int, player_count: int = 1) -> void:
	var spawn_pos = Vector2(400, 300)
	var players = get_tree().get_nodes_in_group("players")

	if not players.is_empty():
		var target_player = players[randi() % players.size()]
		var angle = randf() * PI * 2.0
		var dist = 250.0 + randf() * (spawn_radius - 250.0)
		spawn_pos = target_player.global_position + Vector2(cos(angle), sin(angle)) * dist
	
	# Shift type distribution based on wave number
	# Early waves: mostly Basic, few advanced
	# Later waves: more Ranged, Ghost, Poison Slime
	var basic_weight = max(0.10, 0.35 - wave_number * 0.03)
	var charger_weight = 0.15
	var ranged_weight = min(0.20, 0.15 + wave_number * 0.02)
	var ghost_weight = min(0.15, 0.08 + wave_number * 0.02)
	var poison_weight = min(0.15, 0.07 + wave_number * 0.02)
	var defender_weight = min(0.15, 0.05 + wave_number * 0.02)
	var necro_weight = min(0.15, 0.05 + wave_number * 0.02)
	
	var total = basic_weight + charger_weight + ranged_weight + ghost_weight + poison_weight + defender_weight + necro_weight
	var rand_val = randf() * total
	var enemy_type = 0
	
	if rand_val < basic_weight:
		enemy_type = 0 # BASIC
	elif rand_val < basic_weight + charger_weight:
		enemy_type = 1 # CHARGER
	elif rand_val < basic_weight + charger_weight + ranged_weight:
		enemy_type = 2 # RANGED
	elif rand_val < basic_weight + charger_weight + ranged_weight + ghost_weight:
		enemy_type = 3 # GHOST
	elif rand_val < basic_weight + charger_weight + ranged_weight + ghost_weight + poison_weight:
		enemy_type = 4 # POISON_SLIME
	elif rand_val < basic_weight + charger_weight + ranged_weight + ghost_weight + poison_weight + defender_weight:
		enemy_type = 5 # DEFENDER
	else:
		enemy_type = 6 # NECROMANCER

	var enemy_id = randi()
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_spawn_enemy_wave", enemy_id, spawn_pos, enemy_type, wave_number, player_count)
	else:
		rpc_spawn_enemy_wave(enemy_id, spawn_pos, enemy_type, wave_number, player_count)

@rpc("authority", "call_local", "reliable")
func rpc_spawn_enemy_wave(enemy_id: int, spawn_pos: Vector2, enemy_type: int, wave_number: int, player_count: int) -> void:
	var enemy = CharacterBody2D.new()
	enemy.set_script(enemy_script)
	enemy.name = "Enemy_%d" % enemy_id
	enemy.type = enemy_type
	enemy.global_position = spawn_pos
	
	get_parent().add_child(enemy)
	
	# Post-spawn stat boost based on wave and player count (#8, #7)
	if enemy.has_method("scale_for_wave"):
		enemy.scale_for_wave(wave_number, player_count)

