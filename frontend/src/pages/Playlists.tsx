import React from 'react';
import { Link } from 'react-router-dom';
import { useAllVideos } from '../useAllVideos';

const Playlists: React.FC = () => {
  const { value: videos } = useAllVideos();
  const [lists, setLists] = React.useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('protube_playlists') || '{}');
    } catch (e) {
      return {};
    }
  });

  React.useEffect(() => {
    const onStorage = () => {
      try {
        setLists(JSON.parse(localStorage.getItem('protube_playlists') || '{}'));
      } catch (e) {
        setLists({});
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const names = Object.keys(lists);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h2>Llistes de reproducció</h2>
      {names.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Cap llista creada.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {names.map(name => (
            <div key={name} style={{ padding: 12, borderRadius: 8, background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>{name}</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {lists[name].map(videoKey => {
                  const v = videos.find(x => x.name === videoKey) || { name: videoKey, title: videoKey, posterUrl: '' };
                  return (
                    <div key={videoKey} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {v.posterUrl ? (
                        <img src={v.posterUrl} alt={v.title ?? v.name} style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />
                      ) : (
                        <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
                      )}
                      <div>
                        <Link to={`/video/${encodeURIComponent(v.name)}`} state={{ video: v }} style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}>
                          {v.title ?? v.name}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
