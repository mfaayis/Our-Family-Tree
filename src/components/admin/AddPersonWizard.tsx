'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { useAuth } from '@/contexts/AuthContext';
import { createPerson, createRelationship } from '@/lib/db';
import { Loader2, Plus, UserPlus, Link as LinkIcon, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AddPersonWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { people, refresh } = useFamilyTree();
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'unknown' as 'male' | 'female' | 'unknown',
    dateOfBirth: '',
    dateOfDeath: '',
    relatedTo: '',
    relationshipType: '' as 'parent' | 'child' | 'spouse' | 'sibling',
    bio: '',
    currentLocation: '',
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Create Person
      const newPersonId = await createPerson({
        fullName: formData.fullName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        dateOfDeath: formData.dateOfDeath,
        bio: formData.bio,
        currentLocation: formData.currentLocation,
        isLiving: !formData.dateOfDeath,
        isPlaceholder: false,
      }, user.uid);

      // 2. Create Relationship if specified
      if (formData.relatedTo && formData.relationshipType) {
        if (formData.relationshipType === 'sibling') {
          // Find parents of the related person and make them parents of the new person
          const relatedRels = await import('@/lib/db').then(m => m.getRelationshipsForPerson(formData.relatedTo));
          const parents = relatedRels.filter(r => r.relationshipType === 'parent' && r.personB === formData.relatedTo);
          
          for (const p of parents) {
            await createRelationship({
              personA: p.personA,
              personB: newPersonId,
              relationshipType: 'parent',
              status: 'approved',
              createdBy: user.uid,
            }, user.uid);
          }
        } else {
          // Direct relationship
          let personA = formData.relatedTo;
          let personB = newPersonId;
          let relType = formData.relationshipType;

          if (formData.relationshipType === 'parent') {
             // If they selected "Parent", it means the new person is the PARENT of the related person
             personA = newPersonId;
             personB = formData.relatedTo;
          } else if (formData.relationshipType === 'child') {
             // New person is the CHILD of the related person
             personA = formData.relatedTo;
             personB = newPersonId;
             relType = 'parent'; // The db stores it as 'parent'
          }

          await createRelationship({
            personA,
            personB,
            relationshipType: relType === 'parent' ? 'parent' : 'spouse',
            status: 'approved',
            createdBy: user.uid,
          }, user.uid);
        }
      }

      toast.success('Family member added successfully!');
      await refresh();
      setOpen(false);
      
      // Reset
      setTimeout(() => {
        setStep(1);
        setFormData({
          fullName: '', gender: 'unknown', dateOfBirth: '', dateOfDeath: '',
          relatedTo: '', relationshipType: '' as any, bio: '', currentLocation: ''
        });
      }, 500);

    } catch (err) {
      console.error(err);
      toast.error('Failed to add family member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-amber-700 hover:bg-amber-800 text-white">
          <Plus className="w-4 h-4" /> Add Family Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 border-0 bg-stone-50 overflow-hidden shadow-2xl">
        <DialogHeader className="p-6 bg-white border-b border-stone-200">
          <DialogTitle className="text-xl font-serif text-stone-800">Add Family Member</DialogTitle>
        </DialogHeader>

        <div className="flex border-b border-stone-200 bg-stone-100/50">
          {[ 
            { s: 1, icon: UserPlus, label: 'Basic Info' },
            { s: 2, icon: LinkIcon, label: 'Relationship' },
            { s: 3, icon: FileText, label: 'Details' },
            { s: 4, icon: CheckCircle2, label: 'Save' },
          ].map((item) => (
            <div key={item.s} className={`flex-1 py-3 text-center border-r last:border-r-0 border-stone-200 flex flex-col items-center justify-center gap-1 ${step === item.s ? 'bg-white shadow-sm relative z-10 text-amber-700' : 'text-stone-400'}`}>
               <item.icon className={`w-4 h-4 ${step === item.s ? 'text-amber-600' : 'text-stone-300'}`} />
               <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="p-6 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="font-medium text-stone-800 mb-4">Step 1: Basic Information</h3>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Full Name *</label>
                <Input value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Gender *</label>
                <Select value={formData.gender} onValueChange={(v: any) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unknown">Unknown / Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Date of Birth</label>
                  <Input type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Date of Death</label>
                  <Input type="date" value={formData.dateOfDeath} onChange={e => setFormData({ ...formData, dateOfDeath: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="font-medium text-stone-800 mb-4">Step 2: Family Relationship</h3>
              <p className="text-sm text-stone-500 mb-4">How is this new person related to the existing family?</p>
              
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Related To (Search Person)</label>
                <Select value={formData.relatedTo} onValueChange={v => setFormData({ ...formData, relatedTo: v })}>
                  <SelectTrigger><SelectValue placeholder="Select an existing family member" /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {people.filter(p => !p.isDeleted).map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.relatedTo && (
                <div>
                  <label className="text-xs font-semibold text-stone-600 mb-1 block">Relationship</label>
                  <Select value={formData.relationshipType} onValueChange={(v: any) => setFormData({ ...formData, relationshipType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">is the Parent of</SelectItem>
                      <SelectItem value="child">is the Child of</SelectItem>
                      <SelectItem value="spouse">is the Spouse of</SelectItem>
                      <SelectItem value="sibling">is the Sibling of</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="font-medium text-stone-800 mb-4">Step 3: Additional Details</h3>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Current Location</label>
                <Input value={formData.currentLocation} onChange={e => setFormData({ ...formData, currentLocation: e.target.value })} placeholder="e.g. London, UK" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 mb-1 block">Biography / Notes</label>
                <textarea 
                  className="w-full flex min-h-[100px] rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.bio} 
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us a little bit about them..."
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="p-6 bg-white border border-stone-200 rounded-xl text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl text-stone-800">Ready to save?</h3>
                <div className="text-sm text-stone-600 space-y-1">
                  <p><strong>Name:</strong> {formData.fullName || 'Unknown'}</p>
                  <p><strong>Gender:</strong> {formData.gender}</p>
                  {formData.relatedTo && formData.relationshipType && (
                    <p className="mt-2 pt-2 border-t border-stone-100">
                      Will be added as the <strong>{formData.relationshipType}</strong> of 
                      <strong> {people.find(p => p.id === formData.relatedTo)?.fullName}</strong>.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-200 bg-white flex justify-between">
          <Button variant="ghost" onClick={handlePrev} disabled={step === 1 || loading}>
            Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext} disabled={step === 1 && !formData.fullName.trim()}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={loading} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save to Family Tree
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
