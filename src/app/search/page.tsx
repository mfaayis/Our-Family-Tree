import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SearchPage } from '@/components/search/SearchPage';

export const metadata = {
  title: 'Search — Kassim Pillai Family',
};

export default function Search() {
  return (
    <ProtectedRoute>
      <SearchPage />
    </ProtectedRoute>
  );
}
