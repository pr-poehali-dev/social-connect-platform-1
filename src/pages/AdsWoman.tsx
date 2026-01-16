import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const AdsWoman = () => {
  const ads = [
    {
      id: 1,
      title: 'Анастасия, 25 лет',
      description: 'Ищу серьезные отношения. Люблю путешествовать, читать и проводить время на природе.',
      age: 25,
      location: 'Москва',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '1 час назад'
    },
    {
      id: 2,
      title: 'Мария, 29 лет',
      description: 'Предприниматель, ценю искренность и чувство юмора. Ищу партнера для совместного развития.',
      age: 29,
      location: 'Санкт-Петербург',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '2 часа назад'
    },
    {
      id: 3,
      title: 'Екатерина, 23 года',
      description: 'Студентка, увлекаюсь фотографией и спортом. Ищу интересного собеседника для начала.',
      age: 23,
      location: 'Казань',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '4 часа назад'
    },
    {
      id: 4,
      title: 'Ольга, 31 год',
      description: 'Люблю активный отдых, горные лыжи и путешествия. Ищу мужчину со схожими интересами.',
      age: 31,
      location: 'Екатеринбург',
      image: 'https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/files/a754fcf6-b096-4433-867a-cca324715b3c.jpg',
      date: '1 день назад'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Объявления девушек
              </h1>
              <Button 
                variant="ghost" 
                className="gap-2"
                onClick={() => window.history.back()}
              >
                <Icon name="ArrowLeft" size={20} />
                Назад
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <Card key={ad.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer rounded-3xl overflow-hidden border-2">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge 
                      variant="secondary" 
                      className="absolute top-4 right-4 rounded-full bg-white/90 backdrop-blur-sm"
                    >
                      <Icon name="User" size={12} className="mr-1" />
                      {ad.age} {ad.age === 23 ? 'года' : 'лет'}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold">{ad.title}</h3>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{ad.date}</p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {ad.description}
                    </p>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <Icon name="MapPin" size={14} />
                      {ad.location}
                    </div>
                    
                    <Button className="w-full rounded-2xl gap-2">
                      <Icon name="MessageCircle" size={16} />
                      Написать
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdsWoman;
