import React, { useState, useEffect } from 'react';

type Props = {
  onClose: () => void;
};

type UploadItem = {
  file: File;
  title: string;
  description: string;
  posterUrl?: string;
  playlist?: string | null;
  visibility: 'private' | 'public';
  progress: number;
  published: boolean;
};

const STORAGE_KEY = 'protube_channel_videos';

const UploadModal: React.FC<Props> = ({ onClose }) => {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createdUrls, setCreatedUrls] = useState<string[]>([]);

  useEffect(() => {
    // Revoke created object URLs when the page unloads to avoid leaking
    const handler = () => {
      try { createdUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) {} }); } catch (e) {}
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [createdUrls]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list: UploadItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      list.push({ file: f, title: f.name, description: '', posterUrl: '', playlist: null, visibility: 'private', progress: 0, published: false });
    }
    setItems(list);
    // create preview URLs for each file and store mapping in sessionStorage
    const urls: string[] = [];
    for (const it of list) {
      try {
        const u = URL.createObjectURL(it.file);
        urls.push(u);
        try { sessionStorage.setItem('protube_blob_' + it.file.name, u); } catch (e) {}
      } catch (e) {}
    }
    setCreatedUrls(urls);
    setPreviewUrl(urls[0] || null);
  };

  const saveAll = (publish: boolean) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || '[]';
      let arr = JSON.parse(raw) as any[];
      // copy playlists once and update
      const rawp = localStorage.getItem('protube_playlists') || '{}';
      const playlistsObj = JSON.parse(rawp) as Record<string, string[]>;
      items.forEach(it => {
        const record = { name: it.file.name, title: it.title, posterUrl: it.posterUrl || '', description: it.description, createdAt: Date.now(), published: publish };
        arr = [record, ...arr.filter(a => a.name !== record.name)];
          // no playlist support here (handled elsewhere)
        try { window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'channel_upload' } })); } catch (e) {}
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      try { localStorage.setItem('protube_playlists', JSON.stringify(playlistsObj)); } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('protube:toast', { detail: { message: publish ? 'Vídeos publicats' : 'Vídeos desats com a privat' } })); } catch (e) {}
    } catch (e) {
      try { window.alert('Error desant els vídeos'); } catch (e) {}
    }
    onClose();
  };

  if (items.length === 0) {
    return (
      <div className="upload-backdrop" role="dialog" aria-modal="true">
        <div className="upload-modal">
          <div className="upload-header">
            <h3>Penja vídeos</h3>
            <button className="ghost" onClick={onClose} aria-label="Tancar">✕</button>
          </div>

          <div className="upload-body">
            <div className="upload-center">
              <div className="upload-icon">↑</div>
              <p className="upload-title">Arrossega i deixa anar els fitxers de vídeo que vols penjar</p>
              <p className="upload-sub">Els teus vídeos seran privats fins que els publiquis</p>

              <label className="upload-choose">
                Selecciona els fitxers
                <input type="file" accept="video/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
              </label>
            </div>
          </div>

          <div className="upload-footer" />
        </div>
      </div>
    );
  }

  const cur = items[0];
  // playlists list available
  const playlists = (() => {
    try { return Object.keys(JSON.parse(localStorage.getItem('protube_playlists') || '{}')); } catch (e) { return []; }
  })();

  return (
    <div className="upload-backdrop" role="dialog" aria-modal="true">
      <div className="upload-modal" style={{ width: 900, maxWidth: 'calc(100% - 40px)' }}>
        <div className="upload-header">
          <h3>Penja vídeos</h3>
          <button className="ghost" onClick={onClose} aria-label="Tancar">✕</button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, padding: 18 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Títol (obligatori)</label>
            <input value={cur.title} onChange={e => setItems(prev => [{ ...prev[0], title: e.target.value }])} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6e6e6' }} />
            <label style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>Descripció</label>
            <textarea value={cur.description} onChange={e => setItems(prev => [{ ...prev[0], description: e.target.value }])} style={{ width: '100%', minHeight: 160, padding: 10, borderRadius: 8, border: '1px solid #e6e6e6' }} />
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="action-btn" onClick={() => saveAll(true)}>Publica</button>
              </div>
            </div>
          </div>

          <aside style={{ width: 360, padding: 18, borderLeft: '1px solid #eef2f7', background: '#fafafa' }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ background: '#000', height: 200, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previewUrl ? (
                  <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
                ) : (
                  <div style={{ color: '#9ca3af' }}>Previsualització</div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 8, color: '#6b7280' }}>Nom del fitxer</div>
            <div style={{ fontWeight: 700 }}>{cur.file.name}</div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
