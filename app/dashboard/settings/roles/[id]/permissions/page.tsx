"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Shield, Check } from "lucide-react"
import { useRouter } from "next/navigation"

interface Role {
  id: string
  name: string
  description?: string
  isActive: boolean
}

interface Permission {
  id: string
  name: string
  module: string
  action: string
  description?: string
}

interface PermissionsByModule {
  [key: string]: Permission[]
}

export default function RolePermissionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [permissionsByModule, setPermissionsByModule] = useState<PermissionsByModule>({})

  // Fetch role and permissions data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch role details
        const roleResponse = await fetch(`/api/roles/${params.id}`)
        if (!roleResponse.ok) {
          throw new Error('Failed to fetch role')
        }
        const roleData = await roleResponse.json()
        setRole(roleData.role)
        
        // Fetch all permissions
        const permissionsResponse = await fetch('/api/permissions')
        if (!permissionsResponse.ok) {
          throw new Error('Failed to fetch permissions')
        }
        const permissionsData = await permissionsResponse.json()
        setPermissions(permissionsData.permissions)
        
        // Group permissions by module
        const groupedPermissions = permissionsData.permissions.reduce((acc: PermissionsByModule, permission: Permission) => {
          if (!acc[permission.module]) {
            acc[permission.module] = []
          }
          acc[permission.module].push(permission)
          return acc
        }, {})
        setPermissionsByModule(groupedPermissions)
        
        // Fetch role permissions
        const rolePermissionsResponse = await fetch(`/api/roles/${params.id}/permissions`)
        if (!rolePermissionsResponse.ok) {
          throw new Error('Failed to fetch role permissions')
        }
        const rolePermissionsData = await rolePermissionsResponse.json()
        setRolePermissions(rolePermissionsData.permissions.map((p: Permission) => p.id))
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Gagal memuat data. Silakan coba lagi.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [params.id])

  // Handle permission toggle
  const handlePermissionToggle = async (permissionId: string) => {
    const isAssigned = rolePermissions.includes(permissionId)
    setSaving(true)
    
    try {
      const response = await fetch(`/api/roles/${params.id}/permissions`, {
        method: isAssigned ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissionId })
      })
      
      if (response.ok) {
        if (isAssigned) {
          setRolePermissions(rolePermissions.filter(id => id !== permissionId))
        } else {
          setRolePermissions([...rolePermissions, permissionId])
        }
        
        toast({
          title: "Berhasil",
          description: isAssigned 
            ? "Hak akses berhasil dihapus dari role" 
            : "Hak akses berhasil ditambahkan ke role"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Gagal memperbarui hak akses",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui hak akses",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  // Toggle all permissions in a module
  const toggleModulePermissions = async (module: string, permissions: Permission[]) => {
    const modulePermissionIds = permissions.map(p => p.id)
    const allModulePermissionsAssigned = modulePermissionIds.every(id => rolePermissions.includes(id))
    
    setSaving(true)
    
    try {
      // If all permissions are assigned, remove all. Otherwise, add all missing ones
      if (allModulePermissionsAssigned) {
        // Remove all permissions in this module
        for (const permissionId of modulePermissionIds) {
          await fetch(`/api/roles/${params.id}/permissions`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ permissionId })
          })
        }
        
        setRolePermissions(rolePermissions.filter(id => !modulePermissionIds.includes(id)))
      } else {
        // Add all missing permissions in this module
        const permissionsToAdd = modulePermissionIds.filter(id => !rolePermissions.includes(id))
        
        for (const permissionId of permissionsToAdd) {
          await fetch(`/api/roles/${params.id}/permissions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ permissionId })
          })
        }
        
        setRolePermissions([...rolePermissions, ...permissionsToAdd])
      }
      
      toast({
        title: "Berhasil",
        description: allModulePermissionsAssigned 
          ? `Semua hak akses modul ${module} berhasil dihapus` 
          : `Semua hak akses modul ${module} berhasil ditambahkan`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui hak akses",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Memuat data...</div>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground mb-4">Role tidak ditemukan</div>
        <Button onClick={() => router.push('/dashboard/settings/roles')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Role
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Hak Akses Role</h1>
          <p className="text-muted-foreground">
            Atur hak akses untuk role "{role.name}"
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/settings/roles')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Hak Akses untuk Role: {role.name}
          </CardTitle>
          <CardDescription>
            {role.description || "Tidak ada deskripsi"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(permissionsByModule).map(([module, modulePermissions]) => {
              const allModulePermissionsAssigned = modulePermissions.every(permission => 
                rolePermissions.includes(permission.id)
              )
              const someModulePermissionsAssigned = modulePermissions.some(permission => 
                rolePermissions.includes(permission.id)
              )
              
              return (
                <div key={module} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold capitalize">{module}</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleModulePermissions(module, modulePermissions)}
                      disabled={saving}
                    >
                      {allModulePermissionsAssigned ? "Hapus Semua" : "Pilih Semua"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modulePermissions.map(permission => (
                      <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50">
                        <Checkbox
                          id={permission.id}
                          checked={rolePermissions.includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                          disabled={saving}
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor={permission.id}
                            className="font-medium cursor-pointer"
                          >
                            {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {permission.description || `${permission.action} ${module}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}