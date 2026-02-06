export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

export interface City {
  id: number;
  name: string;
  created_at?: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  created_at?: string;
}

export interface PriceListItem {
  service: string;
  price: string;
  time?: string;
}

export interface Service {
  id: number;
  user_id: number;
  category_id: number;
  subcategory_id: number;
  title: string;
  description: string;
  price: string;
  price_list?: PriceListItem[];
  city_id: number;
  city_name: string;
  district: string;
  is_online: boolean;
  is_active: boolean;
  category_name: string;
  subcategory_name: string;
  user_name?: string;
  user_avatar?: string;
  portfolio?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ServiceFormData {
  category_id: string;
  subcategory_id: string;
  title: string;
  description: string;
  price: string;
  price_list?: PriceListItem[];
  is_online: boolean;
  city_id: string;
  district: string;
  portfolio: string[];
}