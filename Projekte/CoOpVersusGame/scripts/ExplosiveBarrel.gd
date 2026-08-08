extends StaticBody2D

# ExplosiveBarrel – Godot 4.x
# A destructible obstacle that explodes on zero health, damaging nearby players and enemies.

@export var max_health: int = 15
var health: int = max_health
var is_exploded: bool = false

func _ready() -> void:
	add_to_group("barrels")
	add_to_group("crates") # So standard damage checks recognize it
	
	# Visuals: Red Barrel
	var rect = ColorRect.new()
	rect.size = Vector2(32, 36)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.85, 0.15, 0.15) # Red barrel
	add_child(rect)
	
	# Danger Stripe (Yellow)
	var stripe = ColorRect.new()
	stripe.size = Vector2(32, 6)
	stripe.position = Vector2(-16, -3)
	stripe.color = Color(0.9, 0.8, 0.1) # Yellow stripe
	add_child(stripe)
	
	# Collision Shape
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	add_child(collision)

func take_damage(amount: int) -> void:
	if is_exploded:
		return
	health -= amount
	health = max(health, 0)
	
	# Flash yellow warning on damage
	modulate = Color(3.0, 3.0, 1.0)
	var timer = get_tree().create_timer(0.08)
	timer.timeout.connect(func(): modulate = Color(1.0, 1.0, 1.0))
	
	if health <= 0:
		_explode()

func _explode() -> void:
	is_exploded = true
	
	# Shake nearby cameras
	for cam in get_tree().get_nodes_in_group("cameras"):
		if cam.has_method("shake"):
			cam.shake(18.0, 0.6)
			
	# AoE Damage
	var damage_radius = 140.0
	var damage_amount = 45
	
	# Damage Enemies
	var enemies = get_tree().get_nodes_in_group("enemies")
	for enemy in enemies:
		if enemy.global_position.distance_to(global_position) <= damage_radius:
			if enemy.has_method("take_damage"):
				enemy.take_damage(damage_amount)
				
	# Damage Players
	var players = get_tree().get_nodes_in_group("players")
	for player in players:
		if player.global_position.distance_to(global_position) <= damage_radius:
			if player.has_method("take_damage"):
				player.take_damage(damage_amount)

	# Sound trigger
	var am = get_node_or_null("/root/AudioManager")
	if am and am.has_method("play_explosion"):
		am.play_explosion()

	# Explosion visual effect (Particles)
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 32
	particles.lifetime = 0.6
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 100.0
	particles.initial_velocity_max = 200.0
	particles.scale_amount_min = 4.0
	particles.scale_amount_max = 8.0
	particles.color = Color(1.0, 0.35, 0.1) # Bright fire orange
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(particles)
		get_tree().create_timer(0.7).timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())

	queue_free()
