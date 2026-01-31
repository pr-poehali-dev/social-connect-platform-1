import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { FavoriteEvent } from '@/types/favorites';

interface ToastConfig {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface FavoriteEventsTabProps {
  favoriteEvents: FavoriteEvent[];
  joinedEvents: Set<number>;
  onRemoveFromFavorites: (type: string, id: number) => void;
  onJoinEvent: (eventId: number) => void;
  onNavigate: (path: string) => void;
  onToast: (config: ToastConfig) => void;
}

const FavoriteEventsTab = ({ 
  favoriteEvents, 
  joinedEvents, 
  onRemoveFromFavorites, 
  onJoinEvent, 
  onNavigate,
  onToast 
}: FavoriteEventsTabProps) => {
  return (
    <>
      {favoriteEvents.length === 0 ? (
        <Card className="rounded-3xl border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <Icon name="Calendar" size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет избранных мероприятий</h3>
            <p className="text-muted-foreground text-center mb-6">
              Сохраняйте интересные мероприятия
            </p>
            <Button onClick={() => onNavigate('/events')} className="gap-2 rounded-xl">
              <Icon name="Calendar" size={18} />
              Посмотреть мероприятия
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteEvents.map((event) => (
            <Card key={event.id} className="rounded-3xl border-2 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 text-primary rounded-full">
                    {event.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => onRemoveFromFavorites('event', event.id)}
                  >
                    <Icon name="Star" size={16} className="fill-yellow-400 text-yellow-400" />
                  </Button>
                  {event.price === 0 && (
                    <Badge className="bg-green-500 rounded-full">Бесплатно</Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Calendar" size={16} className="text-primary" />
                    <span>{event.date} в {event.time}</span>
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

                <div 
                  className="flex items-center gap-3 pb-4 border-b mb-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                  onClick={() => onNavigate(`/profile/${event.author?.id}`)}
                >
                  <img
                    src={event.author?.avatar}
                    alt={event.author?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{event.author?.name}</p>
                    <p className="text-xs text-muted-foreground">Организатор</p>
                  </div>
                </div>

                {event.price === 0 ? (
                  <Button 
                    className={`w-full rounded-xl gap-2 ${joinedEvents.has(event.id) ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    onClick={() => onJoinEvent(event.id)}
                    disabled={event.participants >= event.maxParticipants}
                  >
                    <Icon name="Check" size={18} />
                    {joinedEvents.has(event.id) ? 'Вы идёте' : event.participants >= event.maxParticipants ? 'Мест нет' : 'Пойду'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant={joinedEvents.has(event.id) ? "default" : "outline"}
                      className={`flex-1 rounded-xl gap-2 ${joinedEvents.has(event.id) ? 'bg-green-500 hover:bg-green-600' : ''}`}
                      onClick={() => onJoinEvent(event.id)}
                      disabled={event.participants >= event.maxParticipants}
                    >
                      <Icon name="Check" size={18} />
                      {joinedEvents.has(event.id) ? 'Вы идёте' : 'Пойду'}
                    </Button>
                    <Button 
                      className="flex-1 rounded-xl gap-2"
                      onClick={() => {
                        if (event.paymentUrl) {
                          window.open(event.paymentUrl, '_blank');
                        } else {
                          onToast({
                            title: "Ссылка недоступна",
                            description: "Организатор не добавил ссылку на оплату"
                          });
                        }
                      }}
                    >
                      <Icon name="CreditCard" size={18} />
                      Купить
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoriteEventsTab;