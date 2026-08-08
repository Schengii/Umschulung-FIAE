extends CanvasLayer

# MetaShop - Godot 4.x
# Allows players to buy new classes using credits.

var _score_mgr = null

func _ready() -> void:
	_score_mgr = get_node_or_null("/root/ScoreManager")
	
	var panel = Panel.new()
	panel.custom_minimum_size = Vector2(400, 320)
	panel.anchors_preset = Control.PRESET_CENTER
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER, Control.PRESET_MODE_KEEP_SIZE)
	add_child(panel)
	
	# Glow / Glassmorphism styling with purple border
	var style = StyleBoxFlat.new()
	style.bg_color = Color(0.1, 0.06, 0.15, 0.85) # Purple translucent
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_width_top = 2
	style.border_width_bottom = 2
	style.border_color = Color(0.8, 0.2, 1.0) # Neon purple
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	panel.add_theme_stylebox_override("panel", style)
	
	var vbox = VBoxContainer.new()
	vbox.anchors_preset = Control.PRESET_FULL_RECT
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.theme_override_constants/separation = 15
	panel.add_child(vbox)
	
	var title = Label.new()
	title.text = "Klassen-Shop"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.theme_override_font_sizes/font_size = 24
	title.modulate = Color(0.8, 0.2, 1.0)
	vbox.add_child(title)
	
	var credits_label = Label.new()
	credits_label.text = "Credits: %d" % (_score_mgr.credits if _score_mgr else 0)
	credits_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(credits_label)
	if _score_mgr:
		_score_mgr.credits_updated.connect(func(c): credits_label.text = "Credits: %d" % c)

	_create_buy_btn(vbox, "Engineer (500 Credits)", 3, 500)
	_create_buy_btn(vbox, "Mage (1000 Credits)", 4, 1000)
	_create_buy_btn(vbox, "Rogue (1500 Credits)", 5, 1500)

	var btn_close = Button.new()
	btn_close.text = "Schließen"
	
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

func _create_buy_btn(parent: Node, text: String, class_id: int, cost: int) -> void:
	var btn = Button.new()
	btn.text = text
	
	var style_normal = StyleBoxFlat.new()
	style_normal.bg_color = Color(0.18, 0.12, 0.25)
	style_normal.corner_radius_top_left = 4
	style_normal.corner_radius_top_right = 4
	style_normal.corner_radius_bottom_left = 4
	style_normal.corner_radius_bottom_right = 4
	btn.add_theme_stylebox_override("normal", style_normal)
	
	var style_hover = StyleBoxFlat.new()
	style_hover.bg_color = Color(0.28, 0.2, 0.38)
	style_hover.corner_radius_top_left = 4
	style_hover.corner_radius_top_right = 4
	style_hover.corner_radius_bottom_left = 4
	style_hover.corner_radius_bottom_right = 4
	btn.add_theme_stylebox_override("hover", style_hover)
	
	parent.add_child(btn)
	
	if _score_mgr and class_id in _score_mgr.unlocked_classes:
		btn.text += " (Gekauft)"
		btn.disabled = true
	
	btn.pressed.connect(func():
		if _score_mgr and not class_id in _score_mgr.unlocked_classes:
			if _score_mgr.spend_credits(cost):
				_score_mgr.unlock_class(class_id)
				btn.text = btn.text.replace(" (Gekauft)", "") + " (Gekauft)"
				btn.disabled = true
	)
