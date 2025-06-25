import Hero from './react-bricks/blocks/Hero';
import About from './react-bricks/blocks/About';
import Jadwal from './react-bricks/blocks/Jadwal';
import Galeri from './react-bricks/blocks/Galeri';
import Cta from './react-bricks/blocks/Cta';

const config = {
  appId: 'reuni-2026',
  apiKey: 'project-api-key',
  pageTypes: [
    {
      name: 'reuni2026',
      label: 'Halaman Reuni 2026',
      pluralName: 'Halaman-halaman Reuni 2026',
      isDefault: true,
      allowedBlockTypes: ['hero', 'about', 'jadwal', 'galeri', 'cta'],
      defaultBlocks: ['hero', 'about', 'jadwal', 'galeri', 'cta'],
    },
  ],
  blockTypes: [
    { name: 'hero', label: 'Hero Section', component: Hero },
    { name: 'about', label: 'About Section', component: About },
    { name: 'jadwal', label: 'Jadwal Acara', component: Jadwal },
    { name: 'galeri', label: 'Galeri', component: Galeri },
    { name: 'cta', label: 'Call to Action', component: Cta },
  ],
};

export default config; 