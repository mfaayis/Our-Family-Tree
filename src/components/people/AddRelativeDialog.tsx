'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { createPerson, createRelationship, createChangeRequest, createAuditLog, findDuplicateCandidates } from '@/lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertTriangle, Plus, User, Check } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import type { Person } from '@/lib/types';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  relativeTo: Person;
  relationshipType: 'child' | 'parent' | 'sibling' | 'spouse';
}

export function AddRelativeDialog({ open, onClose, relativeTo, relationshipType }: Props) {
  const { user, userProfile, isAdmin } = useAuth();
  const { refresh, familySettings } = useFamilyTree();

  const [step, setStep] = useState<'form' | 'duplicates' | 'submitted'>('form');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<Person[]>([]);

  const relLabels = {
    child: 'Add Child',
    parent: 'Add Parent',
    sibling: 'Add Sibling',
    spouse: 'Add Spouse',
  };

  async function handleCheckDuplicates() {
    if (!fullName.trim()) return;
    setLoading(true);
    try {
      const found = await findDuplicateCandidates(fullName.trim());
      if (found.length > 0) {
        setDuplicates(found);
        setStep('duplicates');
      } else {
        await handleSubmit();
      }
    } catch (err) {
      toast.error('Failed to check for duplicates.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(existingPersonId?: string) {
    if (!user || !userProfile) return;
    setLoading(true);
    try {
      let personId = existingPersonId;

      if (!personId) {
        // Create or submit for review
        if (isAdmin || !familySettings?.requireApprovalForEdits) {
          // Direct create
          personId = await createPerson(
            {
              fullName: fullName.trim(),
              gender,
              dateOfBirth: dateOfBirth || undefined,
              notes: notes || undefined,
              isLiving: true,
              isPlaceholder: false,
            },
            user.uid
          );

          // Create relationship directly
          const { personA, personB } = getRelationshipPair(relativeTo.id, personId, relationshipType);
          await createRelationship(
            { 
              personA, 
              personB, 
              relationshipType: relationshipType === 'child' || relationshipType === 'parent' || relationshipType === 'sibling' ? 'parent' : 'spouse', 
              status: 'approved',
              createdBy: user.uid 
            },
            user.uid
          );

          await createAuditLog({
            action: 'CREATE_PERSON',
            personId,
            personName: fullName.trim(),
            performedBy: user.uid,
            performedByName: userProfile.displayName,
            details: `Added ${fullName.trim()} as ${relationshipType} of ${relativeTo.fullName}`,
          });

          await refresh();
          toast.success(`${fullName.trim()} added to the family tree!`);
          onClose();
        } else {
          // Submit change request
          await createChangeRequest({
            type: 'ADD_PERSON',
            requestedBy: user.uid,
            requestedByName: userProfile.displayName,
            changes: {},
            reason: `Add ${fullName.trim()} as ${relationshipType} of ${relativeTo.fullName}`,
            status: 'pending',
            newPersonData: {
              fullName: fullName.trim(),
              gender,
              dateOfBirth: dateOfBirth || undefined,
              notes: notes || undefined,
              isLiving: true,
              isPlaceholder: false,
            },
            newRelationship: {
              personA: relationshipType === 'parent' ? '__NEW__' : relativeTo.id,
              personB: relationshipType === 'parent' ? relativeTo.id : '__NEW__',
              relationshipType: getRelType(relationshipType),
            },
          });

          setStep('submitted');
        }
      } else {
        // Link existing person
        if (isAdmin || !familySettings?.requireApprovalForEdits) {
          const { personA, personB } = getRelationshipPair(relativeTo.id, personId, relationshipType);
          await createRelationship(
            { personA, personB, relationshipType: getRelType(relationshipType), status: 'approved', createdBy: user.uid },
            user.uid
          );
          await refresh();
          toast.success('Relationship added!');
          onClose();
        } else {
          await createChangeRequest({
            type: 'ADD_RELATIONSHIP',
            requestedBy: user.uid,
            requestedByName: userProfile.displayName,
            changes: {},
            reason: `Link existing person as ${relationshipType} of ${relativeTo.fullName}`,
            status: 'pending',
            newRelationship: {
              personA: relationshipType === 'parent' ? personId : relativeTo.id,
              personB: relationshipType === 'parent' ? relativeTo.id : personId,
              relationshipType: getRelType(relationshipType),
            },
          });
          setStep('submitted');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to save. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getRelType(type: string) {
    if (type === 'child' || type === 'parent' || type === 'sibling') return 'parent' as const;
    return 'spouse' as const;
  }

  function getRelationshipPair(relToId: string, newId: string, type: string) {
    if (type === 'child') return { personA: relToId, personB: newId };
    if (type === 'parent') return { personA: newId, personB: relToId };
    if (type === 'sibling') return { personA: relToId, personB: newId }; // Needs more complex logic for siblings, using relToId as parent for now or handling sibling linkage elsewhere
    return { personA: relToId, personB: newId }; // spouse
  }

  function handleClose() {
    setStep('form');
    setFullName('');
    setGender('unknown');
    setDateOfBirth('');
    setNotes('');
    setDuplicates([]);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>{relLabels[relationshipType]} to {relativeTo.fullName}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name <span className="text-red-500">*</span></Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as typeof gender)}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">♂ Male</SelectItem>
                    <SelectItem value="female">♀ Female</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {(!isAdmin && familySettings?.requireApprovalForEdits) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  <strong>Note:</strong> Your addition will be submitted for admin review before appearing in the tree.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={handleCheckDuplicates}
                disabled={loading || !fullName.trim()}
              >
                {loading ? 'Checking...' : (isAdmin || !familySettings?.requireApprovalForEdits) ? `Add ${relLabels[relationshipType]}` : 'Send for Review'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'duplicates' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Possible Existing Person Found
              </DialogTitle>
            </DialogHeader>

            <div className="py-2">
              <p className="text-sm text-stone-600 mb-4">
                We found {duplicates.length} existing family member{duplicates.length > 1 ? 's' : ''} with a similar name.
                Is this the same person?
              </p>

              <div className="space-y-2 mb-4">
                {duplicates.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSubmit(d.id)}
                    className="w-full flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-left"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-amber-200 text-amber-800 text-sm">
                        {getInitials(d.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{d.fullName}</p>
                      <p className="text-xs text-stone-500">Yes, use this existing person</p>
                    </div>
                    <Check className="w-4 h-4 text-amber-600 ml-auto" />
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubmit()}
                disabled={loading}
              >
                <Plus className="w-4 h-4" />
                No, create as new person
              </Button>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep('form')}>Back</Button>
            </DialogFooter>
          </>
        )}

        {step === 'submitted' && (
          <>
            <DialogHeader>
              <DialogTitle>Submitted for Review</DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-stone-700 font-medium mb-2">Your addition has been submitted for approval.</p>
              <p className="text-stone-500 text-sm">An admin will review and approve the change.</p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
