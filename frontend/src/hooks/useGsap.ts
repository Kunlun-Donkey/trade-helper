import { useEffect, useRef, RefObject } from 'react';
import gsap from 'gsap';
import { isAnimationsEnabled } from '@/utils/gsap';

// 页面入场动画 hook
export const usePageEnter = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !isAnimationsEnabled()) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, []);

  return ref;
};

// 卡片悬浮 hook
export const useCardHover = <T extends HTMLElement>(): RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isAnimationsEnabled()) return;

    const onEnter = () => {
      gsap.to(el, { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', duration: 0.3, ease: 'power2.out' });
    };
    const onLeave = () => {
      gsap.to(el, { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', duration: 0.3, ease: 'power2.out' });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return ref;
};

// 数字滚动 hook
export const useCountUp = (target: number, deps: any[] = []) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || !isAnimationsEnabled() || target === 0) {
      if (ref.current) ref.current.textContent = target.toLocaleString();
      return;
    }

    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.value).toLocaleString();
        }
      },
    });
  }, deps);

  return ref;
};

// 列表入场 hook
export const useListEnter = (deps: any[] = []) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !isAnimationsEnabled()) return;
    const items = containerRef.current.querySelectorAll('.gsap-list-item');
    if (items.length === 0) return;

    gsap.fromTo(
      items,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
    );
  }, deps);

  return containerRef;
};

// 统计卡片入场 hook
export const useStatCardsEnter = (deps: any[] = []) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !isAnimationsEnabled()) return;
    const cards = containerRef.current.querySelectorAll('.gsap-stat-card');
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, deps);

  return containerRef;
};

// 按钮点击回弹 hook
export const useButtonClick = <T extends HTMLElement>(): RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isAnimationsEnabled()) return;

    const onDown = () => gsap.to(el, { scale: 0.96, duration: 0.1 });
    const onUp = () => gsap.to(el, { scale: 1, duration: 0.2, ease: 'back.out(1.7)' });

    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      el.removeEventListener('mouseup', onUp);
    };
  }, []);

  return ref;
};
