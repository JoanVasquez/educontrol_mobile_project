const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);
const EMBED_BASE_URL = 'https://www.youtube.com/embed/';

export interface YouTubeVideoDescriptor {
  readonly id: string;
  readonly watchUrl: string;
  readonly embedUrl: string;
}

export function buildYouTubeVideoDescriptor(sourceUrl: string): YouTubeVideoDescriptor {
  const videoId = extractYouTubeVideoId(sourceUrl);

  if (!videoId) {
    throw new Error(`Invalid YouTube video URL: ${sourceUrl}`);
  }

  return {
    id: videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `${EMBED_BASE_URL}${videoId}`,
  };
}

export function extractYouTubeVideoId(sourceUrl: string): string | null {
  try {
    const url = new URL(sourceUrl);
    const normalizedHost = url.hostname.toLowerCase();

    if (!YOUTUBE_HOSTS.has(normalizedHost)) {
      return null;
    }

    if (normalizedHost === 'youtu.be') {
      return normalizeVideoId(url.pathname.slice(1));
    }

    if (url.pathname.startsWith('/embed/')) {
      return normalizeVideoId(url.pathname.split('/')[2] ?? '');
    }

    if (url.pathname.startsWith('/shorts/')) {
      return normalizeVideoId(url.pathname.split('/')[2] ?? '');
    }

    return normalizeVideoId(url.searchParams.get('v') ?? '');
  } catch {
    return null;
  }
}

function normalizeVideoId(videoId: string): string | null {
  const trimmedId = videoId.trim();

  return /^[a-zA-Z0-9_-]{11}$/.test(trimmedId) ? trimmedId : null;
}
