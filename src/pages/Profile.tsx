import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { logout as authLogout } from '@/utils/auth';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProfileViewMode from '@/components/profile/ProfileViewMode';
import ProfileStats from '@/components/profile/ProfileStats';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    avatar_url: '',
    gender: '',
    age_from: '',
    age_to: '',
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
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const defaultUser = {
      id: 1,
      name: 'Пользователь',
      email: 'user@example.com',
      nickname: 'user' + Math.floor(Math.random() * 10000),
      bio: 'Привет! Я новый пользователь ConnectHub 👋',
      avatar_url: null,
      joinedDate: new Date().toLocaleDateString('ru-RU'),
      gender: '',
      age_from: '',
      age_to: '',
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
      interests: [],
      profession: '',
    };
    
    setUser(defaultUser);
    setFormData({
      nickname: defaultUser.nickname,
      bio: defaultUser.bio,
      avatar_url: defaultUser.avatar_url || '',
      gender: defaultUser.gender || '',
      age_from: defaultUser.age_from || '',
      age_to: defaultUser.age_to || '',
      city: defaultUser.city || '',
      district: defaultUser.district || '',
      height: defaultUser.height || '',
      body_type: defaultUser.body_type || '',
      marital_status: defaultUser.marital_status || '',
      children: defaultUser.children || '',
      financial_status: defaultUser.financial_status || '',
      has_car: defaultUser.has_car || '',
      has_housing: defaultUser.has_housing || '',
      dating_goal: defaultUser.dating_goal || '',
      interests: defaultUser.interests || [],
      profession: defaultUser.profession || '',
    });
  }, [navigate]);

  const handleLogout = () => {
    authLogout();
    toast({ title: 'Выход выполнен', description: 'До скорой встречи!' });
    navigate('/login');
  };

  const handleSaveProfile = () => {
    if (!formData.nickname.trim()) {
      toast({ title: 'Ошибка', description: 'Nickname не может быть пустым', variant: 'destructive' });
      return;
    }
    setUser({ ...user, ...formData });
    setEditMode(false);
    toast({ title: 'Сохранено!', description: 'Профиль успешно обновлён' });
  };

  const handleCancel = () => {
    setFormData({
      nickname: user.nickname,
      bio: user.bio,
      avatar_url: user.avatar_url || '',
      gender: user.gender || '',
      age_from: user.age_from || '',
      age_to: user.age_to || '',
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
    });
    setEditMode(false);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
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
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto rounded-3xl border-2 shadow-2xl">
            <ProfileHeader user={user} editMode={editMode} onLogout={handleLogout} />

            <CardContent className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Настройки профиля</h3>
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline" size="sm" className="gap-2 rounded-xl">
                      <Icon name="Edit" size={16} />
                      Редактировать
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} size="sm" className="gap-2 rounded-xl">
                        <Icon name="Check" size={16} />
                        Сохранить
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2 rounded-xl">
                        <Icon name="X" size={16} />
                        Отмена
                      </Button>
                    </div>
                  )}
                </div>

                {editMode ? (
                  <ProfileEditForm
                    formData={formData}
                    setFormData={setFormData}
                    availableInterests={availableInterests}
                    toggleInterest={toggleInterest}
                  />
                ) : (
                  <ProfileViewMode user={user} />
                )}
              </div>

              <ProfileStats stats={stats} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
