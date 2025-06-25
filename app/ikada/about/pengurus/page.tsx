import { OrganizationChart } from "@/components/organization-chart";

export default function PengurusIkadaPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-fade-in">
      <h1 className="ikada-text-gradient text-3xl font-bold mb-2">Struktur & Pengurus IKADA</h1>
      <p className="mb-8 text-muted-foreground text-lg">Susunan personalia pengurus IKATAN KELUARGA ALUMNI DARUSSALAMAH (IKADA) periode 2022–2026 M / 1444–1448 H. Tersusun secara hierarkis dan mudah dipindai.</p>
      <OrganizationChart />
    </div>
  );
} 