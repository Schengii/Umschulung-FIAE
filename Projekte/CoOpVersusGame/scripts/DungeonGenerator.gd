extends Node

# DungeonGenerator - Godot 4.x
# Generates a randomized dungeon layout using Cellular Automata / Random Walks.

signal dungeon_generated

var width: int = 24
var height: int = 18
var tile_size: int = 64
var map_data = []
var crate_script = preload("res://scripts/DestructibleCrate.gd")
var barrel_script = preload("res://scripts/ExplosiveBarrel.gd")
var spike_trap_script = preload("res://scripts/SpikeTrap.gd")
var _current_level_idx: int = 0


func _ready() -> void:
	if multiplayer.has_multiplayer_peer() and not multiplayer.is_server():
		return # Wait for sync
	call_deferred("_generate_and_sync", randi())


func _generate_and_sync(seed_val: int) -> void:
	var level_idx = 0
	var lm = get_node_or_null("/root/LevelManager")
	if lm:
		level_idx = lm.current_index
	
	var dynamic_width = 24 + level_idx * 4
	var dynamic_height = 18 + level_idx * 2
	
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_generate", seed_val, dynamic_width, dynamic_height, level_idx)
	else:
		rpc_generate(seed_val, dynamic_width, dynamic_height, level_idx)

@rpc("authority", "call_local", "reliable")
func rpc_generate(seed_val: int, new_width: int = 24, new_height: int = 18, level_idx: int = 0) -> void:
	seed(seed_val)
	width = new_width
	height = new_height
	_current_level_idx = level_idx
	
	# Initialize solid map
	map_data.clear()
	for y in range(height):
		var row = []
		for x in range(width):
			row.append(1) # 1 = wall, 0 = floor
		map_data.append(row)

		
	# Random walk to carve floors
	var carve_x = width / 2
	var carve_y = height / 2
	var max_steps = int((width * height) * 0.45) # Carve 45% of the map
	
	for i in range(max_steps):
		map_data[carve_y][carve_x] = 0
		var dir = randi() % 4
		match dir:
			0: carve_x = min(carve_x + 1, width - 2)
			1: carve_x = max(carve_x - 1, 1)
			2: carve_y = min(carve_y + 1, height - 2)
			3: carve_y = max(carve_y - 1, 1)
			
	# Guarantee center area is carved as floor for spawning safety
	for dy in range(-2, 3):
		for dx in range(-2, 3):
			map_data[height/2 + dy][width/2 + dx] = 0
			
	_build_physical_map()
	emit_signal("dungeon_generated")


