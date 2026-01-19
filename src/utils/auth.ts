export const isAuthenticated = (): boolean => {
  // Check only access_token from email/password login
  const accessToken = localStorage.getItem('access_token');
  return !!accessToken;
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