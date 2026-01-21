import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Notifications = () => {
  const [notifications] = useState([
    { id: 1, type: 'friend_request', text: 'Новая заявка в друзья от Анны', time: '2 часа назад', read: false },
    { id: 2, type: 'message', text: 'Новое сообщение от Игоря', time: '5 часов назад', read: false },
    { id: 3, type: 'like', text: 'Ваша анкета понравилась Марии', time: '1 день назад', read: true },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      
      <main className="pt-24 pb-24 lg:pb-12">
        <div className="container mx-auto px-4">
          <Card className="rounded-3xl border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Уведомления</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border ${!notif.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Icon name="Bell" size={20} className="mt-1 text-primary" />
                        <div>
                          <p className="font-medium">{notif.text}</p>
                          <p className="text-sm text-muted-foreground">{notif.time}</p>
                        </div>
                      </div>
                      {!notif.read && (
                        <Button size="sm" variant="ghost">Прочитано</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Notifications;