import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  image: string;
  audio: string;
}

const MusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPopularTracks();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audio;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const loadPopularTracks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/7f8c6fc2-dd60-49cc-b83d-543b3777a8cd?action=popular&limit=30'
      );
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить музыку', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadPopularTracks();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/7f8c6fc2-dd60-49cc-b83d-543b3777a8cd?action=search&query=${encodeURIComponent(searchQuery)}&limit=30`
      );
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось найти треки', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex < tracks.length - 1) {
      setCurrentTrack(tracks[currentIndex + 1]);
    }
  };

  const prevTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(tracks[currentIndex - 1]);
    }
  };

  return (
    <Card className="rounded-3xl border-2 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Music" size={32} />
          <h2 className="text-2xl font-bold">Музыка</h2>
        </div>

        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Поиск треков..."
            className="rounded-xl h-12 bg-white/20 border-white/30 text-white placeholder:text-white/70"
          />
          <Button 
            onClick={handleSearch}
            className="rounded-xl h-12 px-6 bg-white text-purple-600 hover:bg-white/90"
          >
            <Icon name="Search" size={20} />
          </Button>
        </div>
      </div>

      <div className="p-6">
        {currentTrack && (
          <Card className="rounded-2xl border-2 p-6 mb-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={currentTrack.image} 
                alt={currentTrack.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{currentTrack.name}</h3>
                <p className="text-muted-foreground truncate">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 rounded-lg appearance-none bg-gray-200 cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={prevTrack}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                >
                  <Icon name="SkipBack" size={20} />
                </Button>
                <Button
                  onClick={togglePlay}
                  size="icon"
                  className="rounded-full w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600"
                >
                  <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                </Button>
                <Button
                  onClick={nextTrack}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-12 h-12"
                >
                  <Icon name="SkipForward" size={20} />
                </Button>
              </div>
            </div>
          </Card>
        )}

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-accent ${
                    currentTrack?.id === track.id ? 'bg-accent' : ''
                  }`}
                >
                  <img 
                    src={track.image} 
                    alt={track.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    {formatTime(track.duration)}
                  </span>
                  {currentTrack?.id === track.id && isPlaying && (
                    <Icon name="Music" size={20} className="text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
        onLoadedMetadata={handleTimeUpdate}
      />
    </Card>
  );
};

export default MusicPlayer;
