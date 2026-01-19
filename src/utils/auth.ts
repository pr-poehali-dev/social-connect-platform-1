export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('access_token');
  const vkToken = localStorage.getItem('vk_auth_refresh_token');
  const googleToken = localStorage.getItem('google_auth_refresh_token');
  const yandexToken = localStorage.getItem('yandex_auth_refresh_token');
  
  return !!(accessToken || vkToken || googleToken || yandexToken);
};

export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('vk_auth_refresh_token');
  localStorage.removeItem('vk_auth_code_verifier');
  localStorage.removeItem('vk_auth_state');
  localStorage.removeItem('google_auth_refresh_token');
  localStorage.removeItem('google_auth_code_verifier');
  localStorage.removeItem('google_auth_state');
  localStorage.removeItem('yandex_auth_refresh_token');
  localStorage.removeItem('yandex_auth_code_verifier');
  localStorage.removeItem('yandex_auth_state');
};
