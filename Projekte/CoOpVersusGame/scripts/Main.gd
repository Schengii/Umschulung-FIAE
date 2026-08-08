extends Node

var spawner_script = preload("res://scripts/EnemySpawner.gd")
var game_manager_script = preload("res://scripts/GameManager.gd")
var plate_script = preload("res://scripts/PressurePlate.gd")
var door_script = preload("res://scripts/PuzzleDoor.gd")
var audio_manager_script = preload("res://scripts/AudioManager.gd")
var score_manager_script = preload("res://scripts/ScoreManager.gd")
var level_manager_script = preload("res://scripts/LevelManager.gd")
var network_manager_script = preload("res://scripts/NetworkManager.gd")
var tutorial_overlay_script = preload("res://scripts/TutorialOverlay.gd")
var dungeon_generator_script = preload("res://scripts/DungeonGenerator.gd")

func _ready() -> void:
	#print("Co‑Op Versus Game – Main scene loaded")
	
	# Add dark ambience CanvasModulate
	var ambience = CanvasModulate.new()
	ambience.color = Color(0.12, 0.12, 0.18)
	add_child(ambience)

	_ensure_child_node("AudioManager", audio_manager_script)
	_ensure_root_node("ScoreManager", score_manager_script)
	_ensure_root_node("LevelManager", level_manager_script)
	_ensure_root_node("NetworkManager", network_manager_script)
	_ensure_child_node("GameManager", game_manager_script)
	_ensure_child_node("EnemySpawner", spawner_script)
	
	var dg = _ensure_child_node("DungeonGenerator", dungeon_generator_script)
	dg.dungeon_generated.connect(_on_dungeon_generated)

func _on_dungeon_generated() -> void:
	var dg = get_node_or_null("DungeonGenerator")
	if not dg:
		return
		
	# Find a clear starting area
	var center_x = dg.width / 2
	var center_y = dg.height / 2
	var tile_size = dg.tile_size
	var base_spawn_pos = Vector2(center_x * tile_size + tile_size/2.0, center_y * tile_size + tile_size/2.0)
	
	# Spawn players for each connected peer
	var net = get_node_or_null("/root/NetworkManager")
	if net and net.get_player_count() > 0:
		var offset = 0
		for peer_id in net.connected_players.keys():
			var spawn_pos = base_spawn_pos + Vector2(offset * 40, 0)
			_spawn_player(peer_id, spawn_pos)
			offset += 1
	else:
		_spawn_player(1, base_spawn_pos)
		# Spawn Companion Bot in singleplayer mode
		var bot_script = load("res://scripts/CompanionBot.gd")
		if bot_script:
			var bot = CharacterBody2D.new()
			bot.set_script(bot_script)
			bot.name = "CompanionBot"
			bot.global_position = base_spawn_pos + Vector2(-40, 0)
			add_child(bot)

	# Place pressure plates and puzzle door relative to base_spawn_pos
	var plate1 = Area2D.new()
	plate1.set_script(plate_script)
	plate1.name = "Plate1"
	plate1.global_position = base_spawn_pos + Vector2(-tile_size * 2, 0) # 2 tiles left
	add_child(plate1)
	
	var plate2 = Area2D.new()
	plate2.set_script(plate_script)
	plate2.name = "Plate2"
	plate2.global_position = base_spawn_pos + Vector2(tile_size * 2, 0) # 2 tiles right
	add_child(plate2)
	
	var door = StaticBody2D.new()
	door.set_script(door_script)
	door.name = "PuzzleDoor"
	door.global_position = base_spawn_pos + Vector2(0, -tile_size) # 1 tile up
	add_child(door)
	
	plate1.door = door
	plate2.door = door
	door.plate1 = plate1
	door.plate2 = plate2

	var intro_timer = get_tree().create_timer(0.2)
	intro_timer.timeout.connect(func():
		var overlay = tutorial_overlay_script.new()
		add_child(overlay)
	)

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
