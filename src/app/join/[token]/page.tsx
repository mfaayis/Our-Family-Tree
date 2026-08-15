import { JoinPage } from '@/components/auth/JoinPage';

export default function Join({ params }: { params: { token: string } }) {
  return <JoinPage token={params.token} />;
}
