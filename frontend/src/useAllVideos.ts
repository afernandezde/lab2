import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { getEnv } from './utils/Env';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';

const ALL_VIDEOS_URL = `${getEnv().API_BASE_URL}/videos`;
const MEDIA_BASE_URL = getEnv().MEDIA_BASE_URL;
export type VideoItem = {
  name: string;
  videoUrl: string;
  posterUrl: string;
  title?: string;
  description?: string;
  videoId?: string; // backend UUID (if resolved elsewhere)
  channel?: string;
  viewCount?: number;
  likeCount?: number;
  durationSeconds?: number;
};
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
          const mapped = await Promise.all(
            response.data.map(async (u) => {
              // Remove any path and extension for display name
              const filename = u.split('/').pop() || u;
              const base = filename.replace(/\.[^/.]+$/, ''); // remove extension
              const name = base; // display name without extension
              // Compute videoUrl (absolute URLs are kept; otherwise use backend media handler)
              const videoUrl = (u.startsWith('http://') || u.startsWith('https://'))
                ? u
                : `${MEDIA_BASE_URL}/${filename}`;

              // Poster: backend stores posters as <base>.webp (e.g. '1.webp')
              const posterFilename = `${base}.webp`;
              const posterUrl = (posterFilename.startsWith('http://') || posterFilename.startsWith('https://'))
                ? posterFilename
                : `${MEDIA_BASE_URL}/${posterFilename}`;

              // Try to fetch metadata JSON at <base>.json
              let title: string | undefined;
              let description: string | undefined;
              let channel: string | undefined;
              let viewCount: number | undefined;
              let likeCount: number | undefined;
              let durationSeconds: number | undefined;
              try {
                const metaUrl = `${MEDIA_BASE_URL}/${base}.json`;
                console.debug('Fetching metadata for', base, '->', metaUrl);
                const metaResp = await axios.get(metaUrl);
                if (metaResp.status === 200 && metaResp.data) {
                  const data = metaResp.data;
                  const meta = data.meta || {};
                  // Title can be at root; description usually inside meta
                  title = data.title || meta.title;
                  description = data.description || meta.description;
                  channel = data.channel || meta.channel || data.user || data.author || meta.author || data.uploader;
                  // normalize numeric metrics safely (prefer nested meta, then root)
                  const vcRaw = meta.view_count ?? data.view_count ?? meta.views ?? data.views ?? data.viewCount ?? meta.viewCount;
                  if (vcRaw != null) {
                    const num = Number(vcRaw);
                    if (!Number.isNaN(num) && num >= 0) viewCount = num;
                  }
                  const lcRaw = meta.like_count ?? data.like_count ?? meta.likes ?? data.likes ?? data.likeCount ?? meta.likeCount;
                  if (lcRaw != null) {
                    const num = Number(lcRaw);
                    if (!Number.isNaN(num) && num >= 0) likeCount = num;
                  }
                  const durRaw = data.duration ?? meta.duration ?? data.length_seconds ?? meta.length_seconds ?? data.length ?? meta.length ?? data.durationSeconds ?? meta.durationSeconds;
                  if (durRaw != null) {
                    const num = Number(durRaw);
                    if (!Number.isNaN(num) && num >= 0) durationSeconds = num;
                  }
                }
              } catch (e: any) {
                console.debug('Metadata fetch failed for', base, (e && e.message) || e);
                // ignore if metadata not present
              }

              return { name, videoUrl, posterUrl, title, description, channel, viewCount, likeCount, durationSeconds };
            })
          );
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
