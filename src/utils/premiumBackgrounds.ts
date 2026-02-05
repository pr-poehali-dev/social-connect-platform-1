export const PREMIUM_BACKGROUNDS = {
  'gradient-purple': {
    name: 'Фиолетовый закат',
    class: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    preview: 'linear-gradient(to bottom right, rgb(147 51 234), rgb(236 72 153), rgb(251 146 60))'
  },
  'gradient-pink': {
    name: 'Розовая мечта',
    class: 'bg-gradient-to-br from-pink-500 via-rose-400 to-red-400',
    preview: 'linear-gradient(to bottom right, rgb(236 72 153), rgb(251 113 133), rgb(248 113 113))'
  },
  'gradient-blue': {
    name: 'Океанская волна',
    class: 'bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400',
    preview: 'linear-gradient(to bottom right, rgb(59 130 246), rgb(34 211 238), rgb(45 212 191))'
  },
  'gradient-sunset': {
    name: 'Закат в пустыне',
    class: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500',
    preview: 'linear-gradient(to bottom right, rgb(249 115 22), rgb(239 68 68), rgb(236 72 153))'
  },
  'gradient-ocean': {
    name: 'Морской бриз',
    class: 'bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400',
    preview: 'linear-gradient(to bottom right, rgb(99 102 241), rgb(59 130 246), rgb(34 211 238))'
  },
  'gradient-forest': {
    name: 'Лесная поляна',
    class: 'bg-gradient-to-br from-green-500 via-emerald-400 to-teal-400',
    preview: 'linear-gradient(to bottom right, rgb(34 197 94), rgb(52 211 153), rgb(45 212 191))'
  },
  'gradient-night': {
    name: 'Ночное небо',
    class: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    preview: 'linear-gradient(to bottom right, rgb(15 23 42), rgb(88 28 135), rgb(15 23 42))'
  },
  'gradient-gold': {
    name: 'Золотое сияние',
    class: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400',
    preview: 'linear-gradient(to bottom right, rgb(250 204 21), rgb(251 146 60), rgb(248 113 113))'
  },
  'gradient-royal': {
    name: 'Королевский',
    class: 'bg-gradient-to-br from-purple-700 via-violet-600 to-fuchsia-600',
    preview: 'linear-gradient(to bottom right, rgb(126 34 206), rgb(124 58 237), rgb(192 38 211))'
  },
  'gradient-fire': {
    name: 'Огненный',
    class: 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-400',
    preview: 'linear-gradient(to bottom right, rgb(220 38 38), rgb(249 115 22), rgb(250 204 21))'
  }
} as const;

export type PremiumBackgroundKey = keyof typeof PREMIUM_BACKGROUNDS;

export const getBackgroundClass = (background: string | null | undefined): string => {
  if (!background) return PREMIUM_BACKGROUNDS['gradient-purple'].class;
  
  if (background.startsWith('http')) {
    return '';
  }
  
  const key = background as PremiumBackgroundKey;
  return PREMIUM_BACKGROUNDS[key]?.class || PREMIUM_BACKGROUNDS['gradient-purple'].class;
};

export const getBackgroundStyle = (background: string | null | undefined): React.CSSProperties => {
  if (!background) return {};
  
  if (background.startsWith('http')) {
    return {
      backgroundImage: `url(${background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  
  return {};
};
