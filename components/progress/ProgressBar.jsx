'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function ProgressBar({ 
  value = 0, 
  max = 100, 
  label, 
  showPercentage = true,
  variant = 'default',
  size = 'default',
  className 
}) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-primary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-1';
      case 'lg':
        return 'h-4';
      default:
        return 'h-2';
    }
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-medium">{percentage}%</span>}
        </div>
      )}
      <Progress 
        value={percentage} 
        className={cn(getSizeClasses())}
        indicatorClassName={getVariantClasses()}
      />
    </div>
  );
}