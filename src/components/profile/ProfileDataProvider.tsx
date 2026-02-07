import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  nickname: string;
  bio: string;
  avatar_url: string;
  gender: string;
  birth_date: string;
  zodiac_sign: string;
  city: string;
  district: string;
  height: string;
  body_type: string;
  marital_status: string;
  children: string;
  financial_status: string;
  has_car: string;
  has_housing: string;
  dating_goal: string;
  interests: string[];
  profession: string;
  status_text: string;
  phone: string;
  telegram: string;
  instagram: string;
  lookingForGender?: string;
  age_from?: number | null;
  age_to?: number | null;
}

export const useProfileData = () => {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved !== 'false';
  });
  const [datingVisible, setDatingVisible] = useState(() => {
    const saved = localStorage.getItem('datingProfileVisible');
    return saved !== 'false';
  });
  const [shareLocation, setShareLocation] = useState(() => {
    const saved = localStorage.getItem('shareLocation');
    return saved === 'true';
  });
  const [premiumOnly, setPremiumOnly] = useState(() => {
    const saved = localStorage.getItem('premiumOnlyMessages');
    return saved === 'true';
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [animateAvatar, setAnimateAvatar] = useState(() => {
    const saved = localStorage.getItem('animateAvatar');
    return saved !== 'false';
  });
  const [contactPrice, setContactPrice] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    nickname: '',
    bio: '',
    avatar_url: '',
    gender: '',
    birth_date: '',
    zodiac_sign: '',
    city: '',
    district: '',
    height: '',
    body_type: '',
    marital_status: '',
    children: '',
    financial_status: '',
    has_car: '',
    has_housing: '',
    dating_goal: '',
    interests: [] as string[],
    profession: '',
    status_text: '',
    phone: '',
    telegram: '',
    instagram: '',
    lookingForGender: '',
    age_from: null,
    age_to: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/a0d5be16-254f-4454-bc2c-5f3f3e766fcc', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('User data loaded:', userData);
          console.log('is_vip:', userData.is_vip);
          setUser(userData);
          setDatingVisible(userData.dating_visible !== false);
          setShareLocation(userData.share_location === true);
          setPremiumOnly(userData.premium_only_messages === true);
          setContactPrice(userData.contact_price || 0);
          setFormData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            nickname: userData.nickname || '',
            bio: userData.bio || '',
            avatar_url: userData.avatar_url || '',
            gender: userData.gender || '',
            birth_date: userData.birth_date || '',
            zodiac_sign: userData.zodiac_sign || '',
            city: userData.city || '',
            district: userData.district || '',
            height: userData.height || '',
            body_type: userData.body_type || '',
            marital_status: userData.marital_status || '',
            children: userData.children || '',
            financial_status: userData.financial_status || '',
            has_car: userData.has_car || '',
            has_housing: userData.has_housing || '',
            dating_goal: userData.dating_goal || '',
            interests: userData.interests || [],
            profession: userData.profession || '',
            status_text: userData.status_text || '',
            phone: userData.phone || '',
            telegram: userData.telegram || '',
            instagram: userData.instagram || '',
            lookingForGender: userData.looking_for_gender || '',
            age_from: userData.age_from || null,
            age_to: userData.age_to || null,
          });
        } else {
          toast({ title: 'Ошибка', description: 'Не удалось загрузить профиль', variant: 'destructive' });
          navigate('/login');
        }
      } catch (error) {
        toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
      }
    };

    loadProfile();
    loadPhotos();
    loadVerificationStatus();
    
    // Проверка истекших банов каждую минуту
    const checkBansInterval = setInterval(() => {
      fetch('https://functions.poehali.dev/555a1b0a-0919-4f3b-91dd-451cd9f9a5a5')
        .then(() => {
          // После проверки банов перезагружаем профиль, если пользователь был забанен
          if (user && user.is_banned) {
            loadProfile();
          }
        })
        .catch(err => console.error('Failed to check expired bans:', err));
    }, 60000); // Каждую минуту
    
    return () => clearInterval(checkBansInterval);
  }, [navigate, toast]);

  const loadVerificationStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/de844d47-7d8b-4431-8204-783aa2013212', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          try {
            const data = JSON.parse(text);
            if (data && data.status) {
              setVerificationStatus(data.status);
            }
          } catch (e) {
            console.error('Failed to parse verification status:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load verification status:', error);
    }
  };

  const loadPhotos = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782?action=list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Failed to load photos', error);
    }
  };

  return {
    user,
    setUser,
    editMode,
    setEditMode,
    photos,
    settingsOpen,
    setSettingsOpen,
    verificationStatus,
    soundEnabled,
    setSoundEnabled,
    datingVisible,
    setDatingVisible,
    shareLocation,
    setShareLocation,
    darkMode,
    setDarkMode,
    premiumOnly,
    setPremiumOnly,
    animateAvatar,
    setAnimateAvatar,
    contactPrice,
    setContactPrice,
    formData,
    setFormData,
    loadPhotos,
    navigate,
    toast
  };
};