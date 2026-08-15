'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getAllUsers, getChangeRequests, getAllPeople, getAuditLogs,
  reviewChangeRequest, updateUserProfile, createInvitation,
  getFamilyStats
} from '@/lib/db';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { ChangeRequest, AuditLog, UserProfile } from '@/lib/types';
import {
  CheckSquare, RefreshCw, Copy, Check, Loader2, ChevronDown, ChevronUp, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminDashboard() {
  const { user } = useAuth();
  const { people, refresh } = useFamilyTree();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [s, reqs, logs, users] = await Promise.all([
        getFamilyStats(),
        getChangeRequests(),
        getAuditLogs(),
        getAllUsers(),
      ]);
      setStats(s);
      setChangeRequests(reqs);
      setAuditLogs(logs);
      setAllUsers(users);
    } catch (err) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleReview(requestId: string, status: 'approved' | 'rejected', note?: string) {
    if (!user) return;
    try {
      await reviewChangeRequest(requestId, status, user.uid, note);
      toast.success(`Request ${status}!`);
      await loadData();
      await refresh();
    } catch {
      toast.error('Failed to update request.');
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await updateUserProfile(userId, { role: newRole as any });
      toast.success('Role updated!');
      await loadData();
    } catch {
      toast.error('Failed to update role.');
    }
  }

  async function generateInvite() {
    if (!user) return;
    setGeneratingInvite(true);
    try {
      const token = await createInvitation(user.uid);
      const link = `${window.location.origin}/join/${token}`;
      setInviteLink(link);
    } catch {
      toast.error('Failed to generate invite.');
    } finally {
      setGeneratingInvite(false);
    }
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
    toast.success('Invite link copied!');
  }

  const pendingRequests = changeRequests.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Admin Dashboard</h1>
            <p className="text-stone-500 text-sm">Manage the Kassim Pillai Family Tree</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">
              Requests {pendingRequests.length > 0 && <span className="ml-1 bg-amber-600 text-white text-xs rounded-full px-1.5">{pendingRequests.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            {loading ? <LoadingSpinner /> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total Members', value: stats?.totalMembers ?? 0, icon: '\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66' },
                    { label: 'Living', value: stats?.livingMembers ?? 0, icon: '\ud83c\udf31' },
                    { label: 'Generations', value: stats?.generations ?? 0, icon: '\ud83c\udfd7\ufe0f' },
                    { label: 'Pending Changes', value: pendingRequests.length, icon: '\u23f3', highlight: pendingRequests.length > 0 },
                  ].map(s => (
                    <Card key={s.label} className={s.highlight ? 'border-amber-300 bg-amber-50' : ''}>
                      <CardContent className="pt-6">
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <div className="text-3xl font-bold text-stone-800">{s.value}</div>
                        <div className="text-sm text-stone-500 mt-0.5">{s.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recently added */}
                {stats?.recentlyAdded?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>Recently Added</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {stats.recentlyAdded.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-stone-800 text-sm">{p.fullName}</p>
                              <p className="text-xs text-stone-400">{formatRelativeTime(p.createdAt)}</p>
                            </div>
                            <Badge variant={p.gender === 'male' ? 'male' : p.gender === 'female' ? 'female' : 'secondary'}>
                              {p.gender}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Change Requests */}
          <TabsContent value="requests">
            {loading ? <LoadingSpinner /> : (
              <div className="space-y-4">
                {changeRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500">No change requests.</p>
                  </div>
                ) : (
                  changeRequests.map(req => (
                    <ChangeRequestCard
                      key={req.id}
                      request={req}
                      onApprove={() => handleReview(req.id, 'approved')}
                      onReject={() => handleReview(req.id, 'rejected')}
                    />
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            {loading ? <LoadingSpinner /> : (
              <div className="space-y-3">
                {/* Invite */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-stone-800 mb-2">Invite Family Member</h3>
                    <p className="text-stone-500 text-sm mb-3">Generate a secure invitation link (valid 7 days).</p>
                    {inviteLink ? (
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={inviteLink}
                          className="flex-1 text-xs border rounded-lg px-2 py-1.5 bg-white font-mono"
                        />
                        <Button size="sm" onClick={copyInvite}>
                          {copiedInvite ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedInvite ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={generateInvite} disabled={generatingInvite}>
                        {generatingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Generate Invite Link
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Users list */}
                {allUsers.map(u => (
                  <Card key={u.id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-stone-800">{u.displayName}</p>
                          <p className="text-xs text-stone-400">{u.email}</p>
                          <p className="text-xs text-stone-400">Joined {formatRelativeTime(u.createdAt)}</p>
                        </div>
                        <Select
                          value={u.role}
                          onValueChange={(v) => handleRoleChange(u.id, v)}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                            <SelectItem value="FAMILY_MEMBER">Family Member</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* People */}
          <TabsContent value="people">
            {loading ? <LoadingSpinner /> : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-stone-500">{people.length} people in database</span>
                </div>
                {people
                  .filter(p => !p.isDeleted)
                  .sort((a, b) => a.fullName.localeCompare(b.fullName))
                  .map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200">
                    <div>
                      <p className={`font-medium text-stone-800 text-sm ${p.isPlaceholder ? 'italic text-stone-400' : ''}`}>
                        {p.isPlaceholder ? 'Placeholder' : p.fullName}
                      </p>
                      <p className="text-xs text-stone-400">
                        {p.gender} &bull; {p.isPlaceholder ? 'Placeholder' : p.isLiving ? 'Living' : 'Deceased'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={p.isPlaceholder ? 'warning' : 'secondary'}>
                        {p.isPlaceholder ? 'Placeholder' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Audit Log */}
          <TabsContent value="audit">
            {loading ? <LoadingSpinner /> : (
              <Card>
                <CardHeader><CardTitle>Audit Log (Last 100 entries)</CardTitle></CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-6">No audit records yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.map(log => (
                        <div key={log.id} className="flex gap-3 pb-3 border-b border-stone-100 last:border-0">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-stone-800">{log.action}</p>
                            <p className="text-sm text-stone-600">{log.details}</p>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {formatDate(log.createdAt)} &mdash; {log.performedByName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader><CardTitle>Family Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="font-semibold text-stone-800 mb-1">Privacy: Family-Only</p>
                  <p className="text-stone-500 text-sm">Only authenticated family members can view the tree.</p>
                </div>
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
                  <p className="font-semibold text-stone-800 mb-1">Edit Approval: Required</p>
                  <p className="text-stone-500 text-sm">All edits by family members require admin approval.</p>
                </div>
                <p className="text-xs text-stone-400">More settings coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ChangeRequestCard({ request, onApprove, onReject }: {
  request: ChangeRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'destructive',
    clarification_needed: 'outline',
  } as const;

  return (
    <Card className={request.status === 'pending' ? 'border-amber-200' : ''}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={statusColors[request.status]}>{request.status}</Badge>
              <span className="text-xs text-stone-400">{request.type}</span>
            </div>
            <p className="font-medium text-stone-800 text-sm">{request.reason || 'No reason provided'}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              by {request.requestedByName} &bull; {formatRelativeTime(request.createdAt)}
            </p>

            {/* Changes detail */}
            {expanded && Object.keys(request.changes || {}).length > 0 && (
              <div className="mt-3 space-y-1.5">
                {Object.entries(request.changes).map(([field, { old: oldVal, new: newVal }]) => (
                  <div key={field} className="text-xs bg-stone-50 rounded-lg p-2">
                    <span className="font-medium text-stone-600">{field}:</span>
                    <span className="text-red-500 ml-2 line-through">{String(oldVal) || 'empty'}</span>
                    <span className="text-emerald-600 ml-2">{String(newVal)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* New person data */}
            {expanded && request.newPersonData && (
              <div className="mt-3 text-xs bg-emerald-50 rounded-lg p-2">
                <p className="font-medium text-emerald-700">New person: {request.newPersonData.fullName}</p>
                <p className="text-emerald-600">Gender: {request.newPersonData.gender || 'unknown'}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-stone-400 hover:text-stone-600 mt-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {request.status === 'pending' && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
            <Button size="sm" variant="success" onClick={onApprove}>
              <Check className="w-4 h-4" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={onReject}>
              <X className="w-4 h-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
    </div>
  );
}
