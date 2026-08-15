import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PersonProfilePage } from '@/components/people/PersonProfilePage';

export default function PersonPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <PersonProfilePage personId={params.id} />
    </ProtectedRoute>
  );
}
