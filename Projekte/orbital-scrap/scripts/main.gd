extends Control

# --- Game Variables ---
var scrapCount: float = 0.0
var scrapPerSecond: float = 0.0

var clickPower: float = 1.0
var clickUpgradeLevel: int = 0
var clickUpgradeBaseCost: int = 15
var clickUpgradeMultiplier: float = 1.5

# Buildings
var droneCount: int = 0
var droneBaseCost: int = 10
var droneProduction: float = 0.2
var droneUpgradeLevel: int = 0
var droneUpgradeBaseCost: int = 25
var droneUpgradeMultiplier: float = 1.4

var mineCount: int = 0
var mineBaseCost: int = 100
var mineProduction: float = 2.0
var mineUpgradeLevel: int = 0
var mineUpgradeBaseCost: int = 250
var mineUpgradeMultiplier: float = 1.5

var satelliteCount: int = 0
var satelliteBaseCost: int = 1000
var satelliteProduction: float = 15.0
var satelliteUpgradeLevel: int = 0
var satelliteUpgradeBaseCost: int = 2500
var satelliteUpgradeMultiplier: float = 1.6

var dysonCount: int = 0
var dysonBaseCost: int = 50000
var dysonProduction: float = 250.0
var dysonUpgradeLevel: int = 0
var dysonUpgradeBaseCost: int = 125000
var dysonUpgradeMultiplier: float = 1.8

var warpGateCount: int = 0
var warpGateBaseCost: int = 250000
var warpGateProduction: float = 1500.0
var warpGateUpgradeLevel: int = 0
var warpGateUpgradeBaseCost: int = 500000
var warpGateUpgradeMultiplier: float = 2.0

# --- Research Tree Variables ---
var dataDisks: float = 0.0
var dataDisksPerSecond: float = 0.0

var techIonEnginesLevel: int = 0       # Drone production +50% per level
var techDeepDrillingLevel: int = 0     # Mine production +50% per level
var techActiveOverdriveLevel: int = 0   # Unlocks Overdrive active skill (5x click power)
var techSpsSuperchargeLevel: int = 0    # Unlocks SPS Supercharge active skill (2x SPS)
var techAsteroidMagnetLevel: int = 0    # 35% chance to auto-collect golden asteroids
var techShieldGeneratorLevel: int = 0   # Reduces pirate drain to 1%


# Active Skills Cooldowns & Timers
var overdriveActive: bool = false
var overdriveTimer: float = 0.0
var overdriveCooldown: float = 0.0
const OVERDRIVE_DURATION: float = 15.0
const OVERDRIVE_COOLDOWN_MAX: float = 60.0

var superchargeActive: bool = false
var superchargeTimer: float = 0.0
var superchargeCooldown: float = 0.0
const SUPERCHARGE_DURATION: float = 30.0
const SUPERCHARGE_COOLDOWN_MAX: float = 90.0

# --- Combo-Klick System ---
var comboCount: int = 0           # Aktueller Combo-Schritt (0-4)
var comboTimer: float = 0.0       # Countdown bis Combo zerfällt
const COMBO_DECAY_TIME: float = 1.5  # Sekunden bis Combo fällt
const COMBO_STEPS: Array = [1, 2, 5, 10, 20]  # Multiplikatoren
var maxComboReached: int = 0      # Für Achievement-Tracking

# --- Prestige & Shop ---
var prestigePoints: int = 0         # Spendable prestige currency
var totalPrestigePoints: int = 0    # Ever earned prestige (determines multiplier)
var prestigeMultiplier: float = 1.0
var totalScrapEver: float = 0.0     # Scrap in current prestige run (for prestige threshold)

# Prestige Upgrades
var prestigeAutoCollectorLevel: int = 0
var prestigeCostReductionLevel: int = 0 # Max level 10
var prestigeScrapMagnetLevel: int = 0
var prestigeCritClickLevel: int = 0
var prestigeAsteroidScannerLevel: int = 0
var prestigeOfflineCompensatorLevel: int = 0
var prestigeDefenseLaserLevel: int = 0 # Max level 3
var prestigeResearchBoosterLevel: int = 0 # Multiplies satellite data disk rate
var prestigeAutoBuilderLevel: int = 0    # Automatically purchases cheapest affordable building


# --- Active Events Variables ---
var solarFlareActive: bool = false
var solarFlareTimer: float = 0.0
var solarFlareNextTime: float = 120.0
var solarFlareDuration: float = 30.0

var wormholeActive: bool = false
var wormholeTimer: float = 0.0
var wormholeNextTime: float = 160.0
var wormholeActiveTimer: float = 0.0
var wormholePosition: Vector2 = Vector2.ZERO

var piratesActive: bool = false
var piratesTimer: float = 0.0
var piratesNextTime: float = 200.0
var pirateHealth: int = 5
var piratePosition: Vector2 = Vector2.ZERO
var defenseLaserTimer: float = 0.0
var defenseLaserVisualTimer: float = 0.0

# Time Warp (from Wormhole)
var timeWarpActive: bool = false
var timeWarpTimer: float = 0.0
var timeWarpDuration: float = 20.0
const timeWarpSpeed: float = 3.0
var is_muted: bool = false
var synth_volume: float = 0.5

# Resource Scanner minigame
var scannerCooldown: float = 0.0
var anomalyActive: bool = false
var anomalyPosition: Vector2 = Vector2.ZERO
var anomalyTimer: float = 0.0

# Auto-Builder timer
var autoBuilderTimer: float = 0.0

# Shield hit flash visual
var shieldFlashTimer: float = 0.0


# --- Statistics ---
var statClicks: int = 0
var statTimePlayed: float = 0.0
var statTotalScrapEver: float = 0.0 # Total scrap accumulated across all prestige runs
var statAsteroidsClicked: int = 0
var statCritClicks: int = 0
var statPiratesDestroyed: int = 0
var statDataDisksEarned: float = 0.0

# --- Achievements ---
var achievements: Dictionary = {
	"first_100":      {"name": "Erster Haufen",       "desc": "100 Schrott gesammelt",           "goal": 100,       "current_key": "scrap",      "unlocked": false},
	"ten_drones":     {"name": "Drohnenflotte",       "desc": "10 Drohnen gebaut",                "goal": 10,        "current_key": "drones",     "unlocked": false},
	"hundred_sps":    {"name": "Orbitale Produktion", "desc": "100 SPS erreicht",                 "goal": 100,       "current_key": "sps",        "unlocked": false},
	"first_mine":     {"name": "Erste Mine",          "desc": "1 Mine gebaut",                    "goal": 1,         "current_key": "mines",      "unlocked": false},
	"prestige_1":     {"name": "Neustart",            "desc": "1 Prestige-Run abgeschlossen",     "goal": 1,         "current_key": "prestige",   "unlocked": false},
	"first_satellite":{"name": "Erster Satellit",     "desc": "1 Satellit gebaut",                "goal": 1,         "current_key": "satellites", "unlocked": false},
	"first_dyson":    {"name": "Dyson-Anfänger",      "desc": "1 Dyson-Teil gebaut",              "goal": 1,         "current_key": "dyson",      "unlocked": false},
	"pirate_slayer":  {"name": "Kammerjäger",         "desc": "1 Piratenschiff zerstört",         "goal": 1,         "current_key": "pirates",    "unlocked": false},
	"first_tech":     {"name": "Forschergeist",       "desc": "1 Technologie erforscht",          "goal": 1,         "current_key": "techs",      "unlocked": false},
	# Neue Achievements
	"first_warpgate": {"name": "Raumkrümmung",        "desc": "1 Warp-Tor errichtet",             "goal": 1,         "current_key": "warpgates",  "unlocked": false},
	"mega_fleet":     {"name": "Mega-Flotte",         "desc": "50 Drohnen im Orbit",              "goal": 50,        "current_key": "drones",     "unlocked": false},
	"scrap_million":  {"name": "Schrottmillionär",    "desc": "1.000.000 Schrott total gesammelt","goal": 1000000,   "current_key": "total_scrap","unlocked": false},
	"combo_master":   {"name": "Combo-Meister",       "desc": "Combo x20 erreicht",               "goal": 4,         "current_key": "max_combo",  "unlocked": false},
	"prestige_vet":   {"name": "Veteran",             "desc": "5 Prestige-Runs abgeschlossen",    "goal": 5,         "current_key": "prestige",   "unlocked": false},
	"speed_runner":   {"name": "Blitz-Sammler",       "desc": "1000 SPS erreicht",                "goal": 1000,      "current_key": "sps",        "unlocked": false},
}

# --- Internals ---
var save_path: String = "user://save_data.cfg"
var last_save_time: int = 0
var save_timer: float = 0.0
var save_status_timer: float = 0.0
var tutorial_shown: bool = false

var asteroidTimer: float = 0.0
var nextAsteroidTime: float = 45.0
var autoCollectorTimer: float = 0.0

# --- Milestone System ---
# Meilensteine basieren auf statTotalScrapEver und bleiben nach Prestige erhalten
var milestones: Array = [
	{"threshold": 10000.0,       "name": "Erster Schatz",         "desc": "+10% Klick-Power",                 "bonus_type": "click_power",      "bonus_value": 0.1,   "unlocked": false},
	{"threshold": 100000.0,      "name": "Kleines Lager",         "desc": "+1 kostenlose Drohne",             "bonus_type": "free_drone",       "bonus_value": 1.0,   "unlocked": false},
	{"threshold": 1000000.0,     "name": "Orbitale Fabrik",       "desc": "Drohnen +25% Produktion",         "bonus_type": "drone_boost",      "bonus_value": 0.25,  "unlocked": false},
	{"threshold": 10000000.0,    "name": "Weltraum-Konzern",      "desc": "Minen +25% Produktion",           "bonus_type": "mine_boost",       "bonus_value": 0.25,  "unlocked": false},
	{"threshold": 100000000.0,   "name": "Galaktische Industrie", "desc": "Satelliten +25% Produktion",      "bonus_type": "satellite_boost",  "bonus_value": 0.25,  "unlocked": false},
	{"threshold": 1000000000.0,  "name": "Dyson-Meister",         "desc": "+0.5x Prestige-Multiplikator",    "bonus_type": "prestige_boost",   "bonus_value": 0.5,   "unlocked": false},
]
# Akkumulierte Milestone-Boni (werden in update_production() verwendet)
var milestoneClickBonus: float = 0.0
var milestoneDroneBoost: float = 0.0
var milestoneMineBoost: float = 0.0
var milestoneSatelliteBoost: float = 0.0
var milestonePrestigeBoost: float = 0.0

# --- Audio Synthesizer ---
func play_synth_beep(frequency: float, duration: float) -> void:
	if is_muted:
		return
	var sample_rate := 22050.0
	var num_samples := int(duration * sample_rate)
	var data := PackedByteArray()
	data.resize(num_samples)
	for i in range(num_samples):
		var t := i / sample_rate
		var val := sin(2.0 * PI * frequency * t)
		# Quick attack-decay envelope to prevent clicking
		var envelope := 1.0
		if t < 0.01:
			envelope = t / 0.01
		elif t > duration - 0.02:
			envelope = (duration - t) / 0.02
		var sample := int(val * 127.0 * envelope * synth_volume) + 128
		data[i] = sample
	
	var stream := AudioStreamWAV.new()
	stream.data = data
	stream.format = AudioStreamWAV.FORMAT_8_BITS
	stream.mix_rate = int(sample_rate)
	
	var player := AudioStreamPlayer.new()
	player.stream = stream
	add_child(player)
	player.play()
	player.finished.connect(func(): player.queue_free())

# --- Godot Callbacks ---
func _ready() -> void:
	load_game()
	setup_visuals()
	update_mute_button_ui()
	if %VolumeSlider:
		%VolumeSlider.value = synth_volume
	update_ui()
	if not tutorial_shown:
		show_tutorial()
	nextAsteroidTime = randf_range(30.0, 70.0)
	solarFlareNextTime = randf_range(80.0, 150.0)
	wormholeNextTime = randf_range(110.0, 180.0)
	piratesNextTime = randf_range(140.0, 220.0)

	# Connect pirate clicking area
	%PirateClickOverlay.gui_input.connect(_on_pirate_click_overlay_input)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		save_game()

