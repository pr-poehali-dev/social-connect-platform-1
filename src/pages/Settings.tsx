import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import SettingsAppearance from '@/components/settings/SettingsAppearance';
import SettingsPrivacy from '@/components/settings/SettingsPrivacy';
import SettingsAssistantAndContacts from '@/components/settings/SettingsAssistantAndContacts';
import SettingsFinancialPassword from '@/components/settings/SettingsFinancialPassword';

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

  const updateProfilePrivacy = async (patch: { dating_visible?: boolean; share_location?: boolean; premium_only_messages?: boolean }) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDatingVisibilityToggle = (enabled: boolean) => {
    setDatingVisible(enabled);
    localStorage.setItem('datingVisible', String(enabled));
    updateProfilePrivacy({ dating_visible: enabled });
  };

  const handleShareLocationToggle = (enabled: boolean) => {
    setShareLocation(enabled);
    localStorage.setItem('shareLocation', String(enabled));
    updateProfilePrivacy({ share_location: enabled });
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
    updateProfilePrivacy({ premium_only_messages: enabled });
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
        <SettingsAppearance
          isVip={isVip}
          darkMode={darkMode}
          soundEnabled={soundEnabled}
          animateAvatar={animateAvatar}
          animationText={animationText}
          animationVoice={animationVoice}
          animationDriver={animationDriver}
          onThemeToggle={handleThemeToggle}
          onSoundToggle={handleSoundToggle}
          onAnimateAvatarToggle={handleAnimateAvatarToggle}
          onAnimationTextChange={handleAnimationTextChange}
          onAnimationVoiceChange={handleAnimationVoiceChange}
          onAnimationDriverChange={handleAnimationDriverChange}
          onPremiumFeatureClick={handlePremiumFeatureClick}
        />

        <SettingsPrivacy
          datingVisible={datingVisible}
          shareLocation={shareLocation}
          premiumOnly={premiumOnly}
          onDatingVisibilityToggle={handleDatingVisibilityToggle}
          onShareLocationToggle={handleShareLocationToggle}
          onPremiumOnlyToggle={handlePremiumOnlyToggle}
        />

        <SettingsAssistantAndContacts
          preferredAssistant={preferredAssistant}
          contactPrice={contactPrice}
          onAssistantChange={handleAssistantChange}
          onContactPriceChange={handleContactPriceChange}
        />

        <SettingsFinancialPassword />
      </div>
    </div>
  );
};

export default Settings;