import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Profile } from './DatingProfilesLoader';

interface UseDatingActionsHandlersProps {
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  currentUserId: number | null;
}

export const useDatingActionsHandlers = ({ profiles, setProfiles, currentUserId }: UseDatingActionsHandlersProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [friendRequests, setFriendRequests] = useState<number[]>([]);
  const [friends, setFriends] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});

  const handleAddFriend = async (profileId: number) => {
    if (actionLoading[`friend_${profileId}`] || friendRequests.includes(profileId) || friends.includes(profileId)) {
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [`friend_${profileId}`]: true }));
    
    try {
      const profile = profiles.find(p => p.id === profileId);
      const response = await fetch('https://functions.poehali.dev/77d6e7a2-3fb7-44e5-ad41-83f96a49a5e7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          to_user_id: profile?.user_id
        })
      });

      if (response.ok) {
        setFriendRequests([...friendRequests, profileId]);
        setProfiles(profiles.map(p => 
          p.id === profileId ? { ...p, friend_request_sent: true } : p
        ));
        toast({
          title: 'Заявка отправлена',
          description: `Ваша заявка в друзья отправлена пользователю ${profile?.name}`,
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить заявку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`friend_${profileId}`]: false }));
    }
  };

  const handleAddToFavorites = async (profileId: number) => {
    if (actionLoading[`favorite_${profileId}`] || favorites.includes(profileId)) {
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [`favorite_${profileId}`]: true }));
    
    try {
      const profile = profiles.find(p => p.id === profileId);
      const response = await fetch('https://functions.poehali.dev/2ba43b2e-e797-43f7-87bd-8b8a9e65bb20', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          favorited_user_id: profile?.user_id
        })
      });

      if (response.ok) {
        setFavorites([...favorites, profileId]);
        setProfiles(profiles.map(p => 
          p.id === profileId ? { ...p, is_favorite: true } : p
        ));
        toast({
          title: 'Добавлено в избранное',
          description: `${profile?.name} добавлен(а) в ваше избранное`,
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить в избранное',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить в избранное',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`favorite_${profileId}`]: false }));
    }
  };

  const handleMessage = (profile: Profile) => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    if (profile.user_id === currentUserId) {
      toast({
        title: 'Невозможно',
        description: 'Вы не можете отправить сообщение самому себе',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/chat?userId=${profile.user_id}`);
  };

  return {
    friendRequests,
    friends,
    favorites,
    actionLoading,
    handleAddFriend,
    handleAddToFavorites,
    handleMessage
  };
};
