using Godot;
using System;
using System.Collections.Generic;

namespace MinecraftPokemon;

/// <summary>
/// Manages ENet-based multiplayer: hosting, joining, block sync,
/// player-position broadcasting, party sync, PvP, trade, and guild RPCs.
/// </summary>
public partial class MultiplayerManager : Node
{
    public static MultiplayerManager Instance { get; private set; } = null!;

    private ENetMultiplayerPeer _peer = new ENetMultiplayerPeer();
    private const int DefaultPort = 8910;

    // Maps peer-id → last known world position (updated via RPC)
    private readonly Dictionary<long, Vector3> _peerPositions = new Dictionary<long, Vector3>();

    // Maps peer-id → last known party snapshot (species + level pairs)
    private readonly Dictionary<long, string> _peerPartySnapshots = new Dictionary<long, string>();

    /// <summary>Raised when any remote player's position updates.</summary>
    public event Action<long, Vector3>? RemotePositionUpdated;

    /// <summary>Raised when any remote player's party snapshot arrives.</summary>
    public event Action<long, string>? RemotePartyUpdated;

    public override void _Ready()
    {
        Instance = this;
        Multiplayer.PeerConnected    += OnPeerConnected;
        Multiplayer.PeerDisconnected += OnPeerDisconnected;
    }

    // ── Connection ──────────────────────────────────────────────────────────────

    public bool HostGame()
    {
        var error = _peer.CreateServer(DefaultPort, 4);
        if (error != Error.Ok)
        {
            GD.PrintErr("Failed to host server: " + error);
            return false;
        }
        Multiplayer.MultiplayerPeer = _peer;
        GD.Print("Multiplayer-Server erfolgreich gestartet auf Port " + DefaultPort);
        return true;
    }

    public bool JoinGame(string address = "127.0.0.1")
    {
        var error = _peer.CreateClient(address, DefaultPort);
        if (error != Error.Ok)
        {
            GD.PrintErr("Failed to join server: " + error);
            return false;
        }
        Multiplayer.MultiplayerPeer = _peer;
        GD.Print("Verbindung zum Server wird hergestellt: " + address);
        return true;
    }

    private void OnPeerConnected(long id)
    {
        GD.Print($"[Multiplayer] Peer {id} verbunden.");
    }

    private void OnPeerDisconnected(long id)
    {
        _peerPositions.Remove(id);
        _peerPartySnapshots.Remove(id);
        GD.Print($"[Multiplayer] Peer {id} getrennt.");
    }

    // ── Block sync ──────────────────────────────────────────────────────────────

    [Rpc(MultiplayerApi.RpcMode.AnyPeer, CallLocal = true)]
    public void SyncBlockChange(int x, int y, int z, byte blockType)
    {
        var terrain = GetTree().Root.GetNodeOrNull<TerrainController>("Main/TerrainController");
        if (terrain != null)
            terrain.SetBlock(new Vector3I(x, y, z), (BlockType)blockType);
    }

    // ── Player-position sync ───────────────────────────────────────────────────

    /// <summary>
    /// Call this every physics frame from <c>Player._PhysicsProcess</c>
    /// when connected as a client or host.
    /// </summary>
    public void BroadcastPosition(Vector3 pos)
    {
        if (Multiplayer.MultiplayerPeer == null) return;
        Rpc(nameof(RpcReceivePosition), Multiplayer.GetUniqueId(), pos);
    }

    [Rpc(MultiplayerApi.RpcMode.AnyPeer)]
    private void RpcReceivePosition(long peerId, Vector3 pos)
    {
        _peerPositions[peerId] = pos;
        RemotePositionUpdated?.Invoke(peerId, pos);
    }

    /// <summary>Returns the last known position of a remote peer, or null if unknown.</summary>
    public Vector3? GetRemotePosition(long peerId)
        => _peerPositions.TryGetValue(peerId, out var p) ? p : null;

    // ── Party sync ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Broadcast a compact party snapshot string to all peers.
    /// Format: "Species1:Lv1,Species2:Lv2,..."
    /// </summary>
    public void BroadcastParty(IEnumerable<PokemonData> party)
    {
        if (Multiplayer.MultiplayerPeer == null) return;
        var parts = new List<string>();
        foreach (var p in party) parts.Add($"{p.Species}:{p.Level}");
        string snapshot = string.Join(",", parts);
        Rpc(nameof(RpcReceiveParty), Multiplayer.GetUniqueId(), snapshot);
    }

    [Rpc(MultiplayerApi.RpcMode.AnyPeer)]
    private void RpcReceiveParty(long peerId, string snapshot)
    {
        _peerPartySnapshots[peerId] = snapshot;
        RemotePartyUpdated?.Invoke(peerId, snapshot);
        GD.Print($"[Multiplayer] Team-Update von Peer {peerId}: {snapshot}");
    }

    // ── PvP ────────────────────────────────────────────────────────────────────

    [Rpc(MultiplayerApi.RpcMode.AnyPeer)]
    public void RpcRequestPvp(long challengerId, string challengerName)
    {
        GD.Print($"⚔️ PvP-Duell Herausforderung von Spieler #{challengerId} ({challengerName}) erhalten!");
    }

    [Rpc(MultiplayerApi.RpcMode.AnyPeer)]
    public void RpcExecutePvpMove(int moveIndex, int damage)
    {
        GD.Print($"⚔️ PvP-Attacke empfangen: Move {moveIndex}, Schaden: {damage}");
    }

    // ── Trade ──────────────────────────────────────────────────────────────────

    [Rpc(MultiplayerApi.RpcMode.AnyPeer, CallLocal = true)]
    public void RpcTradePokemon(string species, int level)
    {
        string finalSpecies = species;
        bool tradeEvolved = false;

        if (species == "Alpollo")   { finalSpecies = "Gengar";  tradeEvolved = true; }
        else if (species == "Schillok")  { finalSpecies = "Turtok";  tradeEvolved = true; }
        else if (species == "Bisaknosp") { finalSpecies = "Bisaflor"; tradeEvolved = true; }

        string evoTag = tradeEvolved ? $" ✨ TAUSCH-EVOLUTION! ({species} → {finalSpecies})!" : "";
        GD.Print($"🔄 MULTIPLAYER-TAUSCH: {finalSpecies} (Lv.{level}) empfangen!{evoTag}");
    }

    // ── Guild ──────────────────────────────────────────────────────────────────

    [Rpc(MultiplayerApi.RpcMode.AnyPeer, CallLocal = true)]
    public void RpcCreateGuild(string guildName, long creatorId)
    {
        GD.Print($"🏰 Gilde '{guildName}' wurde von Spieler #{creatorId} erfolgreich gegründet!");
    }

    [Rpc(MultiplayerApi.RpcMode.AnyPeer, CallLocal = true)]
    public void RpcJoinGuild(string guildName, long memberId)
    {
        GD.Print($"🏰 Spieler #{memberId} ist der Gilde '{guildName}' beigetreten!");
    }
}
