import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Ad {
  id: number;
  user_id: number;
  action: string;
  schedule: string;
  name: string;
  nickname: string;
  avatar_url: string;
  gender: string;
  city: string;
  age: number;
  created_at: string;
  events: { event_type: string; details: string }[];
}

interface AdCardProps {
  ad: Ad;
  onInvite: (ad: Ad) => void;
  getTimeAgo: (date: string) => string;
}

const eventTypeLabels: { [key: string]: string } = {
  'date': 'Свидание',
  'dinner': 'Ужин',
  'concert': 'Концерт',
  'party': 'Вечеринка',
  'cinema': 'Кино',
  'tour': 'Совместный ТУР'
};

const AdCard = ({ ad, onInvite, getTimeAgo }: AdCardProps) => {
  return (
    <Card className="p-3 sm:p-4 rounded-2xl hover:shadow-lg transition-shadow">
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
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold">
                  {ad.name}, {ad.age}
                </h3>
                <Badge variant="secondary" className="rounded-full text-xs">
                  <Icon name={ad.gender === 'male' ? 'User' : 'Heart'} size={10} className="mr-0.5" />
                  {ad.gender === 'male' ? 'М' : 'Ж'}
                </Badge>
              </div>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {getTimeAgo(ad.created_at)}
            </span>
          </div>

          {/* События */}
          <div className="mb-2 space-y-1">
            {ad.events.map((event, idx) => (
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
            <Button
              size="sm"
              className="rounded-xl gap-1.5 text-xs sm:text-sm h-8 px-3"
              onClick={() => onInvite(ad)}
            >
              <Icon name="MessageCircle" size={14} />
              Написать
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdCard;