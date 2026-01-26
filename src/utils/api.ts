import { logout } from './auth';

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  // Если получили 401, разлогиниваем пользователя
  if (response.status === 401) {
    logout();
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized - session expired');
  }

  return response;
};
