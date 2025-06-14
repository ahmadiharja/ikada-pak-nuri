'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('An error occurred while fetching the data.')
  }
  return response.json()
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        refreshInterval: 30000, // Refresh setiap 30 detik
        revalidateOnFocus: true, // Refresh ketika window focus
        revalidateOnReconnect: true, // Refresh ketika reconnect
        dedupingInterval: 10000, // Dedupe requests dalam 10 detik
        errorRetryCount: 3, // Retry 3 kali jika error
        errorRetryInterval: 5000, // Retry setiap 5 detik
      }}
    >
      {children}
    </SWRConfig>
  )
}