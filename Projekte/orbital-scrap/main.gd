extends Control

var scrapCount: float = 0.0
var scrapPerSecond: float = 0.0

var clickPower: float = 1.0
var clickUpgradeLevel: int = 0
var clickUpgradeBaseCost: int = 15
var clickUpgradeMultiplier: float = 1.5

var droneCount: int = 0
var droneBaseCost: int = 10
var droneProduction: float = 0.2

var mineCount: int = 0
var mineBaseCost: int = 100
var mineProduction: float = 2.0

var droneUpgradeLevel: int = 0
var droneUpgradeBaseCost: int = 25
var droneUpgradeMultiplier: float = 1.4

var prestigePoints: int = 0
var prestigeMultiplier: float = 1.0
var totalScrapEver: float = 0.0

var achievements: Dictionary = {
	"first_100": {"name": "Erster Haufen", "goal": 100, "unlocked": false},
	"ten_drones": {"name": "Drohnenflotte", "goal": 10, "unlocked": false},
	"hundred_sps": {"name": "Orbitale Produktion", "goal": 100, "unlocked": false},
	"first_mine": {"name": "Erste Mine", "goal": 1, "unlocked": false},
	"prestige_1": {"name": "Neustart", "goal": 1, "unlocked": false},
}

var save_path: String = "user://save_data.cfg"
var last_save_time: int = 0
var save_timer: float = 0.0
var save_status_timer: float = 0.0
var prestige_goal: float = 1000.0
var tutorial_shown: bool = false

func _ready() -> void:
	load_game()
	setup_visuals()
	update_ui()
	if not tutorial_shown:
		show_tutorial()

func _process(delta: float) -> void:
	if scrapPerSecond > 0:
		scrapCount += scrapPerSecond * delta
		totalScrapEver += scrapPerSecond * delta
		update_ui()
	update_background(delta)
	save_timer += delta
	if save_timer >= 15.0:
		save_game()
		set_save_status("Automatisch gespeichert")
		save_timer = 0.0
	if save_status_timer > 0.0:
		save_status_timer -= delta
		if save_status_timer <= 0.0:
			$SaveStatusLabel.text = ""

func setup_visuals() -> void:
	$Background.color = Color(0.03, 0.05, 0.12, 1.0)
	$Background2.modulate = Color(0.12, 0.2, 0.35, 0.35)
	$Background3.modulate = Color(0.2, 0.35, 0.5, 0.25)
	$TitleLabel.text = "Orbital Scrap"
	$TitleLabel.modulate = Color(0.95, 0.9, 1.0, 1.0)
	$InfoLabel.text = "Sammle Schrott, baue Drohnen und starte neue Runden mit Prestige."
	$InfoLabel.modulate = Color(0.8, 0.85, 0.95, 1.0)
	for button in [$ScrapButton, $BuyDroneButton, $BuyMineButton, $ClickUpgradeButton, $DroneUpgradeButton, $PrestigeButton]:
		button.self_modulate = Color(0.18, 0.35, 0.6, 1.0)
		button.add_theme_color_override("font_color", Color(1.0, 1.0, 1.0))
		button.add_theme_color_override("font_hover_color", Color(1.0, 1.0, 1.0))
		button.add_theme_color_override("font_pressed_color", Color(1.0, 1.0, 1.0))
	$PrestigeProgressBar.max_value = prestige_goal
	$PrestigeProgressBar.value = 0.0
	$TitleLabel.modulate = Color(0.95, 0.9, 1.0, 1.0)
	$InfoLabel.text = "Sammle Schrott, baue Drohnen und starte neue Runden mit Prestige."
	$InfoLabel.modulate = Color(0.8, 0.85, 0.95, 1.0)
	for button in [$ScrapButton, $BuyDroneButton, $BuyMineButton, $ClickUpgradeButton, $DroneUpgradeButton, $PrestigeButton]:
		button.self_modulate = Color(0.18, 0.35, 0.6, 1.0)
		button.add_theme_color_override("font_color", Color(1.0, 1.0, 1.0))
		button.add_theme_color_override("font_hover_color", Color(1.0, 1.0, 1.0))
		button.add_theme_color_override("font_pressed_color", Color(1.0, 1.0, 1.0))

