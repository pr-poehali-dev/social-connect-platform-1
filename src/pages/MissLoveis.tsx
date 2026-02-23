import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const DATING_PROFILES_URL = 'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2';

const normalizeImageUrl = (url: string) => {
  if (!url) return url;
  if (!url.includes('userapi.com')) return url;
  return url.replace(/[&?]cs=\d+x\d+/, '').replace(/[&?]ava=1/, '');
};

interface Contestant {
  rank: number;
  contestant_id: number;
  user_id: number;
  name: string;
  nickname: string;
  avatar_url: string;
  city: string;
  age: number;
  total_votes: number;
  is_verified: boolean;
  is_vip: boolean;
}

const MissLoveis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [myRank, setMyRank] = useState<{ in_contest: boolean; rank?: number; total_votes?: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ gender?: string; birth_date?: string } | null>(null);

  useEffect(() => {
    loadLeaderboard();
    loadCurrentUserData();
  }, []);  

  const getToken = () => localStorage.getItem('access_token');

  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`${DATING_PROFILES_URL}?action=miss-leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUserData = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        loadMyRank(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadMyRank = async (token: string) => {
    try {
      const res = await fetch(`${DATING_PROFILES_URL}?action=miss-my-rank`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMyRank(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`${DATING_PROFILES_URL}?action=miss-join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Вы вступили в конкурс! 👑', description: 'Теперь мужчины могут голосовать за вас' });
        loadLeaderboard();
        loadMyRank(token);
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось вступить', variant: 'destructive' });
      }
    } finally {
      setJoining(false);
    }
  };

  const rankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const isFemale = currentUser?.gender === 'female';
  const canJoin = isFemale && currentUser?.birth_date && (() => {
    const bd = new Date(currentUser.birth_date);
    const today = new Date();
    const age = today.getFullYear() - bd.getFullYear() - ((today.getMonth() < bd.getMonth() || (today.getMonth() === bd.getMonth() && today.getDate() < bd.getDate())) ? 1 : 0);
    return age >= 18 && age <= 45;
  })();

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navigation />
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">👑</div>
          <h1 className="text-3xl font-bold tracking-tight">
            MISS <span className="text-pink-500">LOVEIS</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Конкурс красоты для девушек 18–45 лет.<br />
            Голосуют мужчины — 1 раз в 30 дней, за токены LOVE.
          </p>
        </div>

        {/* Мой статус */}
        {currentUser && isFemale && (
          <div className="mb-6 rounded-2xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 p-4">
            {myRank?.in_contest ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-pink-600 dark:text-pink-400">Вы участвуете!</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    Место: <span className="font-bold text-foreground">#{myRank.rank}</span> · Голосов: <span className="font-bold text-foreground">{myRank.total_votes}</span>
                  </div>
                </div>
                <div className="text-3xl">👑</div>
              </div>
            ) : canJoin ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">Хочешь участвовать?</div>
                  <div className="text-xs text-muted-foreground">Присоединись к конкурсу бесплатно</div>
                </div>
                <Button
                  onClick={handleJoin}
                  disabled={joining}
                  className="bg-pink-500 hover:bg-pink-600 text-white shrink-0"
                  size="sm"
                >
                  {joining ? 'Вступаю...' : 'Участвовать'}
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center">
                Участие доступно девушкам от 18 до 45 лет
              </div>
            )}
          </div>
        )}

        {/* Топ-10 */}
        <div className="mb-4 flex items-center gap-2">
          <Icon name="Trophy" size={18} className="text-yellow-500" />
          <span className="font-semibold">Топ-10 участниц</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">👑</div>
            <p>Пока нет участниц.<br />Будь первой!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((c) => (
              <div
                key={c.contestant_id}
                className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${c.rank <= 3 ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20' : 'border-border bg-card'}`}
                onClick={() => navigate(`/dating/${c.user_id}`)}
              >
                <div className="text-2xl font-bold w-10 text-center shrink-0">{rankMedal(c.rank)}</div>
                <div className="relative shrink-0">
                  <img
                    src={normalizeImageUrl(c.avatar_url) || '/placeholder.svg'}
                    alt={c.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-pink-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                  {c.is_vip && <div className="absolute -top-1 -right-1 text-xs">⭐</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold truncate">{c.name}</span>
                    {c.is_verified && <Icon name="BadgeCheck" size={14} className="text-blue-500 shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    {[c.city, c.age ? `${c.age} лет` : null].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-pink-500 font-bold">
                    <Icon name="Heart" size={14} />
                    <span>{c.total_votes}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">голосов</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Правила */}
        <div className="mt-8 p-4 rounded-2xl bg-muted/50 text-xs text-muted-foreground space-y-1.5">
          <div className="font-semibold text-foreground text-sm mb-2">Правила конкурса</div>
          <div>👩 Участвуют только девушки от 18 до 45 лет</div>
          <div>🗳️ Голосуют только мужчины — 1 голос стоит 1 токен LOVE</div>
          <div>⏱️ Голосовать можно 1 раз в 30 дней</div>
          <div>🏆 Публично видны 1–10 место</div>
          <div>🔒 Своё место видно только в личном профиле</div>
        </div>
      </div>
    </div>
  );
};

export default MissLoveis;