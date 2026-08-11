import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // If navigating to home with a ?section= query param, StorePage will handle section scrolling
    const params = new URLSearchParams(search);
    if (pathname === '/' && params.has('section')) {
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};
