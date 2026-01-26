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
  { id: 'main', name: 'Record', description: 'Танцевальная музыка 24/7', stream: 'https://radiorecord.hostingradio.ru/rr_main96.aacp', gradient: 'from-purple-500 via-pink-500 to-red-500' },
  { id: 'club', name: 'Club', description: 'Клубная музыка', stream: 'https://radiorecord.hostingradio.ru/club96.aacp', gradient: 'from-blue-500 via-purple-500 to-pink-500' },
  { id: 'dance', name: 'Dance', description: 'Dance хиты', stream: 'https://radiorecord.hostingradio.ru/dance96.aacp', gradient: 'from-cyan-500 via-blue-500 to-indigo-500' },
  { id: 'sd90', name: 'Superdискотека 90-х', description: 'Легендарные хиты 90-х', stream: 'https://radiorecord.hostingradio.ru/sd9096.aacp', gradient: 'from-orange-500 via-red-500 to-pink-500' },
  { id: 'vip', name: 'VIP Mix', description: 'Премиум миксы', stream: 'https://radiorecord.hostingradio.ru/vip96.aacp', gradient: 'from-yellow-500 via-orange-500 to-red-500' },
  { id: 'pump', name: 'Pump', description: 'Энергичная музыка', stream: 'https://radiorecord.hostingradio.ru/pump96.aacp', gradient: 'from-green-500 via-emerald-500 to-teal-500' },
  { id: 'trancemission', name: 'Trancemission', description: 'Trance музыка', stream: 'https://radiorecord.hostingradio.ru/tm96.aacp', gradient: 'from-indigo-500 via-purple-500 to-pink-500' },
  { id: 'goa', name: 'GOA', description: 'Goa Trance', stream: 'https://radiorecord.hostingradio.ru/goa96.aacp', gradient: 'from-yellow-500 via-lime-500 to-green-500' },
  { id: 'psytrance', name: 'Psytrance', description: 'Психоделический транс', stream: 'https://radiorecord.hostingradio.ru/ps96.aacp', gradient: 'from-fuchsia-500 via-purple-500 to-violet-500' },
  { id: 'techno', name: 'Techno', description: 'Техно музыка', stream: 'https://radiorecord.hostingradio.ru/techno96.aacp', gradient: 'from-gray-500 via-slate-500 to-zinc-500' },
  { id: 'techouse', name: 'Tech House', description: 'Tech House', stream: 'https://radiorecord.hostingradio.ru/techouse96.aacp', gradient: 'from-rose-500 via-pink-500 to-fuchsia-500' },
  { id: 'deep', name: 'Deep', description: 'Deep House', stream: 'https://radiorecord.hostingradio.ru/deep96.aacp', gradient: 'from-blue-600 via-indigo-600 to-purple-600' },
  { id: 'progressive', name: 'Progressive', description: 'Progressive House', stream: 'https://radiorecord.hostingradio.ru/progr96.aacp', gradient: 'from-cyan-500 via-teal-500 to-emerald-500' },
  { id: 'dubstep', name: 'Dubstep', description: 'Dubstep & Bass', stream: 'https://radiorecord.hostingradio.ru/dub96.aacp', gradient: 'from-lime-500 via-green-500 to-emerald-500' },
  { id: 'drumandbase', name: 'Drum & Bass', description: 'DnB музыка', stream: 'https://radiorecord.hostingradio.ru/drumanbass96.aacp', gradient: 'from-red-500 via-orange-500 to-amber-500' },
  { id: 'phonk', name: 'Phonk', description: 'Phonk & Drift', stream: 'https://radiorecord.hostingradio.ru/phonk96.aacp', gradient: 'from-slate-700 via-gray-700 to-zinc-700' },
  { id: 'hardstyle', name: 'Hardstyle', description: 'Жесткий стиль', stream: 'https://radiorecord.hostingradio.ru/hardstyle96.aacp', gradient: 'from-red-600 via-rose-600 to-pink-600' },
  { id: 'pirate', name: 'Pirate Station', description: 'Пиратская станция', stream: 'https://radiorecord.hostingradio.ru/pirate96.aacp', gradient: 'from-black via-gray-800 to-slate-800' },
  { id: 'russian', name: 'Russian Mix', description: 'Русский микс', stream: 'https://radiorecord.hostingradio.ru/rus96.aacp', gradient: 'from-blue-500 via-white to-red-500' },
  { id: 'russianhits', name: 'Russian Hits', description: 'Русские хиты', stream: 'https://radiorecord.hostingradio.ru/russianhits96.aacp', gradient: 'from-red-500 via-pink-500 to-rose-500' },
  { id: 'brks', name: 'Breaks', description: 'Breakbeat', stream: 'https://radiorecord.hostingradio.ru/brks96.aacp', gradient: 'from-orange-500 via-amber-500 to-yellow-500' },
  { id: 'chillout', name: 'Chillout', description: 'Расслабляющая музыка', stream: 'https://radiorecord.hostingradio.ru/chil96.aacp', gradient: 'from-sky-400 via-blue-400 to-indigo-400' },
  { id: 'ambient', name: 'Ambient', description: 'Эмбиент', stream: 'https://radiorecord.hostingradio.ru/ambient96.aacp', gradient: 'from-violet-400 via-purple-400 to-fuchsia-400' },
  { id: 'lofi', name: 'Lo-Fi', description: 'Lo-Fi Hip-Hop', stream: 'https://radiorecord.hostingradio.ru/lofi96.aacp', gradient: 'from-pink-400 via-rose-400 to-red-400' },
  { id: 'chillhouse', name: 'Chill House', description: 'Спокойный хаус', stream: 'https://radiorecord.hostingradio.ru/chillhouse96.aacp', gradient: 'from-teal-400 via-cyan-400 to-sky-400' },
  { id: 'dreampop', name: 'Dream Pop', description: 'Мечтательный поп', stream: 'https://radiorecord.hostingradio.ru/dreampop96.aacp', gradient: 'from-purple-300 via-pink-300 to-rose-300' },
  { id: 'organic', name: 'Organic', description: 'Органическая музыка', stream: 'https://radiorecord.hostingradio.ru/organic96.aacp', gradient: 'from-green-400 via-emerald-400 to-teal-400' },
  { id: 'ibiza', name: 'Ibiza', description: 'Музыка Ибицы', stream: 'https://radiorecord.hostingradio.ru/ibiza96.aacp', gradient: 'from-yellow-400 via-orange-400 to-red-400' },
  { id: 'future', name: 'Future House', description: 'Future House', stream: 'https://radiorecord.hostingradio.ru/fut96.aacp', gradient: 'from-cyan-600 via-blue-600 to-indigo-600' },
  { id: 'bass', name: 'Bass House', description: 'Bass House', stream: 'https://radiorecord.hostingradio.ru/jackin96.aacp', gradient: 'from-lime-600 via-green-600 to-emerald-600' },
  { id: 'edm', name: 'EDM', description: 'Electronic Dance Music', stream: 'https://radiorecord.hostingradio.ru/edmhits96.aacp', gradient: 'from-fuchsia-600 via-pink-600 to-rose-600' },
  { id: 'trap', name: 'Trap', description: 'Trap музыка', stream: 'https://radiorecord.hostingradio.ru/trap96.aacp', gradient: 'from-purple-700 via-violet-700 to-fuchsia-700' },
  { id: 'hyperpop', name: 'Hyperpop', description: 'Гиперпоп', stream: 'https://radiorecord.hostingradio.ru/hyperpop96.aacp', gradient: 'from-pink-500 via-fuchsia-500 to-purple-500' },
  { id: 'rock', name: 'Rock', description: 'Рок музыка', stream: 'https://radiorecord.hostingradio.ru/rock96.aacp', gradient: 'from-stone-600 via-neutral-600 to-gray-600' },
  { id: 'rap', name: 'Rap', description: 'Хип-хоп и рэп', stream: 'https://radiorecord.hostingradio.ru/rr_rap96.aacp', gradient: 'from-zinc-700 via-neutral-700 to-stone-700' },
  { id: 'vocalhouse', name: 'Vocal House', description: 'Вокальный хаус', stream: 'https://radiorecord.hostingradio.ru/vocalhouse96.aacp', gradient: 'from-amber-500 via-yellow-500 to-lime-500' },
  { id: 'bigroom', name: 'Big Room', description: 'Big Room House', stream: 'https://radiorecord.hostingradio.ru/big96.aacp', gradient: 'from-orange-600 via-red-600 to-pink-600' },
  { id: 'megamix', name: 'Megamix', description: 'Мегамикс', stream: 'https://radiorecord.hostingradio.ru/mmix96.aacp', gradient: 'from-violet-500 via-purple-500 to-indigo-500' },
  { id: 'jackin', name: 'Jackin House', description: 'Jackin House', stream: 'https://radiorecord.hostingradio.ru/jackin96.aacp', gradient: 'from-sky-600 via-blue-600 to-indigo-600' },
  { id: 'neurofunk', name: 'Neurofunk', description: 'Neurofunk DnB', stream: 'https://radiorecord.hostingradio.ru/neurofunk96.aacp', gradient: 'from-emerald-700 via-teal-700 to-cyan-700' }
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