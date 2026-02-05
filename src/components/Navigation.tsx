import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { isAuthenticated } from '@/utils/auth';
import { useRadio } from '@/contexts/RadioContext';
import VoiceAssistantModal from '@/components/VoiceAssistantModal';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { isPlaying, togglePlay } = useRadio();
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const avatarCacheRef = useRef<string | null>(null);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    if (authStatus) {
      loadUnreadCount();
      if (!avatarCacheRef.current) {
        loadUserAvatar();
      }
    }
  }, [location]);

  useEffect(() => {
    if (!isAuthenticated()) return;

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isAuth]);

  const playNotificationSound = () => {
    const soundEnabled = localStorage.getItem('notificationSoundEnabled');
    if (soundEnabled === 'false') return;
    
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzWN0fHQfTEGKH3L7+GXRQ0TW7Dn76xZGAk+m9vw0IUyBCh+zO3glEQMElmy5+mrXBcJPprZ79CFMQQnfszt4JREDxJYr+fiq1sYCTya2O/PhTEFKHzL7d+URAwSWK/n4q1cGAk8mNfuz4UyBSh8y+3flEQMElit5+KtXBcIPJjW79CIOwUpfMrt3pRDCRFWrefhrVwXCDuX1u7PiTwGKXvK7N6UQwkRVqzn4axbFwg7l9XuzooABSh6yevdlUUNElat5uKsWxYIPJfV7s6LBQUpecnq3JVFDRJVreXiqVsVCTyZ1ezNjAcHKXfI6duURg0SUqzl4alaBwk9nNjszY0JByh1xufZlUgPEk+p5N6nWQcJPaHd7syQCwcncsXk15ZLERJMpuPcpFgGCkCm4+vKkw4IJnC+4NSWTRUSTKXh25pWBQpFrN/qx5YSCSVtu9vSllAXE0ml39uYVQULSLHe6cWYFgkjaq3Y0JdUGRNHo93akFQEDEy12+e/mxwKImdpvM+aUx4UUKjc2X9LAA5Vudnks6AdCh1iZrLMnVMiFFWs29l8RwAPWsPZpKiUJQocYGOuyo9SIxZXr9rXdkIBEGG/2J+olyoMG15clMiKTiYYWrLZ1HM7Ahltw9iZqJ0vDxpaWJDFhlEpGly02M9qMwMddMjXka+hMxIXV1eOwYNOKx1fudjLYywFIXvO14O1ozkTFVBSjL1/SywgZsXWxl0kBSJ/09Z8t6I+FRJLTYi7eUoyI2vL1bxYJQYkgtPVdbykQRYPS0mEuHVINSZu0dSyUyUHJYTU1G+8p0UXD0hGfbVxRDgocNbTqEslCCWI1NNpvKlJGA1FQ3axbkI7K3Pa0p9IJQknidPSYryrTRoMQkBxrmw/PQAAAABJRUZDbmQA');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

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
        const newCount = data.unread_count || 0;
        
        if (newCount > previousUnreadCount && previousUnreadCount > 0) {
          playNotificationSound();
        }
        
        setPreviousUnreadCount(newCount);
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadUserAvatar = async () => {
    if (avatarCacheRef.current) {
      setAvatarUrl(avatarCacheRef.current);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        'https://functions.poehali.dev/e94df70d-42e0-4d41-8734-1e27734c3afe',
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-cache'
        }
      );
      
      if (!response.ok) return;
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      
      const text = await response.text();
      if (!text || text.trim().startsWith('<')) return;
      
      try {
        const data = JSON.parse(text);
        if (data.avatar_url) {
          avatarCacheRef.current = data.avatar_url;
          setAvatarUrl(data.avatar_url);
        }
      } catch {
        return;
      }
    } catch {
      return;
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
    { path: '/wallet', label: 'Кошелёк', icon: 'Wallet' },
    { path: '/profile', label: 'Профиль', icon: 'User' },
  ];

  if (!isAuth) {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-border lg:block hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <svg width="150" height="36" viewBox="0 0 150 36" fill="none" className="h-10 transform group-hover:scale-110 transition-transform">
                <text x="5" y="26" fontFamily="Georgia" fontSize="24" fontWeight="bold" fill="#E91E63">LOVE</text>
                <text x="78" y="26" fontFamily="Georgia" fontSize="24" fontWeight="normal" className="fill-gray-700 dark:fill-gray-300">IS</text>
                <path d="M113 16 C113 16, 121 8, 127 12 C133 16, 127 22, 127 22 C127 22, 121 28, 113 22 C105 16, 113 16, 113 16" 
                      fill="#E91E63"/>
              </svg>
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

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-border">
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-border pb-safe">
        <div className="grid grid-cols-7 gap-1 px-2 py-2">
          {bottomNavItems.slice(0, 3).map((item) => {
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
          
          <Button
            onClick={() => setShowVoiceAssistant(true)}
            variant="ghost"
            size="icon"
            className="h-12 w-full relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20"
            title="Голосовой помощник"
          >
            <img 
              src="https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/bucket/32de42ae-a70c-4136-be68-92ecb5fe2df8.png" 
              alt="AI" 
              className="w-6 h-6"
            />
          </Button>

          {bottomNavItems.slice(3).map((item) => {
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

      <VoiceAssistantModal 
        isOpen={showVoiceAssistant} 
        onOpenChange={setShowVoiceAssistant} 
      />

      <button
        onClick={() => setShowVoiceAssistant(true)}
        className="hidden lg:flex fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all items-center justify-center group"
        title="Голосовой помощник"
      >
        <img 
          src="https://cdn.poehali.dev/projects/902f5507-7435-42fc-a6de-16cd6a37f64d/bucket/32de42ae-a70c-4136-be68-92ecb5fe2df8.png" 
          alt="AI" 
          className="w-8 h-8 group-hover:scale-110 transition-transform"
        />
      </button>
    </>
  );
};

export default Navigation;