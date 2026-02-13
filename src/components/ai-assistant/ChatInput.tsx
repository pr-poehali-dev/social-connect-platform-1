import { useRef, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { StickerPicker } from './MessageContent';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  isListening: boolean;
  isRecording: boolean;
  recordingTime: number;
  showStickerPicker: boolean;
  onInputChange: (value: string) => void;
  onSend: (text: string) => void;
  onSendSticker: (id: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onToggleStickerPicker: () => void;
}

const SWIPE_CANCEL_THRESHOLD = 100;

const formatRecTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};

const ChatInput = ({
  input,
  isLoading,
  isListening,
  isRecording,
  recordingTime,
  showStickerPicker,
  onInputChange,
  onSend,
  onSendSticker,
  onStartListening,
  onStopListening,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onToggleStickerPicker,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const swipeStartRef = useRef<number | null>(null);

  const handleSwipeMove = (clientX: number) => {
    if (!isRecording || swipeStartRef.current === null) return;
    const delta = swipeStartRef.current - clientX;
    const offset = Math.max(0, delta);
    setSwipeOffset(offset);
    if (offset >= SWIPE_CANCEL_THRESHOLD) {
      onCancelRecording();
      setSwipeOffset(0);
      swipeStartRef.current = null;
    }
  };

  const handleSwipeEnd = () => {
    if (!isRecording) return;
    if (swipeOffset < SWIPE_CANCEL_THRESHOLD) {
      setSwipeOffset(0);
    }
  };

  const handleStopRecording = () => {
    onStopRecording();
    setSwipeOffset(0);
    swipeStartRef.current = null;
  };

  const handleCancelRecording = () => {
    onCancelRecording();
    setSwipeOffset(0);
    swipeStartRef.current = null;
  };

  return (
    <>
      {showStickerPicker && !isRecording && (
        <StickerPicker onSendSticker={onSendSticker} />
      )}

      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
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
            <div
              className="flex-1 flex items-center gap-2 transition-transform duration-75"
              style={{ transform: `translateX(-${swipeOffset}px)`, opacity: Math.max(0, 1 - swipeOffset / SWIPE_CANCEL_THRESHOLD) }}
            >
              <button
                onClick={handleCancelRecording}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              >
                <Icon name="X" size={18} />
              </button>
              <div className="flex-1 flex items-center gap-2 px-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-500 font-medium">{formatRecTime(recordingTime)}</span>
                <div className="flex-1 flex items-center justify-center gap-[2px]">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[2px] bg-red-400/60 rounded-full animate-pulse"
                      style={{
                        height: `${4 + Math.random() * 12}px`,
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleStopRecording}
                className="p-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all shrink-0 hover:shadow-md"
              >
                <Icon name="Send" size={18} />
              </button>
            </div>
            {swipeOffset > 10 && (
              <div
                className="absolute left-3 flex items-center gap-1.5 text-red-400 transition-opacity"
                style={{ opacity: Math.min(1, swipeOffset / (SWIPE_CANCEL_THRESHOLD * 0.7)) }}
              >
                <Icon name="ChevronLeft" size={14} />
                <span className="text-xs font-medium">отмена</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {input.trim() ? (
              <button
                onClick={isListening ? onStopListening : onStartListening}
                disabled={isLoading}
                className={`p-2 rounded-full transition-all shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-purple-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                } ${isLoading ? 'opacity-50' : ''}`}
              >
                <Icon name={isListening ? "Square" : "Mic"} size={18} />
              </button>
            ) : (
              <button
                onMouseDown={onStartRecording}
                onTouchStart={onStartRecording}
                disabled={isLoading}
                className={`p-2 rounded-full transition-all shrink-0 bg-slate-100 dark:bg-slate-800 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 ${isLoading ? 'opacity-50' : ''}`}
                title="Удерживайте для записи голосового"
              >
                <Icon name="Mic" size={18} />
              </button>
            )}
            <button
              onClick={onToggleStickerPicker}
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
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend(input)}
              placeholder={isListening ? 'Говорите...' : 'Напишите сообщение...'}
              disabled={isLoading || isListening}
              className="flex-1 rounded-full border-slate-200 dark:border-slate-700"
            />
            <button
              onClick={() => onSend(input)}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 transition-all shrink-0 hover:shadow-md"
            >
              <Icon name="Send" size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatInput;
