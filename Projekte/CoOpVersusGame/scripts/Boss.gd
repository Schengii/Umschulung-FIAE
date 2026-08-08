extends CharacterBody2D

# Boss – Godot 4.x
# Heavy boss enemy with two alternating attack phases.

@export var max_health: int = 500
var health: int = max_health

enum Phase { SPIRAL, CHARGE }
var current_phase: Phase = Phase.SPIRAL
var _phase_timer: float = 4.0

# Stats
var speed: float = 70.0
var charge_speed: float = 300.0
var damage_amount: int = 30
var attack_cooldown: float = 1.0
var _charge_dir: Vector2 = Vector2.ZERO
var _charge_duration: float = 0.0

var _attack_timer: float = 0.0
var _shoot_timer: float = 0.0

var enemy_projectile_script = preload("res://scripts/EnemyProjectile.gd")
var portal_script = preload("res://scripts/Portal.gd")

func _ready() -> void:
	# Scale stats with level index
	var level_idx = 0
	var lm = get_node_or_null("/root/LevelManager")
	if lm:
		level_idx = lm.current_index
	var scale_factor = 1.0 + level_idx * 0.3
	max_health = int(max_health * scale_factor)
	damage_amount = int(damage_amount * scale_factor)
	health = max_health
	
	add_to_group("enemies")
	add_to_group("boss")

	
	# Visuals: Large Dark Purple ColorRect
	var rect = ColorRect.new()
	rect.size = Vector2(48, 48)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.3, 0.1, 0.5) # Dark Purple
	add_child(rect)
	
	# CollisionShape2D
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	add_child(collision)

	# Area2D for contact damage
	var area = Area2D.new()
	var area_collision = CollisionShape2D.new()
	var area_shape = RectangleShape2D.new()
	area_shape.size = rect.size + Vector2(4, 4)
	area_collision.shape = area_shape
	area.add_child(area_collision)
	add_child(area)
	area.body_entered.connect(_on_player_entered)

	# Trigger camera shake for everyone when Boss spawns
	_shake_all_cameras(15.0, 1.0)

# Scale boss stats based on player count (#10)
func scale_for_players(player_count: int) -> void:
	var scale = 1.0 + (player_count - 1) * 0.5
	max_health = int(max_health * scale)
	damage_amount = int(damage_amount * (1.0 + (player_count - 1) * 0.2))
	health = max_health

func _physics_process(delta: float) -> void:
	if _attack_timer > 0.0:
		_attack_timer -= delta
	if _shoot_timer > 0.0:
		_shoot_timer -= delta
		
	# Phase management
	_phase_timer -= delta
	if _phase_timer <= 0.0:
		_phase_timer = 4.0
		_toggle_phase()

	var target = _find_nearest_player()
	if target:
		match current_phase:
			Phase.SPIRAL:
				var dir = (target.global_position - global_position).normalized()
				velocity = dir * speed
				move_and_slide()
				
				# Shoot spiral
				if _shoot_timer <= 0.0:
					_shoot_timer = 1.0 # Shoot every second
					_shoot_spiral()
			Phase.CHARGE:
				# Charge dash logic
				if _charge_duration > 0.0:
					_charge_duration -= delta
					velocity = _charge_dir * charge_speed
					move_and_slide()
				else:
					# Recalculate charge towards player
					_charge_dir = (target.global_position - global_position).normalized()
					_charge_duration = 1.5 # Charge for 1.5 seconds
					velocity = Vector2.ZERO

func _toggle_phase() -> void:
	if current_phase == Phase.SPIRAL:
		current_phase = Phase.CHARGE
		_charge_duration = 0.0
		#print("[Boss] Phase changed to CHARGE!")
		modulate = Color(1.0, 0.6, 0.2)
	else:
		current_phase = Phase.SPIRAL
		#print("[Boss] Phase changed to SPIRAL!")
		modulate = Color(1.0, 1.0, 1.0)

