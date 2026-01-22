import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const DatingProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const photos = [
    profile?.image,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800'
  ].filter(Boolean);

  useEffect(() => {
    loadProfile();
    loadCurrentUser();
  }, [userId]);

  const loadCurrentUser = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    }
  };

  const loadProfile = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/0e71c64b-8a34-4a49-8a35-e5e1c5e0da20?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить профиль',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = () => {
    setRequestSent(true);
    toast({
      title: 'Заявка отправлена',
      description: 'Ожидайте подтверждения'
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное'
    });
  };

  const handleSendMessage = () => {
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-2xl mx-auto p-6">
          <Card className="p-12 text-center rounded-3xl">
            <Icon name="UserX" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Профиль не найден</h2>
            <Button onClick={() => navigate('/dating')} className="mt-4">
              Вернуться к поиску
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === profile.id;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="h-80 bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
            {profile.image ? (
              <img 
                src={profile.image} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="User" size={96} className="text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={() => navigate(-1)}
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>

          {!isOwnProfile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={handleToggleFavorite}
            >
              <Icon name={isFavorite ? "Heart" : "Heart"} size={24} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
            </Button>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <span className="text-2xl text-muted-foreground">{profile.age}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span>
                  {profile.isOnline ? 'Онлайн' : profile.lastSeen ? `Был(а) в сети ${profile.lastSeen}` : 'Был(а) в сети давно'}
                </span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex gap-3">
              <Button 
                onClick={handleSendMessage}
                className="flex-1 rounded-xl h-12 text-base font-semibold"
              >
                <Icon name="MessageCircle" size={20} className="mr-2" />
                Написать
              </Button>
              {!isFriend && !requestSent ? (
                <Button 
                  onClick={handleAddFriend}
                  variant="outline"
                  className="flex-1 rounded-xl h-12 text-base font-semibold"
                >
                  <Icon name="UserPlus" size={20} className="mr-2" />
                  Добавить в друзья
                </Button>
              ) : requestSent ? (
                <Button 
                  variant="outline"
                  disabled
                  className="flex-1 rounded-xl h-12 text-base"
                >
                  <Icon name="Clock" size={20} className="mr-2" />
                  Заявка отправлена
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="flex-1 rounded-xl h-12 text-base font-semibold"
                >
                  <Icon name="UserCheck" size={20} className="mr-2" />
                  В друзьях
                </Button>
              )}
            </div>
          )}

          {isOwnProfile && (
            <Button 
              onClick={() => navigate('/profile')}
              variant="outline"
              className="w-full rounded-xl h-12 text-base font-semibold"
            >
              <Icon name="Settings" size={20} className="mr-2" />
              Редактировать профиль
            </Button>
          )}

          <Card className="p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="Info" size={20} />
              Информация
            </h2>
            
            <div className="space-y-3">
              {profile.city && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="MapPin" size={18} />
                  <span>{profile.city}{profile.district ? `, ${profile.district}` : ''}</span>
                </div>
              )}

              {profile.gender && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="Users" size={18} />
                  <span>{profile.gender === 'male' ? 'Мужчина' : profile.gender === 'female' ? 'Женщина' : 'Не указан'}</span>
                </div>
              )}

              {profile.height && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="Ruler" size={18} />
                  <span>Рост: {profile.height} см</span>
                </div>
              )}

              {profile.weight && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="Activity" size={18} />
                  <span>Вес: {profile.weight} кг</span>
                </div>
              )}

              {profile.physique && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon name="User" size={18} />
                  <span>Телосложение: {profile.physique}</span>
                </div>
              )}
            </div>
          </Card>

          {profile.about && (
            <Card className="p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="FileText" size={20} />
                О себе
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile.about}
              </p>
            </Card>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <Card className="p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="Heart" size={20} />
                Интересы
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Images" size={20} />
              Фотографии
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {photos.length}
              </span>
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo}
                    alt={`Фото ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            onClick={() => setSelectedPhoto(null)}
          >
            <Icon name="X" size={24} />
          </Button>
          
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Полное фото"
              className="w-full h-full object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    photo === selectedPhoto ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatingProfile;