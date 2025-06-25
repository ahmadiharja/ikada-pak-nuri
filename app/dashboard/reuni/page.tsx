"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Reuni2026AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !session?.user || session.user.role !== "PUSAT") {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || !session?.user || session.user.role !== "PUSAT") {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Editor Halaman Reuni 2026</h1>
      <p>React Bricks has been removed. This page content needs to be re-implemented.</p>
    </div>
  );
}