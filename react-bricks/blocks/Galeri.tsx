import { types } from 'react-bricks';

const Galeri: types.Brick = ({ images }) => (
  <section className="text-center mb-20">
    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-emerald-700 dark:text-emerald-300 drop-shadow">Galeri Kenangan</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {(images || []).map((img, idx) => (
        <div key={idx} className="relative aspect-square overflow-hidden rounded-2xl shadow-xl group border-2 border-emerald-100 dark:border-emerald-900 bg-white/60 dark:bg-zinc-900/60">
          <img src={img.url} alt={img.alt} className="object-cover w-full h-full" />
        </div>
      ))}
    </div>
  </section>
);

Galeri.schema = {
  name: 'galeri',
  label: 'Galeri',
  getDefaultProps: () => ({
    images: [
      { url: '/placeholder.jpg', alt: 'Reuni 1' },
      { url: '/placeholder.jpg', alt: 'Reuni 2' },
    ],
  }),
  sideEditProps: [
    {
      name: 'images',
      label: 'Gambar',
      type: types.SideEditPropType.Repeater,
      itemType: {
        url: { type: types.SideEditPropType.Text, label: 'URL' },
        alt: { type: types.SideEditPropType.Text, label: 'Alt' },
      },
      defaultItem: { url: '/placeholder.jpg', alt: 'Reuni' },
    },
  ],
};

export default Galeri; 