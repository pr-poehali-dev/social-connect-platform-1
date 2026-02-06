import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const mainPages = [
  { path: '/dating', name: 'Знакомства' },
  { path: '/ads', name: 'LIVE' },
  { path: '/services', name: 'Услуги' },
  { path: '/events', name: 'Мероприятия' },
];

export const usePageSwipe = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 80;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = mainPages.findIndex(page => page.path === location.pathname);
    
    if (currentIndex === -1) {
      setIsSwiping(false);
      return;
    }

    if (isLeftSwipe && currentIndex < mainPages.length - 1) {
      navigate(mainPages[currentIndex + 1].path);
    } else if (isRightSwipe && currentIndex > 0) {
      navigate(mainPages[currentIndex - 1].path);
    }

    setTouchStart(0);
    setTouchEnd(0);
    setIsSwiping(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', onTouchStart);
    container.addEventListener('touchmove', onTouchMove);
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [touchStart, touchEnd, location.pathname]);

  return { containerRef, isSwiping };
};
