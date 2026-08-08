extends Area2D

# PressurePlate – Godot 4.x
# Co-Op pressure plate that triggers when a player stands on it.

var is_pressed: bool = false
var door: Node2D = null

func _ready() -> void:
	monitoring = true
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	
	# Visual representation: Gray ColorRect
	var rect = ColorRect.new()
	rect.size = Vector2(32, 32)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.4, 0.4, 0.4) # Dark Gray
	rect.name = "VisualRect"
	add_child(rect)
	
	# CollisionShape2D
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	add_child(collision)

func _on_body_entered(body: Node2D) -> void:
	var is_valid = body.is_in_group("players") or body.name == "Player" or body.name.is_valid_int() or body.is_in_group("push_blocks") or body.is_in_group("turrets")
	if is_valid:
		is_pressed = true
		$VisualRect.color = Color(0.2, 0.8, 1.0) # Cyan
		if is_instance_valid(door) and door.has_method("check_plates"):
			door.check_plates()

func _on_body_exited(body: Node2D) -> void:
	var is_valid = body.is_in_group("players") or body.name == "Player" or body.name.is_valid_int() or body.is_in_group("push_blocks") or body.is_in_group("turrets")
	if is_valid:
		var count = 0
		for b in get_overlapping_bodies():
			if b.is_in_group("players") or b.name == "Player" or b.name.is_valid_int() or b.is_in_group("push_blocks") or b.is_in_group("turrets"):
				count += 1
		
		if count == 0:
			is_pressed = false
			$VisualRect.color = Color(0.4, 0.4, 0.4) # Gray
			if is_instance_valid(door) and door.has_method("check_plates"):
				door.check_plates()
