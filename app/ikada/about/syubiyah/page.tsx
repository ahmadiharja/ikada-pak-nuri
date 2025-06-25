"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, User2 } from "lucide-react";

interface Syubiyah {
  id: string;
  name: string;
  provinsi: string;
  kabupaten: string;
  penanggungJawab?: string;
  noHpPenanggungJawab?: string;
}

export default function SyubiyahPage() {
  const [syubiyah, setSyubiyah] = useState<Syubiyah[]>([]);
  const [provinsi, setProvinsi] = useState<string>("__ALL__");
  const [kabupaten, setKabupaten] = useState<string>("__ALL__");
  const [provinsiList, setProvinsiList] = useState<string[]>([]);
  const [kabupatenList, setKabupatenList] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/syubiyah")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.syubiyah)) {
          setSyubiyah(data.syubiyah);
          setProvinsiList([
            ...new Set(data.syubiyah.map((s: Syubiyah) => String(s.provinsi)).filter(Boolean).map(String)),
          ]);
        } else {
          setSyubiyah([]);
          setProvinsiList([]);
        }
      });
  }, []);

  useEffect(() => {
    if (provinsi && provinsi !== "__ALL__") {
      setKabupatenList([
        ...new Set(
          (Array.isArray(syubiyah) ? syubiyah : []).filter((s) => s.provinsi === provinsi).map((s) => String(s.kabupaten)).filter(Boolean)
        ),
      ]);
      setKabupaten("__ALL__");
    } else {
      setKabupatenList([]);
      setKabupaten("__ALL__");
    }
  }, [provinsi, syubiyah]);

  const filtered = Array.isArray(syubiyah)
    ? syubiyah.filter((s) => {
        if (provinsi !== "__ALL__" && s.provinsi !== provinsi) return false;
        if (kabupaten !== "__ALL__" && s.kabupaten !== kabupaten) return false;
        return true;
      })
    : [];

  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-2 md:px-0 py-6 sm:py-10 animate-fade-in">
      <section className="mb-6">
        <h1 className="ikada-text-gradient text-2xl sm:text-3xl font-extrabold mb-1 text-center">Daftar Syubiyah</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-300 mb-4 text-sm sm:text-base">Temukan syubiyah di seluruh Indonesia. Gunakan filter di bawah untuk mencari berdasarkan provinsi dan kota/kabupaten.</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mb-4">
          <Select value={provinsi} onValueChange={setProvinsi}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Pilih Provinsi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">Semua Provinsi</SelectItem>
              {provinsiList.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kabupaten} onValueChange={setKabupaten} disabled={provinsi === "__ALL__"}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Pilih Kota/Kabupaten" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">Semua Kota/Kabupaten</SelectItem>
              {kabupatenList.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-zinc-500 py-10">Tidak ada syubiyah ditemukan.</div>
        )}
        {filtered.map((s) => (
          <Card key={s.id} className="flex flex-col h-full shadow-md border-emerald-100 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-1">{s.name}</CardTitle>
              <div className="text-xs text-zinc-500 mb-1">{s.provinsi} - {s.kabupaten}</div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0 pb-3">
              <div className="flex items-center gap-2 text-sm">
                <User2 className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{s.penanggungJawab || <span className="italic text-zinc-400">-</span>}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>{s.noHpPenanggungJawab || <span className="italic text-zinc-400">-</span>}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 