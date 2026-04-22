import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, MapPin, Building, Briefcase, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, role } = useAuth();
  if (!user) return null;

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">View and manage your profile information</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          {user.profile_photo ? (
            <img
              src={user.profile_photo}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-border">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">
              {user.position || 'Staff'} · {user.department || 'General'}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary mt-1 capitalize">
              <Shield className="w-3 h-3" />
              {role}
            </span>
          </div>
        </div>

        {/* Info Fields */}
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <User className="w-3 h-3" /> Full Name
              </Label>
              <Input value={user.name || ''} readOnly className="bg-muted/40" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3 h-3" /> Email Address
              </Label>
              <Input value={user.email || ''} readOnly className="bg-muted/40" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <Building className="w-3 h-3" /> Department
              </Label>
              <Input value={user.department || '—'} readOnly className="bg-muted/40" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3 h-3" /> Position
              </Label>
              <Input value={user.position || '—'} readOnly className="bg-muted/40" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3 h-3" /> Joining Date
              </Label>
              <Input value={user.join_date || '—'} readOnly className="bg-muted/40" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3 h-3" /> Address
              </Label>
              <Input value={user.address || '—'} readOnly className="bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
