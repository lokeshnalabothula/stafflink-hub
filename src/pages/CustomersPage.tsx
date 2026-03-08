import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CustomersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', mobile: '', email: '', address: '' });
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const addCustomerMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('customers').insert({
        name: form.name,
        company: form.company || null,
        mobile: form.mobile || null,
        email: form.email || null,
        address: form.address || null,
        created_by: user!.user_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Customer added');
      setAddOpen(false);
      setForm({ name: '', company: '', mobile: '', email: '', address: '' });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = customers.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search)
  );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} customers</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div><Label>Customer / Contact Name</Label><Input placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Company Name</Label><Input placeholder="Acme Corp" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Mobile</Label><Input placeholder="+91 98001 00100" type="tel" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} /></div>
                <div><Label>Email</Label><Input placeholder="contact@company.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div><Label>Address</Label><Input placeholder="Full address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <Button className="w-full mt-2" onClick={() => addCustomerMutation.mutate()} disabled={addCustomerMutation.isPending}>
                {addCustomerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, company or mobile..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No customers found</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cust: any, i: number) => (
            <motion.div
              key={cust.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {cust.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{cust.name}</p>
                  {cust.company && <p className="text-xs text-muted-foreground truncate">{cust.company}</p>}
                </div>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                {cust.mobile && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /> {cust.mobile}</div>}
                {cust.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" /> {cust.email}</div>}
                {cust.address && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" /> {cust.address}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
