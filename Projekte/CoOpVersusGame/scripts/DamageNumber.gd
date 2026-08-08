extends Label

# DamageNumber – Godot 4.x
# Floating text showing damage points.

var velocity: Vector2 = Vector2(0, -60.0)
var lifetime: float = 0.7
var _timer: float = 0.0

func _ready() -> void:
	theme_override_colors/font_color = Color(1.0, 0.9, 0.2) # Yellow
	theme_override_colors/font_outline_color = Color(0, 0, 0)
	theme_override_constants/outline_size = 4
	theme_override_font_sizes/font_size = 14
	
	# Random horizontal variance
	velocity.x = randf_range(-25.0, 25.0)

func _process(delta: float) -> void:
	_timer += delta
	if _timer >= lifetime:
		queue_free()
		return
		
	position += velocity * delta
	modulate.a = 1.0 - (_timer / lifetime)
