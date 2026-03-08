import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function LeavesPage() {
  const { role, user } = useAuth();
  const isOwner = role === 'owner';
  const [applyOpen, setApplyOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
  };

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const { data } = await supabase.from('leaves').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-names'],
    enabled: isOwner,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('user_id, name');
      return data || [];
    },
  });

  const getProfileName = (userId: string) => profiles.find((p: any) => p.user_id === userId)?.name || 'Unknown';

  const applyLeaveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('leaves').insert({
        user_id: user!.user_id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Leave request submitted');
      setApplyOpen(false);
      setLeaveType(''); setStartDate(''); setEndDate(''); setReason('');
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateLeaveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('leaves').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Leave updated');
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{isOwner ? 'Leave Management' : 'My Leaves'}</h1>
          <p className="text-sm text-muted-foreground">{leaves.length} leave requests</p>
        </div>
        {!isOwner && (
          <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Apply Leave</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div><Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                  <div><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                </div>
                <div><Label>Reason</Label><Input placeholder="Reason for leave" value={reason} onChange={e => setReason(e.target.value)} /></div>
                <Button className="w-full" onClick={() => applyLeaveMutation.mutate()} disabled={applyLeaveMutation.isPending}>
                  {applyLeaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {leaves.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No leave requests yet</p>
      ) : (
        <div className="space-y-3">
          {leaves.map((l: any) => (
            <div key={l.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {isOwner && <p className="font-medium text-sm">{getProfileName(l.user_id)}</p>}
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', statusStyles[l.status])}>
                    {l.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground capitalize">{l.leave_type} leave • {l.start_date} to {l.end_date}</p>
                {l.reason && <p className="text-xs text-muted-foreground mt-1">{l.reason}</p>}
              </div>
              {isOwner && l.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" className="text-success hover:bg-success/10" onClick={() => updateLeaveMutation.mutate({ id: l.id, status: 'approved' })}><Check className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => updateLeaveMutation.mutate({ id: l.id, status: 'rejected' })}><X className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
