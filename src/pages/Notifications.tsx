import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Notification {
  id: number;
  type: string;
  title: string;
  content?: string;
  is_read: boolean;
  created_at: string;
  related_user_first_name?: string;
  related_user_last_name?: string;
  related_user_avatar?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('https://functions.poehali.dev/80cfdd0d-b09e-4558-8e2a-ea91134990d5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('https://functions.poehali.dev/80cfdd0d-b09e-4558-8e2a-ea91134990d5', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notification_id: notificationId })
      });

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} д. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-32 pb-24 lg:pt-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <Card className="rounded-3xl border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Уведомления</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Уведомлений пока нет</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl border ${!notif.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <Icon name="Bell" size={20} className="mt-1 text-primary" />
                          <div>
                            <p className="font-medium">{notif.title}</p>
                            {notif.content && (
                              <p className="text-sm text-muted-foreground mt-1">{notif.content}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">{formatTime(notif.created_at)}</p>
                          </div>
                        </div>
                        {!notif.is_read && (
                          <Button size="sm" variant="ghost" onClick={() => markAsRead(notif.id)}>Прочитано</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Notifications;