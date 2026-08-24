import React, { useState } from 'react';
import { TUTORIAL_VIDEOS } from '../../data/videosData';
import { Video, Play, Clock, CheckCircle2, ListFilter } from 'lucide-react';

export default function VideoHub({ onCompleteVideo }) {
  const [activeVideoId, setActiveVideoId] = useState(TUTORIAL_VIDEOS[0].id);
  const activeVideo = TUTORIAL_VIDEOS.find(v => v.id === activeVideoId) || TUTORIAL_VIDEOS[0];
  const [completedVideos, setCompletedVideos] = useState([]);

  const handleMarkWatched = (id) => {
    if (!completedVideos.includes(id)) {
      setCompletedVideos(prev => [...prev, id]);
      onCompleteVideo(id, 40);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Video size={28} color="var(--accent-cyan)" /> Video-Tutorial Studio
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Kuratierte Tutorials & Erklärvideos zu IT-Grundlagen, Datenbanken und Cybersecurity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Main Video Player Card */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            
            {/* Embed Iframe Container */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000' }}>
              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-cyan">{activeVideo.category}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Autor: {activeVideo.author}</span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>{activeVideo.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                {activeVideo.summary}
              </p>

              {/* Timestamps / Chapters */}
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-cyan)', marginBottom: '10px' }}>
                  <ListFilter size={16} /> Kapitelübersicht & Zeitstempel
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {activeVideo.timestamps.map((ts, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '6px' }}>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{ts.time}</strong> - {ts.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Video Button */}
              <button
                className="btn btn-success"
                onClick={() => handleMarkWatched(activeVideo.id)}
                disabled={completedVideos.includes(activeVideo.id)}
                style={{ opacity: completedVideos.includes(activeVideo.id) ? 0.7 : 1 }}
              >
                <CheckCircle2 size={18} /> {completedVideos.includes(activeVideo.id) ? 'Als Gesehen Markiert' : 'Video Angeschaut (+40 XP)'}
              </button>

            </div>

          </div>
        </div>

        {/* Video Playlist Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-muted)' }}>Verfügbare Tutorials</h4>

          {TUTORIAL_VIDEOS.map(video => {
            const isSelected = activeVideoId === video.id;
            const isWatched = completedVideos.includes(video.id);

            return (
              <div
                key={video.id}
                onClick={() => setActiveVideoId(video.id)}
                className="glass-panel-hover"
                style={{
                  background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--gradient-cyber)' : 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isWatched ? <CheckCircle2 size={18} color="var(--accent-green)" /> : <Play size={18} color="#fff" />}
                </div>

                <div>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>{video.title}</h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> {video.duration}</span>
                    <span>• {video.category}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
