import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API = 'https://functions.poehali.dev/bfc193b3-68d1-4cd2-be41-5afb7240ad6e';

interface Room {
  id: number;
  code: string;
  name: string;
  host_name: string;
  host_avatar: string | null;
  max_players: number;
  player_count: number;
  small_blind: number;
  big_blind: number;
  start_chips: number;
  status: string;
  created_at: string;
}

const PokerLobby = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [smallBlind, setSmallBlind] = useState(10);
  const [startChips, setStartChips] = useState(1000);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const res = await fetch(`${API}?action=rooms`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!roomName.trim()) {
      toast({ title: 'Введите название стола', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API}?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: roomName.trim(),
          max_players: maxPlayers,
          small_blind: smallBlind,
          big_blind: smallBlind * 2,
          start_chips: startChips,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateOpen(false);
        navigate(`/game/poker/${data.id}`);
      } else {
        toast({ title: data.error || 'Ошибка', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка подключения', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await fetch(`${API}?action=join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/game/poker/${data.id}`);
      } else {
        toast({ title: data.error || 'Стол не найден', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка подключения', variant: 'destructive' });
    } finally {
      setJoining(false);
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    try {
      const res = await fetch(`${API}?action=join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ room_id: roomId }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/game/poker/${data.id}`);
      } else {
        toast({ title: data.error || 'Не удалось войти', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка подключения', variant: 'destructive' });
    }
  };

  const waitingRooms = rooms.filter(r => r.status === 'waiting');
  const playingRooms = rooms.filter(r => r.status === 'playing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      <Navigation />

      <main className="pt-24 pb-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-3xl">🃏</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-white">LOVE POKER</h1>
                <p className="text-emerald-300">Texas Hold'em</p>
              </div>
            </div>
            <p className="text-emerald-200/70 max-w-md mx-auto">
              Блефуй, повышай ставки и забирай банк!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white h-14 text-lg shadow-lg shadow-emerald-500/20">
                  <Icon name="Plus" size={22} />
                  Создать стол
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-emerald-500/30 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Новый стол</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-emerald-200">Название</Label>
                    <Input
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Вечерний покер"
                      maxLength={100}
                      className="bg-slate-800 border-emerald-500/30 text-white placeholder:text-emerald-300/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-emerald-200">Игроков: {maxPlayers}</Label>
                    <input
                      type="range" min={2} max={8} value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-emerald-300/60"><span>2</span><span>8</span></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-emerald-200">Малый блайнд</Label>
                      <Input
                        type="number" value={smallBlind} min={1}
                        onChange={(e) => setSmallBlind(Number(e.target.value))}
                        className="bg-slate-800 border-emerald-500/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-emerald-200">Стартовые фишки</Label>
                      <Input
                        type="number" value={startChips} min={100} step={100}
                        onChange={(e) => setStartChips(Number(e.target.value))}
                        className="bg-slate-800 border-emerald-500/30 text-white"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    {creating ? <Icon name="Loader2" className="animate-spin mr-2" size={16} /> : null}
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Код стола"
                maxLength={6}
                className="bg-slate-800/50 border-emerald-500/30 text-white placeholder:text-emerald-300/40 rounded-xl h-14 text-lg text-center tracking-widest font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
              />
              <Button
                onClick={handleJoinByCode}
                disabled={joining || !joinCode.trim()}
                size="lg"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 h-14 px-6"
              >
                {joining ? <Icon name="Loader2" className="animate-spin" size={18} /> : <Icon name="LogIn" size={18} />}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Icon name="Loader2" className="animate-spin mx-auto text-emerald-400" size={32} />
            </div>
          ) : (
            <div className="space-y-6">
              {waitingRooms.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <Icon name="Clock" size={18} />
                    Ожидают игроков
                  </h2>
                  <div className="space-y-3">
                    {waitingRooms.map(room => (
                      <Card key={room.id} className="bg-slate-800/50 border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer" onClick={() => handleJoinRoom(room.id)}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <Avatar className="w-10 h-10 border border-emerald-500/30">
                            {room.host_avatar ? <AvatarImage src={room.host_avatar} /> : (
                              <AvatarFallback className="bg-emerald-600 text-white text-sm">{room.host_name?.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{room.name}</p>
                            <p className="text-xs text-emerald-300/60">{room.host_name} · {room.small_blind}/{room.big_blind} · {room.start_chips} фишек</p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-emerald-500/20 text-emerald-300">{room.player_count}/{room.max_players}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {playingRooms.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                    <Icon name="Flame" size={18} />
                    Идут игры
                  </h2>
                  <div className="space-y-3">
                    {playingRooms.map(room => (
                      <Card key={room.id} className="bg-slate-800/50 border-yellow-500/20 opacity-70">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center">
                            <Icon name="Flame" size={20} className="text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{room.name}</p>
                            <p className="text-xs text-yellow-300/60">{room.small_blind}/{room.big_blind}</p>
                          </div>
                          <Badge className="bg-yellow-500/20 text-yellow-300">{room.player_count} игроков</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {rooms.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-6xl mb-4 block">🃏</span>
                  <p className="text-emerald-200/60">Нет активных столов</p>
                  <p className="text-emerald-300/40 text-sm">Создайте первый!</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="ghost" className="text-emerald-300/60 hover:text-emerald-200" onClick={() => navigate('/game')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Все игры
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PokerLobby;
