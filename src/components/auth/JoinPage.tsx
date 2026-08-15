'use client';
import { useEffect, useState } from 'react';
import { getInvitation, useInvitation } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TreePine, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export function JoinPage({ token }: { token: string }) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'used' | 'expired'>('loading');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function checkToken() {
      try {
        const invite = await getInvitation(token);
        if (!invite) { setStatus('invalid'); return; }
        if (invite.status === 'used') { setStatus('used'); return; }
        if (invite.status === 'expired' || new Date(invite.expiresAt) < new Date()) { setStatus('expired'); return; }
        setStatus('valid');
      } catch {
        setStatus('invalid');
      }
    }
    checkToken();
  }, [token]);

  async function handleJoin() {
    if (user) {
      await useInvitation(token, user.uid);
      router.push('/tree');
    } else {
      router.push(`/signup?token=${token}`);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-700 rounded-2xl mb-6 shadow-lg">
          <TreePine className="w-8 h-8 text-white" />
        </div>

        {status === 'loading' && (
          <div>
            <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-500">Checking invitation...</p>
          </div>
        )}

        {status === 'valid' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-stone-800 mb-2">You have been invited!</h1>
            <p className="text-stone-500 mb-6">You have been invited to join the Kassim Pillai Family Tree.</p>
            <Button size="lg" className="w-full" onClick={handleJoin}>
              {user ? 'Join Family Tree' : 'Create Account & Join'}
            </Button>
            {user && (
              <p className="text-sm text-stone-500 mt-3">Joining as {user.email}</p>
            )}
          </div>
        )}

        {(status === 'invalid' || status === 'used' || status === 'expired') && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-stone-800 mb-2">
              {status === 'used' ? 'Invitation already used' : status === 'expired' ? 'Invitation expired' : 'Invalid invitation'}
            </h1>
            <p className="text-stone-500 mb-6">Please ask an admin for a new invitation link.</p>
            <Link href="/login">
              <Button variant="outline" className="w-full">Go to Login</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
