import { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  OLESYA_AVATAR,
  AI_URL,
  ANIMATE_URL,
  STICKERS,
  STICKER_REGEX,
  VOICE_REGEX,
  getCachedVideo,
  setCachedVideo,
  parseMessageContent,
  type ChatMessage,
  type SpeechRecognitionEvent,
} from './ai-assistant/constants';
import { renderMessageContent } from './ai-assistant/MessageContent';
import { StickerPicker } from './ai-assistant/MessageContent';

const AiAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [talkingVideoUrl, setTalkingVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Привет! Я Олеся 😊 Чем могу помочь? Можем поболтать, или подскажу что-нибудь по сайту!'
      }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const generateTalkingHead = useCallback(async (text: string) => {
    if (!voiceEnabled) return;

    const cleanText = text.replace(STICKER_REGEX, '').replace(VOICE_REGEX, '$1').trim();
    if (!cleanText) return;

    const shortText = cleanText.length > 250 ? cleanText.slice(0, 247) + '...' : cleanText;

    const cached = getCachedVideo(shortText);
    if (cached) {
      setTalkingVideoUrl(cached);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGeneratingVideo(true);
    setTalkingVideoUrl(null);

    try {
      const response = await fetch(ANIMATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: OLESYA_AVATAR,
          text: shortText,
          voice: 'ru-RU-SvetlanaNeural'
        }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      if (data.videoUrl && !controller.signal.aborted) {
        setCachedVideo(shortText, data.videoUrl);
        setTalkingVideoUrl(data.videoUrl);
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.log('D-ID animation unavailable');
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  }, [voiceEnabled]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setShowStickerPicker(false);

    try {
      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: newMessages.slice(-20)
        })
      });

      if (!response.ok) throw new Error('Server error');

      const data = await response.json();
      const assistantMsg: ChatMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMsg]);
      generateTalkingHead(data.reply);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ой, что-то пошло не так... Попробуй ещё раз через минутку 🙈'
      }]);
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
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new (SpeechRecognition as new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: (event: SpeechRecognitionEvent) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    })();

    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setIsListening(false);
      sendMessage(result);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
      setIsListening(false);
    }
  };

  const closeTalkingVideo = () => {
    setTalkingVideoUrl(null);
    setIsGeneratingVideo(false);
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 group"
      >
        <div className="relative">
          <img
            src={OLESYA_AVATAR}
            alt="Олеся"
            className="w-14 h-14 rounded-full border-3 border-pink-400 shadow-lg object-cover group-hover:scale-110 transition-transform"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow">
            Олеся
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-96 h-[100dvh] sm:h-[550px] flex flex-col bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white shrink-0">
        <div className="relative">
          <img src={OLESYA_AVATAR} alt="Олеся" className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
          {isGeneratingVideo && (
            <div className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-pink-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Олеся</p>
          <p className="text-xs text-white/70">
            {isLoading ? 'печатает...' : isGeneratingVideo ? 'оживает...' : talkingVideoUrl ? 'говорит...' : 'онлайн'}
          </p>
        </div>
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          title={voiceEnabled ? 'Выключить анимацию' : 'Включить анимацию'}
        >
          <Icon name={voiceEnabled ? "Video" : "VideoOff"} size={18} />
        </button>
        <button
          onClick={() => { setIsOpen(false); closeTalkingVideo(); }}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-950">
        {talkingVideoUrl && (
          <div className="flex justify-center py-2 animate-in fade-in duration-500">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-pink-400/50 bg-black">
              <video
                ref={videoRef}
                src={talkingVideoUrl}
                autoPlay
                playsInline
                className="w-52 h-52 object-cover"
                onEnded={() => setTalkingVideoUrl(null)}
                onError={() => setTalkingVideoUrl(null)}
              />
              <button
                onClick={closeTalkingVideo}
                className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <Icon name="X" size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                <p className="text-white text-[10px] font-medium">Олеся говорит...</p>
              </div>
            </div>
          </div>
        )}

        {isGeneratingVideo && !talkingVideoUrl && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 px-3 py-1.5 rounded-full text-xs">
              <div className="w-3 h-3 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
              Олеся оживает...
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const parts = parseMessageContent(msg.content);
          const isOnlySticker = parts.length === 1 && parts[0].type === 'sticker';
          const isOnlyVoice = parts.length === 1 && parts[0].type === 'voice';
          const isSpecial = isOnlySticker || isOnlyVoice;

          return (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <img src={OLESYA_AVATAR} alt="Олеся" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
              )}
              <div className={`max-w-[80%] ${isSpecial ? 'p-1' : 'px-3 py-2'} rounded-2xl text-sm leading-relaxed ${
                isOnlySticker
                  ? 'bg-transparent border-none shadow-none'
                  : isOnlyVoice
                    ? 'bg-white dark:bg-slate-800 rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 px-2 py-2'
                    : msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                      : 'bg-white dark:bg-slate-800 text-foreground rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700'
              }`}>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2">
            <img src={OLESYA_AVATAR} alt="Олеся" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showStickerPicker && (
        <StickerPicker onSendSticker={sendSticker} />
      )}

      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-purple-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            } ${isLoading ? 'opacity-50' : ''}`}
          >
            <Icon name={isListening ? "Square" : "Mic"} size={18} />
          </button>
          <button
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            disabled={isLoading}
            className={`p-2 rounded-full transition-all shrink-0 ${
              showStickerPicker
                ? 'bg-pink-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-purple-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            } ${isLoading ? 'opacity-50' : ''}`}
          >
            <Icon name="Smile" size={18} />
          </button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder={isListening ? 'Говорите...' : 'Напишите сообщение...'}
            disabled={isLoading || isListening}
            className="flex-1 rounded-full border-slate-200 dark:border-slate-700"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 transition-all shrink-0 hover:shadow-md"
          >
            <Icon name="Send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantChat;
