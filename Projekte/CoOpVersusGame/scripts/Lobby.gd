extends Control

# Lobby – Godot 4.x compatible
# Supports LAN host discovery via UDP broadcast + manual IP fallback.

const BROADCAST_PORT: int = 7778
const GAME_PORT: int = 7777
const BROADCAST_INTERVAL: float = 1.0
const SCAN_DURATION: float = 5.0
const BROADCAST_MAGIC: String = "CoOpVersusGame_HOST"

# UI node references (set in _ready)
var _host_btn: Button
var _join_btn: Button
var _scan_btn: Button
var _ip_input: LineEdit
var _host_list: ItemList
var _status_label: Label
var _manual_section: Control

# New UI node references
var _mode_option: OptionButton
var _chat_log: RichTextLabel
var _chat_input: LineEdit
var _selected_mode: int = 0
var _name_input: LineEdit = null
var _ready_check: CheckBox = null
var _start_game_btn: Button = null

# Networking
var _udp_server: PacketPeerUDP = null  # used by HOST to broadcast
var _udp_client: PacketPeerUDP = null  # used by CLIENT to listen
var _broadcast_timer: float = 0.0
var _scan_timer: float = 0.0
var _is_scanning: bool = false
var _is_hosting_broadcast: bool = false
var _found_hosts: Dictionary = {}  # address -> display name

func _ready() -> void:
	# Add styled dark theme background color rect as a backdrop
	var bg_rect = ColorRect.new()
	bg_rect.color = Color(0.08, 0.08, 0.12)
	bg_rect.anchors_preset = Control.PRESET_FULL_RECT
	bg_rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(bg_rect)
	move_child(bg_rect, 0)
	
	# Give the VBox some styling and separation
	$VBox.theme_override_constants/separation = 10
	
	_host_btn    = $VBox/HostButton
	_join_btn    = $VBox/JoinButton
	_scan_btn    = $VBox/ScanSection/ScanButton
	_ip_input    = $VBox/ManualSection/IPInput
	_host_list   = $VBox/ScanSection/HostList
	_status_label = $VBox/StatusLabel
	_manual_section = $VBox/ManualSection
	
	# Style Title label
	$VBox/TitleLabel.modulate = Color(0.3, 0.8, 1.0)
	
	# Connect signals
	_host_btn.pressed.connect(_on_host_pressed)
	_join_btn.pressed.connect(_on_join_pressed)
	_scan_btn.pressed.connect(_on_scan_pressed)
	_host_list.item_activated.connect(_on_host_selected)

	# Shop Button UI
	var shop_btn = Button.new()
	shop_btn.text = "🛍 Klassen-Shop öffnen"
	shop_btn.custom_minimum_size = Vector2(0, 36)
	var style_shop = StyleBoxFlat.new()
	style_shop.bg_color = Color(0.25, 0.1, 0.35)
	style_shop.corner_radius_top_left = 4
	style_shop.corner_radius_top_right = 4
	style_shop.corner_radius_bottom_left = 4
	style_shop.corner_radius_bottom_right = 4
	shop_btn.add_theme_stylebox_override("normal", style_shop)
	shop_btn.pressed.connect(func():
		var shop_inst = preload("res://scripts/MetaShop.gd").new()
		add_child(shop_inst)
	)
	$VBox.add_child(shop_btn)
	$VBox.move_child(shop_btn, 3)

	# Name Input UI
	var name_hbox = HBoxContainer.new()
	name_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	var name_lbl = Label.new()
	name_lbl.text = "Dein Name: "
	name_lbl.modulate = Color(0.8, 0.8, 0.9)
	_name_input = LineEdit.new()
	_name_input.text = "Spieler_" + str(randi() % 1000)
	_name_input.custom_minimum_size = Vector2(160, 32)
	_name_input.text_changed.connect(_on_name_or_ready_changed)
	name_hbox.add_child(name_lbl)
	name_hbox.add_child(_name_input)
	$VBox.add_child(name_hbox)
	$VBox.move_child(name_hbox, 0)
	
	# Ready Check UI
	var ready_hbox = HBoxContainer.new()
	ready_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	_ready_check = CheckBox.new()
	_ready_check.text = "Bereit"
	_ready_check.toggled.connect(_on_name_or_ready_changed)
	ready_hbox.add_child(_ready_check)
	$VBox.add_child(ready_hbox)
	$VBox.move_child(ready_hbox, 1)

	# Start Game Button (Host only)
	_start_game_btn = Button.new()
	_start_game_btn.text = "Spiel Starten"
	_start_game_btn.disabled = true
	_start_game_btn.visible = false
	_start_game_btn.pressed.connect(_on_start_game_pressed)
	$VBox.add_child(_start_game_btn)
	$VBox.move_child(_start_game_btn, 4)

	# Mode Selection UI
	var mode_hbox = HBoxContainer.new()
	mode_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	var mode_label = Label.new()
	mode_label.text = "Spielmodus: "
	mode_label.modulate = Color(0.8, 0.8, 0.9)
	_mode_option = OptionButton.new()
	_mode_option.add_item("Co-Op Mission")
	_mode_option.add_item("Versus Arena")
	_mode_option.item_selected.connect(_on_mode_selected)
	_mode_option.custom_minimum_size = Vector2(160, 32)
	mode_hbox.add_child(mode_label)
	mode_hbox.add_child(_mode_option)
	$VBox.add_child(mode_hbox)
	
	# Chat Room UI
	var chat_vbox = VBoxContainer.new()
	chat_vbox.theme_override_constants/separation = 4
	_chat_log = RichTextLabel.new()
	_chat_log.custom_minimum_size = Vector2(300, 100)
	_chat_log.scroll_following = true
	_chat_log.bbcode_enabled = true
	_chat_log.text = "[color=#778899]--- LOBBY CHAT ---[/color]\n"
	_chat_log.self_modulate = Color(0.9, 0.9, 0.95)
	_chat_input = LineEdit.new()
	_chat_input.placeholder_text = "Nachricht eingeben..."
	_chat_input.text_submitted.connect(_on_chat_submitted)
	_chat_input.custom_minimum_size = Vector2(0, 32)
	chat_vbox.add_child(_chat_log)
	chat_vbox.add_child(_chat_input)
	$VBox.add_child(chat_vbox)

	_set_status("Bereit – Host starten oder Scan starten.")
	_status_label.modulate = Color(0.4, 0.9, 0.4)
	
	# Connect lobby refresh signals
	var net = _get_or_create_network_manager()
	net.player_connected.connect(_update_lobby_player_list)
	net.player_disconnected.connect(_update_lobby_player_list)

