import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface FavoriteAdsTabProps {
  favoriteAds: any[];
  onRemoveFromFavorites: (type: string, id: number) => void;
  onNavigate: (path: string) => void;
}

const FavoriteAdsTab = ({ favoriteAds, onRemoveFromFavorites, onNavigate }: FavoriteAdsTabProps) => {
  return (
    <>
      {favoriteAds.length === 0 ? (
        <Card className="rounded-3xl border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <Icon name="MessageSquare" size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет избранных объявлений</h3>
            <p className="text-muted-foreground text-center mb-6">
              Сохраняйте интересные объявления
            </p>
            <Button onClick={() => onNavigate('/ads')} className="gap-2 rounded-xl">
              <Icon name="MessageSquare" size={18} />
              Посмотреть объявления
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteAds.map((ad) => (
            <Card key={ad.id} className="rounded-3xl border-2 hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative h-48">
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={() => onRemoveFromFavorites('ad', ad.id)}
                >
                  <Icon name="Star" size={20} className="fill-yellow-400 text-yellow-400" />
                </Button>
              </div>
              <CardContent className="p-6">
                <Badge variant="secondary" className="mb-2 rounded-full">{ad.category}</Badge>
                <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
                <p className="text-2xl font-bold text-primary mb-2">{ad.price}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="MapPin" size={14} />
                    {ad.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Clock" size={14} />
                    {ad.date}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default FavoriteAdsTab;
