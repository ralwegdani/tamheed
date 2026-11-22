// In a single page app the browser keeps the old scroll position when the route changes.
// This moves the page back to the top every time the path changes.
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
