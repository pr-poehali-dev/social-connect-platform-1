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

  const mainNavItems = [
    { path: '/dating', label: 'Знакомства', icon: 'Heart' },
    { path: '/ads', label: 'Объявления', icon: 'MessageSquare' },
    { path: '/services', label: 'Услуги', icon: 'Briefcase' },
    { path: '/events', label: 'Мероприятия', icon: 'Calendar' },
  ];

  const bottomNavItems = [
    { path: '/friends', label: 'Друзья', icon: 'UserPlus' },
    { path: '/favorites', label: 'Избранное', icon: 'Star' },
    { path: '/messages', label: 'Сообщения', icon: 'MessageCircle', badge: unreadCount },
    { path: '/notifications', label: 'Уведомления', icon: 'Bell' },
    { path: '/referral', label: 'Партнёрка', icon: 'Users' },
    { path: '/wallet', label: 'Кошелёк', icon: 'Wallet' },
    { path: '/profile', label: 'Профиль', icon: 'User' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className={`flex items-center gap-2 group ${isAuth ? 'lg:flex hidden' : ''}`}>
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
                  {bottomNavItems.map((item) => (
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

            {isAuth && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                <Icon name={isOpen ? 'X' : 'Menu'} size={24} />
              </Button>
            )}

            {!isAuth && (
              <div className="flex lg:hidden gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Регистрация
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {isOpen && isAuth && (
            <div className="lg:hidden pb-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                {[...mainNavItems, ...bottomNavItems].map((item) => (
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
              </div>
            </div>
          )}
        </div>
      </nav>

      {isAuth && (
        <>
          <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-border">
            <div className="flex overflow-x-auto hide-scrollbar">
              {mainNavItems.map((item) => (
                <Link key={item.path} to={item.path} className="flex-shrink-0">
                  <Button
                    variant={location.pathname === item.path ? 'default' : 'ghost'}
                    className="gap-2 rounded-none border-b-2 border-transparent data-[active=true]:border-primary h-14"
                    data-active={location.pathname === item.path}
                  >
                    <Icon name={item.icon} size={18} />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-border pb-safe">
            <div className="grid grid-cols-7 gap-1 px-2 py-2">
              {bottomNavItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-full relative"
                    title={item.label}
                  >
                    <Icon name={item.icon} size={24} />
                    {item.path === '/messages' && unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navigation;