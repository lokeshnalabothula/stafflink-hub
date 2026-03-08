import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AttendancePage() {
  const { role } = useAuth();
  const isOwner = role === 'owner';
  const today = new Date().toISOString().split('T')[0];

  const statusColors: Record<string, string> = {
    present: 'bg-success/10 text-success',
    absent: 'bg-destructive/10 text-destructive',
    late: 'bg-warning/10 text-warning',
    'half-day': 'bg-info/10 text-info',
  };

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['attendance', isOwner],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('*').order('date', { ascending: false });
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-map'],
    enabled: isOwner,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('user_id, name');
      return data || [];
    },
  });

  const getProfileName = (userId: string) => {
    const p = profiles.find((p: any) => p.user_id === userId);
    return p?.name || 'Unknown';
  };

  const todayRecords = attendance.filter((a: any) => a.date === today);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Attendance</h1>
          <p className="text-sm text-muted-foreground">Your attendance history</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-3">Recent Attendance</h3>
          {attendance.length > 0 ? (
            <div className="space-y-2">
              {attendance.slice(0, 20).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">{a.date}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{a.check_in || '—'} → {a.check_out || '—'}</span>
                    <span className={cn('px-2 py-0.5 rounded-full font-medium capitalize', statusColors[a.status])}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No attendance records</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Manage employee attendance — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(statusColors).map(([status, cls]) => {
          const count = todayRecords.filter((a: any) => a.status === status).length;
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
        {todayRecords.length > 0 ? todayRecords.map((a: any) => {
          const hours = a.check_in && a.check_out
            ? ((parseInt(a.check_out.split(':')[0]) * 60 + parseInt(a.check_out.split(':')[1])) - (parseInt(a.check_in.split(':')[0]) * 60 + parseInt(a.check_in.split(':')[1]))) / 60
            : null;
          return (
            <div key={a.id} className="grid grid-cols-5 gap-4 p-3 border-t border-border items-center text-sm">
              <span className="font-medium truncate">{getProfileName(a.user_id)}</span>
              <span className="text-muted-foreground">{a.check_in || '—'}</span>
              <span className="text-muted-foreground">{a.check_out || '—'}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize w-fit', statusColors[a.status])}>{a.status}</span>
              <span className="text-muted-foreground">{hours ? `${hours.toFixed(1)}h` : '—'}</span>
            </div>
          );
        }) : (
          <div className="p-6 text-center text-sm text-muted-foreground">No attendance records for today</div>
        )}
      </div>
    </div>
  );
}
