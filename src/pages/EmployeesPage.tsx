import { useState } from 'react';
import { users, departments } from '@/data/mock';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, MoreVertical, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeesPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);

  const employees = users.filter(u => u.role === 'worker');
  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.mobile.includes(search);
    const matchDept = deptFilter === 'all' || e.department_id === deptFilter;
    return matchSearch && matchDept;
  });

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '';

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
              <div><Label>Full Name</Label><Input placeholder="John Doe" /></div>
              <div><Label>Mobile Number</Label><Input placeholder="+91 98765 43210" type="tel" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Department</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Position</Label><Input placeholder="Developer" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Salary</Label><Input placeholder="50000" type="number" /></div>
                <div><Label>Joining Date</Label><Input type="date" /></div>
              </div>
              <div><Label>Address</Label><Input placeholder="Full address" /></div>
              <Button className="w-full mt-2" onClick={() => setAddOpen(false)}>Add Employee</Button>
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
            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filtered.map(emp => (
          <div key={emp.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {emp.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{emp.name}</p>
              <p className="text-xs text-muted-foreground">{emp.position} • {getDeptName(emp.department_id)}</p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" /> {emp.mobile}
            </div>
            <div className="hidden lg:block text-xs text-muted-foreground">
              ₹{emp.salary.toLocaleString()}/mo
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
