extends CharacterBody2D

# Player – Godot 4.x
# Features: WASD movement, Dash, Shield, Class Selector (Soldier/Scout/Tank),
# Knockdown & Revive system, Shooting, Power-up upgrades, and synthetic Sound effects.

@export var speed: float = 200.0
@export var dash_speed: float = 400.0
@export var dash_duration: float = 0.2
@export var dash_cooldown: float = 1.0
var _dash_timer: float = 0.0
var _dash_cooldown_timer: float = 0.0
var _can_dash: bool = true
var dash_active: bool = false
var _dash_dir: Vector2 = Vector2.ZERO
var _net_sync_timer: float = 0.0
const NET_SYNC_RATE: float = 0.05 # ~20 updates/second

# Pause menu
var _pause_overlay: CanvasLayer = null
var _is_paused: bool = false

@export var shield_duration: float = 3.0
@export var shield_cooldown: float = 2.0
var _shield_timer: float = 0.0
var _shield_cooldown_timer: float = 0.0
var shield_active: bool = false

# Health
@export var max_health: int = 100
var health: int = max_health

# Respawn & Knockdown state
var is_local_player: bool = true
var is_dead: bool = false
var is_permanently_dead: bool = false
var _spawn_position: Vector2 = Vector2.ZERO
var _bleedout_timer: float = 30.0
var _iframes_timer: float = 0.0
var is_reviving_action_pressed: bool = false


# Class system
enum ClassType { SOLDIER, SCOUT, TANK, ENGINEER, MAGE, ROGUE }
var current_class: ClassType = ClassType.SOLDIER
var _class_label: Label = null
var _class_change_timer: float = 0.0
var _class_info_label: Label = null

# Revive system
var _revive_area: Area2D = null
var _revive_progress: float = 0.0
var _revive_label: Label = null

# Signals
signal health_changed(new_health: int, max_hp: int)
signal died(player: Node)
signal respawned()
signal dash_cooldown_changed(ratio: float)
signal shield_cooldown_changed(ratio: float)

# Shooting variables
@export var shoot_cooldown: float = 0.3
var _shoot_timer: float = 0.0
var _facing_direction: Vector2 = Vector2.RIGHT
var projectile_script = preload("res://scripts/Projectile.gd")

# Power-up variables
var _base_speed: float = 200.0
var _speed_boost_timer: float = 0.0
var _spread_shot_timer: float = 0.0

func _ready() -> void:
	_spawn_position = global_position
	_base_speed = speed
	health = max_health
	add_to_group("players")
	
	# Add visual representation via Sprite2D with dynamically generated class textures
	var sprite = Sprite2D.new()
	sprite.name = "BodyVisual"
	add_child(sprite)
	
	# Keep a reference to the collision shape
	var rect_size = Vector2(20, 20)
	
	# Add collision shape
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect_size
	collision.shape = shape
	collision.name = "BodyCollision"
	add_child(collision)

	# Spawn camera for local player
	is_local_player = true
	if multiplayer.has_multiplayer_peer():
		is_local_player = (name == str(multiplayer.get_unique_id()) or name == "Player")

		
	if is_local_player:
		var camera_script = preload("res://scripts/GameCamera.gd")
		var cam = Camera2D.new()
		cam.set_script(camera_script)
		cam.name = "GameCamera"
		cam.add_to_group("cameras")
		add_child(cam)
		var timer = get_tree().create_timer(0.01)
		timer.timeout.connect(func(): cam.setup(self))
		
		# Instantiate HUD dynamically
		var hud_canvas = CanvasLayer.new()
		hud_canvas.name = "HUDCanvas"
		var hud_scene = preload("res://scenes/HUD.tscn")
		var hud = hud_scene.instantiate()
		hud_canvas.add_child(hud)
		add_child(hud_canvas)
		var hud_timer = get_tree().create_timer(0.01)
		hud_timer.timeout.connect(func(): hud.setup(self))

	# Create dynamic Class Label
	_class_label = Label.new()
	_class_label.text = "SOLDIER"
	_class_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_class_label.position = Vector2(-40, -42)
	_class_label.theme_override_font_sizes/font_size = 9
	_class_label.theme_override_colors/font_outline_color = Color(0,0,0)
	_class_label.theme_override_constants/outline_size = 3
	add_child(_class_label)
	
	_class_info_label = Label.new()
	_class_info_label.text = "SHIELD"
	_class_info_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_class_info_label.position = Vector2(-40, -58)
	_class_info_label.theme_override_font_sizes/font_size = 8
	_class_info_label.modulate = Color(0.8, 0.8, 0.8)
	add_child(_class_info_label)
	
	_apply_class_stats()
	_apply_talent_tree_bonuses()
	_setup_light()

