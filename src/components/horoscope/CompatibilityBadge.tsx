import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import ZodiacIcon from './ZodiacIcon';

const COMPAT_URL = 'https://functions.poehali.dev/8f655449-d0e2-424f-bf23-2dff4fd429cc';

interface CompatibilityBadgeProps {
  targetUserId: number;
  targetName?: string;
}

interface Result {
  overall_score: number;
  love_score: number;
  friendship_score: number;
  business_score: number;
  communication_score: number;
  user_sign?: string;
  target_sign?: string;
  user_sign_ru?: string;
  target_sign_ru?: string;
  ai_analysis?: string | null;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-400';
};

const getScoreEmoji = (score: number) => {
  if (score >= 90) return '🔥';
  if (score >= 75) return '💫';
  if (score >= 60) return '✨';
  if (score >= 40) return '🌙';
  return '💭';
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Идеальная пара!';
  if (score >= 75) return 'Отличная совместимость';
  if (score >= 60) return 'Хорошая совместимость';
  if (score >= 40) return 'Средняя совместимость';
  return 'Сложная совместимость';
};

const MiniBar = ({ value, color }: { value: number; color: string }) => (
  <div className="h-1.5 bg-muted rounded-full overflow-hidden flex-1">
    <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
  </div>
);

const CompatibilityBadge = ({ targetUserId, targetName }: CompatibilityBadgeProps) => {
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const checkCompatibility = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`${COMPAT_URL}?action=check&target_user_id=${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const err = await res.json();
        setError(err.error || 'Не удалось проверить');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <Card className="rounded-3xl border-2 border-dashed border-pink-200 dark:border-pink-900 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20">
        <CardContent className="p-4">
          <button
            onClick={checkCompatibility}
            disabled={loading}
            className="w-full flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
              {loading ? (
                <Icon name="Loader2" size={20} className="text-white animate-spin" />
              ) : (
                <Icon name="Sparkles" size={20} className="text-white group-hover:scale-110 transition-transform" />
              )}
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-sm">
                {loading ? 'Звёзды рассчитывают...' : `Узнать совместимость${targetName ? ` с ${targetName}` : ''}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Астрологический анализ по знакам зодиака
              </p>
            </div>
            {!loading && <Icon name="ChevronRight" size={18} className="text-muted-foreground" />}
          </button>
          {error && <p className="text-xs text-destructive mt-2 pl-15">{error}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-2 overflow-hidden">
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {result.user_sign && <ZodiacIcon sign={result.user_sign} size="sm" />}
            <span className="text-lg">💕</span>
            {result.target_sign && <ZodiacIcon sign={result.target_sign} size="sm" />}
            <div>
              <div className="text-2xl font-bold">{result.overall_score}% {getScoreEmoji(result.overall_score)}</div>
              <div className="text-white/80 text-xs">{getScoreLabel(result.overall_score)}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-xl"
            onClick={() => setExpanded(!expanded)}
          >
            <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={18} />
          </Button>
        </div>
      </div>

      {expanded && (
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1"><Icon name="Heart" size={12} /> Любовь</span>
                <span className={`font-bold ${getScoreColor(result.love_score)}`}>{result.love_score}%</span>
              </div>
              <MiniBar value={result.love_score} color="from-pink-500 to-rose-500" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1"><Icon name="Users" size={12} /> Дружба</span>
                <span className={`font-bold ${getScoreColor(result.friendship_score)}`}>{result.friendship_score}%</span>
              </div>
              <MiniBar value={result.friendship_score} color="from-blue-500 to-cyan-500" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1"><Icon name="Briefcase" size={12} /> Бизнес</span>
                <span className={`font-bold ${getScoreColor(result.business_score)}`}>{result.business_score}%</span>
              </div>
              <MiniBar value={result.business_score} color="from-amber-500 to-yellow-500" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1"><Icon name="MessageCircle" size={12} /> Общение</span>
                <span className={`font-bold ${getScoreColor(result.communication_score)}`}>{result.communication_score}%</span>
              </div>
              <MiniBar value={result.communication_score} color="from-green-500 to-emerald-500" />
            </div>
          </div>

          {result.ai_analysis && (
            <div className="border-t pt-3">
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-4">{result.ai_analysis.split('\n').filter(Boolean)[0]}</p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-xl gap-1.5 text-xs"
            onClick={() => navigate('/horoscope')}
          >
            <Icon name="Sparkles" size={14} />
            Подробнее в разделе Астрология
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default CompatibilityBadge;
