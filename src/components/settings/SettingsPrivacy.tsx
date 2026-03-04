import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsPrivacyProps {
  datingVisible: boolean;
  shareLocation: boolean;
  premiumOnly: boolean;
  onDatingVisibilityToggle: (enabled: boolean) => void;
  onShareLocationToggle: (enabled: boolean) => void;
  onPremiumOnlyToggle: (enabled: boolean) => void;
}

const SettingsPrivacy = ({
  datingVisible,
  shareLocation,
  premiumOnly,
  onDatingVisibilityToggle,
  onShareLocationToggle,
  onPremiumOnlyToggle,
}: SettingsPrivacyProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="dating-visible" className="text-base font-medium">
            Анкета в Знакомствах
          </Label>
          <p className="text-sm text-muted-foreground">
            Показывать мой профиль в разделе Знакомства
          </p>
        </div>
        <Switch
          id="dating-visible"
          checked={datingVisible}
          onCheckedChange={onDatingVisibilityToggle}
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
          onCheckedChange={onShareLocationToggle}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="premium-only" className="text-base font-medium">
            Только PREMIUM могут писать
          </Label>
          <p className="text-sm text-muted-foreground">
            Принимать сообщения только от пользователей с PREMIUM статусом
          </p>
        </div>
        <Switch
          id="premium-only"
          checked={premiumOnly}
          onCheckedChange={onPremiumOnlyToggle}
        />
      </div>
    </>
  );
};

export default SettingsPrivacy;
