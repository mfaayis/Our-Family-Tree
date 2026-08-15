'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (requireAdmin && userProfile?.role !== 'ADMIN') {
        router.push('/tree');
        return;
      }
    }
  }, [user, userProfile, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 text-sm">Loading family tree...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && userProfile?.role !== 'ADMIN') return null;

  return <>{children}</>;
}
