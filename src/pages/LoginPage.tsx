import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, ArrowRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = () => {
    if (mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError('');
    setStep('otp');
  };

  const handleVerifyOTP = () => {
    if (otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }
    // Mock: any OTP works
    login(mobile);
    navigate('/dashboard');
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
            {step === 'mobile' ? (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
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
                {error && <p className="text-xs text-destructive mb-3">{error}</p>}
                <Button onClick={handleSendOTP} className="w-full gap-2">
                  Send OTP <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-4">
                  Demo: Enter any number, then any 4+ digit OTP
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-lg font-semibold mb-1">Verify OTP</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Enter the OTP sent to {mobile}
                </p>
                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mb-4 text-center text-lg tracking-[0.5em]"
                  maxLength={6}
                />
                {error && <p className="text-xs text-destructive mb-3">{error}</p>}
                <Button onClick={handleVerifyOTP} className="w-full gap-2 mb-3">
                  Verify & Login <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={() => { setStep('mobile'); setOtp(''); setError(''); }}>
                  Change number
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 bg-card rounded-xl border border-border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Demo Accounts</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner:</span>
              <button onClick={() => { setMobile('+919876543210'); }} className="text-primary font-medium">+919876543210</button>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Worker:</span>
              <button onClick={() => { setMobile('+919876543211'); }} className="text-primary font-medium">+919876543211</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
