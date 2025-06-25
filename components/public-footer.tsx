import Link from 'next/link'
import { prisma } from '@/lib/prisma'

interface PublicFooterProps {
  className?: string;
}

export default async function PublicFooter({ className = '' }: PublicFooterProps) {
  let config: any = null;
  try {
    config = await prisma.generalConfig.findFirst();
  } catch {}
  const footerLinks = config?.footerLinks?.length ? config.footerLinks : [
    { label: 'Tentang Kami', url: '/ikada/about' },
    { label: 'Blog', url: '/ikada/blog' },
    { label: 'Event', url: '/ikada/events' },
    { label: 'Donasi', url: '/ikada/donasi' },
    { label: 'Marketplace', url: '/ikada/marketplace' },
  ];
  const footerSocial = config?.footerSocial || { instagram: '', facebook: '', youtube: '' };
  const copyright = config?.footerCopyright || `© ${new Date().getFullYear()} IKADA. All rights reserved.`;

  return (
    <footer className={`bg-green-900 text-white mt-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 md:gap-0 justify-between items-center">
        <div className="flex flex-col items-center md:items-start">
          <img src="/ikada.png" alt="IKADA" className="h-10 w-10 mb-2" />
          <span className="font-bold text-lg">IKADA</span>
          <span className="text-sm mt-1">Ikatan Alumni Pondok Darussalam Sumbersari</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
          <div className="flex flex-col gap-1 text-sm">
            {footerLinks.map((link: any, idx: number) => (
              <Link key={idx} href={link.url} className="hover:underline">{link.label}</Link>
            ))}
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            {footerSocial.instagram && (
              <a href={footerSocial.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-green-300">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
            {footerSocial.facebook && (
              <a href={footerSocial.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-green-300">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {footerSocial.youtube && (
              <a href={footerSocial.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-green-300">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42A2.78 2.78 0 0 0 20.7 4.6C19.13 4 12 4 12 4s-7.13 0-8.7.6A2.78 2.78 0 0 0 1.46 6.42 29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.3 19.4c1.57.6 8.7.6 8.7.6s7.13 0 8.7-.6a2.78 2.78 0 0 0 1.84-1.82A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="text-center text-xs py-2 bg-green-950">{copyright}</div>
    </footer>
  )
} 