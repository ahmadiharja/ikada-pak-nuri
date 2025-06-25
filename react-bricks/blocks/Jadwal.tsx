import { types } from 'react-bricks';

const Jadwal: types.Brick = ({ text }) => (
  <section className="mb-20">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-emerald-700 dark:text-emerald-300 drop-shadow">Rangkaian Acara</h2>
    <div className="text-center">{text.schedule}</div>
  </section>
);

Jadwal.schema = {
  name: 'jadwal',
  label: 'Jadwal Acara',
  getDefaultProps: () => ({
    text: {
      schedule: 'Jumat: Registrasi, Sabtu: Bazar, Minggu: Puncak Acara',
    },
  }),
  sideEditProps: [
    {
      name: 'schedule',
      label: 'Jadwal',
      type: types.SideEditPropType.Textarea,
      defaultValue: 'Jumat: Registrasi, Sabtu: Bazar, Minggu: Puncak Acara',
    },
  ],
};

export default Jadwal; 