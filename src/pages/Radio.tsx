import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';

interface RadioStation {
  id: string;
  name: string;
  description: string;
  stream: string;
  gradient: string;
}

const stations: RadioStation[] = [
  {
    id: 'main',
    name: 'Радио Рекорд',
    description: 'Танцевальная музыка 24/7',
    stream: 'https://radiorecord.hostingradio.ru/rr_main96.aacp',
    gradient: 'from-purple-500 via-pink-500 to-red-500'
  },
  {
    id: 'club',
    name: 'Рекорд Клуб',
    description: 'Клубная музыка',
    stream: 'https://radiorecord.hostingradio.ru/club96.aacp',
    gradient: 'from-blue-500 via-purple-500 to-pink-500'
  },
  {
    id: 'dance',
    name: 'Рекорд Дэнс',
    description: 'Dance хиты',
    stream: 'https://radiorecord.hostingradio.ru/dance96.aacp',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500'
  },
  {
    id: 'superdisco',
    name: 'Superdискотека 90-х',
    description: 'Легендарные хиты 90-х',
    stream: 'https://radiorecord.hostingradio.ru/sd9096.aacp',
    gradient: 'from-orange-500 via-red-500 to-pink-500'
  },
  {
    id: 'vip',
    name: 'VIP Mix',
    description: 'Премиум миксы',
    stream: 'https://radiorecord.hostingradio.ru/vip96.aacp',
    gradient: 'from-yellow-500 via-orange-500 to-red-500'
  },
  {
    id: 'pump',
    name: 'Pump',
    description: 'Энергичная музыка',
    stream: 'https://radiorecord.hostingradio.ru/pump96.aacp',
    gradient: 'from-green-500 via-emerald-500 to-teal-500'
  }
];

const Radio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentStation, setCurrentStation] = useState<RadioStation>(stations[0]);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const changeStation = (station: RadioStation) => {
    const wasPlaying = isPlaying;
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setCurrentStation(station);
    
    if (wasPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
    }
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
                  <div className={`w-64 h-64 rounded-3xl bg-gradient-to-br ${currentStation.gradient} flex items-center justify-center shadow-2xl transition-all duration-500`}>
                    <div className="text-white text-center">
                      <Icon name="Radio" size={80} />
                      <p className="text-2xl font-bold mt-4">РЕКОРД</p>
                    </div>
                  </div>

                  {/* Station Info */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">{currentStation.name}</h2>
                    <p className="text-muted-foreground">{currentStation.description}</p>
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
                  src={currentStation.stream}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </CardContent>
            </Card>

            {/* Stations List */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4 px-2">Выберите станцию</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => changeStation(station)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      currentStation.id === station.id
                        ? 'border-primary bg-primary/5 shadow-lg scale-105'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${station.gradient} flex items-center justify-center mb-2`}>
                      <Icon name="Radio" size={24} className="text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">{station.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{station.description}</p>
                  </button>
                ))}
              </div>
            </div>

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