import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FavoriteProfile } from '@/types/favorites';

interface FavoriteProfilesTabProps {
  favoriteProfiles: FavoriteProfile[];
  onRemoveFromFavorites: (type: string, id: number) => void;
  onNavigate: (path: string) => void;
}

const FavoriteProfilesTab = ({ favoriteProfiles, onRemoveFromFavorites, onNavigate }: FavoriteProfilesTabProps) => {
  return (
    <>
      {favoriteProfiles.length === 0 ? (
        <Card className="rounded-3xl border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <Icon name="Heart" size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет избранных анкет</h3>
            <p className="text-muted-foreground text-center mb-6">
              Добавляйте понравившиеся анкеты в избранное
            </p>
            <Button onClick={() => onNavigate('/dating')} className="gap-2 rounded-xl">
              <Icon name="Heart" size={18} />
              Перейти к знакомствам
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProfiles.map((profile) => (
            <Card key={profile.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl overflow-hidden border-2">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={() => onRemoveFromFavorites('profile', profile.id)}
                >
                  <Icon name="Star" size={20} className="fill-yellow-400 text-yellow-400" />
                </Button>
              </div>
              
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{profile.name}, {profile.age}</h3>
                    {profile.is_verified && (
                      <Icon name="BadgeCheck" size={18} className="text-blue-500" />
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icon name="MapPin" size={14} />
                    {profile.city}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {(profile.interests || []).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="rounded-full">
                      {interest}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-xl gap-2"
                    onClick={() => onNavigate(`/${profile.nickname}`)}
                  >
                    <Icon name="Eye" size={18} />
                    Профиль
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl gap-2 bg-gradient-to-r from-pink-500 to-rose-500"
                    onClick={() => onNavigate(`/chat/${profile.nickname}`)}
                  >
                    <Icon name="MessageCircle" size={18} />
                    Написать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoriteProfilesTab;