import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreVertical, Phone, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EmployeesPage() {
  const { role } = useAuth();
  const isOwner = role === 'owner';
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', department: '', position: '', salary: '', join_date: '', address: '' });
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await supabase.from('departments').select('*');
      return data || [];
    },
  });

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      // Get all worker profiles
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'worker');
      if (!roles?.length) return [];
      const workerIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', workerIds);
      return profiles || [];
    },
  });

  const addWorkerMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('add-worker', {
        body: form,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Worker added successfully');
      setAddOpen(false);
      setForm({ name: '', mobile: '', department: '', position: '', salary: '', join_date: '', address: '' });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add worker');
    },
  });

  const filtered = employees.filter((e: any) => {
    const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase()) || e.mobile?.includes(search);
    const matchDept = deptFilter === 'all' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const getDeptName = (name: string) => name || 'Unassigned';

  if (!isOwner) return <p className="text-muted-foreground">Access denied.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">{employees.length} total employees</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Employee</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Employee</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label>Full Name</Label><Input placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Mobile Number</Label><Input placeholder="+91 98765 43210" type="tel" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Department</Label>
                  <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{departments.map((d: any) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Position</Label><Input placeholder="Developer" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Salary</Label><Input placeholder="50000" type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} /></div>
                <div><Label>Joining Date</Label><Input type="date" value={form.join_date} onChange={e => setForm(f => ({ ...f, join_date: e.target.value }))} /></div>
              </div>
              <div><Label>Address</Label><Input placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <Button className="w-full mt-2" onClick={() => addWorkerMutation.mutate()} disabled={addWorkerMutation.isPending}>
                {addWorkerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or mobile..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d: any) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No employees found. Add your first worker!</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((emp: any) => (
            <div key={emp.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {emp.name?.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{emp.name}</p>
                  {emp.status === 'pending' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-warning/10 text-warning">Pending</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{emp.position || 'No position'} • {getDeptName(emp.department)}</p>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" /> {emp.mobile}
              </div>
              <div className="hidden lg:block text-xs text-muted-foreground">
                ₹{(emp.salary || 0).toLocaleString()}/mo
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
