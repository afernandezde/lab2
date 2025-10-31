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
    const onUpdate = (e: Event) => onStorage();
    window.addEventListener('protube:update', onUpdate as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('protube:update', onUpdate as EventListener);
    };
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{name}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="action-btn secondary"
                    onClick={() => {
                      const newNameRaw = window.prompt('Nou nom de la playlist', name);
                      if (!newNameRaw) return;
                      const newName = newNameRaw.trim();
                      if (!newName || newName === name) return;
                      // prevent duplicate names
                      if (Object.prototype.hasOwnProperty.call(lists, newName)) {
                        try { window.alert('Ja existeix una llista amb aquest nom. Tria un altre nom.'); } catch (e) {}
                        try { window.dispatchEvent(new CustomEvent('protube:toast', { detail: { message: 'Ja existeix una llista amb aquest nom. Tria un altre nom.' } })); } catch (e) {}
                        return;
                      }
                      const copy = { ...lists };
                      copy[newName] = copy[name] || [];
                      delete copy[name];
                      try { localStorage.setItem('protube_playlists', JSON.stringify(copy)); window.dispatchEvent(new CustomEvent('protube:update')); setLists(copy); } catch (e) {}
                    }}
                  >
                    Renombrar
                  </button>
                  <button
                    className="action-btn ghost"
                    onClick={() => {
                      if (!window.confirm('Eliminar la playlist?')) return;
                      const copy = { ...lists };
                      delete copy[name];
                      try { localStorage.setItem('protube_playlists', JSON.stringify(copy)); window.dispatchEvent(new CustomEvent('protube:update')); setLists(copy); } catch (e) {}
                    }}
                  >Eliminar</button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {lists[name].map(videoKey => {
                  const v = videos.find(x => x.name === videoKey) || { name: videoKey, title: videoKey, posterUrl: '' };
                  return (
                    <div key={videoKey} style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
                      <div>
                        <button className="action-btn ghost" onClick={() => {
                          if (!window.confirm('Eliminar aquest vídeo de la playlist?')) return;
                          try {
                            const raw = localStorage.getItem('protube_playlists') || '{}';
                            const obj = JSON.parse(raw) as Record<string, string[]>;
                            obj[name] = (obj[name] || []).filter(k => k !== videoKey);
                            localStorage.setItem('protube_playlists', JSON.stringify(obj));
                            setLists(obj);
                            window.dispatchEvent(new CustomEvent('protube:update'));
                          } catch (e) {}
                        }}>Eliminar vídeo</button>
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
