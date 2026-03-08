import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { attendanceRecords, users } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AttendancePage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [checkedIn, setCheckedIn] = useState(false);

  const statusColors: Record<string, string> = {
    present: 'bg-success/10 text-success',
    absent: 'bg-destructive/10 text-destructive',
    late: 'bg-warning/10 text-warning',
    'half-day': 'bg-info/10 text-info',
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Attendance</h1>
          <p className="text-sm text-muted-foreground">Mark your daily attendance</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold mb-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-3xl font-bold text-primary my-4">
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {!checkedIn ? (
            <Button className="gap-2" size="lg" onClick={() => setCheckedIn(true)}>
              <LogIn className="w-4 h-4" /> Check In
            </Button>
          ) : (
            <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive/10" size="lg" onClick={() => setCheckedIn(false)}>
              <LogOut className="w-4 h-4" /> Check Out
            </Button>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Recent Attendance</h3>
          <div className="space-y-2">
            {attendanceRecords.filter(a => a.user_id === user?.id).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">{a.date}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{a.check_in || '—'} → {a.check_out || '—'}</span>
                  <span className={cn('px-2 py-0.5 rounded-full font-medium capitalize', statusColors[a.status])}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground">Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(statusColors).map(([status, cls]) => {
          const count = attendanceRecords.filter(a => a.date === '2026-03-08' && a.status === status).length;
          return (
            <div key={status} className="stat-card text-center">
              <p className={cn('text-2xl font-bold', cls.split(' ')[1])}>{count}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">{status}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-3 bg-muted/50 text-xs font-medium text-muted-foreground">
          <span>Employee</span>
          <span>Check In</span>
          <span>Check Out</span>
          <span>Status</span>
          <span>Hours</span>
        </div>
        {attendanceRecords.filter(a => a.date === '2026-03-08').map(a => {
          const hours = a.check_in && a.check_out
            ? ((parseInt(a.check_out.split(':')[0]) * 60 + parseInt(a.check_out.split(':')[1])) - (parseInt(a.check_in.split(':')[0]) * 60 + parseInt(a.check_in.split(':')[1]))) / 60
            : null;
          return (
            <div key={a.id} className="grid grid-cols-5 gap-4 p-3 border-t border-border items-center text-sm">
              <span className="font-medium truncate">{getUserName(a.user_id)}</span>
              <span className="text-muted-foreground">{a.check_in || '—'}</span>
              <span className="text-muted-foreground">{a.check_out || '—'}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize w-fit', statusColors[a.status])}>{a.status}</span>
              <span className="text-muted-foreground">{hours ? `${hours.toFixed(1)}h` : '—'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