func _apply_talent_tree_bonuses() -> void:
	var sm = get_node_or_null("/root/ScoreManager")
	var rm = get_node_or_null("/root/RelicManager")
	if sm and "talents" in sm:
		var speed_lvl = sm.talents.get("speed_boost", 0)
		if speed_lvl > 0:
			speed *= (1.0 + speed_lvl * 0.05)
			_base_speed = speed
		var relic_lvl = sm.talents.get("start_relic", 0)
		if relic_lvl > 0 and rm:
			var starter_perks = rm.get_random_perks(1)
			if not starter_perks.is_empty():
				rm.apply_perk(self, starter_perks[0]["id"])

func _physics_process(delta: float) -> void:
	if is_permanently_dead:
		velocity = Vector2.ZERO
		return
		
	if not is_local_player:
		move_and_slide()
		if _iframes_timer > 0.0:
			_iframes_timer -= delta
			if int(_iframes_timer * 10) % 2 == 0:
				modulate.a = 0.5
			else:
				modulate.a = 1.0
			if _iframes_timer <= 0.0:
				modulate.a = 1.0
		return

	# I-Frames
	if _iframes_timer > 0.0:
		_iframes_timer -= delta
		if int(_iframes_timer * 10) % 2 == 0:
			modulate.a = 0.5
		else:
			modulate.a = 1.0
		if _iframes_timer <= 0.0:
			modulate.a = 1.0


	# Sync Reviving Input
	var wants_to_revive = false
	if InputMap.has_action("interact"):
		wants_to_revive = Input.is_action_pressed("interact")
	else:
		wants_to_revive = Input.is_key_pressed(KEY_E)
		
	if wants_to_revive != is_reviving_action_pressed:
		is_reviving_action_pressed = wants_to_revive
		if multiplayer.has_multiplayer_peer():
			rpc("rpc_set_reviving", is_reviving_action_pressed)
		else:
			rpc_set_reviving(is_reviving_action_pressed)

	# Decrement class swap lock timer
	if _class_change_timer > 0.0:
		_class_change_timer -= delta

	# Handle revive state
	if is_dead:
		_bleedout_timer -= delta
		if _bleedout_timer <= 0.0:
			_die_permanently()
			return
			
		# Crawling
		var input_vector = Vector2.ZERO
		input_vector.x = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")
		input_vector.y = Input.get_action_strength("ui_down") - Input.get_action_strength("ui_up")
		velocity = input_vector.normalized() * (speed * 0.25)
		move_and_slide()
		
		_update_revive(delta)
		return

	# ── Power-up timers ──────────────────────────────────────────────────────
	if _speed_boost_timer > 0.0:
		_speed_boost_timer -= delta
		if _speed_boost_timer <= 0.0:
			speed = _base_speed
			#print("[Player] Speed boost ended.")

	if _spread_shot_timer > 0.0:
		_spread_shot_timer -= delta
		if _spread_shot_timer <= 0.0:
			#print("[Player] Spread shot ended.")

	# ── Class Toggle (C Key) ──────────────────────────────────────────────────
	var wants_class_switch = false
	if InputMap.has_action("class_switch"):
		wants_class_switch = Input.is_action_just_pressed("class_switch")
	else:
		wants_class_switch = Input.is_key_pressed(KEY_C)
	if wants_class_switch and _class_change_timer <= 0.0:
		_class_change_timer = 0.3
		_cycle_class()

	# ── Dash timer ──────────────────────────────────────────────────────────
	if dash_active:
		_dash_timer -= delta
		if _dash_timer <= 0.0:
			dash_active = false
			_can_dash = false
			_dash_cooldown_timer = dash_cooldown
	elif not _can_dash:
		_dash_cooldown_timer -= delta
		if _dash_cooldown_timer <= 0.0:
			_dash_cooldown_timer = 0.0
			_can_dash = true
	emit_signal("dash_cooldown_changed", 1.0 if _can_dash else 1.0 - (_dash_cooldown_timer / dash_cooldown))

	# ── Shield timer ─────────────────────────────────────────────────────────
	if shield_active:
		_shield_timer -= delta
		if _shield_timer <= 0.0:
			shield_active = false
			_shield_cooldown_timer = shield_cooldown
			modulate = _get_class_color()
	elif _shield_cooldown_timer > 0.0:
		_shield_cooldown_timer -= delta
		if _shield_cooldown_timer < 0.0:
			_shield_cooldown_timer = 0.0
	var shield_ready = not shield_active and _shield_cooldown_timer == 0.0
	emit_signal("shield_cooldown_changed", 1.0 if shield_ready else 1.0 - (_shield_cooldown_timer / shield_cooldown))

	# ── Input ────────────────────────────────────────────────────────────────
	var input_vector = Vector2.ZERO
	input_vector.x = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")
	input_vector.y = Input.get_action_strength("ui_down") - Input.get_action_strength("ui_up")

	# Touch fallback
	if Input.get_touch_count() > 0:
		var touch_pos = get_viewport().get_mouse_position()
		input_vector = (touch_pos - global_position).normalized()

	# Track facing direction (Gamepad Twin Stick support)
	var aim_vector = Input.get_vector("aim_left", "aim_right", "aim_up", "aim_down")
	if aim_vector != Vector2.ZERO:
		_facing_direction = aim_vector.normalized()
	elif input_vector != Vector2.ZERO:
		_facing_direction = input_vector.normalized()

	# ── Shooting ─────────────────────────────────────────────────────────────
	if _shoot_timer > 0.0:
		_shoot_timer -= delta

	var wants_to_shoot = Input.is_action_just_pressed("shoot") or Input.is_action_just_pressed("ui_select")
	if wants_to_shoot and _shoot_timer <= 0.0:
		_shoot_timer = shoot_cooldown
		_shoot()

	# ── Shop opening (Tab) ───────────────────────────────────────────────────
	if Input.is_action_just_pressed("ui_focus_next"):
		_toggle_shop()

	# ── Dash activation ──────────────────────────────────────────────────────
	if Input.is_action_just_pressed("dash") and _can_dash:
		dash_active = true
		if current_class == ClassType.MAGE:
			_spawn_teleport_particles(global_position)
			global_position += (input_vector.normalized() if input_vector != Vector2.ZERO else _facing_direction) * 150.0
			_spawn_teleport_particles(global_position)
			dash_active = false
			_can_dash = false
			_dash_cooldown_timer = dash_cooldown
			var am = get_node_or_null("/root/AudioManager")
			if am and am.has_method("play_teleport"):
				am.play_teleport()
			else:
				if am: am.play_shoot()

		else:
			_dash_timer = dash_duration
			_dash_dir = input_vector.normalized() if input_vector != Vector2.ZERO else _facing_direction
			velocity = _dash_dir * dash_speed
			move_and_slide()
		return

	# ── Shield activation ────────────────────────────────────────────────────
	if Input.is_action_just_pressed("shield") and not shield_active and _shield_cooldown_timer == 0.0:
		shield_active = true
		_shield_timer = shield_duration
		if current_class == ClassType.ENGINEER:
			_spawn_turret()
			modulate = Color(1.0, 1.0, 0.4)
		elif current_class == ClassType.MAGE:
			_cast_heal()
			modulate = Color(1.0, 0.4, 1.0)
		elif current_class == ClassType.ROGUE:
			modulate.a = 0.3
			remove_from_group("players")
		else:
			modulate = Color(0, 0.5, 1, 0.5) # Blue glow
	elif not shield_active:
		if current_class == ClassType.ROGUE and not is_in_group("players"):
			add_to_group("players")
		modulate = _get_class_color()

	# ── Move ─────────────────────────────────────────────────────────────────
	if dash_active:
		velocity = _dash_dir * dash_speed
		move_and_slide()
		_spawn_dash_particles()
	elif input_vector != Vector2.ZERO:
		velocity = input_vector * speed
		move_and_slide()
	else:
		velocity = Vector2.ZERO
		
	# Spawn Rogue stealth smoke if invis
	if shield_active and current_class == ClassType.ROGUE:
		if Engine.get_physics_frames() % 5 == 0:
			_spawn_stealth_smoke()

		
	_handle_push_blocks()
	if multiplayer.has_multiplayer_peer():
		_net_sync_timer -= delta
		if _net_sync_timer <= 0.0:
			_net_sync_timer = NET_SYNC_RATE
			rpc("rpc_update_state", global_position, velocity, current_class, health, shield_active)