func _create_programmatic_tileset() -> TileSet:
	var ts = TileSet.new()
	ts.tile_size = Vector2i(tile_size, tile_size)
	
	# Add physics layer (layer 0)
	ts.add_physics_layer(0)
	
	# Create programmatic image texture (128x64 atlas)
	var img = Image.create(128, 64, false, Image.FORMAT_RGBA8)
	
	enum Biome { STANDARD, ICE, LAVA, SWAMP }
	var current_biome = _current_level_idx % 4 as Biome
	
	match current_biome:
		Biome.STANDARD:
			wall_color = Color(0.2, 0.2, 0.2)
			wall_border = Color(0.15, 0.15, 0.15)
			floor_color = Color(0.08, 0.08, 0.12)
			floor_grid = Color(0.06, 0.06, 0.09)
		Biome.ICE: # Ice Glacier Theme
			wall_color = Color(0.15, 0.35, 0.45)
			wall_border = Color(0.1, 0.25, 0.35)
			floor_color = Color(0.1, 0.2, 0.3)
			floor_grid = Color(0.15, 0.3, 0.4)
		Biome.LAVA: # Volcanic Lava Theme
			wall_color = Color(0.35, 0.1, 0.05)
			wall_border = Color(0.25, 0.05, 0.02)
			floor_color = Color(0.15, 0.06, 0.06)
			floor_grid = Color(0.2, 0.08, 0.08)
		Biome.SWAMP: # Poison Swamp Theme
			wall_color = Color(0.12, 0.25, 0.12)
			wall_border = Color(0.08, 0.18, 0.08)
			floor_color = Color(0.06, 0.12, 0.06)
			floor_grid = Color(0.08, 0.16, 0.08)
			
	for y in range(64):
		for x in range(64):
			# Wall tile (0, 0): Brick pattern
			if x < 2 or x > 61 or y < 2 or y > 61:
				img.set_pixel(x, y, wall_border)
			else:
				# Brick layout: 3 rows of bricks (each ~20px high)
				var brick_row = y / 20
				var offset = 15 if brick_row % 2 == 0 else 0
				var brick_x = (x + offset) % 30
				
				# Draw brick mortar lines
				if y % 20 == 0 or y % 20 == 19 or brick_x == 0 or brick_x == 29:
					img.set_pixel(x, y, wall_border)
				else:
					# Add a subtle bevel/gradient effect to the brick
					var highlight = 0.05 if (y % 20 < 4 or brick_x < 4) else (-0.05 if (y % 20 > 15 or brick_x > 25) else 0.0)
					var c = Color(
						clamp(wall_color.r + highlight, 0.0, 1.0),
						clamp(wall_color.g + highlight, 0.0, 1.0),
						clamp(wall_color.b + highlight, 0.0, 1.0)
					)
					img.set_pixel(x, y, c)
					
	# Floor tile (1, 0) / x from 64 to 127: Stone slabs & cracks
	for y in range(64):
		for x in range(64):
			var fx = 64 + x
			# Draw borders for stone slabs (4 large 32x32 slabs)
			if x == 0 or x == 32 or y == 0 or y == 32 or x == 63 or y == 63:
				img.set_pixel(fx, y, floor_grid)
			else:
				# Add subtle noise and cracks
				var noise = (randi() % 10 - 5) * 0.003
				var slab_color = Color(
					clamp(floor_color.r + noise, 0.0, 1.0),
					clamp(floor_color.g + noise, 0.0, 1.0),
					clamp(floor_color.b + noise, 0.0, 1.0)
				)
				
				# Generate rare procedural cracks on floor tiles using basic math
				var is_crack = false
				# Crack 1: diagonal in top-left slab
				if x < 32 and y < 32 and abs(x - y) < 2 and (x > 10 and x < 22):
					is_crack = true
				# Crack 2: diagonal in bottom-right slab
				if x > 32 and y > 32 and abs((x - 32) - (63 - y)) < 2 and (x > 40 and x < 52):
					is_crack = true
					
				if is_crack:
					img.set_pixel(fx, y, floor_grid)
				else:
					img.set_pixel(fx, y, slab_color)

				
	var tex = ImageTexture.create_from_image(img)
	
	# Create atlas source
	var source = TileSetAtlasSource.new()
	source.texture = tex
	source.texture_region_size = Vector2i(tile_size, tile_size)
	source.create_tile(Vector2i(0, 0)) # Wall
	source.create_tile(Vector2i(1, 0)) # Floor
	
	# Add collision polygon to wall tile (0, 0)
	var tile_data = source.get_tile_data(Vector2i(0, 0), 0)
	var shape = PackedVector2Array([
		Vector2(-tile_size/2.0, -tile_size/2.0),
		Vector2(tile_size/2.0, -tile_size/2.0),
		Vector2(tile_size/2.0, tile_size/2.0),
		Vector2(-tile_size/2.0, tile_size/2.0)
	])
	tile_data.add_collision_polygon(0)
	tile_data.set_collision_polygon_points(0, 0, shape)
	
	# Add occlusion layer to TileSet and assign occluder to wall tile
	ts.add_occlusion_layer(0)
	var occluder_poly = OccluderPolygon2D.new()
	occluder_poly.polygon = shape
	tile_data.set_occluder(0, occluder_poly)
	
	# Add navigation layer to TileSet and assign navigation polygon to floor tile
	ts.add_navigation_layer(0)
	var floor_tile_data = source.get_tile_data(Vector2i(1, 0), 0)
	var nav_poly = NavigationPolygon.new()
	var nav_outline = PackedVector2Array([
		Vector2(-tile_size/2.0, -tile_size/2.0),
		Vector2(tile_size/2.0, -tile_size/2.0),
		Vector2(tile_size/2.0, tile_size/2.0),
		Vector2(-tile_size/2.0, tile_size/2.0)
	])
	nav_poly.add_outline(nav_outline)
	nav_poly.make_polygons_from_outlines()
	floor_tile_data.set_navigation_polygon(0, nav_poly)
	
	ts.add_source(source, 0)
	return ts

