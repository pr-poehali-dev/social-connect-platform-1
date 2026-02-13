import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

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
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
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

    setIsPlaying(true);
    audio.play();
  };

  const displaySec = Math.ceil(duration);
  const min = Math.floor(displaySec / 60);
  const sec = displaySec % 60;

  return (
    <button onClick={play} className="flex items-center gap-2 group min-w-[140px]">
      <div className="relative w-9 h-9 shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isPlaying ? 'bg-purple-600' : 'bg-purple-500 group-hover:bg-purple-600'} transition-colors`}>
          <Icon name={isPlaying ? "Pause" : "Play"} size={14} className="text-white ml-0.5" />
        </div>
        {isPlaying && (
          <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[2px] h-4">
          {Array.from({ length: 16 }).map((_, i) => {
            const barProgress = i / 16;
            const isActive = barProgress <= progress;
            const h = [4, 7, 5, 9, 6, 11, 8, 5, 10, 7, 12, 6, 9, 5, 7, 4][i];
            return (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/90'
                    : 'bg-white/30'
                }`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
        {duration > 0 && (
          <p className="text-[10px] text-white/60 mt-0.5">{min}:{sec < 10 ? '0' : ''}{sec}</p>
        )}
      </div>
    </button>
  );
};

export default UserVoiceBubble;
