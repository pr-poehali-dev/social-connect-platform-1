const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

const ZODIAC_COLORS: Record<string, string> = {
  aries: 'from-red-500 to-orange-500',
  taurus: 'from-green-600 to-emerald-500',
  gemini: 'from-yellow-400 to-amber-500',
  cancer: 'from-blue-300 to-cyan-400',
  leo: 'from-orange-500 to-yellow-500',
  virgo: 'from-emerald-500 to-teal-500',
  libra: 'from-pink-400 to-rose-500',
  scorpio: 'from-purple-600 to-violet-700',
  sagittarius: 'from-indigo-500 to-purple-500',
  capricorn: 'from-gray-600 to-slate-700',
  aquarius: 'from-cyan-400 to-blue-500',
  pisces: 'from-violet-400 to-purple-500',
};

interface ZodiacIconProps {
  sign: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  label?: string;
}

const ZodiacIcon = ({ sign, size = 'md', selected = false, onClick, label }: ZodiacIconProps) => {
  const symbol = ZODIAC_SYMBOLS[sign] || '✨';
  const gradient = ZODIAC_COLORS[sign] || 'from-purple-500 to-pink-500';

  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center
          ${selected ? 'ring-3 ring-primary ring-offset-2 scale-110 shadow-lg' : 'opacity-80 hover:opacity-100 hover:scale-105'}
          transition-all duration-200`}
      >
        <span className="text-white drop-shadow-md">{symbol}</span>
      </div>
      {label && (
        <span className={`text-xs font-medium ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
          {label}
        </span>
      )}
    </button>
  );
};

export { ZODIAC_SYMBOLS, ZODIAC_COLORS };
export default ZodiacIcon;
