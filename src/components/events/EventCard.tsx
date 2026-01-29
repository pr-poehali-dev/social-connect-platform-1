import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  address?: string;
  category: string;
  price: number;
  participants: number;
  maxParticipants: number;
  image: string;
  paymentUrl?: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface EventCardProps {
  event: Event;
  activeTab: 'my' | 'participating' | 'completed';
  onEdit: (eventId: number) => void;
  onDelete: (eventId: number) => void;
  onCancelParticipation: (eventId: number) => void;
  formatDate: (dateString: string) => string;
}

const EventCard = ({ event, activeTab, onEdit, onDelete, onCancelParticipation, formatDate }: EventCardProps) => {
  return (
    <Card className="rounded-3xl border-2 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {event.status === 'active' && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 rounded-full">Активно</Badge>
          </div>
        )}
        {event.status === 'completed' && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gray-500 rounded-full">Завершено</Badge>
          </div>
        )}
        {event.price === 0 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/90 text-primary rounded-full">Бесплатно</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="Calendar" size={16} className="text-primary" />
            <span>{formatDate(event.date)} в {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icon name="MapPin" size={16} className="text-primary" />
            <span className="line-clamp-1">{event.location}, {event.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icon name="Users" size={16} className="text-primary" />
            <span>{event.participants} / {event.maxParticipants} участников</span>
          </div>
          {event.price > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Wallet" size={16} className="text-primary" />
              <span className="font-semibold">{event.price} ₽</span>
            </div>
          )}
        </div>

        {activeTab === 'my' ? (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 rounded-xl gap-2"
              onClick={() => onEdit(event.id)}
            >
              <Icon name="Edit" size={16} />
              Изменить
            </Button>
            <Button 
              variant="outline"
              className="rounded-xl"
              onClick={() => onDelete(event.id)}
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        ) : activeTab === 'participating' ? (
          <Button 
            variant="outline"
            className="w-full rounded-xl gap-2"
            onClick={() => onCancelParticipation(event.id)}
          >
            <Icon name="X" size={16} />
            Отменить участие
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 rounded-xl gap-2"
              onClick={() => window.location.href = `/events/${event.id}`}
            >
              <Icon name="Eye" size={16} />
              Смотреть
            </Button>
            <Button 
              variant="outline"
              className="rounded-xl"
              onClick={() => onDelete(event.id)}
            >
              <Icon name="Trash2" size={16} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;