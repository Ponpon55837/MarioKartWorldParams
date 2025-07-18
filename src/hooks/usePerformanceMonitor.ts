import { useEffect, useRef } from 'react';

/**
 * 性能監控 Hook
 * 用於監控組件的渲染性能
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      
      console.log(`[Performance] ${componentName} 渲染次數: ${renderCount.current}, 耗時: ${renderTime.toFixed(2)}ms`);
    }
  });

  useEffect(() => {
    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
    logRenderInfo: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} 總渲染次數: ${renderCount.current}`);
      }
    }
  };
}

/**
 * 記憶體使用監控 Hook
 */
export function useMemoryMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memoryInfo = (performance as any).memory;
      console.log(`[Memory] 已使用: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`[Memory] 總計: ${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }, []);
}

/**
 * 卷軸性能監控 Hook
 */
export function useScrollPerformance() {
  useEffect(() => {
    let isScrolling = false;
    let scrollStartTime = 0;
    
    const handleScrollStart = () => {
      if (!isScrolling) {
        isScrolling = true;
        scrollStartTime = performance.now();
      }
    };
    
    const handleScrollEnd = () => {
      if (isScrolling) {
        isScrolling = false;
        const scrollDuration = performance.now() - scrollStartTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Scroll] 滾動持續時間: ${scrollDuration.toFixed(2)}ms`);
        }
      }
    };
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      handleScrollStart();
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);
}
