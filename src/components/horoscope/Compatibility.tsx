import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import ZodiacIcon from './ZodiacIcon';

const COMPAT_URL = 'https://functions.poehali.dev/8f655449-d0e2-424f-bf23-2dff4fd429cc';
const PROFILES_URL = 'https://functions.poehali.dev/463fef6f-0ceb-4ca2-ae5b-ada619f3147f';

interface CompatResult {
  overall_score: number;
  love_score: number;
  friendship_score: number;
  business_score: number;
  communication_score: number;
  ai_analysis: string | null;
  user_sign?: string;
  target_sign?: string;
  user_sign_ru?: string;
  target_sign_ru?: string;
  target_name?: string;
  target_avatar?: string;
  target_nickname?: string;
}

interface PrevResult {
  target_user_id: number;
  overall_score: number;
  love_score: number;
  name: string;
  avatar_url: string;
  zodiac_sign: string;
  nickname: string;
}

interface SearchUser {
  id: number;
  first_name: string;
  nickname: string;
  avatar_url: string;
  zodiac_sign: string;
}

const ScoreBar = ({ label, score, icon, color }: { label: string; score: number; icon: string; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-sm">
        <Icon name={icon} size={14} />
        <span>{label}</span>
      </div>
      <span className="text-sm font-bold">{score}%</span>
    </div>
    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

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

const Compatibility = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<CompatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [prevResults, setPrevResults] = useState<PrevResult[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    loadPrevResults();
  }, []);

  const loadPrevResults = async () => {
    try {
      const res = await apiFetch(`${COMPAT_URL}?action=my_results`);
      if (res.ok) {
        const data = await res.json();
        setPrevResults(data.results || []);
      }
    } catch (e) {
      console.error('Failed to load prev results', e);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await apiFetch(
        `${PROFILES_URL}?action=search&q=${encodeURIComponent(searchQuery.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.profiles || []);
      }
    } catch {
      toast({ title: 'Ошибка поиска', variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const checkCompatibility = async (targetUserId: number) => {
    setLoading(true);
    setResult(null);
    setSelectedUserId(targetUserId);
    try {
      const res = await apiFetch(`${COMPAT_URL}?action=check&target_user_id=${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        loadPrevResults();
      } else {
        const err = await res.json();
        toast({ title: 'Ошибка', description: err.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Не удалось проверить совместимость', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-2 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-4 text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Icon name="Heart" size={20} />
            Совместимость
          </h3>
          <p className="text-white/80 text-sm mt-1">
            Найдите пользователя и узнайте вашу астрологическую совместимость
          </p>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Имя или никнейм..."
              className="flex-1 px-4 py-2 rounded-xl border bg-background text-sm"
            />
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="rounded-xl"
              size="sm"
            >
              {searching ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-colors
                    ${selectedUserId === user.id ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50 hover:bg-muted'}`}
                >
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {user.first_name?.[0] || '?'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm">{user.first_name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        @{user.nickname}
                        {user.zodiac_sign && (
                          <span className="ml-1">
                            <ZodiacIcon sign={user.zodiac_sign.toLowerCase()} size="sm" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl gap-1"
                    onClick={() => checkCompatibility(user.id)}
                    disabled={loading && selectedUserId === user.id}
                  >
                    {loading && selectedUserId === user.id ? (
                      <Icon name="Loader2" size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Icon name="Sparkles" size={14} />
                        Проверить
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="rounded-3xl border-2 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-5 text-white text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              {result.user_sign && <ZodiacIcon sign={result.user_sign} size="lg" />}
              <div className="text-4xl">💕</div>
              {result.target_sign && <ZodiacIcon sign={result.target_sign} size="lg" />}
            </div>
            <div className="text-5xl font-bold mb-1">
              {result.overall_score}%
            </div>
            <div className="text-lg">
              {getScoreEmoji(result.overall_score)} {getScoreLabel(result.overall_score)}
            </div>
            {result.target_name && (
              <p className="text-white/80 text-sm mt-2">
                {result.user_sign_ru} + {result.target_sign_ru} ({result.target_name})
              </p>
            )}
          </div>
          <CardContent className="p-5 space-y-3">
            <ScoreBar label="Любовь" score={result.love_score} icon="Heart" color="from-pink-500 to-rose-500" />
            <ScoreBar label="Дружба" score={result.friendship_score} icon="Users" color="from-blue-500 to-cyan-500" />
            <ScoreBar label="Бизнес" score={result.business_score} icon="Briefcase" color="from-amber-500 to-yellow-500" />
            <ScoreBar label="Общение" score={result.communication_score} icon="MessageCircle" color="from-green-500 to-emerald-500" />
          </CardContent>

          {result.ai_analysis && (
            <CardContent className="px-5 pb-5 pt-0">
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Icon name="Brain" size={14} className="text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">Анализ от ИИ-астролога</h4>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {result.ai_analysis.split('\n').map((p, i) => (
                    p.trim() ? <p key={i} className="mb-2 text-sm leading-relaxed">{p}</p> : null
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {prevResults.length > 0 && (
        <Card className="rounded-3xl border-2">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="History" size={16} />
              История проверок
            </h4>
            <div className="space-y-2">
              {prevResults.map((pr) => (
                <button
                  key={pr.target_user_id}
                  onClick={() => checkCompatibility(pr.target_user_id)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {pr.avatar_url ? (
                      <img src={pr.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold">
                        {pr.name?.[0] || '?'}
                      </div>
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium">{pr.name}</div>
                      <div className="text-xs text-muted-foreground">@{pr.nickname}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{pr.overall_score}%</span>
                    <span>{getScoreEmoji(pr.overall_score)}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Compatibility;
