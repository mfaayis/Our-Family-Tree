'use client';
import { useEffect, useState } from 'react';
import { useFamilyTree } from '@/contexts/FamilyTreeContext';
import { getAuditLogs, getChangeRequests } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Activity, Clock, Loader2 } from 'lucide-react';
import type { AuditLog, ChangeRequest } from '@/lib/types';

export function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAuditLogs()]).then(([l]) => {
      setLogs(l);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const actionLabels: Record<string, string> = {
    CREATE_PERSON: 'Added new family member',
    UPDATE_PERSON: 'Updated family member',
    DELETE_PERSON: 'Removed family member',
    MERGE_PERSON: 'Merged duplicate records',
    CREATE_RELATIONSHIP: 'Added relationship',
    DELETE_RELATIONSHIP: 'Removed relationship',
    APPROVE_REQUEST: 'Approved change request',
    REJECT_REQUEST: 'Rejected change request',
    INVITE_USER: 'Invited new family member',
    CLAIM_PROFILE: 'Claimed profile',
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="pt-20 max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Activity Feed</h1>
            <p className="text-stone-500 text-sm">Recent changes to the family tree</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No activity yet.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-stone-200" />
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white shadow flex items-center justify-center shrink-0 z-10">
                    <div className="w-2 h-2 rounded-full bg-amber-600" />
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-stone-200 p-4 ml-1">
                    <p className="font-medium text-stone-800 text-sm">
                      {actionLabels[log.action] || log.action}
                    </p>
                    {log.personName && (
                      <p className="text-stone-600 text-sm">{log.personName}</p>
                    )}
                    <p className="text-stone-500 text-xs mt-1">{log.details}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-stone-300" />
                      <span className="text-xs text-stone-400">{formatRelativeTime(log.createdAt)} &mdash; {log.performedByName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
