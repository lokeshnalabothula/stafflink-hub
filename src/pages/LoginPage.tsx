import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, ArrowRight, Shield, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Step = 'mobile' | 'otp' | 'signup';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('worker');
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (mobile.length < 10) {
      toast.error('Please enter a valid mobile number with country code');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { mobile },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      toast.success('OTP sent to your mobile');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const body: any = { mobile, otp };
      if (isNewUser || step === 'signup') {
        body.name = name;
        body.role = role;
      }

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body,
      });
      if (error) throw error;
      if (data?.error) {
        if (data?.is_new_user) {
          setIsNewUser(true);
          setStep('signup');
          setLoading(false);
          return;
        }
        toast.error(data.error);
        return;
      }

      // Login with real session
      await login({
        user_id: data.user_id,
        role: data.role,
        profile: data.profile,
        session: data.session,
      });
      toast.success('Welcome to StaffHub!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      // Re-send OTP for the signup flow
      const { data: sendData } = await supabase.functions.invoke('send-otp', {
        body: { mobile },
      });
      if (sendData?.error) {
        toast.error(sendData.error);
        setLoading(false);
        return;
      }
      toast.success('New OTP sent. Please verify to complete signup.');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">StaffHub</h1>
          <p className="text-sm text-muted-foreground mt-1">Staff Management System</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <AnimatePresence mode="wait">
            {step === 'mobile' && (
              <motion.div key="mobile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-lg font-semibold mb-1">Login</h2>
                <p className="text-sm text-muted-foreground mb-5">Enter your mobile number to receive OTP</p>
                <div className="relative mb-4">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="pl-10"
                    type="tel"
                  />
                </div>
                <Button onClick={handleSendOTP} className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Send OTP
                </Button>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-lg font-semibold mb-1">Verify OTP</h2>
                <p className="text-sm text-muted-foreground mb-5">Enter the 6-digit OTP sent to {mobile}</p>
                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mb-4 text-center text-lg tracking-[0.5em]"
                  maxLength={6}
                />
                <Button onClick={handleVerifyOTP} className="w-full gap-2 mb-3" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Verify & Login
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={() => { setStep('mobile'); setOtp(''); }}>
                  Change number
                </Button>
              </motion.div>
            )}

            {step === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <h2 className="text-lg font-semibold mb-1">Create Account</h2>
                <p className="text-sm text-muted-foreground mb-5">New user! Please enter your details.</p>
                <div className="space-y-4 mb-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="worker">Worker</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Owner: Full access to manage staff. Worker: View personal data.
                    </p>
                  </div>
                </div>
                <Button onClick={handleSignupSubmit} className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Continue
                </Button>
                <Button variant="ghost" className="w-full text-sm mt-2" onClick={() => { setStep('mobile'); setIsNewUser(false); }}>
                  Back
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
