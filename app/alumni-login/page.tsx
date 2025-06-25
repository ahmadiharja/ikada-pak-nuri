"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicNavbar } from '@/components/public-navbar'
import { Home, Users, Store, Calendar as CalendarIcon, Phone } from "lucide-react";

export default function AlumniLoginPage() {
  const [loginField, setLoginField] = useState(""); // No HP atau Username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Jika alumni sudah login, redirect ke dashboard
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('alumni_token')
      if (token) {
        router.replace('/alumni/dashboard')
        return
      }
      if (document.cookie.split(';').some(c => c.trim().startsWith('alumni_token='))) {
        router.replace('/alumni/dashboard')
        return
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginField || !password) {
      setError("No HP/Username dan password wajib diisi.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch('/api/auth/alumni-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginField: loginField.trim(),
          password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Simpan token atau session
        localStorage.setItem('alumni_token', data.token);
        localStorage.setItem('alumni_data', JSON.stringify(data.alumni));
        // Set alumni_token ke cookie agar bisa dibaca middleware
        document.cookie = `alumni_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        setSuccess("Login berhasil! Anda akan dialihkan ke dashboard alumni...");
        setTimeout(() => {
          window.location.href = '/alumni/dashboard';
        }, 1200);
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <PublicNavbar />
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 mt-8 mb-24">
        <h1 className="text-2xl font-bold mb-6 text-center">Login Alumni</h1>
          {success && <div className="text-green-600 text-sm mb-2 text-center">{success}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">No HP atau Username</label>
            <input
              type="text"
              placeholder="Masukkan no HP atau username"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={loginField}
              onChange={e => setLoginField(e.target.value)}
              required
                disabled={isLoading || !!success}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Masukkan password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
                disabled={isLoading || !!success}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
              disabled={isLoading || !!success}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sedang Login...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          Belum punya akun alumni?{' '}
          <Link href="/alumni-register" className="text-green-600 hover:underline font-semibold">
            Daftar Alumni
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}