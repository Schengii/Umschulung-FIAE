extends CharacterBody2D

# Enemy – Godot 4.x
# Supports BASIC (chase), CHARGER (fast/weak/high contact damage), and RANGED (kite/shoot).

enum Type { BASIC, CHARGER, RANGED, GHOST, POISON_SLIME, DEFENDER, NECROMANCER }

@export var type: Type = Type.BASIC
@export var speed: float = 120.0
@export var max_health: int = 50
@export var damage_amount: int = 15
@export var attack_cooldown: float = 1.0

# Ranged shooting & summoning attributes
@export var shoot_cooldown: float = 1.5
var _shoot_timer: float = 0.0
var _summon_timer: float = 4.0
var enemy_projectile_script = preload("res://scripts/EnemyProjectile.gd")
var poison_pool_script = preload("res://scripts/PoisonPool.gd")

var health: int = max_health
var _attack_timer: float = 0.0
var _poison_timer: float = 1.5
var _nav_agent: NavigationAgent2D = null

func _ready() -> void:
	add_to_group("enemies")
	
	# Determine stats/visuals based on type
	var size_dim = Vector2(24, 24)
	var base_color = Color(0.9, 0.2, 0.2)
	
	match type:
		Type.BASIC:
			speed = 120.0
			max_health = 50
			damage_amount = 15
			size_dim = Vector2(24, 24)
			base_color = Color(0.9, 0.2, 0.2) # Red
		Type.CHARGER:
			speed = 200.0
			max_health = 25
			damage_amount = 25
			size_dim = Vector2(18, 18) # Smaller
			base_color = Color(0.9, 0.5, 0.1) # Orange-Red
		Type.RANGED:
			speed = 80.0
			max_health = 40
			damage_amount = 10
			size_dim = Vector2(22, 22)
			base_color = Color(0.8, 0.2, 0.9) # Purple
		Type.GHOST:
			speed = 80.0
			max_health = 30
			damage_amount = 12
			size_dim = Vector2(20, 20)
			base_color = Color(0.6, 0.8, 0.9, 0.6) # semi-transparent light blue
			collision_mask = 0 # No wall collisions!
		Type.POISON_SLIME:
			speed = 100.0
			max_health = 60
			damage_amount = 10
			size_dim = Vector2(26, 26)
			base_color = Color(0.2, 0.8, 0.3) # Green slime
		Type.DEFENDER:
			speed = 70.0
			max_health = 120
			damage_amount = 20
			size_dim = Vector2(30, 30)
			base_color = Color(0.3, 0.5, 0.8) # Steel Blue Shielded
		Type.NECROMANCER:
			speed = 75.0
			max_health = 70
			damage_amount = 8
			size_dim = Vector2(24, 24)
			base_color = Color(0.4, 0.1, 0.5) # Dark Purple Summoner

	# Scale stats with level index
	var level_idx = 0
	var lm = get_node_or_null("/root/LevelManager")
	if lm:
		level_idx = lm.current_index
	var scale_factor = 1.0 + level_idx * 0.2
	max_health = int(max_health * scale_factor)
	damage_amount = int(damage_amount * scale_factor)
	health = max_health
	
	# Generate procedural texture for Enemy
	var sprite = Sprite2D.new()
	sprite.name = "BodyVisual"
	sprite.texture = _generate_enemy_texture(type, size_dim, base_color)
	add_child(sprite)
	
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = size_dim
	collision.shape = shape
	add_child(collision)
	
	# Area2D to detect players for contact damage
	var area = Area2D.new()
	var area_collision = CollisionShape2D.new()
	var area_shape = RectangleShape2D.new()
	area_shape.size = size_dim + Vector2(4, 4)
	area_collision.shape = area_shape
	area.add_child(area_collision)
	add_child(area)
	area.body_entered.connect(_on_player_entered)
	
	if type != Type.GHOST:
		_nav_agent = NavigationAgent2D.new()
		_nav_agent.avoidance_enabled = false
		_nav_agent.target_desired_distance = 15.0
		add_child(_nav_agent)

