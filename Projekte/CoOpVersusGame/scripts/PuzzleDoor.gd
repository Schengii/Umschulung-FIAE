extends StaticBody2D

# PuzzleDoor – Godot 4.x
# Static door that blocks path and opens only when both plates are pressed.

var plate1: Node2D = null
var plate2: Node2D = null

var is_open: bool = false

func _ready() -> void:
	# Visual representation: Orange wall
	var rect = ColorRect.new()
	rect.size = Vector2(96, 20)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.9, 0.5, 0.1) # Orange
	rect.name = "VisualRect"
	add_child(rect)
	
	# CollisionShape2D
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	collision.name = "Collision"
	add_child(collision)

func check_plates() -> void:
	var should_be_open = false
	if is_instance_valid(plate1) and is_instance_valid(plate2):
		should_be_open = plate1.is_pressed and plate2.is_pressed
		
	if should_be_open != is_open:
		is_open = should_be_open
		if is_open:
			# Disable collision and make transparent
			$Collision.disabled = true
			$VisualRect.modulate.a = 0.25
			#print("[PuzzleDoor] Opened!")
			_shake_cameras(5.0, 0.2)
		else:
			# Enable collision and make solid
			$Collision.disabled = false
			$VisualRect.modulate.a = 1.0
			#print("[PuzzleDoor] Closed!")
			_shake_cameras(5.0, 0.2)

func _shake_cameras(intensity: float, duration: float) -> void:
	for cam in get_tree().get_nodes_in_group("cameras"):
		if cam.has_method("shake"):
			cam.shake(intensity, duration)
