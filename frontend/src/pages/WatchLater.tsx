import React from 'react';
import { Link } from 'react-router-dom';
import { useAllVideos } from '../useAllVideos';

const WatchLater: React.FC = () => {
  const { value: videos } = useAllVideos();
  const [list, setList] = React.useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('protube_watch_later') || '[]');
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    const onStorage = () => {
      try {
        setList(JSON.parse(localStorage.getItem('protube_watch_later') || '[]'));
      } catch (e) {
        setList([]);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const items = list.map(name => videos.find(v => v.name === name) || { name, title: name, posterUrl: '' });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h2>Visualitza més tard</h2>
      {items.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No hi ha vídeos per veure més tard.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {items.map(v => (
            <li key={v.name} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderRadius: 8, background: '#fff' }}>
              {v.posterUrl ? (
                <img src={v.posterUrl} alt={v.title ?? v.name} style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <Link to={`/video/${encodeURIComponent(v.name)}`} state={{ video: v }} style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}>
                  {v.title ?? v.name}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WatchLater;
