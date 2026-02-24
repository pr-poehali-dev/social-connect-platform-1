import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface SosDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, latitude: number, longitude: number, radius_km: number) => Promise<void>;
}

export default function SosDialog({ open, onClose, onSubmit }: SosDialogProps) {
  const [reason, setReason] = useState('');
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState('');

  const getLocation = () => {
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setGeoError('Не удалось получить местоположение. Разрешите доступ к геолокации.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!coords) { setGeoError('Необходимо определить местоположение'); return; }
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onSubmit(reason.trim(), coords.lat, coords.lon, radius);
      setReason('');
      setCoords(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Icon name="AlertTriangle" size={22} />
            SOS — Нужна помощь
          </DialogTitle>
          <DialogDescription>
            Пользователи в указанном радиусе получат уведомление и смогут помочь.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Опишите проблему *</Label>
            <Textarea
              placeholder="Например: потерялся в лесу, нужна медицинская помощь..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Радиус оповещения: {radius} км</Label>
            <Slider
              value={[radius]}
              onValueChange={(v) => setRadius(v[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 км</span>
              <span>50 км</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Местоположение *</Label>
            {coords ? (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                <Icon name="MapPin" size={16} />
                <span>Получено: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}</span>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={getLocation}
                disabled={locating}
              >
                {locating ? (
                  <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Определяем...</>
                ) : (
                  <><Icon name="MapPin" size={16} className="mr-2" />Определить местоположение</>
                )}
              </Button>
            )}
            {geoError && <p className="text-xs text-red-500">{geoError}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSubmit}
              disabled={loading || !coords || !reason.trim()}
            >
              {loading ? (
                <><Icon name="Loader2" size={16} className="mr-2 animate-spin" />Отправляем...</>
              ) : (
                <><Icon name="AlertTriangle" size={16} className="mr-2" />Отправить SOS</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