# Scale stats based on wave number and player count (#7, #8)
func scale_for_wave(wave_number: int, player_count: int) -> void:
	var wave_scale = 1.0 + (wave_number - 1) * 0.12
	var player_scale = 1.0 + (player_count - 1) * 0.15
	max_health = int(max_health * wave_scale * player_scale)
	damage_amount = int(damage_amount * (1.0 + (wave_number - 1) * 0.08))
	health = max_health

func _physics_process(delta: float) -> void:
	if _attack_timer > 0.0:
		_attack_timer -= delta
	if _shoot_timer > 0.0:
		_shoot_timer -= delta
		
	if type == Type.POISON_SLIME:
		_poison_timer -= delta
		if _poison_timer <= 0.0:
			_poison_timer = 2.5
			_spawn_poison_pool()
	elif type == Type.NECROMANCER:
		_summon_timer -= delta
		if _summon_timer <= 0.0:
			_summon_timer = 4.5
			_summon_minion()

	# Find nearest player
	var target = _find_nearest_player()
	if target:
		var dist = global_position.distance_to(target.global_position)
		var dir = (target.global_position - global_position).normalized()
		
		if _nav_agent and type != Type.GHOST:
			_nav_agent.target_position = target.global_position
			if not _nav_agent.is_navigation_finished():
				dir = (_nav_agent.get_next_path_position() - global_position).normalized()
		
		if type == Type.RANGED or type == Type.NECROMANCER:
			# Kiting behavior for Ranged & Necromancer
			if dist > 250.0:
				velocity = dir * speed
				move_and_slide()
			elif dist < 180.0:
				var away_dir = (global_position - target.global_position).normalized()
				velocity = away_dir * speed
				move_and_slide()
			else:
				velocity = Vector2.ZERO
				
			# Ranged shooting logic
			if type == Type.RANGED and _shoot_timer <= 0.0:
				_shoot_timer = shoot_cooldown
				_shoot_at(target.global_position)
		else:
			# Normal/Charger/Defender chase behavior
			velocity = dir * speed
			move_and_slide()
				_shoot_timer = shoot_cooldown
				_shoot_at(target.global_position)
		else:
			# Normal/Charger chase behavior
			velocity = dir * speed
			move_and_slide()

func _shoot_at(target_pos: Vector2) -> void:
	var shoot_dir = (target_pos - global_position).normalized()
	# Spawns dynamically on server
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		var proj_id = randi()
		if multiplayer.has_multiplayer_peer():
			rpc("rpc_enemy_shoot", proj_id, global_position + shoot_dir * 18.0, shoot_dir)
		else:
			rpc_enemy_shoot(proj_id, global_position + shoot_dir * 18.0, shoot_dir)

@rpc("authority", "call_local", "reliable")
func rpc_enemy_shoot(proj_id: int, spawn_pos: Vector2, dir: Vector2) -> void:
	var proj = Area2D.new()
	proj.set_script(enemy_projectile_script)
	proj.name = "EnemyProj_%d" % proj_id
	proj.global_position = spawn_pos
	proj.direction = dir
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(proj)

func _find_nearest_player() -> Node2D:
	var players = get_tree().get_nodes_in_group("players")
	if players.is_empty():
		return null

	var nearest_player: Node2D = null
	var min_dist = INF
	for player in players:
		if player.has_method("is_dead") and player.is_dead:
			continue
		var dist = global_position.distance_to(player.global_position)
		if dist < min_dist:
			min_dist = dist
			nearest_player = player
	return nearest_player

func _summon_minion() -> void:
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		var minion_script = load("res://scripts/Enemy.gd")
		var minion = CharacterBody2D.new()
		minion.set_script(minion_script)
		minion.type = Type.BASIC
		minion.global_position = global_position + Vector2(randf_range(-30, 30), randf_range(-30, 30))
		var parent_node = get_parent()
		if parent_node:
			parent_node.add_child(minion)

