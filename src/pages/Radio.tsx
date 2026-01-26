import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';

const Radio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  const radioStream = 'https://radiorecord.hostingradio.ru/rr_main96.aacp';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent mb-8 text-center">
              Радио Рекорд
            </h1>

            <Card className="rounded-3xl border-2 shadow-xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-8">
                  {/* Logo / Cover */}
                  <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-2xl">
                    <div className="text-white text-center">
                      <Icon name="Radio" size={80} />
                      <p className="text-2xl font-bold mt-4">РЕКОРД</p>
                    </div>
                  </div>

                  {/* Station Info */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Радио Рекорд</h2>
                    <p className="text-muted-foreground">Танцевальная музыка 24/7</p>
                  </div>

                  {/* Play Button */}
                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="w-24 h-24 rounded-full text-2xl shadow-xl"
                  >
                    <Icon name={isPlaying ? 'Pause' : 'Play'} size={40} />
                  </Button>

                  {/* Volume Control */}
                  <div className="w-full max-w-sm space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Icon name="Volume2" size={18} />
                        Громкость
                      </span>
                      <span>{volume}%</span>
                    </div>
                    <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 text-sm">
                    {isPlaying ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-600 font-medium">В эфире</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-muted-foreground">Остановлено</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Hidden Audio Element */}
                <audio
                  ref={audioRef}
                  src={radioStream}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>Онлайн-трансляция с официального сервера Радио Рекорд</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Radio;
