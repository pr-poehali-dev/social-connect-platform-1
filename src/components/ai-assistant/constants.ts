export const OLESYA_AVATAR = 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/33e3739a-a831-4bf6-8b23-6a88b399f079.jpg';
export const AI_URL = 'https://functions.poehali.dev/f0b3dae9-2298-428f-befa-830af5d46625';
export const ANIMATE_URL = 'https://functions.poehali.dev/d79fde84-e2a9-4f7a-b135-37b4570e1e0b';
export const TTS_URL = 'https://functions.poehali.dev/0baa4b34-c94f-452c-a527-5fdf417fda39';

const VIDEO_CACHE_KEY = 'olesya_video_cache';
const MAX_CACHE_SIZE = 30;

export const STICKERS: Record<string, { url: string; label: string }> = {
  love: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/c4e780c1-1a18-421c-a718-ec0832838733.jpg',
    label: 'Влюблена'
  },
  kiss: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/22a0b0ea-bc4c-44d3-a6d8-583138dc9a71.jpg',
    label: 'Поцелуй'
  },
  laugh: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/2263c5cf-7ffa-4a8d-9e9d-7bf8063e4f33.jpg',
    label: 'Хаха'
  },
  shy: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/7fed2694-7409-407f-80d9-e8e1662efe98.jpg',
    label: 'Стесняюсь'
  },
  sad: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/d7c22dd1-794a-4c05-bf8c-00f9fb581988.jpg',
    label: 'Грущу'
  },
  angry: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/c2f0c135-9de9-4e8c-9b61-df002e9af3d3.jpg',
    label: 'Обижена'
  }
};

export const STICKER_REGEX = /\[sticker:(\w+)\]/g;
export const VOICE_REGEX = /\[voice:([^\]]+)\]/g;

export interface CachedVideo {
  key: string;
  url: string;
  ts: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

export type MessagePart =
  | { type: 'text'; value: string }
  | { type: 'sticker'; id: string }
  | { type: 'voice'; text: string };

export function getVideoCache(): CachedVideo[] {
  try {
    return JSON.parse(localStorage.getItem(VIDEO_CACHE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getCachedVideo(text: string): string | null {
  const key = text.trim().toLowerCase().slice(0, 250);
  const cache = getVideoCache();
  const found = cache.find(c => c.key === key);
  return found ? found.url : null;
}

export function setCachedVideo(text: string, url: string) {
  const key = text.trim().toLowerCase().slice(0, 250);
  let cache = getVideoCache();
  cache = cache.filter(c => c.key !== key);
  cache.unshift({ key, url, ts: Date.now() });
  if (cache.length > MAX_CACHE_SIZE) {
    cache = cache.slice(0, MAX_CACHE_SIZE);
  }
  try {
    localStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(cache));
  } catch {
    localStorage.removeItem(VIDEO_CACHE_KEY);
  }
}

export function parseMessageContent(content: string): MessagePart[] {
  const parts: MessagePart[] = [];

  const combined = new RegExp(`${STICKER_REGEX.source}|${VOICE_REGEX.source}`, 'g');
  let lastIndex = 0;
  let match;

  while ((match = combined.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index).trim();
      if (textBefore) parts.push({ type: 'text', value: textBefore });
    }
    if (match[1]) {
      parts.push({ type: 'sticker', id: match[1] });
    } else if (match[2]) {
      parts.push({ type: 'voice', text: match[2] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex).trim();
    if (remaining) parts.push({ type: 'text', value: remaining });
  }

  if (parts.length === 0) parts.push({ type: 'text', value: content });

  return parts;
}
