import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVkAuth } from '@/components/extensions/vk-auth/useVkAuth';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const VK_AUTH_URL = 'https://functions.poehali.dev/2494c44f-f6f6-40ff-871c-fb7e09d9702d';

const VkCallback = () => {
  const navigate = useNavigate();
  const vkAuth = useVkAuth({
    apiUrls: {
      authUrl: `${VK_AUTH_URL}?action=auth-url`,
      callback: `${VK_AUTH_URL}?action=callback`,
      refresh: `${VK_AUTH_URL}?action=refresh`,
      logout: `${VK_AUTH_URL}?action=logout`,
    },
  });

  useEffect(() => {
    const processCallback = async () => {
      console.log('[VK CALLBACK] Processing callback, URL params:', window.location.search);
      const success = await vkAuth.handleCallback();
      console.log('[VK CALLBACK] Callback result:', success);
      
      if (success) {
        console.log('[VK CALLBACK] Success! Redirecting to /dating...');
        setTimeout(() => navigate('/dating'), 1000);
      } else {
        console.log('[VK CALLBACK] Failed! Redirecting to /login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
      <Card className="max-w-md mx-auto rounded-3xl border-2 shadow-2xl">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#0077FF] to-[#0066DD] flex items-center justify-center animate-pulse">
            <Icon name="Loader" size={36} className="text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Авторизация через VK</h2>
          <p className="text-muted-foreground">
            {vkAuth.error ? vkAuth.error : 'Обработка входа...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VkCallback;