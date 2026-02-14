import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API = 'https://functions.poehali.dev/00d5a8b9-0718-48c5-aa0b-0150135c0dd1';

interface Player {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  nickname: string;
  role: string | null;
  is_alive: boolean;
  is_ready: boolean;
}

interface Message {
  id: number;
  user_id: number | null;
  message: string;
  is_system: boolean;
  author_name: string | null;
  author_avatar: string | null;
  phase: string | null;
  created_at: string;
}

interface Room {
  id: number;
  code: string;
  name: string;
  host_id: number;
  host_name: string;
  max_players: number;
  status: string;
  phase: string | null;
  phase_end_at: string | null;
  day_number: number;
  winner: string | null;
}

const ROLE_INFO: Record<string, { label: string; emoji: string; color: string; desc: string }> = {
  mafia: { label: 'Мафия', emoji: '🔫', color: 'text-red-400', desc: 'Выбери кого убить этой ночью' },
  doctor: { label: 'Доктор', emoji: '💊', color: 'text-green-400', desc: 'Выбери кого спасти этой ночью' },
  detective: { label: 'Детектив', emoji: '🔍', color: 'text-blue-400', desc: 'Выбери кого проверить этой ночью' },
  civilian: { label: 'Мирный', emoji: '🏘️', color: 'text-yellow-300', desc: 'Спи спокойно, город под защитой' },
};

