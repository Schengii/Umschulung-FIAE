# scripts/ScoreManager.gd
extends Node

# Progressive score manager with XP, levels, credits and class unlocks.

var score: int = 0
var credits: int = 0
var username: String = "Player"
var unlocked_classes: Array = [0, 1, 2] # 0=Soldier, 1=Scout, 2=Tank
var xp: int = 0
var level: int = 1
var xp_to_next_level: int = 100
var total_kills: int = 0

signal score_updated(new_score)
signal credits_updated(new_credits)
signal xp_updated(new_xp, new_level, xp_needed)
signal level_up(new_level)
signal class_unlocked(class_id)

const SAVE_PATH = "user://scores.json"

func _ready() -> void:
	load_local_score()
	emit_signal("xp_updated", xp, level, xp_to_next_level)

func add_points(amount: int) -> void:
	score += amount
	if amount > 0:
		credits += max(1, amount / 2)
		add_experience(max(5, amount / 2))
		upload_score()
	emit_signal("score_updated", score)
	emit_signal("credits_updated", credits)
	save_local_score()

func add_experience(amount: int) -> void:
	xp += amount
	while xp >= xp_to_next_level:
		xp -= xp_to_next_level
		level += 1
		xp_to_next_level = 100 + (level - 1) * 25
		emit_signal("level_up", level)
		if level >= 2 and not 3 in unlocked_classes:
			unlock_class(3)
	emit_signal("xp_updated", xp, level, xp_to_next_level)
	save_local_score()

func spend_credits(amount: int) -> bool:
	if credits >= amount:
		credits -= amount
		emit_signal("credits_updated", credits)
		save_local_score()
		return true
	return false

func unlock_class(class_id: int) -> void:
	if not class_id in unlocked_classes:
		unlocked_classes.append(class_id)
		emit_signal("class_unlocked", class_id)
		save_local_score()

var talents: Dictionary = {
	"start_relic": 0,
	"vision_radius": 0,
	"speed_boost": 0,
	"crit_chance": 0
}

func buy_talent(talent_id: String, cost: int) -> bool:
	if credits >= cost:
		credits -= cost
		talents[talent_id] = talents.get(talent_id, 0) + 1
		emit_signal("credits_updated", credits)
		save_local_score()
		return true
	return false

func save_local_score() -> void:
	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file:
		var data = {
			"username": username,
			"score": score,
			"credits": credits,
			"xp": xp,
			"level": level,
			"xp_to_next_level": xp_to_next_level,
			"unlocked_classes": unlocked_classes,
			"total_kills": total_kills,
			"talents": talents
		}
		file.store_string(JSON.stringify(data))
		file.close()
	else:
		push_error("Failed to open score file for writing")

func load_local_score() -> void:
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file:
		var content = file.get_as_text()
		var data = JSON.parse_string(content)
		if data and typeof(data) == TYPE_DICTIONARY:
			username = data.get("username", username)
			score = int(data.get("score", 0))
			credits = int(data.get("credits", 0))
			xp = int(data.get("xp", 0))
			level = int(data.get("level", 1))
			xp_to_next_level = int(data.get("xp_to_next_level", 100))
			total_kills = int(data.get("total_kills", 0))
			if data.has("unlocked_classes"):
				unlocked_classes = data.get("unlocked_classes")
			if data.has("talents") and typeof(data.get("talents")) == TYPE_DICTIONARY:
				var loaded_talents = data.get("talents")
				for k in loaded_talents.keys():
					talents[k] = int(loaded_talents[k])
			emit_signal("score_updated", score)
			emit_signal("credits_updated", credits)
			emit_signal("xp_updated", xp, level, xp_to_next_level)
		file.close()

func upload_score() -> void:
	# TODO: Implement actual leaderboard API when backend is available.
	# Previously this created orphaned HTTPRequest nodes every call.
	pass
