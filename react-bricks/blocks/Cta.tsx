import { types } from 'react-bricks';

const Cta: types.Brick = ({ text }) => (
  <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-10 md:p-16 text-center text-white relative overflow-hidden">
    <h2 className="text-3xl md:text-4xl font-extrabold drop-shadow-lg mb-4">{text.title}</h2>
    <p className="text-lg max-w-2xl mx-auto mb-6 font-medium">{text.body}</p>
    <a href="#" className="inline-block bg-white text-emerald-700 font-bold rounded-full shadow-xl text-lg px-12 py-7 mt-4 transition-transform hover:scale-105 hover:bg-emerald-50/90 border-2 border-emerald-200">{text.buttonText}</a>
  </section>
);

Cta.schema = {
  name: 'cta',
  label: 'Call to Action',
  getDefaultProps: () => ({
    text: {
      title: 'Bergabunglah dalam Reuni Bersejarah!',
      body: 'Amankan tempat Anda sekarang dan jadilah bagian dari sejarah. Momen ini terlalu berharga untuk dilewatkan.',
      buttonText: 'Daftar Sekarang',
    },
  }),
  sideEditProps: [
    {
      name: 'title',
      label: 'Judul',
      type: types.SideEditPropType.Text,
      defaultValue: 'Bergabunglah dalam Reuni Bersejarah!',
    },
    {
      name: 'body',
      label: 'Isi',
      type: types.SideEditPropType.Textarea,
      defaultValue: 'Amankan tempat Anda sekarang dan jadilah bagian dari sejarah. Momen ini terlalu berharga untuk dilewatkan.',
    },
    {
      name: 'buttonText',
      label: 'Teks Tombol',
      type: types.SideEditPropType.Text,
      defaultValue: 'Daftar Sekarang',
    },
  ],
};

export default Cta; 