func _handle_push_blocks() -> void:
	for i in get_slide_collision_count():
		var col = get_slide_collision(i)
		var collider = col.get_collider()
		if collider and collider.is_in_group("push_blocks") and collider.has_method("push"):
			var push_vel = -col.get_normal() * (speed * 0.6)
			collider.push(push_vel)

# ── Class Settings ───────────────────────────────────────────────────────────

func _cycle_class() -> void:
	var score_mgr = get_node_or_null("/root/ScoreManager")
	var allowed = [0, 1, 2]
	if score_mgr:
		allowed = score_mgr.unlocked_classes
		
	var next_id = current_class + 1
	while not next_id in allowed:
		next_id += 1
		if next_id > 5:
			next_id = 0
			
	current_class = next_id as ClassType
	
	var am = get_node_or_null("/root/AudioManager")
	if am: am.play_hit()
	
	_apply_class_stats()

func _apply_class_stats() -> void:
	match current_class:
		ClassType.SOLDIER:
			_base_speed = 200.0
			max_health = 100
			shield_duration = 3.0
			if _class_label: _class_label.text = "SOLDIER"
			if _class_info_label: _class_info_label.text = "SHIELD"
		ClassType.SCOUT:
			_base_speed = 250.0
			max_health = 85
			shield_duration = 2.0
			if _class_label: _class_label.text = "SCOUT"
			if _class_info_label: _class_info_label.text = "SPEED"
		ClassType.TANK:
			_base_speed = 165.0
			max_health = 175
			shield_duration = 5.0
			if _class_label: _class_label.text = "TANK"
			if _class_info_label: _class_info_label.text = "ARMOR"
		ClassType.ENGINEER:
			_base_speed = 180.0
			max_health = 100
			shield_duration = 0.5 # Turret CD
			if _class_label: _class_label.text = "ENGINEER"
			if _class_info_label: _class_info_label.text = "TURRET"
		ClassType.MAGE:
			_base_speed = 170.0
			max_health = 80
			shield_duration = 2.5 # Heal CD (increased from 1.5)
			if _class_label: _class_label.text = "MAGE"
			if _class_info_label: _class_info_label.text = "HEAL"
		ClassType.ROGUE:
			_base_speed = 240.0
			max_health = 80
			shield_duration = 3.0 # Stealth duration (reduced from 4.0)
			if _class_label: _class_label.text = "ROGUE"
			if _class_info_label: _class_info_label.text = "STEALTH"
			
	modulate = _get_class_color()
	health = min(health, max_health)
	emit_signal("health_changed", health, max_health)
	if _speed_boost_timer <= 0.0:
		speed = _base_speed
		
	# Update programmatic class texture
	var body_visual = get_node_or_null("BodyVisual")
	if body_visual and body_visual is Sprite2D:
		body_visual.texture = _generate_class_texture(current_class)

