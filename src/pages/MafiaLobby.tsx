import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API = 'https://functions.poehali.dev/00d5a8b9-0718-48c5-aa0b-0150135c0dd1';

interface Room {
  id: number;
  code: string;
  name: string;
  host_name: string;
  host_avatar: string | null;
  max_players: number;
  player_count: number;
  status: string;
  created_at: string;
}

const MafiaLobby = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
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
      toast({ title: 'Введите название комнаты', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API}?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: roomName.trim(), max_players: maxPlayers }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateOpen(false);
        navigate(`/game/mafia/${data.id}`);
      } else {
        toast({ title: data.error || 'Ошибка', variant: 'destructive' });
      }
    } catch (e) {
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
        navigate(`/game/mafia/${data.id}`);
      } else {
        toast({ title: data.error || 'Комната не найдена', variant: 'destructive' });
      }
    } catch (e) {
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
        navigate(`/game/mafia/${data.id}`);
      } else {
        toast({ title: data.error || 'Не удалось войти', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Ошибка подключения', variant: 'destructive' });
    }
  };

  const waitingRooms = rooms.filter(r => r.status === 'waiting');
  const playingRooms = rooms.filter(r => r.status === 'playing');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <span className="text-3xl">🎭</span>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-white">LOVE GAME</h1>
                <p className="text-purple-300">Mafia Online</p>
              </div>
            </div>
            <p className="text-purple-200/70 max-w-md mx-auto">
              Найди мафию среди друзей! Создай комнату или присоединись к существующей.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full gap-2 rounded-xl bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white h-14 text-lg shadow-lg shadow-red-500/20">
                  <Icon name="Plus" size={22} />
                  Создать комнату
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-purple-500/30 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Новая комната</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-purple-200">Название</Label>
                    <Input
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Ночная мафия"
                      maxLength={100}
                      className="bg-slate-800 border-purple-500/30 text-white placeholder:text-purple-300/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-purple-200">Макс. игроков: {maxPlayers}</Label>
                    <input
                      type="range"
                      min={4}
                      max={10}
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                    <div className="flex justify-between text-xs text-purple-300/60">
                      <span>4</span><span>10</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
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
                placeholder="Код комнаты"
                maxLength={6}
                className="bg-slate-800/50 border-purple-500/30 text-white placeholder:text-purple-300/40 rounded-xl h-14 text-lg text-center tracking-widest font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
              />
              <Button
                onClick={handleJoinByCode}
                disabled={joining || !joinCode.trim()}
                size="lg"
                className="rounded-xl bg-purple-600 hover:bg-purple-700 h-14 px-6"
              >
                {joining ? <Icon name="Loader2" className="animate-spin" size={18} /> : <Icon name="LogIn" size={18} />}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-400" />
            </div>
          ) : (
            <>
              {waitingRooms.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                    <Icon name="Clock" size={18} className="text-yellow-400" />
                    Ожидают игроков ({waitingRooms.length})
                  </h2>
                  <div className="space-y-3">
                    {waitingRooms.map(room => (
                      <Card key={room.id} className="bg-slate-800/60 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer" onClick={() => handleJoinRoom(room.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border-2 border-purple-500/30">
                                {room.host_avatar ? (
                                  <AvatarImage src={room.host_avatar} />
                                ) : (
                                  <AvatarFallback className="bg-purple-600 text-white text-sm">
                                    {room.host_name?.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-white">{room.name}</h3>
                                <p className="text-sm text-purple-300/60">{room.host_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/30 font-mono">
                                {room.code}
                              </Badge>
                              <div className="flex items-center gap-1 text-purple-200">
                                <Icon name="Users" size={16} />
                                <span className="text-sm font-medium">{room.player_count}/{room.max_players}</span>
                              </div>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 rounded-lg">
                                Войти
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {playingRooms.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-purple-200 mb-3 flex items-center gap-2">
                    <Icon name="Gamepad2" size={18} className="text-red-400" />
                    Идут игры ({playingRooms.length})
                  </h2>
                  <div className="space-y-3">
                    {playingRooms.map(room => (
                      <Card key={room.id} className="bg-slate-800/40 border-red-500/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white/80">{room.name}</h3>
                              <p className="text-sm text-purple-300/40">{room.host_name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="rounded-full">
                                <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse" />
                                В игре
                              </Badge>
                              <span className="text-sm text-purple-300/60">{room.player_count} игроков</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {rooms.length === 0 && (
                <Card className="bg-slate-800/40 border-purple-500/20">
                  <CardContent className="p-12 text-center">
                    <span className="text-6xl mb-4 block">🎭</span>
                    <h3 className="text-xl font-semibold text-white mb-2">Пока нет комнат</h3>
                    <p className="text-purple-300/60 mb-4">Создай первую и пригласи друзей!</p>
                    <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-r from-red-500 to-purple-600 rounded-xl">
                      Создать комнату
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="mt-8 text-center">
            <Button variant="ghost" className="text-purple-300/60 hover:text-purple-200" onClick={() => navigate('/game')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Все игры
            </Button>
          </div>

          <Card className="bg-slate-800/30 border-purple-500/10 mt-4">
            <CardContent className="p-6">
              <h3 className="font-semibold text-purple-200 mb-3">Как играть?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-purple-300/70">
                <div className="flex gap-2"><span>🌙</span><span><b className="text-purple-200">Ночь:</b> Мафия выбирает жертву. Доктор лечит. Детектив проверяет.</span></div>
                <div className="flex gap-2"><span>☀️</span><span><b className="text-purple-200">День:</b> Обсуждение и голосование. Город выбирает кого казнить.</span></div>
                <div className="flex gap-2"><span>🔫</span><span><b className="text-purple-200">Мафия:</b> Убивает мирных жителей ночью.</span></div>
                <div className="flex gap-2"><span>💊</span><span><b className="text-purple-200">Доктор:</b> Может спасти одного игрока.</span></div>
                <div className="flex gap-2"><span>🔍</span><span><b className="text-purple-200">Детектив:</b> Проверяет роль игрока.</span></div>
                <div className="flex gap-2"><span>🏘️</span><span><b className="text-purple-200">Мирный:</b> Голосует днём, ищет мафию.</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MafiaLobby;