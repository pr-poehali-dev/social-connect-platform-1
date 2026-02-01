export interface Category {
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

export interface Service {
  id: number;
  user_id: number;
  category_id: number;
  subcategory_id: number;
  title: string;
  description: string;
  price: string;
  city: string;
  district: string;
  is_online: boolean;
  is_active: boolean;
  category_name: string;
  subcategory_name: string;
  user_name?: string;
  user_avatar?: string;
  created_at: string;
  updated_at?: string;
}

export interface ServiceFormData {
  category_id: string;
  subcategory_id: string;
  title: string;
  description: string;
  price: string;
  is_online: boolean;
  city: string;
  district: string;
}
