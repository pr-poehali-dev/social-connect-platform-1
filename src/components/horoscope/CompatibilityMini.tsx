import { getQuickCompatibility, ZODIAC_RU } from '@/utils/zodiac';
import { ZODIAC_SYMBOLS } from './ZodiacIcon';

interface CompatibilityMiniProps {
  targetZodiacSign?: string;
}

const getScoreGradient = (score: number) => {
  if (score >= 80) return 'from-green-500 to-emerald-400';
  if (score >= 60) return 'from-yellow-500 to-amber-400';
  if (score >= 40) return 'from-orange-500 to-amber-500';
  return 'from-red-400 to-rose-400';
};

const CompatibilityMini = ({ targetZodiacSign }: CompatibilityMiniProps) => {
  if (!targetZodiacSign) return null;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const mySign = (user.zodiac_sign || '').toLowerCase();
  if (!mySign || !ZODIAC_RU[mySign]) return null;

  const target = targetZodiacSign.toLowerCase();
  if (!ZODIAC_RU[target]) return null;

  const score = getQuickCompatibility(mySign, target);
  if (score === null) return null;

  const symbol = ZODIAC_SYMBOLS[target] || '✨';

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${getScoreGradient(score)} text-white text-xs font-bold shadow-md`}
      title={`Совместимость: ${score}% (${ZODIAC_RU[mySign]} + ${ZODIAC_RU[target]})`}
    >
      <span>{symbol}</span>
      <span>{score}%</span>
    </div>
  );
};

export default CompatibilityMini;
