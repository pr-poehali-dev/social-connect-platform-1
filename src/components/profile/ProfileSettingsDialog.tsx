import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ProfileSettingsDialogProps {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  soundEnabled: boolean;
  datingVisible: boolean;
  shareLocation: boolean;
  darkMode: boolean;
  handleSoundToggle: (enabled: boolean) => void;
  handleDatingVisibilityToggle: (enabled: boolean) => void;
  handleShareLocationToggle: (enabled: boolean) => void;
  handleThemeToggle: (enabled: boolean) => void;
}

const ProfileSettingsDialog = ({
  settingsOpen,
  setSettingsOpen,
  soundEnabled,
  datingVisible,
  shareLocation,
  darkMode,
  handleSoundToggle,
  handleDatingVisibilityToggle,
  handleShareLocationToggle,
  handleThemeToggle
}: ProfileSettingsDialogProps) => {
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode" className="text-base font-medium">
                Тёмная тема
              </Label>
              <p className="text-sm text-muted-foreground">
                Использовать тёмное оформление интерфейса
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={handleThemeToggle}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;