func take_damage(amount: int, attacker_pos: Vector2 = Vector2.ZERO) -> void:
	var final_damage = amount
	if type == Type.DEFENDER and attacker_pos != Vector2.ZERO:
		var hit_dir = (attacker_pos - global_position).normalized()
		var facing_dir = velocity.normalized() if velocity.length() > 5.0 else Vector2.RIGHT
		if hit_dir.dot(facing_dir) > 0.3:
			final_damage = int(amount * 0.2) # 80% damage reduction from front!
			
	health -= final_damage
	health = max(health, 0)
	
	# Trigger EventBus signal
	var eb = get_node_or_null("/root/EventBus")
	if eb:
		eb.emit_signal("hit_flash_triggered", self)
	
	# Spawn floating damage number
	var dmg_num_script = preload("res://scripts/DamageNumber.gd")
	var dmg_num = Label.new()
	dmg_num.set_script(dmg_num_script)
	dmg_num.text = str(final_damage)
	dmg_num.global_position = global_position + Vector2(0, -16)
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(dmg_num)
	
	# Flash visually (white hit flash)
	modulate = Color(3, 3, 3, 1)
	var timer = get_tree().create_timer(0.08)
	timer.timeout.connect(func(): modulate = Color(1, 1, 1, 1))

	if health <= 0:
		_die()

var powerup_script = preload("res://scripts/PowerUp.gd")

func _die() -> void:
	var sm = get_node_or_null("/root/ScoreManager")
	if sm:
		sm.add_points(10)
	
	if not multiplayer.has_multiplayer_peer() or multiplayer.is_server():
		if randf() < 0.35: # 35% drop chance
			_spawn_drop()

	_spawn_death_effect()
	queue_free()

func _spawn_drop() -> void:
	var type_index = randi() % 4
	var item_id = randi()
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_spawn_powerup", item_id, global_position, type_index)
	else:
		rpc_spawn_powerup(item_id, global_position, type_index)

@rpc("authority", "call_local", "reliable")
func rpc_spawn_powerup(item_id: int, spawn_pos: Vector2, type_index: int) -> void:
	var item = Area2D.new()
	item.set_script(powerup_script)
	item.name = "PowerUp_%d" % item_id
	item.global_position = spawn_pos
	item.type = type_index
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(item)

func _spawn_death_effect() -> void:
	var particles = CPUParticles2D.new()
	particles.global_position = global_position
	particles.emitting = true
	particles.one_shot = true
	particles.explosiveness = 1.0
	particles.amount = 16
	particles.lifetime = 0.5
	particles.spread = 180.0
	particles.gravity = Vector2.ZERO
	particles.initial_velocity_min = 60.0
	particles.initial_velocity_max = 120.0
	
	match type:
		Type.BASIC: particles.color = Color(0.9, 0.2, 0.2)
		Type.CHARGER: particles.color = Color(0.9, 0.5, 0.1)
		Type.RANGED: particles.color = Color(0.8, 0.2, 0.9)
		Type.GHOST: particles.color = Color(0.7, 0.9, 1.0, 0.4)
		Type.POISON_SLIME: particles.color = Color(0.2, 0.8, 0.3)
	
	get_parent().add_child(particles)
	var timer = get_tree().create_timer(0.6)
	timer.timeout.connect(func(): if is_instance_valid(particles): particles.queue_free())

func _on_player_entered(body: Node2D) -> void:
	var is_player = body.is_in_group("players") or body.name == "Player" or body.name.is_valid_int()
	if is_player:
		if body.has_method("take_damage") and _attack_timer <= 0.0:
			body.take_damage(damage_amount)
			_attack_timer = attack_cooldown

func _spawn_poison_pool() -> void:
	if multiplayer.has_multiplayer_peer() and not multiplayer.is_server():
		return
		
	var pool_id = randi()
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_spawn_poison", pool_id, global_position)
	else:
		rpc_spawn_poison(pool_id, global_position)

@rpc("authority", "call_local", "reliable")
func rpc_spawn_poison(pool_id: int, spawn_pos: Vector2) -> void:
	var pool = Area2D.new()
	pool.set_script(poison_pool_script)
	pool.name = "PoisonPool_%d" % pool_id
	pool.global_position = spawn_pos
	
	var parent_node = get_parent()
	if parent_node:
		parent_node.add_child(pool)

# Cache for generated enemy textures
var _enemy_texture_cache: Dictionary = {}

