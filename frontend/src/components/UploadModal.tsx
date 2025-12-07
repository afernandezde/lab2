import React, { useState, useEffect } from 'react';

type Props = {
  onClose: () => void;
};

type UploadItem = {
  file: File;
  title: string;
  description: string;
  posterUrl?: string;
  thumbnailFile?: File;
  playlist?: string | null;
  visibility: 'private' | 'public';
  progress: number;
  published: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STORAGE_KEY = 'protube_channel_videos';

const UploadModal: React.FC<Props> = ({ onClose }) => {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createdUrls, setCreatedUrls] = useState<string[]>([]);

  useEffect(() => {
    // Revoke created object URLs when the page unloads to avoid leaking
    const handler = () => {
      try {
        createdUrls.forEach((u) => {
          try {
            URL.revokeObjectURL(u);
          } catch (_e) {
            /* intentionally left blank */
          }
        });
      } catch (_e) {
        /* intentionally left blank */
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [createdUrls]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list: UploadItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      list.push({
        file: f,
        title: f.name,
        description: '',
        posterUrl: '',
        playlist: null,
        visibility: 'private',
        progress: 0,
        published: false,
      });
    }
    setItems(list);
    // create preview URLs for each file and store mapping in sessionStorage
    const urls: string[] = [];
    for (const it of list) {
      try {
        const u = URL.createObjectURL(it.file);
        urls.push(u);
        try {
          sessionStorage.setItem('protube_blob_' + it.file.name, u);
        } catch (_e) {
          /* intentionally left blank */
        }
      } catch (_e) {
        /* intentionally left blank */
      }
    }
    setCreatedUrls(urls);
    setPreviewUrl(urls[0] || null);
  };

  // Select a thumbnail file
  const handleThumbnail = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    setItems((prev) => (prev.length ? [{ ...prev[0], thumbnailFile: f }] : prev));
  };

  // Upload to backend API using multipart/form-data with DTO in "meta" plus optional "thumbnail"
  const saveAll = async (publish: boolean) => {
    try {
      const userId = localStorage.getItem('protube_username') || localStorage.getItem('protube_user_id') || 'unknown';

      const results = await Promise.all(
        items.map(async (it) => {
          const meta = {
            userId,
            title: it.title || it.file.name,
            description: it.description || '',
            fileName: it.file.name,
          };
          const form = new FormData();
          form.append('file', it.file);
          if (it.thumbnailFile) {
            form.append('thumbnail', it.thumbnailFile);
          }
          form.append('meta', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
          form.append('published', String(publish));

          const res = await fetch('/api/videos/upload', { method: 'POST', body: form });
          return res.ok;
        })
      );

      const allOk = results.every(Boolean);
      try {
        window.dispatchEvent(new CustomEvent('protube:update', { detail: { type: 'channel_upload' } }));
        window.dispatchEvent(
          new CustomEvent('protube:toast', {
            detail: { message: allOk ? (publish ? 'Vídeos publicats' : 'Vídeos desats') : 'Alguns errors en pujar' },
          })
        );
      } catch (_e) {
        /* intentionally left blank */
      }
    } catch (_e) {
      try {
        window.alert('Error uploading the videos');
      } catch (_e2) {
        /* intentionally left blank */
      }
    } finally {
      onClose();
    }
  };

  if (items.length === 0) {
    return (
      <div className="upload-backdrop" role="dialog" aria-modal="true">
        <div className="upload-modal">
          <div className="upload-header">
            <h3>Penja vídeos</h3>
            <button className="ghost" onClick={onClose} aria-label="Tancar">
              ✕
            </button>
          </div>

          <div className="upload-body">
            <div className="upload-center">
              <div className="upload-icon">↑</div>
              <p className="upload-title">Arrossega i deixa anar els fitxers de vídeo que vols penjar</p>
              <p className="upload-sub">Els teus vídeos seran privats fins que els publiquis</p>

              <label className="upload-choose">
                Selecciona els fitxers
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playlists = (() => {
    try {
      return Object.keys(JSON.parse(localStorage.getItem('protube_playlists') || '{}'));
    } catch (_e) {
      return [];
    }
  })();

  return (
    <div className="upload-backdrop" role="dialog" aria-modal="true">
      <div className="upload-modal" style={{ width: 900, maxWidth: 'calc(100% - 40px)' }}>
        <div className="upload-header">
          <h3>Penja vídeos</h3>
          <button className="ghost" onClick={onClose} aria-label="Tancar">
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, padding: 18 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Títol (obligatori)</label>
            <input
              value={cur.title}
              onChange={(e) => setItems((prev) => [{ ...prev[0], title: e.target.value }])}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6e6e6' }}
            />
            <label style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>Descripció</label>
            <textarea
              value={cur.description}
              onChange={(e) => setItems((prev) => [{ ...prev[0], description: e.target.value }])}
              style={{ width: '100%', minHeight: 160, padding: 10, borderRadius: 8, border: '1px solid #e6e6e6' }}
            />
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="action-btn" onClick={() => saveAll(true)}>
                  Publica
                </button>
              </div>
            </div>
          </div>

          <aside style={{ width: 360, padding: 18, borderLeft: '1px solid #eef2f7', background: '#fafafa' }}>
            <div style={{ marginBottom: 8 }}>
              <div
                style={{
                  background: '#000',
                  height: 200,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {previewUrl ? (
                  <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
                ) : (
                  <div style={{ color: '#9ca3af' }}>Previsualització</div>
                )}
              </div>
            </div>
            <div style={{ marginTop: 8, color: '#6b7280' }}>Nom del fitxer</div>
            <div style={{ fontWeight: 700 }}>{cur.file.name}</div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 6 }}>Miniatura (opcional)</label>
              <input type="file" accept="image/*" onChange={(e) => handleThumbnail(e.target.files)} />
              {cur.thumbnailFile ? (
                <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>
                  Seleccionada: {cur.thumbnailFile.name}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                  Si no n'afegeixes, se generarà automàticament.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
