extends Node

# LevelManager – Godot 4.x compatible
# Handles level progression by reloading the current scene to trigger a fresh procedural dungeon.

var current_index: int = 0

signal level_changed(new_index: int)

func load_specific_level(index: int) -> void:
	current_index = index
	get_tree().reload_current_scene()
	emit_signal("level_changed", index)
	if multiplayer.has_multiplayer_peer() and multiplayer.is_server():
		rpc("rpc_sync_level", index)

@rpc("authority", "call_remote", "reliable")
func rpc_sync_level(index: int) -> void:
	current_index = index
	get_tree().reload_current_scene()
	emit_signal("level_changed", index)

func load_next_level() -> void:
	load_specific_level(current_index + 1)

func get_current_level_name() -> String:
	return "Level %d" % (current_index + 1)
