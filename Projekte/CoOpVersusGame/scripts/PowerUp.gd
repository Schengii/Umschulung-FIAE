extends Area2D

# PowerUp – Godot 4.x
# Pickable item dropped by enemies.

enum Type { HEALTH, SPEED_BOOST, SPREAD_SHOT, SHIELD_BOOSTER }

@export var type: Type = Type.HEALTH
@export var lifetime: float = 15.0

func _ready() -> void:
	monitoring = true
	body_entered.connect(_on_body_entered)
	
	# Despawn timer
	var timer = get_tree().create_timer(lifetime)
	timer.timeout.connect(queue_free)
	
	# Visual representation: ColorRect
	var rect = ColorRect.new()
	rect.size = Vector2(16, 16)
	rect.position = -rect.size / 2.0
	
	match type:
		Type.HEALTH:
			rect.color = Color(0.2, 0.9, 0.3) # Green
		Type.SPEED_BOOST:
			rect.color = Color(1.0, 0.6, 0.1) # Orange
		Type.SPREAD_SHOT:
			rect.color = Color(0.7, 0.2, 0.9) # Purple
		Type.SHIELD_BOOSTER:
			rect.color = Color(0.1, 0.7, 1.0) # Cyan
			
	add_child(rect)

func _on_body_entered(body: Node2D) -> void:
	var is_player = body.is_in_group("players") or body.name == "Player" or body.name.is_valid_int()
	if is_player:
		# Apply effects based on type
		if body.has_method("apply_powerup"):
			body.apply_powerup(type)
		_spawn_pickup_effect()
		
		# Server or client destroys the item
		if multiplayer.has_multiplayer_peer() and multiplayer.is_server():
			rpc("rpc_remove_powerup")
		else:
			queue_free()

@rpc("any_peer", "call_local", "reliable")
func rpc_remove_powerup() -> void:
	queue_free()

func _spawn_pickup_effect() -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 12
	particles.lifetime = 0.4
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 50.0
	particles.initial_velocity_max = 100.0
	
	match type:
		Type.HEALTH: particles.color = Color(0.2, 0.9, 0.3)
		Type.SPEED_BOOST: particles.color = Color(1.0, 0.6, 0.1)
		Type.SPREAD_SHOT: particles.color = Color(0.7, 0.2, 0.9)
		Type.SHIELD_BOOSTER: particles.color = Color(0.1, 0.7, 1.0)
		
	get_parent().add_child(particles)
	var timer = get_tree().create_timer(0.5)
	timer.timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())
