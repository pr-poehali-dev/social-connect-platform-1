import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) return null;

  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300',
        showNotification ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-full shadow-lg backdrop-blur-xl',
          isOnline
            ? 'bg-green-500/90 text-white'
            : 'bg-orange-500/90 text-white'
        )}
      >
        <Icon
          name={isOnline ? 'Wifi' : 'WifiOff'}
          size={20}
          className="flex-shrink-0"
        />
        <span className="text-sm font-medium">
          {isOnline ? 'Подключение восстановлено' : 'Работаем без интернета'}
        </span>
      </div>
    </div>
  );
};
