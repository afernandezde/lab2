import React from 'react';
import { Link } from 'react-router-dom';
import { useAllVideos } from '../useAllVideos';

interface Playlist {
  id: string;
  name: string;
  userId: string;
  videoIds: string[];
}

const Playlists: React.FC = () => {
  const { value: videos } = useAllVideos();
  const [playlists, setPlaylists] = React.useState<Playlist[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newPlaylistName, setNewPlaylistName] = React.useState('');

  React.useEffect(() => {
    const uid = localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
    setUserId(uid);
    if (uid) {
      fetchPlaylists(uid);
    }
  }, []);

  const fetchPlaylists = async (uid: string) => {
    try {
      const res = await fetch(`/api/playlists/user/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data.filter((p: Playlist) => p.name !== 'Watch Later'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !userId) return;
    try {
      const res = await fetch(`/api/playlists/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: newPlaylistName.trim(),
      });
      if (res.ok) {
        fetchPlaylists(userId);
        setShowCreateModal(false);
        setNewPlaylistName('');
      } else {
        alert('Error al crear la playlist');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deletePlaylist = async (id: string) => {
    if (!window.confirm('Eliminar la playlist?')) return;
    try {
      const res = await fetch(`/api/playlists/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok && userId) {
        fetchPlaylists(userId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeVideo = async (playlistId: string, videoId: string) => {
    if (!window.confirm('Eliminar aquest vídeo de la playlist?')) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}/videos/${encodeURIComponent(videoId)}`, {
        method: 'DELETE',
      });
      if (res.ok && userId) {
        fetchPlaylists(userId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!userId) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
        <h2>Llistes de reproducció</h2>
        <p>Inicia sessió per veure les teves llistes.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Llistes de reproducció</h2>
        <button className="action-btn" onClick={() => setShowCreateModal(true)}>
          Crear Playlist
        </button>
      </div>

      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div style={{ background: 'white', padding: 24, borderRadius: 8, width: 400, maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Nova Playlist</h3>
            <input
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #ccc',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
              placeholder="Nom de la playlist"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="action-btn ghost" onClick={() => setShowCreateModal(false)}>
                Cancel·lar
              </button>
              <button className="action-btn" onClick={createPlaylist}>
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {playlists.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Cap llista creada.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {playlists.map((playlist) => (
            <div key={playlist.id} style={{ padding: 12, borderRadius: 8, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{playlist.name}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="action-btn ghost" onClick={() => deletePlaylist(playlist.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {playlist.videoIds.map((videoKey) => {
                  // videoKey is likely the videoId (UUID) now if we use backend IDs,
                  // but frontend might still be using filenames or IDs.
                  // My backend stores videoIds.
                  // The frontend `videos` array has `videoId` and `name` (filename).
                  // If `videoKey` is a UUID, we should find by `videoId`.
                  // If it's a filename, find by `name`.
                  // The backend `addVideoToPlaylist` receives a `videoId`.
                  // So `videoKey` here is `videoId`.
                  const v = videos.find((x) => x.videoId === videoKey || x.name === videoKey) || {
                    name: videoKey,
                    title: 'Unknown Video',
                    posterUrl: '',
                  };
                  return (
                    <div
                      key={videoKey}
                      style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {v.posterUrl ? (
                          <img
                            src={v.posterUrl}
                            alt={v.title ?? v.name}
                            style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }}
                          />
                        ) : (
                          <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
                        )}
                        <div>
                          <Link
                            to={`/video/${encodeURIComponent(v.name)}`}
                            state={{ video: v }}
                            style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}
                          >
                            {v.title ?? v.name}
                          </Link>
                        </div>
                      </div>
                      <div>
                        <button className="action-btn ghost" onClick={() => removeVideo(playlist.id, videoKey)}>
                          Eliminar vídeo
                        </button>
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
