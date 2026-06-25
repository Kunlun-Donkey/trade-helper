import gsap from 'gsap';

// 全局动画开关
let animationsEnabled = true;

export const setAnimationsEnabled = (enabled: boolean) => {
  animationsEnabled = enabled;
};

export const isAnimationsEnabled = () => animationsEnabled;

// 页面入场动画：渐入 + 微上移
export const pageEnter = (element: HTMLElement | string) => {
  if (!animationsEnabled) return;
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );
};

// 卡片悬浮效果
export const cardHover = (element: HTMLElement) => {
  if (!animationsEnabled) return;
  const enter = () => {
    gsap.to(element, { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', duration: 0.3, ease: 'power2.out' });
  };
  const leave = () => {
    gsap.to(element, { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', duration: 0.3, ease: 'power2.out' });
  };
  element.addEventListener('mouseenter', enter);
  element.addEventListener('mouseleave', leave);
  return () => {
    element.removeEventListener('mouseenter', enter);
    element.removeEventListener('mouseleave', leave);
  };
};

// 按钮点击回弹
export const buttonClick = (element: HTMLElement) => {
  if (!animationsEnabled) return;
  element.addEventListener('mousedown', () => {
    gsap.to(element, { scale: 0.96, duration: 0.1 });
  });
  element.addEventListener('mouseup', () => {
    gsap.to(element, { scale: 1, duration: 0.2, ease: 'back.out(1.7)' });
  });
};

// 数字滚动动画 (0 → 目标值)
export const countUp = (element: HTMLElement, target: number, duration = 1.5) => {
  if (!animationsEnabled) return;
  const obj = { value: 0 };
  gsap.to(obj, {
    value: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toLocaleString();
    },
  });
};

// 列表逐行入场
export const listStagger = (elements: HTMLElement[] | NodeListOf<Element>) => {
  if (!animationsEnabled) return;
  gsap.fromTo(
    elements,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
  );
};

// 弹窗动画
export const modalEnter = (element: HTMLElement) => {
  if (!animationsEnabled) return;
  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
  );
};

// 数据统计卡片动画
export const statCardEnter = (elements: HTMLElement[] | NodeListOf<Element>) => {
  if (!animationsEnabled) return;
  gsap.fromTo(
    elements,
    { opacity: 0, y: 30, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
  );
};

// 侧边栏菜单项动画
export const menuStagger = (elements: HTMLElement[] | NodeListOf<Element>) => {
  if (!animationsEnabled) return;
  gsap.fromTo(
    elements,
    { opacity: 0, x: -15 },
    { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
  );
};

// 进度条动画
export const progressAnimate = (element: HTMLElement, targetWidth: string) => {
  if (!animationsEnabled) return;
  gsap.fromTo(
    element,
    { width: '0%' },
    { width: targetWidth, duration: 1, ease: 'power2.out' }
  );
};

// 图表载入动画 (模拟逐帧绘制)
export const chartEnter = (element: HTMLElement | string) => {
  if (!animationsEnabled) return;
  gsap.fromTo(
    element,
    { opacity: 0, scaleY: 0.8, transformOrigin: 'bottom' },
    { opacity: 1, scaleY: 1, duration: 0.6, ease: 'power2.out' }
  );
};

// 上传进度动画
export const uploadProgress = (element: HTMLElement, progress: number) => {
  if (!animationsEnabled) return;
  gsap.to(element, { width: `${progress}%`, duration: 0.3, ease: 'power2.out' });
};