# ── Process ──────────────────────────────────────────────────────────────────

func _process(delta: float) -> void:
	# Host broadcasts its presence periodically
	if _is_hosting_broadcast:
		_broadcast_timer -= delta
		if _broadcast_timer <= 0.0:
			_broadcast_timer = BROADCAST_INTERVAL
			_send_broadcast()

	# Client listens for broadcasts
	if _is_scanning:
		_scan_timer -= delta
		_poll_for_hosts()
		if _scan_timer <= 0.0:
			_stop_scan()

# ── Host ─────────────────────────────────────────────────────────────────────

func _on_host_pressed() -> void:
	var net = _get_or_create_network_manager()
	net.host_game(GAME_PORT, 4)
	net.connected_players[1]["name"] = _name_input.text
	net.connected_players[1]["ready"] = true
	
	_start_hosting_broadcast()
	_set_status("Hosting auf Port %d … Warte auf Spieler." % GAME_PORT)
	_host_btn.disabled = true
	_scan_btn.disabled = true
	_ready_check.disabled = true # Host is always ready
	_ready_check.button_pressed = true
	_update_lobby_player_list()

func _start_hosting_broadcast() -> void:
	_udp_server = PacketPeerUDP.new()
	_udp_server.set_broadcast_enabled(true)
	_udp_server.bind(0)  # OS picks a port for sending
	_is_hosting_broadcast = true
	_broadcast_timer = 0.0  # send immediately

func _send_broadcast() -> void:
	if not _udp_server:
		return
	var msg = BROADCAST_MAGIC.to_utf8_buffer()
	_udp_server.set_dest_address("255.255.255.255", BROADCAST_PORT)
	_udp_server.put_packet(msg)

# ── Scan ──────────────────────────────────────────────────────────────────────

func _on_scan_pressed() -> void:
	_found_hosts.clear()
	_host_list.clear()
	_start_scan()

func _start_scan() -> void:
	_udp_client = PacketPeerUDP.new()
	var err = _udp_client.bind(BROADCAST_PORT)
	if err != OK:
		_set_status("LAN-Scan fehlgeschlagen (Port %d belegt?). Bitte manuelle IP nutzen." % BROADCAST_PORT)
		_manual_section.visible = true
		return
	_is_scanning = true
	_scan_timer = SCAN_DURATION
	_scan_btn.disabled = true
	_set_status("Suche nach Hosts im LAN … (%.0f s)" % SCAN_DURATION)

func _poll_for_hosts() -> void:
	if not _udp_client:
		return
	while _udp_client.get_available_packet_count() > 0:
		var packet = _udp_client.get_packet()
		var sender_ip = _udp_client.get_packet_ip()
		var msg = packet.get_string_from_utf8()
		if msg == BROADCAST_MAGIC and not _found_hosts.has(sender_ip):
			_found_hosts[sender_ip] = sender_ip
			_host_list.add_item("🖥  %s" % sender_ip)
			_set_status("%d Host(s) gefunden." % _found_hosts.size())

func _stop_scan() -> void:
	_is_scanning = false
	if _udp_client:
		_udp_client.close()
		_udp_client = null
	_scan_btn.disabled = false
	if _found_hosts.is_empty():
		_set_status("Kein Host im LAN gefunden. Bitte IP manuell eingeben.")
		_manual_section.visible = true
	else:
		_set_status("%d Host(s) gefunden. Auswählen oder IP manuell eingeben." % _found_hosts.size())
		_manual_section.visible = true

