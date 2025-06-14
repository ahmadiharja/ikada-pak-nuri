import useSWR from 'swr'

interface FeaturedPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: string
  author: {
    id: string
    name: string
  }
  category: {
    id: string
    name: string
    color: string
  } | null
  featured: boolean
  featuredOrder: number | null
  featuredImage: string | null
}

interface FeaturedPostsResponse {
  featuredPosts: FeaturedPost[]
}

const fetcher = async (url: string): Promise<FeaturedPostsResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch featured posts')
  }
  return response.json()
}

export function useFeaturedPosts(limit: number = 5) {
  const { data, error, mutate } = useSWR<FeaturedPostsResponse>(
    `/api/news/featured?limit=${limit}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh setiap 30 detik
      revalidateOnFocus: true, // Refresh ketika window focus
      revalidateOnReconnect: true, // Refresh ketika reconnect
      dedupingInterval: 10000, // Dedupe requests dalam 10 detik
    }
  )

  return {
    featuredPosts: data?.featuredPosts || [],
    isLoading: !error && !data,
    isError: error,
    mutate, // Untuk manual refresh
  }
}