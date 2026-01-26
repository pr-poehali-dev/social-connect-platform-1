import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { logout as authLogout } from '@/utils/auth';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfileViewMode from '@/components/profile/ProfileViewMode';
import ProfileStats from '@/components/profile/ProfileStats';
import PhotoGallery from '@/components/profile/PhotoGallery';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileActions from '@/components/profile/ProfileActions';
import ProfileContact from '@/components/profile/ProfileContact';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    nickname: '',
    bio: '',
    avatar_url: '',
    gender: '',
    age_from: '',
    age_to: '',
    zodiac_sign: '',
    city: '',
    district: '',
    height: '',
    body_type: '',
    marital_status: '',
    children: '',
    financial_status: '',
    has_car: '',
    has_housing: '',
    dating_goal: '',
    interests: [] as string[],
    profession: '',
    status_text: '',
    phone: '',
    telegram: '',
    instagram: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            name: userData.name || '',
            last_name: userData.last_name || '',
            nickname: userData.nickname || '',
            bio: userData.bio || '',
            avatar_url: userData.avatar_url || '',
            gender: userData.gender || '',
            age_from: userData.age_from || '',
            age_to: userData.age_to || '',
            zodiac_sign: userData.zodiac_sign || '',
            city: userData.city || '',
            district: userData.district || '',
            height: userData.height || '',
            body_type: userData.body_type || '',
            marital_status: userData.marital_status || '',
            children: userData.children || '',
            financial_status: userData.financial_status || '',
            has_car: userData.has_car || '',
            has_housing: userData.has_housing || '',
            dating_goal: userData.dating_goal || '',
            interests: userData.interests || [],
            profession: userData.profession || '',
            status_text: userData.status_text || '',
            phone: userData.phone || '',
            telegram: userData.telegram || '',
            instagram: userData.instagram || '',
          });
        } else {
          toast({ title: 'Ошибка', description: 'Не удалось загрузить профиль', variant: 'destructive' });
          navigate('/login');
        }
      } catch (error) {
        toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
      }
    };

    loadProfile();
    loadPhotos();
  }, [navigate, toast]);

  const loadPhotos = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782?action=list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Failed to load photos', error);
    }
  };

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
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setUser({ ...user, ...formData });
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
      name: user.name,
      last_name: user.last_name,
      nickname: user.nickname,
      bio: user.bio,
      avatar_url: user.avatar_url || '',
      gender: user.gender || '',
      age_from: user.age_from || '',
      age_to: user.age_to || '',
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
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    setUser({ ...user, avatar_url: avatarUrl });
    setFormData({ ...formData, avatar_url: avatarUrl });
  };

  const availableInterests = [
    'Спорт', 'Путешествия', 'Кино', 'Музыка', 'Книги', 'Кулинария',
    'Искусство', 'Фотография', 'Танцы', 'Йога', 'Природа', 'Животные',
    'Технологии', 'Игры', 'Мода', 'Психология'
  ];

  if (!user) return null;

  const stats = [
    { icon: 'Heart', label: 'Знакомства', value: '0', color: 'from-pink-500 to-rose-500' },
    { icon: 'MessageSquare', label: 'Объявления', value: '0', color: 'from-purple-500 to-indigo-500' },
    { icon: 'Briefcase', label: 'Услуги', value: '0', color: 'from-blue-500 to-cyan-500' },
    { icon: 'Users', label: 'Рефералы', value: '0', color: 'from-emerald-500 to-teal-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-5xl mx-auto rounded-3xl border-2 shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                  <ProfileAvatar 
                    user={user}
                    editMode={editMode}
                    onAvatarUpdate={handleAvatarUpdate}
                  />
                  
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline" className="w-full gap-2 rounded-xl h-12 mt-4">
                      <Icon name="Settings" size={20} />
                      Редактировать
                    </Button>
                  ) : (
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleSaveProfile} className="flex-1 gap-2 rounded-xl h-12">
                        <Icon name="Check" size={20} />
                        Сохранить
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="gap-2 rounded-xl h-12 px-4">
                        <Icon name="X" size={20} />
                      </Button>
                    </div>
                  )}

                  <ProfileContact 
                    user={user}
                    editMode={editMode}
                    formData={formData}
                    setFormData={setFormData}
                  />
                </div>

                <div className="lg:w-2/3 space-y-6">
                  <ProfileInfo 
                    user={user}
                    editMode={editMode}
                    formData={formData}
                    setFormData={setFormData}
                  />

                  <ProfileActions />

                  {editMode ? (
                    <div className="pt-6 border-t">
                      <ProfileEditForm
                        formData={formData}
                        setFormData={setFormData}
                        availableInterests={availableInterests}
                        toggleInterest={toggleInterest}
                      />
                    </div>
                  ) : (
                    <div className="pt-6 border-t">
                      <ProfileViewMode user={user} />
                    </div>
                  )}

                  <div className="pt-6 border-t">
                    <ProfileStats stats={stats} />
                  </div>

                  <div className="pt-6 border-t">
                    <PhotoGallery 
                      photos={photos}
                      editMode={editMode}
                      onPhotosUpdate={loadPhotos}
                    />
                  </div>

                  {editMode && (
                    <div className="pt-6 border-t flex flex-col gap-3">
                      <Button 
                        onClick={() => navigate('/referral')}
                        variant="outline" 
                        className="w-full gap-2 rounded-xl h-12"
                      >
                        <Icon name="Users" size={20} />
                        Партнёрская программа
                      </Button>
                      <Button 
                        onClick={handleLogout}
                        variant="outline" 
                        className="w-full gap-2 rounded-xl h-12"
                      >
                        <Icon name="LogOut" size={20} />
                        Выйти из аккаунта
                      </Button>
                      <Button 
                        onClick={handleDeleteAccount}
                        variant="destructive" 
                        className="w-full gap-2 rounded-xl h-12"
                      >
                        <Icon name="Trash2" size={20} />
                        Удалить аккаунт
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;