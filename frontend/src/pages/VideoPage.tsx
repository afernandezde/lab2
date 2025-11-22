import React, { useEffect, useState } from 'react';
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

  // Comments: simple client-side storage per video name
  const videoKey = paramName || 'unknown';
  const [comments, setComments] = useState<Array<{ id: number; username?: string; text: string; createdAt: number }>>([]);
  const [commentText, setCommentText] = useState('');
  const [isAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('protube_user'));
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`comments_${videoKey}`) || '[]';
      setComments(JSON.parse(raw));
    } catch (e) {
      setComments([]);
    }
  }, [videoKey]);

  // Likes / watch later / playlists state
  const [liked, setLiked] = useState<boolean>(false);
  const [watchLater, setWatchLater] = useState<boolean>(false);

  // sync liked/watchLater when videoKey changes (handles navigation without full reload)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('protube_liked') || '[]';
      const arr = JSON.parse(raw) as string[];
      setLiked(arr.includes(videoKey));
    } catch (e) {
      setLiked(false);
    }

    try {
      const raw = localStorage.getItem('protube_watch_later') || '[]';
      const arr = JSON.parse(raw) as string[];
      setWatchLater(arr.includes(videoKey));
    } catch (e) {
      setWatchLater(false);
    }
  }, [videoKey]);

  const toggleLiked = () => {
    try {
      const raw = localStorage.getItem('protube_liked') || '[]';
      const arr = (JSON.parse(raw) as string[]) || [];
      const exists = arr.includes(videoKey);
      const next = exists ? arr.filter(x => x !== videoKey) : [videoKey, ...arr];
      localStorage.setItem('protube_liked', JSON.stringify(next));
  setLiked(!exists);
  // feedback
  if (!exists) showToast("Afegit a M'agrada"); else showToast("Eliminat de M'agrada");
      // notify other components in same tab
      try {
        window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'liked', videoKey } }));
      } catch (e) {}
      console.debug('toggleLiked', { videoKey, exists, next });
    } catch (e) {
      console.error('toggleLiked error', e);
    }
  };

  const toggleWatchLater = () => {
    try {
      const raw = localStorage.getItem('protube_watch_later') || '[]';
      const arr = (JSON.parse(raw) as string[]) || [];
      const exists = arr.includes(videoKey);
      const next = exists ? arr.filter(x => x !== videoKey) : [videoKey, ...arr];
      localStorage.setItem('protube_watch_later', JSON.stringify(next));
  setWatchLater(!exists);
  if (!exists) showToast('Afegit a Veure més tard'); else showToast('Eliminat de Veure més tard');
      try {
        window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'watch_later', videoKey } }));
      } catch (e) {}
      console.debug('toggleWatchLater', { videoKey, exists, next });
    } catch (e) {
      console.error('toggleWatchLater error', e);
    }
  };

  const handleAddToPlaylist = async () => {
    // Open the popover to let the user pick or create a playlist (non-blocking)
    setShowPlaylistPopover(true);
  };

  // Popover UI state for adding to playlists (preferred UX)
  const [playlistsMap, setPlaylistsMap] = useState<Record<string, string[]>>(() => {
    try {
      return JSON.parse(localStorage.getItem('protube_playlists') || '{}');
    } catch (e) {
      return {};
    }
  });
  const [showPlaylistPopover, setShowPlaylistPopover] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // keep playlistsMap in sync with storage and other tabs
  useEffect(() => {
    const onStorage = () => {
      try {
        setPlaylistsMap(JSON.parse(localStorage.getItem('protube_playlists') || '{}'));
      } catch (e) {
        setPlaylistsMap({});
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

  const addToExistingPlaylist = (name: string) => {
    try {
      const raw = localStorage.getItem('protube_playlists') || '{}';
      const obj = JSON.parse(raw) as Record<string, string[]>;
      const list = obj[name] || [];
      if (!list.includes(videoKey)) {
        obj[name] = [videoKey, ...list];
        localStorage.setItem('protube_playlists', JSON.stringify(obj));
        setPlaylistsMap(obj);
        try { window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'playlists', name } })); } catch (e) {}
        showToast(`Afegit a la playlist: ${name}`);
      } else {
        // show a blocking alert as requested
        try { window.alert('Aquest vídeo ja està a la playlist'); } catch (e) { /* ignore */ }
        showToast('Aquest vídeo ja està a la playlist');
      }
      setShowPlaylistPopover(false);
    } catch (e) {}
  };

  const createAndAddPlaylist = (name: string) => {
    if (!name) return;
    try {
      const raw = localStorage.getItem('protube_playlists') || '{}';
      const obj = JSON.parse(raw) as Record<string, string[]>;
      // If playlist name already exists, inform the user and don't silently overwrite
      if (Object.prototype.hasOwnProperty.call(obj, name)) {
        // show blocking alert to notify user
        try { window.alert('Ja existeix una playlist amb aquest nom. Tria un altre nom o selecciona l\'existent.'); } catch (e) {}
        showToast('Ja existeix una playlist amb aquest nom. Tria un altre nom o selecciona l\'existent.');
      } else {
        obj[name] = [videoKey];
        localStorage.setItem('protube_playlists', JSON.stringify(obj));
        setPlaylistsMap(obj);
        try { window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'playlists', name } })); } catch (e) {}
        showToast(`Creada i afegida a la playlist: ${name}`);
      }
      setNewPlaylistName('');
      setShowPlaylistPopover(false);
    } catch (e) {}
  };

  // Use global protube:toast event for non-blocking feedback so the app
  // shows a single, consistent toast. Helper to dispatch it.
  const showToast = (msg: string) => {
    try {
      window.dispatchEvent(new CustomEvent('protube:toast', { detail: { message: msg } }));
    } catch (e) {}
  };

  // Save to history when the page mounts (viewedAt = now). Keep newest first and dedupe by name
  useEffect(() => {
    try {
      const raw = localStorage.getItem('protube_history') || '[]';
      const arr = JSON.parse(raw) as Array<{ name: string; title?: string; posterUrl?: string; videoUrl?: string; viewedAt: number }>;
      const next = [{ name: videoKey, title, posterUrl, videoUrl, viewedAt: Date.now() }, ...(arr.filter(a => a.name !== videoKey))];
      // keep at most 200 entries to avoid infinite growth
      const trimmed = next.slice(0, 200);
      localStorage.setItem('protube_history', JSON.stringify(trimmed));
    } catch (e) {}
  }, [videoKey, title, posterUrl, videoUrl]);

  const saveComments = (next: typeof comments) => {
    try {
      localStorage.setItem(`comments_${videoKey}`, JSON.stringify(next));
    } catch (e) {}
  };

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
    const next = [{ id: Date.now(), username: currentUser, text, createdAt: Date.now() }, ...comments];
    setComments(next);
    saveComments(next);
    setCommentText('');
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
            className={`action-btn ${watchLater ? 'active' : ''}`}
            onClick={toggleWatchLater}
            aria-pressed={watchLater}
            title={watchLater ? 'Remove from Watch later' : 'Watch later'}
          >
            <ClockIcon size={18} />
            <span className="action-text">Més tard</span>
          </button>

          <button className="action-btn" onClick={() => setShowPlaylistPopover(v => !v)} title="Afegir a playlist">
            <PlusSquare size={18} />
            <span className="action-text">Afegir</span>
          </button>

          {showPlaylistPopover && (
            <div className="playlist-popover" role="dialog" aria-label="Selecciona o crea una playlist">
              <h4>Selecciona una playlist</h4>
              {Object.keys(playlistsMap).length === 0 ? (
                <div style={{ color: '#6b7280', marginBottom: 8 }}>No hi ha llistes encara.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.keys(playlistsMap).map(name => (
                    <div key={name} className="playlist-item" onClick={() => addToExistingPlaylist(name)}>
                      <span>{name}</span>
                      <small style={{ color: '#6b7280' }}>{playlistsMap[name].length} vídeos</small>
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
