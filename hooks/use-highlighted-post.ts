import useSWR from 'swr';

interface HighlightedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  viewCount: number;
  author: {
    name: string;
  };
  category: {
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

interface UseHighlightedPostReturn {
  highlightedPost: HighlightedPost | null;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch highlighted post');
  }
  return response.json();
};

export function useHighlightedPost(): UseHighlightedPostReturn {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/news/highlighted',
    fetcher,
    {
      refreshInterval: 30000, // Refresh setiap 30 detik
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Dedupe request dalam 10 detik
    }
  );

  return {
    highlightedPost: data || null,
    isLoading,
    error,
    mutate,
  };
}