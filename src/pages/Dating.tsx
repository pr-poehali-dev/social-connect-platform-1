import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Profile {
  id: number;
  name: string;
  age: number;
  photo?: string;
  isOnline: boolean;
  isVerified?: boolean;
}

const Dating = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUserData();
    loadProfiles();
  }, []);

  const loadUserData = async () => {
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

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/463fef6f-0ceb-4ca2-ae5b-ada619f3147f');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-4xl font-bold">Знакомства</h1>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Icon name="SlidersHorizontal" size={24} />
            </Button>
          </div>

          {showFilters && (
            <Card className="p-6 mb-6 rounded-3xl">
              <p className="text-muted-foreground">Фильтры в разработке</p>
            </Card>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Icon name="Loader2" size={48} className="mx-auto mb-4 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Загрузка профилей...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-[2rem] p-6 bg-gradient-to-br from-pink-100 to-purple-100 flex flex-col justify-center items-center aspect-[3/4] border-0 shadow-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-pink-300 rounded-full p-6">
                      <Icon name="ArrowUpRight" size={48} className="text-white" />
                    </div>
                  </div>
                  <p className="font-thin text-center px-0 text-xs my-0">
                    Подними свой профиль наверх в поиске и тебя будет проще найти
                  </p>
                  <Button className="w-full rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-semibold">
                    Поднять профиль
                  </Button>
                </Card>

                {profiles
                  .filter(profile => profile.id !== currentUserId)
                  .map((profile) => (
                    <div key={profile.id} className="relative">
                      <Card className="rounded-[2rem] overflow-hidden border-0 shadow-lg aspect-[3/4]">
                        {profile.photo ? (
                          <img 
                            src={profile.photo} 
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Icon name="User" size={64} className="text-gray-400" />
                          </div>
                        )}
                      </Card>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-xl drop-shadow-lg">
                            {profile.name}, {profile.age}
                          </span>
                          {profile.isOnline && (
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg" />
                          )}
                          {profile.isVerified && (
                            <Icon name="BadgeCheck" size={20} className="text-blue-400 drop-shadow-lg" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {profiles.length === 0 && (
                <Card className="max-w-md mx-auto text-center p-12 rounded-3xl">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-xl font-semibold mb-2">Пока никого нет</p>
                  <p className="text-muted-foreground">Скоро здесь появятся новые анкеты</p>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dating;