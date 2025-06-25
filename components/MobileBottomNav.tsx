"use client";
import Link from "next/link";
import { Home, Users, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState, useEffect } from "react";

// Animasi glow CSS
const glowStyle = `
  @keyframes glow {
    0% { box-shadow: 0 0 0px 0px #4ade80, 0 0 0px 0px #22d3ee; }
    50% { box-shadow: 0 0 24px 8px #4ade80, 0 0 24px 8px #22d3ee; }
    100% { box-shadow: 0 0 0px 0px #4ade80, 0 0 0px 0px #22d3ee; }
  }
`;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isAlumniLoggedIn, setIsAlumniLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let prevToken: string | boolean | null = null;
    function checkAlumniLogin() {
      const alumniToken =
        typeof window !== "undefined" &&
        (localStorage.getItem("alumni_token") ||
          (typeof document !== "undefined" &&
            document.cookie.split(";").some((c) => c.trim().startsWith("alumni_token="))));
      setIsAlumniLoggedIn(!!alumniToken);
      prevToken = alumniToken;
    }
    checkAlumniLogin();
    window.addEventListener('storage', checkAlumniLogin);
    window.addEventListener('alumni-auth-change', checkAlumniLogin);
    const interval = setInterval(() => {
      const alumniToken =
        typeof window !== "undefined" &&
        (localStorage.getItem("alumni_token") ||
          (typeof document !== "undefined" &&
            document.cookie.split(";").some((c) => c.trim().startsWith("alumni_token="))));
      if (!!alumniToken !== !!prevToken) {
        checkAlumniLogin();
      }
    }, 1000);
    return () => {
      window.removeEventListener('storage', checkAlumniLogin);
      window.removeEventListener('alumni-auth-change', checkAlumniLogin);
      clearInterval(interval);
    };
  }, [pathname]);

  // Jangan tampilkan MobileBottomNav jika logout in progress
  if (typeof window !== 'undefined' && window.localStorage.getItem('alumni_logout_in_progress') === 'true') return null;
  if (isAlumniLoggedIn === null) return null;
  if (isAlumniLoggedIn && pathname.startsWith('/alumni')) return null;
  return (
    <>
      <style>{glowStyle}</style>
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-end justify-between px-6 py-2 w-[75vw] max-w-[400px] rounded-2xl md:hidden border border-white/30 shadow-xl bg-white/60 backdrop-blur-md"
        style={{
          background: "rgba(255,255,255,0.7)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
        aria-label="Bottom Navigation"
      >
        {/* Beranda */}
        <Link href="/" className="flex flex-col items-center text-xs group">
          <Home
            className={clsx(
              "w-6 h-6 mb-1",
              pathname === "/" ? "text-emerald-500" : "text-gray-400 group-hover:text-emerald-500"
            )}
          />
          <span className={clsx("font-medium", pathname === "/" ? "text-emerald-500" : "text-gray-500")}>Beranda</span>
        </Link>

        {/* Reuni 2026 - Menu Tengah, Lingkaran & Glow */}
        <Link href="/ikada/reuni-2026" className="relative flex flex-col items-center -mt-8 z-10">
          <span
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 border-4 border-white animate-glow"
            style={{ animation: "glow 4s infinite" }}
          >
            <Users className="w-8 h-8 text-white drop-shadow" />
          </span>
          <span className="block text-center font-bold text-emerald-500 mt-1 text-sm w-full">Reuni 2026</span>
        </Link>

        {/* Login / Dashboard */}
        {isAlumniLoggedIn ? (
          <Link href="/alumni/dashboard" className="flex flex-col items-center text-xs group">
            <LogIn
              className={clsx(
                "w-6 h-6 mb-1",
                pathname.startsWith("/alumni") ? "text-emerald-500" : "text-gray-400 group-hover:text-emerald-500"
              )}
            />
            <span className={clsx("font-medium", pathname.startsWith("/alumni") ? "text-emerald-500" : "text-gray-500")}>Dashboard</span>
          </Link>
        ) : (
          <Link href="/alumni-login" className="flex flex-col items-center text-xs group">
            <LogIn
              className={clsx(
                "w-6 h-6 mb-1",
                pathname === "/alumni-login" ? "text-emerald-500" : "text-gray-400 group-hover:text-emerald-500"
              )}
            />
            <span className={clsx("font-medium", pathname === "/alumni-login" ? "text-emerald-500" : "text-gray-500")}>Login</span>
          </Link>
        )}
      </nav>
    </>
  );
}

