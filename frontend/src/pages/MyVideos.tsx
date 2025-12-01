import React, { useEffect, useState } from 'react';
import { getEnv } from '../utils/Env';
import { Link } from 'react-router-dom';

type ChannelVideo = {
  videoId: string;
  fileName: string;
  title: string;
  description?: string;
  userId: string;
};

type Comment = {
  id: string;
  userId: string;
  videoId: string;
  titulo: string;
  descripcion: string;
};

const MyVideos: React.FC = () => {
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Comments management state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const userId = (() => {
    try {
      return localStorage.getItem('protube_username') || localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
    } catch { return null; }
  })();

  const MEDIA_BASE = getEnv().MEDIA_BASE_URL || '/media';

  const handleDelete = async (id: string) => {
    if (!window.confirm('Estàs segur que vols eliminar aquest vídeo?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVideos(prev => prev.filter(v => v.videoId !== id));
      } else {
        alert('Error eliminant el vídeo');
      }
    } catch (e) {
      alert('Error eliminant el vídeo');
    }
  };

  const openComments = async (vid: string) => {
      setCurrentVideoId(vid);
      setCommentsOpen(true);
      setCommentsLoading(true);
      try {
          const res = await fetch(`/api/comentaris/video/${vid}`);
          if (res.ok) {
              const data = await res.json();
              setComments(data);
          } else {
              setComments([]);
          }
      } catch (e) {
          setComments([]);
      } finally {
          setCommentsLoading(false);
      }
  };

  const deleteComment = async (cid: string) => {
      if (!window.confirm('Eliminar aquest comentari?')) return;
      try {
          const res = await fetch(`/api/comentaris/${cid}`, { method: 'DELETE' });
          if (res.ok) {
              setComments(prev => prev.filter(c => c.id !== cid));
          }
      } catch (e) {}
  };

  useEffect(() => {
    if (!userId) return;
    let abort = false;
    const fetchVideos = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch('/api/videos/all');
        if (!res.ok) throw new Error('Error fetch videos');
        const data = await res.json();
        if (abort) return;
        const mine = (data as any[]).filter(v => v.userId === userId).map(v => ({
          videoId: v.videoId,
          fileName: v.fileName,
          title: v.title || v.fileName,
          description: v.description,
          userId: v.userId
        }));
        setVideos(mine);
      } catch (e: any) {
        if (!abort) setError(e.message || 'Error');
      } finally {
        if (!abort) setLoading(false);
      }
    };
    fetchVideos();
    
    // Fetch comment counts
    fetch('/api/comentaris/map')
        .then(res => res.ok ? res.json() : {})
        .then(map => {
            const counts: Record<string, number> = {};
            Object.keys(map).forEach(k => counts[k] = map[k].length);
            setCommentCounts(counts);
        })
        .catch(() => {});

    const onUpdate = () => fetchVideos();
    window.addEventListener('protube:update', onUpdate as EventListener);
    return () => { abort = true; window.removeEventListener('protube:update', onUpdate as EventListener); };
  }, [userId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Els teus vídeos</h2>

      {!userId && (
        <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12, background: '#fff', marginBottom: 16 }}>
          <p style={{ margin: 0 }}>Has d'iniciar sessió per veure els teus vídeos.</p>
        </div>
      )}

      {userId && loading && (
        <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12, background: '#fff', marginBottom: 16 }}>Carregant...</div>
      )}
      {userId && error && (
        <div style={{ padding: 24, border: '1px solid #f87171', borderRadius: 12, background: '#fff', marginBottom: 16, color: '#b91c1c' }}>Error: {error}</div>
      )}

      {userId && videos.length === 0 && !loading && !error ? (
        <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12 }}>
          <p style={{ margin: 0, color: '#6b7280' }}>Encara no tens vídeos. Penja el primer vídeo des del botó "Crea".</p>
        </div>
      ) : userId ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {videos.map(v => {
            const base = v.fileName.replace(/\.[^.]+$/, '');
            const posterUrl = `${MEDIA_BASE}/${base}.webp`;
            const videoState = { name: v.fileName, title: v.title, posterUrl, videoUrl: `${MEDIA_BASE}/${v.fileName}` };
            return (
              <div key={v.fileName} style={{ padding: 12, borderRadius: 8, background: '#fff', position: 'relative' }}>
                <Link to={`/video/${encodeURIComponent(v.fileName)}`} state={{ video: videoState }} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: '100%', height: 160, background: `url(${posterUrl}) center/cover, #000`, borderRadius: 8, marginBottom: 8 }} />
                  <div style={{ fontWeight: 700 }}>{v.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>{v.description || ''}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#3b82f6' }}>
                      {commentCounts[v.videoId] || 0} comentaris
                  </div>
                </Link>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button 
                      onClick={(e) => {
                          e.preventDefault();
                          openComments(v.videoId);
                      }}
                      style={{ 
                          padding: '6px 12px', 
                          background: '#e0f2fe', 
                          color: '#0369a1', 
                          border: 'none', 
                          borderRadius: 6, 
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500
                      }}
                  >
                      Comentaris
                  </button>
                  <button 
                      onClick={(e) => {
                          e.preventDefault();
                          handleDelete(v.videoId);
                      }}
                      style={{ 
                          padding: '6px 12px', 
                          background: '#fee2e2', 
                          color: '#b91c1c', 
                          border: 'none', 
                          borderRadius: 6, 
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500
                      }}
                  >
                      Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {commentsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: 600, maxWidth: 'calc(100% - 40px)', background: '#fff', borderRadius: 12, padding: 18, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Comentaris del vídeo</h3>
              <button className="ghost" onClick={() => setCommentsOpen(false)}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {commentsLoading ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>Carregant comentaris...</div>
                ) : comments.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No hi ha comentaris en aquest vídeo.</div>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {comments.map(c => (
                            <div key={c.id} style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.userId || 'Anònim'}</div>
                                        <div style={{ marginTop: 4 }}>{c.descripcion || c.titulo}</div>
                                    </div>
                                    <button 
                                        onClick={() => deleteComment(c.id)}
                                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4 }}
                                        title="Eliminar comentari"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: 12, textAlign: 'right' }}>
                <button className="action-btn" onClick={() => setCommentsOpen(false)}>Tancar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVideos;
