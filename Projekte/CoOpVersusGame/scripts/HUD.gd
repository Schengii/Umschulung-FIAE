extends Control

# HUD – Godot 4.x
# Displays: Player count, local player Health, Score, Dash/Shield cooldowns, Connection status.
# Call setup(player) from the scene that spawns the local player.

# ── Node References (matched to HUD.tscn) ────────────────────────────────────
@onready var _health_bar: ProgressBar        = $TopBar/HealthSection/HealthBar
@onready var _health_label: Label            = $TopBar/HealthSection/HealthLabel
@onready var _score_label: Label             = $TopBar/ScoreLabel
@onready var _player_count_label: Label      = $TopBar/PlayerCountLabel
@onready var _connection_label: Label        = $TopBar/ConnectionLabel
@onready var _dash_bar: ProgressBar          = $BottomBar/DashSection/DashBar
@onready var _dash_label: Label              = $BottomBar/DashSection/DashLabel
@onready var _shield_bar: ProgressBar        = $BottomBar/ShieldSection/ShieldBar
@onready var _shield_label: Label            = $BottomBar/ShieldSection/ShieldLabel

var _tracked_player: Node = null
var _timer_label: Label
var _objective_label: Label
var _xp_label: Label
var _wave_label: Label

var _boss_bar: ProgressBar = null
var _boss_bar_label: Label = null

# Cached buff labels to avoid recreating every frame (#33 performance fix)
var _speed_boost_label: Label = null
var _spread_shot_label: Label = null

func _ready() -> void:
	# Create programmatic boss health bar
	_boss_bar = ProgressBar.new()
	_boss_bar.custom_minimum_size = Vector2(300, 15)
	_boss_bar.anchors_preset = Control.PRESET_CENTER_TOP
	_boss_bar.position = Vector2(400 - 150, 60)
	_boss_bar.visible = false
	_boss_bar.modulate = Color(0.9, 0.2, 0.2)
	add_child(_boss_bar)
	
	_boss_bar_label = Label.new()
	_boss_bar_label.text = "BOSS"
	_boss_bar_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_boss_bar_label.position = Vector2(0, -22)
	_boss_bar_label.size = Vector2(300, 20)
	_boss_bar_label.theme_override_font_sizes/font_size = 11
	_boss_bar.add_child(_boss_bar_label)

	# Create buffs container
	var buffs_container = VBoxContainer.new()
	buffs_container.position = Vector2(20, 480)
	buffs_container.name = "BuffsContainer"
	add_child(buffs_container)

	_update_connection_status()
	_update_player_count()
	_update_score(0)

	_timer_label = Label.new()
	_timer_label.text = "Zeit: 90s"
	$TopBar.add_child(_timer_label)
	$TopBar.move_child(_timer_label, 1)

	_objective_label = Label.new()
	_objective_label.text = "Ziel: Überlebe die Wellen"
	_objective_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_objective_label.modulate = Color(1.0, 0.9, 0.3)
	$TopBar.add_child(_objective_label)
	$TopBar.move_child(_objective_label, 2)

	_xp_label = Label.new()
	_xp_label.text = "XP: 0 | Level 1"
	_xp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	$TopBar.add_child(_xp_label)
	$TopBar.move_child(_xp_label, 3)

	_wave_label = Label.new()
	_wave_label.text = "Welle: 1"
	_wave_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_wave_label.modulate = Color(0.6, 0.9, 1.0)
	$TopBar.add_child(_wave_label)
	$TopBar.move_child(_wave_label, 4)

	var gm_check = get_tree().create_timer(0.2)
	gm_check.timeout.connect(func():
		var gm = get_tree().get_first_node_in_group("game_manager")
		if gm:
			gm.time_changed.connect(_on_time_changed)
			gm.objective_changed.connect(_on_objective_changed)
			gm.wave_started.connect(_on_wave_started)
			_on_time_changed(gm.time_left)
			_on_wave_started(gm.wave_number)
	)

	var sm = get_node_or_null("/root/ScoreManager")
	if sm:
		sm.score_updated.connect(_update_score)
		sm.xp_updated.connect(_on_xp_updated)

	var net = get_node_or_null("/root/NetworkManager")
	if net:
		net.player_connected.connect(func(_id): _update_player_count())
		net.player_disconnected.connect(func(_id): _update_player_count())


