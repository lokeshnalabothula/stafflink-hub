import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { Users, UserCheck, CalendarOff, Wallet, Clock, TrendingUp, ShoppingCart, IndianRupee, Package } from 'lucide-react';
import { users, attendanceRecords, leaveRequests, activityLogs, monthlyAttendance, departmentBreakdown, orders, monthlyRevenue } from '@/data/mock';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COLORS = ['hsl(215,90%,50%)', 'hsl(162,63%,41%)', 'hsl(38,92%,50%)', 'hsl(280,60%,50%)', 'hsl(0,72%,51%)'];

const priorityStyles: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

function OwnerDashboard() {
  const navigate = useNavigate();
  const totalEmployees = users.filter(u => u.role === 'worker').length;
  const presentToday = attendanceRecords.filter(a => a.date === '2026-03-08' && a.status === 'present').length;
  const onLeave = leaveRequests.filter(l => l.status === 'approved' && l.start_date <= '2026-03-08' && l.end_date >= '2026-03-08').length;
  const activeOrders = orders.filter(o => o.status === 'in-progress' || o.status === 'pending').length;
  const urgentOrders = orders.filter(o => o.priority === 'urgent' && o.status !== 'completed').length;
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0);
  const upcomingDeadlines = orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={totalEmployees} icon={<Users className="w-5 h-5" />} trend="2 this month" trendUp />
        <StatCard title="Present Today" value={presentToday} icon={<UserCheck className="w-5 h-5" />} trend={`${Math.round((presentToday / totalEmployees) * 100)}% rate`} trendUp iconBg="bg-success/10 text-success" />
        <StatCard title="Active Orders" value={activeOrders} icon={<ShoppingCart className="w-5 h-5" />} trend={urgentOrders > 0 ? `${urgentOrders} urgent` : undefined} trendUp={false} iconBg="bg-info/10 text-info" />
        <StatCard title="Total Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} icon={<IndianRupee className="w-5 h-5" />} trend="12% growth" trendUp iconBg="bg-warning/10 text-warning" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="On Leave" value={onLeave} icon={<CalendarOff className="w-5 h-5" />} iconBg="bg-destructive/10 text-destructive" />
        <StatCard title="Monthly Payroll" value="₹4.02L" icon={<Wallet className="w-5 h-5" />} trend="3.2% increase" />
        <StatCard title="Pending Orders" value={orders.filter(o => o.status === 'pending').length} icon={<Package className="w-5 h-5" />} iconBg="bg-warning/10 text-warning" />
        <StatCard title="Completed Orders" value={orders.filter(o => o.status === 'completed').length} icon={<TrendingUp className="w-5 h-5" />} trend="this month" trendUp iconBg="bg-success/10 text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Revenue & Orders Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(215,90%,50%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(215,90%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(215,90%,50%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Upcoming Deadlines</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/orders')}>View all</Button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map(o => {
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
                    <span>{o.customer_name}</span>
                    <span className={cn('font-medium', overdue ? 'text-destructive' : daysLeft <= 3 ? 'text-warning' : '')}>
                      {overdue ? 'Overdue!' : `${daysLeft}d left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyAttendance}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs" />
              <YAxis axisLine={false} tickLine={false} className="text-xs" />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(215,90%,50%)" radius={[4,4,0,0]} />
              <Bar dataKey="absent" fill="hsl(0,72%,51%)" radius={[4,4,0,0]} />
              <Bar dataKey="late" fill="hsl(38,92%,50%)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Departments</h3>
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
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Pending Leave Requests</h3>
          <div className="space-y-3">
            {leaveRequests.filter(l => l.status === 'pending').map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{l.user_name}</p>
                  <p className="text-xs text-muted-foreground">{l.leave_type} • {l.start_date} to {l.end_date}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">Pending</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {activityLogs.slice(0, 6).map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm">{a.action} — <span className="font-medium">{a.user_name}</span></p>
                  <p className="text-xs text-muted-foreground">{a.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todayAttendance = attendanceRecords.find(a => a.user_id === 'u2' && a.date === '2026-03-08');
  const myOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your daily overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Status"
          value={todayAttendance?.status ? todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 'Not marked'}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard title="Leave Balance" value="12 days" icon={<CalendarOff className="w-5 h-5" />} iconBg="bg-warning/10 text-warning" />
        <StatCard title="Net Salary (Feb)" value="₹81,500" icon={<TrendingUp className="w-5 h-5" />} iconBg="bg-success/10 text-success" />
        <StatCard title="My Active Orders" value={myOrders.length} icon={<ShoppingCart className="w-5 h-5" />} iconBg="bg-info/10 text-info" />
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
              {myOrders.slice(0, 4).map(o => {
                const daysLeft = Math.ceil((new Date(o.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={o.id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{o.title}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'text-xs font-medium',
                        daysLeft < 0 ? 'text-destructive' : daysLeft <= 3 ? 'text-warning' : 'text-muted-foreground'
                      )}>
                        {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{o.deadline}</p>
                    </div>
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