const MafiaGame = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [myActions, setMyActions] = useState<{ action_type: string; target_id: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMsg, setChatMsg] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [actionSent, setActionSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [detectiveResult, setDetectiveResult] = useState<{ target_id: number; is_mafia: boolean } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('access_token');
  const pollRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadRoom();
    pollRef.current = setInterval(loadRoom, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!room?.phase_end_at) { setTimeLeft(0); return; }
    const update = () => {
      const end = new Date(room.phase_end_at + 'Z').getTime();
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [room?.phase_end_at]);

  useEffect(() => {
    const hasAction = myActions.some(a => {
      if (room?.phase === 'night') {
        return ['kill', 'heal', 'check'].includes(a.action_type);
      }
      return a.action_type === 'vote';
    });
    setActionSent(hasAction);
    if (hasAction && myActions.length > 0) {
      setSelectedTarget(myActions[0].target_id);
    }
  }, [myActions, room?.phase]);

  const loadRoom = async () => {
    try {
      const res = await fetch(`${API}?action=room&room_id=${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) { navigate('/mafia'); return; }
      const data = await res.json();
      setRoom(data.room);
      setPlayers(data.players);
      setMessages(data.messages);
      setMyPlayer(data.my_player);
      setMyActions(data.my_actions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReady = async () => {
    await fetch(`${API}?action=ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ room_id: Number(roomId) }),
    });
    loadRoom();
  };

  const handleStart = async () => {
    const res = await fetch(`${API}?action=start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ room_id: Number(roomId) }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast({ title: data.error || 'Ошибка', variant: 'destructive' });
    }
    loadRoom();
  };

  const handleAction = async (targetId: number) => {
    if (!room || !myPlayer) return;
    let actionType = 'vote';
    if (room.phase === 'night') {
      if (myPlayer.role === 'mafia') actionType = 'kill';
      else if (myPlayer.role === 'doctor') actionType = 'heal';
      else if (myPlayer.role === 'detective') actionType = 'check';
      else return;
    }

    setSelectedTarget(targetId);
    setActionSent(true);

    await fetch(`${API}?action=action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ room_id: Number(roomId), target_id: targetId, action_type: actionType }),
    });
  };

  const handleNextPhase = async () => {
    const res = await fetch(`${API}?action=next_phase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ room_id: Number(roomId) }),
    });
    const data = await res.json();
    if (data.detective_result) {
      setDetectiveResult(data.detective_result);
      setTimeout(() => setDetectiveResult(null), 10000);
    }
    setActionSent(false);
    setSelectedTarget(null);
    loadRoom();
  };

  const handleChat = async () => {
    if (!chatMsg.trim()) return;
    await fetch(`${API}?action=chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ room_id: Number(roomId), message: chatMsg.trim() }),
    });
    setChatMsg('');
    loadRoom();
  };

  const handleLeave = async () => {
    await fetch(`${API}?action=leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ room_id: Number(roomId) }),
    });
    navigate('/game/mafia');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
      </div>
    );
  }

  if (!room) return null;

  const isHost = room.host_id === myPlayer?.user_id;
  const isWaiting = room.status === 'waiting';
  const isPlaying = room.status === 'playing';
  const isFinished = room.status === 'finished';
  const isNight = room.phase === 'night';
  const isDay = room.phase === 'day';
  const amAlive = myPlayer?.is_alive ?? false;
  const myRole = myPlayer?.role;
  const roleInfo = myRole ? ROLE_INFO[myRole] : null;

  const canAct = isPlaying && amAlive && (
    (isNight && myRole && myRole !== 'civilian') || isDay
  );

  const alivePlayers = players.filter(p => p.is_alive);
  const deadPlayers = players.filter(p => !p.is_alive);
  const allReady = players.filter(p => p.user_id !== room.host_id).every(p => p.is_ready);

  const canChat = (() => {
    if (!myPlayer) return false;
    if (isWaiting || isFinished) return true;
    if (isDay) return amAlive;
    if (isNight && myRole === 'mafia' && amAlive) return true;
    if (!amAlive) return true;
    return false;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-purple-500/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/mafia')} className="text-purple-300 hover:text-white">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="font-bold text-white text-sm">{room.name}</h1>
              <div className="flex items-center gap-2 text-xs">
                {isWaiting && <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">Ожидание</Badge>}
                {isPlaying && isNight && <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">🌙 Ночь {room.day_number}</Badge>}
                {isPlaying && isDay && <Badge className="bg-amber-500/20 text-amber-300 text-xs">☀️ День {room.day_number}</Badge>}
                {isFinished && <Badge className="bg-gray-500/20 text-gray-300 text-xs">Завершена</Badge>}
                {timeLeft > 0 && <span className="text-red-400 font-mono">{timeLeft}с</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-500/30 text-purple-200 font-mono">{room.code}</Badge>
            <Button variant="ghost" size="sm" onClick={handleLeave} className="text-red-400 hover:text-red-300 text-xs">
              <Icon name="LogOut" size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
        <div className="lg:w-72 p-4 space-y-3 lg:border-r border-purple-500/10">
          {roleInfo && isPlaying && (
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-3 text-center">
                <span className="text-2xl">{roleInfo.emoji}</span>
                <p className={`font-bold ${roleInfo.color}`}>{roleInfo.label}</p>
                {!amAlive && <p className="text-red-400 text-xs mt-1">Вы мертвы</p>}
              </CardContent>
            </Card>
          )}

          {detectiveResult && myRole === 'detective' && (
            <Card className="bg-blue-900/40 border-blue-500/30 animate-pulse">
              <CardContent className="p-3 text-center">
                <p className="text-sm text-blue-200">
                  {players.find(p => p.user_id === detectiveResult.target_id)?.first_name}:
                  {detectiveResult.is_mafia
                    ? <span className="text-red-400 font-bold ml-1">Мафия!</span>
                    : <span className="text-green-400 font-bold ml-1">Не мафия</span>
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {isFinished && room.winner && (
            <Card className={`border-2 ${room.winner === 'town' ? 'bg-green-900/30 border-green-500/40' : 'bg-red-900/30 border-red-500/40'}`}>
              <CardContent className="p-4 text-center">
                <span className="text-3xl">{room.winner === 'town' ? '🏘️' : '🔫'}</span>
                <p className={`font-bold text-lg ${room.winner === 'town' ? 'text-green-300' : 'text-red-300'}`}>
                  {room.winner === 'town' ? 'Город победил!' : 'Мафия победила!'}
                </p>
              </CardContent>
            </Card>
          )}

          <div>
            <h3 className="text-xs font-semibold text-purple-400 uppercase mb-2 px-1">
              Игроки ({alivePlayers.length}/{players.length})
            </h3>
            <div className="space-y-1.5">
              {alivePlayers.map(p => {
                const isSelected = selectedTarget === p.user_id;
                const isMe = p.user_id === myPlayer?.user_id;
                const canTarget = canAct && !isMe && p.is_alive;
                return (
                  <button
                    key={p.user_id}
                    onClick={() => canTarget && handleAction(p.user_id)}
                    disabled={!canTarget}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all text-left ${
                      isSelected ? 'bg-red-500/20 border border-red-500/40 ring-1 ring-red-500/30' :
                      canTarget ? 'bg-slate-800/40 hover:bg-slate-700/40 border border-transparent' :
                      'bg-slate-800/20 border border-transparent opacity-70'
                    }`}
                  >
                    <Avatar className="w-8 h-8 border border-purple-500/30">
                      {p.avatar_url ? <AvatarImage src={p.avatar_url} /> : (
                        <AvatarFallback className="bg-purple-600 text-white text-xs">{p.first_name?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? 'text-yellow-300' : 'text-white'}`}>
                        {p.first_name} {isMe && '(вы)'}
                      </p>
                      {isWaiting && (
                        <p className={`text-xs ${p.is_ready ? 'text-green-400' : 'text-gray-500'}`}>
                          {p.user_id === room.host_id ? 'Хост' : p.is_ready ? 'Готов' : 'Не готов'}
                        </p>
                      )}
                      {isFinished && p.role && (
                        <p className={`text-xs ${ROLE_INFO[p.role]?.color || 'text-gray-400'}`}>
                          {ROLE_INFO[p.role]?.emoji} {ROLE_INFO[p.role]?.label}
                        </p>
                      )}
                    </div>
                    {isSelected && <Icon name="Target" size={14} className="text-red-400" />}
                  </button>
                );
              })}
              {deadPlayers.length > 0 && (
                <>
                  <p className="text-xs text-red-400/60 px-1 pt-2">Погибшие</p>
                  {deadPlayers.map(p => (
                    <div key={p.user_id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/30 opacity-50">
                      <Avatar className="w-8 h-8 grayscale">
                        {p.avatar_url ? <AvatarImage src={p.avatar_url} /> : (
                          <AvatarFallback className="bg-gray-700 text-gray-400 text-xs">{p.first_name?.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 line-through truncate">{p.first_name}</p>
                        {(isFinished || !p.is_alive) && p.role && (
                          <p className="text-xs text-gray-600">{ROLE_INFO[p.role]?.emoji} {ROLE_INFO[p.role]?.label}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {isWaiting && !isHost && myPlayer && (
            <Button
              onClick={handleReady}
              className={`w-full rounded-xl ${myPlayer.is_ready ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {myPlayer.is_ready ? 'Отменить готовность' : 'Готов!'}
            </Button>
          )}

          {isWaiting && isHost && (
            <Button
              onClick={handleStart}
              disabled={players.length < 4 || !allReady}
              className="w-full rounded-xl bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700"
            >
              <Icon name="Play" size={16} className="mr-2" />
              Начать игру ({players.length}/4+)
            </Button>
          )}

          {isPlaying && isHost && (
            <Button
              onClick={handleNextPhase}
              size="sm"
              variant="outline"
              className="w-full rounded-xl border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
            >
              <Icon name="SkipForward" size={14} className="mr-1" />
              Следующая фаза
            </Button>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {isPlaying && canAct && (
            <div className={`px-4 py-2 text-center text-sm ${isNight ? 'bg-indigo-900/30 text-indigo-200' : 'bg-amber-900/30 text-amber-200'}`}>
              {isNight && roleInfo ? roleInfo.desc : 'Голосуйте! Выберите кого казнить.'}
              {actionSent && <span className="ml-2 text-green-400">✓ Выбор сделан</span>}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px]">
            {messages.map(msg => (
              <div key={msg.id} className={`${msg.is_system ? 'text-center' : 'flex gap-2'}`}>
                {msg.is_system ? (
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-300/80 text-xs">
                    {msg.message}
                  </div>
                ) : (
                  <>
                    <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                      {msg.author_avatar ? <AvatarImage src={msg.author_avatar} /> : (
                        <AvatarFallback className="bg-purple-600 text-white text-xs">{msg.author_name?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <span className="text-xs font-medium text-purple-300">{msg.author_name}</span>
                      <p className="text-sm text-white/90">{msg.message}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {canChat && (
            <div className="p-3 border-t border-purple-500/10">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  placeholder={isNight && myRole === 'mafia' ? 'Чат мафии...' : 'Сообщение...'}
                  maxLength={500}
                  className="bg-slate-800/50 border-purple-500/20 text-white placeholder:text-purple-300/30 rounded-xl"
                />
                <Button onClick={handleChat} size="icon" className="bg-purple-600 hover:bg-purple-700 rounded-xl flex-shrink-0">
                  <Icon name="Send" size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MafiaGame;