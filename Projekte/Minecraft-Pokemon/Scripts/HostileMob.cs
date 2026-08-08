using Godot;
using System;

namespace MinecraftPokemon;

public partial class HostileMob : CharacterBody3D
{
    [Export] public string MobName = "Voxel-Creeper";
    [Export] public int MaxHp = 25;
    public int CurrentHp;
    [Export] public float Speed = 3.2f;

    public Node3D? TargetPlayer;
    private Label3D _label = null!;
    private float _gravity = ProjectSettings.GetSetting("physics/3d/default_gravity").AsSingle();

    public override void _Ready()
    {
        CurrentHp = MaxHp;

        _label = new Label3D();
        _label.Billboard = BaseMaterial3D.BillboardModeEnum.Enabled;
        _label.PixelSize = 0.005f;
        _label.Position = new Vector3(0, 1.4f, 0);
        _label.FontSize = 22;
        _label.Text = $"⚠️ {MobName}\nKP: {CurrentHp}/{MaxHp}";
        _label.Modulate = Colors.Red;
        AddChild(_label);

        BuildVisuals();
    }

    private void BuildVisuals()
    {
        var body = new MeshInstance3D();
        body.Mesh = new BoxMesh { Size = new Vector3(0.7f, 1.2f, 0.7f) };
        body.Position = new Vector3(0, 0.6f, 0);
        var color = MobName == "Voxel-Creeper" ? Colors.LawnGreen : Colors.LightGray;
        body.SetSurfaceOverrideMaterial(0, new StandardMaterial3D { AlbedoColor = color });
        AddChild(body);
    }

    public override void _PhysicsProcess(double delta)
    {
        Vector3 velocity = Velocity;

        if (!IsOnFloor())
        {
            velocity.Y -= _gravity * (float)delta;
        }

        if (TargetPlayer != null && IsInstanceValid(TargetPlayer))
        {
            Vector3 diff = TargetPlayer.GlobalPosition - GlobalPosition;
            diff.Y = 0;
            if (diff.Length() < 16.0f)
            {
                Vector3 dir = diff.Normalized();
                velocity.X = dir.X * Speed;
                velocity.Z = dir.Z * Speed;

                Vector3 lookTarget = GlobalPosition + dir;
                lookTarget.Y = GlobalPosition.Y;
                if (GlobalPosition.DistanceSquaredTo(lookTarget) > 0.001f)
                {
                    LookAt(lookTarget, Vector3.Up);
                }
            }
        }

        Velocity = velocity;
        MoveAndSlide();

        if (GlobalPosition.Y < -10) QueueFree();
    }

    public void TakeDamage(int damage)
    {
        CurrentHp = Math.Max(0, CurrentHp - damage);
        if (_label != null) _label.Text = $"⚠️ {MobName}\nKP: {CurrentHp}/{MaxHp}";
        if (CurrentHp <= 0)
        {
            if (EffectsManager.Instance != null)
            {
                EffectsManager.Instance.SpawnBlockBreakEffect(GlobalPosition, Colors.LimeGreen);
            }
            QueueFree();
        }
    }
}