func update_background(delta: float) -> void:
	$Background2.position.x = fmod($Background2.position.x + delta * 20.0, 800.0)
	$Background3.position.x = fmod($Background3.position.x + delta * 10.0, 800.0)
	$Background2.position.y = 80.0 + sin(Time.get_ticks_msec() / 500.0) * 10.0
	$Background3.position.y = 160.0 + cos(Time.get_ticks_msec() / 700.0) * 15.0

func show_tutorial() -> void:
	tutorial_shown = true
	var panel := ColorRect.new()
	panel.color = Color(0.04, 0.08, 0.15, 0.92)
	panel.size = Vector2(420, 220)
	panel.position = Vector2(140, 220)
	panel.set_name("TutorialPanel")
	$PopupLayer.add_child(panel)
	var title := Label.new()
	title.text = "Willkommen bei Orbital Scrap"
	title.position = Vector2(20, 20)
	title.add_theme_font_size_override("font_size", 24)
	panel.add_child(title)
	var text := Label.new()
	text.text = "1. Klick auf den Sammelbutton\n2. Kaufe Drohnen und Minen\n3. Verbessere deine Produktion\n4. Nutze Prestige für einen Bonus"
	text.position = Vector2(20, 70)
	text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.size = Vector2(380, 120)
	panel.add_child(text)
	var button := Button.new()
	button.text = "Los geht's"
	button.position = Vector2(140, 170)
	button.pressed.connect(func(): panel.queue_free())
	panel.add_child(button)

func set_save_status(message: String) -> void:
	$SaveStatusLabel.text = message
	save_status_timer = 2.0

func update_ui() -> void:
	check_achievements()
	$ScrapLabel.text = "Schrott: " + format_number(scrapCount)
	$DroneLabel.text = "Drohnen: " + str(droneCount) + " (Kosten: " + str(get_drone_cost()) + ")"
	$MineLabel.text = "Minen: " + str(mineCount) + " (Kosten: " + str(get_mine_cost()) + ")"
	$SpsLabel.text = "Produktion: " + format_number(scrapPerSecond) + " /s"
	$ClickUpgradeButton.text = "Klick-Upgrade kaufen (" + str(get_click_upgrade_cost()) + ")"
	$ClickUpgradeLabel.text = "Klick-Power: " + format_number(clickPower) + "x (Stufe " + str(clickUpgradeLevel) + ")"
	$DroneUpgradeButton.text = "Drohnen-Upgrade kaufen (" + str(get_drone_upgrade_cost()) + ")"
	$DroneUpgradeLabel.text = "Drohnen-Effizienz: " + format_number(droneProduction) + " /s pro Drohne (Stufe " + str(droneUpgradeLevel) + ")"
	$PrestigeLabel.text = "Prestige-Punkte: " + str(prestigePoints) + " | Multiplier: " + format_number(prestigeMultiplier) + "x"
	var progress_value := clamp(totalScrapEver, 0.0, prestige_goal)
	$PrestigeProgressBar.value = progress_value
	$PrestigeProgressLabel.text = "Prestige-Fortschritt: " + format_number(progress_value) + "/" + str(int(prestige_goal))
	if save_status_timer <= 0.0:
		$SaveStatusLabel.text = ""
	update_achievements_ui()

func format_number(value: float) -> String:
	var rounded := snapped(value, 0.01)
	if abs(rounded - round(rounded)) < 0.0001:
		return str(int(round(rounded)))
	return str(rounded)

func check_achievements() -> void:
	if scrapCount >= 100 and not achievements["first_100"]["unlocked"]:
		achievements["first_100"]["unlocked"] = true
	if droneCount >= 10 and not achievements["ten_drones"]["unlocked"]:
		achievements["ten_drones"]["unlocked"] = true
	if scrapPerSecond >= 100 and not achievements["hundred_sps"]["unlocked"]:
		achievements["hundred_sps"]["unlocked"] = true
	if mineCount >= 1 and not achievements["first_mine"]["unlocked"]:
		achievements["first_mine"]["unlocked"] = true
	if prestigePoints >= 1 and not achievements["prestige_1"]["unlocked"]:
		achievements["prestige_1"]["unlocked"] = true

