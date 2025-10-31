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
  const mediaBase = (window as any).__VITE_MEDIA_BASE__ || '';
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
      console.debug('toggleWatchLater', { videoKey, exists, next });
    } catch (e) {
      console.error('toggleWatchLater error', e);
    }
  };

  const handleAddToPlaylist = async () => {
    // Prompt-based flow: show existing playlists in the prompt so the user can pick one
    try {
      const raw = localStorage.getItem('protube_playlists') || '{}';
      const obj = JSON.parse(raw) as Record<string, string[]>;
      const existing = Object.keys(obj);
      const promptMsg = existing.length
        ? `Llistes existents: ${existing.join(', ')}. Escriu un nom per afegir o crear:`
        : 'No hi ha llistes. Escriu nom per crear:';
      const name = window.prompt(promptMsg);
      if (!name) return;
      const list = obj[name] || [];
      if (!list.includes(videoKey)) {
        obj[name] = [videoKey, ...list];
        localStorage.setItem('protube_playlists', JSON.stringify(obj));
        alert('Afegit a la playlist: ' + name);
      } else {
        alert('Aquest vídeo ja està a la playlist: ' + name);
      }
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

        <div className="video-actions" style={{ display: 'flex', gap: 8 }}>
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

          <button className="action-btn" onClick={handleAddToPlaylist} title="Afegir a playlist">
            <PlusSquare size={18} />
            <span className="action-text">Afegir</span>
          </button>
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
    </div>
  );
}
