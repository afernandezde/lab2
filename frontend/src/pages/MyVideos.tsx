import React, { useEffect, useState } from 'react';
import { getEnv } from '../utils/Env';
import { Link } from 'react-router-dom';

type ChannelVideo = {
  fileName: string;
  title: string;
  description?: string;
  userId: string;
};

const MyVideos: React.FC = () => {
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = (() => {
    try {
      return localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
    } catch { return null; }
  })();

  const MEDIA_BASE = getEnv().MEDIA_BASE_URL || '/media';

  useEffect(() => {
    if (!userId) return;
    let abort = false;
    const fetchVideos = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch('/api/videos/all');
        if (!res.ok) throw new Error('Error fetch videos');
        const data = await res.json();
        if (abort) return;
        const mine = (data as any[]).filter(v => v.userId === userId).map(v => ({
          fileName: v.fileName,
          title: v.title || v.fileName,
          description: v.description,
          userId: v.userId
        }));
        setVideos(mine);
      } catch (e: any) {
        if (!abort) setError(e.message || 'Error');
      } finally {
        if (!abort) setLoading(false);
      }
    };
    fetchVideos();
    const onUpdate = () => fetchVideos();
    window.addEventListener('protube:update', onUpdate as EventListener);
    return () => { abort = true; window.removeEventListener('protube:update', onUpdate as EventListener); };
  }, [userId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Els teus vídeos</h2>

      {!userId && (
        <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12, background: '#fff', marginBottom: 16 }}>
          <p style={{ margin: 0 }}>Has d'iniciar sessió per veure els teus vídeos.</p>
        </div>
      )}

      {userId && loading && (
        <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12, background: '#fff', marginBottom: 16 }}>Carregant...</div>
      )}
      {userId && error && (
        <div style={{ padding: 24, border: '1px solid #f87171', borderRadius: 12, background: '#fff', marginBottom: 16, color: '#b91c1c' }}>Error: {error}</div>
      )}

      {userId && videos.length === 0 && !loading && !error ? (
        <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12 }}>
          <p style={{ margin: 0, color: '#6b7280' }}>Encara no tens vídeos. Penja el primer vídeo des del botó "Crea".</p>
        </div>
      ) : userId ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {videos.map(v => {
            const base = v.fileName.replace(/\.[^.]+$/, '');
            const posterUrl = `${MEDIA_BASE}/${base}.webp`;
            const videoState = { name: v.fileName, title: v.title, posterUrl, videoUrl: `${MEDIA_BASE}/${v.fileName}` };
            return (
              <div key={v.fileName} style={{ padding: 12, borderRadius: 8, background: '#fff' }}>
                <Link to={`/video/${encodeURIComponent(v.fileName)}`} state={{ video: videoState }} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '100%', height: 160, background: `url(${posterUrl}) center/cover, #000`, borderRadius: 8, marginBottom: 8 }} />
                  <div style={{ fontWeight: 700 }}>{v.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{v.description || ''}</div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default MyVideos;
