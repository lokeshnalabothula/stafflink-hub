import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaveRequests } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeavesPage() {
  const { role } = useAuth();
  const isOwner = role === 'owner';
  const [applyOpen, setApplyOpen] = useState(false);

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
  };

  const leaves = isOwner ? leaveRequests : leaveRequests.filter(l => l.user_id === 'u2');

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
                  <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Start Date</Label><Input type="date" /></div>
                  <div><Label>End Date</Label><Input type="date" /></div>
                </div>
                <div><Label>Reason</Label><Input placeholder="Reason for leave" /></div>
                <Button className="w-full" onClick={() => setApplyOpen(false)}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {leaves.map(l => (
          <div key={l.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{l.user_name}</p>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', statusStyles[l.status])}>
                  {l.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground capitalize">{l.leave_type} leave • {l.start_date} to {l.end_date}</p>
              <p className="text-xs text-muted-foreground mt-1">{l.reason}</p>
            </div>
            {isOwner && l.status === 'pending' && (
              <div className="flex gap-2 shrink-0">
                <Button size="icon" variant="ghost" className="text-success hover:bg-success/10"><Check className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10"><X className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
