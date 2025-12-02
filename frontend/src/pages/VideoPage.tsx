import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Heart, Clock as ClockIcon, PlusSquare } from 'lucide-react';
import { VideoItem } from '../useAllVideos';

// The VideoPage expects that the navigation passes the VideoItem
// through location.state. If not present, we reconstruct basic URLs
// using the name param.
export default function VideoPage() {
  const { name } = useParams<{ name?: string }>();
  const location = useLocation();
  const state = location.state as { video?: VideoItem } | undefined;
  const video = state?.video;

  // If we didn't get full video info, build URLs from name
  const mediaBase = (window as any).__VITE_MEDIA_BASE__ || '/media';
  const paramName = name ?? video?.name ?? '';
  const videoUrl = video?.videoUrl ?? (paramName ? `${mediaBase}/${paramName}` : '');
  const posterUrl = video?.posterUrl ?? (paramName ? `${mediaBase}/${paramName.replace(/\.[^/.]+$/, '')}.webp` : '');
  const title = video?.title ?? video?.name ?? paramName ?? '';
  const description = video?.description ?? '';

  // Comments
  const videoKey = paramName || 'unknown';
  const [comments, setComments] = useState<Array<{ id: string | number; username?: string; text: string; createdAt: number }>>([]);
  const [backendVideoId, setBackendVideoId] = useState<string | undefined>(video?.videoId);
  const [commentText, setCommentText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('protube_user'));
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const onUpdate = (e: Event) => {
      // @ts-ignore
      const detail = e.detail;
      if (detail && detail.type === 'auth') {
        setIsAuthenticated(!!detail.loggedIn);
      }
    };
    window.addEventListener('protube:update', onUpdate);
    return () => window.removeEventListener('protube:update', onUpdate);
  }, []);

  // If we have a videoId from navigation state, use it immediately
  useEffect(() => {
    if (video?.videoId) {
      setBackendVideoId(video.videoId);
    }
  }, [video?.videoId]);

  useEffect(() => {
    let cancelled = false;
    const API = '/api';

    const resolveVideoId = async (): Promise<string | undefined> => {
      try {
        const res = await fetch(`${API}/videos/all`);
        if (res.ok) {
          const all: any[] = await res.json();
          const key = decodeURIComponent(videoKey);
          const found = all.find(v => {
            const fn: string = v?.fileName || '';
            const base = fn.replace(/\.[^/.]+$/, '');
            return fn === key || base === key;
          });
          return found?.videoId as string | undefined;
        }
      } catch {}
      return undefined;
    };

    const loadComments = async (vid?: string) => {
      if (!vid) { setComments([]); return; }
      try {
        const res = await fetch(`${API}/comentaris/video/${encodeURIComponent(vid)}`);
        if (cancelled) return;
        if (res.ok) {
          const data: Array<{ id: string; userId: string; videoId: string; titulo?: string; descripcion?: string }>|null = await res.json();
          const mapped = (data || []).map(d => ({
            id: d.id,
            username: d.userId,
            text: d.descripcion || d.titulo || '',
            createdAt: Date.now(),
          }));
          setComments(mapped);
        } else {
          setComments([]);
        }
      } catch {
        if (!cancelled) setComments([]);
      }
    };

    (async () => {
      // Short-circuit if we already know the id from navigation
      const vid = video?.videoId || (await resolveVideoId());
      if (cancelled) return;
      setBackendVideoId(vid);
      await loadComments(vid);
    })();

    return () => { cancelled = true; };
  }, [videoKey, video?.videoId]);

  // Likes / watch later / playlists state
  const [liked, setLiked] = useState<boolean>(false);
  const [watchLaterPlaylist, setWatchLaterPlaylist] = useState<{ id: string; videoIds: string[] } | null>(null);
  const [playlists, setPlaylists] = useState<Array<{ id: string; name: string; videoIds: string[] }>>([]);
  const [showPlaylistPopover, setShowPlaylistPopover] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const userId = localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
  const targetVideoId = backendVideoId || videoKey;

  // sync liked (local) and fetch playlists/watchLater (backend)
  useEffect(() => {
    // Liked (Local)
    try {
      const raw = localStorage.getItem('protube_liked') || '[]';
      const arr = JSON.parse(raw) as string[];
      setLiked(arr.includes(videoKey));
    } catch (e) {
      setLiked(false);
    }

    // Backend Playlists & Watch Later
    if (userId) {
      fetch(`/api/playlists/user/${userId}/watch-later`)
        .then(r => r.ok ? r.json() : null)
        .then(data => setWatchLaterPlaylist(data))
        .catch(() => {});

      fetch(`/api/playlists/user/${userId}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => setPlaylists(data.filter((p: any) => p.name !== 'Watch Later')))
        .catch(() => {});
    }
  }, [videoKey, userId, backendVideoId]);

  const toggleLiked = () => {
    try {
      const raw = localStorage.getItem('protube_liked') || '[]';
      const arr = (JSON.parse(raw) as string[]) || [];
      const exists = arr.includes(videoKey);
      const next = exists ? arr.filter(x => x !== videoKey) : [videoKey, ...arr];
      localStorage.setItem('protube_liked', JSON.stringify(next));
      setLiked(!exists);
      if (!exists) showToast("Afegit a M'agrada"); else showToast("Eliminat de M'agrada");
    } catch (e) {}
  };

  const toggleWatchLater = async () => {
    if (!userId) {
      showToast('Inicia sessió per utilitzar aquesta funció');
      return;
    }
    
    let playlist = watchLaterPlaylist;
    if (!playlist) {
      try {
        const res = await fetch(`/api/playlists/user/${userId}/watch-later`);
        if (res.ok) {
          playlist = await res.json();
          setWatchLaterPlaylist(playlist);
        } else {
          showToast('Error obtenint la llista Watch Later');
          return;
        }
      } catch (e) {
        console.error(e);
        return;
      }
    }

    if (!playlist) return;

    const exists = playlist.videoIds.includes(targetVideoId);
    try {
      if (exists) {
        await fetch(`/api/playlists/${playlist.id}/videos/${encodeURIComponent(targetVideoId)}`, { method: 'DELETE' });
        showToast('Eliminat de Veure més tard');
      } else {
        await fetch(`/api/playlists/${playlist.id}/videos/${encodeURIComponent(targetVideoId)}`, { method: 'POST' });
        showToast('Afegit a Veure més tard');
      }
      // Refresh
      const res = await fetch(`/api/playlists/user/${userId}/watch-later`);
      if (res.ok) setWatchLaterPlaylist(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToPlaylist = () => {
    if (!userId) {
      showToast('Inicia sessió per crear playlists');
      return;
    }
    setShowPlaylistPopover(true);
  };

  const addToExistingPlaylist = async (playlist: { id: string; name: string; videoIds: string[] }) => {
    if (!userId) return;
    if (playlist.videoIds.includes(targetVideoId)) {
      alert('Aquest vídeo ja està a la playlist');
      return;
    }
    try {
      await fetch(`/api/playlists/${playlist.id}/videos/${encodeURIComponent(targetVideoId)}`, { method: 'POST' });
      showToast(`Afegit a la playlist: ${playlist.name}`);
      setShowPlaylistPopover(false);
      // Refresh
      const res = await fetch(`/api/playlists/user/${userId}`);
      if (res.ok) setPlaylists((await res.json()).filter((p: any) => p.name !== 'Watch Later'));
    } catch (e) {
      console.error(e);
    }
  };

  const createAndAddPlaylist = async (name: string) => {
    if (!name || !userId) return;
    try {
      // Create
      const createRes = await fetch(`/api/playlists/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: name
      });
      if (createRes.ok) {
        const newPlaylist = await createRes.json();
        // Add video
        await fetch(`/api/playlists/${newPlaylist.id}/videos/${encodeURIComponent(targetVideoId)}`, { method: 'POST' });
        showToast(`Creada i afegida a la playlist: ${name}`);
        setShowPlaylistPopover(false);
        setNewPlaylistName('');
        // Refresh
        const res = await fetch(`/api/playlists/user/${userId}`);
        if (res.ok) setPlaylists((await res.json()).filter((p: any) => p.name !== 'Watch Later'));
      } else {
        alert('Error al crear la playlist');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Use global protube:toast event for non-blocking feedback so the app
  // shows a single, consistent toast. Helper to dispatch it.
  const showToast = (msg: string) => {
    try {
      window.dispatchEvent(new CustomEvent('protube:toast', { detail: { message: msg } }));
    } catch (e) {}
  };

  // Save to history when the page mounts (viewedAt = now). Keep newest first and dedupe by name
  const postedRef = useRef(false);
  useEffect(() => {
    if (!videoKey || postedRef.current) return;
    postedRef.current = true; // ensure single execution even in React StrictMode double-mount
    const viewedAt = Date.now();
    // Local fallback history (dedupe by name)
    try {
      const raw = localStorage.getItem('protube_history') || '[]';
      const arr = JSON.parse(raw) as Array<{ name: string; title?: string; posterUrl?: string; videoUrl?: string; viewedAt: number }>;
      const next = [{ name: videoKey, title, posterUrl, videoUrl, viewedAt }, ...(arr.filter(a => a.name !== videoKey))];
      localStorage.setItem('protube_history', JSON.stringify(next.slice(0, 200)));
    } catch {}
    // Backend registration
    try {
      const uid = localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
      if (uid) {
        fetch('/api/history/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, videoFileName: videoKey })
        }).catch(() => {});
      }
    } catch {}
  }, [videoKey]);

  // No longer saving comments in localStorage; using backend API instead

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    const currentUser = (() => {
      try {
        return localStorage.getItem('protube_username') || 'Usuario';
      } catch (e) {
        return 'Usuario';
      }
    })();
    const next = [{ id: Date.now().toString(), username: currentUser, text, createdAt: Date.now() }, ...comments];
    setComments(next);
    setCommentText('');

    // Persist comment to backend comments API (no localhost, relative API base)
    (async () => {
      try {
        const API = '/api'; // use relative API base, no localhost
        // Prefer previously resolved videoId; avoid sending filename as id
        const resolvedVideoId = backendVideoId;

        const payload = {
          userId: currentUser,
          videoId: resolvedVideoId, // if undefined, backend will reject with clear error
          titulo: title || videoKey,
          descripcion: text,
        };

        const resp = await fetch(`${API}/comentaris/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (resp.ok) {
          showToast('Comentari guardat');
          try { window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'comentari', videoKey } })); } catch {}
          // Refresh comments from backend to reflect persisted state
          try {
            const vid = resolvedVideoId || backendVideoId;
            if (vid) {
              const res2 = await fetch(`${API}/comentaris/video/${encodeURIComponent(vid)}`);
              if (res2.ok) {
                const data: Array<{ id: string; userId: string; videoId: string; titulo?: string; descripcion?: string }>|null = await res2.json();
                const mapped = (data || []).map(d => ({ id: d.id, username: d.userId, text: d.descripcion || d.titulo || '', createdAt: Date.now() }));
                setComments(mapped);
              }
            }
          } catch {}
        } else {
          let msg = "No s'ha pogut desar el comentari al servidor";
          try {
            const headerMsg = resp.headers.get('X-Error');
            if (headerMsg) msg = headerMsg; else {
              const txt = await resp.text();
              if (txt) msg = txt;
            }
          } catch {}
          showToast(msg);
          console.warn('Failed to save comment to backend', resp.status, msg);
        }
      } catch (err) {
        console.warn('Backend comment save failed', err);
        showToast("No s'ha pogut desar el comentari al servidor");
      }
    })();
  };

  return (
    <div className="video-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="back-link">← Volver</Link>
      </div>

      <div>
        <video controls width="100%" poster={posterUrl} style={{ borderRadius: 12, backgroundColor: '#000' }}>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1 className="video-title">{title}</h1>
          {description ? <p className="video-description">{description}</p> : null}
        </div>

  <div className="video-actions" style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <button
            className={`action-btn ${liked ? 'active' : ''}`}
            onClick={toggleLiked}
            aria-pressed={liked}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={18} />
            <span className="action-text">M'agrada</span>
          </button>

          <button
            className={`action-btn ${watchLaterPlaylist?.videoIds.includes(targetVideoId) ? 'active' : ''}`}
            onClick={toggleWatchLater}
            aria-pressed={watchLaterPlaylist?.videoIds.includes(targetVideoId)}
            title={watchLaterPlaylist?.videoIds.includes(targetVideoId) ? 'Remove from Watch later' : 'Watch later'}
          >
            <ClockIcon size={18} />
            <span className="action-text">Més tard</span>
          </button>

          <button className="action-btn" onClick={handleAddToPlaylist} title="Afegir a playlist">
            <PlusSquare size={18} />
            <span className="action-text">Afegir</span>
          </button>

          {showPlaylistPopover && (
            <div className="playlist-popover" role="dialog" aria-label="Selecciona o crea una playlist">
              <h4>Selecciona una playlist</h4>
              {playlists.length === 0 ? (
                <div style={{ color: '#6b7280', marginBottom: 8 }}>No hi ha llistes encara.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {playlists.map(playlist => (
                    <div key={playlist.id} className="playlist-item" onClick={() => addToExistingPlaylist(playlist)}>
                      <span>{playlist.name}</span>
                      <small style={{ color: '#6b7280' }}>{playlist.videoIds.length} vídeos</small>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ height: 1, background: '#eef2f7', margin: '8px 0' }} />

              <div className="playlist-create">
                <input
                  aria-label="Nom nova playlist"
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder="Nou nom de playlist"
                />
                <button className="action-btn" onClick={() => createAndAddPlaylist(newPlaylistName)}>Crear</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="comments">
        <h3>Comentarios</h3>
        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              aria-label="Escribe un comentario"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
              placeholder="Escribe tu comentario..."
            />
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="btn-primary">Enviar</button>
            </div>
          </form>
        ) : (
          <p style={{ color: '#6b7280' }}>Debes registrarte o iniciar sesión para comentar.</p>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Sin comentarios todavía.</p>
          ) : (
            comments.map(c => (
              <div className="comment" key={c.id}>
                <div className="comment-meta">{c.username || 'Usuario'} • {new Date(c.createdAt).toLocaleString()}</div>
                <div className="comment-text">{c.text}</div>
              </div>
            ))
          )}
        </div>
      </section>
      {/* global toast is rendered in App.tsx */}
    </div>
  );
}
