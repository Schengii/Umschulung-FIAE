extends Node2D

# VersusArena - Godot 4.x
# Implements PvP Versus arena with King of the Hill zones.

var koth_script = preload("res://scripts/KingOfTheHill.gd")
var game_manager_script = preload("res://scripts/GameManager.gd")
var audio_manager_script = preload("res://scripts/AudioManager.gd")
var score_manager_script = preload("res://scripts/ScoreManager.gd")
var network_manager_script = preload("res://scripts/NetworkManager.gd")

func _ready() -> void:
	#print("Versus Arena loaded")
	
	# Ensure managers
	_ensure_child_node("AudioManager", audio_manager_script)
	_ensure_root_node("ScoreManager", score_manager_script)
	_ensure_root_node("NetworkManager", network_manager_script)
	
	var gm = _ensure_child_node("GameManager", game_manager_script)
	if gm:
		gm.current_mode = 1 # Set Versus Mode
		gm.game_duration = 60.0 # Shorter game for PvP
		gm._update_objective("PvP-Kampf! Kontrolliere die goldene Zone.")
	
	# Spawn a King of the Hill zone in the center
	var koth = Area2D.new()
	koth.set_script(koth_script)
	koth.name = "KOTH_Zone"
	koth.global_position = Vector2(400, 300)
	add_child(koth)

	# Spawn some obstacles for cover and tactical gameplay (#12 Versus mode extension)
	var crate_script = preload("res://scripts/DestructibleCrate.gd")
	var barrel_script = preload("res://scripts/ExplosiveBarrel.gd")
	var obstacle_positions = [
		Vector2(400, 150), Vector2(400, 450), # Center top & bottom
		Vector2(250, 200), Vector2(550, 400), # Diagonals
		Vector2(250, 400), Vector2(550, 200)
	]
	for i in range(obstacle_positions.size()):
		var pos = obstacle_positions[i]
		if i % 2 == 0:
			var crate = StaticBody2D.new()
			crate.set_script(crate_script)
			crate.global_position = pos
			add_child(crate)
		else:
			var barrel = StaticBody2D.new()
			barrel.set_script(barrel_script)
			barrel.global_position = pos
			add_child(barrel)

	# Spawn players
	var net = get_node_or_null("/root/NetworkManager")
	if net and net.get_player_count() > 0:
		var offset = 0
		for peer_id in net.connected_players.keys():
			# Spawn players at opposite ends of the arena
			var spawn_pos = Vector2(150 + offset * 500, 300)
			_spawn_player(peer_id, spawn_pos)
			offset += 1
	else:
		_spawn_player(1, Vector2(150, 300))

func _spawn_player(peer_id: int, spawn_pos: Vector2) -> Node:
	var player_script = preload("res://scripts/Player.gd")
	var player = CharacterBody2D.new()
	player.set_script(player_script)
	player.name = str(peer_id)
	player.global_position = spawn_pos
	add_child(player)
	
	if player.has_method("respawn"):
		player.respawn(spawn_pos)
	return player

func _ensure_child_node(node_name: String, script: Script) -> Node:
	var existing = get_node_or_null(node_name)
	if existing == null:
		var node = Node.new()
		node.set_script(script)
		node.name = node_name
		add_child(node)
		return node
	return existing

func _ensure_root_node(node_name: String, script: Script) -> Node:
	var existing = get_node_or_null("/root/%s" % node_name)
	if existing == null:
		var node = Node.new()
		node.set_script(script)
		node.name = node_name
		get_tree().root.add_child(node)
		return node
	return existing