func _build_physical_map() -> void:
	var tilemap = TileMap.new()
	tilemap.name = "TileMap"
	tilemap.tile_set = _create_programmatic_tileset()
	add_child(tilemap)
	
	for y in range(height):
		for x in range(width):
			if map_data[y][x] == 1:
				tilemap.set_cell(0, Vector2i(x, y), 0, Vector2i(0, 0)) # Wall
			else:
				tilemap.set_cell(0, Vector2i(x, y), 0, Vector2i(1, 0)) # Floor
				var is_near_center = abs(x - width/2) <= 2 and abs(y - height/2) <= 2
				if randf() < 0.05:
					_spawn_torch(Vector2(x * tile_size, y * tile_size))
				elif not is_near_center:
					var spawn_chance = randf()
					if spawn_chance < 0.03:
						_spawn_crate(Vector2(x * tile_size, y * tile_size))
					elif spawn_chance < 0.048:
						_spawn_barrel(Vector2(x * tile_size, y * tile_size))
					elif spawn_chance < 0.073:
						_spawn_spike_trap(Vector2(x * tile_size, y * tile_size))


func _spawn_torch(pos: Vector2) -> void:
	var torch = Node2D.new()
	torch.global_position = pos + Vector2(tile_size/2.0, tile_size/2.0)
	
	var rect = ColorRect.new()
	rect.size = Vector2(6, 10)
	rect.position = -rect.size / 2.0
	rect.color = Color(0.5, 0.35, 0.2)
	torch.add_child(rect)
	
	var flame = ColorRect.new()
	flame.size = Vector2(4, 4)
	flame.position = Vector2(-2, -9)
	flame.color = Color(1.0, 0.5, 0.1)
	torch.add_child(flame)
	
	var light = PointLight2D.new()
	light.texture = _create_radial_light_texture(128)
	light.texture_scale = 1.3
	light.energy = 1.0
	light.color = Color(1.0, 0.6, 0.25)
	light.blend_mode = Light2D.BLEND_MODE_ADD
	torch.add_child(light)
	
	add_child(torch)

# Cache for generated light textures by radius (#32)
var _light_texture_cache: Dictionary = {}

func _create_radial_light_texture(radius: int) -> Texture2D:
	if _light_texture_cache.has(radius):
		return _light_texture_cache[radius]
	var img = Image.create(radius * 2, radius * 2, false, Image.FORMAT_RGBA8)
	var center = Vector2(radius, radius)
	for y in range(radius * 2):
		for x in range(radius * 2):
			var dist = Vector2(x, y).distance_to(center)
			if dist < radius:
				var factor = 1.0 - (dist / radius)
				factor = factor * factor
				img.set_pixel(x, y, Color(1, 1, 1, factor))
			else:
				img.set_pixel(x, y, Color(1, 1, 1, 0))
	var tex = ImageTexture.create_from_image(img)
	_light_texture_cache[radius] = tex
	return tex

func _spawn_crate(pos: Vector2) -> void:
	var crate = StaticBody2D.new()
	crate.set_script(crate_script)
	crate.global_position = pos + Vector2(tile_size/2.0, tile_size/2.0)
	add_child(crate)

func _spawn_barrel(pos: Vector2) -> void:
	var barrel = StaticBody2D.new()
	barrel.set_script(barrel_script)
	barrel.global_position = pos + Vector2(tile_size/2.0, tile_size/2.0)
	add_child(barrel)

func _spawn_spike_trap(pos: Vector2) -> void:
	var spike = Area2D.new()
	spike.set_script(spike_trap_script)
	spike.global_position = pos + Vector2(tile_size/2.0, tile_size/2.0)
	add_child(spike)
