extends StaticBody2D

# Turret - Godot 4.x
# Placed by Engineer class. Shoots at enemies automatically.

var _lifetime: float = 10.0
var _shoot_timer: float = 0.5
var enemy_projectile_script = preload("res://scripts/Projectile.gd")
var owner_id: int = 1

func _ready() -> void:
	add_to_group("turrets")
	# Visuals: Yellow Box
	var rect = ColorRect.new()
	rect.size = Vector2(24, 24)
	rect.position = -rect.size / 2.0
	rect.color = Color(1.0, 1.0, 0.4) # Yellow
	add_child(rect)
	
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	add_child(collision)

func _physics_process(delta: float) -> void:
	_lifetime -= delta
	if _lifetime <= 0.0:
		queue_free()
		return
		
	_shoot_timer -= delta
	if _shoot_timer <= 0.0:
		_shoot_timer = 0.5
		_shoot_at_nearest_enemy()

func _shoot_at_nearest_enemy() -> void:
	var enemies = get_tree().get_nodes_in_group("enemies")
	if enemies.is_empty():
		return
		
	var nearest_enemy: Node2D = null
	var min_dist = 400.0 # Max range
	for enemy in enemies:
		var dist = global_position.distance_to(enemy.global_position)
		if dist < min_dist:
			min_dist = dist
			nearest_enemy = enemy
			
	if nearest_enemy:
		var shoot_dir = (nearest_enemy.global_position - global_position).normalized()
		if multiplayer.has_multiplayer_peer():
			rpc("rpc_turret_shoot", global_position + shoot_dir * 16.0, shoot_dir)
		else:
			rpc_turret_shoot(global_position + shoot_dir * 16.0, shoot_dir)

@rpc("any_peer", "call_local", "reliable")
func rpc_turret_shoot(spawn_pos: Vector2, dir: Vector2) -> void:
	var proj = Area2D.new()
	proj.set_script(enemy_projectile_script)
	proj.global_position = spawn_pos
	proj.direction = dir
	proj.shooter_id = owner_id
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(proj)

	var am = get_node_or_null("/root/AudioManager")
	if am and am.has_method("play_shoot"):
		am.play_shoot()
