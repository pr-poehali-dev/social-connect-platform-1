import { useState, useRef, useEffect, useCallback } from 'react';
import {
  DIMA_AVATAR,
  DIMA_AI_URL,
  ANIMATE_URL,
  STICKERS,
  STICKER_REGEX,
  VOICE_REGEX,
  PHOTO_REGEX,
  getCachedVideo,
  setCachedVideo,
  parseMessageContent,
  type ChatMessage,
  type SpeechRecognitionEvent,
} from './dima-assistant/constants';
import { renderMessageContent, StickerPicker } from './dima-assistant/MessageContent';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { OLESYA_AVATAR } from './ai-assistant/constants';

const UserVoiceBubble = ({ audioUrl }: { audioUrl: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [audioUrl]);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    audio.currentTime = 0;
    intervalRef.current = setInterval(() => {
      if (audio.duration && isFinite(audio.duration)) setProgress(audio.currentTime / audio.duration);
    }, 50);
    audio.onended = () => {
      setIsPlaying(false);
      setProgress(1);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(() => setProgress(0), 600);
    };
    setIsPlaying(true);
    audio.play();
  };

  const displaySec = Math.ceil(duration);
  const min = Math.floor(displaySec / 60);
  const sec = displaySec % 60;

  return (
    <button onClick={play} className="flex items-center gap-2 group min-w-[140px]">
      <div className="relative w-9 h-9 shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isPlaying ? 'bg-blue-600' : 'bg-blue-500 group-hover:bg-blue-600'} transition-colors`}>
          <Icon name={isPlaying ? "Pause" : "Play"} size={14} className="text-white ml-0.5" />
        </div>
        {isPlaying && <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[2px] h-4">
          {Array.from({ length: 16 }).map((_, i) => {
            const barProgress = i / 16;
            const isActive = barProgress <= progress;
            const h = [4, 7, 5, 9, 6, 11, 8, 5, 10, 7, 12, 6, 9, 5, 7, 4][i];
            return (
              <div key={i} className={`w-[3px] rounded-full transition-colors duration-150 ${isActive ? 'bg-white/90' : 'bg-white/30'}`} style={{ height: `${h}px` }} />
            );
          })}
        </div>
        {duration > 0 && <p className="text-[10px] text-white/60 mt-0.5">{min}:{sec < 10 ? '0' : ''}{sec}</p>}
      </div>
    </button>
  );
};

const SWIPE_CANCEL_THRESHOLD = 100;
const formatRecTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

const DimaChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [talkingVideoUrl, setTalkingVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const swipeStartRef = useRef<number | null>(null);
  const recognitionRef = useRef<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Привет! Я Дима 😊 Рад познакомиться! Чем могу помочь?'
      }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-dima-chat', handleOpenChat);
    return () => window.removeEventListener('open-dima-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('dima-chat-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('dima-chat-closed'));
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const switchToOlesya = () => {
    setIsOpen(false);
    setTalkingVideoUrl(null);
    setIsGeneratingVideo(false);
    if (abortRef.current) abortRef.current.abort();
    setTimeout(() => window.dispatchEvent(new CustomEvent('open-olesya-chat')), 100);
  };

  const generateTalkingHead = useCallback(async (text: string) => {
    if (!voiceEnabled) return;
    const cleanText = text.replace(STICKER_REGEX, '').replace(VOICE_REGEX, '$2').replace(PHOTO_REGEX, '').trim();
    if (!cleanText) return;
    const shortText = cleanText.length > 250 ? cleanText.slice(0, 247) + '...' : cleanText;
    const cached = getCachedVideo(shortText);
    if (cached) { setTalkingVideoUrl(cached); return; }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsGeneratingVideo(true);
    setTalkingVideoUrl(null);
    try {
      const response = await fetch(ANIMATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: DIMA_AVATAR, text: shortText, voice: 'ru-RU-DmitryNeural' }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      if (data.videoUrl && !controller.signal.aborted) {
        setCachedVideo(shortText, data.videoUrl);
        setTalkingVideoUrl(data.videoUrl);
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.log('D-ID animation unavailable');
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [voiceEnabled]);

  const sendMessage = async (text: string, audioUrl?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: trimmed, audioUrl };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setShowStickerPicker(false);
    try {
      const response = await fetch(DIMA_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: newMessages.slice(-20).map(m => ({ role: m.role, content: m.content }))
        })
      });
      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMsg]);
      generateTalkingHead(data.reply);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ой, что-то пошло не так... Попробуй ещё раз через минутку 😅' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendSticker = (stickerId: string) => {
    const sticker = STICKERS[stickerId];
    if (!sticker || isLoading) return;
    setShowStickerPicker(false);
    sendMessage(`[sticker:${stickerId}]`);
  };

  const startListening = () => {
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new (SR as new () => { lang: string; interimResults: boolean; continuous: boolean; onresult: (e: SpeechRecognitionEvent) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void })();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => { setIsListening(false); sendMessage(event.results[0][0].transcript); };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) { (recognitionRef.current as { stop: () => void }).stop(); setIsListening(false); }
  };

  const finishRecording = (audioUrl: string) => {
    const transcript = (recognitionRef.current as { transcript?: string })?.transcript || '';
    sendMessage(transcript || '[Голосовое сообщение]', audioUrl);
  };

  const startRecording = async () => {
    if (isLoading || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        finishRecording(url);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      const SR = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
      if (SR) {
        const recognition = new (SR as new () => { lang: string; interimResults: boolean; continuous: boolean; onresult: (e: SpeechRecognitionEvent) => void; onerror: () => void; onend: () => void; start: () => void; stop: () => void })();
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.continuous = true;
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = 0; i < Object.keys(event.results).length; i++) transcript += event.results[i][0].transcript;
          if (transcript.trim()) recognitionRef.current = { ...recognition, transcript: transcript.trim() };
        };
        recognition.onerror = () => {};
        recognition.onend = () => {};
        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    if (recognitionRef.current) try { (recognitionRef.current as { stop: () => void }).stop(); } catch { /* ignore */ }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) try { (recognitionRef.current as { stop: () => void }).stop(); } catch { /* ignore */ }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const handleSwipeMove = (clientX: number) => {
    if (!isRecording || swipeStartRef.current === null) return;
    const offset = Math.max(0, swipeStartRef.current - clientX);
    setSwipeOffset(offset);
    if (offset >= SWIPE_CANCEL_THRESHOLD) { cancelRecording(); setSwipeOffset(0); swipeStartRef.current = null; }
  };

  const handleSwipeEnd = () => { if (!isRecording) return; if (swipeOffset < SWIPE_CANCEL_THRESHOLD) setSwipeOffset(0); };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-[380px] h-[100dvh] sm:h-[560px] bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white shrink-0 sm:rounded-t-2xl">
        <div className="relative">
          <img src={DIMA_AVATAR} alt="Дима" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
          {isGeneratingVideo && <div className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Дима</p>
          <p className="text-xs text-white/70">
            {isLoading ? 'печатает...' : isGeneratingVideo ? 'оживает...' : talkingVideoUrl ? 'говорит...' : 'онлайн'}
          </p>
        </div>
        <button onClick={switchToOlesya} className="relative p-0.5 rounded-full hover:bg-white/20 transition-colors group" title="Переключиться на Олесю">
          <img src={OLESYA_AVATAR} alt="Олеся" className="w-8 h-8 rounded-full object-cover border-2 border-white/40 group-hover:border-white/80 transition-colors" />
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-blue-500" />
        </button>
        <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" title={voiceEnabled ? 'Выключить анимацию' : 'Включить анимацию'}>
          <Icon name={voiceEnabled ? "Video" : "VideoOff"} size={18} />
        </button>
        <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
          <Icon name="X" size={18} />
        </button>
      </div>

      {/* Talking head video */}
      {talkingVideoUrl && (
        <div className="flex justify-center py-2 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-blue-400/50 bg-black">
            <video ref={videoRef} src={talkingVideoUrl} autoPlay playsInline className="w-52 h-52 object-cover" onEnded={() => setTalkingVideoUrl(null)} onError={() => setTalkingVideoUrl(null)} />
            <button onClick={() => setTalkingVideoUrl(null)} className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
              <Icon name="X" size={12} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
              <p className="text-white text-[10px] font-medium">Дима говорит...</p>
            </div>
          </div>
        </div>
      )}
      {isGeneratingVideo && !talkingVideoUrl && (
        <div className="flex justify-center py-2 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Дима оживает...
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-950">
        {messages.map((msg, i) => {
          const isUserVoice = msg.role === 'user' && msg.audioUrl;
          const parts = parseMessageContent(msg.content);
          const isOnlySticker = parts.length === 1 && parts[0].type === 'sticker';
          const isOnlyVoice = parts.length === 1 && parts[0].type === 'voice';
          const isSpecial = isOnlySticker || isOnlyVoice || isUserVoice;

          return (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <img src={DIMA_AVATAR} alt="Дима" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
              )}
              <div className={`max-w-[80%] ${isSpecial ? 'p-1' : 'px-3 py-2'} rounded-2xl text-sm leading-relaxed ${
                isOnlySticker ? 'bg-transparent border-none shadow-none'
                  : isOnlyVoice ? 'bg-white dark:bg-slate-800 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 px-2 py-2'
                  : isUserVoice ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm px-3 py-2'
                  : msg.role === 'user' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm'
                  : 'bg-white dark:bg-slate-800 text-foreground rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700'
              }`}>
                {isUserVoice ? <UserVoiceBubble audioUrl={msg.audioUrl!} /> : renderMessageContent(msg.content)}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-2">
            <img src={DIMA_AVATAR} alt="Дима" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticker picker */}
      {showStickerPicker && !isRecording && <StickerPicker onSendSticker={sendSticker} />}

      {/* Input */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0 sm:rounded-b-2xl">
        {isRecording ? (
          <div
            className="relative flex items-center gap-2 select-none touch-none"
            onMouseMove={(e) => handleSwipeMove(e.clientX)}
            onMouseUp={handleSwipeEnd}
            onMouseLeave={handleSwipeEnd}
            onTouchMove={(e) => handleSwipeMove(e.touches[0].clientX)}
            onTouchEnd={handleSwipeEnd}
            onTouchStart={(e) => { if (!swipeStartRef.current) swipeStartRef.current = e.touches[0].clientX; }}
            onMouseDown={(e) => { if (!swipeStartRef.current) swipeStartRef.current = e.clientX; }}
          >
            <div className="flex-1 flex items-center gap-2 transition-transform duration-75" style={{ transform: `translateX(-${swipeOffset}px)`, opacity: Math.max(0, 1 - swipeOffset / SWIPE_CANCEL_THRESHOLD) }}>
              <button onClick={() => { cancelRecording(); setSwipeOffset(0); swipeStartRef.current = null; }} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                <Icon name="X" size={18} />
              </button>
              <div className="flex-1 flex items-center gap-2 px-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-500 font-medium">{formatRecTime(recordingTime)}</span>
                <div className="flex-1 flex items-center justify-center gap-[2px]">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-[2px] bg-red-400/60 rounded-full animate-pulse" style={{ height: `${4 + Math.random() * 12}px`, animationDelay: `${i * 80}ms` }} />
                  ))}
                </div>
              </div>
              <button onClick={() => { stopRecording(); setSwipeOffset(0); swipeStartRef.current = null; }} className="p-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white transition-all shrink-0 hover:shadow-md">
                <Icon name="Send" size={18} />
              </button>
            </div>
            {swipeOffset > 10 && (
              <div className="absolute left-3 flex items-center gap-1.5 text-red-400 transition-opacity" style={{ opacity: Math.min(1, swipeOffset / (SWIPE_CANCEL_THRESHOLD * 0.7)) }}>
                <Icon name="ChevronLeft" size={14} />
                <span className="text-xs font-medium">отмена</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {input.trim() ? (
              <button onClick={isListening ? stopListening : startListening} disabled={isLoading} className={`p-2 rounded-full transition-all shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700'} ${isLoading ? 'opacity-50' : ''}`}>
                <Icon name={isListening ? "Square" : "Mic"} size={18} />
              </button>
            ) : (
              <button onMouseDown={startRecording} onTouchStart={startRecording} disabled={isLoading} className={`p-2 rounded-full transition-all shrink-0 bg-slate-100 dark:bg-slate-800 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 ${isLoading ? 'opacity-50' : ''}`} title="Удерживайте для записи голосового">
                <Icon name="Mic" size={18} />
              </button>
            )}
            <button onClick={() => setShowStickerPicker(!showStickerPicker)} disabled={isLoading} className={`p-2 rounded-full transition-all shrink-0 ${showStickerPicker ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700'} ${isLoading ? 'opacity-50' : ''}`}>
              <Icon name="Smile" size={18} />
            </button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder={isListening ? 'Говорите...' : 'Напишите сообщение...'}
              disabled={isLoading || isListening}
              className="flex-1 rounded-full border-slate-200 dark:border-slate-700"
            />
            <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white disabled:opacity-50 transition-all shrink-0 hover:shadow-md">
              <Icon name="Send" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DimaChat;