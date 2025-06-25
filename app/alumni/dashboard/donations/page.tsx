'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Heart, 
  CreditCard, 
  Calendar, 
  Target, 
  Users, 
  TrendingUp,
  Filter,
  Search,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Eye,
  User,
  Home,
  Store,
  Calendar as CalendarIcon,
  Newspaper,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

interface DonationProgram {
  id: string
  title: string
  description: string
  type: 'wajib' | 'sukarela' | 'program'
  targetAmount: number | null
  currentAmount: number
  deadline: string | null
  startDate: string
  endDate: string | null
  status: 'draft' | 'aktif' | 'selesai'
  visible: boolean
  thumbnail: string | null
  _count: {
    transactions: number
  }
  createdAt: string
}

interface DonationTransaction {
  id: string
  programId: string | null
  amount: number
  paymentMethod: string
  status: 'pending' | 'approved' | 'rejected'
  transferProof: string | null
  notes: string | null
  createdAt: string
  alumni: {
    id: string
    name: string
    email: string
  }
  program: {
    title: string
    type: string
  } | null
}

interface AlumniData {
  id: string
  fullName: string
  email: string
  profilePhoto: string | null
  syubiyah: {
    name: string
  } | null
  tahunMasuk: number | null
  tahunKeluar: number | null
}

