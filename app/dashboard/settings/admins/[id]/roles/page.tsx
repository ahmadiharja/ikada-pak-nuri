"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Shield, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "PUSAT" | "SYUBIYAH"
  syubiyah?: {
    id: string
    name: string
  }
}

interface Role {
  id: string
  name: string
  description: string
  isActive: boolean
}

interface UserRole {
  id: string
  roleId: string
  role: Role
}

export default function UserRolesPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch user details
  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data pengguna",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data pengguna",
        variant: "destructive"
      })
    }
  }

  // Fetch all roles
  const fetchAllRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (response.ok) {
        const data = await response.json()
        setAllRoles(data.roles.filter((role: Role) => role.isActive))
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data role",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data role",
        variant: "destructive"
      })
    }
  }

  // Fetch user roles
  const fetchUserRoles = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/roles`)
      if (response.ok) {
        const data = await response.json()
        setUserRoles(data.userRoles)
        const roleIds = new Set(data.userRoles.map((ur: UserRole) => ur.roleId))
        setSelectedRoles(roleIds)
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat role pengguna",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat role pengguna",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([
        fetchUser(),
        fetchAllRoles(),
        fetchUserRoles()
      ])
      setLoading(false)
    }

    if (userId) {
      fetchData()
    }
  }, [userId])

  // Handle role toggle
  const handleRoleToggle = (roleId: string, checked: boolean) => {
    const newSelectedRoles = new Set(selectedRoles)
    if (checked) {
      newSelectedRoles.add(roleId)
    } else {
      newSelectedRoles.delete(roleId)
    }
    setSelectedRoles(newSelectedRoles)
  }

  // Save changes
  const handleSave = async () => {
    setSaving(true)
    try {
      const currentRoleIds = new Set(userRoles.map(ur => ur.roleId))
      const rolesToAdd = Array.from(selectedRoles).filter(roleId => !currentRoleIds.has(roleId))
      const rolesToRemove = Array.from(currentRoleIds).filter(roleId => !selectedRoles.has(roleId))

      // Add new roles
      for (const roleId of rolesToAdd) {
        const response = await fetch(`/api/users/${userId}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Gagal menambahkan role')
        }
      }

      // Remove roles
      for (const roleId of rolesToRemove) {
        const response = await fetch(`/api/users/${userId}/roles`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Gagal menghapus role')
        }
      }

      toast({
        title: "Berhasil",
        description: "Role pengguna berhasil diperbarui"
      })

      // Refresh user roles
      await fetchUserRoles()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan perubahan",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Memuat data...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Pengguna tidak ditemukan</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kelola Role Pengguna</h1>
            <p className="text-muted-foreground">
              Atur role untuk {user.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nama</label>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipe Admin</label>
              <Badge variant={user.role === "PUSAT" ? "default" : "outline"}>
                {user.role === "PUSAT" ? "Admin Pusat" : "Admin Syubiyah"}
              </Badge>
            </div>
            {user.syubiyah && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Syubiyah</label>
                <p className="font-medium">{user.syubiyah.name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role yang Tersedia
            </CardTitle>
            <CardDescription>
              Pilih role yang akan diberikan kepada pengguna ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allRoles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Tidak ada role yang tersedia
                </p>
              ) : (
                allRoles.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={role.id}
                      checked={selectedRoles.has(role.id)}
                      onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={role.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.name}
                      </label>
                      {role.description && (
                        <p className="text-sm text-muted-foreground">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {userRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Role Saat Ini</CardTitle>
            <CardDescription>
              Role yang sudah dimiliki oleh pengguna ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userRoles.map((userRole) => (
                <Badge key={userRole.id} variant="outline">
                  {userRole.role.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}