import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { Users, UserCheck, CalendarOff, Wallet, Clock, TrendingUp, ShoppingCart, IndianRupee, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const COLORS = ['hsl(215,90%,50%)', 'hsl(162,63%,41%)', 'hsl(38,92%,50%)', 'hsl(280,60%,50%)', 'hsl(0,72%,51%)'];

const priorityStyles: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

function OwnerDashboard() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const { data: employees = [] } = useQuery({
    queryKey: ['dashboard-employees'],
    queryFn: async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'worker');
      return roles || [];
    },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['dashboard-attendance', today],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('*').eq('date', today);
      return data || [];
    },
  });

  const { data: leaves = [] } = useQuery({
    queryKey: ['dashboard-leaves'],
    queryFn: async () => {
      const { data } = await supabase.from('leaves').select('*');
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*');
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['dashboard-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('department');
      return data || [];
    },
  });

  const totalEmployees = employees.length;
  const presentToday = attendance.filter((a: any) => a.status === 'present').length;
  const onLeave = leaves.filter((l: any) => l.status === 'approved' && l.start_date <= today && l.end_date >= today).length;
  const activeOrders = orders.filter((o: any) => o.status === 'in-progress' || o.status === 'pending').length;
  const urgentOrders = orders.filter((o: any) => o.priority === 'urgent' && o.status !== 'completed').length;
  const totalRevenue = orders.filter((o: any) => o.status !== 'cancelled').reduce((s: number, o: any) => s + (o.amount || 0), 0);

  const upcomingDeadlines = orders
    .filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled' && o.deadline)
    .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // Department breakdown from profiles
  const deptMap: Record<string, number> = {};
  profiles.forEach((p: any) => {
    const dept = p.department || 'Unassigned';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const departmentBreakdown = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

  const pendingLeaves = leaves.filter((l: any) => l.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={totalEmployees} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Present Today" value={presentToday} icon={<UserCheck className="w-5 h-5" />} trend={totalEmployees > 0 ? `${Math.round((presentToday / totalEmployees) * 100)}% rate` : undefined} trendUp iconBg="bg-success/10 text-success" />
        <StatCard title="Active Orders" value={activeOrders} icon={<ShoppingCart className="w-5 h-5" />} trend={urgentOrders > 0 ? `${urgentOrders} urgent` : undefined} trendUp={false} iconBg="bg-info/10 text-info" />
        <StatCard title="Total Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} icon={<IndianRupee className="w-5 h-5" />} iconBg="bg-warning/10 text-warning" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="On Leave" value={onLeave} icon={<CalendarOff className="w-5 h-5" />} iconBg="bg-destructive/10 text-destructive" />
        <StatCard title="Pending Orders" value={orders.filter((o: any) => o.status === 'pending').length} icon={<Package className="w-5 h-5" />} iconBg="bg-warning/10 text-warning" />
        <StatCard title="Completed Orders" value={orders.filter((o: any) => o.status === 'completed').length} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-success/10 text-success" />
        <StatCard title="Pending Leaves" value={pendingLeaves.length} icon={<Clock className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Upcoming Deadlines</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/orders')}>View all</Button>
          </div>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((o: any) => {
                const daysLeft = Math.ceil((new Date(o.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const overdue = daysLeft < 0;
                return (
                  <div key={o.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate pr-2">{o.title}</p>
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0', priorityStyles[o.priority])}>
                        {o.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{o.deadline}</span>
                      <span className={cn('font-medium', overdue ? 'text-destructive' : daysLeft <= 3 ? 'text-warning' : '')}>
                        {overdue ? 'Overdue!' : `${daysLeft}d left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No upcoming deadlines</p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Departments</h3>
          {departmentBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={departmentBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={42}>
                    {departmentBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {departmentBreakdown.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d.name} ({d.count})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No department data</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Pending Leave Requests</h3>
          {pendingLeaves.length > 0 ? (
            <div className="space-y-3">
              {pendingLeaves.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">{l.leave_type} • {l.start_date} to {l.end_date}</p>
                    {l.reason && <p className="text-xs text-muted-foreground mt-0.5">{l.reason}</p>}
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">Pending</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No pending requests</p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Today's Attendance Summary</h3>
          {attendance.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['present', 'absent', 'late', 'half-day'].map(status => (
                <div key={status} className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl font-bold">{attendance.filter((a: any) => a.status === status).length}</p>
                  <p className="text-xs text-muted-foreground capitalize">{status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No attendance marked today</p>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const { data: todayAttendance } = useQuery({
    queryKey: ['my-attendance-today', today],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('*').eq('date', today).single();
      return data;
    },
  });

  const { data: myOrders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*');
      return (data || []).filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your daily overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Today's Status"
          value={todayAttendance?.status ? todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 'Not marked'}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard title="My Active Orders" value={myOrders.length} icon={<ShoppingCart className="w-5 h-5" />} iconBg="bg-info/10 text-info" />
        <StatCard title="Net Salary" value={user?.salary ? `₹${Number(user.salary).toLocaleString()}` : '—'} icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-success/10 text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {todayAttendance && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-3">Today's Attendance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-success/10 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Check In</p>
                <p className="text-xl font-bold text-success">{todayAttendance.check_in || '—'}</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Check Out</p>
                <p className="text-xl font-bold text-destructive">{todayAttendance.check_out || '—'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Upcoming Orders</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/orders')}>View all</Button>
          </div>
          {myOrders.length > 0 ? (
            <div className="space-y-3">
              {myOrders.slice(0, 4).map((o: any) => {
                const daysLeft = o.deadline ? Math.ceil((new Date(o.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                return (
                  <div key={o.id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{o.title}</p>
                    </div>
                    {daysLeft !== null && (
                      <div className="text-right">
                        <span className={cn(
                          'text-xs font-medium',
                          daysLeft < 0 ? 'text-destructive' : daysLeft <= 3 ? 'text-warning' : 'text-muted-foreground'
                        )}>
                          {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No upcoming orders</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { role } = useAuth();
  return role === 'owner' ? <OwnerDashboard /> : <WorkerDashboard />;
}
