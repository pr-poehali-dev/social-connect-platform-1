import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FavoriteAd } from '@/types/favorites';

interface FavoriteAdsTabProps {
  favoriteAds: any[];
  onRemoveFromFavorites: (type: string, id: number) => void;
  onNavigate: (path: string) => void;
  onInvite?: (ad: any) => void;
}

const eventTypeLabels: { [key: string]: string } = {
  'date': 'Свидание',
  'dinner': 'Ужин',
  'concert': 'Концерт',
  'party': 'Вечеринка',
  'cinema': 'Кино',
  'tour': 'Совместный ТУР'
};

const FavoriteAdsTab = ({ favoriteAds, onRemoveFromFavorites, onNavigate, onInvite }: FavoriteAdsTabProps) => {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const isBirthday = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    return today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
  };

  return (
    <>
      {favoriteAds.length === 0 ? (
        <Card className="rounded-3xl border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <Icon name="Radio" size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет избранных объявлений</h3>
            <p className="text-muted-foreground text-center mb-6">
              Сохраняйте интересные объявления
            </p>
            <Button onClick={() => onNavigate('/ads')} className="gap-2 rounded-xl">
              <Icon name="Radio" size={18} />
              Посмотреть объявления
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favoriteAds.map((ad) => {
            const showBirthdayIcon = ad.birth_date && isBirthday(ad.birth_date);
            
            return (
              <Card key={ad.id} className="p-3 sm:p-4 rounded-2xl hover:shadow-lg transition-shadow relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                  onClick={() => onRemoveFromFavorites('ad', ad.id)}
                >
                  <Icon 
                    name="Star" 
                    size={18} 
                    className="fill-yellow-400 text-yellow-400" 
                  />
                </Button>

                <div className="flex gap-3">
                  {/* Аватар */}
                  <div className="flex-shrink-0">
                    {ad.avatar_url ? (
                      <img
                        src={ad.avatar_url}
                        alt={ad.name}
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                        <Icon name="User" size={24} className="sm:w-8 sm:h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5">
                      <h3 className="text-base sm:text-lg font-bold flex items-center gap-1.5">
                        {ad.name}, {ad.age}
                        {showBirthdayIcon && (
                          <Icon name="Cake" size={16} className="text-yellow-500 animate-pulse" />
                        )}
                      </h3>
                    </div>

                    {/* События */}
                    <div className="mb-2 space-y-1">
                      {(ad.events || []).map((event: any, idx: number) => (
                        <div key={idx} className="text-xs sm:text-sm">
                          <Badge variant="outline" className="rounded-lg mr-1.5 text-xs">
                            {eventTypeLabels[event.event_type] || event.event_type}
                          </Badge>
                          <span className="text-muted-foreground break-words">{event.details || 'Без деталей'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Город и кнопка */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Icon name="MapPin" size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span className="truncate">{ad.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {getTimeAgo(ad.created_at)}
                        </span>
                        <Button
                          size="sm"
                          className="rounded-xl gap-1.5 text-xs sm:text-sm h-8 px-3"
                          onClick={() => onInvite && onInvite(ad)}
                        >
                          <Icon name="MessageCircle" size={14} />
                          Написать
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

export default FavoriteAdsTab;
