using Godot;
using System;

namespace MinecraftPokemon;

public partial class MultiplayerManager : Node
{
    public static MultiplayerManager Instance { get; private set; } = null!;
    private ENetMultiplayerPeer _peer = new ENetMultiplayerPeer();
    private const int DefaultPort = 8910;

    public override void _Ready()
    {
        Instance = this;
    }

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

    [Rpc(MultiplayerApi.RpcMode.AnyPeer, CallLocal = true)]
    public void SyncBlockChange(int x, int y, int z, byte blockType)
    {
        var terrain = GetTree().Root.GetNodeOrNull<TerrainController>("Main/TerrainController");
        if (terrain != null)
        {
            terrain.SetBlock(new Vector3I(x, y, z), (BlockType)blockType);
        }
    }

    [Rpc(MultiplayerApi.RpcMode.AnyPeer)]
    public void SyncPlayerPosition(long peerId, Vector3 pos)
    {
        // Broadcast / position sync for connected peers
    }

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
