import { types } from 'react-bricks';

const About: types.Brick = ({ text }) => (
  <section className="max-w-4xl mx-auto text-center mb-20">
    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-emerald-700 dark:text-emerald-300 drop-shadow">{text.title}</h2>
    <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">{text.body}</p>
  </section>
);

About.schema = {
  name: 'about',
  label: 'About Section',
  getDefaultProps: () => ({
    text: {
      title: 'Sebuah Panggilan untuk Pulang',
      body: 'Setelah sekian lama, mari kita kembali ke tempat di mana semuanya dimulai...'
    },
  }),
  sideEditProps: [
    {
      name: 'title',
      label: 'Judul',
      type: types.SideEditPropType.Text,
      defaultValue: 'Sebuah Panggilan untuk Pulang',
    },
    {
      name: 'body',
      label: 'Isi',
      type: types.SideEditPropType.Textarea,
      defaultValue: 'Setelah sekian lama, mari kita kembali ke tempat di mana semuanya dimulai...'
    },
  ],
};

export default About; 