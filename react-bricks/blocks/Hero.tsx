import { types } from 'react-bricks';

const Hero: types.Brick = ({ text }) => (
  <section className="py-12 text-center bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 text-white">
    <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{text.title}</h1>
    <p className="text-lg md:text-2xl mb-2">{text.subtitle}</p>
  </section>
);

Hero.schema = {
  name: 'hero',
  label: 'Hero Section',
  getDefaultProps: () => ({
    text: {
      title: 'REUNI AKBAR & REFORMASI IKADA NASIONAL 2026',
      subtitle: 'Merajut Silaturahmi, Menguatkan Ukhuwah, Membangun Sinergi',
    },
  }),
  sideEditProps: [
    {
      name: 'title',
      label: 'Judul',
      type: types.SideEditPropType.Text,
      defaultValue: 'REUNI AKBAR & REFORMASI IKADA NASIONAL 2026',
    },
    {
      name: 'subtitle',
      label: 'Subjudul',
      type: types.SideEditPropType.Text,
      defaultValue: 'Merajut Silaturahmi, Menguatkan Ukhuwah, Membangun Sinergi',
    },
  ],
};

export default Hero; 