# Cache for generated class textures
var _class_texture_cache: Dictionary = {}

func _generate_class_texture(c_type: ClassType) -> Texture2D:
	if _class_texture_cache.has(c_type):
		return _class_texture_cache[c_type]
		
	var img = Image.create(20, 20, false, Image.FORMAT_RGBA8)
	var base_col = _get_class_color()
	
	# Draw basic body shape (rounded shield-like/armor shape)
	for y in range(20):
		for x in range(20):
			var dist_x = abs(x - 9.5)
			# Curve the sides slightly to make a rounder helmet/suit
			var width_at_y = 7.5 - (y * y * 0.01) if y < 10 else 7.5 - ((19 - y) * (19 - y) * 0.02)
			if dist_x <= width_at_y:
				# Default base shadow gradient
				var shadow = 0.85 + (y / 130.0)
				img.set_pixel(x, y, Color(base_col.r * shadow, base_col.g * shadow, base_col.b * shadow, 1.0))
				
	# Draw class-specific detailing overlay
	match c_type:
		ClassType.SOLDIER:
			# Soldier: Cross-shaped visor/helmet lines (White/Grey)
			for y in range(5, 9):
				for x in range(4, 16):
					img.set_pixel(x, y, Color(0.2, 0.2, 0.25, 1.0)) # Dark visor slot
			for y in range(5, 9):
				img.set_pixel(9, y, Color(0.9, 0.9, 0.9, 1.0))
				img.set_pixel(10, y, Color(0.9, 0.9, 0.9, 1.0))
		ClassType.SCOUT:
			# Scout: Hooded look (Green hood with dark face, glowing green eyes)
			for y in range(4, 13):
				for x in range(6, 14):
					img.set_pixel(x, y, Color(0.1, 0.1, 0.12, 1.0)) # Face shadow
			img.set_pixel(7, 8, Color(0.0, 1.0, 0.2, 1.0)) # Left eye
			img.set_pixel(12, 8, Color(0.0, 1.0, 0.2, 1.0)) # Right eye
		ClassType.TANK:
			# Tank: Heavy blue steel armor with orange glowing visor slot
			for y in range(6, 10):
				for x in range(3, 17):
					img.set_pixel(x, y, Color(1.0, 0.4, 0.0, 1.0)) # Glowing Orange Visor
		ClassType.ENGINEER:
			# Engineer: Gasmask/Welding mask style (Yellow base, dark circular lenses)
			img.set_pixel(6, 8, Color(0.15, 0.15, 0.15, 1.0))
			img.set_pixel(7, 8, Color(0.15, 0.15, 0.15, 1.0))
			img.set_pixel(12, 8, Color(0.15, 0.15, 0.15, 1.0))
			img.set_pixel(13, 8, Color(0.15, 0.15, 0.15, 1.0))
			for y in range(12, 17):
				for x in range(8, 12):
					img.set_pixel(x, y, Color(0.2, 0.2, 0.2, 1.0)) # Filter canister
		ClassType.MAGE:
			# Mage: Wizard hat outline / purple robe highlights
			for y in range(0, 5):
				var hat_w = y
				for x in range(10 - hat_w, 10 + hat_w):
					img.set_pixel(x, y, Color(0.6, 0.2, 0.6, 1.0))
			img.set_pixel(7, 9, Color(1.0, 0.2, 1.0, 1.0)) # Pink magical eyes
			img.set_pixel(12, 9, Color(1.0, 0.2, 1.0, 1.0))
		ClassType.ROGUE:
			# Rogue: Stealth mask wrapping face (Dark grey with glowing red slit eyes)
			for y in range(4, 9):
				for x in range(5, 15):
					img.set_pixel(x, y, Color(0.1, 0.1, 0.1, 1.0))
			img.set_pixel(7, 7, Color(1.0, 0.1, 0.1, 1.0)) # Red eye
			img.set_pixel(12, 7, Color(1.0, 0.1, 0.1, 1.0))
			
	var tex = ImageTexture.create_from_image(img)
	_class_texture_cache[c_type] = tex
	return tex

