import React from 'react';
import { Link } from 'react-router-dom';
import { useAllVideos } from '../useAllVideos';

interface Playlist {
  id: string;
  name: string;
  userId: string;
  videoIds: string[];
}

const WatchLater: React.FC = () => {
  const { value: videos } = useAllVideos();
  const [playlist, setPlaylist] = React.useState<Playlist | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const uid = localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
    setUserId(uid);
    if (uid) {
      fetchWatchLater(uid);
    }
  }, []);

  const fetchWatchLater = async (uid: string) => {
    try {
      const res = await fetch(`/api/playlists/user/${uid}/watch-later`);
      if (res.ok) {
        const data = await res.json();
        setPlaylist(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeVideo = async (videoId: string) => {
    if (!playlist) return;
    try {
      const res = await fetch(`/api/playlists/${playlist.id}/videos/${encodeURIComponent(videoId)}`, {
        method: 'DELETE',
      });
      if (res.ok && userId) {
        fetchWatchLater(userId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!userId) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
        <h2>Visualitza més tard</h2>
        <p>Inicia sessió per veure la teva llista.</p>
      </div>
    );
  }

  // Map videoIds to objects but keep the original key for deletion
  const items = (playlist?.videoIds || []).map((key) => {
    const video = videos.find((v) => v.videoId === key || v.name === key) || {
      name: key,
      title: 'Unknown Video',
      posterUrl: '',
      videoId: key,
    };
    return { ...video, originalKey: key };
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h2>Visualitza més tard</h2>
      {items.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No hi ha vídeos per veure més tard.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {items.map((v, idx) => (
            <li
              key={`${v.originalKey}-${idx}`}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                padding: 8,
                borderRadius: 8,
                background: '#fff',
              }}
            >
              {v.posterUrl ? (
                <img
                  src={v.posterUrl}
                  alt={v.title ?? v.name}
                  style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <Link
                  to={`/video/${encodeURIComponent(v.name)}`}
                  state={{ video: v }}
                  style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}
                >
                  {v.title ?? v.name}
                </Link>
              </div>
              <button className="action-btn ghost" onClick={() => removeVideo(v.originalKey)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WatchLater;
