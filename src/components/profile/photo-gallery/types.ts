export interface Photo {
  id: number;
  photo_url: string;
  position: number;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
  is_private?: boolean;
  album_id?: number;
}

export interface Album {
  id: number;
  name: string;
  type: 'open' | 'private';
  access_key?: string | null;
  photos_count: number;
  created_at: string;
}

export const GALLERY_URL = 'https://functions.poehali.dev/e762cdb2-751d-45d3-8ac1-62e736480782';

export const getToken = () => localStorage.getItem('access_token');

export default Photo;
