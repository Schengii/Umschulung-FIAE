extends CharacterBody2D

# SlimeBoss - Godot 4.x
# Splits into smaller slimes when killed.

@export var max_health: int = 250
@export var size_level: int = 2 # 2 = Large, 1 = Medium, 0 = Small

var health: int = max_health
var speed: float = 60.0
var is_exploded: bool = false

var _jump_timer: float = 0.0
var _attack_timer: float = 0.0
var damage_amount: int = 20
var portal_script = preload("res://scripts/Portal.gd")

func _ready() -> void:
	add_to_group("enemies")
	add_to_group("boss")
	
	# Adjust stats based on size level
	var rect_size = 48.0
	if size_level == 1:
		max_health = 100
		speed = 90.0
		rect_size = 32.0
		damage_amount = 15
	elif size_level == 0:
		max_health = 40
		speed = 130.0
		rect_size = 20.0
		damage_amount = 10

	# Scale stats with level index
	var level_idx = 0
	var lm = get_node_or_null("/root/LevelManager")
	if lm:
		level_idx = lm.current_index
	var scale_factor = 1.0 + level_idx * 0.3
	max_health = int(max_health * scale_factor)
	damage_amount = int(damage_amount * scale_factor)
	health = max_health

	
	# Visuals: Green ColorRect
	var rect = ColorRect.new()
	rect.size = Vector2(rect_size, rect_size)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.2, 0.9, 0.3) # Green
	add_child(rect)
	
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	add_child(collision)
	
	# Area2D for contact damage
	var area = Area2D.new()
	var area_col = CollisionShape2D.new()
	var area_shape = RectangleShape2D.new()
	area_shape.size = rect.size + Vector2(4, 4)
	area_col.shape = area_shape
	area.add_child(area_col)
	area.body_entered.connect(_on_player_entered)

	if size_level == 2:
		_shake_all_cameras(15.0, 1.0)

# Scale boss stats based on player count (#10)
func scale_for_players(player_count: int) -> void:
	var scale = 1.0 + (player_count - 1) * 0.5
	max_health = int(max_health * scale)
	damage_amount = int(damage_amount * (1.0 + (player_count - 1) * 0.2))
	health = max_health
		
	# Slime Aura Particles
	var aura = CPUParticles2D.new()
	aura.amount = 8 + (size_level * 6)
	aura.lifetime = 0.8
	aura.spread = 180.0
	aura.gravity = Vector2.ZERO
	aura.initial_velocity_min = 15.0
	aura.initial_velocity_max = 35.0
	aura.color = Color(0.2, 0.9, 0.3, 0.5)
	aura.scale_amount_min = 2.0
	aura.scale_amount_max = 3.0 + size_level
	add_child(aura)

func _physics_process(delta: float) -> void:
	if _attack_timer > 0.0:
		_attack_timer -= delta
		
	_jump_timer -= delta
	if _jump_timer <= 0.0:
		_jump_timer = randf_range(1.0, 2.0)
		var target = _find_nearest_player()
		if target:
			# Jump towards player
			var dir = (target.global_position - global_position).normalized()
			velocity = dir * speed * 2.0
			
	# Apply friction
	velocity = velocity.move_toward(Vector2.ZERO, 300.0 * delta)
	move_and_slide()

	# Pulsing visual effect
	var scale_pulse = 1.0 + sin(Time.get_ticks_msec() / 150.0) * 0.1
	scale = Vector2(scale_pulse, scale_pulse)

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
	dmg_num.global_position = global_position + Vector2(0, -20)
	get_parent().add_child(dmg_num)

	modulate = Color(2, 2, 2, 1)
	var timer = get_tree().create_timer(0.08)
	timer.timeout.connect(func(): modulate = Color(1, 1, 1, 1))

	_shake_all_cameras(3.0, 0.1)

	if size_level == 2 and health <= max_health * 0.5:
		_split_and_destroy()
		return

	if health <= 0:
		_die()

func _split_and_destroy() -> void:
	if is_exploded:
		return
	is_exploded = true
	
	_shake_all_cameras(12.0, 0.6)
	_spawn_death_effect()
	
	# Play explosion sound
	var am = get_node_or_null("/root/AudioManager")
	if am and am.has_method("play_explosion"):
		am.play_explosion()
	
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		for i in range(2):
			var split_id = randi()
			var offset = Vector2(randf_range(-40, 40), randf_range(-40, 40))
			if multiplayer.has_multiplayer_peer():
				rpc("rpc_spawn_split", split_id, global_position + offset, 1)
			else:
				rpc_spawn_split(split_id, global_position + offset, 1)
	queue_free()

func _die() -> void:
	var sm = get_node_or_null("/root/ScoreManager")
	if sm:
		sm.add_points(50 if size_level == 2 else 20)
	
	_shake_all_cameras(10.0, 0.5)
	_spawn_death_effect()
	
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		if size_level > 0:
			for i in range(2):
				var split_id = randi()
				var offset = Vector2(randf_range(-30, 30), randf_range(-30, 30))
				if multiplayer.has_multiplayer_peer():
					rpc("rpc_spawn_split", split_id, global_position + offset, size_level - 1)
				else:
					rpc_spawn_split(split_id, global_position + offset, size_level - 1)
		
		# Only spawn portal if we are the very last slime boss dying
		# Wait a frame to ensure others are counted or check array size
		var all_bosses = get_tree().get_nodes_in_group("boss")
		if all_bosses.size() <= 1 and size_level == 0:
			_spawn_portal()
		
	queue_free()

@rpc("authority", "call_local", "reliable")
func rpc_spawn_split(slime_id: int, spawn_pos: Vector2, new_size: int) -> void:
	var slime = load("res://scripts/SlimeBoss.gd").new()
	slime.name = "SlimeBoss_%d" % slime_id
	slime.global_position = spawn_pos
	slime.size_level = new_size
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(slime)

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
	particles.amount = 20
	particles.lifetime = 0.6
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 40.0
	particles.initial_velocity_max = 100.0
	particles.color = Color(0.2, 0.9, 0.3)
	
	get_parent().add_child(particles)
	var timer = get_tree().create_timer(0.8)
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
			_attack_timer = 1.0
