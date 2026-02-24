import { useState } from 'react';
import SosDialog from './SosDialog';

const MESSAGES_URL = 'https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d';

interface SosButtonProps {
  token: string;
  onSosCreated?: (conversationId: number) => void;
  onToast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

export default function SosButton({ token, onSosCreated, onToast }: SosButtonProps) {
  const [open, setOpen] = useState(false);

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
      description: `Уведомлено пользователей: ${data.notifiedCount}. Чат открыт.`,
    });
    setOpen(false);
    if (onSosCreated && data.conversationId) {
      onSosCreated(data.conversationId);
    }
  };

  return (
    <>
      <button
        className="rounded-full w-10 h-10 bg-red-50 hover:bg-red-100 border-2 border-red-400 flex items-center justify-center transition-colors"
        onClick={() => setOpen(true)}
        title="SOS — Нужна помощь"
        type="button"
      >
        <span className="text-red-600 font-bold text-xs leading-none">SOS</span>
      </button>
      <SosDialog open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </>
  );
}