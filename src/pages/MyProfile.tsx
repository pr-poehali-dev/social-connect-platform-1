import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import PhotoGallery from '@/components/dating/PhotoGallery';

const MyProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const photos = [
    profile?.avatar_url,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
  ].filter(Boolean);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
        setFormData({
          name: userData.name || '',
          bio: userData.bio || '',
          city: userData.city || '',
          district: userData.district || '',
          height: userData.height || '',
          body_type: userData.body_type || '',
          interests: userData.interests || [],
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
        toast({ title: 'Сохранено!', description: 'Профиль успешно обновлён' });
        setEditMode(false);
        loadProfile();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      bio: profile.bio || '',
      city: profile.city || '',
      district: profile.district || '',
      height: profile.height || '',
      body_type: profile.body_type || '',
      interests: profile.interests || [],
    });
    setEditMode(false);
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev: any) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i: string) => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const availableInterests = [
    'Спорт', 'Путешествия', 'Кино', 'Музыка', 'Книги', 'Кулинария',
    'Искусство', 'Фотография', 'Танцы', 'Йога', 'Природа', 'Животные'
  ];

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="rounded-3xl border-2 shadow-2xl overflow-hidden">
            <PhotoGallery photos={photos} userId={profile?.id || 0} />

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {profile.name || profile.nickname}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Онлайн</span>
                  </div>
                  {(profile.city || profile.district) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="MapPin" size={18} />
                      <span>{[profile.city, profile.district].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                {!editMode ? (
                  <Button 
                    onClick={() => setEditMode(true)}
                    variant="outline"
                    className="rounded-xl h-12 px-6 font-semibold"
                  >
                    <Icon name="Settings" size={20} className="mr-2" />
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave}
                      className="rounded-xl h-12 px-6 font-semibold"
                    >
                      <Icon name="Check" size={20} className="mr-2" />
                      Сохранить
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      className="rounded-xl h-12 px-6 font-semibold"
                    >
                      <Icon name="X" size={20} />
                    </Button>
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
                  onClick={() => navigate('/ads')}
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
                  onClick={() => navigate('/events')}
                  variant="outline"
                  className="h-20 flex-col gap-2 rounded-2xl"
                >
                  <Icon name="Calendar" size={24} />
                  <span className="text-sm font-medium">Мероприятия</span>
                </Button>
              </div>

              {editMode ? (
                <div className="space-y-6 pt-4 border-t">
                  <div>
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ваше имя"
                      className="rounded-xl h-12 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">О себе</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Расскажите о себе"
                      rows={4}
                      className="rounded-xl mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Город</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Ваш город"
                        className="rounded-xl h-12 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="district">Район</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Район города"
                        className="rounded-xl h-12 mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Рост (см)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        placeholder="170"
                        className="rounded-xl h-12 mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="body_type">Телосложение</Label>
                      <select
                        id="body_type"
                        value={formData.body_type}
                        onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                        className="w-full rounded-xl h-12 mt-2 border px-3"
                      >
                        <option value="">Не указано</option>
                        <option value="slim">Худощавое</option>
                        <option value="athletic">Спортивное</option>
                        <option value="average">Среднее</option>
                        <option value="full">Полное</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Интересы</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {availableInterests.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            formData.interests.includes(interest)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-4 border-t">
                  {profile.bio && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">О себе</h3>
                      <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                    </div>
                  )}

                  {profile.height && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Параметры</h3>
                      <div className="flex gap-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Icon name="Ruler" size={18} />
                          <span>{profile.height} см</span>
                        </div>
                        {profile.body_type && (
                          <div className="flex items-center gap-2">
                            <Icon name="User" size={18} />
                            <span>
                              {profile.body_type === 'slim' && 'Худощавое'}
                              {profile.body_type === 'athletic' && 'Спортивное'}
                              {profile.body_type === 'average' && 'Среднее'}
                              {profile.body_type === 'full' && 'Полное'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {profile.interests?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Интересы</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest: string) => (
                          <span
                            key={interest}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;