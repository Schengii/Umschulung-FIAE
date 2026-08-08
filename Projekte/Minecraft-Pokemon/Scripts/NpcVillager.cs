using Godot;
using System;

namespace MinecraftPokemon;

public partial class NpcVillager : CharacterBody3D
{
    [Export] public string VillagerName = "Dorfhändler Gustav";
    private Label3D _label = null!;

    public override void _Ready()
    {
        _label = new Label3D();
        _label.Billboard = BaseMaterial3D.BillboardModeEnum.Enabled;
        _label.PixelSize = 0.005f;
        _label.Position = new Vector3(0, 1.4f, 0);
        _label.FontSize = 22;
        _label.Text = $"🧑‍🌾 {VillagerName}\n[Händler]";
        _label.Modulate = Colors.LightGreen;
        AddChild(_label);

        var body = new MeshInstance3D();
        body.Mesh = new BoxMesh { Size = new Vector3(0.6f, 1.1f, 0.6f) };
        body.Position = new Vector3(0, 0.55f, 0);
        body.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = new Color(0.6f, 0.4f, 0.25f) });
        AddChild(body);
    }
}
