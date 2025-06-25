'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Heart,
  CreditCard,
  Calendar,
  Target,
  Users,
  TrendingUp,
  Eye,
  User,
  Home,
  Store,
  Calendar as CalendarIcon,
  Newspaper,
  Settings,
  Share2,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
  createdAt: string
  updatedAt: string
  transactions: DonationTransaction[]
  _count: {
    transactions: number
  }
}

interface DonationTransaction {
  id: string
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

export default function DonationProgramDetailPage() {
  const router = useRouter()
  const params = useParams()
  const programId = params.id as string
  
  const [program, setProgram] = useState<DonationProgram | null>(null)
  const [alumniData, setAlumniData] = useState<AlumniData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
  // Donation form states
  const [donationAmount, setDonationAmount] = useState('')
  const [donationNotes, setDonationNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)

  const formatDescriptionForHtml = (desc: string) => {
    if (!desc) return '';
    // This will handle paragraphs separated by blank lines
    return desc
        .split(/\\n\\s*\\n/)
        .map(p => `<p>${p.trim().replace(/\\n/g, '<br />')}</p>`)
        .join('');
  };

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('alumni_token')
    if (!token) {
      router.push('/alumni-login')
      return
    }
    
    // Get alumni data
    const userData = localStorage.getItem('alumni_data')
    if (userData) {
      setAlumniData(JSON.parse(userData))
    }
    
    // Fetch program data
    fetchProgram()
  }, [programId, router])

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchProgram = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/donations/programs/${programId}`)
      if (response.ok) {
        const data = await response.json()
        setProgram(data)
      } else {
        console.error('Program not found')
        router.push('/alumni/dashboard/donations')
      }
    } catch (error) {
      console.error('Error fetching program:', error)
      router.push('/alumni/dashboard/donations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDonation = async (e: React.FormEvent) => {
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
          programId: programId,
          amount: parseInt(donationAmount),
          paymentMethod,
          notes: donationNotes
        })
      })
      
      if (response.ok) {
        setDonationAmount('')
        setDonationNotes('')
        setPaymentMethod('')
        setIsDonationModalOpen(false)
        fetchProgram() // Refresh program data
        alert('Donasi berhasil dikirim! Menunggu verifikasi admin.')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Gagal mengirim donasi. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error submitting donation:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
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
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aktif':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
      case 'selesai':
        return <Badge className="bg-gray-100 text-gray-800">Selesai</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'wajib':
        return <Badge className="bg-red-100 text-red-800">Wajib</Badge>
      case 'sukarela':
        return <Badge className="bg-blue-100 text-blue-800">Sukarela</Badge>
      case 'program':
        return <Badge className="bg-purple-100 text-purple-800">Program</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getProgressPercentage = (current: number, target: number | null) => {
    if (!target) return 0
    return Math.min((current / target) * 100, 100)
  }

  const getTimeRemaining = (deadline: string | null) => {
    if (!deadline) return null
    
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Berakhir'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} hari lagi`
    if (hours > 0) return `${hours} jam lagi`
    return 'Kurang dari 1 jam'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat program donasi...</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Program Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Program donasi yang Anda cari tidak ditemukan.</p>
          <Button onClick={() => router.push('/alumni/dashboard/donations')}>
            Kembali ke Daftar Donasi
          </Button>
        </div>
      </div>
    )
  }

  const progressPercentage = getProgressPercentage(program.currentAmount, program.targetAmount)
  const timeRemaining = getTimeRemaining(program.deadline)
  const isProgramActive = program.status === 'aktif' && (!program.deadline || new Date(program.deadline) > new Date())

  const renderDesktopView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{program.title}</h1>
            <p className="text-gray-600">Detail program donasi IKADA</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getTypeBadge(program.type)}
          {getStatusBadge(program.status)}
        </div>
      </div>

      <div className="space-y-6">
        {/* Program Image */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-gray-100">
            {program.thumbnail ? (
              <img 
                src={program.thumbnail} 
                alt={program.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                <Heart className="w-16 h-16" />
              </div>
            )}
          </div>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Deskripsi Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: formatDescriptionForHtml(program.description) }}
            />
          </CardContent>
        </Card>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Donation Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Target Donasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(program.currentAmount)}
                </p>
                <p className="text-sm text-gray-500">
                  dari {program.targetAmount ? formatCurrency(program.targetAmount) : 'Target Fleksibel'}
                </p>
              </div>
              
              {program.targetAmount && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold">{program._count.transactions}</p>
                  <p className="text-xs text-gray-500">Total Donatur</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {program.currentAmount > 0 ? formatCurrency(Math.round(program.currentAmount / program._count.transactions)) : formatCurrency(0) }
                  </p>
                  <p className="text-xs text-gray-500">Rata-rata/Donatur</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Informasi Program
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mulai</span>
                  <span className="text-sm font-medium">{formatDate(program.startDate)}</span>
                </div>
                {program.endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Berakhir</span>
                    <span className="text-sm font-medium">{formatDate(program.endDate)}</span>
                  </div>
                )}
                {program.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Deadline</span>
                    <span className="text-sm font-medium">{formatDate(program.deadline)}</span>
                  </div>
                )}
                {timeRemaining && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sisa Waktu</span>
                    <span className={`text-sm font-medium ${
                      timeRemaining === 'Berakhir' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {timeRemaining}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Button */}
        <Card>
          <CardContent className="p-6">
            {isProgramActive ? (
              <div className="space-y-4 text-center">
                <Button 
                  size="lg"
                  onClick={() => setIsDonationModalOpen(true)}
                  className="w-full md:w-auto"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Donasi Sekarang
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Klik untuk berdonasi ke program ini
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">Program ini sudah tidak aktif</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Donasi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {program.transactions.length > 0 ? (
              <div className="space-y-4">
                {program.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {transaction.alumni.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{transaction.alumni.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(transaction.amount)}</p>
                      <Badge 
                        variant={transaction.status === 'approved' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {transaction.status === 'approved' ? 'Diterima' : 
                         transaction.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Belum ada donasi untuk program ini</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderMobileView = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-800">{program.title}</h1>
          <div className="flex items-center space-x-2 mt-1">
            {getTypeBadge(program.type)}
            {getStatusBadge(program.status)}
          </div>
        </div>
      </div>

      {/* Program Image */}
      <Card>
        <div className="aspect-video bg-gray-100 overflow-hidden rounded-t-lg">
          {program.thumbnail ? (
            <img 
              src={program.thumbnail} 
              alt={program.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <Heart className="w-12 h-12" />
            </div>
          )}
        </div>
      </Card>

      {/* Donation Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(program.currentAmount)}
              </p>
              <p className="text-sm text-gray-500">
                dari {program.targetAmount ? formatCurrency(program.targetAmount) : 'Target Fleksibel'}
              </p>
            </div>
            
            {program.targetAmount && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold">{program._count.transactions}</p>
                <p className="text-xs text-gray-500">Total Donatur</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {program.targetAmount ? 
                    Math.ceil(program.targetAmount / Math.max(program.currentAmount, 1)) : 
                    '-'
                  }
                </p>
                <p className="text-xs text-gray-500">Rata-rata/Donatur</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mulai</span>
              <span className="text-sm font-medium">{formatDate(program.startDate)}</span>
            </div>
            {program.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Berakhir</span>
                <span className="text-sm font-medium">{formatDate(program.endDate)}</span>
              </div>
            )}
            {program.deadline && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deadline</span>
                <span className="text-sm font-medium">{formatDate(program.deadline)}</span>
              </div>
            )}
            {timeRemaining && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sisa Waktu</span>
                <span className={`text-sm font-medium ${
                  timeRemaining === 'Berakhir' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {timeRemaining}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deskripsi Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatDescriptionForHtml(program.description) }}
          />
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Donasi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {program.transactions.length > 0 ? (
            <div className="space-y-3">
              {program.transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {transaction.alumni.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{transaction.alumni.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(transaction.amount)}</p>
                    <Badge 
                      variant={transaction.status === 'approved' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status === 'approved' ? 'Diterima' : 
                       transaction.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Belum ada donasi untuk program ini</p>
          )}
        </CardContent>
      </Card>

      {/* Donation Button */}
      {isProgramActive && (
        <div className="sticky bottom-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => setIsDonationModalOpen(true)}
          >
            <Heart className="h-5 w-5 mr-2" />
            Donasi Sekarang
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Donation Modal */}
      <Dialog open={isDonationModalOpen} onOpenChange={setIsDonationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Donasi ke {program.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDonation} className="space-y-4">
            <div>
              <Label htmlFor="amount">Jumlah Donasi (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Masukkan jumlah donasi"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                required
                min="1000"
              />
            </div>
            
            <div>
              <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer Bank</SelectItem>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan untuk donasi Anda"
                value={donationNotes}
                onChange={(e) => setDonationNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsDonationModalOpen(false)}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Donasi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
 