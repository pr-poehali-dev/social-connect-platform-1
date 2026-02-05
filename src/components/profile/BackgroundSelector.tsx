import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { PREMIUM_BACKGROUNDS, PremiumBackgroundKey } from '@/utils/premiumBackgrounds';

interface BackgroundSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground?: string;
  isVip: boolean;
  onBackgroundChange: (background: string) => void;
}

const BackgroundSelector = ({ 
  isOpen, 
  onClose, 
  currentBackground = 'gradient-purple',
  isVip,
  onBackgroundChange 
}: BackgroundSelectorProps) => {
  const { toast } = useToast();
  const [selectedBg, setSelectedBg] = useState(currentBackground);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!isVip) {
      toast({
        title: 'Premium функция',
        description: 'Смена фона доступна только для Premium-пользователей',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profile_background: selectedBg })
      });

      if (response.ok) {
        onBackgroundChange(selectedBg);
        toast({
          title: 'Фон обновлён',
          description: 'Фон вашего профиля успешно изменён'
        });
        onClose();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить фон профиля',
        variant: 'destructive'
      });
    }
  };

  const handleCustomUpload = () => {
    toast({
      title: 'Скоро',
      description: 'Загрузка своего изображения появится в следующем обновлении',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Sparkles" size={24} className="text-yellow-500" />
            Выбор фона профиля
          </DialogTitle>
          <DialogDescription>
            {isVip 
              ? 'Выберите красивый фон для вашей Premium-анкеты' 
              : 'Эта функция доступна только для Premium-пользователей'}
          </DialogDescription>
        </DialogHeader>

        {!isVip && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <Icon name="Crown" size={16} className="text-yellow-600" />
              Активируйте Premium для доступа к красивым фонам анкеты
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(PREMIUM_BACKGROUNDS).map(([key, bg]) => (
            <Card
              key={key}
              className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg ${
                selectedBg === key ? 'ring-2 ring-primary' : ''
              } ${!isVip ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => isVip && setSelectedBg(key)}
            >
              <div 
                className="h-32 relative"
                style={{ background: bg.preview }}
              >
                {selectedBg === key && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Icon name="Check" size={32} className="text-white" />
                  </div>
                )}
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-medium">{bg.name}</p>
              </div>
            </Card>
          ))}

          <Card
            className={`cursor-pointer overflow-hidden transition-all hover:shadow-lg border-2 border-dashed ${!isVip ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={handleCustomUpload}
          >
            <div className="h-32 bg-muted flex items-center justify-center">
              <div className="text-center">
                <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Скоро</p>
              </div>
            </div>
            <div className="p-3 text-center">
              <p className="text-sm font-medium">Своё фото</p>
            </div>
          </Card>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!isVip}>
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundSelector;
