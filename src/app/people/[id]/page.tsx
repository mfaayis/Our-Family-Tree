import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PersonProfilePage } from '@/components/people/PersonProfilePage';

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <PersonProfilePage personId={resolvedParams.id} />
  );
}
