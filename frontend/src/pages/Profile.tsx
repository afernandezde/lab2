import React from 'react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const username = (() => {
    try { return localStorage.getItem('protube_username') || 'Mi canal'; } catch (e) { return 'Mi canal'; }
  })();

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
          <textarea placeholder="En què estàs pensant?" rows={3} />
        </div>
        <div className="postbox-actions">
          <div className="postbox-tools">
            <button className="ghost">Imatge</button>
            <button className="ghost">Enquesta d\'imatge</button>
            <button className="ghost">Enquesta de text</button>
            <button className="ghost">Qüestionari</button>
            <button className="ghost">Vídeo</button>
          </div>
          <div>
            <button className="action-btn">Publica</button>
          </div>
        </div>
      </div>

      <div className="channel-tabs">
        <button className="tab active">Publicades</button>
        <button className="tab">Programades</button>
        <button className="tab">Arxivades</button>
      </div>

      <div style={{ marginTop: 16 }}>
        {/* Placeholder for channel's videos list */}
        <div style={{ padding: 24, border: '1px solid #eef2f7', borderRadius: 12 }}>
          <p style={{ margin: 0, color: '#6b7280' }}>Aquí es mostraran els vídeos publicats del canal.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
