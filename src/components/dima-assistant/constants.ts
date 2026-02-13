export const DIMA_AVATAR = 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/c3aa3ed3-936d-4ebd-a66e-91d8308059cf.jpg';
export const DIMA_AI_URL = 'https://functions.poehali.dev/86e3df7b-5bbc-4fc7-953e-106e1d9c14c2';
export const ANIMATE_URL = 'https://functions.poehali.dev/d79fde84-e2a9-4f7a-b135-37b4570e1e0b';
export const TTS_URL = 'https://functions.poehali.dev/0baa4b34-c94f-452c-a527-5fdf417fda39';

const VIDEO_CACHE_KEY = 'dima_video_cache';
const MAX_CACHE_SIZE = 30;

export const STICKERS: Record<string, { url: string; label: string }> = {
  love: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/de5f4a0f-cc21-4848-8d69-9a415793c404.jpg',
    label: 'Влюблён'
  },
  kiss: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/76ba5e0c-aba5-46ce-ab64-06e31db3b9e0.jpg',
    label: 'Поцелуй'
  },
  laugh: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/85c66f24-7755-41f7-a143-833bc2decc81.jpg',
    label: 'Хаха'
  },
  shy: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/ef9ae35f-aaf5-44cb-9e3e-3d3896b442af.jpg',
    label: 'Стесняюсь'
  },
  sad: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/630bfa35-c15d-49ac-b00f-66224a3dea05.jpg',
    label: 'Грущу'
  },
  angry: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/14d870f8-c933-4cd8-90fd-37784973bc34.jpg',
    label: 'Обижен'
  }
};

export const PHOTOS: Record<string, { url: string; caption: string }> = {
  cafe: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a6fa5896-2dd0-4ba4-9e69-a75156f80340.jpg',
    caption: 'В кафе на крыше'
  },
  mountains: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/ba74022f-e8b5-4edd-ae20-546d09215450.jpg',
    caption: 'В горах'
  },
  cooking: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/41cbcd52-9a1b-468c-97d4-43c7aa072e10.jpg',
    caption: 'Готовлю ужин'
  },
  guitar: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/b2053cc4-91e5-4e6d-bd5d-e7939d90d179.jpg',
    caption: 'Играю на гитаре'
  },
  city: {
    url: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/3a15e159-57d8-4e8b-bca1-b37492864dcd.jpg',
    caption: 'Вечерняя Москва'
  }
};

export const STICKER_REGEX = /\[sticker:(\w+)\]/g;
export const VOICE_REGEX = /\[voice:(?:(\w+):)?([^\]]+)\]/g;
export const PHOTO_REGEX = /\[photo:(\w+)\]/g;

export interface CachedVideo {
  key: string;
  url: string;
  ts: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
}

export interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

export type VoiceMood = 'whisper' | 'tender' | 'playful' | 'passionate' | 'default';

export const MOOD_LABELS: Record<VoiceMood, string> = {
  whisper: 'шёпот',
  tender: 'нежно',
  playful: 'игриво',
  passionate: 'страстно',
  default: '',
};

export const MOOD_COLORS: Record<VoiceMood, { from: string; to: string; border: string }> = {
  whisper: { from: 'from-slate-400', to: 'to-blue-500', border: 'border-slate-400' },
  tender: { from: 'from-sky-400', to: 'to-blue-500', border: 'border-sky-400' },
  playful: { from: 'from-teal-400', to: 'to-cyan-500', border: 'border-teal-400' },
  passionate: { from: 'from-indigo-500', to: 'to-blue-600', border: 'border-indigo-500' },
  default: { from: 'from-blue-500', to: 'to-cyan-500', border: 'border-blue-400' },
};

export type MessagePart =
  | { type: 'text'; value: string }
  | { type: 'sticker'; id: string }
  | { type: 'voice'; text: string; mood: VoiceMood }
  | { type: 'photo'; id: string };

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

const VALID_MOODS = ['whisper', 'tender', 'playful', 'passionate', 'default'];

export function parseMessageContent(content: string): MessagePart[] {
  const parts: MessagePart[] = [];

  const combined = new RegExp(
    `${STICKER_REGEX.source}|${VOICE_REGEX.source}|${PHOTO_REGEX.source}`, 'g'
  );
  let lastIndex = 0;
  let match;

  while ((match = combined.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index).trim();
      if (textBefore) parts.push({ type: 'text', value: textBefore });
    }
    if (match[1]) {
      parts.push({ type: 'sticker', id: match[1] });
    } else if (match[3]) {
      const rawMood = (match[2] || 'default').toLowerCase();
      const mood = (VALID_MOODS.includes(rawMood) ? rawMood : 'default') as VoiceMood;
      parts.push({ type: 'voice', text: match[3], mood });
    } else if (match[4]) {
      parts.push({ type: 'photo', id: match[4] });
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

export default DIMA_AVATAR;
