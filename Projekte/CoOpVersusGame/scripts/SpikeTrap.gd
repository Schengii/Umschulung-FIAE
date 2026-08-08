extends Area2D

# SpikeTrap – Godot 4.x
# Periodically activates and damages any player or enemy standing on it.

var is_active: bool = false
var _cycle_timer: float = 2.0
var damage_amount: int = 15

var _bg_rect: ColorRect = null
var _spikes_rects = []

func _ready() -> void:
	add_to_group("hazards")
	monitoring = true
	
	# Base plate (Gray)
	_bg_rect = ColorRect.new()
	_bg_rect.size = Vector2(48, 48)
	_bg_rect.position = -_bg_rect.size / 2.0
	_bg_rect.color = Color(0.25, 0.25, 0.28)
	add_child(_bg_rect)
	
	# Create 4 small spike visuals
	var spike_offsets = [
		Vector2(-12, -12), Vector2(12, -12),
		Vector2(-12, 12), Vector2(12, 12)
	]
	for offset in spike_offsets:
		var spike = ColorRect.new()
		spike.size = Vector2(8, 8)
		spike.position = offset - spike.size / 2.0
		spike.color = Color(0.15, 0.15, 0.15) # Dark/retracted initially
		add_child(spike)
		_spikes_rects.append(spike)
		
	# Collision Shape
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = _bg_rect.size - Vector2(4, 4)
	collision.shape = shape
	add_child(collision)
	
	_cycle_timer = randf_range(1.0, 2.5) # Desynchronize traps

func _process(delta: float) -> void:
	_cycle_timer -= delta
	if _cycle_timer <= 0.0:
		if is_active:
			# Deactivate
			is_active = false
			_cycle_timer = randf_range(1.5, 2.5)
			_bg_rect.color = Color(0.25, 0.25, 0.28)
			for spike in _spikes_rects:
				spike.color = Color(0.15, 0.15, 0.15) # Retract spikes
		else:
			# Activate
			is_active = true
			_cycle_timer = 1.0 # stay active for 1 second
			_bg_rect.color = Color(0.4, 0.1, 0.1) # Danger red highlight
			for spike in _spikes_rects:
				spike.color = Color(0.85, 0.85, 0.9) # Bright steel spikes
			
			# Trigger damage immediately on activation
			_trigger_trap_damage()

func _trigger_trap_damage() -> void:
	if not is_active:
		return
		
	var overlapping = get_overlapping_bodies()
	var hit_anything = false
	for body in overlapping:
		if body.is_in_group("players") or body.is_in_group("enemies"):
			if body.has_method("take_damage"):
				body.take_damage(damage_amount)
				hit_anything = true
				
	if hit_anything:
		var am = get_node_or_null("/root/AudioManager")
		if am and am.has_method("play_spike"):
			am.play_spike()
