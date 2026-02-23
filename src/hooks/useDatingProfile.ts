import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance, formatDistance } from '@/utils/distance';

const DATING_URL = 'https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2';

export const useDatingProfile = (userId: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserIsVip, setCurrentUserIsVip] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [currentUserGender, setCurrentUserGender] = useState<string | null>(null);
  const [missCanVote, setMissCanVote] = useState<{ can_vote: boolean; reason?: string; next_vote_at?: string } | null>(null);
  const [missVoting, setMissVoting] = useState(false);
  const [missRank, setMissRank] = useState<number | null>(null);

  useEffect(() => {
    loadProfile();
    loadCurrentUser();
    loadPhotos();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPhotos = async () => {
    if (!userId) return;
    const token = localStorage.getItem('access_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const response = await fetch(
        `https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782?action=list&user_id=${userId}`,
        { headers }
      );
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  const loadCurrentUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id);
        setCurrentUserIsVip(userData.is_vip || false);
        setCurrentUserGender(userData.gender || null);

        if (userData.share_location && userData.latitude && userData.longitude) {
          setCurrentUserLocation({ latitude: userData.latitude, longitude: userData.longitude });
        }

        if (userData.gender === 'male') {
          try {
            const voteRes = await fetch(`${DATING_URL}?action=miss-can-vote`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (voteRes.ok) setMissCanVote(await voteRes.json());
          } catch (e) {
            console.error(e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(
        `${DATING_URL}?action=profile&id=${userId}`,
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );

      if (response.ok) {
        const data = await response.json();
        const userProfile = data;
        console.log('Данные профиля с бэкенда:', userProfile);

        if (userProfile) {
          let age = userProfile.age;
          if (!age && userProfile.birth_date) {
            const birthDate = new Date(userProfile.birth_date);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          console.log('Рассчитанный возраст:', age);

          setProfile({
            id: userProfile.id,
            user_id: userProfile.user_id,
            name: userProfile.name,
            age: age,
            city: userProfile.city,
            district: userProfile.district,
            gender: userProfile.gender,
            image: userProfile.image,
            isOnline: userProfile.isonline || false,
            lastSeen: userProfile.lastloginat,
            height: userProfile.height,
            bodyType: userProfile.bodytype,
            about: userProfile.bio,
            interests: userProfile.interests || [],
            is_favorite: userProfile.is_favorite,
            friend_request_sent: userProfile.friend_request_sent,
            is_friend: userProfile.is_friend,
            status_text: userProfile.status_text,
            is_verified: userProfile.is_verified,
            phone: userProfile.phone,
            telegram: userProfile.telegram,
            instagram: userProfile.instagram,
            marital_status: userProfile.marital_status,
            children: userProfile.children,
            financial_status: userProfile.financial_status,
            has_car: userProfile.has_car,
            has_housing: userProfile.has_housing,
            dating_goal: userProfile.dating_goal,
            profession: userProfile.profession,
            is_vip: userProfile.is_vip,
            profile_background: userProfile.profile_background,
          });
          setIsFavorite(userProfile.is_favorite);
          setRequestSent(userProfile.friend_request_sent);
          setIsFriend(userProfile.is_friend);

          if (userProfile.gender === 'female' && userProfile.user_id) {
            fetch(`${DATING_URL}?action=miss-leaderboard`)
              .then(r => r.json())
              .then(leaderData => {
                const found = (leaderData.leaderboard || []).find((c: { user_id: number; rank: number }) => c.user_id === userProfile.user_id);
                if (found) setMissRank(found.rank);
              })
              .catch(() => {});
          }

          if (currentUserLocation && userProfile.share_location && userProfile.latitude && userProfile.longitude) {
            const dist = calculateDistance(
              currentUserLocation.latitude,
              currentUserLocation.longitude,
              userProfile.latitude,
              userProfile.longitude
            );
            setDistance(formatDistance(dist));
          }
        } else {
          toast({ title: 'Профиль не найден', description: 'Пользователь не существует', variant: 'destructive' });
          navigate('/dating');
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({ title: 'Ошибка загрузки', description: 'Не удалось загрузить профиль', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!profile) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({ title: 'Требуется авторизация', description: 'Войдите в аккаунт', variant: 'destructive' });
      navigate('/login');
      return;
    }
    try {
      const action = requestSent ? 'cancel-friend-request' : 'friend-request';
      const response = await fetch(`${DATING_URL}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ to_user_id: profile.user_id }),
      });
      if (response.ok) {
        setRequestSent(!requestSent);
        toast({ title: requestSent ? 'Заявка отменена' : 'Заявка отправлена', description: requestSent ? '' : 'Ожидайте подтверждения' });
      } else {
        const data = await response.json();
        toast({ title: 'Ошибка', description: data.error || 'Не удалось обработать запрос', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast({ title: 'Ошибка', description: 'Не удалось отправить заявку', variant: 'destructive' });
    }
  };

  const handleToggleFavorite = async () => {
    if (!profile) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({ title: 'Требуется авторизация', description: 'Войдите в аккаунт', variant: 'destructive' });
      navigate('/login');
      return;
    }
    try {
      const action = isFavorite ? 'unfavorite' : 'favorite';
      const response = await fetch(`${DATING_URL}?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ profile_id: profile.id }),
      });
      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast({ title: isFavorite ? 'Удалено из избранного' : 'Добавлено в избранное', description: isFavorite ? '' : 'Профиль сохранён в разделе Избранное' });
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось обновить избранное', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({ title: 'Ошибка', description: 'Не удалось обновить избранное', variant: 'destructive' });
    }
  };

  const handleSendMessage = async () => {
    if (!profile) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({ title: 'Требуется авторизация', description: 'Войдите в аккаунт, чтобы отправить сообщение', variant: 'destructive' });
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(
        'https://functions.poehali.dev/5fb70336-def7-4f87-bc9b-dc79410de35d?action=create-conversation',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ type: 'personal', participantId: profile.user_id }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        navigate('/messages', { state: { openChatId: data.conversationId } });
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось создать чат', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const handleMissVote = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    setMissVoting(true);
    try {
      const res = await fetch(`${DATING_URL}?action=miss-vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contestant_user_id: profile?.user_id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: '👑 Голос принят!', description: 'Спасибо за участие в конкурсе' });
        setMissCanVote({ can_vote: false, reason: 'cooldown' });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setMissVoting(false);
    }
  };

  return {
    profile,
    loading,
    currentUserId,
    currentUserIsVip,
    isFriend,
    isFavorite,
    requestSent,
    photos,
    distance,
    currentUserGender,
    missCanVote,
    missVoting,
    missRank,
    handleAddFriend,
    handleToggleFavorite,
    handleSendMessage,
    handleMissVote,
  };
};
