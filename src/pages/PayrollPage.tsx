import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export default function PayrollPage() {
  const { role } = useAuth();
  const isOwner = role === 'owner';

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      const { data } = await supabase.from('payroll').select('*').order('month', { ascending: false });
      return data || [];
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-names-payroll'],
    enabled: isOwner,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('user_id, name');
      return data || [];
    },
  });

  const getProfileName = (userId: string) => profiles.find((p: any) => p.user_id === userId)?.name || 'Unknown';
  const totalPayroll = records.reduce((sum: number, p: any) => sum + (p.net_salary || 0), 0);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{isOwner ? 'Payroll' : 'My Salary'}</h1>
          <p className="text-sm text-muted-foreground">
            {isOwner ? `Total payroll: ₹${totalPayroll.toLocaleString()}` : 'View your salary details'}
          </p>
        </div>
        {isOwner && (
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
        )}
      </div>

      {records.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No payroll records yet</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs">
                  {isOwner && <th className="text-left p-3 font-medium">Employee</th>}
                  <th className="text-left p-3 font-medium">Month</th>
                  <th className="text-right p-3 font-medium">Base Salary</th>
                  <th className="text-right p-3 font-medium">Bonus</th>
                  <th className="text-right p-3 font-medium">Deductions</th>
                  <th className="text-right p-3 font-medium">Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {records.map((p: any) => (
                  <tr key={p.id} className="border-t border-border">
                    {isOwner && <td className="p-3 font-medium">{getProfileName(p.user_id)}</td>}
                    <td className="p-3 text-muted-foreground">{p.month}</td>
                    <td className="p-3 text-right">₹{(p.base_salary || 0).toLocaleString()}</td>
                    <td className="p-3 text-right text-success">+₹{(p.bonus || 0).toLocaleString()}</td>
                    <td className="p-3 text-right text-destructive">-₹{(p.deductions || 0).toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold">₹{(p.net_salary || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