export default function DonationsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [alumniData, setAlumniData] = useState<AlumniData | null>(null)
  const [programs, setPrograms] = useState<DonationProgram[]>([])
  const [transactions, setTransactions] = useState<DonationTransaction[]>([])
  const [filteredPrograms, setFilteredPrograms] = useState<DonationProgram[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<DonationTransaction[]>([])
  
  // Form states
  const [donationAmount, setDonationAmount] = useState('')
  const [donationNotes, setDonationNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Filter states
  const [programFilter, setProgramFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [historyFilter, setHistoryFilter] = useState('all')
  
  // Modal states
  const [selectedProgram, setSelectedProgram] = useState<DonationProgram | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [programDonationAmount, setProgramDonationAmount] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const alumniToken = localStorage.getItem('alumni_token')
    if (!alumniToken) {
      router.push('/alumni-login')
      return
    }
    const userData = localStorage.getItem('alumni_data')
    if (userData) {
      setAlumniData(JSON.parse(userData))
    }
    fetchPrograms()
    fetchTransactions()
    setIsLoading(false)
  }, [router])

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/donations/programs')
      if (response.ok) {
        const data = await response.json()
        const activePrograms = data.filter((program: DonationProgram) => 
          program.status === 'aktif' && program.visible
        )
        setPrograms(activePrograms)
        setFilteredPrograms(activePrograms)
      }
    } catch (error) {
      console.error('Error fetching programs:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/donations/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
        setFilteredTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleFreeDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!donationAmount || !paymentMethod) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/donations/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          programId: null, // Free donation
          amount: parseInt(donationAmount),
          paymentMethod,
          notes: donationNotes
        })
      })
      
      if (response.ok) {
        setDonationAmount('')
        setDonationNotes('')
        setPaymentMethod('')
        fetchTransactions()
        alert('Donasi berhasil dikirim! Menunggu verifikasi admin.')
      } else {
        alert('Gagal mengirim donasi. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error submitting donation:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProgramDonation = async (programId: string, amount: number) => {
    if (!paymentMethod) {
      alert('Silakan pilih metode pembayaran terlebih dahulu')
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/donations/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          programId,
          amount,
          paymentMethod,
          notes: ''
        })
      })
      
      if (response.ok) {
        fetchTransactions()
        alert('Donasi berhasil dikirim! Menunggu verifikasi admin.')
        setProgramDonationAmount('')
        setIsModalOpen(false)
        setSelectedProgram(null)
      } else {
        alert('Gagal mengirim donasi. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error submitting donation:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openProgramModal = (program: DonationProgram) => {
    setSelectedProgram(program)
    setIsModalOpen(true)
    setProgramDonationAmount('')
  }

  const closeProgramModal = () => {
    setIsModalOpen(false)
    setSelectedProgram(null)
    setProgramDonationAmount('')
  }

  const handleModalDonation = () => {
    if (selectedProgram && programDonationAmount) {
      const amount = parseInt(programDonationAmount)
      if (amount > 0) {
        handleProgramDonation(selectedProgram.id, amount)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Disetujui</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getProgressPercentage = (current: number, target: number | null) => {
    if (!target) return 0
    return Math.min((current / target) * 100, 100)
  }

  // Filter programs
  useEffect(() => {
    let filtered = programs
    
    if (programFilter !== 'all') {
      filtered = filtered.filter(program => program.type === programFilter)
    }
    
    if (searchQuery) {
      filtered = filtered.filter(program => 
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    setFilteredPrograms(filtered)
  }, [programs, programFilter, searchQuery])

  // Filter transactions
  useEffect(() => {
    let filtered = transactions
    
    if (historyFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === historyFilter)
    }
    
    setFilteredTransactions(filtered)
  }, [transactions, historyFilter])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data donasi...</p>
        </div>
      </div>
    )
  }

  if (!alumniData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Data alumni tidak ditemukan</p>
          <Button onClick={() => router.push('/alumni/dashboard')} className="mt-4">
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Render Desktop View (Main Content for Layout)
  const renderDesktopView = () => (
              <div className="space-y-6">
      <div className="flex items-center justify-between">
                <div>
          <h1 className="text-2xl font-bold text-gray-800">Program Donasi</h1>
          <p className="text-gray-600">Dukung program kebaikan melalui donasi Anda.</p>
                </div>
        <Dialog>
          <DialogTrigger asChild>
             <Button>
               <Plus className="w-4 h-4 mr-2" />
                      Donasi Sukarela
             </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Donasi Sukarela</DialogTitle>
            </DialogHeader>
                    <form onSubmit={handleFreeDonation} className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Nominal Donasi</Label>
                        <Input
                          id="amount"
                          type="number"
                  placeholder="Masukkan nominal"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment">Metode Pembayaran</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                  <SelectTrigger><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="transfer_bank">Transfer Bank</SelectItem>
                            <SelectItem value="e_wallet">E-Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Memproses...' : 'Kirim Donasi'}
                      </Button>
                    </form>
          </DialogContent>
        </Dialog>
                              </div>
                              
      <Tabs defaultValue="programs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="programs">Program Donasi</TabsTrigger>
          <TabsTrigger value="history">Riwayat Donasi</TabsTrigger>
        </TabsList>
        <TabsContent value="programs">
          {/* Program List */}
          <div className="space-y-4">
            {filteredPrograms.length > 0 ? filteredPrograms.map(program => (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start">
                  <Link href={`/alumni/dashboard/donations/${program.id}`} className="flex-grow flex flex-col sm:flex-row gap-4 items-start cursor-pointer">
                  {program.thumbnail && (
                    <div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img src={program.thumbnail} alt={program.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-grow">
                    <Badge variant={program.type === 'wajib' ? 'destructive' : 'default'} className="mb-2">{program.type}</Badge>
                      <h3 className="font-bold text-lg mb-2 hover:text-blue-600 transition-colors">{program.title}</h3>
                    {program.targetAmount != null && (
                      <div className="mb-2">
                        <Progress value={getProgressPercentage(program.currentAmount, program.targetAmount)} className="h-2" />
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-600">Terkumpul: <span className="font-medium text-green-600">{formatCurrency(program.currentAmount)}</span></span>
                          <span className="text-gray-500">Target: {formatCurrency(program.targetAmount)}</span>
                        </div>
                        </div>
                      )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center"><Users className="w-4 h-4 mr-1" /> {program._count.transactions} Donatur</div>
                      {program.deadline && <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Berakhir {formatDate(program.deadline)}</div>}
                    </div>
                  </div>
                  </Link>
                  <Button onClick={() => openProgramModal(program)} className="mt-4 sm:mt-0 self-start">Donasi</Button>
                  </CardContent>
                </Card>
            )) : <p className="text-center text-gray-500 py-8">Tidak ada program donasi aktif.</p>}
              </div>
        </TabsContent>
        <TabsContent value="history">
          {/* Transaction History List */}
           <div className="space-y-2">
            {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
              <Card key={tx.id}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{tx.program?.title || 'Donasi Sukarela'}</p>
                    <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
            </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">{formatCurrency(tx.amount)}</p>
                    {getStatusBadge(tx.status)}
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-center text-gray-500 py-8">Tidak ada riwayat transaksi.</p>}
          </div>
        </TabsContent>
      </Tabs>
        </div>
  )

  // Render Mobile View
  const renderMobileView = () => (
    <div className="space-y-6">
      <Tabs defaultValue="programs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="programs">Program</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>
        <TabsContent value="programs" className="space-y-4">
          {filteredPrograms.length > 0 ? filteredPrograms.map(program => (
             <Card key={program.id}>
                <CardContent className="p-3">
                  <Link href={`/alumni/dashboard/donations/${program.id}`} className="block">
                  {program.thumbnail && <img src={program.thumbnail} alt={program.title} className="w-full h-32 object-cover rounded-md mb-3" />}
                  <Badge variant={program.type === 'wajib' ? 'destructive' : 'default'} className="mb-2">{program.type}</Badge>
                    <h3 className="font-semibold mb-2 hover:text-blue-600 transition-colors">{program.title}</h3>
                  {program.targetAmount != null && (
                    <>
                      <Progress value={getProgressPercentage(program.currentAmount, program.targetAmount)} className="h-1.5" />
                      <p className="text-xs text-gray-500 mt-1">{formatCurrency(program.currentAmount)} dari {formatCurrency(program.targetAmount)}</p>
                    </>
                  )}
                  </Link>
                  <Button onClick={() => openProgramModal(program)} className="w-full mt-3">Donasi</Button>
                </CardContent>
             </Card>
          )) : <p className="text-center text-gray-500 py-8">Tidak ada program donasi.</p>}
        </TabsContent>
        <TabsContent value="history" className="space-y-3">
          {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
            <Card key={tx.id}>
              <CardContent className="p-3 flex justify-between items-center">
              <div>
                  <p className="font-semibold text-sm">{tx.program?.title || 'Donasi Sukarela'}</p>
                  <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
              </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{formatCurrency(tx.amount)}</p>
                  {getStatusBadge(tx.status)}
            </div>
              </CardContent>
            </Card>
          )) : <p className="text-center text-gray-500 py-8">Tidak ada riwayat.</p>}
        </TabsContent>
      </Tabs>

      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Donasi untuk {selectedProgram?.title}</SheetTitle>
          </SheetHeader>
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
            {selectedProgram && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{selectedProgram.description}</p>
                <div>
                  <Label htmlFor="sheet-amount">Nominal Donasi</Label>
                  <Input
                    id="sheet-amount"
                    type="number"
                    placeholder="Masukkan nominal"
                    value={programDonationAmount}
                    onChange={(e) => setProgramDonationAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sheet-payment">Metode Pembayaran</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                    <SelectTrigger><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer_bank">Transfer Bank</SelectItem>
                      <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleModalDonation} disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Memproses...' : `Donasi ${formatCurrency(parseInt(programDonationAmount) || 0)}`}
                    </Button>
                  </div>
                )}
             </div>
           </SheetContent>
         </Sheet>
    </div>
  )

  return isMobile ? renderMobileView() : renderDesktopView()
}