'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { updateUserProfile } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, formatDate } from '@/lib/utils';
import { User, Shield, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function ProfilePage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const { getPerson } = useFamilyTree();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [loading, setLoading] = useState(false);

  const linkedPerson = userProfile?.linkedPersonId ? getPerson(userProfile.linkedPersonId) : null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { displayName });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">My Profile</h1>
            <p className="text-stone-500 text-sm">Manage your account</p>
          </div>
        </div>

        {/* Avatar card */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={userProfile?.profilePhoto || ''} />
                <AvatarFallback className="text-xl font-bold bg-amber-100 text-amber-800">
                  {getInitials(userProfile?.displayName || 'U')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-stone-800 text-lg">{userProfile?.displayName}</p>
                <p className="text-stone-400 text-sm">{userProfile?.email}</p>
                <Badge variant={userProfile?.role === 'ADMIN' ? 'default' : userProfile?.role === 'FAMILY_MEMBER' ? 'success' : 'secondary'} className="mt-1">
                  <Shield className="w-3 h-3 mr-1" />
                  {userProfile?.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="mb-4">
          <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profileName">Display name</Label>
                <Input
                  id="profileName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={userProfile?.email || ''} disabled className="bg-stone-50" />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Linked person */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="w-4 h-4" /> Family Profile Link</CardTitle></CardHeader>
          <CardContent>
            {linkedPerson ? (
              <div>
                <p className="text-sm text-stone-600 mb-3">
                  Your account is linked to <strong>{linkedPerson.fullName}</strong> in the family tree.
                </p>
                <Button variant="outline" size="sm" onClick={() => router.push(`/people/${linkedPerson.id}`)}>View Family Profile</Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-stone-500 mb-3">
                  Your account is not yet linked to a family member record.
                  Contact an admin to link your account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
