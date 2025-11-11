import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

type ChannelVideo = {
  name: string; // unique key / filename
  title: string;
  posterUrl?: string;
  createdAt: number;
  published?: boolean;
};

type Post = {
  id: string;
  text: string;
  createdAt: number;
};

const STORAGE_KEY = 'protube_channel_videos';
const POSTS_KEY = 'protube_channel_posts';

const Profile: React.FC = () => {
  const username = (() => {
    try { return localStorage.getItem('protube_username') || 'Mi canal'; } catch (e) { return 'Mi canal'; }
  })();

  const [videos, setVideos] = useState<ChannelVideo[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
  });

  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<Post[]>(() => {
    try { return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]'); } catch (e) { return []; }
  });
  const postTextRef = useRef<HTMLTextAreaElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onStorage = () => {
      try { setVideos(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch (e) { setVideos([]); }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // focus inputs when navigating from header create menu using hash anchors
  useEffect(() => {
    const h = location.hash || window.location.hash;
    if (h === '#post') {
      setTimeout(() => postTextRef.current?.focus(), 50);
    }
  }, [location]);

  const saveVideos = (next: ChannelVideo[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setVideos(next); } catch (e) {}
  };

  const handleDelete = (name: string) => {
    if (!window.confirm('Eliminar aquest vídeo?')) return;
    const next = videos.filter(v => v.name !== name);
    saveVideos(next);
  };

  const togglePublished = (name: string) => {
    const next = videos.map(v => v.name === name ? { ...v, published: !v.published } : v);
    saveVideos(next);
  };

  const savePosts = (next: Post[]) => {
    try { localStorage.setItem(POSTS_KEY, JSON.stringify(next)); setPosts(next); } catch (e) {}
  };

  const createPost = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = postText.trim();
    if (!text) return; // no empty posts
    const p: Post = { id: String(Date.now()) + Math.random().toString(36).slice(2,8), text, createdAt: Date.now() };
    const next = [p, ...posts];
    savePosts(next);
    setPostText('');
  };

  const deletePost = (id: string) => {
    if (!window.confirm('Eliminar aquesta publicació?')) return;
    const next = posts.filter(p => p.id !== id);
    savePosts(next);
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <div className="channel-header">
        <div className="channel-avatar">{(username || 'U').charAt(0).toUpperCase()}</div>
        <div className="channel-meta">
          <h1 className="channel-title">{username}</h1>
          <div className="channel-handle">@{username.replace(/\s+/g, '')}</div>
          <p className="channel-desc">Més informació sobre aquest canal ... <span style={{ color: '#0b66ff', marginLeft: 6 }}>més</span></p>

          <div className="channel-actions">
            <button className="action-btn">Personalitza el canal</button>
            <button className="action-btn secondary">Gestiona els vídeos</button>
          </div>
        </div>
      </div>

      <div className="channel-postbox">
        <form onSubmit={createPost} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="postbox-header">
            <div className="postbox-avatar">{(username || 'U').charAt(0).toUpperCase()}</div>
            <textarea ref={postTextRef} value={postText} onChange={e => setPostText(e.target.value)} placeholder="Crea una publicació" rows={2} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#6b7280' }}>{posts.length} publicacions</div>
            <div>
              <button className="action-btn" type="submit">Publica</button>
            </div>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="channel-tabs" style={{ marginTop: 0 }}>
          <button className="tab active">Publicades</button>
          <button className="tab">Programades</button>
          <button className="tab">Arxivades</button>
        </div>

        <div style={{ marginTop: 12 }}>
          {posts.length === 0 ? (
            <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12 }}>
              <p style={{ margin: 0, color: '#6b7280' }}>No tens publicacions encara. Crea la primera!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {posts.map(p => (
                <div key={p.id} style={{ padding: 12, borderRadius: 8, background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{username}</div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <button className="action-btn ghost" onClick={() => deletePost(p.id)}>Eliminar</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>{p.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
