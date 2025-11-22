import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VideoItem } from '../useAllVideos';

type HistoryEntry = {
  name: string;
  title?: string;
  posterUrl?: string;
  videoUrl?: string;
  viewedAt: number;
};

export default function History() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem('protube_history') || '[]'); } catch { return []; }
  });
  const [backendHistory, setBackendHistory] = useState<HistoryEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = (() => { try { return localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user'); } catch { return null; } })();

  useEffect(() => {
    if (!userId) { setBackendHistory(null); return; }
    let abort = false;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`/api/history/${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error('Error history fetch');
        const data = await res.json();
        if (abort) return;
        const mapped: HistoryEntry[] = (data as any[]).map(d => ({
          name: d.videoFileName,
          title: d.title || d.videoFileName,
          posterUrl: `/media/${d.videoFileName.replace(/\.[^.]+$/, '')}.webp`,
          videoUrl: `/media/${d.videoFileName}`,
          viewedAt: d.viewedAt
        }));
        setBackendHistory(mapped);
      } catch (e: any) {
        if (!abort) setError(e.message || 'Error');
      } finally {
        if (!abort) setLoading(false);
      }
    };
    load();
    return () => { abort = true; };
  }, [userId]);

  const clearHistory = () => {
    try { localStorage.removeItem('protube_history'); setHistory([]); } catch {}
    // Note: backend history clearing endpoint not implemented yet
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historial</h2>
        <button onClick={clearHistory} style={{ padding: '6px 10px', borderRadius: 8 }}>Borrar historial</button>
      </div>

      {!userId && history.length === 0 && (
        <p style={{ color: '#6b7280' }}>No hi ha vídeos en el historial.</p>
      )}
      {userId && backendHistory === null && loading && (
        <p style={{ color: '#6b7280' }}>Carregant historial...</p>
      )}
      {userId && error && (
        <p style={{ color: '#b91c1c' }}>Error: {error}</p>
      )}
      {userId && backendHistory !== null && backendHistory.length === 0 && !loading && !error && (
        <p style={{ color: '#6b7280' }}>Encara no has vist cap vídeo.</p>
      )}
      {userId && backendHistory && backendHistory.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {backendHistory.map(h => (
            <li key={h.name} style={{ listStyle: 'none', margin: 0 }}>
              <Link
                to={`/video/${encodeURIComponent(h.name)}`}
                state={{ video: (h as unknown) as VideoItem }}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 8,
                  background: '#fff',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                {h.posterUrl ? (
                  <img src={h.posterUrl} alt={h.title ?? h.name} style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
                )}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{h.title ?? h.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{new Date(h.viewedAt).toLocaleString()}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!userId && history.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {history.map(h => (
            <li key={h.name} style={{ listStyle: 'none', margin: 0 }}>
              <Link
                to={`/video/${encodeURIComponent(h.name)}`}
                state={{ video: (h as unknown) as VideoItem }}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: 8,
                  borderRadius: 8,
                  background: '#fff',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                {h.posterUrl ? (
                  <img src={h.posterUrl} alt={h.title ?? h.name} style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
                )}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{h.title ?? h.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{new Date(h.viewedAt).toLocaleString()}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
// file cleaned: primary History component above is the real implementation and already exported as default
