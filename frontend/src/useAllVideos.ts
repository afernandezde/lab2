import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { getEnv } from './utils/Env';

type LoadingState = 'loading' | 'success' | 'error' | 'idle';

// Use full video objects endpoint so we can display real titles, not UUID-based filenames
const ALL_VIDEOS_URL = `${getEnv().API_BASE_URL}/videos/all`;
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
        const response = await axios.get<any[]>(ALL_VIDEOS_URL);
        if (response.status === 200) {
          const mapped = await Promise.all(
            response.data.map(async (u) => {
              // Support both string responses ("/media/1.mp4") and full Video objects ({ fileName, title, description, videoId })
              let raw: string | undefined;
              let titleFromObj: string | undefined;
              let descriptionFromObj: string | undefined;
              let videoIdFromObj: string | undefined;
              if (typeof u === 'string') {
                raw = u;
              } else if (u && typeof u === 'object') {
                // candidate fields that might hold filename/url
                raw = u.fileName ?? u.file ?? u.videoUrl ?? u.path ?? undefined;
                titleFromObj = u.title ?? undefined;
                descriptionFromObj = u.description ?? undefined;
                videoIdFromObj = u.videoId ?? u.id ?? undefined;
              }

              // If still no raw string, fallback to JSON-stringified representation (safe guard)
              const rawStr = raw ?? JSON.stringify(u);

              // Remove any path and extension for display name
              const filename = rawStr.split('/').pop() || rawStr;
              const base = filename.replace(/\.[^/.]+$/, ''); // remove extension
              const name = base; // display name without extension

              // Compute videoUrl (absolute URLs are kept; otherwise use backend media handler)
              const videoUrl = (rawStr.startsWith('http://') || rawStr.startsWith('https://'))
                ? rawStr
                : `${MEDIA_BASE_URL}/${filename}`;

              // Poster: backend stores posters as <base>.webp (e.g. '1.webp')
              const posterFilename = `${base}.webp`;
              const posterUrl = (posterFilename.startsWith('http://') || posterFilename.startsWith('https://'))
                ? posterFilename
                : `${MEDIA_BASE_URL}/${posterFilename}`;

              // Try to fetch metadata JSON at <base>.json but prefer title/description from backend object
              let title: string | undefined = titleFromObj;
              let description: string | undefined = descriptionFromObj;
              let channel: string | undefined;
              let viewCount: number | undefined;
              let likeCount: number | undefined;
              let durationSeconds: number | undefined;

              if (!title || !description || viewCount == null || likeCount == null || durationSeconds == null) {
                // Try multiple candidate metadata paths to be resilient against naming differences.
                const candidateMetaPaths = [
                  `${MEDIA_BASE_URL}/${base}.json`,
                  `${MEDIA_BASE_URL}/${filename}.json`,
                ];
                if (videoIdFromObj) candidateMetaPaths.push(`${MEDIA_BASE_URL}/${videoIdFromObj}.json`);

                let gotMeta = false;
                for (const metaUrl of candidateMetaPaths) {
                  try {
                    console.debug('Fetching metadata for', base, '->', metaUrl);
                    const metaResp = await axios.get(metaUrl);
                    if (metaResp.status === 200 && metaResp.data) {
                      const data = metaResp.data;
                      const meta = data.meta || {};
                      // Title can be at root; description usually inside meta
                      title = title ?? (data.title || meta.title);
                      description = description ?? (data.description || meta.description);
                      channel = channel ?? (data.channel || meta.channel || data.user || data.author || meta.author || data.uploader);
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
                      gotMeta = true;
                      break;
                    }
                  } catch (e: any) {
                    console.debug('Metadata fetch failed for', metaUrl, (e && e.message) || e);
                  }
                }

                if (!gotMeta && typeof (u as any) === 'object' && (u as any).meta) {
                  // If the backend already included `meta` in the object, prefer it
                  const data = u as any;
                  const meta = data.meta || {};
                  title = title ?? (data.title || meta.title);
                  description = description ?? (data.description || meta.description);
                  channel = channel ?? (data.channel || meta.channel || data.user || data.author || meta.author || data.uploader);
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
              }

              return { name, videoUrl, posterUrl, title, description, channel, viewCount, likeCount, durationSeconds, videoId: videoIdFromObj };
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
