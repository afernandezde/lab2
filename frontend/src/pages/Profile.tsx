import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

type ChannelVideo = { name: string; title: string; posterUrl?: string; createdAt: number; published?: boolean };
type Post = { id: string; text: string; image?: string; video?: string; createdAt: number };

const STORAGE_KEY = 'protube_channel_videos';
const POSTS_KEY = 'protube_channel_posts';
const PROFILE_KEY = 'protube_channel_profile';

type ChannelProfile = { title: string; description?: string; avatarDataUrl?: string };

const Profile: React.FC = () => {
  const username = (() => { try { return localStorage.getItem('protube_username') || 'Mi canal'; } catch { return 'Mi canal'; } })();

  const [videos, setVideos] = useState<ChannelVideo[]>(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } });

  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<Post[]>(() => { try { return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]'); } catch { return []; } });
  const postTextRef = useRef<HTMLTextAreaElement | null>(null);
  
  const [postMedia, setPostMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const postMediaInputRef = useRef<HTMLInputElement | null>(null);
  
  const location = useLocation();

  useEffect(() => {
    const onStorage = () => { try { setVideos(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { setVideos([]); } };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => { const h = location.hash || window.location.hash; if (h === '#post') setTimeout(() => postTextRef.current?.focus(), 50); }, [location]);

  const saveVideos = (next: ChannelVideo[]) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setVideos(next); } catch {} };
  const savePosts = (next: Post[]) => { try { localStorage.setItem(POSTS_KEY, JSON.stringify(next)); setPosts(next); } catch {} };

  const createPost = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = postText.trim();
    if (!text && !postMedia) return;
    
    const p: Post = { 
        id: String(Date.now()) + Math.random().toString(36).slice(2,8), 
        text, 
        image: postMedia?.type === 'image' ? postMedia.url : undefined,
        video: postMedia?.type === 'video' ? postMedia.url : undefined,
        createdAt: Date.now() 
    };
    
    const next = [p, ...posts];
    savePosts(next);
    setPostText('');
    setPostMedia(null);
  };

  const deletePost = (id: string) => { if (!window.confirm('Eliminar aquesta publicació?')) return; const next = posts.filter(p => p.id !== id); savePosts(next); };

  const [profile, setProfile] = useState<ChannelProfile>(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') as ChannelProfile || { title: localStorage.getItem('protube_username') || 'Mi canal' }; } catch { return { title: localStorage.getItem('protube_username') || 'Mi canal' }; } });
  const [customOpen, setCustomOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(profile.title || '');
  const [editDesc, setEditDesc] = useState(profile.description || '');
  const [editAvatarDataUrl, setEditAvatarDataUrl] = useState<string | undefined>(profile.avatarDataUrl);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => { setEditTitle(profile.title || localStorage.getItem('protube_username') || 'Mi canal'); setEditDesc(profile.description || ''); setEditAvatarDataUrl(profile.avatarDataUrl); }, [profile]);

  const saveProfile = () => { const next: ChannelProfile = { title: editTitle || (localStorage.getItem('protube_username') || 'Mi canal'), description: editDesc || '', avatarDataUrl: editAvatarDataUrl }; try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); setProfile(next); } catch {} setCustomOpen(false); };
  const handleAvatarFile = (f: File | null) => { if (!f) return; const r = new FileReader(); r.onload = () => setEditAvatarDataUrl(String(r.result || '')); r.readAsDataURL(f); };
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  
  const onChoosePostMedia = (file: File | null) => { 
      if (!file) return; 
      const r = new FileReader(); 
      r.onload = () => {
          const type = file.type.startsWith('video/') ? 'video' : 'image';
          setPostMedia({ type, url: String(r.result || '') }); 
      };
      r.readAsDataURL(file); 
  };
  
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [commentSubTab, setCommentSubTab] = useState<'made' | 'received'>('made');
  const [userComments, setUserComments] = useState<Array<{ id: string; videoId: string; titulo: string; descripcion: string }>>([]);
  const [receivedComments, setReceivedComments] = useState<Array<{ id: string; videoId: string; titulo: string; descripcion: string; userId: string }>>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [videoMap, setVideoMap] = useState<Record<string, { title: string, fileName: string }>>({});

  useEffect(() => {
      if (activeTab === 'comments') {
          const uid = localStorage.getItem('protube_username') || localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
          if (uid) {
              setCommentsLoading(true);
              
              const p1 = fetch(`/api/comentaris/user/${uid}`).then(res => res.ok ? res.json() : []);
              
              const p2 = fetch('/api/videos/all')
                  .then(res => res.ok ? res.json() : [])
                  .then(async (allVideos: any[]) => {
                      // Create video map
                      const vMap: Record<string, { title: string, fileName: string }> = {};
                      allVideos.forEach(v => {
                          vMap[v.videoId] = { title: v.title || v.fileName, fileName: v.fileName };
                      });
                      setVideoMap(vMap);

                      const myVideos = allVideos.filter(v => v.userId === uid);
                      const myVideoIds = new Set(myVideos.map(v => v.videoId));
                      
                      const resMap = await fetch('/api/comentaris/map');
                      if (resMap.ok) {
                          const map: Record<string, any[]> = await resMap.json();
                          let received: any[] = [];
                          Object.keys(map).forEach(vid => {
                              if (myVideoIds.has(vid)) {
                                  const comments = map[vid].map(c => ({ ...c, videoId: vid }));
                                  received = [...received, ...comments];
                              }
                          });
                          return received;
                      }
                      return [];
                  });

              Promise.all([p1, p2])
                  .then(([made, received]) => {
                      setUserComments(made);
                      setReceivedComments(received);
                  })
                  .catch(() => {
                      setUserComments([]);
                      setReceivedComments([]);
                  })
                  .finally(() => setCommentsLoading(false));
          }
      }
  }, [activeTab]);

  const deleteUserComment = async (cid: string) => {
      if (!window.confirm('Eliminar aquest comentari?')) return;
      try {
          const res = await fetch(`/api/comentaris/${cid}`, { method: 'DELETE' });
          if (res.ok) {
              setUserComments(prev => prev.filter(c => c.id !== cid));
          }
      } catch (e) {}
  };

  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <div className="channel-header">
        <div className="channel-avatar">{profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }} /> : (username || 'U').charAt(0).toUpperCase()}</div>
        <div className="channel-meta">
          <h1 className="channel-title">{profile.title || username}</h1>
          <div className="channel-handle">@{(profile.title || username).replace(/\s+/g, '')}</div>
          <p className="channel-desc">{(() => { const full = profile.description || 'Més informació sobre aquest canal ...'; const needTruncate = full.length > 140; if (!profile.description) return (<>{full} <button type="button" className="link-like" onClick={() => setCustomOpen(true)} style={{ marginLeft: 6 }}>més</button></>); return (<>{descExpanded || !needTruncate ? full : (full.slice(0, 140) + '...')}{needTruncate && (<button type="button" className="link-like" onClick={() => setDescExpanded(s => !s)} style={{ marginLeft: 6 }}>{descExpanded ? 'menys' : 'més'}</button>)}</>); })()}</p>
          <div className="channel-actions"><button className="action-btn" onClick={() => setCustomOpen(true)}>Personalitza el canal</button><button className="action-btn secondary" onClick={() => navigate('/my-videos')}>Gestiona els vídeos</button></div>
        </div>
      </div>

      {activeTab === 'posts' && (
      <div className="channel-postbox">
        <form onSubmit={createPost} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="postbox-header">
            <div className="postbox-avatar">{profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }} /> : (username || 'U').charAt(0).toUpperCase()}</div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <textarea ref={postTextRef} value={postText} onChange={e => setPostText(e.target.value)} placeholder="Crea una publicació" rows={2} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <label className="postbox-tools" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <input ref={el => { postMediaInputRef.current = el; }} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => onChoosePostMedia(e.target.files ? e.target.files[0] : null)} />
                  <button type="button" className="ghost" onClick={() => postMediaInputRef.current?.click()}>Afegeix foto/vídeo</button>
                  {postMedia && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {postMedia.type === 'image' ? 
                            <img src={postMedia.url} alt="preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} /> :
                            <video src={postMedia.url} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                          }
                          <button type="button" className="ghost" onClick={() => setPostMedia(null)}>Eliminar</button>
                      </div>
                  )}
                </label>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ color: '#6b7280' }}>{posts.length} publicacions</div><div><button className="action-btn" type="submit">Publica</button></div></div>
        </form>
      </div>
      )}

      <div style={{ marginTop: 16 }}>
        <div className="channel-tabs" style={{ marginTop: 0 }}>
            <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Publicades</button>
            <button className={`tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>Comentaris</button>
        </div>
        
        {activeTab === 'posts' ? (
        <div style={{ marginTop: 12 }}>{posts.length === 0 ? (<div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12 }}><p style={{ margin: 0, color: '#6b7280' }}>No tens publicacions encara. Crea la primera!</p></div>) : (<div style={{ display: 'grid', gap: 12 }}>{posts.map(p => (<div key={p.id} style={{ padding: 12, borderRadius: 8, background: '#fff' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: 700 }}>{username}</div><div style={{ color: '#6b7280', fontSize: 13 }}>{new Date(p.createdAt).toLocaleString()}</div></div><div><button className="action-btn ghost" onClick={() => deletePost(p.id)}>Eliminar</button></div></div><div style={{ marginTop: 8 }}>{p.text}</div>
        {p.image && (<div style={{ marginTop: 8 }}><img src={p.image} alt="post image" style={{ maxWidth: '100%', borderRadius: 8 }} /></div>)}
        {p.video && (<div style={{ marginTop: 8 }}><video src={p.video} controls style={{ maxWidth: '100%', borderRadius: 8 }} /></div>)}
        </div>))}</div>)}</div>
        ) : (
            <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, borderBottom: '1px solid #eef2f7', paddingBottom: 8 }}>
                    <button 
                        onClick={() => setCommentSubTab('made')}
                        style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', 
                            fontWeight: commentSubTab === 'made' ? 700 : 400,
                            color: commentSubTab === 'made' ? '#000' : '#6b7280',
                            borderBottom: commentSubTab === 'made' ? '2px solid #000' : 'none',
                            paddingBottom: 4
                        }}
                    >
                        Fets per mi
                    </button>
                    <button 
                        onClick={() => setCommentSubTab('received')}
                        style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', 
                            fontWeight: commentSubTab === 'received' ? 700 : 400,
                            color: commentSubTab === 'received' ? '#000' : '#6b7280',
                            borderBottom: commentSubTab === 'received' ? '2px solid #000' : 'none',
                            paddingBottom: 4
                        }}
                    >
                        En els meus vídeos
                    </button>
                </div>

                {commentsLoading ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Carregant comentaris...</div>
                ) : (
                    <>
                        {commentSubTab === 'made' && (
                            <div>
                                {userComments.length === 0 ? (
                                    <div style={{ padding: 16, border: '1px solid #eef2f7', borderRadius: 8 }}><p style={{ margin: 0, color: '#6b7280' }}>No has fet cap comentari.</p></div>
                                ) : (
                                    <div style={{ display: 'grid', gap: 12 }}>
                                        {userComments.map(c => {
                                            const vInfo = videoMap[c.videoId];
                                            return (
                                                <div key={c.id} style={{ padding: 12, borderRadius: 8, background: '#fff' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                                En el vídeo: {vInfo ? <Link to={`/video/${encodeURIComponent(vInfo.fileName)}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{vInfo.title}</Link> : c.videoId}
                                                            </div>
                                                            <div style={{ marginTop: 4 }}>{c.descripcion || c.titulo}</div>
                                                        </div>
                                                        <button onClick={() => deleteUserComment(c.id)} className="action-btn ghost">Eliminar</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {commentSubTab === 'received' && (
                            <div>
                                {receivedComments.length === 0 ? (
                                    <div style={{ padding: 16, border: '1px solid #eef2f7', borderRadius: 8 }}><p style={{ margin: 0, color: '#6b7280' }}>No has rebut cap comentari.</p></div>
                                ) : (
                                    <div style={{ display: 'grid', gap: 12 }}>
                                        {receivedComments.map(c => {
                                            const vInfo = videoMap[c.videoId];
                                            return (
                                                <div key={c.id} style={{ padding: 12, borderRadius: 8, background: '#fff' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                                                                De: {c.userId} en {vInfo ? <Link to={`/video/${encodeURIComponent(vInfo.fileName)}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{vInfo.title}</Link> : c.videoId}
                                                            </div>
                                                            <div style={{ marginTop: 4 }}>{c.descripcion || c.titulo}</div>
                                                        </div>
                                                        <button onClick={() => deleteUserComment(c.id)} className="action-btn ghost">Eliminar</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        )}
      </div>

      {customOpen && (<div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}><div style={{ width: 720, maxWidth: 'calc(100% - 40px)', background: '#fff', borderRadius: 12, padding: 18 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><h3 style={{ margin: 0 }}>Personalitza el canal</h3><button className="ghost" onClick={() => setCustomOpen(false)}>✕</button></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}><div><label style={{ display: 'block', marginBottom: 6 }}>Nom del canal</label><input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }} /><label style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>Descripció</label><textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ width: '100%', minHeight: 100, padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }} /></div><div style={{ textAlign: 'center' }}><div style={{ width: 160, height: 160, margin: '0 auto 8px', borderRadius: 999, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{editAvatarDataUrl ? <img src={editAvatarDataUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ color: '#9ca3af' }}>No avatar</div>}</div><input ref={el => { avatarInputRef.current = el; }} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleAvatarFile(e.target.files ? e.target.files[0] : null)} /><div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}><button className="action-btn" onClick={() => avatarInputRef.current?.click()}>Tria avatar</button><button className="action-btn ghost" onClick={() => setEditAvatarDataUrl(undefined)}>Elimina</button></div></div></div><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}><button className="ghost" onClick={() => setCustomOpen(false)}>Cancel·la</button><button className="action-btn" onClick={saveProfile}>Desa</button></div></div></div>)}
    </div>
  );
};

export default Profile;
