import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/utils/auth';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    if (authStatus) {
      loadUnreadCount();
    }
  }, [location]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isAuth]);

  const loadUnreadCount = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        'https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=unread_count',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const publicItems: { path: string; label: string; icon: string }[] = [];

  const mainNavItems = [
    { path: '/dating', label: 'Знакомства', icon: 'Heart', showLabel: true },
    { path: '/ads', label: 'Объявления', icon: 'MessageSquare', showLabel: true },
    { path: '/services', label: 'Услуги', icon: 'Briefcase', showLabel: true },
    { path: '/events', label: 'Мероприятия', icon: 'Calendar', showLabel: true },
  ];

  const iconOnlyItems = [
    { path: '/friends', label: 'Мои друзья', icon: 'UserPlus', showLabel: false },
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
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-2xl">🚀</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ConnectHub
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {isAuth ? (
              <>
                {mainNavItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      className="gap-1.5 px-3 text-sm"
                    >
                      <Icon name={item.icon} size={16} />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <div className="w-px h-6 bg-border mx-1" />
                {iconOnlyItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      size="icon"
                      title={item.label}
                      className="h-9 w-9 relative"
                    >
                      <Icon name={item.icon} size={16} />
                      {item.path === '/messages' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
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
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Icon name={isOpen ? 'X' : 'Menu'} size={24} />
          </Button>
        </div>

        {isOpen && (
          <div className="lg:hidden pb-4 animate-fade-in">
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
                        className="w-full justify-start gap-2 relative"
                      >
                        <Icon name={item.icon} size={18} />
                        {item.label}
                        {item.path === '/messages' && unreadCount > 0 && (
                          <Badge className="ml-auto bg-red-500">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
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