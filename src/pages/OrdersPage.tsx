import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { orders, customers, users } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Calendar, AlertTriangle, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const priorityStyles: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  'in-progress': 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-muted text-muted-foreground',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  'in-progress': <ArrowRight className="w-3.5 h-3.5" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
};

export default function OrdersPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);

  const myOrders = isOwner ? orders : orders.filter(o => o.assigned_to.includes(user?.id || ''));
  const filtered = myOrders.filter(o => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getDaysLeft = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const workers = users.filter(u => u.role === 'worker');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{isOwner ? 'Orders' : 'My Orders'}</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} orders</p>
        </div>
        {isOwner && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> New Order</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create New Order</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div><Label>Order Title</Label><Input placeholder="e.g. Website Redesign" /></div>
                <div><Label>Description</Label><Input placeholder="Brief description of the order" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Customer</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                      <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Priority</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Deadline</Label><Input type="date" /></div>
                  <div><Label>Amount (₹)</Label><Input type="number" placeholder="100000" /></div>
                </div>
                <div><Label>Assign Workers</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select workers" /></SelectTrigger>
                    <SelectContent>{workers.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button className="w-full mt-2" onClick={() => setAddOpen(false)}>Create Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary cards for owner */}
      {isOwner && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['pending', 'in-progress', 'completed', 'cancelled'] as const).map(status => (
            <div key={status} className="stat-card text-center">
              <div className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2', statusStyles[status])}>
                {statusIcons[status]}
                <span className="capitalize">{status}</span>
              </div>
              <p className="text-2xl font-bold">{orders.filter(o => o.status === status).length}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders or customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {filtered.map((order, i) => {
          const daysLeft = getDaysLeft(order.deadline);
          const overdue = daysLeft < 0;
          const urgent = daysLeft >= 0 && daysLeft <= 3;
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sm">{order.title}</p>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', statusStyles[order.status])}>
                      {order.status}
                    </span>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', priorityStyles[order.priority])}>
                      {order.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{order.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Customer: <span className="font-medium text-foreground">{order.customer_name}</span></span>
                    <span>Amount: <span className="font-medium text-foreground">₹{order.amount.toLocaleString()}</span></span>
                    <span className="flex items-center gap-1">
                      Assigned: {order.assigned_names.map(n => (
                        <span key={n} className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">{n.split(' ')[0]}</span>
                      ))}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  'text-right shrink-0 px-3 py-2 rounded-lg text-xs font-medium',
                  overdue ? 'bg-destructive/10 text-destructive' : urgent ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                )}>
                  <Calendar className="w-3.5 h-3.5 mx-auto mb-1" />
                  {overdue ? (
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Overdue</span>
                  ) : (
                    <span>{daysLeft}d left</span>
                  )}
                  <p className="text-[10px] mt-0.5 opacity-70">{order.deadline}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
