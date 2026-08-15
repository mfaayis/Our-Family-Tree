import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProfilePage } from '@/components/profile/ProfilePage';

export const metadata = {
  title: 'My Profile — Kassim Pillai Family',
};

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
