extends Node

# GameManager – Godot 4.x
# Tracks game timers, win/loss states, objective flow, wave mode and syncing lobby/restarts.

@export var game_duration: float = 90.0
var time_left: float = game_duration
var is_game_over: bool = false
var is_victory: bool = false
var current_mode: int = 0
var wave_number: int = 1
var wave_timer: float = 8.0
var wave_spawn_count: int = 2
var _boss_spawned: bool = false
var _ui_overlay: CanvasLayer = null
const BOSS_WAVE: int = 5 # Boss spawns after this wave

signal time_changed(seconds_left: float)
signal game_ended(victory: bool)
signal objective_changed(text: String)
signal wave_started(wave_number: int)
signal boss_spawned()

var boss_scripts = [
	preload("res://scripts/Boss.gd"),
	preload("res://scripts/MageBoss.gd"),
	preload("res://scripts/SlimeBoss.gd")
]

func _ready() -> void:
	add_to_group("game_manager")
	time_left = game_duration
	current_mode = 0
	_update_objective("Welle 1 – Überlebe die erste Angriffswelle.")
	var timer = get_tree().create_timer(1.0)
	timer.timeout.connect(_deferred_setup)
	_start_wave()

func _deferred_setup() -> void:
	_connect_player_signals()

var _player_check_timer: float = 0.0

func _connect_player_signals() -> void:
	for player in get_tree().get_nodes_in_group("players"):
		if not player.died.is_connected(_on_player_died):
			player.died.connect(_on_player_died)

func _process(delta: float) -> void:
	if is_game_over or is_victory:
		return
	# Periodically check for new players (every 2 seconds instead of every frame)
	_player_check_timer -= delta
	if _player_check_timer <= 0.0:
		_player_check_timer = 2.0
		_connect_player_signals()
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		time_left -= delta
		if current_mode == 0:
			wave_timer -= delta
			if wave_timer <= 0.0:
				_start_wave()
		# Boss spawns after a set wave, not just by time
		if wave_number > BOSS_WAVE and not _boss_spawned:
			_boss_spawned = true
			_spawn_boss()
		if time_left <= 0.0:
			time_left = 0.0
			var bosses = get_tree().get_nodes_in_group("boss")
			if bosses.is_empty():
				_trigger_end(true)
		else:
			if multiplayer.has_multiplayer_peer():
				rpc("rpc_sync_time", time_left)
			else:
				rpc_sync_time(time_left)

func _start_wave() -> void:
	wave_timer = max(3.0, 8.0 - (wave_number - 1) * 0.5)
	# Scale spawn count with wave, capped to avoid overwhelming
	var player_count = _get_player_count()
	wave_spawn_count = int((2 + wave_number) * (1.0 + (player_count - 1) * 0.3))
	var wave_text = "Welle %d – %d Gegner" % [wave_number, wave_spawn_count]
	_update_objective(wave_text)
	emit_signal("wave_started", wave_number)
	
	# Relic offer every 3 waves
	if wave_number > 1 and (wave_number - 1) % 3 == 0:
		var rm = get_node_or_null("/root/RelicManager")
		if rm:
			rm.emit_signal("offer_relics", rm.get_random_perks(3))
			
	var spawner = get_tree().get_first_node_in_group("enemy_spawners")
	if spawner:
		for i in range(wave_spawn_count):
			if spawner.has_method("_spawn_enemy_wave"):
				spawner._spawn_enemy_wave(wave_number, player_count)
			elif spawner.has_method("_spawn_enemy"):
				spawner._spawn_enemy()
	wave_number += 1

func _update_objective(text: String) -> void:
	emit_signal("objective_changed", text)
	#print("[GameManager] Objective: %s" % text)

func _spawn_boss() -> void:
	var spawn_pos = Vector2(400, 300)
	var players = get_tree().get_nodes_in_group("players")
	if not players.is_empty():
		var target_player = players[0]
		spawn_pos = target_player.global_position + Vector2(300, 0).rotated(randf() * PI * 2.0)
	var boss_id = randi()
	var boss_type = randi() % boss_scripts.size()
	var player_count = _get_player_count()
	_update_objective("Boss erschienen! Zerstöre ihn!")
	emit_signal("boss_spawned")
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_spawn_boss", boss_id, spawn_pos, boss_type, player_count)
	else:
		rpc_spawn_boss(boss_id, spawn_pos, boss_type, player_count)

func _get_player_count() -> int:
	var net = get_node_or_null("/root/NetworkManager")
	if net:
		return max(1, net.get_player_count())
	return 1

@rpc("authority", "call_local", "reliable")
func rpc_spawn_boss(boss_id: int, spawn_pos: Vector2, boss_type: int, player_count: int = 1) -> void:
	var boss = CharacterBody2D.new()
	boss.set_script(boss_scripts[boss_type])
	boss.name = "Boss_%d" % boss_id
	boss.global_position = spawn_pos
	# Scale boss HP with player count (#10)
	if boss.has_method("scale_for_players"):
		boss.scale_for_players(player_count)
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(boss)
	for cam in get_tree().get_nodes_in_group("cameras"):
		if cam.has_method("shake"):
			cam.shake(15.0, 1.2)
	var am = get_node_or_null("/root/AudioManager")
	if am and am.has_method("set_boss_music"):
		am.set_boss_music(true)

@rpc("authority", "call_local", "reliable")
func rpc_sync_time(new_time: float) -> void:
	time_left = new_time
	emit_signal("time_changed", time_left)

