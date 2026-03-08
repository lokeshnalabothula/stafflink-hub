import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ['reports-attendance'],
    queryFn: async () => {
      const { data } = await supabase.from('attendance').select('date, status');
      return data || [];
    },
  });

  // Group by month
  const monthMap: Record<string, { present: number; absent: number; late: number }> = {};
  attendance.forEach((a: any) => {
    const month = a.date?.substring(0, 7); // YYYY-MM
    if (!month) return;
    if (!monthMap[month]) monthMap[month] = { present: 0, absent: 0, late: 0 };
    if (a.status === 'present') monthMap[month].present++;
    else if (a.status === 'absent') monthMap[month].absent++;
    else if (a.status === 'late') monthMap[month].late++;
  });

  const monthlyAttendance = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleString('en', { month: 'short' }),
      ...data,
    }));

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Analytics and reports</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export Report</Button>
      </div>

      {monthlyAttendance.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4">Monthly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyAttendance}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="hsl(215,90%,50%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="absent" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-4">Late Arrivals</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyAttendance}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="late" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">No attendance data to generate reports. Start marking attendance to see analytics.</p>
        </div>
      )}
    </div>
  );
}
