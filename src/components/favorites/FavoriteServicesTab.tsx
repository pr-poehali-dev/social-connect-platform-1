import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface FavoriteServicesTabProps {
  favoriteServices: any[];
  onRemoveFromFavorites: (type: string, id: number) => void;
  onNavigate: (path: string) => void;
}

const FavoriteServicesTab = ({ favoriteServices, onRemoveFromFavorites, onNavigate }: FavoriteServicesTabProps) => {
  return (
    <>
      {favoriteServices.length === 0 ? (
        <Card className="rounded-3xl border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <Icon name="Briefcase" size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет избранных услуг</h3>
            <p className="text-muted-foreground text-center mb-6">
              Сохраняйте интересные услуги
            </p>
            <Button onClick={() => onNavigate('/services')} className="gap-2 rounded-xl">
              <Icon name="Briefcase" size={18} />
              Посмотреть услуги
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {favoriteServices.map((service) => (
            <Card key={service.id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                      {service.avatar ? (
                        <AvatarImage src={service.avatar} alt={service.name} />
                      ) : (
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                          {service.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">@{service.nickname} • {service.age} лет</p>
                    <p className="text-sm text-muted-foreground">{service.city}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFromFavorites('service', service.id)}
                  >
                    <Icon name="Star" size={20} className="fill-yellow-400 text-yellow-400" />
                  </Button>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="font-medium">{service.service}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Icon name="Star" size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{service.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({service.reviews} отзывов)</span>
                  </div>
                  <p className="text-xl font-bold text-primary">{service.price}</p>
                </div>
                <Button 
                  className="w-full rounded-xl"
                  onClick={() => onNavigate(`/services/${service.nickname}`)}
                >
                  Подробнее
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoriteServicesTab;
