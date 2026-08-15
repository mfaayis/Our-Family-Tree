import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard — Kassim Pillai Family',
};

export default function Admin() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
