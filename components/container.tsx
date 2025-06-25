import { ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
} 