func update_achievements_ui() -> void:
	var lines: PackedStringArray = []
	for key in achievements.keys():
		var entry: Dictionary = achievements[key]
		var status := "✓" if bool(entry["unlocked"]) else "○"
		lines.append(status + " " + str(entry["name"]) + " (Ziel: " + str(entry["goal"]) + ")")
	$AchievementsLabel.text = "Erfolge:\n" + "\n".join(lines)

func update_production() -> void:
	scrapPerSecond = (droneCount * droneProduction + mineCount * mineProduction) * prestigeMultiplier

func get_drone_cost() -> int:
	return int(10 * pow(1.15, droneCount))

func get_mine_cost() -> int:
	return int(100 * pow(1.2, mineCount))

func get_click_upgrade_cost() -> int:
	return int(clickUpgradeBaseCost * pow(clickUpgradeMultiplier, clickUpgradeLevel))

func get_drone_upgrade_cost() -> int:
	return int(droneUpgradeBaseCost * pow(droneUpgradeMultiplier, droneUpgradeLevel))

func _animate_ui_feedback(node: Control) -> void:
	var tween := create_tween()
	tween.set_ease(Tween.EASE_OUT)
	tween.set_trans(Tween.TRANS_SINE)
	tween.tween_property(node, "scale", Vector2(1.03, 1.03), 0.08)
	tween.tween_property(node, "scale", Vector2(1.0, 1.0), 0.08)

func _show_popup(message: String, position: Vector2, color: Color) -> void:
	var label := Label.new()
	label.text = message
	label.modulate = color
	label.position = position
	label.size = Vector2(220, 40)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 18)
	$PopupLayer.add_child(label)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 50, 0.8)
	tween.tween_property(label, "modulate:a", 0.0, 0.8)
	tween.tween_property(label, "scale", Vector2(1.1, 1.1), 0.2)
	tween.tween_property(label, "scale", Vector2(1.0, 1.0), 0.6)
	await tween.finished
	label.queue_free()

func _on_scrap_button_pressed() -> void:
	scrapCount += clickPower * prestigeMultiplier
	totalScrapEver += clickPower * prestigeMultiplier
	_animate_ui_feedback($ScrapButton)
	_show_popup("+" + format_number(clickPower * prestigeMultiplier), $ScrapButton.global_position + Vector2(20, -20), Color(1.0, 0.9, 0.2, 1.0))
	update_ui()
	save_game()

func _on_buy_drone_button_pressed() -> void:
	var cost := get_drone_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		droneCount += 1
		update_production()
		_animate_ui_feedback($BuyDroneButton)
		_show_popup("Drohne +1", $BuyDroneButton.global_position + Vector2(20, -20), Color(0.2, 0.8, 1.0, 1.0))
		update_ui()
		save_game()

func _on_buy_mine_button_pressed() -> void:
	var cost := get_mine_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		mineCount += 1
		update_production()
		_animate_ui_feedback($BuyMineButton)
		_show_popup("Mine +1", $BuyMineButton.global_position + Vector2(20, -20), Color(0.4, 0.95, 0.5, 1.0))
		update_ui()
		save_game()

func _on_click_upgrade_button_pressed() -> void:
	var cost := get_click_upgrade_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		clickUpgradeLevel += 1
		clickPower *= 1.5
		_animate_ui_feedback($ClickUpgradeButton)
		_show_popup("Klick +" + format_number(clickPower), $ClickUpgradeButton.global_position + Vector2(20, -20), Color(1.0, 0.6, 0.2, 1.0))
		update_ui()
		save_game()

func _on_drone_upgrade_button_pressed() -> void:
	var cost := get_drone_upgrade_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		droneUpgradeLevel += 1
		droneProduction += 0.2
		update_production()
		_animate_ui_feedback($DroneUpgradeButton)
		_show_popup("Drohnen +20%", $DroneUpgradeButton.global_position + Vector2(20, -20), Color(0.7, 0.5, 1.0, 1.0))
		update_ui()
		save_game()

