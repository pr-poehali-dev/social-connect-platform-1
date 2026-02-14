import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface GameCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  path: string;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  players: string;
  status: 'active' | 'coming_soon';
}

const games: GameCard[] = [
  {
    id: 'mafia',
    title: 'Мафия',
    description: 'Найди мафию среди друзей! Классическая игра с ролями.',
    emoji: '🎭',
    path: '/game/mafia',
    gradient: 'from-red-500 to-purple-600',
    badge: 'Онлайн',
    badgeColor: 'bg-green-500/20 text-green-300',
    players: '4–10',
    status: 'active',
  },
  {
    id: 'poker',
    title: 'Покер',
    description: 'Texas Hold\'em — блефуй, повышай ставки и забирай банк!',
    emoji: '🃏',
    path: '/game/poker',
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'Новое',
    badgeColor: 'bg-yellow-500/20 text-yellow-300',
    players: '2–8',
    status: 'active',
  },
];

const GameHub = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />

      <main className="pt-24 pb-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <span className="text-3xl">🎮</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-white">LOVE GAME</h1>
                <p className="text-purple-300">Играй с друзьями онлайн</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {games.map((game) => (
              <Link
                key={game.id}
                to={game.status === 'active' ? game.path : '#'}
                className={game.status === 'coming_soon' ? 'pointer-events-none' : ''}
              >
                <Card className="bg-slate-800/50 border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10 group cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-32 bg-gradient-to-br ${game.gradient} flex items-center justify-center relative`}>
                      <span className="text-6xl group-hover:scale-110 transition-transform">{game.emoji}</span>
                      {game.badge && (
                        <Badge className={`absolute top-3 right-3 ${game.badgeColor} text-xs`}>
                          {game.badge}
                        </Badge>
                      )}
                      {game.status === 'coming_soon' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge className="bg-gray-500/30 text-gray-300">Скоро</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                      <p className="text-purple-200/60 text-sm mb-3">{game.description}</p>
                      <div className="flex items-center gap-2 text-xs text-purple-300/50">
                        <Icon name="Users" size={14} />
                        <span>{game.players} игроков</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameHub;
