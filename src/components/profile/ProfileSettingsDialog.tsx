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
import { useEffect, useState } from 'react';

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
  hideMentor: boolean;
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
  handleHideMentorToggle: (enabled: boolean) => void;
}

const FIN_PASS_URL = 'https://functions.poehali.dev/26ccbe26-abcf-43ed-a5b8-36f92e5efa86';

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
  hideMentor,
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
  handleContactPriceChange,
  handleHideMentorToggle
}: ProfileSettingsDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);

  const [hasFinPass, setHasFinPass] = useState(false);
  const [finPassMode, setFinPassMode] = useState<'idle' | 'set' | 'change' | 'reset'>('idle');
  const [finPassCurrent, setFinPassCurrent] = useState('');
  const [finPassNew, setFinPassNew] = useState('');
  const [finPassConfirm, setFinPassConfirm] = useState('');
  const [finPassLoading, setFinPassLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    fetch(FIN_PASS_URL, { headers: { 'X-User-Id': userId } })
      .then(r => r.json())
      .then(d => setHasFinPass(!!d.has_password))
      .catch(() => {});
  }, [settingsOpen]);

  const resetFinPassForm = () => {
    setFinPassMode('idle');
    setFinPassCurrent('');
    setFinPassNew('');
    setFinPassConfirm('');
  };

  const handleFinPassSubmit = async () => {
    if (finPassNew.length < 4) {
      toast({ title: 'Минимум 4 символа', variant: 'destructive' });
      return;
    }
    if (finPassNew !== finPassConfirm) {
      toast({ title: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    setFinPassLoading(true);

    if (finPassMode === 'change') {
      const verifyRes = await fetch(FIN_PASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
        body: JSON.stringify({ action: 'verify', password: finPassCurrent }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.valid) {
        toast({ title: 'Неверный текущий пароль', variant: 'destructive' });
        setFinPassLoading(false);
        return;
      }
    }

    const res = await fetch(FIN_PASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
      body: JSON.stringify({ action: 'set', password: finPassNew }),
    });
    const data = await res.json();
    setFinPassLoading(false);
    if (data.success) {
      setHasFinPass(true);
      toast({ title: finPassMode === 'set' ? 'Финансовый пароль установлен' : 'Пароль изменён' });
      resetFinPassForm();
    } else {
      toast({ title: data.error || 'Ошибка', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (settingsOpen && isMobile) {
      navigate('/settings');
      setSettingsOpen(false);
    }
  }, [settingsOpen, isMobile, navigate, setSettingsOpen]);

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
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" size={24} />
            Настройки
          </DialogTitle>
          <DialogDescription>
            Управляйте уведомлениями и звуками приложения
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-2">
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

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hide-mentor" className="text-base font-medium">
                Скрыть наставника
              </Label>
              <p className="text-sm text-muted-foreground">
                Не показывать информацию о вашем пригласителе другим пользователям
              </p>
            </div>
            <Switch
              id="hide-mentor"
              checked={hideMentor}
              onCheckedChange={handleHideMentorToggle}
            />
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={18} className="text-emerald-600" />
              <Label className="text-base font-medium">Финансовый пароль</Label>
              {hasFinPass && (
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Установлен</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Защищает переводы токенов. Требуется при каждой отправке.
            </p>

            {finPassMode === 'idle' && (
              <div className="flex gap-2">
                {!hasFinPass ? (
                  <Button size="sm" variant="outline" className="gap-1 border-emerald-400 text-emerald-700 hover:bg-emerald-50" onClick={() => setFinPassMode('set')}>
                    <Icon name="Plus" size={14} />
                    Установить
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setFinPassMode('change')}>
                      <Icon name="Pencil" size={14} />
                      Изменить
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50" onClick={() => setFinPassMode('reset')}>
                      <Icon name="RotateCcw" size={14} />
                      Сбросить
                    </Button>
                  </>
                )}
              </div>
            )}

            {(finPassMode === 'set' || finPassMode === 'change' || finPassMode === 'reset') && (
              <div className="space-y-3 p-4 bg-muted/40 rounded-xl border">
                <p className="text-sm font-medium">
                  {finPassMode === 'set' && 'Новый финансовый пароль'}
                  {finPassMode === 'change' && 'Изменение пароля'}
                  {finPassMode === 'reset' && 'Сброс пароля (новый пароль)'}
                </p>

                {finPassMode === 'change' && (
                  <Input
                    type="password"
                    placeholder="Текущий пароль"
                    value={finPassCurrent}
                    onChange={e => setFinPassCurrent(e.target.value)}
                    className="h-10"
                  />
                )}
                <Input
                  type="password"
                  placeholder="Новый пароль (мин. 4 символа)"
                  value={finPassNew}
                  onChange={e => setFinPassNew(e.target.value)}
                  className="h-10"
                />
                <Input
                  type="password"
                  placeholder="Повторите пароль"
                  value={finPassConfirm}
                  onChange={e => setFinPassConfirm(e.target.value)}
                  className="h-10"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleFinPassSubmit} disabled={finPassLoading} className="flex-1">
                    {finPassLoading ? <Icon name="Loader2" size={14} className="animate-spin mr-1" /> : <Icon name="Check" size={14} className="mr-1" />}
                    Сохранить
                  </Button>
                  <Button size="sm" variant="ghost" onClick={resetFinPassForm}>
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;