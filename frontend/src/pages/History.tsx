import React from 'react';
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
  const [history, setHistory] = React.useState<HistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem('protube_history') || '[]';
      return JSON.parse(raw);
    } catch (e) {
      return [] as HistoryEntry[];
    }
  });

  const clearHistory = () => {
    try {
      localStorage.removeItem('protube_history');
      setHistory([]);
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historial</h2>
        <button onClick={clearHistory} style={{ padding: '6px 10px', borderRadius: 8 }}>Borrar historial</button>
      </div>

      {history.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No hay vídeos en el historial.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {history.map(h => (
            <li key={h.name} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderRadius: 8, background: '#fff' }}>
              {h.posterUrl ? (
                <img src={h.posterUrl} alt={h.title ?? h.name} style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <Link to={`/video/${encodeURIComponent(h.name)}`} state={{ video: (h as unknown) as VideoItem }} style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}>
                  {h.title ?? h.name}
                </Link>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{new Date(h.viewedAt).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
// file cleaned: primary History component above is the real implementation and already exported as default
