import React, { useEffect, useState, useRef } from 'react';

const Profile: React.FC = () => {
  const username = (() => {
    try { return localStorage.getItem('protube_username') || 'Mi canal'; } catch (e) { return 'Mi canal'; }
  })();

  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<Array<{ id: number; text: string; createdAt: number; author?: string }>>(() => {
    try { return JSON.parse(localStorage.getItem('protube_channel_posts') || '[]'); } catch (e) { return []; }
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try { localStorage.setItem('protube_channel_posts', JSON.stringify(posts)); } catch (e) {}
  }, [posts]);

  const dispatchToast = (msg: string) => {
    try { window.dispatchEvent(new CustomEvent('protube:toast', { detail: { message: msg } })); } catch (e) {}
  };

  const handlePublish = () => {
    const text = postText.trim();
    if (!text) return dispatchToast('El text està buit');
    const next = [{ id: Date.now(), text, createdAt: Date.now(), author: username }, ...posts];
    setPosts(next);
    setPostText('');
    dispatchToast('Publicació creada');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // Save a lightweight record of uploaded video
    try {
      const raw = localStorage.getItem('protube_channel_videos') || '[]';
      const arr = JSON.parse(raw) as Array<any>;
      const entry = { id: Date.now(), name: f.name, title: f.name, uploadedAt: Date.now() };
      arr.unshift(entry);
      localStorage.setItem('protube_channel_videos', JSON.stringify(arr));
      dispatchToast('Vídeo pujat correctament');
    } catch (e) {
      dispatchToast('Error en pujar el vídeo');
    }
    // clear input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGoLive = () => {
    // placeholder
    if (!window.confirm('Vols iniciar una emision en directe (simulada)?')) return;
    dispatchToast('Emissió en directe iniciada (simulada)');
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <div className="channel-header">
        <div className="channel-avatar">{(username || 'U').charAt(0).toUpperCase()}</div>
        <div className="channel-meta">
          <h1 className="channel-title">{username}</h1>
          <div className="channel-handle">@{username.replace(/\s+/g, '')}</div>
          <p className="channel-desc">Més informació sobre aquest canal ...<span style={{ color: '#0b66ff', marginLeft: 6 }}>més</span></p>

          <div className="channel-actions">
            <button className="action-btn">Personalitza el canal</button>
            <button className="action-btn secondary">Gestiona els vídeos</button>
          </div>
        </div>
      </div>

      <div className="channel-postbox">
        <div className="postbox-header">
          <div className="postbox-avatar">{(username || 'U').charAt(0).toUpperCase()}</div>
          <textarea placeholder="En què estàs pensant?" rows={3} value={postText} onChange={e => setPostText(e.target.value)} />
        </div>
        <div className="postbox-actions">
          <div className="postbox-tools">
            <button className="ghost">Imatge</button>
            <button className="ghost">Enquesta d'imatge</button>
            <button className="ghost">Enquesta de text</button>
            <button className="ghost">Qüestionari</button>
            <button className="ghost" onClick={handleUploadClick}>Vídeo</button>
            <input ref={fileInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFile} />
            <button className="ghost" onClick={handleGoLive}>Emet en directe</button>
          </div>
          <div>
            <button className="action-btn" onClick={handlePublish}>Publica</button>
          </div>
        </div>
      </div>

      <div className="channel-tabs">
        <button className="tab active">Publicades</button>
        <button className="tab">Programades</button>
        <button className="tab">Arxivades</button>
      </div>

      <div style={{ marginTop: 16 }}>
        {posts.length === 0 ? (
          <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12 }}>
            <p style={{ margin: 0, color: '#6b7280' }}>Aquí es mostraran els vídeos publicats del canal i publicacions.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts.map(p => (
              <div key={p.id} style={{ padding: 12, borderRadius: 8, background: '#fff', border: '1px solid #eef2f7' }}>
                <div style={{ fontWeight: 700 }}>{p.author}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{new Date(p.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 8 }}>{p.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
