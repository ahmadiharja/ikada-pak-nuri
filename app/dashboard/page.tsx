import { DashboardOverview } from "@/components/dashboard-overview"

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard IKADA</h1>
        <p className="text-muted-foreground">
          Selamat datang di dashboard Ikatan Alumni Pondok Darussalam Sumbersari
        </p>
      </div>
      <DashboardOverview />
    </div>
  )
}
