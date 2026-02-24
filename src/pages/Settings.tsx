import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { OLESYA_AVATAR } from '@/components/ai-assistant/constants';
import { DIMA_AVATAR } from '@/components/dima-assistant/constants';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVip, setIsVip] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [datingVisible, setDatingVisible] = useState(true);
  const [shareLocation, setShareLocation] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [animateAvatar, setAnimateAvatar] = useState(false);
  const [animationText, setAnimationText] = useState('Hello! Nice to meet you!');
  const [animationVoice, setAnimationVoice] = useState('en-US-JennyNeural');
  const [animationDriver, setAnimationDriver] = useState('bank://lively');
  const [contactPrice, setContactPrice] = useState(0);
  const [preferredAssistant, setPreferredAssistant] = useState<'olesya' | 'dima'>('olesya');

  useEffect(() => {
    setSoundEnabled(localStorage.getItem('soundEnabled') === 'true');
    setDatingVisible(localStorage.getItem('datingVisible') !== 'false');
    setShareLocation(localStorage.getItem('shareLocation') === 'true');
    setDarkMode(localStorage.getItem('darkMode') === 'true');
    setPremiumOnly(localStorage.getItem('premiumOnly') === 'true');
    setAnimateAvatar(localStorage.getItem('animateAvatar') === 'true');
    setAnimationText(localStorage.getItem('animationText') || 'Hello! Nice to meet you!');
    setAnimationVoice(localStorage.getItem('animationVoice') || 'en-US-JennyNeural');
    setAnimationDriver(localStorage.getItem('animationDriver') || 'bank://lively');
    setContactPrice(parseInt(localStorage.getItem('contactPrice') || '0'));
    const savedAssistant = localStorage.getItem('preferredAssistant');
    if (savedAssistant === 'olesya' || savedAssistant === 'dima') {
      setPreferredAssistant(savedAssistant);
    }

    const token = localStorage.getItem('access_token');
    if (token) {
      fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          setIsVip(data.is_vip === true);
          if (!savedAssistant) {
            const gender = (data.gender || '').toLowerCase();
            setPreferredAssistant(gender === 'female' || gender === 'женский' ? 'dima' : 'olesya');
          }
        })
        .catch(() => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          setIsVip(user.is_vip === true);
        });
    }
  }, []);

  const handlePremiumFeatureClick = () => {
    toast({
      title: 'Premium функция',
      description: 'Эта функция доступна только для Premium пользователей',
      action: (
        <Button 
          size="sm" 
          onClick={() => navigate('/premium')}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
        >
          Оформить Premium
        </Button>
      ),
    });
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', String(enabled));
  };

  const handleDatingVisibilityToggle = (enabled: boolean) => {
    setDatingVisible(enabled);
    localStorage.setItem('datingVisible', String(enabled));
  };

  const handleShareLocationToggle = (enabled: boolean) => {
    setShareLocation(enabled);
    localStorage.setItem('shareLocation', String(enabled));
  };

  const handleThemeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', String(enabled));
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handlePremiumOnlyToggle = (enabled: boolean) => {
    setPremiumOnly(enabled);
    localStorage.setItem('premiumOnly', String(enabled));
  };

  const handleAnimateAvatarToggle = (enabled: boolean) => {
    setAnimateAvatar(enabled);
    localStorage.setItem('animateAvatar', String(enabled));
  };

  const handleAnimationTextChange = (text: string) => {
    setAnimationText(text);
    localStorage.setItem('animationText', text);
  };

  const handleAnimationVoiceChange = (voice: string) => {
    setAnimationVoice(voice);
    localStorage.setItem('animationVoice', voice);
  };

  const handleAnimationDriverChange = (driver: string) => {
    setAnimationDriver(driver);
    localStorage.setItem('animationDriver', driver);
  };

  const handleAssistantChange = (value: 'olesya' | 'dima') => {
    setPreferredAssistant(value);
    localStorage.setItem('preferredAssistant', value);
    window.dispatchEvent(new CustomEvent('assistant-preference-changed'));
  };

  const handleContactPriceChange = (price: number) => {
    setContactPrice(price);
    localStorage.setItem('contactPrice', String(price));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <h1 className="text-xl font-semibold">Настройки</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-20">
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
                  handlePremiumFeatureClick();
                } else {
                  handleAnimateAvatarToggle(enabled);
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
            onCheckedChange={handlePremiumOnlyToggle}
          />
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-base font-medium">ИИ-помощник</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Выберите, кто будет вашим ИИ-собеседником в нижнем меню
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAssistantChange('olesya')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                preferredAssistant === 'olesya'
                  ? 'border-pink-400 bg-pink-50 dark:bg-pink-950/20'
                  : 'border-border hover:border-pink-200'
              }`}
            >
              <img src={OLESYA_AVATAR} alt="Олеся" className="w-10 h-10 rounded-full object-cover border-2 border-pink-300" />
              <div className="text-left">
                <p className="font-medium text-sm">Олеся</p>
                <p className="text-xs text-muted-foreground">25 лет, Москва</p>
              </div>
            </button>
            <button
              onClick={() => handleAssistantChange('dima')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                preferredAssistant === 'dima'
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-border hover:border-blue-200'
              }`}
            >
              <img src={DIMA_AVATAR} alt="Дима" className="w-10 h-10 rounded-full object-cover border-2 border-blue-300" />
              <div className="text-left">
                <p className="font-medium text-sm">Дима</p>
                <p className="text-xs text-muted-foreground">35 лет, Москва</p>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="contact-price" className="text-base font-medium">
              Монетизация контактов
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Укажите, за сколько токенов LOVE вы готовы поделиться своими контактами (телефон, Telegram, Instagram). Если 0 — контакты доступны всем бесплатно.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              id="contact-price"
              type="number"
              min="0"
              value={contactPrice}
              onChange={(e) => handleContactPriceChange(parseInt(e.target.value) || 0)}
              className="flex-1"
            />
            <span className="text-sm font-medium whitespace-nowrap">токенов LOVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;