func _generate_enemy_texture(e_type: Type, size: Vector2, color: Color) -> Texture2D:
	if _enemy_texture_cache.has(e_type):
		return _enemy_texture_cache[e_type]
		
	var w = int(size.x)
	var h = int(size.y)
	var img = Image.create(w, h, false, Image.FORMAT_RGBA8)
	
	# Draw base enemy shape
	for y in range(h):
		for x in range(w):
			# Make it a roundish or jagged beast shape
			var is_filled = false
			if e_type == Type.GHOST:
				# Ghost: round head, wavy tail
				var radius = w / 2.0
				var dist_from_head = Vector2(x, y).distance_to(Vector2(w/2.0, h/3.0))
				if dist_from_head <= radius:
					is_filled = true
				elif y >= h/3.0 and abs(x - w/2.0) <= (w/2.0 * (1.0 - (y - h/3.0) / (h * 2.0/3.0))):
					# Wavy tail pattern
					if int(y + sin(x * 0.5) * 2.0) % 4 != 0:
						is_filled = true
			elif e_type == Type.POISON_SLIME:
				# Bubbly round slime
				var radius = w / 2.2
				if Vector2(x, y).distance_to(Vector2(w/2.0, h/2.0)) <= radius:
					is_filled = true
			else:
				# Standard boxy/shield monster shape
				var dx = abs(x - (w-1)/2.0)
				var limit = (w/2.0)
				if e_type == Type.CHARGER:
					# Charger is pointy at front (y=0 is top/front)
					limit = (w/2.0) * (y / float(h))
				if dx <= limit:
					is_filled = true
					
			if is_filled:
				var shadow = 0.8 + (y / float(h * 3.0))
				img.set_pixel(x, y, Color(color.r * shadow, color.g * shadow, color.b * shadow, color.a))
				
	# Detailing pass
	match e_type:
		Type.BASIC:
			# Glowing red eyes & dark mask
			for x in range(w/4, w * 3/4):
				img.set_pixel(x, h/3, Color(0.1, 0.1, 0.1, 1.0))
			img.set_pixel(w/3, h/3, Color(1.0, 1.0, 0.0, 1.0))
			img.set_pixel(w * 2/3, h/3, Color(1.0, 1.0, 0.0, 1.0))
		Type.CHARGER:
			# Pointy white horns on sides
			img.set_pixel(0, 0, Color(0.95, 0.95, 0.95, 1.0))
			img.set_pixel(w - 1, 0, Color(0.95, 0.95, 0.95, 1.0))
			# Fire red eyes
			img.set_pixel(w/2 - 2, h/2, Color(1.0, 0.1, 0.1, 1.0))
			img.set_pixel(w/2 + 2, h/2, Color(1.0, 0.1, 0.1, 1.0))
		Type.RANGED:
			# Spellcaster hood (dark mask, neon purple eyes)
			for y in range(h/4, h/2):
				for x in range(w/4, w * 3/4):
					img.set_pixel(x, y, Color(0.15, 0.1, 0.2, 1.0))
			img.set_pixel(w/3, h/3, Color(0.4, 1.0, 1.0, 1.0))
			img.set_pixel(w * 2/3, h/3, Color(0.4, 1.0, 1.0, 1.0))
		Type.GHOST:
			# Hollow eyes & mouth
			img.set_pixel(w/3, h/3, Color(0.0, 0.0, 0.0, 0.5))
			img.set_pixel(w * 2/3, h/3, Color(0.0, 0.0, 0.0, 0.5))
			img.set_pixel(w/2, h * 2/3, Color(0.0, 0.0, 0.0, 0.5))
		Type.POISON_SLIME:
			# Bubbly core highlights
			img.set_pixel(w/2 - 3, h/2 - 3, Color(0.5, 1.0, 0.6, 0.8))
			img.set_pixel(w/2 + 3, h/2 + 2, Color(0.1, 0.5, 0.2, 0.9))
			# Angry yellow eyes
			img.set_pixel(w/2 - 4, h/2, Color(0.9, 0.9, 0.1, 1.0))
			img.set_pixel(w/2 + 4, h/2, Color(0.9, 0.9, 0.1, 1.0))
			
	var tex = ImageTexture.create_from_image(img)
	_enemy_texture_cache[e_type] = tex
	return tex
