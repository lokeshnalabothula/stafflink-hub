import { useAuth } from '@/contexts/AuthContext';
import { payrollRecords } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function PayrollPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const records = isOwner ? payrollRecords : payrollRecords.filter(p => p.user_id === user?.id);

  const totalPayroll = payrollRecords.reduce((sum, p) => sum + p.net_salary, 0);

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
                <th className="text-center p-3 font-medium">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {records.map(p => (
                <tr key={p.id} className="border-t border-border">
                  {isOwner && <td className="p-3 font-medium">{p.user_name}</td>}
                  <td className="p-3 text-muted-foreground">{p.month}</td>
                  <td className="p-3 text-right">₹{p.base_salary.toLocaleString()}</td>
                  <td className="p-3 text-right text-success">+₹{p.bonus.toLocaleString()}</td>
                  <td className="p-3 text-right text-destructive">-₹{p.deductions.toLocaleString()}</td>
                  <td className="p-3 text-right font-semibold">₹{p.net_salary.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <Download className="w-3 h-3" /> PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
