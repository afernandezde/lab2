import { getEnv } from '../utils/Env';
import { VideoItem } from '../useAllVideos';
import { Link } from 'react-router-dom';

interface VideoGridProps {
  videos: VideoItem[];
}

const VideoGrid = ({ videos }: VideoGridProps) => {
  return (
    <div className="video-grid">
      {videos.map((v) => (
        <div key={v.name} className="video-item">
          <Link
            to={`/video/${encodeURIComponent(v.name)}`}
            state={{ video: v }}
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={() =>
              console.log(
                `Video click: name=${videos}, title=${v.title ?? '(no title)'}, poster=${v.posterUrl}`
              )
            }
          >
            <img src={v.posterUrl} alt={v.name} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
            <p style={{ marginTop: 8, textAlign: 'center' }}>{v.title ?? v.name.split('.').slice(0, -1).join('.').replace(/_/g, ' ')}</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
