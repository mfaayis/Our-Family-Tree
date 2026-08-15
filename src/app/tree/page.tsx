import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { FamilyTreePage } from '@/components/tree/FamilyTreePage';

export const metadata = {
  title: 'Family Tree — Kassim Pillai Family',
};

export default function TreePage() {
  return (
    <FamilyTreePage />
  );
}
