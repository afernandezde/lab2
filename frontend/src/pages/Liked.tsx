import React from 'react';
import { Link } from 'react-router-dom';
import { useAllVideos } from '../useAllVideos';

const Liked: React.FC = () => {
  const { value: videos } = useAllVideos();
  const [liked, setLiked] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // determine current user id (stored in localStorage by App on login)
  const userId = React.useMemo(() => {
    try {
      return localStorage.getItem('protube_user');
    } catch (e) {
      return null;
    }
  }, []);

  // if userId exists, fetch likes for that user; otherwise we require registration
  React.useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const uid = userId as string;
        // call backend directly (avoid dev server serving index.html)
        const res = await fetch(`http://localhost:8080/api/likes/user?userId=${encodeURIComponent(uid)}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const likes: Array<{ id: string; userId: string; videoId: string }> = await res.json();
        if (!cancelled) setLiked(likes.map(l => l.videoId));
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Error loading likes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  // no local fallback: require protube_user to view liked videos

  const items = liked.map(name => videos.find(v => v.name === name) || { name, title: name, posterUrl: '' });

  // Require registration to view liked videos
  if (!userId) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
        <h2>Vídeos que m'agraden</h2>
        <p style={{ color: '#6b7280' }}>Has d'estar registrat per veure els vídeos que t'agraden.</p>
      </div>
    );
  }

  // prefer showing server-driven list; display loading/error indicators
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h2>Vídeos que m'agraden</h2>
      {loading ? (
        <p style={{ color: '#6b7280' }}>Carregant...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>Error: {error}</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No hi ha vídeos marcats com a m'agrada.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
          {items.map(v => (
            <li key={v.name} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderRadius: 8, background: '#fff' }}>
              {v.posterUrl ? (
                <img src={v.posterUrl} alt={v.title ?? v.name} style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <div style={{ width: 120, height: 68, background: '#000', borderRadius: 8 }} />
              )}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <Link to={`/video/${encodeURIComponent(v.name)}`} state={{ video: v }} style={{ fontWeight: 700, color: '#111827', textDecoration: 'none' }}>
                  {v.title ?? v.name}
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