## Call this once after the local player node is spawned.
func setup(player: Node) -> void:
	_tracked_player = player
	player.health_changed.connect(_on_health_changed)
	player.dash_cooldown_changed.connect(_on_dash_cooldown_changed)
	player.shield_cooldown_changed.connect(_on_shield_cooldown_changed)
	_on_health_changed(player.health, player.max_health)
	_on_dash_cooldown_changed(1.0)
	_on_shield_cooldown_changed(1.0)

# ── Health ────────────────────────────────────────────────────────────────────

func _on_health_changed(new_health: int, max_hp: int) -> void:
	_health_bar.max_value = max_hp
	_health_bar.value = new_health
	_health_label.text = "%d / %d" % [new_health, max_hp]
	# Color feedback: green → yellow → red
	var ratio = float(new_health) / float(max_hp)
	if ratio > 0.5:
		_health_bar.modulate = Color(0.2, 0.9, 0.3)
	elif ratio > 0.25:
		_health_bar.modulate = Color(1.0, 0.8, 0.1)
	else:
		_health_bar.modulate = Color(0.9, 0.15, 0.15)

# ── Score ─────────────────────────────────────────────────────────────────────

func _update_score(new_score: int) -> void:
	_score_label.text = "Score: %d" % new_score

func _on_xp_updated(new_xp: int, new_level: int, xp_needed: int) -> void:
	if _xp_label:
		_xp_label.text = "XP: %d | Level %d (%d bis zum nächsten)" % [new_xp, new_level, xp_needed]

func _on_objective_changed(text: String) -> void:
	if _objective_label:
		_objective_label.text = text

# ── Player Count ──────────────────────────────────────────────────────────────

func _update_player_count() -> void:
	var net = get_node_or_null("/root/NetworkManager")
	var count = 1
	if net:
		count = net.get_player_count()
	_player_count_label.text = "Spieler: %d" % count

# ── Connection Status ─────────────────────────────────────────────────────────

func _update_connection_status() -> void:
	var net = get_node_or_null("/root/NetworkManager")
	if not net or not net.peer:
		_connection_label.text = "● OFFLINE"
		_connection_label.modulate = Color(0.6, 0.6, 0.6)
	elif net.is_server():
		_connection_label.text = "● HOST"
		_connection_label.modulate = Color(0.2, 0.8, 1.0)
	else:
		_connection_label.text = "● CLIENT"
		_connection_label.modulate = Color(0.3, 1.0, 0.4)

# ── Cooldowns ─────────────────────────────────────────────────────────────────

func _on_dash_cooldown_changed(ratio: float) -> void:
	_dash_bar.value = ratio * 100.0
	if ratio >= 1.0:
		_dash_label.text = "DASH ✓"
		_dash_bar.modulate = Color(0.3, 0.8, 1.0)
	else:
		_dash_label.text = "DASH %.0f%%" % (ratio * 100.0)
		_dash_bar.modulate = Color(0.5, 0.5, 0.7)

func _on_shield_cooldown_changed(ratio: float) -> void:
	_shield_bar.value = ratio * 100.0
	if ratio >= 1.0:
		_shield_label.text = "SHIELD ✓"
		_shield_bar.modulate = Color(0.2, 0.6, 1.0)
	else:
		_shield_label.text = "SHIELD %.0f%%" % (ratio * 100.0)
		_shield_bar.modulate = Color(0.4, 0.4, 0.6)

func _on_time_changed(seconds_left: float) -> void:
	if _timer_label:
		_timer_label.text = "Zeit: %d s" % ceil(seconds_left)

func _on_wave_started(wave_num: int) -> void:
	if _wave_label:
		_wave_label.text = "Welle: %d" % wave_num

