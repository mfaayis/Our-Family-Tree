'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { updatePerson, createChangeRequest, createAuditLog } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import type { Person } from '@/lib/types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  person: Person;
}

export function EditPersonDialog({ open, onClose, person }: Props) {
  const { user, userProfile, isAdmin } = useAuth();
  const { refresh, familySettings } = useFamilyTree();

  const [fullName, setFullName] = useState(person.fullName);
  const [gender, setGender] = useState(person.gender);
  const [dateOfBirth, setDateOfBirth] = useState(person.dateOfBirth || '');
  const [dateOfDeath, setDateOfDeath] = useState(person.dateOfDeath || '');
  const [birthPlace, setBirthPlace] = useState(person.birthPlace || '');
  const [currentLocation, setCurrentLocation] = useState(person.currentLocation || '');
  const [bio, setBio] = useState(person.bio || '');
  const [notes, setNotes] = useState(person.notes || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !userProfile) return;
    setLoading(true);

    const changes: Record<string, { old: unknown; new: unknown }> = {};
    if (fullName !== person.fullName) changes.fullName = { old: person.fullName, new: fullName };
    if (gender !== person.gender) changes.gender = { old: person.gender, new: gender };
    if (dateOfBirth !== (person.dateOfBirth || '')) changes.dateOfBirth = { old: person.dateOfBirth, new: dateOfBirth };
    if (dateOfDeath !== (person.dateOfDeath || '')) changes.dateOfDeath = { old: person.dateOfDeath, new: dateOfDeath };
    if (birthPlace !== (person.birthPlace || '')) changes.birthPlace = { old: person.birthPlace, new: birthPlace };
    if (currentLocation !== (person.currentLocation || '')) changes.currentLocation = { old: person.currentLocation, new: currentLocation };
    if (bio !== (person.bio || '')) changes.bio = { old: person.bio, new: bio };
    if (notes !== (person.notes || '')) changes.notes = { old: person.notes, new: notes };

    if (Object.keys(changes).length === 0) {
      toast('No changes detected.');
      setLoading(false);
      onClose();
      return;
    }

    try {
      if (isAdmin || !familySettings?.requireApprovalForEdits) {
        // Direct update
        await updatePerson(
          person.id,
          { fullName, gender, dateOfBirth: dateOfBirth || undefined, dateOfDeath: dateOfDeath || undefined, birthPlace: birthPlace || undefined, currentLocation: currentLocation || undefined, bio: bio || undefined, notes: notes || undefined },
          user.uid
        );
        await createAuditLog({
          action: 'UPDATE_PERSON',
          personId: person.id,
          personName: fullName,
          performedBy: user.uid,
          performedByName: userProfile.displayName,
          details: `Updated: ${Object.keys(changes).join(', ')}`,
        });
        await refresh();
        toast.success('Profile updated!');
        onClose();
      } else {
        // Submit change request
        await createChangeRequest({
          type: 'UPDATE_PERSON',
          personId: person.id,
          requestedBy: user.uid,
          requestedByName: userProfile.displayName,
          changes,
          reason: reason || undefined,
          status: 'pending',
        });
        setSubmitted(true);
      }
    } catch (err) {
      toast.error('Unable to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">Correction submitted!</h2>
            <p className="text-stone-500 text-sm">An admin will review your suggestion.</p>
            <Button className="mt-6" onClick={onClose}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const needsApproval = !isAdmin && familySettings?.requireApprovalForEdits;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{needsApproval ? 'Suggest Edit for' : 'Edit'} {person.fullName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="editName">Full name</Label>
            <Input id="editName" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editGender">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
              <SelectTrigger id="editGender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">♂ Male</SelectItem>
                <SelectItem value="female">♀ Female</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editDob">Date of birth</Label>
              <Input id="editDob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editDod">Date of death</Label>
              <Input id="editDod" type="date" value={dateOfDeath} onChange={e => setDateOfDeath(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editBirth">Birth place</Label>
            <Input id="editBirth" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} placeholder="City, Country" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editLocation">Current location</Label>
            <Input id="editLocation" value={currentLocation} onChange={e => setCurrentLocation(e.target.value)} placeholder="City, Country" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editBio">Biography</Label>
            <Textarea id="editBio" value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="A brief biography..." />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editNotes">Notes</Label>
            <Textarea id="editNotes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          {needsApproval && (
            <div className="space-y-1.5">
              <Label htmlFor="editReason">Reason for change</Label>
              <Input id="editReason" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Correcting full name" />
            </div>
          )}

          {needsApproval && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              Your suggestion will be reviewed by an admin before applying.
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : !needsApproval ? 'Save Changes' : 'Send for Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
