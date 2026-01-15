import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYandexAuth } from '@/components/extensions/yandex-auth/useYandexAuth';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const YANDEX_AUTH_URL = 'https://functions.poehali.dev/635fdfd0-fce3-46f9-a566-18d196e6e486';

const YandexCallback = () => {
  const navigate = useNavigate();
  const yandexAuth = useYandexAuth({
    apiUrls: {
      authUrl: `${YANDEX_AUTH_URL}?action=auth-url`,
      callback: `${YANDEX_AUTH_URL}?action=callback`,
      refresh: `${YANDEX_AUTH_URL}?action=refresh`,
      logout: `${YANDEX_AUTH_URL}?action=logout`,
    },
  });

  useEffect(() => {
    const processCallback = async () => {
      const success = await yandexAuth.handleCallback();
      if (success) {
        setTimeout(() => navigate('/profile'), 1000);
      } else {
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto rounded-3xl border-2 shadow-2xl">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#FF0000] to-[#DD0000] flex items-center justify-center animate-pulse">
            <Icon name="Loader" size={36} className="text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Авторизация через Яндекс</h2>
          <p className="text-muted-foreground">
            {yandexAuth.error ? yandexAuth.error : 'Обработка входа...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default YandexCallback;
