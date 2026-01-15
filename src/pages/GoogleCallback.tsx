import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAuth } from '@/components/extensions/google-auth/useGoogleAuth';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const GOOGLE_AUTH_URL = 'https://functions.poehali.dev/0c89453c-e2bd-44b7-b54d-2e0f885da946';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const googleAuth = useGoogleAuth({
    apiUrls: {
      authUrl: `${GOOGLE_AUTH_URL}?action=auth-url`,
      callback: `${GOOGLE_AUTH_URL}?action=callback`,
      refresh: `${GOOGLE_AUTH_URL}?action=refresh`,
      logout: `${GOOGLE_AUTH_URL}?action=logout`,
    },
  });

  useEffect(() => {
    const processCallback = async () => {
      const success = await googleAuth.handleCallback();
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#4285F4] to-[#34A853] flex items-center justify-center animate-pulse">
            <Icon name="Loader" size={36} className="text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Авторизация через Google</h2>
          <p className="text-muted-foreground">
            {googleAuth.error ? googleAuth.error : 'Обработка входа...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCallback;