func _process(delta: float) -> void:
	# Calculate delta scale if Time Warp is active
	var speed_multiplier := 1.0
	if timeWarpActive:
		speed_multiplier = timeWarpSpeed
		timeWarpTimer -= delta
		if timeWarpTimer <= 0.0:
			timeWarpActive = false
			play_synth_beep(300, 0.4)
			_show_popup("Wurmloch geschlossen (Zeitverzerrung vorbei)", Vector2(500, 400), Color(0.3, 0.6, 1.0, 1.0))
	
	var scaled_delta = delta * speed_multiplier
	statTimePlayed += scaled_delta
	
	# Active Skill Timers & Cooldowns
	if overdriveActive:
		overdriveTimer -= scaled_delta
		if overdriveTimer <= 0.0:
			overdriveActive = false
			play_synth_beep(350, 0.2)
			_show_popup("Overdrive beendet", Vector2(500, 300), Color(1.0, 0.8, 0.2, 1.0))
			update_ui()
	if overdriveCooldown > 0.0:
		overdriveCooldown = max(0.0, overdriveCooldown - scaled_delta)
		
	if scannerCooldown > 0.0:
		scannerCooldown = max(0.0, scannerCooldown - scaled_delta)
		
	if anomalyActive:
		anomalyTimer -= scaled_delta
		if anomalyTimer <= 0.0:
			anomalyActive = false
			if not piratesActive and not wormholeActive:
				%PirateClickOverlay.visible = false
				
	if superchargeActive:
		superchargeTimer -= scaled_delta
		if superchargeTimer <= 0.0:
			superchargeActive = false
			play_synth_beep(350, 0.2)
			_show_popup("Supercharge beendet", Vector2(500, 300), Color(0.2, 0.8, 1.0, 1.0))
			update_production()
			update_ui()
	if superchargeCooldown > 0.0:
		superchargeCooldown = max(0.0, superchargeCooldown - scaled_delta)

	# SPS Production
	if scrapPerSecond > 0:
		var sps_gain := scrapPerSecond * scaled_delta
		scrapCount += sps_gain
		totalScrapEver += sps_gain
		statTotalScrapEver += sps_gain
		
	# Passively generate Data Disks from Satellites
	if dataDisksPerSecond > 0:
		var disks_gain := dataDisksPerSecond * scaled_delta
		dataDisks += disks_gain
		statDataDisksEarned += disks_gain
		
	update_ui()
	
	# Combo Decay Timer
	if comboCount > 0:
		comboTimer -= delta
		if comboTimer <= 0.0:
			comboCount = 0
			comboTimer = 0.0
		
	# Background scrolling effect
	update_background(scaled_delta)
	
	# Autosave Timer
	save_timer += delta
	if save_timer >= 15.0:
		save_game()
		set_save_status("Automatisch gespeichert")
		save_timer = 0.0
		
	if save_status_timer > 0.0:
		save_status_timer -= delta
		if save_status_timer <= 0.0:
			%SaveStatusLabel.text = ""
			
	# Golden Asteroid Spawning
	asteroidTimer += scaled_delta
	var asteroid_frequency_mult := 1.0 - (prestigeAsteroidScannerLevel * 0.15)
	if asteroidTimer >= (nextAsteroidTime * asteroid_frequency_mult):
		spawn_golden_asteroid()
		asteroidTimer = 0.0
		nextAsteroidTime = randf_range(50.0, 100.0)
		
	# Auto Collector Logic
	if prestigeAutoCollectorLevel > 0:
		autoCollectorTimer += scaled_delta
		var interval := 1.0 / float(prestigeAutoCollectorLevel * 2)
		if autoCollectorTimer >= interval:
			var clicks := int(autoCollectorTimer / interval)
			autoCollectorTimer = fmod(autoCollectorTimer, interval)
			auto_click(clicks)

	# Auto Builder Logic
	if prestigeAutoBuilderLevel > 0:
		autoBuilderTimer += scaled_delta
		var build_interval := 8.0 / float(prestigeAutoBuilderLevel)
		if autoBuilderTimer >= build_interval:
			autoBuilderTimer = 0.0
			run_auto_builder()

	# Decay shield flash timer
	if shieldFlashTimer > 0.0:
		shieldFlashTimer -= delta

	# --- Event Timers & Updates ---
	# 1. Solar Flare Update
	if solarFlareActive:
		solarFlareTimer -= scaled_delta
		%EventStatusLabel.text = "⚠️ SONNENSTURM: Drohnen +100%, Satelliten deakt.! (%ds)" % int(max(0, solarFlareTimer))
		%EventStatusLabel.self_modulate = Color(1.0, 0.4, 0.1, 0.8 + 0.2 * sin(Time.get_ticks_msec() / 100.0))
		if solarFlareTimer <= 0.0:
			solarFlareActive = false
			update_production()
			%EventStatusLabel.text = ""
			play_synth_beep(400, 0.3)
	else:
		solarFlareTimer += scaled_delta
		if solarFlareTimer >= solarFlareNextTime:
			trigger_solar_flare()

	# 2. Wormhole Update
	if wormholeActive:
		wormholeActiveTimer -= scaled_delta
		if wormholeActiveTimer <= 0.0:
			wormholeActive = false
			if not anomalyActive and not piratesActive:
				%PirateClickOverlay.visible = false
			play_synth_beep(200, 0.3)
	else:
		wormholeTimer += scaled_delta
		var wormhole_frequency_mult := max(0.5, 1.0 - (warpGateCount * 0.05))
		if wormholeTimer >= (wormholeNextTime * wormhole_frequency_mult):
			spawn_wormhole()

	# 3. Space Pirates Update
	if piratesActive:
		piratesTimer += scaled_delta
		if scrapCount > 0:
			var base_theft_rate = 0.02 if techShieldGeneratorLevel == 0 else 0.01
			var drain = max(1.0, scrapCount * base_theft_rate) * scaled_delta
			scrapCount = max(0.0, scrapCount - drain)
		
		piratePosition.x += sin(Time.get_ticks_msec() / 200.0) * 0.4
		piratePosition.y += cos(Time.get_ticks_msec() / 200.0) * 0.4
		
		if prestigeDefenseLaserLevel > 0:
			defenseLaserTimer += scaled_delta
			var laser_interval = 6.0 - (prestigeDefenseLaserLevel * 1.5)
			if defenseLaserTimer >= laser_interval:
				defenseLaserTimer = 0.0
				defenseLaserVisualTimer = 0.3
				damage_pirate(1)
				
		if defenseLaserVisualTimer > 0.0:
			defenseLaserVisualTimer -= delta
			
		%EventStatusLabel.text = "🚨 WELTRAUMPIRATEN DRAINIEREN SCHROTT! Klicke das rote Schiff!"
		%EventStatusLabel.self_modulate = Color(1.0, 0.2, 0.2, 1.0)
	else:
		piratesTimer += scaled_delta
		if piratesTimer >= piratesNextTime:
			spawn_pirates()

# --- Gameplay Functions ---
func auto_click(amount: int) -> void:
	var total_gain := 0.0
	for i in range(amount):
		statClicks += 1
		# Check for Critical Clicks
		var is_crit = randf() < (prestigeCritClickLevel * 0.05)
		# Apply Overdrive active skill multiplication (5x)
		var od_mult = 5.0 if overdriveActive else 1.0
		var click_gain := (clickPower * prestigeMultiplier * od_mult)
		if is_crit:
			click_gain *= 10.0
			statCritClicks += 1
			_show_popup("CRIT! +" + format_number(click_gain), %ScrapButton.global_position + Vector2(randf_range(-40, 40), randf_range(-40, -10)), Color(1.0, 0.4, 0.2, 1.0))
			play_synth_beep(880, 0.05)
		
		var magnet_bonus := (scrapPerSecond * (prestigeScrapMagnetLevel * 0.005))
		total_gain += click_gain + magnet_bonus
		
	scrapCount += total_gain
	totalScrapEver += total_gain
	statTotalScrapEver += total_gain
	update_ui()

# --- Combo System ---
func get_combo_multiplier() -> float:
	return float(COMBO_STEPS[clamp(comboCount, 0, COMBO_STEPS.size() - 1)])

func register_click_combo() -> void:
	comboTimer = COMBO_DECAY_TIME
	if comboCount < COMBO_STEPS.size() - 1:
		comboCount += 1
	if comboCount > maxComboReached:
		maxComboReached = comboCount

# --- Research Upgrade Cost Getters ---
func get_tech_ion_cost() -> int:
	return int(5 * pow(2.0, techIonEnginesLevel))

func get_tech_drilling_cost() -> int:
	return int(5 * pow(2.0, techDeepDrillingLevel))

func get_tech_overdrive_cost() -> int:
	return int(10 * pow(2.5, techActiveOverdriveLevel))

func get_tech_supercharge_cost() -> int:
	return int(15 * pow(2.5, techSpsSuperchargeLevel))

func get_tech_magnet_cost() -> int:
	return int(25 * pow(3.0, techAsteroidMagnetLevel))

# --- Building / Upgrade Cost Getters ---
func get_drone_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(10 * pow(1.15, droneCount) * discount)

func get_mine_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(100 * pow(1.2, mineCount) * discount)

func get_satellite_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(satelliteBaseCost * pow(1.25, satelliteCount) * discount)

func get_dyson_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(dysonBaseCost * pow(1.3, dysonCount) * discount)

func get_click_upgrade_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(clickUpgradeBaseCost * pow(clickUpgradeMultiplier, clickUpgradeLevel) * discount)

func get_drone_upgrade_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(droneUpgradeBaseCost * pow(droneUpgradeMultiplier, droneUpgradeLevel) * discount)

func get_mine_upgrade_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(mineUpgradeBaseCost * pow(mineUpgradeMultiplier, mineUpgradeLevel) * discount)

func get_satellite_upgrade_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(satelliteUpgradeBaseCost * pow(satelliteUpgradeMultiplier, satelliteUpgradeLevel) * discount)

func get_dyson_upgrade_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(dysonUpgradeBaseCost * pow(dysonUpgradeMultiplier, dysonUpgradeLevel) * discount)

func get_warp_gate_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(warpGateBaseCost * pow(1.35, warpGateCount) * discount)

func get_warp_gate_upgrade_cost() -> int:
	var discount := 1.0 - (prestigeCostReductionLevel * 0.04)
	return int(warpGateUpgradeBaseCost * pow(warpGateUpgradeMultiplier, warpGateUpgradeLevel) * discount)

# --- Prestige Shop Costs ---
func get_auto_collector_cost() -> int:
	return int(1 * pow(2, prestigeAutoCollectorLevel))

func get_cost_reduction_cost() -> int:
	return int(1 * pow(3, prestigeCostReductionLevel))

func get_scrap_magnet_cost() -> int:
	return int(2 * pow(2.5, prestigeScrapMagnetLevel))

func get_crit_click_cost() -> int:
	return int(2 * pow(2.2, prestigeCritClickLevel))

func get_asteroid_scanner_cost() -> int:
	return int(3 * pow(2.0, prestigeAsteroidScannerLevel))

func get_offline_compensator_cost() -> int:
	return int(2 * pow(2.0, prestigeOfflineCompensatorLevel))

func get_defense_laser_cost() -> int:
	return int(4 * pow(3.0, prestigeDefenseLaserLevel))

func get_research_booster_cost() -> int:
	return int(2 * pow(2.0, prestigeResearchBoosterLevel))

func get_auto_builder_cost() -> int:
	return int(3 * pow(2.5, prestigeAutoBuilderLevel))

func get_tech_shield_cost() -> int:
	return 20

