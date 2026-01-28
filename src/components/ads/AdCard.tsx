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
  'tour': 'Совместный ТУР'
};

const AdCard = ({ ad, onInvite, getTimeAgo }: AdCardProps) => {
  return (
    <Card className="p-4 rounded-2xl hover:shadow-lg transition-shadow">
      <div className="flex gap-4">
        
        {/* Аватар */}
        <div className="flex-shrink-0">
          {ad.avatar_url ? (
            <img
              src={ad.avatar_url}
              alt={ad.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
              <Icon name="User" size={32} className="text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {ad.name}, {ad.age}
                <Badge variant="secondary" className="rounded-full">
                  <Icon name={ad.gender === 'male' ? 'User' : 'Heart'} size={12} className="mr-1" />
                  {ad.gender === 'male' ? 'М' : 'Ж'}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">@{ad.nickname}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getTimeAgo(ad.created_at)}
            </span>
          </div>

          {/* События */}
          <div className="mb-3 space-y-1">
            {ad.events.map((event, idx) => (
              <div key={idx} className="text-sm">
                <Badge variant="outline" className="rounded-lg mr-2">
                  {eventTypeLabels[event.event_type] || event.event_type}
                </Badge>
                <span className="text-muted-foreground">{event.details || 'Без деталей'}</span>
              </div>
            ))}
          </div>

          {/* Город и кнопка */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Icon name="MapPin" size={14} />
              {ad.city}
            </div>
            <Button
              size="sm"
              className="rounded-xl gap-2"
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