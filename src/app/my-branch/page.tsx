import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MyBranchPage } from '@/components/tree/MyBranchPage';

export const metadata = {
  title: 'My Branch — Kassim Pillai Family',
};

export default function MyBranch() {
  return (
    <ProtectedRoute>
      <MyBranchPage />
    </ProtectedRoute>
  );
}
