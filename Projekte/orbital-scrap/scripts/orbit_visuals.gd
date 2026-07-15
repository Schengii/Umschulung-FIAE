extends Control

# References to main script to fetch counts
@onready var main_node = get_parent()

# Orbit Radii
const RAD_LAB = 45.0
const RAD_DRONE = 80.0
const RAD_MINE = 130.0
const RAD_SATELLITE = 180.0
const RAD_DYSON = 230.0
const RAD_WARPGATE = 280.0

# Rotation speeds (rad/sec)
const SPEED_LAB = -0.4
const SPEED_DRONE = 0.8
const SPEED_MINE = 0.5
const SPEED_SATELLITE = 0.3
const SPEED_DYSON = 0.15
const SPEED_WARPGATE = 0.08

# Time variables for rotation
var time: float = 0.0

func _process(delta: float) -> void:
	time += delta
	queue_redraw()

func _draw() -> void:
	var center = size / 2.0
	
	# Draw active skill glows
	# 1. Overdrive active (Yellow glowing aura around center)
	if main_node.overdriveActive:
		var pulse = 0.15 + 0.08 * sin(time * 18.0)
		draw_circle(center, 70.0, Color(1.0, 0.8, 0.2, pulse))
		
		# Draw electricity sparks
		for k in range(3):
			var a = time * 5.0 + k * (2 * PI / 3.0)
			var start = center + Vector2(cos(a), sin(a)) * 25.0
			var end = center + Vector2(cos(a + randf_range(-0.3, 0.3)), sin(a + randf_range(-0.3, 0.3))) * 65.0
			draw_line(start, end, Color(1.0, 0.9, 0.4, 0.8), 1.5)
			
	# 2. SPS Supercharge active (Cyan shield pulse around all orbits)
	if main_node.superchargeActive:
		var pulse_rad = RAD_DYSON + 10.0 + 5.0 * sin(time * 8.0)
		draw_arc(center, pulse_rad, 0, 2*PI, 64, Color(0.2, 0.8, 1.0, 0.25), 3.0)
		draw_circle(center, pulse_rad, Color(0.2, 0.8, 1.0, 0.04))

	# Draw orbital paths
	draw_arc(center, RAD_LAB, 0, 2*PI, 48, Color(0.5, 0.2, 0.7, 0.1), 1.0)
	draw_arc(center, RAD_DRONE, 0, 2*PI, 64, Color(0.15, 0.3, 0.5, 0.12), 1.0)
	draw_arc(center, RAD_MINE, 0, 2*PI, 64, Color(0.15, 0.3, 0.5, 0.12), 1.0)
	draw_arc(center, RAD_SATELLITE, 0, 2*PI, 64, Color(0.15, 0.3, 0.5, 0.12), 1.0)
	draw_arc(center, RAD_DYSON, 0, 2*PI, 64, Color(0.15, 0.3, 0.5, 0.12), 1.0)
	draw_arc(center, RAD_WARPGATE, 0, 2*PI, 64, Color(0.15, 0.3, 0.5, 0.12), 1.0)
	
	# Draw Space Station in the center
	draw_circle(center, 22.0, Color(0.08, 0.2, 0.45, 0.7))
	draw_circle(center, 13.0, Color(0.25, 0.55, 0.95, 1.0))
	draw_circle(center, 6.0, Color(1.0, 1.0, 1.0, 1.0))
	
	# Rotating solar arrays / station modules
	var station_rot = time * 0.25
	for i in range(4):
		var angle = station_rot + i * (PI / 2.0)
		var dir = Vector2(cos(angle), sin(angle))
		draw_line(center, center + dir * 32.0, Color(0.25, 0.55, 0.95, 1.0), 2.0)
		var panel_center = center + dir * 32.0
		var panel_perp = Vector2(-dir.y, dir.x)
		draw_line(panel_center - panel_perp * 8.0, panel_center + panel_perp * 8.0, Color(0.85, 0.45, 0.95, 1.0), 4.0)

	# Draw Orbital Lab (glowing purple triangle rotating)
	var lab_angle = time * SPEED_LAB
	var lab_pos = center + Vector2(cos(lab_angle), sin(lab_angle)) * RAD_LAB
	var l1 = lab_pos + Vector2(cos(lab_angle), sin(lab_angle)) * 8.0
	var l2 = lab_pos + Vector2(cos(lab_angle + 2.3), sin(lab_angle + 2.3)) * 6.0
	var l3 = lab_pos + Vector2(cos(lab_angle - 2.3), sin(lab_angle - 2.3)) * 6.0
	draw_polygon(PackedVector2Array([l1, l2, l3]), PackedColorArray([Color(0.7, 0.3, 1.0, 1.0)]))
	draw_circle(lab_pos, 2.0, Color(1.0, 1.0, 1.0, 1.0))

	# Draw Drones
	var drone_count = main_node.droneCount
	var visual_drones = min(drone_count, 24)
	if visual_drones > 0:
		for i in range(visual_drones):
			var angle = time * SPEED_DRONE + i * (2 * PI / visual_drones)
			var pos = center + Vector2(cos(angle), sin(angle)) * RAD_DRONE
			draw_circle(pos, 4.0, Color(0.2, 0.8, 1.0, 1.0))
			draw_circle(pos - Vector2(cos(angle + 0.1), sin(angle + 0.1)) * 3.0, 2.0, Color(0.2, 0.8, 1.0, 0.4))

	# Draw Mines
	var mine_count = main_node.mineCount
	var visual_mines = min(mine_count, 16)
	if visual_mines > 0:
		for i in range(visual_mines):
			var angle = -time * SPEED_MINE + i * (2 * PI / visual_mines)
			var pos = center + Vector2(cos(angle), sin(angle)) * RAD_MINE
			var points = PackedVector2Array([
				pos + Vector2(-4, -4),
				pos + Vector2(4, -4),
				pos + Vector2(4, 4),
				pos + Vector2(-4, 4)
			])
			draw_polygon(points, PackedColorArray([Color(0.4, 0.95, 0.5, 1.0)]))

	# Draw Satellites (beaming data/disks if unlocked)
	var sat_count = main_node.satelliteCount
	var visual_sats = min(sat_count, 12)
	if visual_sats > 0:
		for i in range(visual_sats):
			var angle = time * SPEED_SATELLITE + i * (2 * PI / visual_sats)
			var pos = center + Vector2(cos(angle), sin(angle)) * RAD_SATELLITE
			draw_line(pos + Vector2(-6, 0), pos + Vector2(6, 0), Color(0.95, 0.75, 0.25, 1.0), 2.0)
			draw_line(pos + Vector2(0, -3), pos + Vector2(0, 3), Color(0.2, 0.7, 1.0, 1.0), 3.0)
			draw_circle(pos, 2.5, Color(1.0, 1.0, 1.0, 1.0))
			# Draw data beam periodically from satellite to lab
			if int(time * 3 + i) % 7 == 0:
				draw_line(pos, lab_pos, Color(0.7, 0.3, 1.0, 0.45), 1.0)

	# Draw Dyson Fragments
	var dyson_count = main_node.dysonCount
	var visual_dyson = min(dyson_count, 8)
	if visual_dyson > 0:
		for i in range(visual_dyson):
			var angle = -time * SPEED_DYSON + i * (2 * PI / visual_dyson)
			draw_arc(center, RAD_DYSON, angle - 0.2, angle + 0.2, 10, Color(1.0, 0.85, 0.2, 0.85), 5.0)

	# Draw Warp Gates
	var warp_count = main_node.warpGateCount
	var visual_warps = min(warp_count, 4)
	if visual_warps > 0:
		for i in range(visual_warps):
			var angle = time * SPEED_WARPGATE + i * (2 * PI / visual_warps)
			var pos = center + Vector2(cos(angle), sin(angle)) * RAD_WARPGATE
			draw_circle(pos, 10.0, Color(0.85, 0.45, 0.95, 0.85))
			draw_circle(pos, 6.0, Color(0.1, 0.1, 0.2, 1.0))
			draw_circle(pos, 4.0 * (1.0 + 0.2 * sin(time * 10.0)), Color(0.2, 0.8, 1.0, 0.9))

	# Active Events visuals
	if main_node.solarFlareActive:
		var pulse = 0.08 + 0.04 * sin(time * 12.0)
		draw_rect(Rect2(Vector2.ZERO, size), Color(1.0, 0.25, 0.05, pulse))

	if main_node.wormholeActive:
		var w_pos = main_node.wormholePosition
		var w_radius = 24.0 + 4.0 * sin(time * 8.0)
		draw_circle(w_pos, w_radius, Color(0.12, 0.35, 0.9, 0.25))
		draw_circle(w_pos, w_radius * 0.65, Color(0.3, 0.65, 1.0, 0.6))
		draw_circle(w_pos, w_radius * 0.3, Color(0.85, 0.95, 1.0, 0.95))

	if main_node.anomalyActive:
		var a_pos = main_node.anomalyPosition
		var pulse = 0.5 + 0.5 * sin(time * 12.0)
		draw_circle(a_pos, 8.0, Color(0.2, 0.95, 0.45, pulse))
		draw_arc(a_pos, 15.0 + 3.0 * sin(time * 5.0), 0, 2*PI, 16, Color(0.2, 0.95, 0.45, 0.4 * pulse), 1.5)

	if main_node.piratesActive:
		var p_pos = main_node.piratePosition
		var to_center = (center - p_pos).angle()
		var p1 = p_pos + Vector2(cos(to_center), sin(to_center)) * 14.0
		var p2 = p_pos + Vector2(cos(to_center + 2.4), sin(to_center + 2.4)) * 9.0
		var p3 = p_pos + Vector2(cos(to_center - 2.4), sin(to_center - 2.4)) * 9.0
		draw_polygon(PackedVector2Array([p1, p2, p3]), PackedColorArray([Color(0.95, 0.2, 0.2, 1.0)]))
		var fire_dir = -Vector2(cos(to_center), sin(to_center))
		draw_line(p_pos, p_pos + fire_dir * (6.0 + 3.0 * sin(time * 20.0)), Color(1.0, 0.5, 0.0, 1.0), 3.0)

		var hp_pct = float(main_node.pirateHealth) / 5.0
		draw_line(p_pos + Vector2(-15, -16), p_pos + Vector2(15, -16), Color(0.15, 0.15, 0.15, 1.0), 3.0)
		draw_line(p_pos + Vector2(-15, -16), p_pos + Vector2(-15 + 30.0 * hp_pct, -16), Color(0.95, 0.15, 0.15, 1.0), 3.0)

		if int(time * 6.0) % 2 == 0:
			draw_line(p_pos, center, Color(0.95, 0.3, 0.3, 0.65), 2.0)

	if main_node.piratesActive and main_node.prestigeDefenseLaserLevel > 0:
		if main_node.defenseLaserVisualTimer > 0.0:
			draw_line(center, main_node.piratePosition, Color(0.2, 0.95, 0.45, 0.9), 3.5)
