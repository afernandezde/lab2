import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { getEnv } from './utils/Env';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';

// Use full video objects endpoint so we can display real titles, not UUID-based filenames
const ALL_VIDEOS_URL = `${getEnv().API_BASE_URL}/videos/all`;
const MEDIA_BASE_URL = getEnv().MEDIA_BASE_URL;
export type VideoItem = { name: string; videoUrl: string; posterUrl: string; title?: string; description?: string; userId?: string };
export function useAllVideos() {
  const [value, setValue] = useState<VideoItem[]>([]);
  const [message, setMessage] = useState<string>('Loading...');
  const [loading, setLoading] = useState<LoadingState>('idle');

  useEffect(() => {
    const getVideos = async () => {
      try {
        setLoading('loading');
        const response = await axios.get<any[]>(ALL_VIDEOS_URL);
        if (response.status === 200) {
          const mapped = response.data.map(v => {
            const filename = v.fileName;
            const base = filename.replace(/\.[^/.]+$/, '');
            const videoUrl = `${MEDIA_BASE_URL}/${filename}`;
            const posterUrl = `${MEDIA_BASE_URL}/${base}.webp`;
            return {
              name: filename,
              videoUrl,
              posterUrl,
              title: v.title || base,
              description: v.description || '',
              userId: v.userId
            };
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
