extends Area2D

# KingOfTheHill - Godot 4.x
# Grants points over time to players standing inside it.

var _tick_timer: float = 1.0
var score_manager: Node = null

func _ready() -> void:
	add_to_group("koth_zones")
	score_manager = get_node_or_null("/root/ScoreManager")
	
	# Visuals
	var rect = ColorRect.new()
	rect.size = Vector2(200, 200)
	rect.position = -rect.size / 2.0
	rect.color = Color(1, 0.8, 0, 0.3) # Transparent Gold
	add_child(rect)
	
	# Border
	var border = ReferenceRect.new()
	border.size = rect.size
	border.position = rect.position
	border.border_color = Color(1, 0.8, 0, 1.0)
	border.editor_only = false
	border.border_width = 4.0
	add_child(border)
	
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = rect.size
	collision.shape = shape
	add_child(collision)

func _process(delta: float) -> void:
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		_tick_timer -= delta
		if _tick_timer <= 0.0:
			_tick_timer = 1.0
			_grant_points()

func _grant_points() -> void:
	var players_inside = []
	for body in get_overlapping_bodies():
		if body.is_in_group("players") or body.name == "Player":
			players_inside.append(body)
			
	if players_inside.size() > 0:
		if score_manager:
			# Give everyone inside 10 points
			score_manager.add_points(10 * players_inside.size())
			
		# Visual flash
		if multiplayer.has_multiplayer_peer():
			rpc("rpc_flash_koth")
		else:
			rpc_flash_koth()

@rpc("any_peer", "call_local", "unreliable")
func rpc_flash_koth() -> void:
	modulate = Color(2, 2, 2, 1)
	var timer = get_tree().create_timer(0.1)
	timer.timeout.connect(func(): modulate = Color(1, 1, 1, 1))