# --- UI Layout & Updates ---
func setup_visuals() -> void:
	$Background.color = Color(0.02, 0.04, 0.1, 1.0)
	$Background2.modulate = Color(0.1, 0.18, 0.32, 0.3)
	$Background3.modulate = Color(0.18, 0.3, 0.45, 0.2)
	$TitleLabel.text = "Orbital Scrap"
	$TitleLabel.modulate = Color(0.9, 0.92, 1.0, 1.0)
	$InfoLabel.text = "Errichte eine gigantische orbitale Flotte, meistere Weltraumereignisse und erbe Prestige!"
	$InfoLabel.modulate = Color(0.75, 0.8, 0.92, 1.0)
	
	var buttons := [
		%ScrapButton, %BuyDroneButton, %BuyMineButton, %BuySatelliteButton, %BuyDysonButton, %BuyWarpGateButton,
		%ClickUpgradeButton, %DroneUpgradeButton, %BuyMineUpgradeButton, %BuySatelliteUpgradeButton, %BuyDysonUpgradeButton, %BuyWarpGateUpgradeButton,
		%PrestigeButton, %BuyAutoCollectorButton, %BuyCostReductionButton, %BuyScrapMagnetButton,
		%BuyCritClickButton, %BuyAsteroidScannerButton, %BuyOfflineCompensatorButton, %BuyDefenseLaserButton,
		%ConvertScrapButton, %BuyTechIonButton, %BuyTechDrillingButton, %BuyTechOverdriveButton, %BuyTechSuperchargeButton, %BuyTechMagnetButton,
		%BtnActivateOverdrive, %BtnActivateSupercharge, %MuteButton, %BuyResearchBoosterButton, %BuyTechShieldButton, %BtnScanOrbit,
		%BuyAutoBuilderButton
	]
	for button in buttons:
		button.self_modulate = Color(0.15, 0.32, 0.55, 1.0)
		button.add_theme_color_override("font_color", Color(0.95, 0.95, 1.0))
		button.add_theme_color_override("font_hover_color", Color(1.0, 1.0, 1.0))
		button.add_theme_color_override("font_pressed_color", Color(0.8, 0.9, 1.0))
		
	%HardResetButton.self_modulate = Color(0.75, 0.2, 0.2, 1.0)
	%HardResetButton.add_theme_color_override("font_color", Color(1.0, 1.0, 1.0))

func update_background(delta: float) -> void:
	$Background2.position.x = fmod($Background2.position.x + delta * 15.0, 800.0)
	$Background3.position.x = fmod($Background3.position.x + delta * 8.0, 800.0)
	$Background2.position.y = 80.0 + sin(Time.get_ticks_msec() / 600.0) * 8.0
	$Background3.position.y = 160.0 + cos(Time.get_ticks_msec() / 800.0) * 12.0

func update_ui() -> void:
	check_achievements()
	
	# Tab 1: Produktion
	%ScrapLabel.text = "Schrott: " + format_number(scrapCount)
	%SpsLabel.text = "Produktion: " + format_number(scrapPerSecond) + " /s"
	
	# Combo-Anzeige
	if %ComboLabel:
		if comboCount > 0:
			var combo_mult = COMBO_STEPS[comboCount]
			%ComboLabel.text = "⚡ COMBO x%d" % combo_mult
			var t = float(comboCount) / float(COMBO_STEPS.size() - 1)
			%ComboLabel.modulate = Color(1.0, 0.85, 0.2, 1.0).lerp(Color(1.0, 0.2, 0.9, 1.0), t)
			var scale_pulse = 1.0 + 0.05 * sin(Time.get_ticks_msec() / 100.0)
			%ComboLabel.scale = Vector2(scale_pulse, scale_pulse)
		else:
			%ComboLabel.text = ""
			%ComboLabel.scale = Vector2.ONE
	
	%DroneLabel.text = "Drohnen: " + str(droneCount) + " (Kosten: " + str(get_drone_cost()) + ")"
	%MineLabel.text = "Minen: " + str(mineCount) + " (Kosten: " + str(get_mine_cost()) + ")"
	%SatelliteLabel.text = "Satelliten: " + str(satelliteCount) + " (Kosten: " + str(get_satellite_cost()) + ")"
	%DysonLabel.text = "Dyson-Schwarm: " + str(dysonCount) + " (Kosten: " + str(get_dyson_cost()) + ")"
	%WarpGateLabel.text = "Warp-Tore: " + str(warpGateCount) + " (Kosten: " + str(get_warp_gate_cost()) + ")"
	
	# Tab 2: Verbesserungen
	%ClickUpgradeButton.text = "Klick-Upgrade kaufen (" + str(get_click_upgrade_cost()) + ")"
	%ClickUpgradeLabel.text = "Klick-Power: " + format_number(clickPower) + "x (Stufe " + str(clickUpgradeLevel) + ")"
	
	%DroneUpgradeButton.text = "Drohnen-Upgrade kaufen (" + str(get_drone_upgrade_cost()) + ")"
	%DroneUpgradeLabel.text = "Drohnen-Effizienz: " + format_number(droneProduction) + " /s pro Drohne (Stufe " + str(droneUpgradeLevel) + ")"
	
	%BuyMineUpgradeButton.text = "Minen-Upgrade kaufen (" + str(get_mine_upgrade_cost()) + ")"
	%MineUpgradeLabel.text = "Minen-Effizienz: " + format_number(mineProduction) + " /s pro Mine (Stufe " + str(mineUpgradeLevel) + ")"

	%BuySatelliteUpgradeButton.text = "Satelliten-Upgrade kaufen (" + str(get_satellite_upgrade_cost()) + ")"
	%SatelliteUpgradeLabel.text = "Satelliten-Effizienz: " + format_number(satelliteProduction) + " /s pro Satellit (Stufe " + str(satelliteUpgradeLevel) + ")"

	%BuyDysonUpgradeButton.text = "Dyson-Upgrade kaufen (" + str(get_dyson_upgrade_cost()) + ")"
	%DysonUpgradeLabel.text = "Dyson-Effizienz: " + format_number(dysonProduction) + " /s pro Dyson-Teil (Stufe " + str(dysonUpgradeLevel) + ")"
	
	%BuyWarpGateUpgradeButton.text = "Warp-Tor Upgrade kaufen (" + str(get_warp_gate_upgrade_cost()) + ")"
	%WarpGateUpgradeLabel.text = "Warp-Tor Effizienz: " + format_number(warpGateProduction) + " /s pro Tor (Stufe " + str(warpGateUpgradeLevel) + ")"
	
	# Tab 3: Prestige & Shop
	%PrestigeLabel.text = "Prestige-Punkte: " + str(prestigePoints) + " | Multiplier: " + format_number(prestigeMultiplier) + "x"
	
	var next_prestige_threshold := pow(totalPrestigePoints + 1, 2) * 1000.0
	var current_prestige_base := pow(totalPrestigePoints, 2) * 1000.0
	var needed_scrap := next_prestige_threshold - current_prestige_base
	var progress_value := clamp(totalScrapEver - current_prestige_base, 0.0, needed_scrap)
	%PrestigeProgressBar.max_value = needed_scrap
	%PrestigeProgressBar.value = progress_value
	%PrestigeProgressLabel.text = "Nächster Prestige-Punkt: " + format_number(progress_value) + "/" + format_number(needed_scrap)
	
	# Shop buttons
	%BuyAutoCollectorButton.text = "Auto-Sammler (" + str(get_auto_collector_cost()) + " PP)"
	%AutoCollectorLabel.text = "Auto-Sammler: Stufe " + str(prestigeAutoCollectorLevel) + " (Klicks: " + str(prestigeAutoCollectorLevel * 2) + "/s)"
	
	if prestigeCostReductionLevel >= 10:
		%BuyCostReductionButton.text = "Rabatt MAX"
		%BuyCostReductionButton.disabled = true
	else:
		%BuyCostReductionButton.text = "Rabatt (" + str(get_cost_reduction_cost()) + " PP)"
		%BuyCostReductionButton.disabled = prestigePoints < get_cost_reduction_cost()
	%CostReductionLabel.text = "Preisnachlass: " + str(prestigeCostReductionLevel * 4) + "% Rabatt (Stufe " + str(prestigeCostReductionLevel) + "/10)"
	
	%BuyScrapMagnetButton.text = "Schrott-Magnet (" + str(get_scrap_magnet_cost()) + " PP)"
	%ScrapMagnetLabel.text = "Schrott-Magnet: Stufe " + str(prestigeScrapMagnetLevel) + " (+" + str(prestigeScrapMagnetLevel * 0.5) + "% SPS zu Klicks)"

	# Shop Buttons
	%BuyCritClickButton.text = "Kritische Klicks (" + str(get_crit_click_cost()) + " PP)"
	%CritClickLabel.text = "Kritische Klicks: " + str(prestigeCritClickLevel * 5) + "% Chance auf 10x Gewinn"

	%BuyAsteroidScannerButton.text = "Asteroiden-Scanner (" + str(get_asteroid_scanner_cost()) + " PP)"
	%AsteroidScannerLabel.text = "Asteroiden-Scanner: Stufe " + str(prestigeAsteroidScannerLevel) + " (+15% Spawns, +20% Beute)"

	%BuyOfflineCompensatorButton.text = "Offline-Komp. (" + str(get_offline_compensator_cost()) + " PP)"
	%OfflineCompensatorLabel.text = "Offline-Effizienz: " + str(50 + prestigeOfflineCompensatorLevel * 15) + "% (Stufe " + str(prestigeOfflineCompensatorLevel) + ")"

	if prestigeDefenseLaserLevel >= 3:
		%BuyDefenseLaserButton.text = "Abwehrlaser MAX"
		%BuyDefenseLaserButton.disabled = true
	else:
		%BuyDefenseLaserButton.text = "Abwehrlaser (" + str(get_defense_laser_cost()) + " PP)"
		%BuyDefenseLaserButton.disabled = prestigePoints < get_defense_laser_cost()
	%DefenseLaserLabel.text = "Abwehrlaser: Stufe " + str(prestigeDefenseLaserLevel) + " (Auto-Schuss alle " + str(6.0 - prestigeDefenseLaserLevel * 1.5 if prestigeDefenseLaserLevel > 0 else 0) + "s)"

	%BuyResearchBoosterButton.text = "Forschungs-Booster (" + str(get_research_booster_cost()) + " PP)"
	%ResearchBoosterLabel.text = "Forschungs-Booster: Stufe " + str(prestigeResearchBoosterLevel) + " (+25% Satelliten-Disks)"
	%BuyResearchBoosterButton.disabled = prestigePoints < get_research_booster_cost()

	# --- Tab 5: Forschung & Tech-Baum ---
	%DataDisksLabel.text = "Daten-Disks: " + format_number(dataDisks)
	%DataDisksSpsLabel.text = "Forschungsrate: " + format_number(dataDisksPerSecond) + " Disks/s"

	%ConvertScrapButton.text = "Schrott umwandeln (Kosten: 10.000)"
	%ConvertScrapButton.disabled = scrapCount < 10000

	# Research buttons
	%BuyTechIonButton.text = "Erforschen (" + str(get_tech_ion_cost()) + " Disks)"
	%BuyTechIonButton.disabled = dataDisks < get_tech_ion_cost()
	%TechIonLabel.text = "Ionentriebwerke: Drohnen +50% SPS (Stufe " + str(techIonEnginesLevel) + ")"

	%BuyTechDrillingButton.text = "Erforschen (" + str(get_tech_drilling_cost()) + " Disks)"
	%BuyTechDrillingButton.disabled = dataDisks < get_tech_drilling_cost()
	%TechDrillingLabel.text = "Tiefenbohrung: Minen +50% SPS (Stufe " + str(techDeepDrillingLevel) + ")"

	%BuyTechOverdriveButton.text = "Erforschen (" + str(get_tech_overdrive_cost()) + " Disks)"
	%BuyTechOverdriveButton.disabled = dataDisks < get_tech_overdrive_cost()
	%TechOverdriveLabel.text = "Overdrive-Fähigkeit freischalten/verbessern (Stufe " + str(techActiveOverdriveLevel) + ")"

	%BuyTechSuperchargeButton.text = "Erforschen (" + str(get_tech_supercharge_cost()) + " Disks)"
	%BuyTechSuperchargeButton.disabled = dataDisks < get_tech_supercharge_cost()
	%TechSuperchargeLabel.text = "Supercharge-Fähigkeit freischalten/verbessern (Stufe " + str(techSpsSuperchargeLevel) + ")"

	if techAsteroidMagnetLevel >= 1:
		%BuyTechMagnetButton.text = "Ausmaxiert"
		%BuyTechMagnetButton.disabled = true
	else:
		%BuyTechMagnetButton.text = "Erforschen (" + str(get_tech_magnet_cost()) + " Disks)"
		%BuyTechMagnetButton.disabled = dataDisks < get_tech_magnet_cost()
	%TechMagnetLabel.text = "Asteroiden-Magnet: 35% Auto-Sammelchance (Stufe " + str(techAsteroidMagnetLevel) + "/1)"

	if techShieldGeneratorLevel >= 1:
		%BuyTechShieldButton.text = "Ausmaxiert"
		%BuyTechShieldButton.disabled = true
	else:
		%BuyTechShieldButton.text = "Erforschen (" + str(get_tech_shield_cost()) + " Disks)"
		%BuyTechShieldButton.disabled = dataDisks < get_tech_shield_cost()
	%TechShieldLabel.text = "Schild-Generator: Reduziert Piraten-Drain auf 1% (Stufe " + str(techShieldGeneratorLevel) + "/1)"

	# Cooldown Skill activation buttons
	if techActiveOverdriveLevel > 0:
		%BtnActivateOverdrive.visible = true
		if overdriveActive:
			%BtnActivateOverdrive.text = "AKTIV (%ds)" % int(overdriveTimer)
			%BtnActivateOverdrive.disabled = true
		elif overdriveCooldown > 0.0:
			%BtnActivateOverdrive.text = "COOLDOWN (%ds)" % int(overdriveCooldown)
			%BtnActivateOverdrive.disabled = true
		else:
			%BtnActivateOverdrive.text = "OVERDRIVE aktivieren (5x Klick-Power, 15s)"
			%BtnActivateOverdrive.disabled = false
	else:
		%BtnActivateOverdrive.visible = false

	if techSpsSuperchargeLevel > 0:
		%BtnActivateSupercharge.visible = true
		if superchargeActive:
			%BtnActivateSupercharge.text = "AKTIV (%ds)" % int(superchargeTimer)
			%BtnActivateSupercharge.disabled = true
		elif superchargeCooldown > 0.0:
			%BtnActivateSupercharge.text = "COOLDOWN (%ds)" % int(superchargeCooldown)
			%BtnActivateSupercharge.disabled = true
		else:
			%BtnActivateSupercharge.text = "SUPERCHARGE aktivieren (2x SPS, 30s)"
			%BtnActivateSupercharge.disabled = false
	else:
		%BtnActivateSupercharge.visible = false

	# Disabling production & upgrade buttons
	%BuyDroneButton.disabled = scrapCount < get_drone_cost()
	%BuyMineButton.disabled = scrapCount < get_mine_cost()
	%BuySatelliteButton.disabled = scrapCount < get_satellite_cost()
	%BuyDysonButton.disabled = scrapCount < get_dyson_cost()
	%BuyWarpGateButton.disabled = scrapCount < get_warp_gate_cost()

	%ClickUpgradeButton.disabled = scrapCount < get_click_upgrade_cost()
	%DroneUpgradeButton.disabled = scrapCount < get_drone_upgrade_cost()
	%BuyMineUpgradeButton.disabled = scrapCount < get_mine_upgrade_cost()
	%BuySatelliteUpgradeButton.disabled = scrapCount < get_satellite_upgrade_cost()
	%BuyDysonUpgradeButton.disabled = scrapCount < get_dyson_upgrade_cost()
	%BuyWarpGateUpgradeButton.disabled = scrapCount < get_warp_gate_upgrade_cost()
	
	if scannerCooldown > 0.0:
		%BtnScanOrbit.text = "SCANNER COOLDOWN (%ds)" % int(scannerCooldown)
		%BtnScanOrbit.disabled = true
	elif scrapCount < 500:
		%BtnScanOrbit.text = "Scanner (Kosten: 500)"
		%BtnScanOrbit.disabled = true
	else:
		%BtnScanOrbit.text = "Scanner starten (Kosten: 500)"
		%BtnScanOrbit.disabled = false
	
	# Disabling shop buttons
	%BuyAutoCollectorButton.disabled = prestigePoints < get_auto_collector_cost()
	%BuyScrapMagnetButton.disabled = prestigePoints < get_scrap_magnet_cost()
	%BuyCritClickButton.disabled = prestigePoints < get_crit_click_cost()
	%BuyAsteroidScannerButton.disabled = prestigePoints < get_asteroid_scanner_cost()
	%BuyOfflineCompensatorButton.disabled = prestigePoints < get_offline_compensator_cost()
	%BuyResearchBoosterButton.disabled = prestigePoints < get_research_booster_cost()
	if %BuyAutoBuilderButton:
		%BuyAutoBuilderButton.text = "Auto-Werft (" + str(get_auto_builder_cost()) + " PP)"
		%BuyAutoBuilderButton.disabled = prestigePoints < get_auto_builder_cost()
	if %AutoBuilderLabel:
		var interval_text = "%.1fs" % (8.0 / float(max(1, prestigeAutoBuilderLevel)))
		%AutoBuilderLabel.text = "Auto-Werft: Stufe " + str(prestigeAutoBuilderLevel) + " (alle " + interval_text + " kaufen)"
	
	var target_prestige := int(floor(sqrt(totalScrapEver / 1000.0)))
	var prestige_gain := target_prestige - totalPrestigePoints
	%PrestigeButton.disabled = prestige_gain <= 0
	
	# Tab 4: Stats
	%StatsLabel.text = "Detaillierte Statistiken:\n\n" + \
		"• Spielzeit: " + str(int(statTimePlayed)) + "s\n" + \
		"• Manuelle Klicks: " + str(statClicks) + "\n" + \
		"• Kritische Klicks: " + str(statCritClicks) + "\n" + \
		"• Gesamt gesammelter Schrott: " + format_number(statTotalScrapEver) + "\n" + \
		"• Generierte Daten-Disks: " + format_number(statDataDisksEarned) + "\n" + \
		"• Zertrümmerte Asteroiden: " + str(statAsteroidsClicked) + "\n" + \
		"• Piraten abgewehrt: " + str(statPiratesDestroyed) + "\n" + \
		"• Multiplikator: " + format_number(prestigeMultiplier) + "x"
		
	if save_status_timer <= 0.0:
		%SaveStatusLabel.text = ""
	update_achievements_ui()
	update_status_hud()

