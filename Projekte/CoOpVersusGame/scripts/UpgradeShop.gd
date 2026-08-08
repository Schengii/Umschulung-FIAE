extends CanvasLayer

# UpgradeShop – Godot 4.x
# UI menu to buy upgrades using score.

var player: Node2D = null
var _panel: Panel = null

func _ready() -> void:
	# Create UI overlay
	_panel = Panel.new()
	_panel.custom_minimum_size = Vector2(350, 300)
	_panel.anchors_preset = Control.PRESET_CENTER
	_panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER, Control.PRESET_MODE_KEEP_SIZE)
	add_child(_panel)
	
	# Glow / Glassmorphism styling
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.08, 0.08, 0.15, 0.85) # Dark translucent
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_width_top = 2
	style.border_width_bottom = 2
	style.border_color = Color(0.1, 0.8, 1.0) # Neon cyan
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	_panel.add_theme_stylebox_override("panel", style)
	
	var vbox = VBoxContainer.new()
	vbox.anchors_preset = Control.PRESET_FULL_RECT
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.theme_override_constants/separation = 10
	_panel.add_child(vbox)
	
	var title = Label.new()
	title.text = "UPGRADE SHOP"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.theme_override_font_sizes/font_size = 20
	title.modulate = Color(0.1, 0.8, 1.0)
	vbox.add_child(title)
	var score_label = Label.new()
	score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(score_label)
	
	var stats_label = Label.new()
	stats_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stats_label.theme_override_font_sizes/font_size = 9
	stats_label.modulate = Color(0.8, 0.8, 0.8)
	vbox.add_child(stats_label)
	
	# Update score and stats display loop
	var score_timer = Timer.new()
	score_timer.wait_time = 0.2
	score_timer.autostart = true
	score_timer.timeout.connect(func():
		var sm = get_node_or_null("/root/ScoreManager")
		score_label.text = "Punkte verbleibend: %d" % (sm.score if sm else 0)
		if is_instance_valid(player):
			stats_label.text = "HP: %d/%d | Tempo: %.0f | Schuss-CD: %.2fs | Dash-CD: %.2fs" % [
				player.health, player.max_health, player.speed, player.shoot_cooldown, player.dash_cooldown
			]
	)
	add_child(score_timer)
	
	# Upgrades Buttons
	_add_upgrade_button(vbox, "Lauftempo (+15%) - 50 Pkt", 50, 0)
	_add_upgrade_button(vbox, "Max Leben (+25 HP) - 60 Pkt", 60, 1)
	_add_upgrade_button(vbox, "Feuerrate (+15%) - 70 Pkt", 70, 2)
	_add_upgrade_button(vbox, "Dash Abklingzeit (-15%) - 50 Pkt", 50, 3)

	var btn_close = Button.new()
	btn_close.text = "Schließen (Tab)"
	
	var style_close_normal = StyleBoxFlat.new()
	style_close_normal.bg_color = Color(0.3, 0.15, 0.15)
	style_close_normal.corner_radius_top_left = 4
	style_close_normal.corner_radius_top_right = 4
	style_close_normal.corner_radius_bottom_left = 4
	style_close_normal.corner_radius_bottom_right = 4
	btn_close.add_theme_stylebox_override("normal", style_close_normal)
	
	var style_close_hover = StyleBoxFlat.new()
	style_close_hover.bg_color = Color(0.45, 0.2, 0.2)
	style_close_hover.corner_radius_top_left = 4
	style_close_hover.corner_radius_top_right = 4
	style_close_hover.corner_radius_bottom_left = 4
	style_close_hover.corner_radius_bottom_right = 4
	btn_close.add_theme_stylebox_override("hover", style_close_hover)
	
	btn_close.pressed.connect(queue_free)
	vbox.add_child(btn_close)

func _add_upgrade_button(parent: Node, label_text: String, cost: int, upgrade_type: int) -> void:
	var btn = Button.new()
	btn.text = label_text
	
	var style_normal = StyleBoxFlat.new()
	style_normal.bg_color = Color(0.12, 0.12, 0.22)
	style_normal.corner_radius_top_left = 4
	style_normal.corner_radius_top_right = 4
	style_normal.corner_radius_bottom_left = 4
	style_normal.corner_radius_bottom_right = 4
	btn.add_theme_stylebox_override("normal", style_normal)
	
	var style_hover = StyleBoxFlat.new()
	style_hover.bg_color = Color(0.2, 0.2, 0.35)
	style_hover.corner_radius_top_left = 4
	style_hover.corner_radius_top_right = 4
	style_hover.corner_radius_bottom_left = 4
	style_hover.corner_radius_bottom_right = 4
	btn.add_theme_stylebox_override("hover", style_hover)
	
	btn.pressed.connect(func():
		_buy_upgrade(cost, upgrade_type, btn)
	)
	parent.add_child(btn)

func _buy_upgrade(cost: int, upgrade_type: int, button: Button) -> void:
	var sm = get_node_or_null("/root/ScoreManager")
	if not sm or sm.score < cost:
		button.modulate = Color(1.0, 0.3, 0.3)
		get_tree().create_timer(0.3).timeout.connect(func(): button.modulate = Color(1,1,1,1))
		return
		
	# Apply upgrade on player
	if is_instance_valid(player) and player.has_method("apply_permanent_upgrade"):
		player.apply_permanent_upgrade(upgrade_type)
		sm.add_points(-cost) # Deduct points
		
		# Success animation
		var am = get_node_or_null("/root/AudioManager")
		if am and am.has_method("play_powerup"):
			am.play_powerup()
			
		button.modulate = Color(0.2, 1.0, 0.3)
		get_tree().create_timer(0.3).timeout.connect(func(): button.modulate = Color(1,1,1,1))
