import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Star, Book, Heart, Award, UserCheck } from "lucide-react";

const misiList = [
  "Mempererat ukhuwah dan silaturahmi antar alumni lintas generasi dan daerah.",
  "Mengembangkan potensi dan kompetensi alumni di berbagai bidang.",
  "Menjadi wadah pengabdian sosial, dakwah, dan pendidikan bagi alumni.",
  "Menjaga dan melestarikan nilai-nilai pesantren dan ajaran Ahlussunnah wal Jama'ah.",
  "Berperan aktif dalam pembangunan umat, bangsa, dan negara."
];

const nilaiList = [
  { icon: Award, label: "Keikhlasan" },
  { icon: Star, label: "Keilmuan" },
  { icon: UserCheck, label: "Kepemimpinan" },
  { icon: Heart, label: "Kepedulian" },
  { icon: Book, label: "Tradisi Ilmu" },
  { icon: Users, label: "Kebersamaan" },
  { icon: Star, label: "Integritas" },
  { icon: Heart, label: "Pengabdian" },
];

export default function ProfileIkadaPage() {
  return (
    <div className="max-w-3xl mx-auto px-0 sm:px-0.5 md:px-0 py-6 sm:py-10 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full p-3 shadow-lg mb-2">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h1 className="ikada-text-gradient text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1">Profil IKADA Sumbersari</h1>
          <p className="text-emerald-700 dark:text-emerald-300 font-semibold text-base sm:text-lg">Ikatan Keluarga Alumni Darussalamah</p>
        </div>
        <p className="text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto text-sm sm:text-base">
          IKADA adalah wadah silaturahmi, pengembangan, dan pengabdian alumni Pondok Pesantren Darussalamah Sumbersari Kencong Kepung Kediri Jawa Timur. Bersama, kita membangun jejaring ukhuwah, menebar manfaat, dan melanjutkan perjuangan para pendiri pondok.
        </p>
      </section>

      {/* Sejarah Singkat */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sejarah Singkat IKADA</CardTitle>
        </CardHeader>
        <CardContent>
          <article className="prose dark:prose-invert prose-sm sm:prose-base">
            <p><strong>IKADA</strong> (Ikatan Keluarga Alumni Darussalamah) didirikan sebagai bentuk kecintaan dan tanggung jawab alumni terhadap kelangsungan dan kemajuan Pondok Pesantren Darussalamah Sumbersari. Lahir dari semangat kebersamaan, IKADA menjadi jembatan lintas generasi, memperkuat ukhuwah, dan menjadi motor penggerak berbagai program sosial, dakwah, dan pengembangan alumni.</p>
            <p>Pondok Pesantren Darussalamah didirikan oleh <strong>KH. Imam Faqih Asy'ari</strong>, seorang ulama kharismatik yang menanamkan nilai-nilai keikhlasan, keilmuan, dan pengabdian. Pesan beliau kepada para santri dan alumni menjadi fondasi utama IKADA:</p>
            <ol>
              <li>Kowe kudu: <strong>Taqwalloh</strong> (bertakwa kepada Allah).</li>
              <li>Kowe kudu: <strong>Nasyrul Ilmi Waddin</strong> (menyebarkan ilmu dan agama).</li>
              <li>Kowe kudu: <strong>Istiqomah Olehe Jama'ah</strong> (istiqomah dalam berjamaah).</li>
              <li>Kowe kudu: <strong>Manut Tindake Ulama' Salaf</strong> (mengikuti jejak ulama salaf).</li>
              <li>Kowe kudu: <strong>Bagusi Guru Lan Wong Tuwo Loro</strong> (berbakti pada guru dan orang tua).</li>
            </ol>
            <p>IKADA hadir sebagai wadah alumni untuk terus menebar kebaikan, menjaga tradisi, dan berkontribusi nyata bagi umat dan bangsa.</p>
          </article>
        </CardContent>
      </Card>

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><Star className="h-5 w-5" /> Visi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm sm:text-base">Menjadi organisasi alumni yang solid, inspiratif, dan kontributif dalam membangun peradaban Islam yang rahmatan lil 'alamin, serta menjadi mitra strategis pondok pesantren dalam pengembangan dakwah, pendidikan, dan sosial kemasyarakatan.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><Book className="h-5 w-5" /> Misi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {misiList.map((misi, idx) => (
                <Card key={idx} className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 shadow-none">
                  <CardContent className="py-3 px-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-200">
                    {misi}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nilai-Nilai IKADA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-8">
        {nilaiList.map((nilai, idx) => (
          <Card key={idx} className="flex flex-col items-center py-6 px-2 text-center">
            <div className="flex justify-center mb-2">
              <nilai.icon className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="font-semibold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">{nilai.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
} 