import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { getEnv } from './utils/Env';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';

const ALL_VIDEOS_URL = `${getEnv().API_BASE_URL}/videos`;
const MEDIA_BASE_URL = getEnv().MEDIA_BASE_URL;
export type VideoItem = { name: string; videoUrl: string; posterUrl: string };
export function useAllVideos() {
  const [value, setValue] = useState<VideoItem[]>([]);
  const [message, setMessage] = useState<string>('Loading...');
  const [loading, setLoading] = useState<LoadingState>('idle');

  useEffect(() => {
    const getVideos = async () => {
      try {
        setLoading('loading');
        const response = await axios.get<string[]>(ALL_VIDEOS_URL);
        if (response.status === 200) {
          const mapped = response.data.map((u) => {
            // Remove any path and extension for display name
            const filename = u.split('/').pop() || u;
            const base = filename.replace(/\.[^/.]+$/, ''); // remove extension
            const name = base; // display name without extension
            // Compute videoUrl (absolute URLs are kept; otherwise use backend media handler)
            const videoUrl = (u.startsWith('http://') || u.startsWith('https://'))
              ? u
              : `${MEDIA_BASE_URL}/${filename}`;

            // Poster: backend now stores posters as <base>.webp (e.g. '1.webp'), so use base.webp
            const posterFilename = `${base}.webp`;
            const posterUrl = (posterFilename.startsWith('http://') || posterFilename.startsWith('https://'))
              ? posterFilename
              : `${MEDIA_BASE_URL}/${posterFilename}`;
            return { name, videoUrl, posterUrl };
          });
          setValue(mapped);
        }
        setLoading('success');
      } catch (error: unknown) {
        setLoading('error');
        setMessage('Error fetching videos: ' + (error as AxiosError).message);
      }
    };
    getVideos().then();
  }, []);

  return { value, message, loading };
}
