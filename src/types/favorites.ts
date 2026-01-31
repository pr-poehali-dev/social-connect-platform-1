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
  title: string;
  category: string;
  price: string;
  location: string;
  date: string;
  image: string;
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
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  price: number;
  participants: number;
  maxParticipants: number;
  image: string;
  paymentUrl?: string;
  author?: {
    id: number;
    name: string;
    avatar: string;
  };
}
