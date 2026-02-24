import { useState, useRef, useEffect, useCallback } from 'react';
import SosDialog from './SosDialog';

const MESSAGES_URL = 'https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d';
const LOCATION_INTERVAL_MS = 15_000;

interface SosButtonProps {
  token: string;
  onSosCreated?: (conversationId: number) => void;
  onToast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
  activeSosConversationId?: number | null;
  onSosEnded?: () => void;
}

export default function SosButton({ token, onSosCreated, onToast, activeSosConversationId, onSosEnded }: SosButtonProps) {
  const [open, setOpen] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  const sendLocation = useCallback(async (lat: number, lon: number) => {
    if (!token) return;
    try {
      await fetch(`${MESSAGES_URL}?action=sos-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
    } catch { /* ignore */ }
  }, [token]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastCoordsRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      },
      () => { /* ignore errors */ },
      { enableHighAccuracy: true, maximumAge: 10_000 }
    );

    intervalRef.current = setInterval(() => {
      const coords = lastCoordsRef.current;
      if (coords) sendLocation(coords.lat, coords.lon);
    }, LOCATION_INTERVAL_MS);
  }, [sendLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    lastCoordsRef.current = null;
  }, []);

  useEffect(() => {
    if (activeSosConversationId) {
      startTracking();
    } else {
      stopTracking();
    }
    return stopTracking;
  }, [activeSosConversationId, startTracking, stopTracking]);

  const handleSubmit = async (reason: string, latitude: number, longitude: number, radius_km: number) => {
    const res = await fetch(`${MESSAGES_URL}?action=sos-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason, latitude, longitude, radius_km }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка');

    onToast({
      title: '🆘 SOS отправлен',
      description: `Уведомлено пользователей: ${data.notifiedCount}. Местоположение отслеживается.`,
    });
    setOpen(false);
    if (onSosCreated && data.conversationId) {
      onSosCreated(data.conversationId);
    }
  };

  const isTracking = !!activeSosConversationId;

  return (
    <>
      <button
        className={`rounded-full w-10 h-10 flex items-center justify-center transition-colors border-2 ${
          isTracking
            ? 'bg-red-600 border-red-700 animate-pulse'
            : 'bg-red-50 hover:bg-red-100 border-red-400'
        }`}
        onClick={() => !isTracking && setOpen(true)}
        title={isTracking ? 'SOS активен — отслеживается местоположение' : 'SOS — Нужна помощь'}
        type="button"
      >
        <span className={`font-bold text-xs leading-none ${isTracking ? 'text-white' : 'text-red-600'}`}>
          SOS
        </span>
      </button>
      <SosDialog open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </>
  );
}