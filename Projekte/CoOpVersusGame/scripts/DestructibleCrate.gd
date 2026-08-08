extends StaticBody2D

# DestructibleCrate – Godot 4.x
# A blocking obstacles that can be shot and destroyed. Drops power-ups on break.

@export var max_health: int = 30
var health: int = max_health

var powerup_script = preload("res://scripts/PowerUp.gd")

func _ready() -> void:
	add_to_group("crates")
	
	# Visual representator (wooden crate)
	var rect = ColorRect.new()
	rect.size = Vector2(40, 40)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.45, 0.29, 0.12) # Brown
	add_child(rect)
	
	# Details (crossboard pattern)
	var detail = ColorRect.new()
	detail.size = Vector2(34, 4)
	detail.position = Vector2(-17, -2)
	detail.color = Color(0.35, 0.22, 0.08)
	add_child(detail)
	
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	add_child(collision)

func take_damage(amount: int) -> void:
	health -= amount
	health = max(health, 0)
	
	# Flash visual feedback
	modulate = Color(2.0, 2.0, 2.0)
	var timer = get_tree().create_timer(0.08)
	timer.timeout.connect(func(): modulate = Color(1.0, 1.0, 1.0))
	
	if health <= 0:
		_break_crate()

func _break_crate() -> void:
	# Spawn breaking wood debris
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 16
	particles.lifetime = 0.5
	particles.spread = 180.0
	particles.gravity = Vector2(0, 200.0)
	particles.initial_velocity_min = 50.0
	particles.initial_velocity_max = 100.0
	particles.color = Color(0.45, 0.29, 0.12)
	
	get_parent().add_child(particles)
	var t = get_tree().create_timer(0.6)
	t.timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())
	
	# Only spawn drop on server / singleplayer
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		if randf() < 0.60: # 60% chance to drop item
			_spawn_drop()
			
	queue_free()

func _spawn_drop() -> void:
	var type_index = randi() % 4
	var item_id = randi()
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_spawn_powerup", item_id, global_position, type_index)
	else:
		rpc_spawn_powerup(item_id, global_position, type_index)

@rpc("any_peer", "call_local", "reliable")
func rpc_spawn_powerup(item_id: int, spawn_pos: Vector2, type_index: int) -> void:
	var item = Area2D.new()
	item.set_script(powerup_script)
	item.name = "PowerUp_Crate_%d" % item_id
	item.global_position = spawn_pos
	item.type = type_index
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(item)
