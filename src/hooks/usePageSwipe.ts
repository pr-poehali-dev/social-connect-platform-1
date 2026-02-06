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
  const touchStartRef = useRef(0);
  const touchCurrentRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 80;

  const onTouchStart = (e: TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
    touchCurrentRef.current = e.targetTouches[0].clientX;
    setIsDragging(true);
  };

  const onTouchMove = (e: TouchEvent) => {
    const current = e.targetTouches[0].clientX;
    touchCurrentRef.current = current;
    
    const diff = current - touchStartRef.current;
    const currentIndex = mainPages.findIndex(page => page.path === location.pathname);
    
    if ((diff > 0 && currentIndex === 0) || (diff < 0 && currentIndex === mainPages.length - 1)) {
      setSwipeOffset(diff * 0.3);
    } else {
      setSwipeOffset(diff);
    }
  };

  const onTouchEnd = () => {
    const distance = touchStartRef.current - touchCurrentRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = mainPages.findIndex(page => page.path === location.pathname);
    
    if (currentIndex !== -1) {
      if (isLeftSwipe && currentIndex < mainPages.length - 1) {
        navigate(mainPages[currentIndex + 1].path);
      } else if (isRightSwipe && currentIndex > 0) {
        navigate(mainPages[currentIndex - 1].path);
      }
    }

    touchStartRef.current = 0;
    touchCurrentRef.current = 0;
    setIsDragging(false);
    setSwipeOffset(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [location.pathname]);

  return { 
    containerRef, 
    isDragging, 
    swipeOffset,
    currentPageIndex: mainPages.findIndex(page => page.path === location.pathname)
  };
};