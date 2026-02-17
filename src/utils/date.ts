export const formatLastSeen = (lastLoginAt: string | null): string => {
  if (!lastLoginAt) return 'давно';

  const now = new Date();
  const utcString = lastLoginAt.endsWith('Z') ? lastLoginAt : lastLoginAt + 'Z';
  const lastLogin = new Date(utcString);
  const diffMs = now.getTime() - lastLogin.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays === 1) return 'вчера';
  if (diffDays < 7) return `${diffDays} дн назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед назад`;
  return lastLogin.toLocaleDateString('ru-RU');
};

export default formatLastSeen;
