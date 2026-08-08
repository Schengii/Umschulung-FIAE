extends CanvasLayer

# Minimap - Godot 4.x
# Renders a small radar showing explored tiles (Fog of War), players, enemies, bosses, and portals.

var _scale: float = 0.04
var center_offset: Vector2 = Vector2(100, 100)

var dg: Node = null
var explored_map = [] # 2D array of booleans

# Redraw optimization: track last known state
var _last_player_pos: Vector2 = Vector2.ZERO
var _last_enemy_count: int = 0
var _last_boss_count: int = 0
var _last_portal_count: int = 0
var _redraw_timer: float = 0.0
const REDRAW_INTERVAL: float = 0.1 # Redraw at most ~10 times per second

func _ready() -> void:
	layer = 100
	var panel = ColorRect.new()
	panel.size = Vector2(200, 200)
	panel.position = Vector2(20, 20)
	panel.color = Color(0.04, 0.04, 0.06, 0.75) # Semi-transparent dark background
	add_child(panel)
	
	# Add a border reference
	var border = ReferenceRect.new()
	border.size = panel.size
	border.position = panel.position
	border.border_color = Color(0.4, 0.4, 0.4, 0.8)
	border.border_width = 2.0
	border.editor_only = false
	add_child(border)

	# Connect to generator
	var dg_node = get_node_or_null("/root/Main/DungeonGenerator")
	if dg_node:
		dg_node.dungeon_generated.connect(setup_explored_map)
	setup_explored_map()

func setup_explored_map() -> void:
	dg = get_tree().get_first_node_in_group("dungeon_generator")
	if not dg:
		dg = get_node_or_null("/root/Main/DungeonGenerator")
	
	if dg:
		explored_map.clear()
		for y in range(dg.height):
			var row = []
			for x in range(dg.width):
				row.append(false)
			explored_map.append(row)

func _process(delta: float) -> void:
	var my_player = null
	for p in get_tree().get_nodes_in_group("players"):
		if "is_local_player" in p and p.is_local_player:
			my_player = p
			break
			
	if my_player and dg and explored_map.size() > 0:
		# Convert player position to tile coordinates
		var px = int(my_player.global_position.x / dg.tile_size)
		var py = int(my_player.global_position.y / dg.tile_size)
		
		# Reveal 3x3 surrounding tiles
		for dy in range(-3, 4):
			for dx in range(-3, 4):
				var tx = px + dx
				var ty = py + dy
				if tx >= 0 and tx < dg.width and ty >= 0 and ty < dg.height:
					explored_map[ty][tx] = true

	# Rate-limited redraw: only redraw if something changed or interval elapsed
	_redraw_timer -= delta
	var needs_redraw = false
	
	if my_player:
		var current_pos = my_player.global_position
		if current_pos.distance_to(_last_player_pos) > 8.0:
			_last_player_pos = current_pos
			needs_redraw = true
	
	var enemy_count = get_tree().get_nodes_in_group("enemies").size()
	var boss_count = get_tree().get_nodes_in_group("boss").size()
	var portal_count = get_tree().get_nodes_in_group("portals").size()
	
	if enemy_count != _last_enemy_count or boss_count != _last_boss_count or portal_count != _last_portal_count:
		_last_enemy_count = enemy_count
		_last_boss_count = boss_count
		_last_portal_count = portal_count
		needs_redraw = true

	if needs_redraw or _redraw_timer <= 0.0:
		_redraw_timer = REDRAW_INTERVAL
		queue_redraw()

func _draw() -> void:
	var offset = Vector2(20, 20) + center_offset
	
	var my_player = null
	for p in get_tree().get_nodes_in_group("players"):
		if "is_local_player" in p and p.is_local_player:
			my_player = p
			break
			
	var center_pos = Vector2.ZERO
	if my_player:
		center_pos = my_player.global_position
		
	# Draw explored tiles (Fog of War)
	if dg and explored_map.size() > 0:
		for y in range(dg.height):
			for x in range(dg.width):
				if explored_map[y][x]:
					var tile_pos = Vector2(x * dg.tile_size + dg.tile_size/2.0, y * dg.tile_size + dg.tile_size/2.0)
					var rel_pos = (tile_pos - center_pos) * _scale
					if rel_pos.length() < 90.0:
						var color = Color(0.18, 0.18, 0.22) # Floor
						if dg.map_data[y][x] == 1:
							color = Color(0.4, 0.4, 0.45) # Wall
							
						var size_dim = dg.tile_size * _scale
						var rect = Rect2(offset + rel_pos - Vector2(size_dim/2.0, size_dim/2.0), Vector2(size_dim + 0.5, size_dim + 0.5))
						draw_rect(rect, color)
		
	# Draw portals (Cyan pulsing) - visible globally on minimap
	for portal in get_tree().get_nodes_in_group("portals"):
		var rel_pos = (portal.global_position - center_pos) * _scale
		if rel_pos.length() < 90.0:
			var pulse = 0.7 + sin(Time.get_ticks_msec() * 0.005) * 0.3
			draw_circle(offset + rel_pos, 5.0, Color(0.2, 1.0, 1.0, pulse))

	# Draw enemies (Red) - Only if visible or explored
	var players = get_tree().get_nodes_in_group("players")
	for enemy in get_tree().get_nodes_in_group("enemies"):
		# Skip bosses here, they get drawn separately
		if enemy.is_in_group("boss"):
			continue
		var visible_on_radar = false
		for player in players:
			if enemy.global_position.distance_to(player.global_position) <= 250.0:
				visible_on_radar = true
				break
		if not visible_on_radar:
			continue
			
		var rel_pos = (enemy.global_position - center_pos) * _scale
		if rel_pos.length() < 90.0:
			draw_circle(offset + rel_pos, 3.0, Color(1.0, 0.2, 0.2))

	# Draw bosses (Large red pulsing) - always visible on minimap
	for boss in get_tree().get_nodes_in_group("boss"):
		var rel_pos = (boss.global_position - center_pos) * _scale
		if rel_pos.length() < 90.0:
			var pulse = 0.6 + sin(Time.get_ticks_msec() * 0.004) * 0.4
			draw_circle(offset + rel_pos, 6.0, Color(1.0, 0.1, 0.1, pulse))
			# Draw a small skull marker outline
			draw_arc(offset + rel_pos, 8.0, 0, TAU, 16, Color(1.0, 0.3, 0.3, 0.5), 1.0)

	# Draw allies (Green/White)
	for player in get_tree().get_nodes_in_group("players"):
		var rel_pos = (player.global_position - center_pos) * _scale
		if rel_pos.length() < 90.0:
			var color = Color(0.2, 1.0, 0.2)
			if player == my_player:
				color = Color(1.0, 1.0, 1.0)
			draw_circle(offset + rel_pos, 4.0, color)
