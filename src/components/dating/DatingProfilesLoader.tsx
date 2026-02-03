import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateDistance, formatDistance } from '@/utils/distance';
import { DatingFilters } from './DatingFiltersState';

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  age: number | null;
  birth_date: string;
  city: string;
  district: string;
  gender: string;
  image: string;
  isOnline: boolean;
  lastSeen: string;
  isVerified: boolean;
  height: number;
  physique: string;
  about: string;
  interests: string[];
  is_favorite: boolean;
  friend_request_sent: boolean;
  is_friend: boolean;
  isTopAd: boolean;
  status_text: string;
  distance: string | null;
  bodyType?: string;
  maritalStatus?: string;
  hasChildren?: string;
  education?: string;
  work?: string;
  financialStatus?: string;
  hasCar?: string;
  hasHousing?: string;
  datingGoal?: string;
  bio?: string;
}

interface UseDatingProfilesLoaderProps {
  filters: DatingFilters;
}

export const formatLastSeen = (lastLoginAt: string | null) => {
  if (!lastLoginAt) return 'давно';
  
  const now = new Date();
  const lastLogin = new Date(lastLoginAt);
  const diffMs = now.getTime() - lastLogin.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн назад`;
  return lastLogin.toLocaleDateString('ru-RU');
};

export const useDatingProfilesLoader = ({ filters }: UseDatingProfilesLoaderProps) => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

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
        setCurrentUserId(userData.id);
        
        if (userData.share_location && userData.latitude && userData.longitude) {
          setCurrentUserLocation({
            latitude: userData.latitude,
            longitude: userData.longitude
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadProfiles = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        action: 'profiles',
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.ageFrom && { ageFrom: filters.ageFrom }),
        ...(filters.ageTo && { ageTo: filters.ageTo }),
        ...(filters.city && { city: filters.city }),
        ...(filters.district && { district: filters.district }),
        ...(filters.heightFrom && { heightFrom: filters.heightFrom }),
        ...(filters.heightTo && { heightTo: filters.heightTo }),
        ...(filters.bodyType && { bodyType: filters.bodyType }),
        ...(filters.maritalStatus && { maritalStatus: filters.maritalStatus }),
        ...(filters.hasChildren && { hasChildren: filters.hasChildren }),
        ...(filters.financialStatus && { financialStatus: filters.financialStatus }),
        ...(filters.hasCar && { hasCar: filters.hasCar }),
        ...(filters.hasHousing && { hasHousing: filters.hasHousing }),
        ...(filters.datingGoal && { datingGoal: filters.datingGoal }),
        ...(filters.online && { online: 'true' }),
        ...(filters.withPhoto && { withPhoto: 'true' })
      });

      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://functions.poehali.dev/d6695b20-a490-4823-9fdf-77f3829596e2?${params}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      if (response.ok) {
        const data = await response.json();
        const mappedProfiles = (data.profiles || [])
          .map((p: any) => {
            let distance = null;
            if (currentUserLocation && p.share_location && p.latitude && p.longitude) {
              const dist = calculateDistance(
                currentUserLocation.latitude,
                currentUserLocation.longitude,
                p.latitude,
                p.longitude
              );
              distance = formatDistance(dist);
            }

            return {
              id: p.id,
              user_id: p.user_id,
              name: p.name,
              age: p.age ? parseInt(p.age) : null,
              birth_date: p.birth_date,
              city: p.city,
              district: p.district,
              gender: p.gender,
              image: p.avatar_url || p.user_avatar || p.image,
              isOnline: p.is_online,
              lastSeen: p.last_login_at,
              isVerified: p.is_verified,
              height: p.height,
              physique: p.body_type || p.bodyType,
              about: p.bio,
              interests: p.interests || [],
              is_favorite: p.is_favorite,
              friend_request_sent: p.friend_request_sent,
              is_friend: p.is_friend,
              isTopAd: p.is_top_ad || p.isTopAd,
              status_text: p.status_text,
              distance,
              bodyType: p.body_type,
              maritalStatus: p.marital_status,
              hasChildren: p.children,
              education: p.education,
              work: p.profession,
              financialStatus: p.financial_status,
              hasCar: p.has_car,
              hasHousing: p.has_housing,
              datingGoal: p.dating_goal,
              bio: p.bio
            };
          })
          .filter((p: any) => p.image && p.image.trim() !== '');
        setProfiles(mappedProfiles);
      } else {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить профили',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    profiles,
    setProfiles,
    loading,
    currentUserId,
    loadProfiles
  };
};