func _on_prestige_button_pressed() -> void:
	var prestige_gain := int(max(1, floor(totalScrapEver / 1000.0)))
	if prestige_gain <= 0:
		prestige_gain = 1
	if scrapCount >= 1000 or totalScrapEver >= 1000:
		prestigePoints += prestige_gain
		prestigeMultiplier = 1.0 + (prestigePoints * 0.1)
		scrapCount = 0.0
		scrapPerSecond = 0.0
		clickPower = 1.0
		clickUpgradeLevel = 0
		droneCount = 0
		droneProduction = 0.2
		droneUpgradeLevel = 0
		mineCount = 0
		mineProduction = 2.0
		totalScrapEver += scrapCount
		_animate_ui_feedback($PrestigeButton)
		_show_popup("Prestige +" + str(prestige_gain), $PrestigeButton.global_position + Vector2(20, -20), Color(0.95, 0.7, 1.0, 1.0))
		update_ui()
		save_game()

func save_game() -> void:
	var config := ConfigFile.new()
	config.set_value("player", "scrap_count", scrapCount)
	config.set_value("player", "scrap_per_second", scrapPerSecond)
	config.set_value("player", "click_power", clickPower)
	config.set_value("player", "drone_count", droneCount)
	config.set_value("player", "drone_production", droneProduction)
	config.set_value("player", "mine_count", mineCount)
	config.set_value("player", "mine_production", mineProduction)
	config.set_value("player", "click_upgrade_level", clickUpgradeLevel)
	config.set_value("player", "drone_upgrade_level", droneUpgradeLevel)
	config.set_value("player", "prestige_points", prestigePoints)
	config.set_value("player", "prestige_multiplier", prestigeMultiplier)
	config.set_value("player", "total_scrap_ever", totalScrapEver)
	config.set_value("player", "last_save_time", int(Time.get_unix_time_from_system()))
	for key in achievements.keys():
		config.set_value("achievements", key, bool(achievements[key]["unlocked"]))
	var err := config.save(save_path)
	if err != OK:
		print("Fehler beim Speichern: ", err)

func load_game() -> void:
	var config := ConfigFile.new()
	var err := config.load(save_path)
	if err != OK:
		return
	scrapCount = float(config.get_value("player", "scrap_count", 0.0))
	scrapPerSecond = float(config.get_value("player", "scrap_per_second", 0.0))
	clickPower = float(config.get_value("player", "click_power", 1.0))
	droneCount = int(config.get_value("player", "drone_count", 0))
	droneProduction = float(config.get_value("player", "drone_production", 0.2))
	mineCount = int(config.get_value("player", "mine_count", 0))
	mineProduction = float(config.get_value("player", "mine_production", 2.0))
	clickUpgradeLevel = int(config.get_value("player", "click_upgrade_level", 0))
	droneUpgradeLevel = int(config.get_value("player", "drone_upgrade_level", 0))
	prestigePoints = int(config.get_value("player", "prestige_points", 0))
	prestigeMultiplier = float(config.get_value("player", "prestige_multiplier", 1.0))
	totalScrapEver = float(config.get_value("player", "total_scrap_ever", 0.0))
	last_save_time = int(config.get_value("player", "last_save_time", int(Time.get_unix_time_from_system())))
	for key in achievements.keys():
		achievements[key]["unlocked"] = bool(config.get_value("achievements", key, false))
	update_production()
	var now := int(Time.get_unix_time_from_system())
	var elapsed := max(0, now - last_save_time)
	if elapsed > 0 and scrapPerSecond > 0:
		var offline_gain := scrapPerSecond * elapsed
		scrapCount += offline_gain
		totalScrapEver += offline_gain
		$OfflineLabel.text = "Offline-Gewinn: " + format_number(offline_gain) + " Schrott"
	else:
		$OfflineLabel.text = ""
	set_save_status("Spielstand geladen")
	save_game()
