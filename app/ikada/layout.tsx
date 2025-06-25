import { ReactNode } from 'react'
import { PublicNavbar } from '@/components/public-navbar'
import PublicFooter from '../../components/public-footer'
import { Container } from '@/components/container'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicNavbar />
      <main className="flex-1 pt-20 pb-24 md:pb-8">
        <Container>{children}</Container>
      </main>
      <PublicFooter className="hidden md:block" />
    </div>
  )
} 