import { VideoItem } from '../useAllVideos';
import { Link } from 'react-router-dom';

interface VideoGridProps {
  videos: VideoItem[];
}

const formatDuration = (sec?: number) => {
  if (!sec || !isFinite(sec)) return undefined;
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${m}:${ss}`;
};

const VideoGrid = ({ videos }: VideoGridProps) => {
  return (
    <div className="video-grid">
      {videos.map((v) => {
        const displayTitle = (v.title && v.title.trim().length > 0)
          ? v.title
          : v.name.split('.').slice(0, -1).join('.').replace(/_/g, ' ');
        const durationLabel = formatDuration(v.durationSeconds);
        return (
          <div key={v.name} className="video-item" style={{ display: 'flex', flexDirection: 'column' }}>
            <Link
              to={`/video/${encodeURIComponent(v.name)}`}
              state={{ video: v }}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={() => console.log(`Video click: name=${v.name}, title=${v.title ?? '(no title)'}`)}
            >
              <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                <img
                  src={v.posterUrl}
                  alt={displayTitle}
                  style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '16/9', background: '#000' }}
                />
                {durationLabel && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      right: 6,
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      fontSize: 12,
                      padding: '2px 6px',
                      borderRadius: 6,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                    aria-label={`Duración ${durationLabel}`}
                  >
                    {durationLabel}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.3, fontSize: 14 }}>
                  {displayTitle}
                </p>
                <div style={{ marginTop: 4, color: '#6b7280', fontSize: 12 }}>
                  {(() => {
                    const viewsLabel = `${Intl.NumberFormat(undefined, { notation: 'compact' }).format(v.viewCount ?? 0)} visualizaciones`;
                    const likesLabel = `❤ ${Intl.NumberFormat(undefined, { notation: 'compact' }).format(v.likeCount ?? 0)}`;
                    return `${viewsLabel} • ${likesLabel}`;
                  })()}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default VideoGrid;