func _get_class_color() -> Color:
	match current_class:
		ClassType.SOLDIER: return Color(1.0, 1.0, 1.0) # White
		ClassType.SCOUT: return Color(0.4, 1.0, 0.4) # Green
		ClassType.TANK: return Color(0.4, 0.8, 1.0) # Cyan
		ClassType.ENGINEER: return Color(1.0, 1.0, 0.4) # Yellow
		ClassType.MAGE: return Color(1.0, 0.4, 1.0) # Pink
		ClassType.ROGUE: return Color(0.4, 0.4, 0.4) # Dark Gray
	return Color(1, 1, 1)

# ── Class Abilities ──────────────────────────────────────────────────────────

func _spawn_turret() -> void:
	if multiplayer.has_multiplayer_peer():
		if multiplayer.is_server():
			var t_id = randi()
			rpc("rpc_spawn_turret", t_id, global_position)
		else:
			rpc_id(1, "rpc_request_turret", global_position)
	else:
		rpc_spawn_turret(randi(), global_position)


@rpc("authority", "call_local", "reliable")
func rpc_spawn_turret(t_id: int, pos: Vector2) -> void:
	var turret_script = load("res://scripts/Turret.gd")
	if turret_script:
		var t = turret_script.new()
		t.name = "Turret_%d" % t_id
		t.global_position = pos
		t.owner_id = multiplayer.get_unique_id() if multiplayer.has_multiplayer_peer() else 1
		get_parent().add_child(t)

func _cast_heal() -> void:
	# Heal all players within 200 radius for 25 HP
	var players = get_tree().get_nodes_in_group("players")
	for p in players:
		if p.global_position.distance_to(global_position) <= 200.0:
			p.health = min(p.health + 25, p.max_health)
			p.emit_signal("health_changed", p.health, p.max_health)

# ── Damage & Death ───────────────────────────────────────────────────────────

func take_damage(amount: int, attacker: Node = null) -> void:
	if is_dead or shield_active or _iframes_timer > 0.0 or is_permanently_dead:
		return
	health -= amount
	health = max(health, 0)
	emit_signal("health_changed", health, max_health)
	
	# Relic Perk: Thorns
	var relic_mgr = get_node_or_null("/root/RelicManager")
	if relic_mgr and relic_mgr.has_perk(self, "thorns") and attacker and attacker.has_method("take_damage"):
		attacker.take_damage(int(amount * 0.3))
	
	# Play synthetic hit sound
	var am = get_node_or_null("/root/AudioManager")
	if am: am.play_hit()
	
	# Shake camera on damage
	for cam in get_tree().get_nodes_in_group("cameras"):
		if cam.has_method("shake"):
			cam.shake(8.0, 0.25)
			
	# Hit-Flash Effect
	var original_modulate = modulate
	modulate = Color(5.0, 5.0, 5.0, 1.0)
	var flash_timer = get_tree().create_timer(0.08)
	flash_timer.timeout.connect(func(): modulate = original_modulate)

	if health <= 0:
		_die()

func _die() -> void:
	if is_permanently_dead:
		return
	is_dead = true
	_bleedout_timer = 30.0
	modulate = Color(0.3, 0.3, 0.3) # Grayed out
	if _class_label:
		_class_label.text = "TOT (HELP)"
	
	# Create Revive zone
	_spawn_revive_area()
	
	emit_signal("died", self)
	#print("[Player] Knocked down.")

# ── Revive System ────────────────────────────────────────────────────────────

@rpc("any_peer", "call_local", "unreliable")
func rpc_set_reviving(state: bool) -> void:
	is_reviving_action_pressed = state

func _die_permanently() -> void:
	is_permanently_dead = true
	velocity = Vector2.ZERO
	modulate = Color(0.2, 0.2, 0.2)
	if _class_label:
		_class_label.text = "TOT"
	
	if is_instance_valid(_revive_area):
		_revive_area.queue_free()
		_revive_area = null
	if is_instance_valid(_revive_label):
		_revive_label.queue_free()
		_revive_label = null

