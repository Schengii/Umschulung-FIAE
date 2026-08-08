extends Area2D

# EnemyProjectile – Godot 4.x
# Moves in a set direction and damages players.

@export var speed: float = 400.0
@export var damage: int = 10
@export var lifetime: float = 3.0

var direction: Vector2 = Vector2.RIGHT

func _ready() -> void:
	monitoring = true
	body_entered.connect(_on_body_entered)
	
	# Set lifetime
	var timer = get_tree().create_timer(lifetime)
	timer.timeout.connect(queue_free)

	# Visual representation: purple circle/square
	var color_rect = ColorRect.new()
	color_rect.size = Vector2(8, 8)
	color_rect.position = -color_rect.size / 2.0
	color_rect.color = Color(0.8, 0.2, 0.9) # Purple
	add_child(color_rect)

	# CollisionShape2D (required for body_entered to fire)
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = color_rect.size
	collision.shape = shape
	add_child(collision)

func _physics_process(delta: float) -> void:
	position += direction * speed * delta

func _on_body_entered(body: Node2D) -> void:
	# Avoid hitting other enemies
	if body.is_in_group("enemies") or body.name.begins_with("Enemy_"):
		return
	
	var is_player = body.is_in_group("players") or body.name == "Player" or body.name.is_valid_int()
	if is_player:
		if body.has_method("take_damage"):
			body.take_damage(damage)
		_spawn_impact_effect()
		queue_free()
	elif body.name != "Player" and not body.is_in_group("enemies"):
		# Hit wall/obstacles
		_spawn_impact_effect()
		queue_free()

func _spawn_impact_effect() -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 8
	particles.lifetime = 0.3
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 40.0
	particles.initial_velocity_max = 80.0
	particles.color = Color(0.8, 0.2, 0.9)
	
	get_parent().add_child(particles)
	var timer = get_tree().create_timer(0.4)
	timer.timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())
