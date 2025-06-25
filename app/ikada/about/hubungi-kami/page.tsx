import { Mail, MapPin, Phone } from "lucide-react";

export default function HubungiKamiPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in">
      <h1 className="ikada-text-gradient text-3xl font-bold mb-8">Hubungi Kami</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Kolom Kiri: Info Kontak */}
        <div className="flex-1 flex flex-col gap-6 justify-center">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-xl">
              <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <div className="font-semibold text-lg mb-1">Alamat</div>
              <div>Rumah Alumni<br />Sumbersari Kencong Kepung Kediri<br />64201</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-xl">
              <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <div className="font-semibold text-lg mb-1">Email</div>
              <a href="mailto:ikadasumbersari@gmail.com" className="text-emerald-700 dark:text-emerald-300 underline">ikadasumbersari@gmail.com</a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-xl">
              <Phone className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <div className="font-semibold text-lg mb-1">No. HP/WA</div>
              <a href="https://wa.me/6281234567890" className="text-emerald-700 dark:text-emerald-300 underline">+62 812-3456-7890</a>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-4">Silakan hubungi kami melalui email atau WhatsApp untuk pertanyaan, kerjasama, atau informasi lebih lanjut tentang IKADA Sumbersari.</div>
        </div>
        {/* Kolom Kanan: Map */}
        <div className="flex-1 min-w-[300px] max-w-xl rounded-xl overflow-hidden shadow-lg border h-[350px]">
          <iframe
            title="Lokasi Rumah Alumni IKADA"
            src="https://www.google.com/maps?q=-7.782664,112.049968&hl=id&z=16&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
} 