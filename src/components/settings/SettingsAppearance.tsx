import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface SettingsAppearanceProps {
  isVip: boolean;
  darkMode: boolean;
  soundEnabled: boolean;
  animateAvatar: boolean;
  animationText: string;
  animationVoice: string;
  animationDriver: string;
  onThemeToggle: (enabled: boolean) => void;
  onSoundToggle: (enabled: boolean) => void;
  onAnimateAvatarToggle: (enabled: boolean) => void;
  onAnimationTextChange: (text: string) => void;
  onAnimationVoiceChange: (voice: string) => void;
  onAnimationDriverChange: (driver: string) => void;
  onPremiumFeatureClick: () => void;
}

const SettingsAppearance = ({
  isVip,
  darkMode,
  soundEnabled,
  animateAvatar,
  animationText,
  animationVoice,
  animationDriver,
  onThemeToggle,
  onSoundToggle,
  onAnimateAvatarToggle,
  onAnimationTextChange,
  onAnimationVoiceChange,
  onAnimationDriverChange,
  onPremiumFeatureClick,
}: SettingsAppearanceProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
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
              onPremiumFeatureClick();
              return;
            }
            onThemeToggle(checked);
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
          onCheckedChange={onSoundToggle}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="animate-avatar" className="text-base font-medium flex items-center gap-2">
              Оживлять фото
              {!isVip && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold">
                  Premium
                </span>
              )}
            </Label>
            <p className="text-sm text-muted-foreground">
              Анимировать аватарки при наведении курсора
            </p>
          </div>
          <Switch
            id="animate-avatar"
            checked={animateAvatar}
            onCheckedChange={(enabled) => {
              if (!isVip && enabled) {
                onPremiumFeatureClick();
              } else {
                onAnimateAvatarToggle(enabled);
              }
            }}
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
                onChange={(e) => onAnimationTextChange(e.target.value)}
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
                onChange={(e) => onAnimationVoiceChange(e.target.value)}
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
                onChange={(e) => onAnimationDriverChange(e.target.value)}
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
    </>
  );
};

export default SettingsAppearance;
