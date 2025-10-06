'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'seller';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in
        router.push(redirectTo);
        return;
      }

      if (requiredRole && !hasRole(user, requiredRole)) {
        // User doesn't have required role
        // Admin can access both admin and seller routes
        if (user.role?.toLowerCase() === 'admin') {
          if (requiredRole === 'admin') {
            router.push('/admin/dashboard');
          } else if (requiredRole === 'seller') {
            // Admin can access seller routes, so allow it
            return;
          }
        } else if (user.role?.toLowerCase() === 'seller') {
          router.push('/seller/dashboard');
        } else {
          router.push(redirectTo);
        }
        return;
      }
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or doesn't have required role
  // Admin can access both admin and seller routes
  if (!user || (requiredRole && !hasRole(user, requiredRole) && !(user.role?.toLowerCase() === 'admin' && requiredRole === 'seller'))) {
    return null;
  }

  return <>{children}</>;
}
