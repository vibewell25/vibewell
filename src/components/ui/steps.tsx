import { cn } from '@/lib/utils';

interface StepsProps {
  steps: Array<{
    id: string;
    title: string;
  }>;
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn('flex items-center justify-center w-full', className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'flex items-center',
            index < steps.length - 1 && 'flex-1'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border-2',
              index <= currentStep
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground text-muted-foreground'
            )}
          >
            {index + 1}
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2',
                index < currentStep
                  ? 'bg-primary'
                  : 'bg-muted-foreground'
              )}
            />
          )}
          
          <div
            className={cn(
              'absolute mt-10 text-sm',
              index <= currentStep
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}
          >
            {step.title}
          </div>
        </div>
      ))}
    </div>
  );
} 