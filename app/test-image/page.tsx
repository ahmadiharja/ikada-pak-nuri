'use client';

import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function TestImagePage() {
  const testImages = [
    {
      name: 'Zainab (Avatar)',
      component: (
        <Avatar className="h-20 w-20">
          <AvatarImage src="/foto_alumni/zainab_binti_jahsy_ramadhani.jpg" />
          <AvatarFallback>ZB</AvatarFallback>
        </Avatar>
      )
    },
    {
      name: 'Zainab (Next Image)',
      component: (
        <Image
          src="/foto_alumni/zainab_binti_jahsy_ramadhani.jpg"
          alt="Zainab"
          width={80}
          height={80}
          className="rounded-full"
        />
      )
    },
    {
      name: 'Ahmadi (Avatar)',
      component: (
        <Avatar className="h-20 w-20">
          <AvatarImage src="/foto_alumni/ahmadi_harja.jpg" />
          <AvatarFallback>AH</AvatarFallback>
        </Avatar>
      )
    },
    {
      name: 'Placeholder (Avatar)',
      component: (
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>PH</AvatarFallback>
        </Avatar>
      )
    },
    {
      name: 'Ikada Logo (Next Image)',
      component: (
        <Image
          src="/ikada.png"
          alt="Ikada"
          width={80}
          height={80}
        />
      )
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Image Loading</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testImages.map((test, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="font-medium mb-3">{test.name}</h3>
            <div className="flex justify-center">
              {test.component}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Direct Image URLs</h2>
        <div className="space-y-2">
          <p><a href="/foto_alumni/zainab_binti_jahsy_ramadhani.jpg" target="_blank" className="text-blue-600 hover:underline">/foto_alumni/zainab_binti_jahsy_ramadhani.jpg</a></p>
          <p><a href="/foto_alumni/ahmadi_harja.jpg" target="_blank" className="text-blue-600 hover:underline">/foto_alumni/ahmadi_harja.jpg</a></p>
          <p><a href="/placeholder-user.jpg" target="_blank" className="text-blue-600 hover:underline">/placeholder-user.jpg</a></p>
          <p><a href="/ikada.png" target="_blank" className="text-blue-600 hover:underline">/ikada.png</a></p>
        </div>
      </div>
    </div>
  );
}