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
  const mediaBase = (window as { __VITE_MEDIA_BASE__?: string }).__VITE_MEDIA_BASE__ || '/media';
  const paramName = name ?? video?.name ?? '';
  const videoUrl = video?.videoUrl ?? (paramName ? `${mediaBase}/${paramName}` : '');
  const posterUrl = video?.posterUrl ?? (paramName ? `${mediaBase}/${paramName.replace(/\.[^/.]+$/, '')}.webp` : '');
  const title = video?.title ?? video?.name ?? paramName ?? '';
  const description = video?.description ?? '';

  // Comments
  const videoKey = paramName || 'unknown';
  const [comments, setComments] = useState<
    Array<{ id: string | number; username?: string; text: string; createdAt: number }>
  >([]);
  const [backendVideoId, setBackendVideoId] = useState<string | undefined>(video?.videoId);
  const [commentText, setCommentText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('protube_user'));
    } catch (_e) {
      return false;
    }
  });

  useEffect(() => {
    const onUpdate = (e: Event) => {
      // @ts-expect-error - Event.detail is not standard but used by CustomEvent
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
          const all: Array<{ videoId?: string; fileName?: string }> = await res.json();
          const key = decodeURIComponent(videoKey);
          const found = all.find((v) => {
            const fn: string = v?.fileName || '';
            const base = fn.replace(/\.[^/.]+$/, '');
            return fn === key || base === key;
          });
          return found?.videoId as string | undefined;
        }
      } catch (_e) {
        /* intentionally left blank */
      }
      return undefined;
    };

    const loadComments = async (vid?: string) => {
      if (!vid) {
        setComments([]);
        return;
      }
      try {
        const res = await fetch(`${API}/comentaris/video/${encodeURIComponent(vid)}`);
        if (cancelled) return;
        if (res.ok) {
          const data: Array<{
            id: string;
            userId: string;
            videoId: string;
            titulo?: string;
            descripcion?: string;
          }> | null = await res.json();
          const mapped = (data || []).map((d) => ({
            id: d.id,
            username: d.userId,
            text: d.descripcion || d.titulo || '',
            createdAt: Date.now(),
          }));
          setComments(mapped);
        } else {
          setComments([]);
        }
      } catch (_e) {
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

    return () => {
      cancelled = true;
    };
  }, [videoKey, video?.videoId]);

  // Likes / watch later / playlists state
  const [liked, setLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState<boolean>(false);
  const [watchLaterPlaylist, setWatchLaterPlaylist] = useState<{ id: string; videoIds: string[] } | null>(null);
  const [playlists, setPlaylists] = useState<Array<{ id: string; name: string; videoIds: string[] }>>([]);
  const [showPlaylistPopover, setShowPlaylistPopover] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  // Refs for positioning the inline popover near the Add button
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [popoverPos, setPopoverPos] = useState<{ left: number; top: number } | null>(null);

  const userId = localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
  const targetVideoId = backendVideoId || videoKey;

  // sync liked (local) and fetch playlists/watchLater (backend)
  useEffect(() => {
    // Liked (Local)
    try {
      const raw = localStorage.getItem('protube_liked') || '[]';
      const arr = JSON.parse(raw) as string[];
      setLiked(arr.includes(videoKey));
    } catch (_e) {
      setLiked(false);
    }

    // Backend Playlists & Watch Later
    if (userId) {
      fetch(`/api/playlists/user/${userId}/watch-later`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setWatchLaterPlaylist(data))
        .catch(() => {});

      fetch(`/api/playlists/user/${userId}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setPlaylists(data.filter((p: any) => p.name !== 'Watch Later')))
        .catch(() => {});
    }
  }, [videoKey, userId, backendVideoId]);

  // When a user is logged in, ask backend whether the video is liked by this user
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!userId || !targetVideoId) return;
      try {
        const res = await fetch(`/api/likes/${encodeURIComponent(userId)}/${encodeURIComponent(targetVideoId)}`);
        if (cancelled) return;
        if (res.ok) {
          // controller returns boolean body
          try {
            const text = await res.text();
            const parsed = text ? JSON.parse(text) : false;
            setLiked(Boolean(parsed));
          } catch (_e) {
            setLiked(false);
          }
        } else {
          setLiked(false);
        }
      } catch (_e) {
        if (!cancelled) setLiked(false);
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [userId, targetVideoId]);

  const toggleLiked = async () => {
    // Require login to like a video
    if (!userId) {
      showToast('Inicia sesión para usar Me gusta');
      return;
    }

    if (!targetVideoId) {
      showToast('Video no disponible');
      return;
    }

    setLikeLoading(true);
    try {
      const url = `/api/likes/${encodeURIComponent(userId)}/${encodeURIComponent(targetVideoId)}`;
      if (!liked) {
        const res = await fetch(url, { method: 'POST' });
        if (!res.ok) {
          showToast('No se pudo añadir a Me Gusta');
          return;
        }
        setLiked(true);
        showToast("Afegit a M'agrada");
      } else {
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok) {
          showToast('No se pudo eliminar Me Gusta');
          return;
        }
        setLiked(false);
        showToast("Eliminat de M'agrada");
      }
    } catch (e) {
      console.error('toggleLiked backend error', e);
      showToast('Error al procesar Me Gusta');
    } finally {
      setLikeLoading(false);
    }
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
    // compute position relative to the actions container so the popover appears near the button
    const btn = addButtonRef.current;
    const container = actionsRef.current;
    if (btn && container) {
      const btnRect = btn.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      // Position the popover to the right of the Add button (side-by-side)
      const gap = 8;
      const left = btnRect.right - contRect.left + gap;
      // Align top near button's top so it appears at the same vertical level
      const top = btnRect.top - contRect.top - 4;
      setPopoverPos({ left, top });
    } else {
      setPopoverPos(null);
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
      if (res.ok) setPlaylists((await res.json()).filter((p: { name: string }) => p.name !== 'Watch Later'));
    } catch (_e) {
      /* intentionally left blank */
    }
  };

  const createAndAddPlaylist = async (name: string) => {
    if (!name || !userId) return;
    try {
      // Create
      const createRes = await fetch(`/api/playlists/user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: name,
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
        if (res.ok) setPlaylists((await res.json()).filter((p: { name: string }) => p.name !== 'Watch Later'));
      } else {
        alert('Error al crear la playlist');
      }
    } catch (_e) {
      /* intentionally left blank */
    }
  };

  // Use global protube:toast event for non-blocking feedback so the app
  // shows a single, consistent toast. Helper to dispatch it.
  const showToast = (msg: string) => {
    try {
      window.dispatchEvent(new CustomEvent('protube:toast', { detail: { message: msg } }));
    } catch (_e) {
      /* intentionally left blank */
    }
  };

  // Close modal on Escape key when visible
  useEffect(() => {
    if (!showPlaylistPopover) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setShowPlaylistPopover(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showPlaylistPopover]);

  // Save to history when the page mounts (viewedAt = now). Keep newest first and dedupe by name
  const postedRef = useRef(false);
  useEffect(() => {
    if (!videoKey || postedRef.current) return;
    postedRef.current = true; // ensure single execution even in React StrictMode double-mount
    const viewedAt = Date.now();
    // Local fallback history (dedupe by name)
    try {
      const raw = localStorage.getItem('protube_history') || '[]';
      const arr = JSON.parse(raw) as Array<{
        name: string;
        title?: string;
        posterUrl?: string;
        videoUrl?: string;
        viewedAt: number;
      }>;
      const next = [
        { name: videoKey, title, posterUrl, videoUrl, viewedAt },
        ...arr.filter((a) => a.name !== videoKey),
      ];
      localStorage.setItem('protube_history', JSON.stringify(next.slice(0, 200)));
    } catch (_e) {
      /* intentionally left blank */
    }
    // Backend registration
    try {
      const uid = localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
      if (uid) {
        fetch('/api/history/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, videoFileName: videoKey }),
        }).catch(() => {
          /* intentionally left blank */
        });
      }
    } catch (_e) {
      /* intentionally left blank */
    }
  }, [videoKey]);

  // No longer saving comments in localStorage; using backend API instead

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    const currentUser = (() => {
      try {
        return localStorage.getItem('protube_username') || 'Usuario';
      } catch (_e) {
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
          try {
            window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'comentari', videoKey } }));
          } catch (_e) {
            /* intentionally left blank */
          }
          // Refresh comments from backend to reflect persisted state
          try {
            const vid = resolvedVideoId || backendVideoId;
            if (vid) {
              const res2 = await fetch(`${API}/comentaris/video/${encodeURIComponent(vid)}`);
              if (res2.ok) {
                const data: Array<{
                  id: string;
                  userId: string;
                  videoId: string;
                  titulo?: string;
                  descripcion?: string;
                }> | null = await res2.json();
                const mapped = (data || []).map((d) => ({
                  id: d.id,
                  username: d.userId,
                  text: d.descripcion || d.titulo || '',
                  createdAt: Date.now(),
                }));
                setComments(mapped);
              }
            }
          } catch (_e) {
            /* intentionally left blank */
          }
        } else {
          let msg = "No s'ha pogut desar el comentari al servidor";
          try {
            const headerMsg = resp.headers.get('X-Error');
            if (headerMsg) msg = headerMsg;
            else {
              const txt = await resp.text();
              if (txt) msg = txt;
            }
          } catch (_e) {
            /* intentionally left blank */
          }
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
        <Link to="/" className="back-link">
          ← Volver
        </Link>
      </div>

      <div>
        <div>
          <video controls width="100%" poster={posterUrl} style={{ borderRadius: 12, backgroundColor: '#000' }}>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div
          ref={actionsRef}
          style={{
            marginTop: 12,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            position: 'relative',
          }}
          className="video-actions"
        >
          <button
            className={`action-btn ${liked ? 'active' : ''}`}
            onClick={toggleLiked}
            aria-pressed={liked}
            title={liked ? 'Unlike' : 'Like'}
            disabled={likeLoading}
            aria-busy={likeLoading}
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

          <button ref={addButtonRef} className="action-btn" onClick={handleAddToPlaylist} title="Afegir a playlist">
            <PlusSquare size={18} />
            <span className="action-text">Afegir</span>
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <h1 className="video-title" style={{ margin: '0 0 8px 0' }}>
            {title}
          </h1>
          {description ? <p className="video-description">{description}</p> : null}
        </div>

        {showPlaylistPopover && (
          <>
            <div
              onClick={() => {
                setShowPlaylistPopover(false);
              }}
              aria-hidden
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1100 }}
            />
            <div
              className="playlist-popover"
              role="dialog"
              aria-label="Selecciona o crea una playlist"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1200,
                minWidth: 260,
                maxWidth: 320,
                width: 'auto',
                background: '#fff',
                borderRadius: 8,
                padding: 8,
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              }}
            >
              <h4>Selecciona una playlist</h4>
              {playlists.length === 0 ? (
                <div style={{ color: '#6b7280', marginBottom: 8 }}>No hi ha llistes encara.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {playlists.map((playlist) => (
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
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Nou nom de playlist"
                />
                <button className="action-btn" onClick={() => createAndAddPlaylist(newPlaylistName)}>
                  Crear
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <section className="comments">
        <h3>Comentarios</h3>
        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              aria-label="Escribe un comentario"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              placeholder="Escribe tu comentario..."
            />
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="btn-primary">
                Enviar
              </button>
            </div>
          </form>
        ) : (
          <p style={{ color: '#6b7280' }}>Debes registrarte o iniciar sesión para comentar.</p>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Sin comentarios todavía.</p>
          ) : (
            comments.map((c) => (
              <div className="comment" key={c.id}>
                <div className="comment-meta">
                  {c.username || 'Usuario'} • {new Date(c.createdAt).toLocaleString()}
                </div>
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
