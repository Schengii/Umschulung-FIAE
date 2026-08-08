extends Node

# NetworkManager – Godot 4.x compatible (ENetMultiplayerPeer)
# Manages host/client connections and tracks connected players.

signal player_connected(peer_id: int)
signal player_disconnected(peer_id: int)
signal connection_succeeded()
signal connection_failed()
signal server_disconnected()

var peer: ENetMultiplayerPeer = null
var connected_players: Dictionary = {}  # peer_id -> player info

func _ready() -> void:
	multiplayer.peer_connected.connect(_on_peer_connected)
	multiplayer.peer_disconnected.connect(_on_peer_disconnected)
	multiplayer.connected_to_server.connect(_on_connected_to_server)
	multiplayer.connection_failed.connect(_on_connection_failed)
	multiplayer.server_disconnected.connect(_on_server_disconnected)

# ── Host ────────────────────────────────────────────────────────────────────

func host_game(port: int = 7777, max_players: int = 4) -> void:
	peer = ENetMultiplayerPeer.new()
	var err = peer.create_server(port, max_players)
	if err != OK:
		push_error("[NetworkManager] Failed to create server: %s" % err)
		return
	multiplayer.multiplayer_peer = peer
	# Register the host itself as player 1
	connected_players[1] = { "id": 1, "name": "Host", "ready": true }
	
	# Attempt UPnP port forwarding in background thread to avoid blocking UI
	WorkerThreadPool.post_task(func(): _setup_upnp(port))

func _setup_upnp(port: int) -> void:
	var upnp = UPNP.new()
	var discover_result = upnp.discover()
	if discover_result == UPNP.UPNP_RESULT_SUCCESS:
		if upnp.get_gateway() and upnp.get_gateway().is_valid_gateway():
			upnp.add_port_mapping(port, 0, "CoOpVersusGame", "UDP")
			upnp.add_port_mapping(port, 0, "CoOpVersusGame", "TCP")

# ── Join ────────────────────────────────────────────────────────────────────

func join_game(address: String, port: int = 7777) -> void:
	peer = ENetMultiplayerPeer.new()
	var err = peer.create_client(address, port)
	if err != OK:
		push_error("[NetworkManager] Failed to connect: %s" % err)
		return
	multiplayer.multiplayer_peer = peer
	#print("[NetworkManager] Connecting to %s:%d" % [address, port])

# ── Disconnect ──────────────────────────────────────────────────────────────

func disconnect_from_game() -> void:
	if peer:
		peer.close()
		peer = null
	multiplayer.multiplayer_peer = null
	connected_players.clear()

# ── Callbacks ───────────────────────────────────────────────────────────────

func _on_peer_connected(id: int) -> void:
	connected_players[id] = { "id": id, "name": "Client_" + str(id), "ready": false }
	emit_signal("player_connected", id)
	#print("[NetworkManager] Peer connected: %d (total: %d)" % [id, connected_players.size()])
	if multiplayer.is_server():
		rpc("rpc_sync_players", connected_players)

@rpc("authority", "call_local", "reliable")
func rpc_sync_players(players: Dictionary) -> void:
	connected_players = players
	#print("[NetworkManager] Synced players list: ", connected_players)
	emit_signal("player_connected", 0) # Trigger lobby list refresh on clients

@rpc("any_peer", "call_local", "reliable")
func rpc_set_player_info(p_name: String, p_ready: bool) -> void:
	var sender_id = multiplayer.get_remote_sender_id()
	if sender_id == 0:
		sender_id = multiplayer.get_unique_id()
		
	if not connected_players.has(sender_id):
		connected_players[sender_id] = { "id": sender_id }
		
	connected_players[sender_id]["name"] = p_name
	connected_players[sender_id]["ready"] = p_ready
	
	if multiplayer.is_server():
		rpc("rpc_sync_players", connected_players)
		emit_signal("player_connected", sender_id)


func _on_peer_disconnected(id: int) -> void:
	connected_players.erase(id)
	emit_signal("player_disconnected", id)
	#print("[NetworkManager] Peer disconnected: %d (total: %d)" % [id, connected_players.size()])

func _on_connected_to_server() -> void:
	connected_players[multiplayer.get_unique_id()] = { "id": multiplayer.get_unique_id(), "name": "Client_" + str(multiplayer.get_unique_id()), "ready": false }
	emit_signal("connection_succeeded")
	#print("[NetworkManager] Successfully connected to server.")

func _on_connection_failed() -> void:
	peer = null
	emit_signal("connection_failed")
	push_error("[NetworkManager] Connection failed.")

func _on_server_disconnected() -> void:
	peer = null
	connected_players.clear()
	emit_signal("server_disconnected")
	push_error("[NetworkManager] Server disconnected.")
	_show_disconnect_dialog()

func _show_disconnect_dialog() -> void:
	var overlay = CanvasLayer.new()
	overlay.layer = 100
	get_tree().root.add_child(overlay)
	
	var panel = Panel.new()
	panel.custom_minimum_size = Vector2(320, 160)
	panel.anchors_preset = Control.PRESET_CENTER
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER, Control.PRESET_MODE_KEEP_SIZE)
	overlay.add_child(panel)
	
	var vbox = VBoxContainer.new()
	vbox.anchors_preset = Control.PRESET_FULL_RECT
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	panel.add_child(vbox)
	
	var title = Label.new()
	title.text = "Verbindung verloren"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.modulate = Color(1.0, 0.3, 0.3)
	vbox.add_child(title)
	
	var desc = Label.new()
	desc.text = "Die Verbindung zum Host wurde unterbrochen."
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(desc)
	
	var btn = Button.new()
	btn.text = "Zurück zur Lobby"
	btn.pressed.connect(func():
		overlay.queue_free()
		get_tree().change_scene_to_file("res://scenes/Lobby.tscn")
	)
	vbox.add_child(btn)

# ── Helpers ─────────────────────────────────────────────────────────────────

func get_player_count() -> int:
	return connected_players.size()

func is_server() -> bool:
	return multiplayer.is_server()

func get_my_id() -> int:
	return multiplayer.get_unique_id()
