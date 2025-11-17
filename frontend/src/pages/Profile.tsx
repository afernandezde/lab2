import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
  image?: string; // data URL
  createdAt: number;
};

const STORAGE_KEY = 'protube_channel_videos';
const POSTS_KEY = 'protube_channel_posts';
const PROFILE_KEY = 'protube_channel_profile';

type ChannelProfile = {
  title: string;
  description?: string;
  avatarDataUrl?: string;
};

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
  const [postImage, setPostImage] = useState<string | null>(null);
  const postImageInputRef = useRef<HTMLInputElement | null>(null);
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
    const p: Post = { id: String(Date.now()) + Math.random().toString(36).slice(2,8), text, image: postImage || undefined, createdAt: Date.now() };
    const next = [p, ...posts];
    savePosts(next);
    setPostText('');
    setPostImage(null);
  };

  const deletePost = (id: string) => {
    if (!window.confirm('Eliminar aquesta publicació?')) return;
    const next = posts.filter(p => p.id !== id);
    savePosts(next);
  };

  // channel profile (title, description, avatar)
  const [profile, setProfile] = useState<ChannelProfile>(() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') as ChannelProfile || { title: localStorage.getItem('protube_username') || 'Mi canal' }; } catch (e) { return { title: localStorage.getItem('protube_username') || 'Mi canal' }; }
  });
  const [customOpen, setCustomOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(profile.title || '');
  const [editDesc, setEditDesc] = useState(profile.description || '');
  const [editAvatarDataUrl, setEditAvatarDataUrl] = useState<string | undefined>(profile.avatarDataUrl);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    // ensure edit fields update if profile changes externally
    setEditTitle(profile.title || localStorage.getItem('protube_username') || 'Mi canal');
    setEditDesc(profile.description || '');
    setEditAvatarDataUrl(profile.avatarDataUrl);
  }, [profile]);

  const saveProfile = () => {
    const next: ChannelProfile = { title: editTitle || (localStorage.getItem('protube_username') || 'Mi canal'), description: editDesc || '', avatarDataUrl: editAvatarDataUrl };
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); setProfile(next); } catch (e) {}
    setCustomOpen(false);
  };

  const handleAvatarFile = (f: File | null) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const data = String(r.result || '');
      setEditAvatarDataUrl(data);
    };
    r.readAsDataURL(f);
  };

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const onChoosePostImage = (file: File | null) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const data = String(r.result || '');
      setPostImage(data);
    };
    r.readAsDataURL(file);
  };

  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <div className="channel-header">
        <div className="channel-avatar">
          {profile.avatarDataUrl ? (
            <img src={profile.avatarDataUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }} />
          ) : (
            (username || 'U').charAt(0).toUpperCase()
          )}
        </div>
        <div className="channel-meta">
          <h1 className="channel-title">{profile.title || username}</h1>
          <div className="channel-handle">@{(profile.title || username).replace(/\s+/g, '')}</div>
          <p className="channel-desc">
            {(() => {
              const full = profile.description || 'Més informació sobre aquest canal ...';
              const needTruncate = full.length > 140;
              if (!profile.description) {
                // no description: show placeholder and a button to open customization
                return (
                  <>
                    {full} <button type="button" className="link-like" onClick={() => setCustomOpen(true)} style={{ marginLeft: 6 }}>més</button>
                  </>
                );
              }
              return (
                <>
                  {descExpanded || !needTruncate ? full : (full.slice(0, 140) + '...')}
                  {needTruncate && (
                    <button type="button" className="link-like" onClick={() => setDescExpanded(s => !s)} style={{ marginLeft: 6 }}>{descExpanded ? 'menys' : 'més'}</button>
                  )}
                </>
              );
            })()}
          </p>

          <div className="channel-actions">
            <button className="action-btn" onClick={() => setCustomOpen(true)}>Personalitza el canal</button>
            <button className="action-btn secondary" onClick={() => navigate('/my-videos')}>Gestiona els vídeos</button>
          </div>
        </div>
      </div>

      <div className="channel-postbox">
        <form onSubmit={createPost} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="postbox-header">
            <div className="postbox-avatar">
              {profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }} /> : (username || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <textarea ref={postTextRef} value={postText} onChange={e => setPostText(e.target.value)} placeholder="Crea una publicació" rows={2} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <label className="postbox-tools" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <input ref={el => { postImageInputRef.current = el; }} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onChoosePostImage(e.target.files ? e.target.files[0] : null)} />
                  <button type="button" className="ghost" onClick={() => postImageInputRef.current?.click()}>
                    Afegeix imatge
                  </button>
                  {postImage && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <img src={postImage} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                      <button type="button" className="ghost" onClick={() => setPostImage(null)}>Eliminar imatge</button>
                    </div>
                  )}
                </label>
              </div>
            </div>
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
                  {p.image && (
                    <div style={{ marginTop: 8 }}>
                      <img src={p.image} alt="post image" style={{ maxWidth: '100%', borderRadius: 8 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {customOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
          <div style={{ width: 720, maxWidth: 'calc(100% - 40px)', background: '#fff', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Personalitza el canal</h3>
              <button className="ghost" onClick={() => setCustomOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Nom del canal</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }} />
                <label style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>Descripció</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ width: '100%', minHeight: 100, padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 160, height: 160, margin: '0 auto 8px', borderRadius: 999, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editAvatarDataUrl ? <img src={editAvatarDataUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ color: '#9ca3af' }}>No avatar</div>}
                </div>
                <input ref={el => { avatarInputRef.current = el; }} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleAvatarFile(e.target.files ? e.target.files[0] : null)} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button className="action-btn" onClick={() => avatarInputRef.current?.click()}>Tria avatar</button>
                  <button className="action-btn ghost" onClick={() => setEditAvatarDataUrl(undefined)}>Elimina</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button className="ghost" onClick={() => setCustomOpen(false)}>Cancel·la</button>
              <button className="action-btn" onClick={saveProfile}>Desa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
