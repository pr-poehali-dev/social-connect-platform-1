import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Service {
  id: number;
  user_id: number;
  category_id: number;
  subcategory_id: number;
  title: string;
  description: string;
  price: string;
  city: string;
  district: string;
  is_online: boolean;
  is_active: boolean;
  category_name: string;
  subcategory_name: string;
  user_name: string;
  user_avatar: string;
}

interface ServicePublicCardProps {
  service: Service;
  onClick: () => void;
}

const ServicePublicCard = ({ service, onClick }: ServicePublicCardProps) => {
  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-3xl border-2" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-20 h-20 border-2 border-primary">
            {service.user_avatar ? (
              <img src={service.user_avatar} alt={service.user_name} />
            ) : (
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                {service.user_name?.charAt(0) || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{service.user_name || 'Пользователь'}</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="rounded-full">
                {service.category_name}
              </Badge>
              {service.is_online && (
                <Badge className="rounded-full bg-green-500 hover:bg-green-600">
                  Онлайн
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-lg mb-1">{service.title}</h4>
            <p className="text-sm text-muted-foreground">{service.subcategory_name}</p>
          </div>
          
          {service.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              {service.city && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon name="MapPin" size={16} />
                  <span>{service.city}</span>
                </div>
              )}
            </div>
            {service.price && (
              <span className="text-lg font-bold text-primary">{service.price}</span>
            )}
          </div>

          <Button className="w-full rounded-xl">
            Подробнее
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicePublicCard;
