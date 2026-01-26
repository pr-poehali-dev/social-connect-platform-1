import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';

interface RadioStation {
  id: string;
  name: string;
  description: string;
  stream: string;
  gradient: string;
}

interface RadioContextType {
  isPlaying: boolean;
  currentStation: RadioStation | null;
  volume: number;
  togglePlay: () => void;
  setStation: (station: RadioStation) => void;
  setVolume: (volume: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

const defaultStation: RadioStation = {
  id: 'main',
  name: 'Record',
  description: 'Танцевальная музыка 24/7',
  stream: 'https://radiorecord.hostingradio.ru/rr_main96.aacp',
  gradient: 'from-purple-500 via-pink-500 to-red-500'
};

export const RadioProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation>(defaultStation);
  const [volume, setVolumeState] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const savedVolume = localStorage.getItem('radio_volume');
    if (savedVolume) {
      setVolumeState(Number(savedVolume));
    }
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Play error:', err);
      });
    }
  };

  const setStation = (station: RadioStation) => {
    const wasPlaying = isPlaying;
    
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setCurrentStation(station);
    
    if (wasPlaying && audioRef.current) {
      setTimeout(() => {
        audioRef.current?.play().catch(err => {
          console.error('Play error:', err);
        });
      }, 100);
    }
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    localStorage.setItem('radio_volume', vol.toString());
  };

  return (
    <RadioContext.Provider
      value={{
        isPlaying,
        currentStation,
        volume,
        togglePlay,
        setStation,
        setVolume,
        audioRef
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={currentStation.stream}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio must be used within RadioProvider');
  }
  return context;
};
