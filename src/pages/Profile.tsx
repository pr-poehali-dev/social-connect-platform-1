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
import PhotoGallery from '@/components/profile/PhotoGallery';

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
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 group">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="User" size={80} className="text-muted-foreground" />
                      </div>
                    )}
                    {editMode && (
                      <>
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                          <Button
                            size="lg"
                            className="opacity-80 group-hover:opacity-100 transition-opacity duration-200 rounded-xl gap-2 bg-white text-primary hover:bg-white/90"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e: any) => {
                                const file = e.target?.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    const base64String = (reader.result as string).split(',')[1];
                                    const token = localStorage.getItem('access_token');
                                    try {
                                      const response = await fetch('https://functions.poehali.dev/99ffce65-6223-4c0e-93d7-d7d44514ef4b', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ image: base64String })
                                      });
                                      if (response.ok) {
                                        const data = await response.json();
                                        setUser({ ...user, avatar_url: data.url });
                                        setFormData({ ...formData, avatar_url: data.url });
                                        toast({ title: 'Фото обновлено', description: 'Фото профиля успешно загружено' });
                                      } else {
                                        toast({ title: 'Ошибка', description: 'Не удалось загрузить фото', variant: 'destructive' });
                                      }
                                    } catch (error) {
                                      toast({ title: 'Ошибка', description: 'Не удалось загрузить фото', variant: 'destructive' });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            <Icon name="Camera" size={24} />
                            Загрузить фото
                          </Button>
                        </div>
                        {user.avatar_url && (
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200 rounded-full w-10 h-10"
                            onClick={async () => {
                              const token = localStorage.getItem('access_token');
                              try {
                                const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ avatar_url: '' })
                                });
                                if (response.ok) {
                                  setUser({ ...user, avatar_url: '' });
                                  setFormData({ ...formData, avatar_url: '' });
                                  toast({ title: 'Фото удалено', description: 'Фото профиля успешно удалено' });
                                } else {
                                  toast({ title: 'Ошибка', description: 'Не удалось удалить фото', variant: 'destructive' });
                                }
                              } catch (error) {
                                toast({ title: 'Ошибка', description: 'Не удалось удалить фото', variant: 'destructive' });
                              }
                            }}
                          >
                            <Icon name="X" size={20} />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline" className="w-full gap-2 rounded-xl h-12">
                      <Icon name="Settings" size={20} />
                      Редактировать
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} className="flex-1 gap-2 rounded-xl h-12">
                        <Icon name="Check" size={20} />
                        Сохранить
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="gap-2 rounded-xl h-12 px-4">
                        <Icon name="X" size={20} />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="lg:w-2/3 space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {user.name || user.nickname}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Онлайн</span>
                    </div>
                    {!editMode && user.status_text && (
                      <div className="mb-3 text-muted-foreground italic">
                        {user.status_text}
                      </div>
                    )}
                    {editMode && (
                      <div className="mb-3">
                        <input
                          type="text"
                          value={formData.status_text}
                          onChange={(e) => setFormData({ ...formData, status_text: e.target.value })}
                          placeholder="Статус (например: На работе, В отпуске...)" 
                          className="w-full px-3 py-2 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          maxLength={150}
                        />
                      </div>
                    )}
                    {(user.city || user.district) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="MapPin" size={18} />
                        <span>{[user.city, user.district].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button 
                      onClick={() => navigate('/friends')}
                      variant="outline"
                      className="h-20 flex-col gap-2 rounded-2xl"
                    >
                      <Icon name="Users" size={24} />
                      <span className="text-sm font-medium">Друзья</span>
                    </Button>
                    <Button 
                      onClick={() => navigate('/my-ads')}
                      variant="outline"
                      className="h-20 flex-col gap-2 rounded-2xl"
                    >
                      <Icon name="MessageSquare" size={24} />
                      <span className="text-sm font-medium">Объявления</span>
                    </Button>
                    <Button 
                      onClick={() => navigate('/services')}
                      variant="outline"
                      className="h-20 flex-col gap-2 rounded-2xl"
                    >
                      <Icon name="Briefcase" size={24} />
                      <span className="text-sm font-medium">Услуги</span>
                    </Button>
                    <Button 
                      onClick={() => navigate('/my-events')}
                      variant="outline"
                      className="h-20 flex-col gap-2 rounded-2xl"
                    >
                      <Icon name="Calendar" size={24} />
                      <span className="text-sm font-medium">Мероприятия</span>
                    </Button>
                  </div>

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

                  <div className="pt-6 border-t flex gap-3">
                    <Button 
                      onClick={handleLogout}
                      variant="outline"
                      className="rounded-xl h-12 px-6 gap-2"
                    >
                      <Icon name="LogOut" size={20} />
                      Выйти
                    </Button>
                    <Button 
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      className="rounded-xl h-12 px-6 gap-2"
                    >
                      <Icon name="Trash2" size={20} />
                      Удалить аккаунт
                    </Button>
                  </div>
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