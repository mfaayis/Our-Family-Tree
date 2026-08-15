'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddRelativeDialog } from '@/components/people/AddRelativeDialog';
import { EditPersonDialog } from '@/components/people/EditPersonDialog';
import { getAuditLogs } from '@/lib/db';
import { formatDate, formatRelativeTime, getInitials, cn } from '@/lib/utils';
import { getDescendants, getAncestors, deriveRelationshipLabel } from '@/lib/tree-utils';
import type { Person, AuditLog } from '@/lib/types';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Users,
  GitBranch,
  Edit,
  Plus,
  Clock,
  Heart,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export function PersonProfilePage({ personId }: { personId: string }) {
  const router = useRouter();
  const { getPerson, getChildrenOf, getParentsOf, getSpousesOf, getSiblingsOf, relationships, people, loading } = useFamilyTree();
  const { isAdmin, canEdit } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addRelType, setAddRelType] = useState<'child' | 'parent' | 'sibling' | 'spouse'>('child');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const person = getPerson(personId);
  const parents = getParentsOf(personId);
  const children = getChildrenOf(personId);
  const siblings = getSiblingsOf(personId);
  const spouses = getSpousesOf(personId);

  const ancestors = person ? getAncestors(personId, relationships) : [];
  const descendants = person ? getDescendants(personId, relationships) : [];

  const peopleMap = new Map(people.map(p => [p.id, p]));

  useEffect(() => {
    getAuditLogs(personId).then(setAuditLogs).catch(console.error);
  }, [personId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-3" />
            <p className="text-stone-500">Loading person data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-stone-600">Person not found.</p>
            <Button variant="ghost" className="mt-4" onClick={() => router.push('/tree')}>
              Back to Family Tree
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function handleAdd(type: 'child' | 'parent' | 'sibling' | 'spouse') {
    setAddRelType(type);
    setAddDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-4xl mx-auto px-4 py-6">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-stone-500"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Header Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-amber-700 to-amber-900" />
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={person.photoUrl || ''} alt={person.fullName} />
                <AvatarFallback className={cn(
                  'text-xl font-bold',
                  person.gender === 'male' ? 'bg-blue-100 text-blue-700' : person.gender === 'female' ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-600'
                )}>
                  {person.isPlaceholder ? '?' : getInitials(person.fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h1 className={cn('text-2xl font-bold text-stone-900', person.isPlaceholder && 'italic text-stone-400')}>
                      {person.isPlaceholder ? 'Name to be updated' : person.fullName}
                    </h1>
                    {parents.length > 0 && (
                      <p className="text-stone-500 text-sm mt-0.5">
                        {person.gender === 'male' ? 'Son' : person.gender === 'female' ? 'Daughter' : 'Child'} of{' '}
                        {parents.map((p, i) => (
                          <span key={p.id}>
                            <button
                              className="text-amber-700 hover:underline font-medium"
                              onClick={() => router.push(`/people/${p.id}`)}
                            >
                              {p.fullName}
                            </button>
                            {i < parents.length - 1 ? ' & ' : ''}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {person.gender !== 'unknown' && (
                      <Badge variant={person.gender === 'male' ? 'male' : 'female'}>
                        {person.gender === 'male' ? '\u2642 Male' : '\u2640 Female'}
                      </Badge>
                    )}
                    {person.isPlaceholder && <Badge variant="warning">Placeholder</Badge>}
                    {!person.isLiving && <Badge variant="secondary">Deceased</Badge>}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => router.push(`/tree?focus=${personId}`)}>
                <GitBranch className="w-4 h-4" />
                View Branch
              </Button>
              {canEdit && (
                <Button size="sm" onClick={() => handleAdd('child')}>
                  <Plus className="w-4 h-4" />
                  Add Child
                </Button>
              )}
              {canEdit && (
                <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                  <Edit className="w-4 h-4" />
                  {isAdmin ? 'Edit' : 'Suggest Edit'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="family">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="family" className="space-y-4">
            {/* Parents */}
            {parents.length > 0 && (
              <FamilySection title="Parents" icon={<User className="w-4 h-4" />}>
                {parents.map(p => <PersonChip key={p.id} person={p} label={p.gender === 'male' ? 'Father' : p.gender === 'female' ? 'Mother' : 'Parent'} />)}
              </FamilySection>
            )}

            {/* Spouses */}
            {spouses.length > 0 && (
              <FamilySection title="Spouse" icon={<Heart className="w-4 h-4" />}>
                {spouses.map(p => <PersonChip key={p.id} person={p} label="Spouse" />)}
              </FamilySection>
            )}

            {/* Children */}
            <FamilySection
              title={`Children (${children.length})`}
              icon={<Users className="w-4 h-4" />}
              action={canEdit ? <Button size="sm" variant="outline" onClick={() => handleAdd('child')}><Plus className="w-4 h-4" />Add Child</Button> : undefined}
            >
              {children.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-stone-400 text-sm italic">No children recorded yet.</p>
                  {canEdit && (
                    <Button size="sm" className="mt-3" onClick={() => handleAdd('child')}>
                      <Plus className="w-4 h-4" />
                      Add Child
                    </Button>
                  )}
                </div>
              ) : (
                children.map(p => (
                  <PersonChip
                    key={p.id}
                    person={p}
                    label={p.gender === 'male' ? 'Son' : p.gender === 'female' ? 'Daughter' : 'Child'}
                  />
                ))
              )}
            </FamilySection>

            {/* Siblings */}
            {siblings.length > 0 && (
              <FamilySection title="Siblings" icon={<Users className="w-4 h-4" />}>
                {siblings.map(p => <PersonChip key={p.id} person={p} label="Sibling" />)}
              </FamilySection>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {[{label:'Ancestors', val: ancestors.length}, {label:'Descendants', val: descendants.length}, {label:'Siblings', val: siblings.length}, {label:'Children', val: children.length}].map(s=>(
                <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-3 text-center">
                  <div className="text-2xl font-bold text-stone-800">{s.val}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="info">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {[
                  { label: 'Full Name', value: person.fullName, icon: <User className="w-4 h-4" /> },
                  { label: 'Date of Birth', value: person.dateOfBirth ? formatDate(person.dateOfBirth) : null, icon: <Calendar className="w-4 h-4" /> },
                  { label: 'Date of Death', value: person.dateOfDeath ? formatDate(person.dateOfDeath) : null, icon: <Calendar className="w-4 h-4" /> },
                  { label: 'Birth Place', value: person.birthPlace, icon: <MapPin className="w-4 h-4" /> },
                  { label: 'Current Location', value: person.currentLocation, icon: <MapPin className="w-4 h-4" /> },
                ].filter(f => f.value).map(field => (
                  <div key={field.label} className="flex items-start gap-3">
                    <div className="text-stone-400 mt-0.5">{field.icon}</div>
                    <div>
                      <p className="text-xs text-stone-400">{field.label}</p>
                      <p className="text-stone-800 font-medium">{field.value}</p>
                    </div>
                  </div>
                ))}
                {person.bio && (
                  <div>
                    <p className="text-xs text-stone-400 mb-1">Biography</p>
                    <p className="text-stone-700 text-sm leading-relaxed">{person.bio}</p>
                  </div>
                )}
                {person.notes && (
                  <div>
                    <p className="text-xs text-stone-400 mb-1">Notes</p>
                    <p className="text-stone-600 text-sm italic">{person.notes}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-100 text-xs text-stone-400 space-y-1">
                  <p>Added {formatRelativeTime(person.createdAt)}</p>
                  <p>Last updated {formatRelativeTime(person.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle>Change History</CardTitle></CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <p className="text-stone-400 text-sm text-center py-6">No history recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map(log => (
                      <div key={log.id} className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-stone-800">{log.details}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{formatDate(log.createdAt)} — by {log.performedByName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {addDialogOpen && (
        <AddRelativeDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          relativeTo={person}
          relationshipType={addRelType}
        />
      )}
      {editDialogOpen && (
        <EditPersonDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          person={person}
        />
      )}
    </div>
  );
}

function FamilySection({ title, icon, children, action }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function PersonChip({ person, label }: { person: Person; label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/people/${person.id}`)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:shadow-sm',
        person.gender === 'male' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
        person.gender === 'female' ? 'bg-rose-50 border-rose-200 hover:bg-rose-100' :
        'bg-stone-50 border-stone-200 hover:bg-stone-100'
      )}
    >
      <Avatar className="w-7 h-7">
        <AvatarImage src={person.photoUrl || ''} />
        <AvatarFallback className="text-xs">{person.isPlaceholder ? '?' : getInitials(person.fullName)}</AvatarFallback>
      </Avatar>
      <div className="text-left">
        <p className={cn('text-sm font-semibold leading-none', person.isPlaceholder && 'italic text-stone-400')}>
          {person.isPlaceholder ? 'Unknown' : person.fullName}
        </p>
        <p className="text-xs text-stone-400 mt-0.5">{label}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-stone-300 ml-1" />
    </button>
  );
}
