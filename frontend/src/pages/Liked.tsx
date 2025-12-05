import React from 'react';
import { Link } from 'react-router-dom';
import { useAllVideos } from '../useAllVideos';

const Liked: React.FC = () => {
  const { value: videos } = useAllVideos();
  const [liked, setLiked] = React.useState<string[]>([]);
  const [isAuth, setIsAuth] = React.useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user'));
    } catch (e) {
      return false;
    }
  });

  React.useEffect(() => {
    let cancelled = false;
    const userId = localStorage.getItem('protube_user_id') || localStorage.getItem('protube_user');
    const load = async () => {
      if (!userId) {
        if (!cancelled) setLiked([]);
        return;
      }
      try {
        const res = await fetch(`/api/likes/user/${encodeURIComponent(userId)}`);
        if (!cancelled && res.ok) {
          const data: string[] = await res.json();
          setLiked(data || []);
          return;
        }
      } catch (e) {}
      if (!cancelled) setLiked([]);
    };
    load();
    const onUpdate = (e: Event) => {
      load();
    };
    window.addEventListener('protube:update', onUpdate as EventListener);
    return () => {
      cancelled = true;
      window.removeEventListener('protube:update', onUpdate as EventListener);
    };
  }, []);

  const items = liked.map((id) => {
    // Backend returns videoId strings; try to resolve to a VideoItem by videoId first,
    // then fall back to matching by name, and finally show the id as a title fallback.
    const byId = videos.find((v) => v.videoId === id);
    if (byId) return byId;
    const byName = videos.find((v) => v.name === id);
    if (byName) return byName;
    return { name: id, title: id, posterUrl: '' } as any;
  });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h2>Vídeos que m'agraden</h2>
      {!isAuth ? (
        <p style={{ color: '#6b7280' }}>Inicia sessió per veure els vídeos que t'agraden.</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No hi ha vídeos marcats com a m'agrada.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {items.map((v) => (
            <li
              key={v.videoId ?? v.name}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                padding: 8,
                borderRadius: 8,
                background: '#fff',
              }}
            >
              {v.posterUrl ? (
                <img
                  src={v.posterUrl}
                  alt={v.title ?? v.name}
                  style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }}
                />
              ) : (
                <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <Link
                  to={`/video/${encodeURIComponent(v.name ?? v.videoId ?? '')}`}
                  state={{ video: v }}
                  style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}
                >
                  {v.title ?? v.name ?? v.videoId}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Liked;
