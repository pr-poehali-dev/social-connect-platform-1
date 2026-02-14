import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API = 'https://functions.poehali.dev/bfc193b3-68d1-4cd2-be41-5afb7240ad6e';

const SUIT_SYMBOLS: Record<string, string> = { h: '♥', d: '♦', c: '♣', s: '♠' };
const SUIT_COLORS: Record<string, string> = { h: 'text-red-500', d: 'text-red-500', c: 'text-white', s: 'text-white' };
const RANK_DISPLAY: Record<string, string> = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  'T': '10', 'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
};

interface Player {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  nickname: string;
  seat: number;
  chips: number;
  is_ready: boolean;
  is_active: boolean;
  is_folded: boolean;
  current_bet: number;
  hole_cards: string | null;
}

interface GameState {
  id: number;
  dealer_seat: number;
  current_turn_seat: number | null;
  phase: string;
  community_cards: string;
  pot: number;
  current_bet: number;
  turn_end_at: string | null;
  winner_id: number | null;
  winner_hand: string | null;
  finished_at: string | null;
}

interface Room {
  id: number;
  code: string;
  name: string;
  host_id: number;
  host_name: string;
  max_players: number;
  small_blind: number;
  big_blind: number;
  start_chips: number;
  status: string;
}

interface Message {
  id: number;
  user_id: number | null;
  message: string;
  is_system: boolean;
  author_name: string | null;
  author_avatar: string | null;
  created_at: string;
}

const PlayingCard = ({ card }: { card: string }) => {
  if (!card || card.length < 2) return null;
  const rank = card[0];
  const suit = card[1];
  return (
    <div className={`w-12 h-16 sm:w-14 sm:h-20 rounded-lg bg-white shadow-lg flex flex-col items-center justify-center border-2 border-gray-200 ${SUIT_COLORS[suit]}`}>
      <span className="text-sm sm:text-base font-bold leading-none">{RANK_DISPLAY[rank] || rank}</span>
      <span className="text-lg sm:text-xl leading-none">{SUIT_SYMBOLS[suit] || suit}</span>
    </div>
  );
};

const CardBack = () => (
  <div className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg bg-gradient-to-br from-emerald-700 to-teal-800 shadow-lg flex items-center justify-center border-2 border-emerald-600">
    <span className="text-xl">🃏</span>
  </div>
);