func format_number(value: float) -> String:
	if value < 0.0:
		return "-" + format_number(abs(value))
	if value < 1000000.0:
		var rounded := snapped(value, 0.01)
		if abs(rounded - round(rounded)) < 0.0001:
			return str(int(round(rounded)))
		return str(rounded)
	
	var suffixes := ["M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
	var exp_idx := int(floor(log(value) / log(1000.0))) - 2
	if exp_idx < 0:
		exp_idx = 0
	if exp_idx >= suffixes.size():
		exp_idx = suffixes.size() - 1
	var num := value / pow(1000.0, exp_idx + 2)
	return "%.2f %s" % [num, suffixes[exp_idx]]

func check_achievements() -> void:
	if scrapCount >= 100 and not achievements["first_100"]["unlocked"]:
		_unlock_achievement("first_100")
	if droneCount >= 10 and not achievements["ten_drones"]["unlocked"]:
		_unlock_achievement("ten_drones")
	if scrapPerSecond >= 100 and not achievements["hundred_sps"]["unlocked"]:
		_unlock_achievement("hundred_sps")
	if mineCount >= 1 and not achievements["first_mine"]["unlocked"]:
		_unlock_achievement("first_mine")
	if totalPrestigePoints >= 1 and not achievements["prestige_1"]["unlocked"]:
		_unlock_achievement("prestige_1")
	if satelliteCount >= 1 and not achievements["first_satellite"]["unlocked"]:
		_unlock_achievement("first_satellite")
	if dysonCount >= 1 and not achievements["first_dyson"]["unlocked"]:
		_unlock_achievement("first_dyson")
	if statPiratesDestroyed >= 1 and not achievements["pirate_slayer"]["unlocked"]:
		_unlock_achievement("pirate_slayer")
	if (techIonEnginesLevel + techDeepDrillingLevel + techActiveOverdriveLevel + techSpsSuperchargeLevel) >= 1 and not achievements["first_tech"]["unlocked"]:
		_unlock_achievement("first_tech")
	# Neue Achievements
	if warpGateCount >= 1 and not achievements["first_warpgate"]["unlocked"]:
		_unlock_achievement("first_warpgate")
	if droneCount >= 50 and not achievements["mega_fleet"]["unlocked"]:
		_unlock_achievement("mega_fleet")
	if statTotalScrapEver >= 1000000 and not achievements["scrap_million"]["unlocked"]:
		_unlock_achievement("scrap_million")
	if maxComboReached >= 4 and not achievements["combo_master"]["unlocked"]:
		_unlock_achievement("combo_master")
	if totalPrestigePoints >= 5 and not achievements["prestige_vet"]["unlocked"]:
		_unlock_achievement("prestige_vet")
	if scrapPerSecond >= 1000 and not achievements["speed_runner"]["unlocked"]:
		_unlock_achievement("speed_runner")

func _unlock_achievement(key: String) -> void:
	achievements[key]["unlocked"] = true
	play_synth_beep(880, 0.1)
	play_synth_beep(1320, 0.2)
	_show_popup("★ Erfolg: " + achievements[key]["name"] + " ★", Vector2(400, 200), Color(1.0, 0.85, 0.2, 1.0))

func update_achievements_ui() -> void:
	if not %AchievementsGrid:
		return
	for child in %AchievementsGrid.get_children():
		child.queue_free()
	
	# Current-Value-Map fuer Fortschrittsbalken
	var current_values: Dictionary = {
		"scrap": scrapCount,
		"drones": droneCount,
		"mines": mineCount,
		"satellites": satelliteCount,
		"dyson": dysonCount,
		"warpgates": warpGateCount,
		"sps": scrapPerSecond,
		"prestige": totalPrestigePoints,
		"pirates": statPiratesDestroyed,
		"techs": techIonEnginesLevel + techDeepDrillingLevel + techActiveOverdriveLevel + techSpsSuperchargeLevel,
		"total_scrap": statTotalScrapEver,
		"max_combo": maxComboReached,
	}
	
	for key in achievements.keys():
		var entry: Dictionary = achievements[key]
		var is_unlocked: bool = bool(entry["unlocked"])
		var goal: float = float(entry["goal"])
		var current_key: String = entry.get("current_key", "")
		var current_val: float = current_values.get(current_key, 0.0)
		
		var panel = PanelContainer.new()
		panel.custom_minimum_size = Vector2(280, 70)
		
		var margin = MarginContainer.new()
		margin.add_theme_constant_override("margin_left", 8)
		margin.add_theme_constant_override("margin_top", 6)
		margin.add_theme_constant_override("margin_right", 8)
		margin.add_theme_constant_override("margin_bottom", 6)
		panel.add_child(margin)
		
		var vbox = VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 2)
		margin.add_child(vbox)
		
		var title = Label.new()
		title.text = ("★ " if is_unlocked else "☆ ") + entry["name"]
		title.add_theme_font_size_override("font_size", 14)
		if is_unlocked:
			title.modulate = Color(1.0, 0.85, 0.2, 1.0)
		else:
			title.modulate = Color(0.6, 0.6, 0.7, 1.0)
		vbox.add_child(title)
		
		var desc_lbl = Label.new()
		desc_lbl.text = entry.get("desc", "Ziel: " + format_number(goal))
		desc_lbl.add_theme_font_size_override("font_size", 11)
		desc_lbl.modulate = Color(0.7, 0.7, 0.8, 1.0) if is_unlocked else Color(0.4, 0.4, 0.5, 1.0)
		vbox.add_child(desc_lbl)
		
		# Fortschrittsbalken (nur wenn noch nicht freigeschaltet oder goal > 1)
		if not is_unlocked and goal > 1:
			var progress = ProgressBar.new()
			progress.custom_minimum_size = Vector2(0, 8)
			progress.max_value = goal
			progress.value = clamp(current_val, 0, goal)
			progress.show_percentage = false
			vbox.add_child(progress)
		
		var style = StyleBoxFlat.new()
		if is_unlocked:
			style.bg_color = Color(0.1, 0.18, 0.32, 0.8)
			style.border_color = Color(1.0, 0.85, 0.2, 0.6)
			style.border_width_left = 2
			style.border_width_top = 2
			style.border_width_right = 2
			style.border_width_bottom = 2
		else:
			style.bg_color = Color(0.04, 0.06, 0.12, 0.7)
			style.border_color = Color(0.2, 0.2, 0.3, 0.4)
			style.border_width_left = 1
			style.border_width_top = 1
			style.border_width_right = 1
			style.border_width_bottom = 1
		style.corner_radius_top_left = 5
		style.corner_radius_top_right = 5
		style.corner_radius_bottom_left = 5
		style.corner_radius_bottom_right = 5
		panel.add_theme_stylebox_override("panel", style)
		
		%AchievementsGrid.add_child(panel)