func _shoot_spiral() -> void:
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		# Spawn 8-way projectiles
		for i in range(8):
			var angle = i * (PI / 4.0)
			var shoot_dir = Vector2(cos(angle), sin(angle))
			var proj_id = randi()
			if multiplayer.has_multiplayer_peer():
				rpc("rpc_boss_shoot", proj_id, global_position + shoot_dir * 32.0, shoot_dir)
			else:
				rpc_boss_shoot(proj_id, global_position + shoot_dir * 32.0, shoot_dir)

@rpc("authority", "call_local", "reliable")
func rpc_boss_shoot(proj_id: int, spawn_pos: Vector2, dir: Vector2) -> void:
	var proj = Area2D.new()
	proj.set_script(enemy_projectile_script)
	proj.name = "BossProj_%d" % proj_id
	proj.global_position = spawn_pos
	proj.direction = dir
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(proj)

func _find_nearest_player() -> Node2D:
	var players = get_tree().get_nodes_in_group("players")
	if players.is_empty():
		return null

		
	var nearest_player: Node2D = null
	var min_dist = INF
	for player in players:
		if player.has_method("is_dead") and player.is_dead:
			continue
		var dist = global_position.distance_to(player.global_position)
		if dist < min_dist:
			min_dist = dist
			nearest_player = player
	return nearest_player

func take_damage(amount: int) -> void:
	health -= amount
	health = max(health, 0)
	#print("[Boss] HP: %d/%d" % [health, max_health])
	
	# Spawn damage number
	var dmg_num_script = preload("res://scripts/DamageNumber.gd")
	var dmg_num = Label.new()
	dmg_num.set_script(dmg_num_script)
	dmg_num.text = str(amount)
	dmg_num.global_position = global_position + Vector2(0, -24)
	get_parent().add_child(dmg_num)

	# Modulate feedback
	modulate = Color(2, 2, 2, 1)
	var timer = get_tree().create_timer(0.08)
	timer.timeout.connect(func(): modulate = Color(1.0, 0.6, 0.2) if current_phase == Phase.CHARGE else Color(1, 1, 1, 1))

	# Shake cameras slightly on hit
	_shake_all_cameras(4.0, 0.15)

	if health <= 0:
		_die()

func _die() -> void:
	var sm = get_node_or_null("/root/ScoreManager")
	if sm:
		sm.add_points(100)
	
	_shake_all_cameras(25.0, 1.2)
	_spawn_death_effect()
	
	# Spawn portal to transition to next level (server only)
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		_spawn_portal()
		
	queue_free()

func _spawn_portal() -> void:
	var portal_id = randi()
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_spawn_portal", portal_id, global_position)
	else:
		rpc_spawn_portal(portal_id, global_position)

@rpc("authority", "call_local", "reliable")
func rpc_spawn_portal(portal_id: int, spawn_pos: Vector2) -> void:
	var portal = Area2D.new()
	portal.set_script(portal_script)
	portal.name = "Portal_%d" % portal_id
	portal.global_position = spawn_pos
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(portal)

func _spawn_death_effect() -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 40
	particles.lifetime = 1.0
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 80.0
	particles.initial_velocity_max = 200.0
	particles.color = Color(0.4, 0.15, 0.6)
	
	get_parent().add_child(particles)
	var timer = get_tree().create_timer(1.2)
	timer.timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())

func _shake_all_cameras(intensity: float, duration: float) -> void:
	for cam in get_tree().get_nodes_in_group("cameras"):
		if cam.has_method("shake"):
			cam.shake(intensity, duration)

func _on_player_entered(body: Node2D) -> void:
	var is_player = body.is_in_group("players") or body.name == "Player" or body.name.is_valid_int()
	if is_player:
		if body.has_method("take_damage") and _attack_timer <= 0.0:
			body.take_damage(damage_amount)
			_attack_timer = attack_cooldown
