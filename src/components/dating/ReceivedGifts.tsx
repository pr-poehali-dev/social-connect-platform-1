import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Gift {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar: string;
  gift_name: string;
  gift_emoji: string;
  price: number;
  is_public: boolean;
  created_at: string;
}

interface ReceivedGiftsProps {
  userId: number;
  isOwnProfile: boolean;
}

const ReceivedGifts = ({ userId, isOwnProfile }: ReceivedGiftsProps) => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGifts();
  }, [userId]);

  const loadGifts = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(
        `https://functions.poehali.dev/f4befd24-1ac3-48f4-a9b7-9cccdee173eb?user_id=${userId}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setGifts(data.gifts || []);
      }
    } catch (error) {
      console.error('Failed to load gifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGiftVisibility = async (giftId: number, currentVisibility: boolean) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(
        'https://functions.poehali.dev/f4befd24-1ac3-48f4-a9b7-9cccdee173eb',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            gift_id: giftId,
            is_public: !currentVisibility
          })
        }
      );

      if (response.ok) {
        loadGifts();
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Gift" size={24} />
            Подарки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gifts.length === 0) {
    return (
      <Card className="rounded-3xl border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Gift" size={24} />
            Подарки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Icon name="Gift" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              {isOwnProfile ? 'Вам ещё не дарили подарки' : 'Нет подарков'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Gift" size={24} />
          Подарки ({gifts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {gifts.map((gift) => (
            <div
              key={gift.id}
              className="relative group"
            >
              <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl flex flex-col items-center justify-center p-3 border-2 border-border hover:border-pink-300 transition-all">
                <div className="text-4xl mb-2">{gift.gift_emoji}</div>
                <div className="text-xs font-medium text-center line-clamp-2">{gift.gift_name}</div>
                {!gift.is_public && isOwnProfile && (
                  <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1">
                    <Icon name="EyeOff" size={12} className="text-white" />
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => toggleGiftVisibility(gift.id, gift.is_public)}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <Icon 
                    name={gift.is_public ? "EyeOff" : "Eye"} 
                    size={24} 
                    className="text-white"
                  />
                </button>
              )}
              {isOwnProfile && (
                <div className="text-xs text-center text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  {gift.is_anonymous ? (
                    <>
                      <Icon name="EyeOff" size={12} />
                      <span>Аноним</span>
                    </>
                  ) : (
                    <span>от {gift.sender_name}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceivedGifts;