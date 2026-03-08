import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { Users, UserCheck, CalendarOff, Wallet, Clock, TrendingUp } from 'lucide-react';
import { users, attendanceRecords, leaveRequests, activityLogs, monthlyAttendance, departmentBreakdown } from '@/data/mock';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(215,90%,50%)', 'hsl(162,63%,41%)', 'hsl(38,92%,50%)', 'hsl(280,60%,50%)', 'hsl(0,72%,51%)'];

function OwnerDashboard() {
  const totalEmployees = users.filter(u => u.role === 'worker').length;
  const presentToday = attendanceRecords.filter(a => a.date === '2026-03-08' && a.status === 'present').length;
  const onLeave = leaveRequests.filter(l => l.status === 'approved' && l.start_date <= '2026-03-08' && l.end_date >= '2026-03-08').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={totalEmployees} icon={<Users className="w-5 h-5" />} trend="2 this month" trendUp />
        <StatCard title="Present Today" value={presentToday} icon={<UserCheck className="w-5 h-5" />} trend="85% rate" trendUp />
        <StatCard title="On Leave" value={onLeave} icon={<CalendarOff className="w-5 h-5" />} />
        <StatCard title="Monthly Payroll" value="₹4.02L" icon={<Wallet className="w-5 h-5" />} trend="3.2% increase" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
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
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={departmentBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45}>
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
            {activityLogs.map(a => (
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
  const todayAttendance = attendanceRecords.find(a => a.user_id === user?.id && a.date === '2026-03-08');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your daily overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Status"
          value={todayAttendance?.status ? todayAttendance.status.charAt(0).toUpperCase() + todayAttendance.status.slice(1) : 'Not marked'}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard title="Leave Balance" value="12 days" icon={<CalendarOff className="w-5 h-5" />} />
        <StatCard title="Net Salary (Feb)" value="₹81,500" icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      {todayAttendance && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Today's Attendance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-success/10 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Check In</p>
              <p className="text-lg font-bold text-success">{todayAttendance.check_in || '—'}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Check Out</p>
              <p className="text-lg font-bold text-destructive">{todayAttendance.check_out || '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === 'owner' ? <OwnerDashboard /> : <WorkerDashboard />;
}
