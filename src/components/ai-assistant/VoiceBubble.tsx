import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { OLESYA_AVATAR, TTS_URL } from './constants';

const VoiceBubble = ({ text }: { text: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(Math.max(2, text.length * 0.08));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loadAudio = async (): Promise<HTMLAudioElement> => {
    if (audioRef.current && audioUrlRef.current) return audioRef.current;

    setIsLoading(true);
    const res = await fetch(TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error('TTS failed');
    const data = await res.json();

    if (data.duration) setDuration(data.duration);

    const audio = new Audio(data.audioUrl);
    audio.preload = 'auto';

    await new Promise<void>((resolve, reject) => {
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => reject(new Error('Audio load failed'));
      audio.load();
    });

    if (audio.duration && isFinite(audio.duration)) {
      setDuration(audio.duration);
    }

    audioRef.current = audio;
    audioUrlRef.current = data.audioUrl;
    setIsLoading(false);
    return audio;
  };

  const play = async () => {
    if (isLoading) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    try {
      const audio = await loadAudio();

      audio.currentTime = 0;

      intervalRef.current = setInterval(() => {
        if (audio.duration && isFinite(audio.duration)) {
          setProgress(audio.currentTime / audio.duration);
        }
      }, 50);

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(1);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => setProgress(0), 600);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setProgress(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      setIsPlaying(true);
      await audio.play();
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const displaySec = Math.ceil(duration);
  const min = Math.floor(displaySec / 60);
  const sec = displaySec % 60;

  return (
    <button onClick={play} className="flex items-center gap-2 group min-w-[160px]">
      <div className="relative w-10 h-10 shrink-0">
        <img
          src={OLESYA_AVATAR}
          alt="voice"
          className={`w-10 h-10 rounded-full object-cover border-2 ${isPlaying ? 'border-pink-500' : 'border-pink-300'} transition-colors`}
        />
        {isPlaying && (
          <div className="absolute inset-0 rounded-full border-2 border-pink-400 animate-pulse" />
        )}
        <div className={`absolute inset-0 flex items-center justify-center rounded-full ${isPlaying ? 'bg-black/20' : 'bg-black/10 group-hover:bg-black/20'} transition-colors`}>
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Icon name={isPlaying ? "Pause" : "Play"} size={14} className="text-white ml-0.5" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[2px] h-4">
          {Array.from({ length: 20 }).map((_, i) => {
            const barProgress = i / 20;
            const isActive = barProgress <= progress;
            const h = [3, 5, 8, 6, 10, 7, 12, 5, 9, 11, 6, 8, 13, 7, 10, 5, 9, 6, 4, 3][i];
            return (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-colors duration-150 ${
                  isActive
                    ? 'bg-gradient-to-t from-pink-500 to-purple-500'
                    : 'bg-pink-200 dark:bg-pink-900/40'
                }`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">{min}:{sec < 10 ? '0' : ''}{sec}</p>
      </div>
    </button>
  );
};

export default VoiceBubble;
