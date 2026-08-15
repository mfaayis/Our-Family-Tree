import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ActivityPage } from '@/components/activity/ActivityPage';

export const metadata = {
  title: 'Activity — Kassim Pillai Family',
};

export default function Activity() {
  return (
    <ProtectedRoute>
      <ActivityPage />
    </ProtectedRoute>
  );
}
