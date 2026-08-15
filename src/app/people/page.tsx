import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PeopleListPage } from '@/components/people/PeopleListPage';

export const metadata = {
  title: 'All People — Kassim Pillai Family',
};

export default function PeoplePage() {
  return (
    <ProtectedRoute>
      <PeopleListPage />
    </ProtectedRoute>
  );
}
