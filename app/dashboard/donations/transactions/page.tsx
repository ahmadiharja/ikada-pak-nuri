'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Download, Filter, Search } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DonationTransaction {
  id: string
  amount: number
  paymentMethod: string
  transferProof?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  alumni: {
    id: string
    fullName: string
    email: string
  }
  program: {
    id: string
    title: string
    type: string
  }
}

interface FilterState {
  status: string
  programId: string
  search: string
  dateFrom: string
  dateTo: string
}

interface DonationProgram {
  id: string
  title: string
}

export default function DonationTransactionsPage() {
  const [transactions, setTransactions] = useState<DonationTransaction[]>([])
  const [programs, setPrograms] = useState<DonationProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    programId: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchTransactions()
    fetchPrograms()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.programId) params.append('programId', filters.programId)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/donations/transactions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data transaksi',
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    } as const
    
    const labels = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
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

  const handleViewProof = (proofUrl: string) => {
    window.open(proofUrl, '_blank')
  }

  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.programId) params.append('programId', filters.programId)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      params.append('export', 'true')

      const response = await fetch(`/api/donations/transactions?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `transaksi-donasi-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: 'Berhasil',
          description: 'Data transaksi berhasil diekspor'
        })
      }
    } catch (error) {
      console.error('Error exporting transactions:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengekspor data transaksi',
        variant: 'destructive'
      })
    }
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      programId: '',
      search: '',
      dateFrom: '',
      dateTo: ''
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
        <h1 className="text-2xl font-bold">Transaksi Donasi</h1>
        <Button onClick={exportTransactions}>
          <Download className="w-4 h-4 mr-2" />
          Ekspor Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Cari Alumni</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nama atau email"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bukti Transfer</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.alumni.fullName}</div>
                          <div className="text-sm text-gray-500">{transaction.alumni.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.program.title}</TableCell>
                      <TableCell>{getTypeBadge(transaction.program.type)}</TableCell>
                      <TableCell className="font-medium">
                        Rp {transaction.amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        {transaction.transferProof ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProof(transaction.transferProof!)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Lihat
                          </Button>
                        ) : (
                          <span className="text-gray-400">Tidak ada</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/donations/transactions/${transaction.id}`}
                        >
                          Detail
                        </Button>
                      </TableCell>
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