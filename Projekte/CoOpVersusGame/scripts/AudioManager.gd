extends Node

# AudioManager – Godot 4.x
# Generates real-time synthetic retro sound effects using AudioStreamGenerator.
# Uses a pool of AudioStreamPlayers for polyphony (#29).

const POOL_SIZE: int = 6
var _players: Array[AudioStreamPlayer] = []
var _generators: Array = []
var _current_index: int = 0

# BGM variables
var _bgm_timer: float = 0.0
var _bgm_sequence = [261.63, 329.63, 392.00, 523.25] # C Major Arp
var _bgm_index: int = 0
var _bgm_bpm: float = 120.0
var play_bgm: bool = true

func _ready() -> void:
	# Keep playing even when game is paused
	process_mode = Node.PROCESS_MODE_ALWAYS
	
	# Create a pool of AudioStreamPlayers for polyphony
	for i in range(POOL_SIZE):
		var player = AudioStreamPlayer.new()
		var stream = AudioStreamGenerator.new()
		stream.mix_rate = 22050
		stream.buffer_length = 0.1
		player.stream = stream
		add_child(player)
		player.play()
		_players.append(player)
		_generators.append(player.get_stream_playback())

func _get_next_generator() -> AudioStreamPlayback:
	_current_index = (_current_index + 1) % POOL_SIZE
	return _generators[_current_index]

func _process(delta: float) -> void:
	if not play_bgm: return
	
	# Check if local player has low health
	var low_health = false
	var players = get_tree().get_nodes_in_group("players")
	for p in players:
		if "is_local_player" in p and p.is_local_player:
			if p.health < p.max_health * 0.4:
				low_health = true
				break
				
	var base_bpm = 180.0 if _bgm_sequence[0] == 220.0 else 120.0
	if low_health:
		_bgm_bpm = base_bpm + 30.0
	else:
		_bgm_bpm = base_bpm
		
	_bgm_timer -= delta
	if _bgm_timer <= 0.0:
		_bgm_timer = 60.0 / (_bgm_bpm * 2.0) # 8th notes
		var freq = _bgm_sequence[_bgm_index]
		_play_synth_beep(freq, freq * 0.95, 0.1) # Soft beep
		
		# Play a high-pitched tension warning note if low on health
		if low_health and _bgm_index % 2 == 0:
			_play_synth_beep(freq * 2.0, freq * 1.9, 0.05)
			
		_bgm_index = (_bgm_index + 1) % _bgm_sequence.size()


func set_boss_music(active: bool) -> void:
	if active:
		_bgm_bpm = 180.0
		_bgm_sequence = [220.0, 261.63, 293.66, 329.63] # A Minor aggressive
	else:
		_bgm_bpm = 120.0
		_bgm_sequence = [261.63, 329.63, 392.00, 523.25]

func play_shoot() -> void:
	_play_synth_beep(880.0, 440.0, 0.08)

func play_hit() -> void:
	_play_synth_beep(150.0, 80.0, 0.15, true)

func play_boss() -> void:
	_play_synth_beep(300.0, 600.0, 0.5, false)

func play_victory() -> void:
	_play_synth_beep(523.25, 523.25, 0.1) # C5
	var t = get_tree().create_timer(0.12)
	t.timeout.connect(func(): _play_synth_beep(659.25, 659.25, 0.1)) # E5
	var t2 = get_tree().create_timer(0.24)
	t2.timeout.connect(func(): _play_synth_beep(783.99, 783.99, 0.25)) # G5

func play_explosion() -> void:
	_play_synth_beep(180.0, 50.0, 0.4, true)

func play_spike() -> void:
	_play_synth_beep(600.0, 1000.0, 0.08, true)

func play_teleport() -> void:
	_play_synth_beep(400.0, 1200.0, 0.15, false)

func play_powerup() -> void:
	_play_synth_beep(659.25, 987.77, 0.15, false)

func play_spatial_sound(source_pos: Vector2, sound_type: String) -> void:
	var listener_pos = Vector2.ZERO
	var players = get_tree().get_nodes_in_group("players")
	for p in players:
		if "is_local_player" in p and p.is_local_player:
			listener_pos = p.global_position
			break
			
	var diff = source_pos - listener_pos
	var dist = diff.length()
	var pan = clamp(diff.x / 400.0, -1.0, 1.0)
	var volume_factor = clamp(1.0 - (dist / 800.0), 0.1, 1.0)
	
	match sound_type:
		"shoot": _play_synth_beep_panned(880.0, 440.0, 0.08, false, pan, volume_factor)
		"explosion": _play_synth_beep_panned(180.0, 50.0, 0.4, true, pan, volume_factor)
		"hit": _play_synth_beep_panned(150.0, 80.0, 0.15, true, pan, volume_factor)

func _play_synth_beep_panned(start_freq: float, end_freq: float, duration: float, noise: bool, pan: float, volume: float) -> void:
	var generator = _get_next_generator()
	if not generator: return
		
	var mix_rate = 22050.0
	var total_frames = int(duration * mix_rate)
	var frames_to_fill = generator.get_frames_available()
	if frames_to_fill <= 0: return
		
	var buffer = PackedVector2Array()
	buffer.resize(min(total_frames, frames_to_fill))
	
	var left_vol = volume * clamp(1.0 - pan, 0.0, 1.0)
	var right_vol = volume * clamp(1.0 + pan, 0.0, 1.0)
	
	var phase = 0.0
	for i in range(buffer.size()):
		var t = float(i) / total_frames
		var freq = lerp(start_freq, end_freq, t)
		var sample = 0.0
		if noise:
			sample = randf_range(-1.0, 1.0) * (1.0 - t) * 0.25
		else:
			sample = sin(phase) * (1.0 - t) * 0.35
			phase += 2.0 * PI * freq / mix_rate
			if phase > 2.0 * PI: phase -= 2.0 * PI
		buffer[i] = Vector2(sample * left_vol, sample * right_vol)
		
	generator.push_buffer(buffer)

func _play_synth_beep(start_freq: float, end_freq: float, duration: float, noise: bool = false) -> void:
	_play_synth_beep_panned(start_freq, end_freq, duration, noise, 0.0, 1.0)
