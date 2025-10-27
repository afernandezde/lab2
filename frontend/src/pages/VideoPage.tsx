import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
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
  const [comments, setComments] = useState<Array<{ id: number; text: string; createdAt: number }>>([]);
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

  const saveComments = (next: typeof comments) => {
    try {
      localStorage.setItem(`comments_${videoKey}`, JSON.stringify(next));
    } catch (e) {}
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    const next = [{ id: Date.now(), text, createdAt: Date.now() }, ...comments];
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

      <h1 className="video-title">{title}</h1>
      {description ? (
        <p className="video-description">{description}</p>
      ) : null}

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
                <div className="comment-meta">Usuario • {new Date(c.createdAt).toLocaleString()}</div>
                <div className="comment-text">{c.text}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
