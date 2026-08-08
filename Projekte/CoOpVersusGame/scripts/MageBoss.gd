extends CharacterBody2D

# MageBoss - Godot 4.x
# Boss that teleports around, shoots homing projectiles, and summons minions.

@export var max_health: int = 350
var health: int = max_health

enum Phase { TELEPORT, SUMMON }
var current_phase: Phase = Phase.TELEPORT
var _phase_timer: float = 5.0
var _teleport_timer: float = 2.0
var _shoot_timer: float = 1.0

var enemy_projectile_script = preload("res://scripts/EnemyProjectile.gd")
var enemy_script = preload("res://scripts/Enemy.gd")
var portal_script = preload("res://scripts/Portal.gd")
var damage_amount: int = 25
var attack_cooldown: float = 1.0
var _attack_timer: float = 0.0

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

	
	# Visuals: Cyan ColorRect
	var rect = ColorRect.new()
	rect.size = Vector2(40, 40)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.2, 0.8, 0.9) # Cyan
	add_child(rect)
	
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

	# Camera shake on spawn
	_shake_all_cameras(15.0, 1.0)

# Scale boss stats based on player count (#10)
func scale_for_players(player_count: int) -> void:
	var scale = 1.0 + (player_count - 1) * 0.5
	max_health = int(max_health * scale)
	damage_amount = int(damage_amount * (1.0 + (player_count - 1) * 0.2))
	health = max_health

func _physics_process(delta: float) -> void:
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		_phase_timer -= delta
		if _phase_timer <= 0.0:
			_phase_timer = 6.0
			_toggle_phase()

		match current_phase:
			Phase.TELEPORT:
				_teleport_timer -= delta
				if _teleport_timer <= 0.0:
					_teleport_timer = 2.5
					_teleport()
				
				_shoot_timer -= delta
				if _shoot_timer <= 0.0:
					_shoot_timer = 1.5
					_shoot_homing()
			Phase.SUMMON:
				# In summon phase, it stays still and spawns enemies once
				if _phase_timer > 5.5: # Just started summon phase
					pass # wait a bit
				elif _phase_timer > 5.0 and _phase_timer < 5.2:
					# Summon exactly once per phase
					_summon_minions()
					_phase_timer = 2.0 # Cut summon phase short after spawning

func _toggle_phase() -> void:
	if current_phase == Phase.TELEPORT:
		current_phase = Phase.SUMMON
		modulate = Color(1.0, 0.2, 0.5)
	else:
		current_phase = Phase.TELEPORT
		modulate = Color(1.0, 1.0, 1.0)

func _teleport() -> void:
	var target = _find_nearest_player()
	if target:
		var angle = randf() * PI * 2.0
		var dist = 150.0 + randf() * 150.0
		var new_pos = target.global_position + Vector2(cos(angle), sin(angle)) * dist
		global_position = new_pos
		if multiplayer.has_multiplayer_peer():
			rpc("rpc_sync_teleport", new_pos)

@rpc("authority", "call_local", "reliable")
func rpc_sync_teleport(new_pos: Vector2) -> void:
	global_position = new_pos
	_spawn_teleport_effect()

func _shoot_homing() -> void:
	var target = _find_nearest_player()
	if target:
		for i in range(3):
			var shoot_dir = (target.global_position - global_position).normalized().rotated((i - 1) * 0.3)
			var proj_id = randi()
			if multiplayer.has_multiplayer_peer():
				rpc("rpc_boss_shoot", proj_id, global_position + shoot_dir * 32.0, shoot_dir)
			else:
				rpc_boss_shoot(proj_id, global_position + shoot_dir * 32.0, shoot_dir)

@rpc("any_peer", "call_local", "reliable")
func rpc_boss_shoot(proj_id: int, spawn_pos: Vector2, dir: Vector2) -> void:
	var proj = Area2D.new()
	proj.set_script(enemy_projectile_script)
	proj.name = "MageBossProj_%d" % proj_id
	proj.global_position = spawn_pos
	proj.direction = dir
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(proj)

func _summon_minions() -> void:
	for i in range(2):
		var spawn_pos = global_position + Vector2(randf_range(-50, 50), randf_range(-50, 50))
		var enemy_id = randi()
		var enemy_type = 2 # RANGED
		if randf() > 0.5:
			enemy_type = 1 # CHARGER
		if multiplayer.has_multiplayer_peer():
			rpc("rpc_spawn_minion", enemy_id, spawn_pos, enemy_type)
		else:
			rpc_spawn_minion(enemy_id, spawn_pos, enemy_type)

@rpc("authority", "call_local", "reliable")
func rpc_spawn_minion(enemy_id: int, spawn_pos: Vector2, enemy_type: int) -> void:
	var enemy = CharacterBody2D.new()
	enemy.set_script(enemy_script)
	enemy.name = "Minion_%d" % enemy_id
	enemy.type = enemy_type
	enemy.global_position = spawn_pos
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(enemy)

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
	
	var dmg_num_script = preload("res://scripts/DamageNumber.gd")
	var dmg_num = Label.new()
	dmg_num.set_script(dmg_num_script)
	dmg_num.text = str(amount)
	dmg_num.global_position = global_position + Vector2(0, -24)
	get_parent().add_child(dmg_num)

	modulate = Color(2, 2, 2, 1)
	var timer = get_tree().create_timer(0.08)
	timer.timeout.connect(func(): modulate = Color(1.0, 0.2, 0.5) if current_phase == Phase.SUMMON else Color(1, 1, 1, 1))

	_shake_all_cameras(4.0, 0.15)

	if health <= 0:
		_die()

func _die() -> void:
	var sm = get_node_or_null("/root/ScoreManager")
	if sm:
		sm.add_points(150)
	
	_shake_all_cameras(25.0, 1.2)
	_spawn_teleport_effect()
	
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

func _spawn_teleport_effect() -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 30
	particles.lifetime = 0.8
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 50.0
	particles.initial_velocity_max = 150.0
	particles.color = Color(0.2, 0.8, 0.9)
	
	get_parent().add_child(particles)
	var timer = get_tree().create_timer(1.0)
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
