import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const SERVICES_URL = 'https://functions.poehali.dev/39bc832e-a96a-47ed-9448-cce91cbda774';

interface UserData {
  user_id: number;
  first_name: string;
  last_name: string;
  nickname: string;
  avatar_url: string | null;
  city: string;
  bio: string;
  gender: string;
  age: number | null;
}

interface ServiceData {
  id: number;
  title: string;
  description: string;
  price: string;
  price_list: { service: string; price: string; time?: string }[] | null;
  is_online: boolean;
  category_name: string | null;
  subcategory_name: string | null;
  city_name: string | null;
  portfolio: string[];
}

interface ReviewData {
  id: number;
  rating: number;
  text: string;
  verified: boolean;
  created_at: string;
  author_first_name: string;
  author_last_name: string;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ServiceDetail = () => {
  const { nickname } = useParams<{ nickname: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!nickname) return;
    setLoading(true);
    fetch(`${SERVICES_URL}?action=detail&nickname=${encodeURIComponent(nickname)}`)
      .then(res => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then(data => {
        setUserData(data.user);
        setServices(data.services || []);
        setReviews(data.reviews || []);
        setAvgRating(data.avg_rating || 0);
        setTotalReviews(data.total_reviews || 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [nickname]);

  const handleOpenChat = () => {
    navigate(`/messages?to=${nickname}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="flex justify-center items-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="pt-32 text-center px-4">
          <Icon name="UserX" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Специалист не найден</h2>
          <p className="text-muted-foreground mb-4">Такого пользователя нет или у него нет услуг</p>
          <Button onClick={() => navigate('/services')}>Назад к услугам</Button>
        </div>
      </div>
    );
  }

  const userName = [userData.first_name, userData.last_name].filter(Boolean).join(' ') || nickname;
  const allPriceItems = services.flatMap(s =>
    (s.price_list || []).map((item, idx) => ({ ...item, id: `${s.id}-${idx}` }))
  );
  const allPortfolio = services.flatMap(s => s.portfolio || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />

      <main className="pt-24 pb-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6 gap-2 rounded-xl"
              onClick={() => navigate('/services')}
            >
              <Icon name="ArrowLeft" size={18} />
              Назад к услугам
            </Button>

            <Card className="rounded-3xl border-2 shadow-2xl mb-6">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <Avatar className="w-32 h-32 border-4 border-primary">
                    {userData.avatar_url ? (
                      <AvatarImage src={userData.avatar_url} alt={userName} />
                    ) : (
                      <AvatarFallback className="text-4xl bg-gradient-to-br from-primary via-secondary to-accent text-white">
                        {userName.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{userName}</h1>
                        {userData.age && <p className="text-muted-foreground mb-2">{userData.age} лет</p>}
                        {userData.city && (
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <Icon name="MapPin" size={16} className="text-muted-foreground" />
                            <span>{userData.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">{avgRating || '0'}</span>
                          </div>
                          <span className="text-muted-foreground">({totalReviews} отзывов)</span>
                        </div>
                      </div>
                    </div>

                    {services.some(s => s.is_online) && (
                      <Badge variant="secondary" className="rounded-full mb-4">
                        <Icon name="Wifi" size={14} className="mr-1" />
                        Работает онлайн
                      </Badge>
                    )}

                    {userData.bio && <p className="text-muted-foreground mb-6">{userData.bio}</p>}

                    {services.map(s => (
                      <div key={s.id} className="mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {s.title && <Badge className="rounded-full">{s.title}</Badge>}
                          {s.category_name && <Badge variant="outline" className="rounded-full">{s.category_name}</Badge>}
                          {s.subcategory_name && <Badge variant="outline" className="rounded-full text-xs">{s.subcategory_name}</Badge>}
                        </div>
                        {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                      </div>
                    ))}

                    <Button
                      size="lg"
                      className="w-full md:w-auto rounded-xl gap-2 mt-4"
                      onClick={handleOpenChat}
                    >
                      <Icon name="MessageCircle" size={20} />
                      Обсудить сделку
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="prices" className="mb-8">
              <TabsList className="w-full justify-start rounded-2xl">
                <TabsTrigger value="prices" className="gap-2 rounded-xl">
                  <Icon name="DollarSign" size={16} />
                  Прайс-лист
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2 rounded-xl">
                  <Icon name="Star" size={16} />
                  Отзывы ({totalReviews})
                </TabsTrigger>
                {allPortfolio.length > 0 && (
                  <TabsTrigger value="portfolio" className="gap-2 rounded-xl">
                    <Icon name="Image" size={16} />
                    Портфолио ({allPortfolio.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="prices" className="mt-6">
                <Card className="rounded-3xl border-2">
                  <CardContent className="p-6">
                    {allPriceItems.length > 0 ? (
                      <div className="space-y-4">
                        {allPriceItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{item.service}</h3>
                              {item.time && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Icon name="Clock" size={14} />
                                  {item.time}
                                </p>
                              )}
                            </div>
                            <p className="text-xl font-bold text-primary">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icon name="FileText" size={32} className="mx-auto mb-2" />
                        <p>Прайс-лист пока не заполнен</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="rounded-3xl border-2">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {review.author_first_name} {review.author_last_name?.charAt(0)}.
                                </h3>
                                {review.verified && (
                                  <Badge variant="secondary" className="rounded-full text-xs">
                                    <Icon name="CheckCircle" size={12} className="mr-1" />
                                    Оплатил услугу
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Icon
                                  key={i}
                                  name="Star"
                                  size={16}
                                  className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-3xl border-2">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Icon name="MessageSquare" size={32} className="mx-auto mb-2" />
                      <p>Пока нет отзывов</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {allPortfolio.length > 0 && (
                <TabsContent value="portfolio" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {allPortfolio.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Портфолио ${idx + 1}`}
                        className="rounded-2xl w-full aspect-square object-cover border-2"
                      />
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
