import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ProfileSettingsDialogProps {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  soundEnabled: boolean;
  datingVisible: boolean;
  shareLocation: boolean;
  darkMode: boolean;
  premiumOnly: boolean;
  animateAvatar: boolean;
  animationText: string;
  animationVoice: string;
  animationDriver: string;
  contactPrice: number;
  isVip?: boolean;
  handleSoundToggle: (enabled: boolean) => void;
  handleDatingVisibilityToggle: (enabled: boolean) => void;
  handleShareLocationToggle: (enabled: boolean) => void;
  handleThemeToggle: (enabled: boolean) => void;
  handlePremiumOnlyToggle: (enabled: boolean) => void;
  handleAnimateAvatarToggle: (enabled: boolean) => void;
  handleAnimationTextChange: (text: string) => void;
  handleAnimationVoiceChange: (voice: string) => void;
  handleAnimationDriverChange: (driver: string) => void;
  handleContactPriceChange: (price: number) => void;
}

const ProfileSettingsDialog = ({
  settingsOpen,
  setSettingsOpen,
  soundEnabled,
  datingVisible,
  shareLocation,
  darkMode,
  premiumOnly,
  animateAvatar,
  animationText,
  animationVoice,
  animationDriver,
  contactPrice,
  isVip = false,
  handleSoundToggle,
  handleDatingVisibilityToggle,
  handleShareLocationToggle,
  handleThemeToggle,
  handlePremiumOnlyToggle,
  handleAnimateAvatarToggle,
  handleAnimationTextChange,
  handleAnimationVoiceChange,
  handleAnimationDriverChange,
  handleContactPriceChange
}: ProfileSettingsDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePremiumFeatureClick = () => {
    toast({
      title: 'Premium функция',
      description: 'Тёмная тема доступна только для Premium пользователей',
      action: (
        <Button 
          size="sm" 
          onClick={() => {
            setSettingsOpen(false);
            navigate('/premium');
          }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
        >
          Оформить Premium
        </Button>
      ),
    });
  };

  return (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={24} />
            Настройки
          </DialogTitle>
          <DialogDescription>
            Управляйте уведомлениями и звуками приложения
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between relative">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Тёмная тема
                </Label>
                {!isVip && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                    <Icon name="Crown" size={12} className="text-white" />
                    <span className="text-xs font-semibold text-white">Premium</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Использовать тёмное оформление интерфейса
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={(checked) => {
                if (!isVip && checked) {
                  handlePremiumFeatureClick();
                  return;
                }
                handleThemeToggle(checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-notifications" className="text-base font-medium">
                Звук уведомлений
              </Label>
              <p className="text-sm text-muted-foreground">
                Проигрывать звук при получении новых сообщений
              </p>
            </div>
            <Switch
              id="sound-notifications"
              checked={soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animate-avatar" className="text-base font-medium">Оживлять фото (DEMO)</Label>
                <p className="text-sm text-muted-foreground">
                  Анимировать аватарки при наведении курсора
                </p>
              </div>
              <Switch
                id="animate-avatar"
                checked={animateAvatar}
                onCheckedChange={handleAnimateAvatarToggle}
              />
            </div>

            {animateAvatar && (
              <div className="pl-4 space-y-4 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="animation-text" className="text-sm font-medium">
                    Текст фразы
                  </Label>
                  <Input
                    id="animation-text"
                    value={animationText}
                    onChange={(e) => handleAnimationTextChange(e.target.value)}
                    placeholder="Hello! Nice to meet you!"
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Фраза, которую будет произносить аватар (минимум 3 символа)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animation-voice" className="text-sm font-medium">
                    Голос
                  </Label>
                  <select
                    id="animation-voice"
                    value={animationVoice}
                    onChange={(e) => handleAnimationVoiceChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <optgroup label="Русские голоса">
                      <option value="ru-RU-DariyaNeural">Дарья (женский, RU)</option>
                      <option value="ru-RU-DmitryNeural">Дмитрий (мужской, RU)</option>
                    </optgroup>
                    <optgroup label="Английские голоса">
                      <option value="en-US-JennyNeural">Jenny (женский, US)</option>
                      <option value="en-US-GuyNeural">Guy (мужской, US)</option>
                      <option value="en-GB-SoniaNeural">Sonia (женский, UK)</option>
                      <option value="en-GB-RyanNeural">Ryan (мужской, UK)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animation-driver" className="text-sm font-medium">
                    Стиль движения
                  </Label>
                  <select
                    id="animation-driver"
                    value={animationDriver}
                    onChange={(e) => handleAnimationDriverChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="bank://lively">Живой (естественные движения)</option>
                    <option value="bank://subtle">Спокойный (минимальные движения)</option>
                    <option value="bank://stiff">Статичный (почти без движений)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dating-visibility" className="text-base font-medium">
                Анкета в Знакомствах
              </Label>
              <p className="text-sm text-muted-foreground">
                Показывать мой профиль в разделе Знакомства
              </p>
            </div>
            <Switch
              id="dating-visibility"
              checked={datingVisible}
              onCheckedChange={handleDatingVisibilityToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="share-location" className="text-base font-medium">
                Делиться геоданными
              </Label>
              <p className="text-sm text-muted-foreground">
                Показывать расстояние до вас другим пользователям
              </p>
            </div>
            <Switch
              id="share-location"
              checked={shareLocation}
              onCheckedChange={handleShareLocationToggle}
            />
          </div>

          <div className="flex items-center justify-between relative">
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="premium-only" className="text-base font-medium">
                  Только PREMIUM могут писать
                </Label>
                {!isVip && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                    <Icon name="Crown" size={12} className="text-white" />
                    <span className="text-xs font-semibold text-white">Premium</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Принимать сообщения только от пользователей с PREMIUM статусом
              </p>
            </div>
            <Switch
              id="premium-only"
              checked={premiumOnly}
              onCheckedChange={(checked) => {
                if (!isVip && checked) {
                  handlePremiumFeatureClick();
                  return;
                }
                handlePremiumOnlyToggle(checked);
              }}
              disabled={!isVip && premiumOnly}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="contact-price" className="text-base font-medium">
                  Монетизация контактов
                </Label>
                <Icon name="Heart" size={16} className="text-pink-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Укажите, за сколько токенов LOVE вы готовы поделиться своими контактами (телефон, Telegram, Instagram). Если 0 — контакты доступны всем бесплатно.
              </p>
              <div className="flex items-center gap-3">
                <Input
                  id="contact-price"
                  type="number"
                  min="0"
                  max="10000"
                  value={contactPrice}
                  onChange={(e) => handleContactPriceChange(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm font-medium flex items-center gap-1">
                  <Icon name="Heart" size={14} className="text-pink-500" />
                  токенов LOVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;