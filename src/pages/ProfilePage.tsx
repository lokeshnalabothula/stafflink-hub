import { useAuth } from '@/contexts/AuthContext';
import { departments } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, MapPin, Building, Briefcase, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  const dept = departments.find(d => d.id === user.department_id)?.name || '';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">View and manage your profile</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.position} • {dept}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><User className="w-3 h-3" /> Full Name</Label>
              <Input value={user.name} readOnly />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Phone className="w-3 h-3" /> Mobile</Label>
              <Input value={user.mobile} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Building className="w-3 h-3" /> Department</Label>
              <Input value={dept} readOnly />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Briefcase className="w-3 h-3" /> Position</Label>
              <Input value={user.position} readOnly />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Calendar className="w-3 h-3" /> Joining Date</Label>
              <Input value={user.join_date} readOnly />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><MapPin className="w-3 h-3" /> Address</Label>
              <Input value={user.address || ''} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
