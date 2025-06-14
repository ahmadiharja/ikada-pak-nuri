import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthSessionProvider } from "@/components/session-provider"
import { SWRProvider } from "@/components/swr-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IKADA Sumbersari - Ikatan Alumni Pondok Darussalam",
  description:
    "Website resmi Ikatan Alumni Pondok Darussalam Sumbersari. Membangun jaringan alumni yang kuat, berbagi ilmu, dan berkontribusi untuk kemajuan umat.",
  keywords: ["IKADA", "Alumni", "Pondok Darussalam", "Sumbersari", "Jember", "Pesantren"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthSessionProvider>
          <SWRProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange={false}
              storageKey="ikada-theme"
            >
              {children}
            </ThemeProvider>
          </SWRProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
