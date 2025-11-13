'use client';

import { useRef, useCallback } from 'react';

const useInfiniteScroll = (callback: () => void, isLoading: boolean) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const loaderRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback();
      }
    });

    if (node) observer.current.observe(node);
  }, [callback, isLoading]);

  return loaderRef;
};

export default useInfiniteScroll;