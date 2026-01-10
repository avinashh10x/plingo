import { useState, useMemo } from "react";

interface UsePaginationProps {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  range: { from: number; to: number };
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
  canNext: boolean;
  canPrev: boolean;
}

export function usePagination({
  initialPage = 1,
  pageSize = 10,
  totalItems = 0,
}: UsePaginationProps = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Calculate Supabase range (0-indexed)
  const range = useMemo(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    return { from, to };
  }, [page, pageSize]);

  const canNext = page < totalPages;
  const canPrev = page > 1;

  const nextPage = () => {
    if (canNext) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (canPrev) setPage((p) => p - 1);
  };

  return {
    page,
    pageSize,
    totalPages,
    range,
    nextPage,
    prevPage,
    setPage,
    canNext,
    canPrev,
  };
}

// Helper hook for infinite scroll element detection
import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  rootMargin?: string;
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading = false,
  rootMargin = "100px",
}: UseInfiniteScrollProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { rootMargin }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore, rootMargin]
  );

  return lastElementRef;
}
