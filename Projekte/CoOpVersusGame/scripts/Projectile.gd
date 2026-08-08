extends Area2D

# Projectile – Godot 4.x
# Moves in a set direction, supports multiple classes/behaviors, and damages enemies.

enum Type { NORMAL, SHOTGUN, EXPLOSIVE, PIERCING, MAGIC_HOMING, POISON }

@export var projectile_type: Type = Type.NORMAL
@export var speed: float = 600.0
@export var damage: int = 25
@export var lifetime: float = 2.0

var direction: Vector2 = Vector2.RIGHT
var shooter_id: int = 1
var pierce_count: int = 0
var poison_pool_script = preload("res://scripts/PoisonPool.gd")

func _ready() -> void:
	monitoring = true
	body_entered.connect(_on_body_entered)
	
	# Programmatic visual and shape setup based on type
	var color_rect = ColorRect.new()
	add_child(color_rect)
	
	match projectile_type:
		Type.NORMAL:
			damage = 25
			speed = 600.0
			color_rect.size = Vector2(10, 4)
			color_rect.color = Color(1.0, 0.9, 0.2)
		Type.SHOTGUN:
			damage = 18
			speed = 700.0
			lifetime = 0.45
			color_rect.size = Vector2(8, 4)
			color_rect.color = Color(1.0, 0.5, 0.2)
		Type.EXPLOSIVE:
			damage = 35
			speed = 400.0
			lifetime = 1.8
			color_rect.size = Vector2(12, 12)
			color_rect.color = Color(1.0, 0.2, 0.2)
		Type.PIERCING:
			damage = 20
			speed = 850.0
			lifetime = 1.2
			color_rect.size = Vector2(16, 2)
			color_rect.color = Color(0.2, 0.8, 1.0)
		Type.MAGIC_HOMING:
			damage = 28
			speed = 350.0
			lifetime = 2.5
			color_rect.size = Vector2(10, 10)
			color_rect.color = Color(0.9, 0.3, 0.9)
		Type.POISON:
			damage = 15
			speed = 650.0
			lifetime = 1.5
			color_rect.size = Vector2(6, 4)
			color_rect.color = Color(0.2, 0.9, 0.3)

	color_rect.position = -color_rect.size / 2.0

	# Ensure it has a CollisionShape2D (critical fix!)
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = color_rect.size
	collision.shape = shape
	add_child(collision)

	# Set lifetime
	var timer = get_tree().create_timer(lifetime)
	timer.timeout.connect(queue_free)

func _physics_process(delta: float) -> void:
	if projectile_type == Type.MAGIC_HOMING:
		var target = _find_nearest_enemy()
		if target:
			var target_dir = (target.global_position - global_position).normalized()
			direction = direction.lerp(target_dir, 4.0 * delta).normalized()
			
	position += direction * speed * delta

func _find_nearest_enemy() -> Node2D:
	var enemies = get_tree().get_nodes_in_group("enemies")
	var nearest: Node2D = null
	var min_dist = 250.0
	for e in enemies:
		var dist = global_position.distance_to(e.global_position)
		if dist < min_dist:
			min_dist = dist
			nearest = e
	return nearest

func _on_body_entered(body: Node2D) -> void:
	# Don't hit the player who shot it
	if body.name == str(shooter_id) or (shooter_id == 1 and body.name == "Player"):
		return
	
	# Don't hit other players (unless in versus mode)
	if body.is_in_group("players") or body.name.is_valid_int():
		var gm = get_tree().get_first_node_in_group("game_manager")
		if gm and gm.current_mode == 1:
			if body.has_method("take_damage"):
				body.take_damage(damage)
				_on_impact(body)
			return
		return

	if body.has_method("take_damage") or body.is_in_group("enemies"):
		if body.has_method("take_damage"):
			body.take_damage(damage)
		_on_impact(body)
	elif body.name != "Player":
		# Hit wall
		_on_impact(null)

func _on_impact(hit_body: Node2D) -> void:
	_spawn_impact_effect()
	
	# Relic Perks triggers
	var shooter = _get_shooter_player()
	var relic_mgr = get_node_or_null("/root/RelicManager")
	if shooter and relic_mgr:
		if relic_mgr.has_perk(shooter, "vampirism"):
			shooter.health = min(shooter.health + 3, shooter.max_health)
			shooter.emit_signal("health_changed", shooter.health, shooter.max_health)
		if relic_mgr.has_perk(shooter, "chain_lightning") and hit_body:
			_trigger_chain_lightning(hit_body)
		if relic_mgr.has_perk(shooter, "explosive_rounds") and randf() < 0.25:
			_explode()

	if projectile_type == Type.EXPLOSIVE:
		_explode()
		queue_free()
	elif projectile_type == Type.POISON:
		_spawn_poison_puddle()
		queue_free()
	elif projectile_type == Type.PIERCING:
		pierce_count += 1
		if pierce_count >= 3:
			queue_free()
	else:
		queue_free()

func _get_shooter_player() -> Node:
	var players = get_tree().get_nodes_in_group("players")
	for p in players:
		if p.name == str(shooter_id) or (shooter_id == 1 and p.name == "Player"):
			return p
	return null

func _trigger_chain_lightning(initial_target: Node2D) -> void:
	var enemies = get_tree().get_nodes_in_group("enemies")
	var count = 0
	for enemy in enemies:
		if enemy != initial_target and enemy.global_position.distance_to(initial_target.global_position) <= 160.0:
			if enemy.has_method("take_damage"):
				enemy.take_damage(12)
				_draw_lightning_line(initial_target.global_position, enemy.global_position)
				count += 1
				if count >= 2:
					break

func _draw_lightning_line(start_pos: Vector2, end_pos: Vector2) -> void:
	var line = Line2D.new()
	line.width = 3.0
	line.default_color = Color(0.2, 0.8, 1.0)
	line.add_point(start_pos)
	line.add_point(start_pos.lerp(end_pos, 0.5) + Vector2(randf_range(-10, 10), randf_range(-10, 10)))
	line.add_point(end_pos)
	get_parent().add_child(line)
	get_tree().create_timer(0.15).timeout.connect(func(): if is_instance_valid(line): line.queue_free())

func _explode() -> void:
	var enemies = get_tree().get_nodes_in_group("enemies")
	for enemy in enemies:
		if enemy.global_position.distance_to(global_position) <= 100.0:
			if enemy.has_method("take_damage"):
				enemy.take_damage(20) # AoE bonus damage

	# Explosion particles
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 24
	particles.lifetime = 0.5
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 80.0
	particles.initial_velocity_max = 160.0
	particles.color = Color(1.0, 0.4, 0.1)
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(particles)
		get_tree().create_timer(0.6).timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())

func _spawn_poison_puddle() -> void:
	if poison_pool_script:
		var pool = Area2D.new()
		pool.set_script(poison_pool_script)
		pool.global_position = global_position
		get_parent().add_child(pool)

func _spawn_impact_effect() -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 8
	particles.lifetime = 0.35
	particles.spread = 180.0
	particles.gravity = Vector2(0, 150.0)
	particles.initial_velocity_min = 50.0
	particles.initial_velocity_max = 100.0
	
	match projectile_type:
		Type.MAGIC_HOMING: particles.color = Color(0.9, 0.3, 0.9)
		Type.POISON: particles.color = Color(0.2, 0.9, 0.3)
		Type.PIERCING: particles.color = Color(0.2, 0.8, 1.0)
		_: particles.color = Color(1.0, 0.8, 0.2)

	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(particles)
		var timer = get_tree().create_timer(0.4)
		timer.timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())