func _spawn_revive_area() -> void:
	if is_instance_valid(_revive_area):
		return
		
	_revive_area = Area2D.new()
	_revive_area.name = "ReviveArea"
	_revive_area.monitoring = true
	
	var col = CollisionShape2D.new()
	var shape = CircleShape2D.new()
	shape.radius = 50.0
	col.shape = shape
	_revive_area.add_child(col)
	add_child(_revive_area)
	
	_revive_label = Label.new()
	_revive_label.text = "Beleben: 0%"
	_revive_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_revive_label.position = Vector2(-40, 20)
	_revive_label.theme_override_font_sizes/font_size = 9
	add_child(_revive_label)

func _update_revive(delta: float) -> void:
	if not _revive_area:
		return
		
	var overlapping = _revive_area.get_overlapping_bodies()
	var helper_present = false
	for body in overlapping:
		if body != self and (body.is_in_group("players") or body.name == "Player" or body.name.is_valid_int()):
			if body.has_method("is_dead") and not body.is_dead:
				if "is_reviving_action_pressed" in body and body.is_reviving_action_pressed:
					helper_present = true
					break
				
	if helper_present:
		_revive_progress += delta
		if _revive_label:
			_revive_label.text = "Beleben: %d%%" % int((_revive_progress / 3.0) * 100.0)
			
		if _revive_progress >= 3.0:
			if multiplayer.has_multiplayer_peer():
				rpc("rpc_revive")
			else:
				rpc_revive()
	else:
		_revive_progress = max(_revive_progress - delta * 0.5, 0.0)
		if _revive_label:
			_revive_label.text = "Beleben: %d%%" % int((_revive_progress / 3.0) * 100.0)

@rpc("any_peer", "call_local", "reliable")
func rpc_revive() -> void:
	is_dead = false
	health = int(max_health / 2)
	_revive_progress = 0.0
	_iframes_timer = 2.0
	_bleedout_timer = 30.0
	_apply_class_stats()
	emit_signal("health_changed", health, max_health)
	emit_signal("respawned")
	
	if is_instance_valid(_revive_area):
		_revive_area.queue_free()
		_revive_area = null
	if is_instance_valid(_revive_label):
		_revive_label.queue_free()
		_revive_label = null
		
	var am = get_node_or_null("/root/AudioManager")
	if am: am.play_victory()

# ── Respawn ───────────────────────────────────────────────────────────────────

func respawn(spawn_pos: Vector2 = _spawn_position) -> void:
	is_dead = false
	is_permanently_dead = false
	health = max_health
	global_position = spawn_pos
	velocity = Vector2.ZERO
	visible = true
	_bleedout_timer = 30.0
	_iframes_timer = 2.0
	_apply_class_stats()
	
	if is_instance_valid(_revive_area):
		_revive_area.queue_free()
		_revive_area = null
	if is_instance_valid(_revive_label):
		_revive_label.queue_free()
		_revive_label = null
		
	emit_signal("health_changed", health, max_health)
	emit_signal("respawned")
	#print("[Player] Respawned at %s" % spawn_pos)

# ── Score ─────────────────────────────────────────────────────────────────────

func on_enemy_defeated() -> void:
	var sm = get_node_or_null("/root/ScoreManager")
	if sm:
		sm.add_points(10)
	else:
		push_error("[Player] ScoreManager not found")

# ── Shoot Logic ───────────────────────────────────────────────────────────────

func _get_class_projectile_type() -> int:
	match current_class:
		ClassType.SOLDIER: return 0 # NORMAL
		ClassType.SCOUT: return 1 # SHOTGUN
		ClassType.TANK: return 2 # EXPLOSIVE
		ClassType.ENGINEER: return 3 # PIERCING
		ClassType.MAGE: return 4 # MAGIC_HOMING
		ClassType.ROGUE: return 5 # POISON
	return 0