func update_production() -> void:
	var drone_factor = 2.0 if solarFlareActive else 1.0
	var satellite_factor = 0.0 if solarFlareActive else 1.0
	
	# Apply Research Lab passive buffs (+50% per level)
	var drone_tech_boost = 1.0 + (techIonEnginesLevel * 0.5)
	var mine_tech_boost = 1.0 + (techDeepDrillingLevel * 0.5)
	
	var base_sps = (droneCount * droneProduction * drone_factor * drone_tech_boost) + \
				   (mineCount * mineProduction * mine_tech_boost) + \
				   (satelliteCount * satelliteProduction * satellite_factor) + \
				   (dysonCount * dysonProduction) + \
				   (warpGateCount * warpGateProduction)
				
	# Apply active supercharge skill (2x boost)
	var sc_factor = 2.0 if superchargeActive else 1.0
				
	scrapPerSecond = base_sps * prestigeMultiplier * sc_factor
	
	# Calculate passive Data Disks generation rate: 0.02 per satellite per second
	var disk_mult = 1.0 + (prestigeResearchBoosterLevel * 0.25)
	dataDisksPerSecond = satelliteCount * 0.02 * disk_mult

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
	label.size = Vector2(250, 40)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 18)
	$PopupLayer.add_child(label)
	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(label, "position:y", label.position.y - 60, 0.8)
	tween.tween_property(label, "modulate:a", 0.0, 0.8)
	tween.tween_property(label, "scale", Vector2(1.15, 1.15), 0.2)
	tween.tween_property(label, "scale", Vector2(1.0, 1.0), 0.6)
	await tween.finished
	label.queue_free()

func set_save_status(message: String) -> void:
	%SaveStatusLabel.text = message
	save_status_timer = 2.0

func show_tutorial() -> void:
	tutorial_shown = true
	var panel := ColorRect.new()
	panel.color = Color(0.04, 0.08, 0.16, 0.95)
	panel.size = Vector2(500, 280)
	panel.position = Vector2(100, 200)
	panel.set_name("TutorialPanel")
	$PopupLayer.add_child(panel)
	
	var title := Label.new()
	title.text = "Willkommen bei Orbital Scrap!"
	title.position = Vector2(20, 20)
	title.add_theme_font_size_override("font_size", 24)
	panel.add_child(title)
	
	var text := Label.new()
	text.text = "1. Klicke auf den Sammelbutton, um Schrott zu bekommen.\n2. Baue Drohnen, Minen, Satelliten & Dyson-Komponenten im Orbit.\n3. Kaufe Upgrades für schnellere Produktion.\n4. Schütze deinen Schrott vor Weltraumereignissen wie Sonnenstürmen, Piraten und Wurmlöchern.\n5. Wandle Schrott um oder nutze Satelliten für Forschung (Daten-Disks), um mächtige neue Techs und Cooldown-Fähigkeiten freizuschalten!"
	text.position = Vector2(20, 70)
	text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.size = Vector2(460, 150)
	panel.add_child(text)
	
	var button := Button.new()
	button.text = "Bereit zum Sammeln"
	button.position = Vector2(180, 230)
	button.pressed.connect(func(): panel.queue_free())
	panel.add_child(button)

# --- Active Events Triggers ---
func trigger_solar_flare() -> void:
	solarFlareActive = true
	solarFlareTimer = solarFlareDuration
	update_production()
	play_synth_beep(220, 0.5)
	play_synth_beep(180, 0.5)
	_show_popup("⚠️ Warnung: Sonnensturm detektiert!", Vector2(500, 300), Color(1.0, 0.3, 0.1, 1.0))
	solarFlareNextTime = randf_range(120.0, 200.0)

func spawn_wormhole() -> void:
	wormholeActive = true
	wormholeTimer = 0.0
	wormholeActiveTimer = 15.0
	wormholePosition = Vector2(700 + randf_range(80, 320), 200 + randf_range(50, 450))
	
	%PirateClickOverlay.visible = true
	play_synth_beep(523.25, 0.4)
	_show_popup("🌀 Wurmloch-Anomalie gesichtet!", wormholePosition - Vector2(100, 50), Color(0.3, 0.6, 1.0, 1.0))
	wormholeNextTime = randf_range(160.0, 240.0)

func spawn_pirates() -> void:
	piratesActive = true
	piratesTimer = 0.0
	pirateHealth = 5
	piratePosition = Vector2(700 + randf_range(80, 320), 200 + randf_range(50, 450))
	defenseLaserTimer = 0.0
	
	%PirateClickOverlay.visible = true
	play_synth_beep(150, 0.3)
	play_synth_beep(100, 0.3)
	_show_popup("🚨 Piratenangriff im Orbit!", piratePosition - Vector2(100, 50), Color(1.0, 0.2, 0.2, 1.0))
	piratesNextTime = randf_range(200.0, 320.0)

func _on_pirate_click_overlay_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.is_pressed() and event.button_index == MOUSE_BUTTON_LEFT:
		var click_pos = event.position
		
		# Check click distance to wormhole
		if wormholeActive and click_pos.distance_to(wormholePosition) < 30.0:
			trigger_time_warp()
			return
			
		# Check click distance to anomaly
		if anomalyActive and click_pos.distance_to(anomalyPosition) < 30.0:
			collect_anomaly()
			return
			
		# Check click distance to pirates
		if piratesActive and click_pos.distance_to(piratePosition) < 35.0:
			damage_pirate(1)
			play_synth_beep(600, 0.08)

func damage_pirate(amount: int) -> void:
	pirateHealth -= amount
	_show_popup("TREFFER!", piratePosition + Vector2(randf_range(-20, 20), -20), Color(1.0, 0.5, 0.2, 1.0))
	if pirateHealth <= 0:
		piratesActive = false
		%EventStatusLabel.text = ""
		statPiratesDestroyed += 1
		# Reward scrap
		var reward = max(100.0, totalScrapEver * 0.12) * prestigeMultiplier
		scrapCount += reward
		totalScrapEver += reward
		statTotalScrapEver += reward
		play_synth_beep(880, 0.1)
		play_synth_beep(1000, 0.1)
		_show_popup("Piraten zerstört! +" + format_number(reward) + " Schrott", piratePosition, Color(0.2, 0.9, 0.4, 1.0))
		if not wormholeActive:
			%PirateClickOverlay.visible = false

func trigger_time_warp() -> void:
	wormholeActive = false
	timeWarpActive = true
	timeWarpTimer = timeWarpDuration
	play_synth_beep(1046.50, 0.5)
	_show_popup("ZEITWARP: 3x Spielgeschwindigkeit!", Vector2(500, 300), Color(0.3, 0.7, 1.0, 1.0))
	if not piratesActive:
		%PirateClickOverlay.visible = false

func run_auto_builder() -> void:
	# Try to buy the cheapest building the player can currently afford
	var candidates: Array = []
	if scrapCount >= get_drone_cost():
		candidates.append({"cost": get_drone_cost(), "fn": "_on_buy_drone_button_pressed"})
	if scrapCount >= get_mine_cost():
		candidates.append({"cost": get_mine_cost(), "fn": "_on_buy_mine_button_pressed"})
	if scrapCount >= get_satellite_cost():
		candidates.append({"cost": get_satellite_cost(), "fn": "_on_buy_satellite_button_pressed"})
	if scrapCount >= get_dyson_cost():
		candidates.append({"cost": get_dyson_cost(), "fn": "_on_buy_dyson_button_pressed"})
	if scrapCount >= get_warp_gate_cost():
		candidates.append({"cost": get_warp_gate_cost(), "fn": "_on_buy_warp_gate_button_pressed"})
	if candidates.is_empty():
		return
	# Sort by cheapest and pick it
	candidates.sort_custom(func(a, b): return a["cost"] < b["cost"])
	call(candidates[0]["fn"])
	_show_popup("🤖 Auto-Werft gebaut!", Vector2(700, 400), Color(0.7, 1.0, 0.4, 1.0))

func update_status_hud() -> void:
	var container = get_node_or_null("%StatusEffectsContainer")
	if not container:
		return
	for child in container.get_children():
		child.queue_free()
	
	var effects: Array = []
	
	if overdriveActive:
		effects.append({"text": "🚀 Overdrive", "timer": overdriveTimer, "color": Color(1.0, 0.8, 0.2, 1.0)})
	if overdriveCooldown > 0.0:
		effects.append({"text": "Overdrive CD", "timer": overdriveCooldown, "color": Color(0.5, 0.4, 0.1, 1.0)})
	if superchargeActive:
		effects.append({"text": "⚡ Supercharge", "timer": superchargeTimer, "color": Color(0.2, 0.8, 1.0, 1.0)})
	if superchargeCooldown > 0.0:
		effects.append({"text": "Supercharge CD", "timer": superchargeCooldown, "color": Color(0.1, 0.4, 0.5, 1.0)})
	if timeWarpActive:
		effects.append({"text": "🌀 Zeitwarp 3x", "timer": timeWarpTimer, "color": Color(0.3, 0.7, 1.0, 1.0)})
	if solarFlareActive:
		effects.append({"text": "☀️ Sonnensturm", "timer": solarFlareTimer, "color": Color(1.0, 0.4, 0.1, 1.0)})
	if piratesActive:
		effects.append({"text": "🚨 Piraten!", "timer": -1.0, "color": Color(1.0, 0.2, 0.2, 1.0)})
	if anomalyActive:
		effects.append({"text": "🛰️ Anomalie", "timer": anomalyTimer, "color": Color(0.2, 0.95, 0.45, 1.0)})
	if scannerCooldown > 0.0:
		effects.append({"text": "Scanner CD", "timer": scannerCooldown, "color": Color(0.2, 0.5, 0.3, 1.0)})
	
	for effect in effects:
		var label = Label.new()
		var timer_str = ""
		if effect["timer"] >= 0.0:
			timer_str = " (%ds)" % int(effect["timer"])
		label.text = effect["text"] + timer_str
		label.modulate = effect["color"]
		label.add_theme_font_size_override("font_size", 13)
		container.add_child(label)

func _on_help_button_pressed() -> void:
	var panel := ColorRect.new()
	panel.color = Color(0.04, 0.08, 0.18, 0.97)
	panel.size = Vector2(480, 360)
	panel.position = Vector2(160, 180)
	panel.set_name("HelpPanel")
	$PopupLayer.add_child(panel)
	
	var title := Label.new()
	title.text = "⌨️ Tastatur-Kurzbefehle"
	title.position = Vector2(20, 16)
	title.add_theme_font_size_override("font_size", 20)
	title.modulate = Color(0.9, 0.92, 1.0)
	panel.add_child(title)
	
	var text := Label.new()
	text.text = """
Leertaste  →  Schrott sammeln
D          →  Drohne kaufen
M          →  Mine kaufen
S          →  Satellit kaufen
Y          →  Dyson-Teil kaufen
P          →  Prestige starten

C          →  Klick-Upgrade kaufen
U          →  Drohnen-Upgrade
N          →  Minen-Upgrade
I          →  Satelliten-Upgrade
O          →  Dyson-Upgrade

Orbital-Klicks:
• Wurmloch-Anomalie → Zeitwarp aktivieren
• Piraten klicken → Schiff beschädigen
• Grüne Anomalie → Ressource einsammeln"""
	text.position = Vector2(20, 50)
	text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.size = Vector2(440, 280)
	text.add_theme_font_size_override("font_size", 14)
	panel.add_child(text)
	
	var button := Button.new()
	button.text = "Schließen  ✕"
	button.position = Vector2(170, 318)
	button.custom_minimum_size = Vector2(140, 36)
	button.pressed.connect(func(): panel.queue_free())
	panel.add_child(button)

