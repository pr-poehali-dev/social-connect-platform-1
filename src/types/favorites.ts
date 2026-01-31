export interface FavoriteProfile {
  id: number;
  name: string;
  age: number;
  city: string;
  nickname: string;
  image: string;
  is_verified: boolean;
  interests: string[];
}

export interface FavoriteAd {
  id: number;
  user_id: number;
  action: string;
  schedule: string;
  name: string;
  nickname: string;
  avatar_url: string;
  gender: string;
  city: string;
  age: number;
  birth_date?: string;
  created_at: string;
  events: { event_type: string; details: string }[];
  is_favorite?: boolean;
}

export interface FavoriteService {
  id: number;
  name: string;
  nickname: string;
  age: number;
  city: string;
  service: string;
  rating: number;
  reviews: number;
  price: string;
  avatar?: string;
}

export interface FavoriteEvent {
  id: number;
  title: string;
  description: string;
  date?: string;
  time?: string;
  location?: string;
  city: string;
  category: string;
  price: number;
  participants?: number;
  maxParticipants?: number;
  image?: string;
  paymentUrl?: string;
  author?: {
    id: number;
    name: string;
    avatar: string;
  };
  event_date?: string;
  event_time?: string;
  event_location?: string;
  image_url?: string;
  max_participants?: number;
  current_participants?: number;
  user_id?: number;
  author_id?: number;
  author_name?: string;
  author_avatar?: string;
}