# ── Join ──────────────────────────────────────────────────────────────────────

func _on_host_selected(index: int) -> void:
	var addresses = _found_hosts.keys()
	if index < addresses.size():
		_join_at(addresses[index])

func _on_join_pressed() -> void:
	var address = _ip_input.text.strip_edges()
	if address.is_empty():
		_set_status("⚠ Bitte eine IP-Adresse eingeben.")
		return
	_join_at(address)

func _join_at(address: String) -> void:
	var net = _get_or_create_network_manager()
	net.connection_succeeded.connect(_on_connection_succeeded, CONNECT_ONE_SHOT)
	net.connection_failed.connect(_on_connection_failed, CONNECT_ONE_SHOT)
	net.join_game(address, GAME_PORT)
	_set_status("Verbinde mit %s:%d …" % [address, GAME_PORT])
	_join_btn.disabled = true
	_host_btn.disabled = true

func _on_connection_succeeded() -> void:
	_set_status("✅ Verbunden! Warte auf Start durch Host …")
	_stop_broadcast()
	_on_name_or_ready_changed()

func _on_connection_failed() -> void:
	_set_status("❌ Verbindung fehlgeschlagen. Bitte IP prüfen.")
	_join_btn.disabled = false
	_host_btn.disabled = false

# ── Helpers ───────────────────────────────────────────────────────────────────

func _stop_broadcast() -> void:
	_is_hosting_broadcast = false
	if _udp_server:
		_udp_server.close()
		_udp_server = null

func _set_status(text: String) -> void:
	if _status_label:
		_status_label.text = text

func _get_or_create_network_manager() -> Node:
	var net = get_node_or_null("/root/NetworkManager")
	if not net:
		net = preload("res://scripts/NetworkManager.gd").new()
		net.name = "NetworkManager"
		get_tree().get_root().add_child(net)
	return net

func _on_mode_selected(index: int) -> void:
	_selected_mode = index
	if multiplayer.has_multiplayer_peer() and multiplayer.is_server():
		rpc("rpc_sync_mode", index)

@rpc("any_peer", "call_local", "reliable")
func rpc_sync_mode(index: int) -> void:
	_selected_mode = index
	if _mode_option:
		_mode_option.select(index)
	#print("[Lobby] Mode synced: %d" % index)

func _on_chat_submitted(text: String) -> void:
	if text.strip_edges().is_empty():
		return
	var username = _name_input.text
	if multiplayer.has_multiplayer_peer() and not multiplayer.is_server():
		username = _name_input.text + " (Client)"
	
	var full_msg = "[color=#55ff55]%s:[/color] %s" % [username, text]
	if multiplayer.has_multiplayer_peer():
		rpc("rpc_send_chat", full_msg)
	else:
		rpc_send_chat(full_msg)
	_chat_input.clear()

@rpc("any_peer", "call_local", "reliable")
func rpc_send_chat(msg: String) -> void:
	if _chat_log:
		_chat_log.append_text(msg + "\n")

func _on_name_or_ready_changed(_args = null) -> void:
	var net = get_node_or_null("/root/NetworkManager")
	if net and multiplayer.has_multiplayer_peer():
		net.rpc("rpc_set_player_info", _name_input.text, _ready_check.button_pressed)

func _update_lobby_player_list(_id = 0) -> void:
	_host_list.clear()
	var net = get_node_or_null("/root/NetworkManager")
	if not net: return
	
	var all_ready = true
	var player_count = net.connected_players.size()
	
	if multiplayer.has_multiplayer_peer() and multiplayer.is_server():
		net.connected_players[1]["name"] = _name_input.text
		net.connected_players[1]["ready"] = true
		
	for peer_id in net.connected_players.keys():
		var info = net.connected_players[peer_id]
		var p_name = info.get("name", "Client_" + str(peer_id))
		var is_ready = info.get("ready", false)
		
		if peer_id == 1:
			is_ready = true
			
		var status_text = "[BEREIT]" if is_ready else "[NICHT BEREIT]"
		_host_list.add_item("%s - %s" % [p_name, status_text])
		
		if not is_ready:
			all_ready = false
			
	if multiplayer.has_multiplayer_peer() and multiplayer.is_server():
		_start_game_btn.visible = true
		if player_count > 1:
			_start_game_btn.disabled = not all_ready
			if all_ready:
				_start_game_btn.text = "Spiel Starten (Alle bereit!)"
			else:
				_start_game_btn.text = "Spiel Starten (Warten auf Spieler...)"
		else:
			_start_game_btn.disabled = false
			_start_game_btn.text = "Spiel Starten (Solo)"

func _on_start_game_pressed() -> void:
	if multiplayer.is_server():
		rpc("rpc_start_game", _selected_mode)

@rpc("authority", "call_local", "reliable")
func rpc_start_game(mode_idx: int) -> void:
	_stop_broadcast()
	var scene_path = "res://scenes/Main.tscn"
	if mode_idx == 1:
		scene_path = "res://scenes/VersusArena.tscn"
	get_tree().change_scene_to_file(scene_path)

