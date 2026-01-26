import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/utils/auth';
import { useRadio } from '@/contexts/RadioContext';

interface NavigationProps {
  showMessagesTabs?: boolean;
  activeMessagesTab?: string;
  onMessagesTabChange?: (tab: string) => void;
  messageCounts?: { personal: number; group: number; deal: number };
}

const Navigation = ({ showMessagesTabs, activeMessagesTab, onMessagesTabChange, messageCounts }: NavigationProps = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { isPlaying, togglePlay } = useRadio();

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    if (authStatus) {
      loadUnreadCount();
      loadUserAvatar();
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

  const loadUserAvatar = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        'https://functions.poehali.dev/e94df70d-42e0-4d41-8734-1e27734c3afe',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Failed to load avatar:', error);
    }
  };

  const mainNavItems = [
    { path: '/dating', label: 'Знакомства', icon: 'Heart' },
    { path: '/ads', label: 'LIVE', icon: 'Radio', pulse: true },
    { path: '/services', label: 'Услуги', icon: 'Briefcase' },
    { path: '/events', label: 'Мероприятия', icon: 'Calendar' },
  ];

  const bottomNavItems = [
    { path: '/favorites', label: 'Избранное', icon: 'Star' },
    { path: '/messages', label: 'Сообщения', icon: 'MessageCircle', badge: unreadCount },
    { path: '/notifications', label: 'Уведомления', icon: 'Bell' },
    { path: '/radio', label: 'Радио', icon: 'Music' },
    { path: '/referral', label: 'Партнёрка', icon: 'Users' },
    { path: '/wallet', label: 'Кошелёк', icon: 'Wallet' },
    { path: '/profile', label: 'Профиль', icon: 'User' },
  ];

  if (!isAuth) {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border lg:block hidden">
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
              {mainNavItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? 'default' : 'ghost'}
                    className={`gap-1.5 px-3 text-sm ${item.pulse ? 'animate-pulse' : ''}`}
                  >
                    <Icon name={item.icon} size={16} />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <div className="w-px h-6 bg-border mx-1" />
              {bottomNavItems.map((item) => {
                if (item.path === '/radio') {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={buttonVariants({ variant: "ghost", size: "icon" }) + " h-9 w-9 relative"}
                    >
                      <Icon name="Music" size={18} />
                      {isPlaying && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </Link>
                  );
                }
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? 'default' : 'ghost'}
                      size="icon"
                      title={item.label}
                      className="h-9 w-9 relative"
                    >
                    {item.path === '/profile' && avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Профиль" 
                        className="w-full h-full rounded-md object-cover"
                      />
                    ) : (
                      <Icon name={item.icon} size={16} />
                    )}
                    {item.path === '/messages' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Icon name={isOpen ? 'X' : 'Menu'} size={24} />
            </Button>
          </div>

          {showMessagesTabs && location.pathname === '/messages' && (
            <div className="border-t border-border py-3 overflow-x-auto">
              <div className="flex gap-2 px-1 justify-start">
                <Button
                  variant={activeMessagesTab === 'personal' ? 'default' : 'outline'}
                  className="gap-2 rounded-2xl flex-shrink-0 text-sm lg:size-auto size-10 lg:px-4 px-0"
                  onClick={() => onMessagesTabChange?.('personal')}
                  title="Личные сообщения"
                >
                  <Icon name="MessageCircle" size={16} />
                  <span className="hidden lg:inline">Личные сообщения</span>
                  {messageCounts?.personal ? <Badge variant={activeMessagesTab === 'personal' ? 'secondary' : 'outline'} className="hidden lg:inline-flex">{messageCounts.personal}</Badge> : null}
                  {messageCounts?.personal ? <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs lg:hidden">{messageCounts.personal}</Badge> : null}
                </Button>
                <Button
                  variant={activeMessagesTab === 'group' ? 'default' : 'outline'}
                  className="gap-2 rounded-2xl flex-shrink-0 text-sm lg:size-auto size-10 lg:px-4 px-0 relative"
                  onClick={() => onMessagesTabChange?.('group')}
                  title="Чаты"
                >
                  <Icon name="Users" size={16} />
                  <span className="hidden lg:inline">Чаты</span>
                  {messageCounts?.group ? <Badge variant={activeMessagesTab === 'group' ? 'secondary' : 'outline'} className="hidden lg:inline-flex">{messageCounts.group}</Badge> : null}
                  {messageCounts?.group ? <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs lg:hidden">{messageCounts.group}</Badge> : null}
                </Button>
                <Button
                  variant={activeMessagesTab === 'deal' ? 'default' : 'outline'}
                  className="gap-2 rounded-2xl flex-shrink-0 text-sm lg:size-auto size-10 lg:px-4 px-0 relative"
                  onClick={() => onMessagesTabChange?.('deal')}
                  title="Обсуждение сделок"
                >
                  <Icon name="Briefcase" size={16} />
                  <span className="hidden lg:inline">Обсуждение сделок</span>
                  {messageCounts?.deal ? <Badge variant={activeMessagesTab === 'deal' ? 'secondary' : 'outline'} className="hidden lg:inline-flex">{messageCounts.deal}</Badge> : null}
                  {messageCounts?.deal ? <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs lg:hidden">{messageCounts.deal}</Badge> : null}
                </Button>
                <Button
                  variant={activeMessagesTab === 'calls' ? 'default' : 'outline'}
                  className="gap-2 rounded-2xl flex-shrink-0 text-sm lg:size-auto size-10 lg:px-4 px-0"
                  onClick={() => onMessagesTabChange?.('calls')}
                  title="Звонки"
                >
                  <Icon name="PhoneCall" size={16} />
                  <span className="hidden lg:inline">Звонки</span>
                </Button>
                <Button
                  variant={activeMessagesTab === 'contacts' ? 'default' : 'outline'}
                  className="gap-2 rounded-2xl flex-shrink-0 text-sm lg:size-auto size-10 lg:px-4 px-0"
                  onClick={() => onMessagesTabChange?.('contacts')}
                  title="Контакты"
                >
                  <Icon name="BookUser" size={16} />
                  <span className="hidden lg:inline">Контакты</span>
                </Button>
                <Button
                  variant={activeMessagesTab === 'calendar' ? 'default' : 'outline'}
                  className="gap-2 rounded-2xl flex-shrink-0 text-sm lg:size-auto size-10 lg:px-4 px-0"
                  onClick={() => onMessagesTabChange?.('calendar')}
                  title="Ежедневник"
                >
                  <Icon name="Calendar" size={16} />
                  <span className="hidden lg:inline">Ежедневник</span>
                </Button>
              </div>
            </div>
          )}

          {isOpen && (
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

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-border">
        <div className="flex justify-around items-center h-14">
          {mainNavItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-1">
              <Button
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                className={`w-full h-12 rounded-none border-b-2 border-transparent data-[active=true]:border-primary text-xs px-1 ${item.pulse ? 'animate-pulse' : ''}`}
                data-active={location.pathname === item.path}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-border pb-safe">
        <div className="grid grid-cols-6 gap-1 px-2 py-2">
          {bottomNavItems.map((item) => {
            if (item.path === '/radio') {
              return (
                <Button
                  key={item.path}
                  onClick={() => window.open('/radio', '_blank')}
                  variant="ghost"
                  size="icon"
                  className="h-12 w-full relative"
                  title="Открыть радио в новом окне"
                >
                  <Icon name="Music" size={24} />
                  {isPlaying && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </Button>
              );
            }
            
            return (
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
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navigation;