func _shoot() -> void:
	var shoot_dir = _facing_direction
	var spawn_pos = global_position + shoot_dir * 20.0
	var shooter_id = multiplayer.get_unique_id() if multiplayer.has_multiplayer_peer() else 1
	var proj_type = _get_class_projectile_type()
	
	var am = get_node_or_null("/root/AudioManager")
	if am: am.play_shoot()
	
	if current_class == ClassType.SCOUT:
		var angles = [-12.0, 0.0, 12.0]
		for angle in angles:
			var rotated_dir = shoot_dir.rotated(deg_to_rad(angle))
			if multiplayer.has_multiplayer_peer():
				rpc("rpc_shoot", spawn_pos, rotated_dir, shooter_id, proj_type)
			else:
				rpc_shoot(spawn_pos, rotated_dir, shooter_id, proj_type)
	elif _spread_shot_timer > 0.0:
		var angles = [-15.0, 0.0, 15.0]
		for angle in angles:
			var rotated_dir = shoot_dir.rotated(deg_to_rad(angle))
			if multiplayer.has_multiplayer_peer():
				rpc("rpc_shoot", spawn_pos, rotated_dir, shooter_id, proj_type)
			else:
				rpc_shoot(spawn_pos, rotated_dir, shooter_id, proj_type)
	else:
		if multiplayer.has_multiplayer_peer():
			rpc("rpc_shoot", spawn_pos, shoot_dir, shooter_id, proj_type)
		else:
			rpc_shoot(spawn_pos, shoot_dir, shooter_id, proj_type)

@rpc("any_peer", "call_local", "reliable")
func rpc_shoot(spawn_pos: Vector2, dir: Vector2, shooter: int, proj_type: int) -> void:
	var proj = Area2D.new()
	proj.set_script(projectile_script)
	proj.projectile_type = proj_type
	proj.global_position = spawn_pos
	proj.direction = dir
	proj.shooter_id = shooter
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(proj)

# ── Shop & Upgrade Application ────────────────────────────────────────────────

var shop_scene = preload("res://scripts/UpgradeShop.gd")
var _shop_instance: Node = null

func _toggle_shop() -> void:
	if is_dead:
		return
	if is_instance_valid(_shop_instance):
		_shop_instance.queue_free()
		_shop_instance = null
	else:
		var is_local = true
		if multiplayer.has_multiplayer_peer():
			is_local = (name == str(multiplayer.get_unique_id()) or name == "Player")
		if is_local:
			_shop_instance = CanvasLayer.new()
			_shop_instance.set_script(shop_scene)
			_shop_instance.player = self
			add_child(_shop_instance)

# ── Pause Menu ─────────────────────────────────────────────────────────────────

func _unhandled_input(event: InputEvent) -> void:
	if not is_local_player:
		return
	if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		_toggle_pause_menu()
		get_viewport().set_input_as_handled()

func _toggle_pause_menu() -> void:
	if is_instance_valid(_pause_overlay):
		_resume_game()
		return
	
	_is_paused = true
	get_tree().paused = true
	
	_pause_overlay = CanvasLayer.new()
	_pause_overlay.layer = 110
	_pause_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(_pause_overlay)
	
	# Dim background
	var dim = ColorRect.new()
	dim.color = Color(0, 0, 0, 0.6)
	dim.anchors_preset = Control.PRESET_FULL_RECT
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	_pause_overlay.add_child(dim)
	
	# Panel
	var panel = PanelContainer.new()
	panel.custom_minimum_size = Vector2(300, 280)
	panel.anchors_preset = Control.PRESET_CENTER
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER, Control.PRESET_MODE_KEEP_SIZE)
	_pause_overlay.add_child(panel)
	
	var vbox = VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.theme_override_constants/separation = 15
	panel.add_child(vbox)
	
	# Title
	var title = Label.new()
	title.text = "⏸ PAUSE"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.theme_override_font_sizes/font_size = 22
	title.modulate = Color(1.0, 0.9, 0.4)
	vbox.add_child(title)
	
	# Volume Slider
	var vol_hbox = HBoxContainer.new()
	vol_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	var vol_label = Label.new()
	vol_label.text = "Lautstärke: "
	vol_hbox.add_child(vol_label)
	var vol_slider = HSlider.new()
	vol_slider.min_value = 0.0
	vol_slider.max_value = 1.0
	vol_slider.step = 0.05
	vol_slider.value = db_to_linear(AudioServer.get_bus_volume_db(0))
	vol_slider.custom_minimum_size = Vector2(150, 20)
	vol_slider.value_changed.connect(func(val):
		AudioServer.set_bus_volume_db(0, linear_to_db(val))
	)
	vol_hbox.add_child(vol_slider)
	vbox.add_child(vol_hbox)
	
	# Resume Button
	var resume_btn = Button.new()
	resume_btn.text = "Weiterspielen"
	resume_btn.custom_minimum_size = Vector2(220, 40)
	resume_btn.pressed.connect(_resume_game)
	vbox.add_child(resume_btn)
	
	# Back to Lobby Button
	var lobby_btn = Button.new()
	lobby_btn.text = "Zurück zur Lobby"
	lobby_btn.custom_minimum_size = Vector2(220, 40)
	lobby_btn.pressed.connect(func():
		_resume_game()
		var net = get_node_or_null("/root/NetworkManager")
		if net:
			net.disconnect_from_game()
		get_tree().change_scene_to_file("res://scenes/Lobby.tscn")
	)
	vbox.add_child(lobby_btn)

