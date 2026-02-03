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
  setSoundEnabled: (enabled: boolean) => void;
  setDatingVisible: (visible: boolean) => void;
}

export const useProfileActions = ({
  user,
  setUser,
  formData,
  setFormData,
  setEditMode,
  datingVisible,
  setSoundEnabled,
  setDatingVisible
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
        dating_visible: datingVisible
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
        setUser({ ...user, ...formData, dating_visible: datingVisible });
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

  return {
    handleLogout,
    handleSaveProfile,
    handleCancel,
    handleDeleteAccount,
    toggleInterest,
    handleAvatarUpdate,
    handleSoundToggle,
    handleDatingVisibilityToggle
  };
};
