import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { logout as authLogout } from '@/utils/auth';
import { ProfileFormData } from './ProfileDataProvider';

interface UseProfileActionsProps {
  user: any;
  setUser: (user: any) => void;
  formData: ProfileFormData;
  setFormData: (formData: ProfileFormData) => void;
  setEditMode: (mode: boolean) => void;
  datingVisible: boolean;
  shareLocation: boolean;
  premiumOnly: boolean;
  animateAvatar: boolean;
  animationText: string;
  animationVoice: string;
  animationDriver: string;
  contactPrice: number;
  setSoundEnabled: (enabled: boolean) => void;
  setDatingVisible: (visible: boolean) => void;
  setShareLocation: (enabled: boolean) => void;
  setPremiumOnly: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  setAnimateAvatar: (enabled: boolean) => void;
  setAnimationText: (text: string) => void;
  setAnimationVoice: (voice: string) => void;
  setAnimationDriver: (driver: string) => void;
  setContactPrice: (price: number) => void;
}

export const useProfileActions = ({
  user,
  setUser,
  formData,
  setFormData,
  setEditMode,
  datingVisible,
  shareLocation,
  premiumOnly,
  animateAvatar,
  animationText,
  animationVoice,
  animationDriver,
  contactPrice,
  setSoundEnabled,
  setDatingVisible,
  setShareLocation,
  setPremiumOnly,
  setDarkMode,
  setAnimateAvatar,
  setAnimationText,
  setAnimationVoice,
  setAnimationDriver,
  setContactPrice
}: UseProfileActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    authLogout();
    toast({ title: 'Выход выполнен', description: 'До скорой встречи!' });
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!formData.nickname.trim()) {
      toast({ title: 'Ошибка', description: 'Nickname не может быть пустым', variant: 'destructive' });
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      const preparedData = {
        ...formData,
        height: formData.height ? parseInt(formData.height as any) : null,
        dating_visible: datingVisible,
        share_location: shareLocation,
        premium_only_messages: premiumOnly
      };

      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preparedData)
      });

      if (response.ok) {
        setUser({ ...user, ...formData, dating_visible: datingVisible, share_location: shareLocation, premium_only_messages: premiumOnly });
        setEditMode(false);
        toast({ title: 'Сохранено!', description: 'Профиль успешно обновлён' });
      } else {
        const data = await response.json();
        toast({ title: 'Ошибка', description: data.error || 'Не удалось сохранить', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      nickname: user.nickname,
      bio: user.bio,
      avatar_url: user.avatar_url || '',
      gender: user.gender || '',
      birth_date: user.birth_date || '',
      zodiac_sign: user.zodiac_sign || '',
      city: user.city || '',
      district: user.district || '',
      height: user.height || '',
      body_type: user.body_type || '',
      marital_status: user.marital_status || '',
      children: user.children || '',
      financial_status: user.financial_status || '',
      has_car: user.has_car || '',
      has_housing: user.has_housing || '',
      dating_goal: user.dating_goal || '',
      interests: user.interests || [],
      profession: user.profession || '',
      status_text: user.status_text || '',
      phone: user.phone || '',
      telegram: user.telegram || '',
      instagram: user.instagram || '',
    });
    setEditMode(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!')) {
      return;
    }

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('https://functions.poehali.dev/5c514d4e-4f97-4ac0-8137-afba55fbffb0', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        authLogout();
        toast({ title: 'Аккаунт удалён', description: 'Ваш аккаунт был успешно удалён' });
        navigate('/login');
      } else {
        const data = await response.json();
        toast({ title: 'Ошибка', description: data.error || 'Не удалось удалить аккаунт', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter(i => i !== interest)
        : [...formData.interests, interest]
    });
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    setUser({ ...user, avatar_url: avatarUrl });
    setFormData({ ...formData, avatar_url: avatarUrl });
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notificationSoundEnabled', enabled.toString());
    toast({
      title: enabled ? 'Звук уведомлений включён' : 'Звук уведомлений выключен',
      description: enabled ? 'Вы будете слышать звук при новых сообщениях' : 'Звуковые уведомления отключены',
    });
  };

  const handleDatingVisibilityToggle = (enabled: boolean) => {
    setDatingVisible(enabled);
    localStorage.setItem('datingProfileVisible', enabled.toString());
    toast({
      title: enabled ? 'Анкета включена' : 'Анкета скрыта',
      description: enabled ? 'Ваш профиль участвует в выдаче Знакомств' : 'Ваш профиль скрыт из выдачи Знакомств',
    });
  };

  const handleThemeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: enabled ? 'Тёмная тема включена' : 'Светлая тема включена',
      description: enabled ? 'Интерфейс переключён на тёмное оформление' : 'Интерфейс переключён на светлое оформление',
    });
  };

  const handleShareLocationToggle = async (enabled: boolean) => {
    setShareLocation(enabled);
    localStorage.setItem('shareLocation', enabled.toString());
    
    if (enabled) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const token = localStorage.getItem('access_token');
            
            try {
              await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  ...formData,
                  share_location: true,
                  latitude,
                  longitude
                })
              });
              
              setUser({ ...user, share_location: true, latitude, longitude });
              toast({
                title: 'Геоданные включены',
                description: 'Другие пользователи теперь видят расстояние до вас',
              });
            } catch (error) {
              console.error('Failed to save location:', error);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setShareLocation(false);
            localStorage.setItem('shareLocation', 'false');
            toast({
              title: 'Ошибка',
              description: 'Не удалось получить ваше местоположение',
              variant: 'destructive'
            });
          }
        );
      } else {
        toast({
          title: 'Недоступно',
          description: 'Ваш браузер не поддерживает геолокацию',
          variant: 'destructive'
        });
        setShareLocation(false);
        localStorage.setItem('shareLocation', 'false');
      }
    } else {
      const token = localStorage.getItem('access_token');
      try {
        await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            share_location: false,
            latitude: null,
            longitude: null
          })
        });
        
        setUser({ ...user, share_location: false, latitude: null, longitude: null });
        toast({
          title: 'Геоданные отключены',
          description: 'Вы больше не делитесь своим местоположением',
        });
      } catch (error) {
        console.error('Failed to disable location:', error);
      }
    }
  };

  return {
    handleLogout,
    handleSaveProfile,
    handleCancel,
    handleDeleteAccount,
    toggleInterest,
    handleAvatarUpdate,
    handleSoundToggle,
    handleDatingVisibilityToggle,
    handleShareLocationToggle,
    handleThemeToggle,
    handlePremiumOnlyToggle: (enabled: boolean) => {
      setPremiumOnly(enabled);
      localStorage.setItem('premiumOnlyMessages', enabled.toString());
      toast({
        title: enabled ? 'Фильтр Premium включён' : 'Фильтр Premium выключен',
        description: enabled ? 'Писать вам могут только PREMIUM пользователи' : 'Писать вам могут все пользователи',
      });
    },
    handleAnimateAvatarToggle: (enabled: boolean) => {
      setAnimateAvatar(enabled);
      localStorage.setItem('animateAvatar', enabled.toString());
      toast({
        title: enabled ? 'Оживление включено' : 'Оживление выключено',
        description: enabled ? 'Фото оживают при наведении курсора' : 'Фото остаются статичными',
      });
    },
    handleAnimationTextChange: (text: string) => {
      setAnimationText(text);
      localStorage.setItem('animationText', text);
    },
    handleAnimationVoiceChange: (voice: string) => {
      setAnimationVoice(voice);
      localStorage.setItem('animationVoice', voice);
      toast({
        title: 'Голос изменён',
        description: 'Новый голос будет использоваться при анимации',
      });
    },
    handleAnimationDriverChange: (driver: string) => {
      setAnimationDriver(driver);
      localStorage.setItem('animationDriver', driver);
      toast({
        title: 'Стиль изменён',
        description: 'Новый стиль движения применён',
      });
    },
    handleContactPriceChange: async (price: number) => {
      setContactPrice(price);
      localStorage.setItem('contactPrice', price.toString());
      const token = localStorage.getItem('access_token');
      try {
        const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            contact_price: price
          })
        });
        
        if (response.ok) {
          setUser({ ...user, contact_price: price });
          toast({
            title: 'Настройка сохранена',
            description: price === 0 
              ? 'Ваши контакты доступны всем бесплатно' 
              : `Доступ к вашим контактам стоит ${price} токенов LOVE`,
          });
        } else {
          const errorData = await response.json();
          toast({
            title: 'Ошибка',
            description: errorData.error || 'Не удалось сохранить настройку',
            variant: 'destructive'
          });
        }
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось сохранить настройку',
          variant: 'destructive'
        });
      }
    }
  };
};