func _resume_game() -> void:
	_is_paused = false
	get_tree().paused = false
	if is_instance_valid(_pause_overlay):
		_pause_overlay.queue_free()
		_pause_overlay = null

func apply_permanent_upgrade(upgrade_type: int) -> void:
	match upgrade_type:
		0: # SPEED
			_base_speed *= 1.15
			if _speed_boost_timer <= 0.0:
				speed = _base_speed
			#print("[Player] Upgraded base speed: %f" % _base_speed)
		1: # MAX HP
			max_health += 25
			health = min(health + 25, max_health)
			emit_signal("health_changed", health, max_health)
			#print("[Player] Upgraded max health: %d" % max_health)
		2: # FIRE RATE
			shoot_cooldown *= 0.85
			#print("[Player] Upgraded shoot cooldown: %f" % shoot_cooldown)
		3: # DASH COOLDOWN
			dash_cooldown *= 0.85
			#print("[Player] Upgraded dash cooldown: %f" % dash_cooldown)

func apply_powerup(type: int) -> void:
	match type:
		0: # HEALTH
			health = min(health + 30, max_health)
			emit_signal("health_changed", health, max_health)
		1: # SPEED BOOST
			_speed_boost_timer = 6.0
			speed = _base_speed * 1.35
		2: # SPREAD SHOT
			_spread_shot_timer = 8.0
		3: # SHIELD BOOSTER
			_shield_cooldown_timer = max(0.0, _shield_cooldown_timer - 1.5)
			shield_duration += 0.5
			if shield_duration > 5.0:
				shield_duration = 5.0
				
	var am = get_node_or_null("/root/AudioManager")
	if am and am.has_method("play_powerup"):
		am.play_powerup()

func _spawn_dash_particles() -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 0.5
	particles.amount = 4
	particles.lifetime = 0.3
	particles.spread = 30.0
	particles.direction = -_dash_dir
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 30.0
	particles.initial_velocity_max = 60.0
	particles.color = Color(1.0, 1.0, 1.0, 0.4) if current_class != ClassType.ROGUE else Color(0.3, 0.3, 0.3, 0.1)
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(particles)
		var timer = get_tree().create_timer(0.4)
		timer.timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())

func _setup_light() -> void:
	var light = PointLight2D.new()
	light.texture = _create_radial_light_texture(256)
	light.texture_scale = 1.5
	light.energy = 1.0
	light.color = Color(1.0, 0.95, 0.8) # Warm light
	light.blend_mode = Light2D.BLEND_MODE_ADD
	add_child(light)

func _create_radial_light_texture(radius: int) -> Texture2D:
	var img = Image.create(radius * 2, radius * 2, false, Image.FORMAT_RGBA8)
	var center = Vector2(radius, radius)
	for y in range(radius * 2):
		for x in range(radius * 2):
			var dist = Vector2(x, y).distance_to(center)
			if dist < radius:
				var factor = 1.0 - (dist / radius)
				factor = factor * factor # smooth falloff
				img.set_pixel(x, y, Color(1, 1, 1, factor))
			else:
				img.set_pixel(x, y, Color(1, 1, 1, 0))
	return ImageTexture.create_from_image(img)

@rpc("any_peer", "call_remote", "unreliable_ordered")
func rpc_update_state(pos: Vector2, vel: Vector2, c_class: int, hp: int, shield: bool) -> void:
	if not is_local_player:
		# Smooth interpolation instead of teleporting
		global_position = global_position.lerp(pos, 0.5)
		velocity = vel
		if current_class != c_class:
			current_class = c_class as ClassType
			_apply_class_stats()
		if health != hp:
			health = hp
			emit_signal("health_changed", health, max_health)
		shield_active = shield

@rpc("any_peer", "call_local", "reliable")
func rpc_request_turret(pos: Vector2) -> void:
	if multiplayer.is_server():
		var t_id = randi()
		rpc("rpc_spawn_turret", t_id, pos)

func _spawn_teleport_particles(pos: Vector2) -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = pos
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 0.8
	particles.amount = 12
	particles.lifetime = 0.4
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 50.0
	particles.initial_velocity_max = 100.0
	particles.color = Color(0.9, 0.4, 0.9, 0.8) # Purple/Pink magic
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(particles)
		get_tree().create_timer(0.5).timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())

func _spawn_stealth_smoke() -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = global_position + Vector2(randf_range(-10, 10), randf_range(-10, 10))
	particles.emitting = true
	particles.one_shot = true
	particles.amount = 3
	particles.lifetime = 0.5
	particles.gravity = Vector2(0, -20) # Floating up
	particles.initial_velocity_min = 5.0
	particles.initial_velocity_max = 15.0
	particles.color = Color(0.3, 0.3, 0.3, 0.3) # Dark smoke
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(particles)
		get_tree().create_timer(0.6).timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())
