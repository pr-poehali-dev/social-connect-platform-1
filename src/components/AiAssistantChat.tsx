import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

const OLESYA_AVATAR = 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/33e3739a-a831-4bf6-8b23-6a88b399f079.jpg';
const AI_URL = 'https://functions.poehali.dev/f0b3dae9-2298-428f-befa-830af5d46625';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

const AiAssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

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
      speakText(data.reply);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ой, что-то пошло не так... Попробуй ещё раз через минутку 🙈'
      }]);
    } finally {
      setIsLoading(false);
    }
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
      const text = event.results[0][0].transcript;
      setIsListening(false);
      sendMessage(text);
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

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
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
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-pink-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Олеся</p>
          <p className="text-xs text-white/70">
            {isLoading ? 'печатает...' : isSpeaking ? 'говорит...' : 'онлайн'}
          </p>
        </div>
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={18} />
        </button>
        <button
          onClick={() => { setIsOpen(false); stopSpeaking(); }}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <Icon name="X" size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-950">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' && (
              <img src={OLESYA_AVATAR} alt="Олеся" className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                : 'bg-white dark:bg-slate-800 text-foreground rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

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