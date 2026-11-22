// Counts up from 0 to the value when the number scrolls into view.
// People who turn off animations in their system settings see the final number at once.
import { useState, useEffect, useRef } from 'react';

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function AnimatedNumber({ value, duration = 900 }) {
  const [shown, setShown] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setShown(value);
      return undefined;
    }

    let frame;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // fast start, slow end
        setShown(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return <span ref={ref}>{shown}</span>;
}
