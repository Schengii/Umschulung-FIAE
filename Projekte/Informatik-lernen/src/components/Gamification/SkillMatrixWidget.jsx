import React from 'react';
import { Award } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';

export default function SkillMatrixWidget() {
  const { userState } = useStore();
  const completedCount = userState.completedTopics.length;

  const skillsData = [
    { subject: 'Hardware', progress: Math.min(100, (completedCount >= 1 ? 100 : 35)), fullMark: 100 },
    { subject: 'Web', progress: Math.min(100, (completedCount >= 2 ? 100 : 40)), fullMark: 100 },
    { subject: 'JavaScript', progress: Math.min(100, (completedCount >= 3 ? 100 : 25)), fullMark: 100 },
    { subject: 'SQL', progress: Math.min(100, (completedCount >= 4 ? 100 : 20)), fullMark: 100 },
    { subject: 'Netzwerke', progress: Math.min(100, (completedCount >= 5 ? 100 : 15)), fullMark: 100 },
    { subject: 'Security', progress: Math.min(100, (completedCount >= 6 ? 100 : 10)), fullMark: 100 }
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Award size={22} style={{ color: 'var(--accent-primary)' }} /> Deine Skill-Matrix
        </h3>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Absolvierte Lektionen: {completedCount}
        </span>
      </div>

      <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Skills" dataKey="progress" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
