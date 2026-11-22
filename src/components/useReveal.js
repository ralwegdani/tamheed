// Adds the class "is-visible" when an element scrolls into view.
// CSS uses it to fade sections in once. Used on the home page.
import { useEffect, useRef } from 'react';

export default function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (!('IntersectionObserver' in window)) {
      element.classList.add('is-visible');
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
