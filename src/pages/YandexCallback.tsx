import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const YANDEX_AUTH_URL = 'https://functions.poehali.dev/635fdfd0-fce3-46f9-a566-18d196e6e486';

const YandexCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Обработка входа...');
  const [errorMsg, setErrorMsg] = useState('');
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        setErrorMsg('Код авторизации не получен от Яндекса');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const referralCode = sessionStorage.getItem('yandex_referral_code') || '';

      try {
        const response = await fetch(`${YANDEX_AUTH_URL}?action=callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, referral_code: referralCode }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.error || 'Ошибка авторизации');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('yandex_auth_refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.user?.id) {
          localStorage.setItem('userId', String(data.user.id));
        }

        sessionStorage.removeItem('yandex_auth_state');
        sessionStorage.removeItem('yandex_referral_code');

        setStatus('Вход выполнен! Перенаправляем...');
        setTimeout(() => navigate('/profile'), 1000);
      } catch {
        setErrorMsg('Ошибка сети. Попробуйте снова.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto rounded-3xl border-2 shadow-2xl">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#FF0000] to-[#DD0000] flex items-center justify-center animate-pulse">
            <Icon name="Loader" size={36} className="text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Авторизация через Яндекс</h2>
          <p className="text-muted-foreground">
            {errorMsg || status}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default YandexCallback;