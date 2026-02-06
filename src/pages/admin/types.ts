export interface User {
  id: number;
  email: string;
  name: string | null;
  nickname: string | null;
  is_vip: boolean;
  vip_expires_at: string | null;
  is_blocked: boolean;
  block_reason: string | null;
  is_verified: boolean;
  is_banned: boolean;
  banned_until: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface UserDetails extends User {
  login_history?: Array<{
    ip: string;
    user_agent: string;
    login_at: string;
    success: boolean;
  }>;
}

export const ADMIN_API = 'https://functions.poehali.dev/1a9ecaa4-2882-4498-965a-c16eb32920ec';
