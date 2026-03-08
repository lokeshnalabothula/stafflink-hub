import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconBg?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [value]);
  return <>{display}</>;
}

export function StatCard({ title, value, icon, trend, trendUp, className, iconBg }: StatCardProps) {
  const isNumber = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn('stat-card flex items-start justify-between group', className)}
    >
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold mt-1.5">
          {isNumber ? <AnimatedNumber value={value} /> : value}
        </p>
        {trend && (
          <p className={cn(
            'text-xs mt-1.5 font-medium flex items-center gap-1',
            trendUp === true ? 'text-success' : trendUp === false ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {trendUp === true ? '↑' : trendUp === false ? '↓' : ''} {trend}
          </p>
        )}
      </div>
      <div className={cn(
        'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110',
        iconBg || 'bg-primary/10 text-primary'
      )}>
        {icon}
      </div>
    </motion.div>
  );
}