const PokerGame = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMsg, setChatMsg] = useState('');
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('access_token');
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    loadRoom();
    pollRef.current = setInterval(loadRoom, 2500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!game?.turn_end_at) { setTimeLeft(0); return; }
    const update = () => {
      const end = new Date(game.turn_end_at + 'Z').getTime();
      setTimeLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [game?.turn_end_at]);

  useEffect(() => {
    if (game && room) {
      setRaiseAmount(game.current_bet * 2 || room.big_blind * 2);
    }
  }, [game?.current_bet, room?.big_blind]);

  const loadRoom = async () => {
    try {
      const res = await fetch(`${API}?action=room&room_id=${roomId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) { navigate('/game/poker'); return; }
      const data = await res.json();
      setRoom(data.room);
      setPlayers(data.players);
      setMyPlayer(data.my_player);
      setGame(data.game);
      setMessages(data.messages);
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
    if (!res.ok) toast({ title: data.error || 'Ошибка', variant: 'destructive' });
    loadRoom();
  };

  const doAction = async (actionType: string, amount?: number) => {
    await fetch(`${API}?action=action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ room_id: Number(roomId), action_type: actionType, amount }),
    });
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
    navigate('/game/poker');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </div>
    );
  }

  if (!room) return null;

  const isHost = room.host_id === myPlayer?.user_id;
  const isWaiting = room.status === 'waiting';
  const isPlaying = room.status === 'playing';
  const isFinished = room.status === 'finished';
  const isMyTurn = game && myPlayer && game.current_turn_seat === myPlayer.seat && !myPlayer.is_folded && myPlayer.is_active;
  const activePlayers = players.filter(p => p.is_active);
  const allReady = activePlayers.filter(p => p.user_id !== room.host_id).every(p => p.is_ready);
  const myCards = myPlayer?.hole_cards ? myPlayer.hole_cards.split(',') : [];
  const communityCards = game?.community_cards ? game.community_cards.split(',').filter(Boolean) : [];
  const canCall = isMyTurn && myPlayer && game && myPlayer.current_bet < game.current_bet;
  const canCheck = isMyTurn && myPlayer && game && myPlayer.current_bet >= game.current_bet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-emerald-500/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/game/poker')} className="text-emerald-300 hover:text-white">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="font-bold text-white text-sm">{room.name}</h1>
              <div className="flex items-center gap-2 text-xs">
                {isWaiting && <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">Ожидание</Badge>}
                {isPlaying && <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">🃏 {game?.phase}</Badge>}
                {isFinished && <Badge className="bg-gray-500/20 text-gray-300 text-xs">Завершена</Badge>}
                {timeLeft > 0 && <span className="text-red-400 font-mono">{timeLeft}с</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-200 font-mono">{room.code}</Badge>
            <Button variant="ghost" size="sm" onClick={handleLeave} className="text-red-400 hover:text-red-300 text-xs">
              <Icon name="LogOut" size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
        <div className="lg:w-72 p-4 space-y-3 lg:border-r border-emerald-500/10">
          {isPlaying && game && (
            <Card className="bg-emerald-900/30 border-emerald-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-emerald-400 uppercase mb-1">Банк</p>
                <p className="text-3xl font-bold text-yellow-300">{game.pot}</p>
                <p className="text-xs text-emerald-300/50 mt-1">Ставка: {game.current_bet} | Блайнды: {room.small_blind}/{room.big_blind}</p>
              </CardContent>
            </Card>
          )}

          {myCards.length > 0 && isPlaying && (
            <Card className="bg-slate-800/50 border-emerald-500/20">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-emerald-400 mb-2">Ваши карты</p>
                <div className="flex justify-center gap-2">
                  {myCards.map((card, i) => <PlayingCard key={i} card={card} />)}
                </div>
                {myPlayer && (
                  <p className="text-sm text-yellow-300 mt-2">Фишки: {myPlayer.chips}</p>
                )}
              </CardContent>
            </Card>
          )}

          <div>
            <h3 className="text-xs font-semibold text-emerald-400 uppercase mb-2 px-1">
              Игроки ({activePlayers.length}/{room.max_players})
            </h3>
            <div className="space-y-1.5">
              {players.map(p => {
                const isMe = p.user_id === myPlayer?.user_id;
                const isTurn = game && game.current_turn_seat === p.seat;
                const isDealer = game && game.dealer_seat === p.seat;
                return (
                  <div
                    key={p.user_id}
                    className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                      isTurn ? 'bg-yellow-500/20 border border-yellow-500/40 ring-1 ring-yellow-500/30' :
                      p.is_folded ? 'bg-slate-900/30 opacity-50' :
                      !p.is_active ? 'bg-slate-900/30 opacity-30' :
                      'bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <Avatar className="w-8 h-8 border border-emerald-500/30">
                      {p.avatar_url ? <AvatarImage src={p.avatar_url} /> : (
                        <AvatarFallback className="bg-emerald-600 text-white text-xs">{p.first_name?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className={`text-sm font-medium truncate ${isMe ? 'text-yellow-300' : 'text-white'}`}>
                          {p.first_name} {isMe && '(вы)'}
                        </p>
                        {isDealer && <span className="text-[10px] bg-yellow-500/30 text-yellow-300 px-1 rounded">D</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-300/60">💰 {p.chips}</span>
                        {p.current_bet > 0 && <span className="text-yellow-400">↑ {p.current_bet}</span>}
                        {p.is_folded && <span className="text-red-400">Фолд</span>}
                      </div>
                      {isWaiting && !isDealer && (
                        <p className={`text-xs ${p.is_ready ? 'text-green-400' : 'text-gray-500'}`}>
                          {p.user_id === room.host_id ? 'Хост' : p.is_ready ? 'Готов' : 'Не готов'}
                        </p>
                      )}
                    </div>
                    {p.hole_cards && !isMe && isPlaying && !p.is_folded && (
                      <div className="flex gap-0.5">
                        <div className="w-5 h-7 rounded bg-emerald-700/50 border border-emerald-600/30" />
                        <div className="w-5 h-7 rounded bg-emerald-700/50 border border-emerald-600/30" />
                      </div>
                    )}
                  </div>
                );
              })}
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
              disabled={activePlayers.length < 2 || !allReady}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Icon name="Play" size={16} className="mr-2" />
              Начать ({activePlayers.length}/2+)
            </Button>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {isPlaying && communityCards.length > 0 && (
            <div className="p-4 flex justify-center">
              <div className="bg-emerald-800/30 rounded-2xl p-4 border border-emerald-500/20">
                <p className="text-xs text-emerald-400 text-center mb-2 uppercase">{game?.phase}</p>
                <div className="flex gap-2 justify-center">
                  {communityCards.map((card, i) => <PlayingCard key={i} card={card} />)}
                  {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg border-2 border-dashed border-emerald-500/20" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isMyTurn && (
            <div className="px-4 pb-2">
              <Card className="bg-yellow-900/20 border-yellow-500/30">
                <CardContent className="p-3">
                  <p className="text-xs text-yellow-300 mb-2 text-center">Ваш ход!</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={() => doAction('fold')} className="border-red-500/40 text-red-300 hover:bg-red-500/20">
                      Фолд
                    </Button>
                    {canCheck && (
                      <Button size="sm" onClick={() => doAction('check')} className="bg-emerald-600 hover:bg-emerald-700">
                        Чек
                      </Button>
                    )}
                    {canCall && (
                      <Button size="sm" onClick={() => doAction('call')} className="bg-blue-600 hover:bg-blue-700">
                        Колл {game!.current_bet - (myPlayer?.current_bet || 0)}
                      </Button>
                    )}
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                        className="w-20 h-8 bg-slate-800 border-yellow-500/30 text-white text-sm"
                        min={game ? game.current_bet * 2 : 0}
                      />
                      <Button size="sm" onClick={() => doAction('raise', raiseAmount)} className="bg-yellow-600 hover:bg-yellow-700">
                        Рейз
                      </Button>
                    </div>
                    <Button size="sm" onClick={() => doAction('allin')} className="bg-red-600 hover:bg-red-700">
                      Ва-банк {myPlayer?.chips}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[40vh] lg:max-h-none">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.is_system ? 'justify-center' : ''}`}>
                {msg.is_system ? (
                  <p className="text-xs text-emerald-300/50 bg-emerald-900/20 px-3 py-1 rounded-full">{msg.message}</p>
                ) : (
                  <>
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      {msg.author_avatar ? <AvatarImage src={msg.author_avatar} /> : (
                        <AvatarFallback className="bg-emerald-600 text-white text-[10px]">{msg.author_name?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <span className="text-xs font-medium text-emerald-300">{msg.author_name}</span>
                      <p className="text-sm text-white/90">{msg.message}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-emerald-500/10">
            <div className="flex gap-2">
              <Input
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                placeholder="Сообщение..."
                maxLength={500}
                className="bg-slate-800/50 border-emerald-500/30 text-white placeholder:text-emerald-300/40 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              />
              <Button onClick={handleChat} size="icon" className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerGame;
