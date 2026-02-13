import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

const BACKEND_URL = 'https://functions.poehali.dev/b193ada3-6fc7-4a7d-aaf0-1f33cc4fa615';

const VoiceAssistantModal = ({ isOpen, onOpenChange }: VoiceAssistantModalProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [resultType, setResultType] = useState<string>('');
  const [query, setQuery] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [textQuery, setTextQuery] = useState('');
  const recognitionRef = useRef<unknown>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('voiceAssistantEnabled');
    if (saved !== null) {
      setVoiceEnabled(saved === 'true');
    }
  }, []);

  useEffect(() => {
    if (!isOpen && recognitionRef.current) {
      try {
        (recognitionRef.current as { stop: () => void }).stop();
      } catch (_) { /* ignore */ }
      setIsListening(false);
    }
  }, [isOpen]);

  const toggleVoice = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    localStorage.setItem('voiceAssistantEnabled', String(enabled));
    if (!enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Ваш браузер не поддерживает распознавание речи. Используйте текстовый ввод.');
      return;
    }

    setError(null);
    setResults(null);
    setTranscribedText('');
    setQuery('');

    const recognition = new (SpeechRecognition as new () => {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      continuous: boolean;
      onresult: (event: SpeechRecognitionEvent) => void;
      onerror: (event: { error: string }) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    })();

    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscribedText(text);
      setIsListening(false);
      searchByText(text);
    };

    recognition.onerror = (event: { error: string }) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('Разрешите доступ к микрофону в настройках браузера');
      } else if (event.error === 'no-speech') {
        setError('Речь не распознана. Попробуйте снова или введите текст.');
      } else if (event.error === 'network') {
        setError('Нет подключения к интернету для распознавания речи. Используйте текстовый ввод.');
      } else {
        setError('Ошибка распознавания: ' + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

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

  const searchByText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error('Ошибка обработки запроса');
      }

      const data = await response.json();
      console.log('Search response:', data);

      setResults(data.results as Record<string, unknown>[]);
      setResultType(data.type);
      setQuery(data.query);
      speakResults(data.results.length, data.type);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Search error:', err);
      setError('Не удалось выполнить поиск: ' + message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = () => {
    const trimmed = textQuery.trim();
    if (!trimmed || isProcessing) return;
    setTranscribedText(trimmed);
    setTextQuery('');
    searchByText(trimmed);
  };

  const handleItemClick = (item: Record<string, unknown>) => {
    onOpenChange(false);
    switch (resultType) {
      case 'people':
        navigate(`/profile/${item.user_id}`);
        break;
      case 'events':
        navigate(`/events/${item.id}`);
        break;
      case 'services':
        navigate(`/services/${item.id}`);
        break;
      case 'ads':
        navigate(`/ads`);
        break;
    }
  };

  const speakResults = (count: number, type: string) => {
    if (!voiceEnabled) return;
    let message = '';
    if (count === 0) {
      message = 'Ничего не найдено. Попробуйте изменить запрос.';
    } else {
      switch (type) {
        case 'people':
          message = `Найдено ${count} ${count === 1 ? 'человек' : 'людей'}.`;
          break;
        case 'events':
          message = `Найдено ${count} ${count === 1 ? 'мероприятие' : count < 5 ? 'мероприятия' : 'мероприятий'}.`;
          break;
        case 'services':
          message = `Найдено ${count} ${count === 1 ? 'услуга' : count < 5 ? 'услуги' : 'услуг'}.`;
          break;
        case 'ads':
          message = `Найдено ${count} ${count === 1 ? 'объявление' : count < 5 ? 'объявления' : 'объявлений'}.`;
          break;
        default:
          message = `Найдено ${count} результатов.`;
      }
    }
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'ru-RU';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getResultLabel = () => {
    if (!results) return '';
    const count = results.length;
    switch (resultType) {
      case 'people':
        return `${count} ${count === 1 ? 'человек' : 'людей'}`;
      case 'events':
        return `${count} ${count === 1 ? 'мероприятие' : count < 5 ? 'мероприятия' : 'мероприятий'}`;
      case 'services':
        return `${count} ${count === 1 ? 'услуга' : count < 5 ? 'услуги' : 'услуг'}`;
      case 'ads':
        return `${count} ${count === 1 ? 'объявление' : count < 5 ? 'объявления' : 'объявлений'}`;
      default:
        return `${count} результатов`;
    }
  };

  const renderResultItem = (item: Record<string, unknown>) => {
    switch (resultType) {
      case 'people':
        return (
          <div
            key={item.id as string}
            onClick={() => handleItemClick(item)}
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border hover:border-purple-500 cursor-pointer transition-colors"
          >
            <img
              src={(item.avatar_url as string) || 'https://via.placeholder.com/48'}
              alt={item.name as string}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name as string}, {item.age as number}</p>
              <p className="text-sm text-muted-foreground truncate">{item.city as string}</p>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          </div>
        );

      case 'events':
        return (
          <div
            key={item.id as string}
            onClick={() => handleItemClick(item)}
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border hover:border-purple-500 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
              <Icon name="Calendar" size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title as string}</p>
              <p className="text-sm text-muted-foreground truncate">{item.city as string} {item.event_date ? `• ${item.event_date as string}` : ''}</p>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          </div>
        );

      case 'services':
        return (
          <div
            key={item.id as string}
            onClick={() => handleItemClick(item)}
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border hover:border-purple-500 cursor-pointer transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
              <Icon name="Briefcase" size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.title as string || item.name as string}</p>
              <p className="text-sm text-muted-foreground truncate">{item.city as string} {item.price ? `• ${item.price as string}` : ''}</p>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          </div>
        );

      case 'ads':
        return (
          <div
            key={item.id as string}
            onClick={() => handleItemClick(item)}
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border hover:border-purple-500 cursor-pointer transition-colors"
          >
            <img
              src={(item.avatar_url as string) || 'https://via.placeholder.com/48'}
              alt={item.name as string}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name as string}, {item.age as number}</p>
              <p className="text-sm text-muted-foreground truncate">
                {item.action === 'invite' ? 'Приглашает' : 'Хочет пойти'}: {item.schedule as string}
              </p>
              <p className="text-xs text-muted-foreground">{item.city as string}</p>
            </div>
            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Search" size={24} className="text-purple-500" />
              Умный поиск
            </div>
            <div className="flex items-center gap-2">
              <Icon name={voiceEnabled ? "Volume2" : "VolumeX"} size={18} className="text-muted-foreground" />
              <Switch
                checked={voiceEnabled}
                onCheckedChange={toggleVoice}
                className="scale-75"
              />
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={textQuery}
              onChange={(e) => setTextQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
              placeholder="Напишите что ищете..."
              disabled={isProcessing || isListening}
              className="flex-1"
            />
            <button
              onClick={handleTextSubmit}
              disabled={isProcessing || isListening || !textQuery.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <Icon name="Search" size={20} className="text-white" />
              )}
            </button>
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all shrink-0 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Icon
                name={isListening ? 'Square' : 'Mic'}
                size={20}
                className={isListening ? 'text-white' : 'text-purple-500'}
              />
            </button>
          </div>

          {isListening && (
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-6 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <span className="w-1 h-7 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                <span className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
              </div>
              <p className="text-sm text-muted-foreground">Говорите...</p>
            </div>
          )}

          {transcribedText && !isListening && (
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Запрос:</p>
              <p className="text-sm font-medium">"{transcribedText}"</p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {isSpeaking && (
            <p className="text-sm text-purple-500 text-center">Озвучиваю результаты...</p>
          )}

          {!results && !isListening && !isProcessing && !error && (
            <div className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="font-medium mb-1">Примеры запросов:</p>
              <ul className="space-y-1">
                <li>👤 "девушки из Москвы"</li>
                <li>🎉 "концерты на выходных"</li>
                <li>💼 "фотограф в Питере"</li>
                <li>🎯 "кто хочет пойти в кино"</li>
              </ul>
            </div>
          )}

          {query && results && (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Найдено: {getResultLabel()}
                </p>
              </div>

              {results.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {results.map((item) => renderResultItem(item))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ничего не найдено. Попробуйте другой запрос.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAssistantModal;