# --- Active Skills Activations ---
func _on_activate_overdrive_pressed() -> void:
	if techActiveOverdriveLevel > 0 and not overdriveActive and overdriveCooldown <= 0.0:
		overdriveActive = true
		overdriveTimer = OVERDRIVE_DURATION
		overdriveCooldown = OVERDRIVE_COOLDOWN_MAX
		play_synth_beep(880, 0.2)
		play_synth_beep(987.77, 0.3)
		_show_popup("🚀 OVERDRIVE AKTIVIERT: 5x Klick-Power!", Vector2(500, 300), Color(1.0, 0.8, 0.2, 1.0))
		update_ui()

func _on_activate_supercharge_pressed() -> void:
	if techSpsSuperchargeLevel > 0 and not superchargeActive and superchargeCooldown <= 0.0:
		superchargeActive = true
		superchargeTimer = SUPERCHARGE_DURATION
		superchargeCooldown = SUPERCHARGE_COOLDOWN_MAX
		play_synth_beep(659.25, 0.2)
		play_synth_beep(783.99, 0.3)
		_show_popup("⚡ SUPERCHARGE AKTIVIERT: 2x SPS!", Vector2(500, 300), Color(0.2, 0.8, 1.0, 1.0))
		update_production()
		update_ui()

# --- Asteroid Event ---
func spawn_golden_asteroid() -> void:
	var asteroid := Button.new()
	asteroid.text = "☄️ Goldener Asteroid!"
	asteroid.self_modulate = Color(1.0, 0.85, 0.2, 1.0)
	var start_y := randf_range(150.0, 650.0)
	var end_y := randf_range(150.0, 650.0)
	asteroid.position = Vector2(700, start_y)
	$PopupLayer.add_child(asteroid)
	
	var asteroid_clicked = func():
		if is_instance_valid(asteroid):
			statAsteroidsClicked += 1
			var base_pct = 0.08 + (prestigeAsteroidScannerLevel * 0.02)
			var reward := max(50.0, totalScrapEver * base_pct) * prestigeMultiplier
			scrapCount += reward
			totalScrapEver += reward
			statTotalScrapEver += reward
			play_synth_beep(880, 0.08)
			play_synth_beep(1320, 0.15)
			trigger_debris(asteroid.global_position, Color(1.0, 0.85, 0.2))
			_show_popup("+" + format_number(reward) + " Schrott (Asteroid!)", asteroid.global_position, Color(1.0, 0.85, 0.2, 1.0))
			asteroid.queue_free()
			
	asteroid.pressed.connect(asteroid_clicked)
	
	# Check Auto-Asteroid Magnet (35% chance to click automatically after 1.5s)
	if techAsteroidMagnetLevel > 0 and randf() < 0.35:
		get_tree().create_timer(1.5).timeout.connect(func():
			if is_instance_valid(asteroid):
				_show_popup("Magnet angezogen!", asteroid.global_position + Vector2(0, -35), Color(0.85, 0.45, 0.95, 1.0))
				asteroid_clicked.call()
		)
	
	var tween := create_tween()
	tween.tween_property(asteroid, "position", Vector2(1150, end_y), 6.5)
	tween.finished.connect(func():
		if is_instance_valid(asteroid):
			asteroid.queue_free()
	)

# --- Button Pressed Signals ---
func _on_scrap_button_pressed() -> void:
	statClicks += 1
	var is_crit = randf() < (prestigeCritClickLevel * 0.05)
	var od_mult = 5.0 if overdriveActive else 1.0
	var prev_combo = comboCount
	register_click_combo()
	var combo_mult := get_combo_multiplier()
	var click_gain := clickPower * prestigeMultiplier * od_mult * combo_mult
	if is_crit:
		click_gain *= 10.0
		statCritClicks += 1
		play_synth_beep(880, 0.05)
		_show_popup("CRIT! +" + format_number(click_gain), %ScrapButton.global_position + Vector2(randf_range(-40, 40), randf_range(-40, -10)), Color(1.0, 0.4, 0.2, 1.0))
	else:
		var base_freq = 440.0 + comboCount * 80.0
		play_synth_beep(base_freq, 0.06)
		trigger_debris(%ScrapButton.global_position + Vector2(125, 25), Color(1.0, 0.9, 0.2))
		_show_popup("+" + format_number(click_gain), %ScrapButton.global_position + Vector2(20, -20), Color(1.0, 0.9, 0.2, 1.0))
	
	# Zeige Combo-Aufstieg
	if comboCount > prev_combo and comboCount > 0:
		var combo_color = Color(1.0, 0.85, 0.2, 1.0).lerp(Color(1.0, 0.3, 0.9, 1.0), comboCount / 4.0)
		_show_popup("COMBO x" + str(COMBO_STEPS[comboCount]) + "!", %ScrapButton.global_position + Vector2(120, -50), combo_color)
		
	var magnet_bonus := scrapPerSecond * (prestigeScrapMagnetLevel * 0.005)
	var total_gain := click_gain + magnet_bonus
	
	scrapCount += total_gain
	totalScrapEver += total_gain
	statTotalScrapEver += total_gain
	
	_animate_ui_feedback(%ScrapButton)
	$ClickParticles.position = %ScrapButton.global_position + Vector2(125, 25)
	$ClickParticles.emitting = true
	update_ui()

# --- Purchase Buildings ---
func _on_buy_drone_button_pressed() -> void:
	var cost := get_drone_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		droneCount += 1
		update_production()
		_animate_ui_feedback(%BuyDroneButton)
		play_synth_beep(587.33, 0.1)
		_show_popup("Drohne +1", %BuyDroneButton.global_position + Vector2(20, -20), Color(0.2, 0.8, 1.0, 1.0))
		update_ui()

func _on_buy_mine_button_pressed() -> void:
	var cost := get_mine_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		mineCount += 1
		update_production()
		_animate_ui_feedback(%BuyMineButton)
		play_synth_beep(587.33, 0.1)
		_show_popup("Mine +1", %BuyMineButton.global_position + Vector2(20, -20), Color(0.4, 0.95, 0.5, 1.0))
		update_ui()

func _on_buy_satellite_button_pressed() -> void:
	var cost := get_satellite_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		satelliteCount += 1
		update_production()
		_animate_ui_feedback(%BuySatelliteButton)
		play_synth_beep(659.25, 0.1)
		_show_popup("Satellit +1", %BuySatelliteButton.global_position + Vector2(20, -20), Color(0.95, 0.75, 0.25, 1.0))
		update_ui()

func _on_buy_dyson_button_pressed() -> void:
	var cost := get_dyson_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		dysonCount += 1
		update_production()
		_animate_ui_feedback(%BuyDysonButton)
		play_synth_beep(783.99, 0.12)
		_show_popup("Dyson-Teil +1", %BuyDysonButton.global_position + Vector2(20, -20), Color(1.0, 0.85, 0.2, 1.0))
		update_ui()

func _on_buy_warp_gate_button_pressed() -> void:
	var cost := get_warp_gate_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		warpGateCount += 1
		update_production()
		_animate_ui_feedback(%BuyWarpGateButton)
		play_synth_beep(880, 0.15)
		_show_popup("Warp-Tor +1", %BuyWarpGateButton.global_position + Vector2(20, -20), Color(0.85, 0.45, 0.95, 1.0))
		update_ui()

# --- Purchase Upgrades ---
func _on_click_upgrade_button_pressed() -> void:
	var cost := get_click_upgrade_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		clickUpgradeLevel += 1
		clickPower *= 1.5
		_animate_ui_feedback(%ClickUpgradeButton)
		play_synth_beep(587.33, 0.1)
		_show_popup("Klick-Power x1.5", %ClickUpgradeButton.global_position + Vector2(20, -20), Color(1.0, 0.6, 0.2, 1.0))
		update_ui()

func _on_drone_upgrade_button_pressed() -> void:
	var cost := get_drone_upgrade_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		droneUpgradeLevel += 1
		droneProduction += 0.2
		update_production()
		_animate_ui_feedback(%DroneUpgradeButton)
		play_synth_beep(587.33, 0.1)
		_show_popup("Drohnen +0.2 SPS", %DroneUpgradeButton.global_position + Vector2(20, -20), Color(0.7, 0.5, 1.0, 1.0))
		update_ui()

func _on_buy_mine_upgrade_button_pressed() -> void:
	var cost := get_mine_upgrade_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		mineUpgradeLevel += 1
		mineProduction += 2.0
		update_production()
		_animate_ui_feedback(%BuyMineUpgradeButton)
		play_synth_beep(587.33, 0.1)
		_show_popup("Minen +2.0 SPS", %BuyMineUpgradeButton.global_position + Vector2(20, -20), Color(0.7, 0.5, 1.0, 1.0))
		update_ui()

func _on_buy_satellite_upgrade_button_pressed() -> void:
	var cost := get_satellite_upgrade_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		satelliteUpgradeLevel += 1
		satelliteProduction += 15.0
		update_production()
		_animate_ui_feedback(%BuySatelliteUpgradeButton)
		play_synth_beep(659.25, 0.1)
		_show_popup("Satelliten +15 SPS", %BuySatelliteUpgradeButton.global_position + Vector2(20, -20), Color(0.7, 0.5, 1.0, 1.0))
		update_ui()

func _on_buy_dyson_upgrade_button_pressed() -> void:
	var cost := get_dyson_upgrade_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		dysonUpgradeLevel += 1
		dysonProduction += 250.0
		update_production()
		_animate_ui_feedback(%BuyDysonUpgradeButton)
		play_synth_beep(783.99, 0.1)
		_show_popup("Dyson +250 SPS", %BuyDysonUpgradeButton.global_position + Vector2(20, -20), Color(0.7, 0.5, 1.0, 1.0))
		update_ui()

func _on_buy_warp_gate_upgrade_button_pressed() -> void:
	var cost := get_warp_gate_upgrade_cost()
	if scrapCount >= cost:
		scrapCount -= cost
		warpGateUpgradeLevel += 1
		warpGateProduction += 1500.0
		update_production()
		_animate_ui_feedback(%BuyWarpGateUpgradeButton)
		play_synth_beep(880, 0.15)
		_show_popup("Warp-Tor +1500 SPS", %BuyWarpGateUpgradeButton.global_position + Vector2(20, -20), Color(0.7, 0.5, 1.0, 1.0))
		update_ui()

# --- Research Button Actions ---
func _on_convert_scrap_button_pressed() -> void:
	if scrapCount >= 10000:
		scrapCount -= 10000
		dataDisks += 1.0
		statDataDisksEarned += 1.0
		_animate_ui_feedback(%ConvertScrapButton)
		play_synth_beep(700, 0.12)
		_show_popup("Daten-Disk +1", %ConvertScrapButton.global_position + Vector2(20, -20), Color(0.7, 0.3, 1.0, 1.0))
		update_production()
		update_ui()

func _on_buy_tech_ion_pressed() -> void:
	var cost := get_tech_ion_cost()
	if dataDisks >= cost:
		dataDisks -= cost
		techIonEnginesLevel += 1
		_animate_ui_feedback(%BuyTechIonButton)
		play_synth_beep(880, 0.15)
		_show_popup("Ionentriebwerke Erforscht!", %BuyTechIonButton.global_position + Vector2(20, -20), Color(0.7, 0.3, 1.0, 1.0))
		update_production()
		update_ui()

func _on_buy_tech_drilling_pressed() -> void:
	var cost := get_tech_drilling_cost()
	if dataDisks >= cost:
		dataDisks -= cost
		techDeepDrillingLevel += 1
		_animate_ui_feedback(%BuyTechDrillingButton)
		play_synth_beep(880, 0.15)
		_show_popup("Tiefenbohrung Erforscht!", %BuyTechDrillingButton.global_position + Vector2(20, -20), Color(0.7, 0.3, 1.0, 1.0))
		update_production()
		update_ui()

func _on_buy_tech_overdrive_pressed() -> void:
	var cost := get_tech_overdrive_cost()
	if dataDisks >= cost:
		dataDisks -= cost
		techActiveOverdriveLevel += 1
		_animate_ui_feedback(%BuyTechOverdriveButton)
		play_synth_beep(880, 0.15)
		_show_popup("Overdrive Verbessert!", %BuyTechOverdriveButton.global_position + Vector2(20, -20), Color(0.7, 0.3, 1.0, 1.0))
		update_ui()

