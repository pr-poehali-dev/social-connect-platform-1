import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';

interface BanOverlayProps {
  reason: string;
  bannedUntil: string;
  banCount: number;
}

const BanOverlay = ({ reason, bannedUntil, banCount }: BanOverlayProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(bannedUntil).getTime();
      const distance = endTime - now;

      if (distance < 0) {
        setTimeLeft('Бан истёк');
        // Автоматически перезагружаем страницу через 2 секунды после истечения бана
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [bannedUntil]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl z-10">
      <div className="absolute inset-0 flex flex-col">
        {/* Тюремная решетка */}
        <div className="absolute inset-0 flex flex-col justify-around pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-1 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 shadow-lg" />
          ))}
        </div>
        <div className="absolute inset-0 flex justify-around pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1 bg-gradient-to-b from-gray-600 via-gray-400 to-gray-600 shadow-lg" />
          ))}
        </div>
      </div>

      {/* Информация о бане */}
      <div className="relative z-20 text-center px-6 py-8 bg-black/60 rounded-2xl border-2 border-red-500 max-w-md mx-4">
        <div className="mb-4">
          <Icon name="ShieldAlert" size={64} className="text-red-500 mx-auto" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Вы забанены</h2>
        
        <div className="mb-4 text-gray-300">
          <p className="text-sm mb-1">Бан #{banCount}</p>
          <p className="text-xs text-gray-400">Это {banCount === 1 ? 'первый' : banCount === 2 ? 'второй' : banCount === 3 ? 'третий' : `${banCount}-й`} бан</p>
        </div>

        <div className="mb-4 p-4 bg-red-900/30 rounded-xl border border-red-500/50">
          <p className="text-sm text-gray-300 mb-1 font-medium">Причина бана:</p>
          <p className="text-white">{reason}</p>
        </div>

        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-600">
          <p className="text-sm text-gray-300 mb-2">Время до разбана:</p>
          <div className="text-4xl font-mono font-bold text-red-400">{timeLeft}</div>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <p>Свяжитесь с администрацией для обжалования</p>
        </div>
      </div>
    </div>
  );
};

export default BanOverlay;