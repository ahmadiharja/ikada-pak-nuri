/**
 * Contoh Penggunaan Sistem Role dan Permission dalam Aplikasi Next.js
 * 
 * File ini berisi contoh kode untuk mengimplementasikan sistem role dan permission
 * yang telah dibuat dalam aplikasi Next.js.
 */

// 1. Contoh middleware untuk memeriksa permission
// File: middleware.ts

/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fungsi untuk memeriksa apakah user memiliki permission tertentu
async function hasPermission(userId: string, permissionName: string) {
  try {
    // Dapatkan semua role yang dimiliki user
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });
    
    // Dapatkan semua permission dari role-role tersebut
    const roleIds = userRoles.map(ur => ur.roleId);
    
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true }
    });
    
    // Cek apakah permission yang diminta ada dalam daftar
    return rolePermissions.some(rp => rp.permission.name === permissionName);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// Middleware untuk memeriksa permission
export async function middleware(request: NextRequest) {
  // Path yang memerlukan permission tertentu
  const permissionPaths = [
    { path: '/dashboard/alumni', permission: 'alumni.view' },
    { path: '/dashboard/alumni/create', permission: 'alumni.create' },
    { path: '/dashboard/alumni/edit', permission: 'alumni.edit' },
    { path: '/dashboard/news', permission: 'news.view' },
    { path: '/dashboard/news/create', permission: 'news.create' },
    // ... tambahkan path lainnya
  ];
  
  // Dapatkan token dari session
  const token = await getToken({ req: request });
  
  if (!token || !token.sub) {
    // Redirect ke halaman login jika tidak ada token
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Cek apakah path saat ini memerlukan permission tertentu
  const currentPath = request.nextUrl.pathname;
  const requiredPermission = permissionPaths.find(p => currentPath.startsWith(p.path))?.permission;
  
  if (requiredPermission) {
    // Cek apakah user memiliki permission yang diperlukan
    const hasAccess = await hasPermission(token.sub, requiredPermission);
    
    if (!hasAccess) {
      // Redirect ke halaman unauthorized jika tidak memiliki permission
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}

// Konfigurasi path yang akan diproses oleh middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
*/

// 2. Contoh hook untuk memeriksa permission di komponen React
// File: hooks/usePermission.ts

/*
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function usePermission(permissionName: string) {
  const { data: session } = useSession();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function checkPermission() {
      if (!session?.user?.id) {
        setHasPermission(false);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/permissions/check?permission=${permissionName}`);
        const data = await response.json();
        setHasPermission(data.hasPermission);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkPermission();
  }, [session, permissionName]);
  
  return { hasPermission, loading };
}
*/

// 3. Contoh API endpoint untuk memeriksa permission
// File: pages/api/permissions/check.ts

/*
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Dapatkan session user
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user?.id) {
    return res.status(401).json({ hasPermission: false, error: 'Unauthorized' });
  }
  
  const { permission } = req.query;
  
  if (!permission || typeof permission !== 'string') {
    return res.status(400).json({ hasPermission: false, error: 'Permission name is required' });
  }
  
  try {
    // Dapatkan semua role yang dimiliki user
    const userRoles = await prisma.userRole.findMany({
      where: { userId: session.user.id },
      include: { role: true }
    });
    
    // Dapatkan semua permission dari role-role tersebut
    const roleIds = userRoles.map(ur => ur.roleId);
    
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true }
    });
    
    // Cek apakah permission yang diminta ada dalam daftar
    const hasPermission = rolePermissions.some(rp => rp.permission.name === permission);
    
    return res.status(200).json({ hasPermission });
  } catch (error) {
    console.error('Error checking permission:', error);
    return res.status(500).json({ hasPermission: false, error: 'Internal server error' });
  }
}
*/

// 4. Contoh komponen UI untuk menampilkan/menyembunyikan elemen berdasarkan permission
// File: components/PermissionGuard.tsx

/*
import { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';

interface PermissionGuardProps {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const { hasPermission, loading } = usePermission(permission);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
*/

// 5. Contoh penggunaan PermissionGuard dalam komponen halaman
// File: pages/dashboard/alumni/index.tsx

/*
import { PermissionGuard } from '../../../components/PermissionGuard';

export default function AlumniPage() {
  return (
    <div>
      <h1>Alumni Management</h1>
      
      <PermissionGuard permission="alumni.view">
        <div>
          {/* Tampilkan daftar alumni */}
          <table>...</table>
          
          <PermissionGuard permission="alumni.create" fallback={<p>You don't have permission to create alumni</p>}>
            <button>Add New Alumni</button>
          </PermissionGuard>
        </div>
      </PermissionGuard>
    </div>
  );
}
*/

// 6. Contoh halaman manajemen role dan permission
// File: pages/dashboard/settings/roles/index.tsx

/*
import { useState, useEffect } from 'react';
import { usePermission } from '../../../../hooks/usePermission';

export default function RolesManagementPage() {
  const { hasPermission, loading } = usePermission('settings.admins.manage');
  const [roles, setRoles] = useState([]);
  
  useEffect(() => {
    async function fetchRoles() {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data.roles);
    }
    
    if (hasPermission) {
      fetchRoles();
    }
  }, [hasPermission]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!hasPermission) {
    return <div>You don't have permission to manage roles</div>;
  }
  
  return (
    <div>
      <h1>Roles Management</h1>
      
      <button>Add New Role</button>
      
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>{role.description}</td>
              <td>
                <button>Edit</button>
                <button>Manage Permissions</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
*/

// 7. Contoh halaman untuk mengelola permission pada role tertentu
// File: pages/dashboard/settings/roles/[id]/permissions.tsx

/*
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePermission } from '../../../../../hooks/usePermission';

export default function RolePermissionsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { hasPermission, loading } = usePermission('settings.admins.manage');
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      // Fetch role details
      const roleResponse = await fetch(`/api/roles/${id}`);
      const roleData = await roleResponse.json();
      setRole(roleData.role);
      
      // Fetch all permissions
      const permissionsResponse = await fetch('/api/permissions');
      const permissionsData = await permissionsResponse.json();
      setPermissions(permissionsData.permissions);
      
      // Fetch role permissions
      const rolePermissionsResponse = await fetch(`/api/roles/${id}/permissions`);
      const rolePermissionsData = await rolePermissionsResponse.json();
      setRolePermissions(rolePermissionsData.permissions.map(p => p.id));
    }
    
    if (hasPermission) {
      fetchData();
    }
  }, [id, hasPermission]);
  
  async function handlePermissionToggle(permissionId) {
    const isAssigned = rolePermissions.includes(permissionId);
    
    const response = await fetch(`/api/roles/${id}/permissions`, {
      method: isAssigned ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissionId })
    });
    
    if (response.ok) {
      if (isAssigned) {
        setRolePermissions(rolePermissions.filter(id => id !== permissionId));
      } else {
        setRolePermissions([...rolePermissions, permissionId]);
      }
    }
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!hasPermission) {
    return <div>You don't have permission to manage role permissions</div>;
  }
  
  if (!role) {
    return <div>Loading role details...</div>;
  }
  
  return (
    <div>
      <h1>Manage Permissions for {role.name}</h1>
      
      <div>
        <h2>Permissions</h2>
        
        {/* Group permissions by module */}
        {Object.entries(permissions.reduce((acc, permission) => {
          if (!acc[permission.module]) {
            acc[permission.module] = [];
          }
          acc[permission.module].push(permission);
          return acc;
        }, {})).map(([module, modulePermissions]) => (
          <div key={module}>
            <h3>{module}</h3>
            <div>
              {modulePermissions.map(permission => (
                <div key={permission.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={rolePermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                    />
                    {permission.name} - {permission.description}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={() => router.back()}>Back to Roles</button>
    </div>
  );
}
*/

// 8. Contoh halaman untuk mengelola role pada user tertentu
// File: pages/dashboard/settings/users/[id]/roles.tsx

/*
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePermission } from '../../../../../hooks/usePermission';

export default function UserRolesPage() {
  const router = useRouter();
  const { id } = router.query;
  const { hasPermission, loading } = usePermission('settings.admins.manage');
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      // Fetch user details
      const userResponse = await fetch(`/api/users/${id}`);
      const userData = await userResponse.json();
      setUser(userData.user);
      
      // Fetch all roles
      const rolesResponse = await fetch('/api/roles');
      const rolesData = await rolesResponse.json();
      setRoles(rolesData.roles);
      
      // Fetch user roles
      const userRolesResponse = await fetch(`/api/users/${id}/roles`);
      const userRolesData = await userRolesResponse.json();
      setUserRoles(userRolesData.roles.map(r => r.id));
    }
    
    if (hasPermission) {
      fetchData();
    }
  }, [id, hasPermission]);
  
  async function handleRoleToggle(roleId) {
    const isAssigned = userRoles.includes(roleId);
    
    const response = await fetch(`/api/users/${id}/roles`, {
      method: isAssigned ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId })
    });
    
    if (response.ok) {
      if (isAssigned) {
        setUserRoles(userRoles.filter(id => id !== roleId));
      } else {
        setUserRoles([...userRoles, roleId]);
      }
    }
  }
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!hasPermission) {
    return <div>You don't have permission to manage user roles</div>;
  }
  
  if (!user) {
    return <div>Loading user details...</div>;
  }
  
  return (
    <div>
      <h1>Manage Roles for {user.name}</h1>
      
      <div>
        <h2>Roles</h2>
        
        {roles.map(role => (
          <div key={role.id}>
            <label>
              <input
                type="checkbox"
                checked={userRoles.includes(role.id)}
                onChange={() => handleRoleToggle(role.id)}
              />
              {role.name} - {role.description}
            </label>
          </div>
        ))}
      </div>
      
      <button onClick={() => router.back()}>Back to Users</button>
    </div>
  );
}
*/

console.log('Contoh penggunaan sistem role dan permission dalam aplikasi Next.js');
console.log('File ini berisi contoh kode yang dapat diimplementasikan dalam aplikasi.');
console.log('Untuk menggunakan contoh ini, salin kode yang relevan ke dalam aplikasi Next.js Anda.');