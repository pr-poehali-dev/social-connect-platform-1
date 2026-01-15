import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/utils/auth';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, [location]);

  const publicItems = [
    { path: '/', label: 'Главная', icon: 'Home' },
  ];

  const mainNavItems = [
    { path: '/dating', label: 'Знакомства', icon: 'Heart', showLabel: true },
    { path: '/ads', label: 'Объявления', icon: 'MessageSquare', showLabel: true },
    { path: '/services', label: 'Услуги', icon: 'Briefcase', showLabel: true },
    { path: '/events', label: 'Мероприятия', icon: 'Calendar', showLabel: true },
  ];

  const iconOnlyItems = [
    { path: '/favorites', label: 'Избранное', icon: 'Star', showLabel: false },
    { path: '/messages', label: 'Сообщения', icon: 'MessageCircle', showLabel: false },
    { path: '/notifications', label: 'Уведомления', icon: 'Bell', showLabel: false },
    { path: '/referral', label: 'Партнёрка', icon: 'Users', showLabel: false },
    { path: '/wallet', label: 'Кошелёк', icon: 'Wallet', showLabel: false },
    { path: '/profile', label: 'Профиль', icon: 'User', showLabel: false },
  ];

  const navItems = isAuth ? publicItems : publicItems;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {isAuth ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                ConnectHub
              </span>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <span className="text-2xl">🚀</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                ConnectHub
              </span>
            </Link>
          )}

          <div className="hidden md:flex items-center gap-1">
            {isAuth ? (
              <>
                {mainNavItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      className="gap-2"
                    >
                      <Icon name={item.icon} size={18} />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <div className="w-px h-6 bg-border mx-2" />
                {iconOnlyItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      size="icon"
                      title={item.label}
                    >
                      <Icon name={item.icon} size={18} />
                    </Button>
                  </Link>
                ))}
              </>
            ) : (
              <>
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      className="gap-2"
                    >
                      <Icon name={item.icon} size={18} />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Link to="/login">
                  <Button variant="ghost" className="gap-2">
                    <Icon name="LogIn" size={18} />
                    Войти
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="gap-2">
                    <Icon name="UserPlus" size={18} />
                    Регистрация
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Icon name={isOpen ? 'X' : 'Menu'} size={24} />
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {isAuth ? (
                <>
                  {mainNavItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={location.pathname === item.path ? 'default' : 'ghost'}
                        className="w-full justify-start gap-2"
                      >
                        <Icon name={item.icon} size={18} />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  {iconOnlyItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={location.pathname === item.path ? 'default' : 'ghost'}
                        className="w-full justify-start gap-2"
                      >
                        <Icon name={item.icon} size={18} />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {navItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <Button
                        variant={location.pathname === item.path ? 'default' : 'ghost'}
                        className="w-full justify-start gap-2"
                      >
                        <Icon name={item.icon} size={18} />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Icon name="LogIn" size={18} />
                      Войти
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-start gap-2">
                      <Icon name="UserPlus" size={18} />
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;