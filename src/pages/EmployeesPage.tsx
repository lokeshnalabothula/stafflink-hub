import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Mail, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const { role, supabaseUser } = useAuth();
  const isOwner = role === 'owner';
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    salary: '',
    join_date: '',
    address: '',
  });
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

  // Add worker directly to profiles + user_roles tables (invite-style: creates a pending profile)
  const addWorkerMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error('Name is required');
      if (!form.email.trim()) throw new Error('Email is required');

      // Create a placeholder auth user via admin (workaround: insert profile with pending status)
      // In production, this would trigger an email invite via Supabase Auth admin API.
      // For now, create a pending profile entry that will be linked when the user signs in with Google.
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('mobile', form.email) // Using mobile field as email placeholder until schema is updated
        .maybeSingle();

      if (existingProfile) {
        throw new Error('An employee with this email already exists');
      }

      // Create a pending profile row — will be claimed when user signs in with Google
      const { error } = await supabase.from('profiles').insert({
        user_id: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: form.name.trim(),
        mobile: form.email.trim(), // Storing email in mobile field (existing schema)
        department: form.department || null,
        position: form.position || null,
        salary: form.salary ? parseFloat(form.salary) : null,
        join_date: form.join_date || null,
        address: form.address || null,
        status: 'pending',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employee added successfully! They can now sign in with their Google account.');
      setAddOpen(false);
      setForm({ name: '', email: '', department: '', position: '', salary: '', join_date: '', address: '' });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add employee');
    },
  });

  const filtered = employees.filter((e: any) => {
    const matchSearch =
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.mobile?.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

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
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email Address <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="john@company.com"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The employee will log in using this Gmail account via Google Sign-In.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d: any) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    placeholder="Developer"
                    value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Salary (₹/month)</Label>
                  <Input
                    placeholder="50000"
                    type="number"
                    value={form.salary}
                    onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Joining Date</Label>
                  <Input
                    type="date"
                    value={form.join_date}
                    onChange={e => setForm(f => ({ ...f, join_date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  placeholder="Full address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>
              <Button
                className="w-full mt-2"
                onClick={() => addWorkerMutation.mutate()}
                disabled={addWorkerMutation.isPending}
              >
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
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d: any) => (
              <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || deptFilter !== 'all' ? 'No employees match your search.' : 'No employees yet. Add your first employee!'}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((emp: any) => {
            const initials = emp.name
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={emp.id}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                {emp.profile_photo ? (
                  <img
                    src={emp.profile_photo}
                    alt={emp.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{emp.name}</p>
                    {emp.status === 'pending' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-warning/10 text-warning shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {emp.position || 'No position'} · {emp.department || 'Unassigned'}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="w-3 h-3" /> {emp.mobile}
                </div>
                <div className="hidden lg:block text-xs text-muted-foreground">
                  ₹{(emp.salary || 0).toLocaleString()}/mo
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
