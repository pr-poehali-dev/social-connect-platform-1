import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { isAuthenticated } from '@/utils/auth';

const Index = () => {
  const isLoggedIn = isAuthenticated();
  const features = [
    {
      icon: 'Heart',
      title: 'Знакомства',
      description: 'Находите интересных людей и создавайте новые связи',
      color: 'from-pink-500 to-rose-500',
      link: '/dating'
    },
    {
      icon: 'MessageSquare',
      title: 'Объявления',
      description: 'Размещайте и находите объявления в вашем городе',
      color: 'from-purple-500 to-indigo-500',
      link: '/ads'
    },
    {
      icon: 'Briefcase',
      title: 'Услуги',
      description: 'Предлагайте услуги и зарабатывайте безопасно',
      color: 'from-blue-500 to-cyan-500',
      link: '/services'
    },
    {
      icon: 'Users',
      title: 'Реферальная программа',
      description: 'Приглашайте друзей и получайте бонусы',
      color: 'from-emerald-500 to-teal-500',
      link: '/referral'
    },
    {
      icon: 'Wallet',
      title: 'Кошелёк',
      description: 'Пополняйте баланс криптовалютой и выводите заработок',
      color: 'from-amber-500 to-orange-500',
      link: '/wallet'
    },
    {
      icon: 'Shield',
      title: 'Безопасные сделки',
      description: 'Защита покупателей и продавцов на каждом этапе',
      color: 'from-violet-500 to-purple-500',
      link: '/services'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-yellow-50">
      <Navigation />
      
      <main className="pt-20">
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="mb-8">
                <img 
                  src="https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/bucket/214c5eeb-fddf-4e50-86e9-baf072a385d5.png" 
                  alt="LOVE iS" 
                  className="h-32 md:h-40"
                />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[#FF3B5C]">
                  Сайт знакомств
                </span>
                <br />
                <span className="text-foreground">для тех, кто ищет</span>
                <br />
                <span className="text-[#FFD700]">
                  настоящую любовь! ❤️
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Знакомства, общение, события и новые друзья — всё в одном месте
              </p>
              <div className="flex flex-wrap gap-4">
                {isLoggedIn ? (
                  <Link to="/profile">
                    <Button size="lg" className="gap-2 text-lg px-8 py-6 rounded-2xl">
                      <Icon name="User" size={20} />
                      Мой профиль
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="gap-2 text-lg px-8 py-6 rounded-2xl">
                        <Icon name="Sparkles" size={20} />
                        Начать сейчас
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-2xl">
                        Войти
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 via-pink-400/20 to-yellow-400/20 rounded-[3rem] blur-3xl"></div>
              <div className="relative rounded-[3rem] shadow-2xl w-full aspect-square bg-gradient-to-br from-red-400 via-pink-500 to-yellow-400 flex items-center justify-center">
                <div className="text-9xl animate-pulse">💕</div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#FF3B5C]">
              Возможности LOVE iS
            </h2>
            <p className="text-xl text-muted-foreground">
              Всё для знакомств, общения и новых отношений ❤️
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link}>
                <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/50 rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon name={feature.icon} size={28} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/bucket/214c5eeb-fddf-4e50-86e9-baf072a385d5.png" 
              alt="LOVE iS" 
              className="h-12"
            />
            <p className="text-muted-foreground">© 2026 LOVE iS. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;