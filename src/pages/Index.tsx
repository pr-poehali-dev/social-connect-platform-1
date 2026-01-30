import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';

const Index = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/profile', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return null;
};

export default Index;