func _on_buy_tech_supercharge_pressed() -> void:
	var cost := get_tech_supercharge_cost()
	if dataDisks >= cost:
		dataDisks -= cost
		techSpsSuperchargeLevel += 1
		_animate_ui_feedback(%BuyTechSuperchargeButton)
		play_synth_beep(880, 0.15)
		_show_popup("Supercharge Verbessert!", %BuyTechSuperchargeButton.global_position + Vector2(20, -20), Color(0.7, 0.3, 1.0, 1.0))
		update_ui()

func _on_buy_tech_magnet_pressed() -> void:
	var cost := get_tech_magnet_cost()
	if dataDisks >= cost and techAsteroidMagnetLevel < 1:
		dataDisks -= cost
		techAsteroidMagnetLevel = 1
		_animate_ui_feedback(%BuyTechMagnetButton)
		play_synth_beep(880, 0.15)
		_show_popup("Asteroiden-Magnet Erforscht!", %BuyTechMagnetButton.global_position + Vector2(20, -20), Color(0.7, 0.3, 1.0, 1.0))
		update_ui()

# --- Prestige Shop Buttons ---
func _on_buy_auto_collector_button_pressed() -> void:
	var cost := get_auto_collector_cost()
	if prestigePoints >= cost:
		prestigePoints -= cost
		prestigeAutoCollectorLevel += 1
		_animate_ui_feedback(%BuyAutoCollectorButton)
		play_synth_beep(880, 0.15)
		_show_popup("Auto-Sammler Stufe +" + str(prestigeAutoCollectorLevel), %BuyAutoCollectorButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_ui()

func _on_buy_cost_reduction_button_pressed() -> void:
	var cost := get_cost_reduction_cost()
	if prestigePoints >= cost and prestigeCostReductionLevel < 10:
		prestigePoints -= cost
		prestigeCostReductionLevel += 1
		_animate_ui_feedback(%BuyCostReductionButton)
		play_synth_beep(880, 0.15)
		_show_popup("Rabatt Stufe +" + str(prestigeCostReductionLevel), %BuyCostReductionButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_ui()

func _on_buy_scrap_magnet_button_pressed() -> void:
	var cost := get_scrap_magnet_cost()
	if prestigePoints >= cost:
		prestigePoints -= cost
		prestigeScrapMagnetLevel += 1
		_animate_ui_feedback(%BuyScrapMagnetButton)
		play_synth_beep(880, 0.15)
		_show_popup("Magnet Stufe +" + str(prestigeScrapMagnetLevel), %BuyScrapMagnetButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_ui()

func _on_buy_crit_click_button_pressed() -> void:
	var cost := get_crit_click_cost()
	if prestigePoints >= cost:
		prestigePoints -= cost
		prestigeCritClickLevel += 1
		_animate_ui_feedback(%BuyCritClickButton)
		play_synth_beep(880, 0.15)
		_show_popup("Kritische Klicks Stufe +" + str(prestigeCritClickLevel), %BuyCritClickButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_ui()

func _on_buy_asteroid_scanner_button_pressed() -> void:
	var cost := get_asteroid_scanner_cost()
	if prestigePoints >= cost:
		prestigePoints -= cost
		prestigeAsteroidScannerLevel += 1
		_animate_ui_feedback(%BuyAsteroidScannerButton)
		play_synth_beep(880, 0.15)
		_show_popup("Scanner Stufe +" + str(prestigeAsteroidScannerLevel), %BuyAsteroidScannerButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_ui()

func _on_buy_offline_compensator_button_pressed() -> void:
	var cost := get_offline_compensator_cost()
	if prestigePoints >= cost:
		prestigePoints -= cost
		prestigeOfflineCompensatorLevel += 1
		_animate_ui_feedback(%BuyOfflineCompensatorButton)
		play_synth_beep(880, 0.15)
		_show_popup("Offline-Komp. Stufe +" + str(prestigeOfflineCompensatorLevel), %BuyOfflineCompensatorButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_ui()

func _on_buy_defense_laser_button_pressed() -> void:
	var cost := get_defense_laser_cost()
	if prestigePoints >= cost and prestigeDefenseLaserLevel < 3:
		prestigePoints -= cost
		prestigeDefenseLaserLevel += 1
		_animate_ui_feedback(%BuyDefenseLaserButton)
		play_synth_beep(880, 0.15)
		_show_popup("Abwehrlaser Stufe +" + str(prestigeDefenseLaserLevel), %BuyDefenseLaserButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_ui()

func _on_prestige_button_pressed() -> void:
	var target_prestige := int(floor(sqrt(totalScrapEver / 1000.0)))
	var prestige_gain := target_prestige - totalPrestigePoints
	if prestige_gain > 0:
		totalPrestigePoints += prestige_gain
		prestigePoints += prestige_gain
		prestigeMultiplier = 1.0 + (totalPrestigePoints * 0.1)
		
		# Reset normal run stats
		scrapCount = 0.0
		scrapPerSecond = 0.0
		clickPower = 1.0
		clickUpgradeLevel = 0
		droneCount = 0
		droneProduction = 0.2
		droneUpgradeLevel = 0
		mineCount = 0
		mineProduction = 2.0
		mineUpgradeLevel = 0
		satelliteCount = 0
		satelliteProduction = 15.0
		satelliteUpgradeLevel = 0
		dysonCount = 0
		dysonProduction = 250.0
		dysonUpgradeLevel = 0
		warpGateCount = 0
		warpGateProduction = 1500.0
		warpGateUpgradeLevel = 0
		
		# Reset research disks (keeps techs unlocked!)
		dataDisks = 0.0
		
		# Reset temporary event statuses
		solarFlareActive = false
		wormholeActive = false
		piratesActive = false
		timeWarpActive = false
		overdriveActive = false
		overdriveCooldown = 0.0
		superchargeActive = false
		superchargeCooldown = 0.0
		%EventStatusLabel.text = ""
		%PirateClickOverlay.visible = false
		
		# SFX Sequence
		play_synth_beep(523.25, 0.12)
		await get_tree().create_timer(0.1).timeout
		play_synth_beep(659.25, 0.12)
		await get_tree().create_timer(0.1).timeout
		play_synth_beep(783.99, 0.25)
		
		_animate_ui_feedback(%PrestigeButton)
		_show_popup("Prestige +" + str(prestige_gain), %PrestigeButton.global_position + Vector2(20, -20), Color(0.95, 0.7, 1.0, 1.0))
		update_production()
		update_ui()
		save_game()

func _on_hard_reset_button_pressed() -> void:
	var confirm_popup = ConfirmationDialog.new()
	confirm_popup.title = "Spielstand zurücksetzen"
	confirm_popup.dialog_text = "Möchtest du deinen gesamten Fortschritt unwiderruflich löschen?"
	confirm_popup.ok_button_text = "Ja, zurücksetzen"
	confirm_popup.cancel_button_text = "Abbrechen"
	confirm_popup.confirmed.connect(func():
		if FileAccess.file_exists(save_path):
			DirAccess.remove_absolute(save_path)
		scrapCount = 0.0
		scrapPerSecond = 0.0
		clickPower = 1.0
		clickUpgradeLevel = 0
		droneCount = 0
		droneProduction = 0.2
		mineCount = 0
		mineProduction = 2.0
		satelliteCount = 0
		satelliteProduction = 15.0
		dysonCount = 0
		dysonProduction = 250.0
		warpGateCount = 0
		warpGateProduction = 1500.0
		
		droneUpgradeLevel = 0
		mineUpgradeLevel = 0
		satelliteUpgradeLevel = 0
		dysonUpgradeLevel = 0
		warpGateUpgradeLevel = 0
		
		# Research reset
		dataDisks = 0.0
		techIonEnginesLevel = 0
		techDeepDrillingLevel = 0
		techActiveOverdriveLevel = 0
		techSpsSuperchargeLevel = 0
		techAsteroidMagnetLevel = 0
		
		prestigePoints = 0
		totalPrestigePoints = 0
		prestigeMultiplier = 1.0
		totalScrapEver = 0.0
		
		prestigeAutoCollectorLevel = 0
		prestigeCostReductionLevel = 0
		prestigeScrapMagnetLevel = 0
		prestigeCritClickLevel = 0
		prestigeAsteroidScannerLevel = 0
		prestigeOfflineCompensatorLevel = 0
		prestigeDefenseLaserLevel = 0
		prestigeResearchBoosterLevel = 0
		prestigeAutoBuilderLevel = 0
		techShieldGeneratorLevel = 0
		is_muted = false
		
		statClicks = 0
		statTimePlayed = 0.0
		statTotalScrapEver = 0.0
		statAsteroidsClicked = 0
		statCritClicks = 0
		statPiratesDestroyed = 0
		statDataDisksEarned = 0.0
		
		solarFlareActive = false
		wormholeActive = false
		piratesActive = false
		timeWarpActive = false
		overdriveActive = false
		overdriveCooldown = 0.0
		superchargeActive = false
		superchargeCooldown = 0.0
		%EventStatusLabel.text = ""
		%PirateClickOverlay.visible = false
		
		for key in achievements.keys():
			achievements[key]["unlocked"] = false
			
		play_synth_beep(150, 0.4)
		update_production()
		setup_visuals()
		update_mute_button_ui()
		update_ui()
		set_save_status("Spielstand zurückgesetzt")
	)
	add_child(confirm_popup)
	confirm_popup.popup_centered()

# --- Input Handling ---
func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.is_pressed() and not event.is_echo():
		match event.keycode:
			KEY_SPACE:
				_on_scrap_button_pressed()
			KEY_D:
				_on_buy_drone_button_pressed()
			KEY_M:
				_on_buy_mine_button_pressed()
			KEY_S:
				_on_buy_satellite_button_pressed()
			KEY_Y:
				_on_buy_dyson_button_pressed()
			KEY_C:
				_on_click_upgrade_button_pressed()
			KEY_U:
				_on_drone_upgrade_button_pressed()
			KEY_N:
				_on_buy_mine_upgrade_button_pressed()
			KEY_I:
				_on_buy_satellite_upgrade_button_pressed()
			KEY_O:
				_on_buy_dyson_upgrade_button_pressed()
			KEY_P:
				_on_prestige_button_pressed()

func trigger_debris(pos: Vector2, color: Color = Color(0.9, 0.6, 0.2)) -> void:
	if %DebrisParticles:
		%DebrisParticles.global_position = pos
		%DebrisParticles.color = color
		%DebrisParticles.emitting = true

func _on_scan_orbit_pressed() -> void:
	if scrapCount >= 500 and scannerCooldown <= 0.0 and not anomalyActive:
		scrapCount -= 500
		scannerCooldown = 45.0
		anomalyActive = true
		anomalyTimer = 15.0
		anomalyPosition = Vector2(700 + randf_range(80, 320), 200 + randf_range(50, 450))
		play_synth_beep(880, 0.1)
		play_synth_beep(1100, 0.1)
		play_synth_beep(1300, 0.3)
		_show_popup("🛰️ Anomalie geortet!", anomalyPosition - Vector2(100, 20), Color(0.2, 0.95, 0.45, 1.0))
		%PirateClickOverlay.visible = true
		update_ui()

func collect_anomaly() -> void:
	anomalyActive = false
	if not piratesActive and not wormholeActive:
		%PirateClickOverlay.visible = false
	var reward = max(1000.0, totalScrapEver * 0.15) * prestigeMultiplier
	scrapCount += reward
	totalScrapEver += reward
	statTotalScrapEver += reward
	play_synth_beep(1200, 0.15)
	play_synth_beep(1500, 0.25)
	trigger_debris(anomalyPosition, Color(0.2, 0.95, 0.45))
	_show_popup("Geborgen! +" + format_number(reward), anomalyPosition, Color(0.2, 0.95, 0.45, 1.0))
	update_ui()

func _on_volume_slider_value_changed(value: float) -> void:
	synth_volume = value
	play_synth_beep(600, 0.05)
	save_game()

func _on_buy_research_booster_button_pressed() -> void:
	var cost := get_research_booster_cost()
	if prestigePoints >= cost:
		prestigePoints -= cost
		prestigeResearchBoosterLevel += 1
		_animate_ui_feedback(%BuyResearchBoosterButton)
		play_synth_beep(880, 0.15)
		_show_popup("Forschungs-Booster Stufe +" + str(prestigeResearchBoosterLevel), %BuyResearchBoosterButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_production()
		update_ui()

func _on_buy_auto_builder_button_pressed() -> void:
	var cost := get_auto_builder_cost()
	if prestigePoints >= cost:
		prestigePoints -= cost
		prestigeAutoBuilderLevel += 1
		_animate_ui_feedback(%BuyAutoBuilderButton)
		play_synth_beep(880, 0.15)
		_show_popup("Auto-Werft Stufe +" + str(prestigeAutoBuilderLevel), %BuyAutoBuilderButton.global_position + Vector2(20, -20), Color(0.9, 0.4, 0.9, 1.0))
		update_ui()

func _on_buy_tech_shield_pressed() -> void:
	var cost := get_tech_shield_cost()
	if dataDisks >= cost and techShieldGeneratorLevel < 1:
		dataDisks -= cost
		techShieldGeneratorLevel = 1
		_animate_ui_feedback(%BuyTechShieldButton)
		play_synth_beep(880, 0.15)
		_show_popup("Schild-Generator Erforscht!", %BuyTechShieldButton.global_position + Vector2(20, -20), Color(0.7, 0.3, 1.0, 1.0))
		update_ui()

func _on_mute_button_pressed() -> void:
	is_muted = not is_muted
	update_mute_button_ui()
	play_synth_beep(600, 0.1)
	save_game()

func update_mute_button_ui() -> void:
	if is_muted:
		%MuteButton.text = "🔇 Muted"
		%MuteButton.self_modulate = Color(0.5, 0.5, 0.5, 1.0)
	else:
		%MuteButton.text = "🔊 Mute"
		%MuteButton.self_modulate = Color(0.15, 0.32, 0.55, 1.0)

func show_offline_popup(elapsed: int, scrap: float, disks: float, efficiency: float) -> void:
	var panel := ColorRect.new()
	panel.color = Color(0.04, 0.08, 0.16, 0.95)
	panel.size = Vector2(500, 300)
	panel.position = Vector2(100, 200)
	panel.set_name("OfflinePopupPanel")
	$PopupLayer.add_child(panel)
	
	var title := Label.new()
	title.text = "Offline-Fortschritt"
	title.position = Vector2(20, 20)
	title.add_theme_font_size_override("font_size", 24)
	title.modulate = Color(0.2, 0.8, 1.0, 1.0)
	panel.add_child(title)
	
	var text := Label.new()
	var time_str = ""
	if elapsed < 60:
		time_str = "%d Sekunden" % elapsed
	elif elapsed < 3600:
		time_str = "%d Minuten %d Sekunden" % [elapsed / 60, elapsed % 60]
	else:
		time_str = "%d Stunden %d Minuten" % [elapsed / 3600, (elapsed % 3600) / 60]
		
	text.text = "Du warst %s abwesend.\n\nOffline-Effizienz: %d%%\n\nGenerierter Schrott: %s\nGenerierte Daten-Disks: %s" % [
		time_str,
		int(efficiency * 100),
		format_number(scrap),
		format_number(disks)
	]
	text.position = Vector2(20, 70)
	text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.size = Vector2(460, 160)
	panel.add_child(text)
	
	var button := Button.new()
	button.text = "Einkassieren"
	button.position = Vector2(180, 240)
	button.custom_minimum_size = Vector2(140, 40)
	button.pressed.connect(func(): panel.queue_free())
	panel.add_child(button)

# --- Save & Load System ---
func save_game() -> void:
	var config := ConfigFile.new()
	config.set_value("player", "scrap_count", scrapCount)
	config.set_value("player", "scrap_per_second", scrapPerSecond)
	config.set_value("player", "click_power", clickPower)
	
	config.set_value("player", "drone_count", droneCount)
	config.set_value("player", "drone_production", droneProduction)
	config.set_value("player", "mine_count", mineCount)
	config.set_value("player", "mine_production", mineProduction)
	config.set_value("player", "satellite_count", satelliteCount)
	config.set_value("player", "satellite_production", satelliteProduction)
	config.set_value("player", "dyson_count", dysonCount)
	config.set_value("player", "dyson_production", dysonProduction)
	
	config.set_value("player", "click_upgrade_level", clickUpgradeLevel)
	config.set_value("player", "drone_upgrade_level", droneUpgradeLevel)
	config.set_value("player", "mine_upgrade_level", mineUpgradeLevel)
	config.set_value("player", "satellite_upgrade_level", satelliteUpgradeLevel)
	config.set_value("player", "dyson_upgrade_level", dysonUpgradeLevel)
	
	# Save research data
	config.set_value("player", "warp_gate_count", warpGateCount)
	config.set_value("player", "warp_gate_production", warpGateProduction)
	config.set_value("player", "warp_gate_upgrade_level", warpGateUpgradeLevel)
	config.set_value("player", "synth_volume", synth_volume)
	
	config.set_value("player", "data_disks", dataDisks)
	config.set_value("player", "tech_ion", techIonEnginesLevel)
	config.set_value("player", "tech_drill", techDeepDrillingLevel)
	config.set_value("player", "tech_overdrive", techActiveOverdriveLevel)
	config.set_value("player", "tech_supercharge", techSpsSuperchargeLevel)
	config.set_value("player", "tech_magnet", techAsteroidMagnetLevel)
	
	config.set_value("player", "prestige_points", prestigePoints)
	config.set_value("player", "total_prestige_points", totalPrestigePoints)
	config.set_value("player", "prestige_multiplier", prestigeMultiplier)
	config.set_value("player", "total_scrap_ever", totalScrapEver)
	
	config.set_value("player", "prestige_auto_collector_level", prestigeAutoCollectorLevel)
	config.set_value("player", "prestige_cost_reduction_level", prestigeCostReductionLevel)
	config.set_value("player", "prestige_scrap_magnet_level", prestigeScrapMagnetLevel)
	config.set_value("player", "prestige_crit_click_level", prestigeCritClickLevel)
	config.set_value("player", "prestige_asteroid_scanner_level", prestigeAsteroidScannerLevel)
	config.set_value("player", "prestige_offline_compensator_level", prestigeOfflineCompensatorLevel)
	config.set_value("player", "prestige_defense_laser_level", prestigeDefenseLaserLevel)
	config.set_value("player", "prestige_research_booster_level", prestigeResearchBoosterLevel)
	config.set_value("player", "prestige_auto_builder_level", prestigeAutoBuilderLevel)
	config.set_value("player", "tech_shield_generator_level", techShieldGeneratorLevel)
	config.set_value("player", "is_muted", is_muted)
	
	config.set_value("stats", "clicks", statClicks)
	config.set_value("stats", "time_played", statTimePlayed)
	config.set_value("stats", "total_scrap_ever", statTotalScrapEver)
	config.set_value("stats", "asteroids_clicked", statAsteroidsClicked)
	config.set_value("stats", "crit_clicks", statCritClicks)
	config.set_value("stats", "pirates_destroyed", statPiratesDestroyed)
	config.set_value("stats", "data_disks_earned", statDataDisksEarned)
	
	config.set_value("player", "last_save_time", int(Time.get_unix_time_from_system()))
	config.set_value("player", "tutorial_shown", tutorial_shown)
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
	satelliteCount = int(config.get_value("player", "satellite_count", 0))
	satelliteProduction = float(config.get_value("player", "satellite_production", 15.0))
	dysonCount = int(config.get_value("player", "dyson_count", 0))
	dysonProduction = float(config.get_value("player", "dyson_production", 250.0))
	
	clickUpgradeLevel = int(config.get_value("player", "click_upgrade_level", 0))
	droneUpgradeLevel = int(config.get_value("player", "drone_upgrade_level", 0))
	mineUpgradeLevel = int(config.get_value("player", "mine_upgrade_level", 0))
	satelliteUpgradeLevel = int(config.get_value("player", "satellite_upgrade_level", 0))
	dysonUpgradeLevel = int(config.get_value("player", "dyson_upgrade_level", 0))
	
	# Load research data
	warpGateCount = int(config.get_value("player", "warp_gate_count", 0))
	warpGateProduction = float(config.get_value("player", "warp_gate_production", 1500.0))
	warpGateUpgradeLevel = int(config.get_value("player", "warp_gate_upgrade_level", 0))
	synth_volume = float(config.get_value("player", "synth_volume", 0.5))
	
	dataDisks = float(config.get_value("player", "data_disks", 0.0))
	techIonEnginesLevel = int(config.get_value("player", "tech_ion", 0))
	techDeepDrillingLevel = int(config.get_value("player", "tech_drill", 0))
	techActiveOverdriveLevel = int(config.get_value("player", "tech_overdrive", 0))
	techSpsSuperchargeLevel = int(config.get_value("player", "tech_supercharge", 0))
	techAsteroidMagnetLevel = int(config.get_value("player", "tech_magnet", 0))
	
	prestigePoints = int(config.get_value("player", "prestige_points", 0))
	totalPrestigePoints = int(config.get_value("player", "total_prestige_points", 0))
	prestigeMultiplier = float(config.get_value("player", "prestige_multiplier", 1.0))
	totalScrapEver = float(config.get_value("player", "total_scrap_ever", 0.0))
	
	prestigeAutoCollectorLevel = int(config.get_value("player", "prestige_auto_collector_level", 0))
	prestigeCostReductionLevel = int(config.get_value("player", "prestige_cost_reduction_level", 0))
	prestigeScrapMagnetLevel = int(config.get_value("player", "prestige_scrap_magnet_level", 0))
	prestigeCritClickLevel = int(config.get_value("player", "prestige_crit_click_level", 0))
	prestigeAsteroidScannerLevel = int(config.get_value("player", "prestige_asteroid_scanner_level", 0))
	prestigeOfflineCompensatorLevel = int(config.get_value("player", "prestige_offline_compensator_level", 0))
	prestigeDefenseLaserLevel = int(config.get_value("player", "prestige_defense_laser_level", 0))
	prestigeResearchBoosterLevel = int(config.get_value("player", "prestige_research_booster_level", 0))
	prestigeAutoBuilderLevel = int(config.get_value("player", "prestige_auto_builder_level", 0))
	techShieldGeneratorLevel = int(config.get_value("player", "tech_shield_generator_level", 0))
	is_muted = bool(config.get_value("player", "is_muted", false))
	
	statClicks = int(config.get_value("stats", "clicks", 0))
	statTimePlayed = float(config.get_value("stats", "time_played", 0.0))
	statTotalScrapEver = float(config.get_value("stats", "total_scrap_ever", 0.0))
	statAsteroidsClicked = int(config.get_value("stats", "asteroids_clicked", 0))
	statCritClicks = int(config.get_value("stats", "crit_clicks", 0))
	statPiratesDestroyed = int(config.get_value("stats", "pirates_destroyed", 0))
	statDataDisksEarned = float(config.get_value("stats", "data_disks_earned", 0.0))
	
	last_save_time = int(config.get_value("player", "last_save_time", int(Time.get_unix_time_from_system())))
	tutorial_shown = bool(config.get_value("player", "tutorial_shown", false))
	for key in achievements.keys():
		achievements[key]["unlocked"] = bool(config.get_value("achievements", key, false))
		
	update_production()
	
	var now := int(Time.get_unix_time_from_system())
	var elapsed := max(0, now - last_save_time)
	if elapsed > 10:
		var efficiency = 0.5 + (prestigeOfflineCompensatorLevel * 0.15)
		var offline_gain := 0.0
		if scrapPerSecond > 0:
			offline_gain = scrapPerSecond * elapsed * efficiency
			scrapCount += offline_gain
			totalScrapEver += offline_gain
			statTotalScrapEver += offline_gain
		
		var offline_disks := 0.0
		if dataDisksPerSecond > 0:
			offline_disks = dataDisksPerSecond * elapsed
			dataDisks += offline_disks
			statDataDisksEarned += offline_disks
			
		show_offline_popup(elapsed, offline_gain, offline_disks, efficiency)
	set_save_status("Spielstand geladen")