func _on_player_died(_player: Node) -> void:
	var players = get_tree().get_nodes_in_group("players")
	var all_dead = true
	for p in players:
		if p.has_method("is_dead") and not p.is_dead:
			all_dead = false
			break
	if all_dead and (not multiplayer.has_multiplayer_peer() or multiplayer.is_server()):
		_trigger_end(false)

func _trigger_end(victory: bool) -> void:
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_end_game", victory)
	else:
		rpc_end_game(victory)

@rpc("authority", "call_local", "reliable")
func rpc_end_game(victory: bool) -> void:
	if victory:
		is_victory = true
	else:
		is_game_over = true
	emit_signal("game_ended", victory)
	#print("[GameManager] Game Ended. Victory: %s" % victory)
	_show_end_screen(victory)

func _show_end_screen(victory: bool) -> void:
	_ui_overlay = CanvasLayer.new()
	_ui_overlay.layer = 50
	add_child(_ui_overlay)
	
	# Dim background with fade-in
	var dim = ColorRect.new()
	dim.color = Color(0, 0, 0, 0)
	dim.anchors_preset = Control.PRESET_FULL_RECT
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	_ui_overlay.add_child(dim)
	var dim_tween = create_tween()
	dim_tween.tween_property(dim, "color", Color(0, 0, 0, 0.65), 0.8)
	
	var panel = PanelContainer.new()
	panel.custom_minimum_size = Vector2(380, 320)
	panel.anchors_preset = Control.PRESET_CENTER
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER, Control.PRESET_MODE_KEEP_SIZE)
	panel.modulate = Color(1, 1, 1, 0) # Start invisible for fade-in
	_ui_overlay.add_child(panel)
	
	# Fade-in + scale animation
	var panel_tween = create_tween()
	panel_tween.set_ease(Tween.EASE_OUT)
	panel_tween.set_trans(Tween.TRANS_BACK)
	panel.scale = Vector2(0.7, 0.7)
	panel.pivot_offset = panel.custom_minimum_size / 2.0
	panel_tween.tween_property(panel, "modulate", Color(1, 1, 1, 1), 0.5).set_delay(0.3)
	panel_tween.parallel().tween_property(panel, "scale", Vector2(1, 1), 0.5).set_delay(0.3)
	
	var vbox = VBoxContainer.new()
	vbox.anchors_preset = Control.PRESET_FULL_RECT
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.theme_override_constants/separation = 12
	panel.add_child(vbox)
	
	# Title with color
	var title = Label.new()
	title.text = "🏆 SIEG!" if victory else "💀 GAME OVER"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.theme_override_font_sizes/font_size = 26
	title.modulate = Color(0.2, 0.9, 0.3) if victory else Color(0.9, 0.15, 0.15)
	vbox.add_child(title)
	
	# Separator
	var sep = HSeparator.new()
	vbox.add_child(sep)
	
	# Statistics
	var score_manager = get_node_or_null("/root/ScoreManager")
	var final_score = score_manager.score if score_manager else 0
	var waves_survived = wave_number - 1
	var time_elapsed = game_duration - time_left
	
	var stats_grid = GridContainer.new()
	stats_grid.columns = 2
	stats_grid.theme_override_constants/h_separation = 20
	stats_grid.theme_override_constants/v_separation = 6
	vbox.add_child(stats_grid)
	
	_add_stat_row(stats_grid, "Punkte:", str(final_score))
	_add_stat_row(stats_grid, "Wellen überlebt:", str(waves_survived))
	_add_stat_row(stats_grid, "Zeit:", "%d:%02d" % [int(time_elapsed) / 60, int(time_elapsed) % 60])
	
	# Player count
	var player_count = get_tree().get_nodes_in_group("players").size()
	_add_stat_row(stats_grid, "Spieler:", str(player_count))
	
	# Separator 2
	var sep2 = HSeparator.new()
	vbox.add_child(sep2)
	
	# Buttons
	var is_host = not multiplayer.has_multiplayer_peer() or multiplayer.is_server()
	var btn_restart = Button.new()
	btn_restart.text = "🔄 Neustart"
	btn_restart.custom_minimum_size = Vector2(200, 36)
	btn_restart.disabled = not is_host
	btn_restart.pressed.connect(_on_restart_pressed)
	vbox.add_child(btn_restart)
	var btn_lobby = Button.new()
	btn_lobby.text = "🏠 Zurück zur Lobby"
	btn_lobby.custom_minimum_size = Vector2(200, 36)
	btn_lobby.disabled = not is_host
	btn_lobby.pressed.connect(_on_lobby_pressed)
	vbox.add_child(btn_lobby)

func _add_stat_row(grid: GridContainer, label_text: String, value_text: String) -> void:
	var lbl = Label.new()
	lbl.text = label_text
	lbl.modulate = Color(0.7, 0.7, 0.8)
	grid.add_child(lbl)
	var val = Label.new()
	val.text = value_text
	val.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	val.modulate = Color(1.0, 1.0, 0.8)
	grid.add_child(val)

func _on_restart_pressed() -> void:
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_restart")
	else:
		rpc_restart()

@rpc("authority", "call_local", "reliable")
func rpc_restart() -> void:
	if _ui_overlay:
		_ui_overlay.queue_free()
	get_tree().reload_current_scene()

func _on_lobby_pressed() -> void:
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_go_to_lobby")
	else:
		rpc_go_to_lobby()

@rpc("authority", "call_local", "reliable")
func rpc_go_to_lobby() -> void:
	if _ui_overlay:
		_ui_overlay.queue_free()
	var net = get_node_or_null("/root/NetworkManager")
	if net:
		net.disconnect_from_game()
	get_tree().change_scene_to_file("res://scenes/Lobby.tscn")
