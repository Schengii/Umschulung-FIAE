extends CharacterBody2D

# CompanionBot - AI Assistant for Singleplayer Mode
# Follows the player, attacks enemies, steps on pressure plates, and revives downed players.

@export var speed: float = 180.0
@export var attack_range: float = 220.0
@export var shoot_cooldown: float = 0.8

var _shoot_timer: float = 0.0
var is_reviving_action_pressed: bool = false
var projectile_script = preload("res://scripts/Projectile.gd")
var target_player: Node2D = null

func _ready() -> void:
	add_to_group("players")
	add_to_group("companion_bots")
	
	# Visual representation (cyan robot drone)
	var sprite = Sprite2D.new()
	sprite.name = "BodyVisual"
	sprite.texture = _generate_bot_texture()
	add_child(sprite)
	
	var collision = CollisionShape2D.new()
	var shape = CircleShape2D.new()
	shape.radius = 10.0
	collision.shape = shape
	add_child(collision)
	
	var label = Label.new()
	label.text = "BOT (HELFER)"
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.position = Vector2(-40, -32)
	label.theme_override_font_sizes/font_size = 8
	label.modulate = Color(0.4, 0.9, 1.0)
	add_child(label)

func _generate_bot_texture() -> Texture2D:
	var img = Image.create(16, 16, false, Image.FORMAT_RGBA8)
	var col = Color(0.2, 0.8, 1.0)
	for y in range(16):
		for x in range(16):
			if Vector2(x - 7.5, y - 7.5).length() <= 7.0:
				img.set_pixel(x, y, col)
	# Eye
	img.set_pixel(7, 7, Color(1, 1, 1))
	img.set_pixel(8, 7, Color(1, 1, 1))
	return ImageTexture.create_from_image(img)

func _physics_process(delta: float) -> void:
	if _shoot_timer > 0.0:
		_shoot_timer -= delta

	if not target_player or not is_instance_valid(target_player):
		target_player = _find_local_player()
		if not target_player:
			return

	# Priority 1: Revive downed player if downed
	if "is_dead" in target_player and target_player.is_dead:
		var dist_to_player = global_position.distance_to(target_player.global_position)
		if dist_to_player > 20.0:
			velocity = (target_player.global_position - global_position).normalized() * speed
			move_and_slide()
			is_reviving_action_pressed = false
		else:
			velocity = Vector2.ZERO
			is_reviving_action_pressed = true
		return
	else:
		is_reviving_action_pressed = false

	# Priority 2: Follow player if far away
	var dist = global_position.distance_to(target_player.global_position)
	if dist > 90.0:
		var dir = (target_player.global_position - global_position).normalized()
		velocity = dir * speed
		move_and_slide()
	else:
		velocity = Vector2.ZERO

	# Priority 3: Attack nearest enemy
	if _shoot_timer <= 0.0:
		var enemy = _find_nearest_enemy()
		if enemy and global_position.distance_to(enemy.global_position) <= attack_range:
			_shoot_at(enemy.global_position)
			_shoot_timer = shoot_cooldown

func _find_local_player() -> Node2D:
	var players = get_tree().get_nodes_in_group("players")
	for p in players:
		if p != self and "is_local_player" in p and p.is_local_player:
			return p
	return null

func _find_nearest_enemy() -> Node2D:
	var enemies = get_tree().get_nodes_in_group("enemies")
	var nearest: Node2D = null
	var min_dist = INF
	for e in enemies:
		var d = global_position.distance_to(e.global_position)
		if d < min_dist:
			min_dist = d
			nearest = e
	return nearest

func _shoot_at(target_pos: Vector2) -> void:
	var shoot_dir = (target_pos - global_position).normalized()
	var proj = Area2D.new()
	proj.set_script(projectile_script)
	proj.global_position = global_position + shoot_dir * 16.0
	proj.direction = shoot_dir
	proj.shooter_id = 999 # Bot shooter ID
	get_parent().add_child(proj)
