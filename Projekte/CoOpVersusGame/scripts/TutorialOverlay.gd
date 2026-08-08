extends CanvasLayer

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	
	var panel = PanelContainer.new()
	panel.anchors_preset = Control.PRESET_FULL_RECT
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.modulate = Color(1.0, 1.0, 1.0, 0.95)
	add_child(panel)
	
	var margin = MarginContainer.new()
	margin.anchors_preset = Control.PRESET_FULL_RECT
	margin.add_theme_constant_override("margin_left", 48)
	margin.add_theme_constant_override("margin_right", 48)
	margin.add_theme_constant_override("margin_top", 48)
	margin.add_theme_constant_override("margin_bottom", 48)
	panel.add_child(margin)
	
	var vbox = VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	vbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	margin.add_child(vbox)
	
	var title = Label.new()
	title.text = "Spielanleitung"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.theme_override_font_sizes/font_size = 26
	vbox.add_child(title)
	
	var desc = Label.new()
	desc.text = "Bewegung: WASD\nSchießen: Leertaste / Mausklick\nDash: Shift\nSchild / Fähigkeit: E\nKlasse wechseln: C\nShop: Tab\nZiel: Überlebe die Wellen, besiege den Boss und öffne den Portal-Übergang."
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	vbox.add_child(desc)
	
	var close_btn = Button.new()
	close_btn.text = "Los geht's"
	close_btn.custom_minimum_size = Vector2(220, 42)
	close_btn.pressed.connect(func(): queue_free())
	vbox.add_child(close_btn)
