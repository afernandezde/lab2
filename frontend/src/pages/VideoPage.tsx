import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { VideoItem } from '../useAllVideos';

// The VideoPage expects that the navigation passes the VideoItem
// through location.state. If not present, we reconstruct basic URLs
// using the name param.
export default function VideoPage() {
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const state = location.state as { video?: VideoItem } | undefined;
  const video = state?.video;

  // If we didn't get full video info, build URLs from name
  const mediaBase = (window as any).__VITE_MEDIA_BASE__ || '';
  const videoUrl = video?.videoUrl ?? `${mediaBase}/${name}`;
  const posterUrl = video?.posterUrl ?? `${mediaBase}/${name.replace(/\.[^/.]+$/, '')}.webp`;
  const title = video?.name ?? name ?? '';
  const description = video ? (video as any).description ?? '' : '';

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>{title}</h1>
      {description && <p>{description}</p>}
      <div>
        <video controls width="100%" poster={posterUrl}>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
