'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Users, Building2, UserCheck, Mail, Phone } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface OrganizationMember {
  id: string
  name: string
  position: string
  department: string
  level: number
  parentId?: string
  city?: string
  photo?: string
  description?: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: string
}

const DEPARTMENT_ORDER = [
  'Dewan Penyantun',
  'Dewan Pengawas',
  'Dewan Harian',
  'Biro 1',
  'Biro 2',
  'Biro 3',
  'Biro 4',
  'Biro 5',
  'Biro 6',
  'Biro 7',
  'Biro 8',
  'Tim Khusus'
]

const DEPARTMENT_ICONS = {
  'Dewan Penyantun': Building2,
  'Dewan Pengawas': UserCheck,
  'Dewan Harian': Users,
  'Biro 1': Building2,
  'Biro 2': Building2,
  'Biro 3': Building2,
  'Biro 4': Building2,
  'Biro 5': Building2,
  'Biro 6': Building2,
  'Biro 7': Building2,
  'Biro 8': Building2,
  'Tim Khusus': Users
}

export function OrganizationChart() {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/organization')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else {
        throw new Error('Failed to fetch organization members')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setError('Gagal memuat data organisasi')
    } finally {
      setLoading(false)
    }
  }

  const groupMembersByDepartment = () => {
    const grouped = members.reduce((acc, member) => {
      if (!acc[member.department]) {
        acc[member.department] = []
      }
      acc[member.department].push(member)
      return acc
    }, {} as Record<string, OrganizationMember[]>)

    // Sort members within each department by level and position
    Object.keys(grouped).forEach(dept => {
      grouped[dept].sort((a, b) => {
        if (a.level !== b.level) {
          return a.level - b.level
        }
        return a.position.localeCompare(b.position)
      })
    })

    return grouped
  }

  const groupMembersByPosition = (departmentMembers: OrganizationMember[]) => {
    const grouped = departmentMembers.reduce((acc, member) => {
      if (!acc[member.position]) {
        acc[member.position] = []
      }
      acc[member.position].push(member)
      return acc
    }, {} as Record<string, OrganizationMember[]>)

    // Sort members within each position by name
    Object.keys(grouped).forEach(position => {
      grouped[position].sort((a, b) => a.name.localeCompare(b.name))
    })

    return grouped
  }

  const renderPositionCard = (position: string, positionMembers: OrganizationMember[], layout: 'horizontal' | 'vertical' = 'vertical') => {
    const level = positionMembers[0]?.level || 1
    const department = positionMembers[0]?.department || ''
    
    if (layout === 'horizontal') {
      return (
        <Card key={position} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm">{position}</h5>
              <Badge variant={level <= 2 ? 'default' : 'secondary'} className="text-xs">
                Level {level}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
               {positionMembers.map((member, index) => {
                 const initials = member.name
                   .split(' ')
                   .map(n => n[0])
                   .join('')
                   .toUpperCase()
                   .slice(0, 2)
                 
                 return (
                   <div key={member.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.photo} />
                        <AvatarFallback className="text-sm font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                         {member.description && (
                           <p className="text-xs text-muted-foreground italic font-light mb-1 line-clamp-1">{member.description}</p>
                         )}
                         <p className="font-medium text-sm truncate">{member.name}</p>
                         {member.city && (
                           <p className="text-xs text-muted-foreground truncate">{member.city}</p>
                         )}
                       {member.email && (
                         <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                           <Mail className="h-2 w-2" />
                           <span className="truncate max-w-[80px]">{member.email}</span>
                         </div>
                       )}
                     </div>
                   </div>
                 )
               })}
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card key={position} className="p-4">
        <div className="text-center space-y-3">
          <div>
            <h5 className="font-medium text-sm mb-2">{position}</h5>
            <Badge variant={level <= 2 ? 'default' : 'secondary'} className="text-xs mb-3">
              Level {level}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
             {positionMembers.map((member, index) => {
               const initials = member.name
                 .split(' ')
                 .map(n => n[0])
                 .join('')
                 .toUpperCase()
                 .slice(0, 2)
               
               return (
                 <div key={member.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 text-center">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.photo} />
                      <AvatarFallback className="text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                       {member.description && (
                         <p className="text-xs text-muted-foreground italic font-light mb-1 line-clamp-2">{member.description}</p>
                       )}
                       <p className="font-medium text-base truncate">{member.name}</p>
                       {member.city && (
                         <p className="text-xs text-muted-foreground">{member.city}</p>
                       )}
                     <div className="flex flex-col gap-1 mt-1">
                       {member.email && (
                         <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                           <Mail className="h-3 w-3" />
                           <span className="truncate max-w-[100px]">{member.email}</span>
                         </div>
                       )}
                       {member.phone && (
                         <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                           <Phone className="h-3 w-3" />
                           <span className="text-xs">{member.phone}</span>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>
      </Card>
    )
  }

  const renderMemberCard = (member: OrganizationMember, layout: 'horizontal' | 'vertical' = 'vertical') => {
    const initials = member.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    if (layout === 'horizontal') {
      return (
        <Card key={member.id} className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.photo} />
              <AvatarFallback className="text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-sm truncate">{member.name}</h5>
              <p className="text-xs text-muted-foreground truncate">{member.position}</p>
              {member.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {member.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {member.email && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge variant={member.level <= 2 ? 'default' : 'secondary'} className="text-xs">
              Level {member.level}
            </Badge>
          </div>
        </Card>
      )
    }

    return (
      <Card key={member.id} className="p-4">
        <div className="text-center space-y-3">
          <Avatar className="mx-auto h-16 w-16">
            <AvatarImage src={member.photo} />
            <AvatarFallback className="text-lg font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h5 className="font-medium text-sm">{member.name}</h5>
            {member.city && (
              <p className="text-xs text-muted-foreground font-medium">{member.city}</p>
            )}
            <p className="text-xs text-muted-foreground">{member.position}</p>
            {member.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                {member.description}
              </p>
            )}
          </div>
          <div className="space-y-1">
            {member.email && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{member.phone}</span>
              </div>
            )}
          </div>
          <Badge variant={member.level <= 2 ? 'default' : 'secondary'} className="text-xs">
            Level {member.level}
          </Badge>
        </div>
      </Card>
    )
  }

  const renderDepartmentSection = (department: string, departmentMembers: OrganizationMember[]) => {
    const Icon = DEPARTMENT_ICONS[department as keyof typeof DEPARTMENT_ICONS] || Users
    const isTopLevel = ['Dewan Penyantun', 'Dewan Pengawas'].includes(department)
    const layout = isTopLevel ? 'horizontal' : 'vertical'
    
    // Group members by position within this department
    const positionGroups = groupMembersByPosition(departmentMembers)
    const positions = Object.keys(positionGroups)

    return (
      <div key={department} className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h4 className="font-semibold text-lg">{department}</h4>
          <Badge variant="outline" className="ml-auto">
            {departmentMembers.length} anggota • {positions.length} jabatan
          </Badge>
        </div>
        
        {departmentMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {positions.map(position => {
              const positionMembers = positionGroups[position]
              return renderPositionCard(position, positionMembers, layout)
            })}
          </div>
        ) : (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada anggota di {department}</p>
            </div>
          </Card>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(j => (
                      <Card key={j} className="p-4">
                        <div className="text-center space-y-3">
                          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24 mx-auto" />
                            <Skeleton className="h-3 w-32 mx-auto" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Gagal Memuat Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={fetchMembers}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Coba Lagi
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const groupedMembers = groupMembersByDepartment()
  const hasMembers = Object.keys(groupedMembers).length > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Struktur Organisasi IKADA
          </CardTitle>
          <CardDescription>
            Susunan kepengurusan dan struktur organisasi IKADA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasMembers ? (
            <div className="space-y-8">
              {DEPARTMENT_ORDER.map(department => {
                const departmentMembers = groupedMembers[department] || []
                if (departmentMembers.length === 0) return null
                
                return (
                  <div key={department}>
                    {renderDepartmentSection(department, departmentMembers)}
                    {department !== DEPARTMENT_ORDER[DEPARTMENT_ORDER.length - 1] && 
                     DEPARTMENT_ORDER.indexOf(department) < DEPARTMENT_ORDER.length - 1 && 
                     groupedMembers[DEPARTMENT_ORDER[DEPARTMENT_ORDER.indexOf(department) + 1]]?.length > 0 && (
                      <Separator className="my-8" />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Data Organisasi</h3>
              <p className="text-muted-foreground mb-4">
                Struktur organisasi belum diatur. Silakan hubungi administrator untuk menambahkan data organisasi.
              </p>
              <Badge variant="outline">
                Kelola melalui Dashboard Admin → Pengaturan → Susunan Organisasi
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}