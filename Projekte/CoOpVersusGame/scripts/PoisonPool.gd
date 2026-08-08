extends Area2D

# PoisonPool – Godot 4.x
# A hazardous area on the ground created by Poison Slimes. Deals tick damage to players.

var lifetime: float = 5.0
var damage_tick_rate: float = 0.5
var damage_amount: int = 4

var _tick_timer: float = 0.0
var _rect: ColorRect = null

func _ready() -> void:
	monitoring = true
	
	# Visual pool
	_rect = ColorRect.new()
	_rect.size = Vector2(48, 48)
	_rect.position = -_rect.size / 2.0
	_rect.color = Color(0.2, 0.8, 0.3, 0.4) # Semi-transparent green
	add_child(_rect)
	
	var collision = CollisionShape2D.new()
	var shape = RectangleShape2D.new()
	shape.size = _rect.size
	collision.shape = shape
	add_child(collision)

func _process(delta: float) -> void:
	lifetime -= delta
	if lifetime <= 0.0:
		queue_free()
		return
		
	# Scale down as it evaporates
	scale = Vector2.ONE * (lifetime / 5.0)
	
	# Deal tick damage
	_tick_timer -= delta
	if _tick_timer <= 0.0:
		_tick_timer = damage_tick_rate
		_deal_damage_to_overlapping_bodies()

func _deal_damage_to_overlapping_bodies() -> void:
	for body in get_overlapping_bodies():
		if body.is_in_group("players") and body.has_method("take_damage"):
			body.take_damage(damage_amount)
