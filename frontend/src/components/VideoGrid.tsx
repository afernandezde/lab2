import { getEnv } from '../utils/Env';
import { VideoItem } from '../useAllVideos';

interface VideoGridProps {
  videos: VideoItem[];
}

const VideoGrid = ({ videos }: VideoGridProps) => {
  return (
    <div className="video-grid">
      {videos.map((v) => (
        <div key={v.name} className="video-item">
          <video controls width="100%" poster={v.posterUrl}>
            <source src={v.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <p>{v.name.split('.').slice(0, -1).join('.').replace(/_/g, ' ')}</p>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