func _process(delta: float) -> void:
	# Update Boss Health Bar
	var bosses = get_tree().get_nodes_in_group("boss")
	if not bosses.is_empty():
		var boss = bosses[0]
		if is_instance_valid(boss) and "health" in boss and "max_health" in boss:
			_boss_bar.max_value = boss.max_health
			_boss_bar.value = boss.health
			_boss_bar_label.text = "%s: %d / %d" % [boss.name.split("_")[0], boss.health, boss.max_health]
			_boss_bar.visible = true
	else:
		if _boss_bar:
			_boss_bar.visible = false

	# Update Buffs display (cached labels instead of recreating every frame)
	if is_instance_valid(_tracked_player):
		var buffs_container = get_node_or_null("BuffsContainer")
		if buffs_container:
			# Speed Boost label
			if "_speed_boost_timer" in _tracked_player and _tracked_player._speed_boost_timer > 0.0:
				if not is_instance_valid(_speed_boost_label):
					_speed_boost_label = Label.new()
					_speed_boost_label.modulate = Color(1.0, 1.0, 0.4)
					_speed_boost_label.theme_override_font_sizes/font_size = 10
					buffs_container.add_child(_speed_boost_label)
				_speed_boost_label.text = "⚡ SPEED BOOST: %.1fs" % _tracked_player._speed_boost_timer
				_speed_boost_label.visible = true
			elif is_instance_valid(_speed_boost_label):
				_speed_boost_label.visible = false
			
			# Spread Shot label
			if "_spread_shot_timer" in _tracked_player and _tracked_player._spread_shot_timer > 0.0:
				if not is_instance_valid(_spread_shot_label):
					_spread_shot_label = Label.new()
					_spread_shot_label.modulate = Color(1.0, 0.5, 0.2)
					_spread_shot_label.theme_override_font_sizes/font_size = 10
					buffs_container.add_child(_spread_shot_label)
				_spread_shot_label.text = "⚔ SPREAD SHOT: %.1fs" % _tracked_player._spread_shot_timer
				_spread_shot_label.visible = true
	var rm = get_node_or_null("/root/RelicManager")
	if rm and not rm.offer_relics.is_connected(show_relic_selection):
		rm.offer_relics.connect(show_relic_selection)

func show_relic_selection(options: Array = []) -> void:
	var rm = get_node_or_null("/root/RelicManager")
	if options.is_empty() and rm:
		options = rm.get_random_perks(3)
	if options.is_empty():
		return
		
	var modal = CanvasLayer.new()
	modal.layer = 40
	add_child(modal)
	
	var dim = ColorRect.new()
	dim.color = Color(0, 0, 0, 0.75)
	dim.anchors_preset = Control.PRESET_FULL_RECT
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	modal.add_child(dim)
	
	var center_box = VBoxContainer.new()
	center_box.anchors_preset = Control.PRESET_CENTER
	center_box.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	center_box.alignment = BoxContainer.ALIGNMENT_CENTER
	center_box.theme_override_constants/separation = 20
	modal.add_child(center_box)
	
	var title = Label.new()
	title.text = "✨ WÄHLE DEIN RELIKT"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.theme_override_font_sizes/font_size = 24
	title.modulate = Color(1.0, 0.9, 0.3)
	center_box.add_child(title)
	
	var card_row = HBoxContainer.new()
	card_row.alignment = BoxContainer.ALIGNMENT_CENTER
	card_row.theme_override_constants/h_separation = 16
	center_box.add_child(card_row)
	
	for perk in options:
		var btn = Button.new()
		btn.custom_minimum_size = Vector2(160, 180)
		btn.text = "%s\n\n%s\n\n%s" % [perk["icon"], perk["title"], perk["description"]]
		btn.pressed.connect(func():
			if is_instance_valid(_tracked_player) and rm:
				rm.apply_perk(_tracked_player, perk["id"])
			modal.queue_free()
		)
		card_row.add_child(btn)

