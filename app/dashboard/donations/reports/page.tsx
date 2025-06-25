'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Download, TrendingUp, Users, DollarSign, Target, Calendar, Filter } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DashboardStats {
  totalDonations: number
  totalAmount: number
  totalDonors: number
  pendingTransactions: number
  approvedTransactions: number
  rejectedTransactions: number
  monthlyGrowth: number
}

interface ProgramStats {
  id: string
  title: string
  type: string
  targetAmount?: number
  currentAmount: number
  donorCount: number
  transactionCount: number
  completionPercentage: number
}

interface MonthlyData {
  month: string
  amount: number
  transactions: number
}

interface TypeDistribution {
  type: string
  amount: number
  count: number
  percentage: number
}

interface FilterState {
  programId: string
  dateFrom: string
  dateTo: string
  type: string
}

interface DonationProgram {
  id: string
  title: string
  type: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function DonationReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [programStats, setProgramStats] = useState<ProgramStats[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>([])
  const [programs, setPrograms] = useState<DonationProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    programId: '',
    dateFrom: '',
    dateTo: '',
    type: ''
  })

  useEffect(() => {
    fetchReportData()
    fetchPrograms()
  }, [])

  useEffect(() => {
    fetchReportData()
  }, [filters])

  const fetchReportData = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.programId) params.append('programId', filters.programId)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.type) params.append('type', filters.type)

      const response = await fetch(`/api/donations/reports?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setProgramStats(data.programStats)
        setMonthlyData(data.monthlyData)
        setTypeDistribution(data.typeDistribution)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data laporan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/donations/programs')
      if (response.ok) {
        const data = await response.json()
        setPrograms(data)
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  const exportReport = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.programId) params.append('programId', filters.programId)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.type) params.append('type', filters.type)
      params.append('export', 'true')

      const response = await fetch(`/api/donations/reports?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan-donasi-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: 'Berhasil',
          description: 'Laporan berhasil diekspor'
        })
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengekspor laporan',
        variant: 'destructive'
      })
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      wajib: 'bg-red-100 text-red-800',
      sukarela: 'bg-blue-100 text-blue-800',
      program: 'bg-green-100 text-green-800'
    } as const
    
    const labels = {
      wajib: 'Wajib',
      sukarela: 'Sukarela',
      program: 'Kampanye'
    } as const
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    )
  }

  const clearFilters = () => {
    setFilters({
      programId: '',
      dateFrom: '',
      dateTo: '',
      type: ''
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Laporan Donasi</h1>
        <Button onClick={exportReport}>
          <Download className="w-4 h-4 mr-2" />
          Ekspor Laporan
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="program">Program</Label>
              <Select
                value={filters.programId}
                onValueChange={(value) => setFilters({ ...filters, programId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Program</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipe Donasi</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Tipe</SelectItem>
                  <SelectItem value="wajib">Wajib</SelectItem>
                  <SelectItem value="sukarela">Sukarela</SelectItem>
                  <SelectItem value="program">Kampanye</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Dari Tanggal</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Sampai Tanggal</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donasi</p>
                  <p className="text-2xl font-bold">Rp {stats.totalAmount.toLocaleString('id-ID')}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{stats.monthlyGrowth.toFixed(1)}% bulan ini</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donatur</p>
                  <p className="text-2xl font-bold">{stats.totalDonors}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">{stats.totalDonations} transaksi</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Menunggu Persetujuan</p>
                  <p className="text-2xl font-bold">{stats.pendingTransactions}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">Perlu ditinjau</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tingkat Persetujuan</p>
                  <p className="text-2xl font-bold">
                    {stats.totalDonations > 0 
                      ? ((stats.approvedTransactions / stats.totalDonations) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.approvedTransactions} dari {stats.totalDonations}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Donasi Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'amount' 
                      ? `Rp ${value.toLocaleString('id-ID')}` 
                      : value,
                    name === 'amount' ? 'Jumlah' : 'Transaksi'
                  ]}
                />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Tipe Donasi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Jumlah']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Program Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performa Program Donasi</CardTitle>
        </CardHeader>
        <CardContent>
          {programStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada data program ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Terkumpul</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Donatur</TableHead>
                    <TableHead>Transaksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programStats.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.title}</TableCell>
                      <TableCell>{getTypeBadge(program.type)}</TableCell>
                      <TableCell>
                        {program.targetAmount 
                          ? `Rp ${program.targetAmount.toLocaleString('id-ID')}`
                          : 'Tidak ada target'
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        Rp {program.currentAmount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(program.completionPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {program.completionPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{program.donorCount}</TableCell>
                      <TableCell>{program.transactionCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}