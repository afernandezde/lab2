import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type ChannelVideo = {
  name: string;
  title: string;
  posterUrl?: string;
  createdAt: number;
  published?: boolean;
};

const STORAGE_KEY = 'protube_channel_videos';

const MyVideos: React.FC = () => {
  const [videos, setVideos] = useState<ChannelVideo[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
  });

  useEffect(() => {
    const onStorage = () => {
      try { setVideos(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch (e) { setVideos([]); }
    };
    window.addEventListener('storage', onStorage);
    // also listen to custom protube:update events
    const onUpdate = (ev: any) => onStorage();
    window.addEventListener('protube:update', onUpdate as EventListener);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('protube:update', onUpdate as EventListener); };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Els teus vídeos</h2>

      {videos.length === 0 ? (
        <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12 }}>
          <p style={{ margin: 0, color: '#6b7280' }}>No tens vídeos pujats encara. Penja el primer vídeo des del botó "Crea".</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {videos.map(v => {
            const blob = (() => { try { return sessionStorage.getItem('protube_blob_' + v.name); } catch (e) { return null; } })();
            const videoState = { name: v.name, title: v.title, posterUrl: v.posterUrl, videoUrl: blob || v.name };
            return (
              <div key={v.name} style={{ padding: 12, borderRadius: 8, background: '#fff' }}>
                <Link to={`/video/${encodeURIComponent(v.name)}`} state={{ video: videoState }} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '100%', height: 160, background: '#000', borderRadius: 8, marginBottom: 8 }} />
                  <div style={{ fontWeight: 700 }}>{v.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{new Date(v.createdAt).toLocaleString()}</div>
                </Link>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button className="action-btn secondary" onClick={() => {
                    const next = videos.map(x => x.name === v.name ? { ...x, published: !x.published } : x);
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setVideos(next); window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'channel_update' } })); } catch (e) {}
                  }}>{v.published ? 'Despublicar' : 'Publicar'}</button>
                  <button className="action-btn ghost" onClick={() => {
                    if (!window.confirm('Eliminar aquest vídeo?')) return;
                    const next = videos.filter(x => x.name !== v.name);
                    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setVideos(next); window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'channel_update' } })); } catch (e) {}
                  }}>Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyVideos;
