"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import { PublicNavbar } from '@/components/public-navbar'
import { PublicFooter } from '@/components/public-footer'
import { RegionSelector } from '@/components/ui/region-selector'
import { useRouter } from "next/navigation";

const pendidikanEnum = [
  "SD/MI", "SMP/MTs", "SMA/MA/SMK", "D1", "D2", "D3", "S1", "S2", "S3", "Lainnya"
];
const statusPernikahanEnum = [
  "BELUM_MENIKAH", "MENIKAH", "CERAI_HIDUP", "CERAI_MATI"
];
const penghasilanEnum = [
  "KURANG_1_JUTA", "SATU_3_JUTA", "TIGA_5_JUTA", "LIMA_10_JUTA", "LEBIH_10_JUTA"
];

export default function AlumniRegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    username: "",
    tahunMasuk: "",
    tahunKeluar: "",
    asalDaerah: "",
    tempatLahir: "",
    tanggalLahir: "",
    statusPernikahan: "",
    jumlahAnak: "",
    pendidikanTerakhir: "",
    pendidikanCustom: "",
    pekerjaan: "",
    penghasilanBulan: "",
    provinsi: "",
    provinsiId: "",
    kabupaten: "",
    kabupatenId: "",
    kecamatan: "",
    kecamatanId: "",
    desa: "",
    desaId: "",
    namaJalan: "",
    rt: "",
    rw: "",
    profilePhoto: undefined as File | undefined,
    syubiyahId: "",
    mustahiqId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [syubiyahs, setSyubiyahs] = useState<any[]>([]);
  const [mustahiqs, setMustahiqs] = useState<any[]>([]);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const router = useRouter();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Helper untuk style error
  const errorInputClass = "border-red-500 outline-red-500 ring-2 ring-red-200 focus:ring-red-400 focus:outline-red-500";

  useEffect(() => {
    // Fetch syubiyah
    fetch('/api/syubiyah')
      .then(res => res.json())
      .then(data => setSyubiyahs(data.syubiyah || []));
    // Fetch mustahiq
    fetch('/api/mustahiq')
      .then(res => res.json())
      .then(data => setMustahiqs(Array.isArray(data) ? data : []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, profilePhoto: e.target.files[0] });
    }
  };

  const handleRegionChange = (region: any) => {
    setForm({
      ...form,
      provinsi: region.provinsi,
      provinsiId: region.provinsiId,
      kabupaten: region.kabupaten,
      kabupatenId: region.kabupatenId,
      kecamatan: region.kecamatan,
      kecamatanId: region.kecamatanId,
      desa: region.desa,
      desaId: region.desaId,
    });
  };

  const handleEmailBlur = async () => {
    setEmailError("");
    if (!form.email) return;
    const res = await fetch(`/api/alumni?email=${encodeURIComponent(form.email)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.alumni && Array.isArray(data.alumni) && data.alumni.some((a: any) => a.email === form.email)) {
        setEmailError("Email sudah digunakan oleh alumni lain.");
      }
    }
  };

  const handlePhoneBlur = async () => {
    setPhoneError("");
    if (!form.phone) return;
    const res = await fetch('/api/alumni/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: form.phone })
    });
    if (!res.ok) {
      const data = await res.json();
      setPhoneError(data.error || 'Nomor HP sudah digunakan.');
    }
  };

  const handleUsernameBlur = async () => {
    setUsernameError("");
    if (!form.username) return;
    const res = await fetch('/api/alumni/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username })
    });
    if (!res.ok) {
      const data = await res.json();
      setUsernameError(data.error || 'Username sudah digunakan.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
      setSuccess("");
    if (emailError || phoneError || usernameError) {
      setError("Periksa kembali data: ada duplikasi pada email, nomor HP, atau username.");
      return;
    }
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword || !form.provinsi || !form.kabupaten || !form.kecamatan || !form.desa || (!form.phone && !form.username)) {
      setError("Semua field wajib diisi, termasuk alamat lengkap (provinsi, kabupaten/kota, kecamatan, desa/kelurahan) dan minimal salah satu: No HP atau Username.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }
    setLoading(true);
    try {
      const resValidate = await fetch('/api/alumni/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.phone,
          username: form.username
        })
      });
      if (!resValidate.ok) {
        const data = await resValidate.json();
        setError(data.error || 'Nomor HP atau Username sudah digunakan.');
        setLoading(false);
        return;
      }
      const resEmail = await fetch(`/api/alumni?email=${encodeURIComponent(form.email)}`);
      if (resEmail.ok) {
        const data = await resEmail.json();
        if (data.alumni && Array.isArray(data.alumni) && data.alumni.some((a: any) => a.email === form.email)) {
          setError('Email sudah digunakan oleh alumni lain.');
          setLoading(false);
          return;
        }
      }
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'profilePhoto' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      const res = await fetch('/api/alumni', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Pendaftaran alumni berhasil! Silakan menunggu verifikasi admin.');
        setForm({
          fullName: '', email: '', password: '', confirmPassword: '', phone: '', username: '', tahunMasuk: '', tahunKeluar: '', asalDaerah: '', tempatLahir: '', tanggalLahir: '', statusPernikahan: '', jumlahAnak: '', pendidikanTerakhir: '', pendidikanCustom: '', pekerjaan: '', penghasilanBulan: '', provinsi: '', provinsiId: '', kabupaten: '', kabupatenId: '', kecamatan: '', kecamatanId: '', desa: '', desaId: '', namaJalan: '', rt: '', rw: '', profilePhoto: undefined, syubiyahId: '', mustahiqId: '',
        });
        setShowSuccessDialog(true);
        setTimeout(() => {
          setShowSuccessDialog(false);
          router.push("/");
        }, 10000);
      } else {
        setError(data.error || 'Gagal mendaftar alumni.');
      }
    } catch (err) {
      setError('Gagal mendaftar alumni.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicNavbar />
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Daftar Alumni</h1>
        <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                <input type="text" name="fullName" className="w-full border rounded px-3 py-2" value={form.fullName} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  className={`w-full border rounded px-3 py-2 ${emailError ? errorInputClass : ''}`}
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  required
                />
                {emailError && <div className="text-red-500 text-xs mt-1">{emailError}</div>}
              </div>
          <div>
                <label className="block text-sm font-medium mb-1">No HP *</label>
            <input
              type="text"
                  name="phone"
                  className={`w-full border rounded px-3 py-2 ${phoneError ? errorInputClass : ''}`}
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
              required
            />
                {phoneError && <div className="text-red-500 text-xs mt-1">{phoneError}</div>}
          </div>
          <div>
                <label className="block text-sm font-medium mb-1">Username *</label>
            <input
                  type="text"
                  name="username"
                  className={`w-full border rounded px-3 py-2 ${usernameError ? errorInputClass : ''}`}
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleUsernameBlur}
              required
            />
                {usernameError && <div className="text-red-500 text-xs mt-1">{usernameError}</div>}
          </div>
          <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
            <input
              type="password"
                  name="password"
                  className={`w-full border rounded px-3 py-2 ${(form.password && form.confirmPassword && form.password !== form.confirmPassword) ? errorInputClass : ''}`}
                  value={form.password}
                  onChange={handleChange}
              required
            />
          </div>
          <div>
                <label className="block text-sm font-medium mb-1">Konfirmasi Password *</label>
            <input
              type="password"
                  name="confirmPassword"
                  className={`w-full border rounded px-3 py-2 ${(form.password && form.confirmPassword && form.password !== form.confirmPassword) ? errorInputClass : ''}`}
                  value={form.confirmPassword}
                  onChange={handleChange}
              required
            />
                {(form.password && form.confirmPassword && form.password !== form.confirmPassword) && (
                  <div className="text-red-500 text-xs mt-1">Password dan konfirmasi password tidak sama.</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tahun Masuk</label>
                <input type="number" name="tahunMasuk" className="w-full border rounded px-3 py-2" value={form.tahunMasuk} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tahun Keluar</label>
                <input type="number" name="tahunKeluar" className="w-full border rounded px-3 py-2" value={form.tahunKeluar} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Asal Daerah</label>
                <input type="text" name="asalDaerah" className="w-full border rounded px-3 py-2" value={form.asalDaerah} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                <input type="text" name="tempatLahir" className="w-full border rounded px-3 py-2" value={form.tempatLahir} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                <input type="date" name="tanggalLahir" className="w-full border rounded px-3 py-2" value={form.tanggalLahir} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status Pernikahan</label>
                <select name="statusPernikahan" className="w-full border rounded px-3 py-2" value={form.statusPernikahan} onChange={handleChange}>
                  <option value="">Pilih Status</option>
                  {statusPernikahanEnum.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jumlah Anak</label>
                <input type="number" name="jumlahAnak" className="w-full border rounded px-3 py-2" value={form.jumlahAnak} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pendidikan Terakhir</label>
                <select name="pendidikanTerakhir" className="w-full border rounded px-3 py-2" value={form.pendidikanTerakhir} onChange={handleChange}>
                  <option value="">Pilih Pendidikan</option>
                  {pendidikanEnum.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pekerjaan</label>
                <input type="text" name="pekerjaan" className="w-full border rounded px-3 py-2" value={form.pekerjaan} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Penghasilan Bulanan</label>
                <select name="penghasilanBulan" className="w-full border rounded px-3 py-2" value={form.penghasilanBulan} onChange={handleChange}>
                  <option value="">Pilih Penghasilan</option>
                  {penghasilanEnum.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Alamat Lengkap *</label>
                <RegionSelector
                  initialData={{
                    provinsi: form.provinsi,
                    provinsiId: form.provinsiId,
                    kabupaten: form.kabupaten,
                    kabupatenId: form.kabupatenId,
                    kecamatan: form.kecamatan,
                    kecamatanId: form.kecamatanId,
                    desa: form.desa,
                    desaId: form.desaId,
                  }}
                  onRegionChange={handleRegionChange}
                  showKecamatan={true}
                  showDesa={true}
                  required={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama Jalan</label>
                <input type="text" name="namaJalan" className="w-full border rounded px-3 py-2" value={form.namaJalan} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RT</label>
                <input type="text" name="rt" className="w-full border rounded px-3 py-2" value={form.rt} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RW</label>
                <input type="text" name="rw" className="w-full border rounded px-3 py-2" value={form.rw} onChange={handleChange} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Foto Profil</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Syubiyah</label>
                <select
                  name="syubiyahId"
                  className="w-full border rounded px-3 py-2"
                  value={form.syubiyahId}
                  onChange={handleChange}
                >
                  <option value="">Pilih Syubiyah (opsional)</option>
                  {syubiyahs.map((syubiyah: any) => (
                    <option key={syubiyah.id} value={syubiyah.id}>{syubiyah.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mustahiq</label>
                <select
                  name="mustahiqId"
                  className="w-full border rounded px-3 py-2"
                  value={form.mustahiqId}
                  onChange={handleChange}
                >
                  <option value="">Pilih Mustahiq (opsional)</option>
                  {mustahiqs.map((mustahiq: any) => (
                    <option key={mustahiq.id} value={mustahiq.id}>{mustahiq.name}</option>
                  ))}
                </select>
              </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
              disabled={loading}
          >
              {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          Sudah punya akun alumni?{' '}
          <Link href="/alumni-login" className="text-green-600 hover:underline font-semibold">
            Login Alumni
          </Link>
        </div>
      </div>
      </div>
      <PublicFooter />
      {/* Dialog sukses registrasi */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" /></svg>
            <h2 className="text-xl font-bold mb-2 text-center">Registrasi Berhasil!</h2>
            <p className="text-center mb-4">Pendaftaran alumni telah selesai.<br/>Mohon menunggu status Anda diverifikasi oleh admin.<br/>Anda akan diarahkan ke halaman utama dalam 10 detik.</p>
            <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={() => { setShowSuccessDialog(false); router.push("/"); }}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}