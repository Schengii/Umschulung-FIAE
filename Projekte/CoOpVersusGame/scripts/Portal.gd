extends Area2D

# Portal – Godot 4.x
# Spawns upon Boss death, loads next level when entered.

func _ready() -> void:
	add_to_group("portals")
	monitoring = true
	body_entered.connect(_on_body_entered)
	
	# Visuals: swirly cyan square
	var rect = ColorRect.new()
	rect.size = Vector2(40, 40)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.1, 0.9, 0.8) # Cyan
	rect.name = "VisualRect"
	add_child(rect)
	
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	add_child(collision)
	
	# Small rotating visual effect
	var rotation_timer = Timer.new()
	rotation_timer.wait_time = 0.02
	rotation_timer.autostart = true
	rotation_timer.timeout.connect(func():
		rect.rotation += 0.05
	)
	add_child(rotation_timer)

	# Play victory sound on spawn
	var am = get_node_or_null("/root/AudioManager")
	if am:
		am.play_victory()

func _on_body_entered(body: Node2D) -> void:
	var is_player = body.is_in_group("players") or body.name == "Player" or body.name.is_valid_int()
	if is_player:
		#print("[Portal] Player entered portal! Loading next level.")
		# Only server triggers loading next level
		if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
			var lm = get_node_or_null("/root/LevelManager")
			if lm and lm.has_method("load_next_level"):
				lm.load_next_level()
			else:
				#print("[Portal] LevelManager not found or has no load_next_level.")
				get_tree().reload_current_scene()
