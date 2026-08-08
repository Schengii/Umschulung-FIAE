extends Camera2D

# GameCamera – Godot 4.x
# Camera that follows a target and handles screenshake.

@export var follow_speed: float = 5.0

var target: Node2D = null
var _shake_intensity: float = 0.0
var _shake_duration: float = 0.0

func _ready() -> void:
	make_current()

func setup(follow_target: Node2D) -> void:
	target = follow_target
	global_position = target.global_position

func _process(delta: float) -> void:
	if not is_instance_valid(target):
		return
		
	# Follow target
	global_position = global_position.lerp(target.global_position, follow_speed * delta)
	
	# Handle screen shake
	if _shake_duration > 0.0:
		_shake_duration -= delta
		offset = Vector2(
			randf_range(-_shake_intensity, _shake_intensity),
			randf_range(-_shake_intensity, _shake_intensity)
		)
		if _shake_duration <= 0.0:
			offset = Vector2.ZERO
			_shake_intensity = 0.0

func shake(intensity: float, duration: float) -> void:
	if intensity > _shake_intensity or _shake_duration <= 0.0:
		_shake_intensity = intensity
		_shake_duration = duration
