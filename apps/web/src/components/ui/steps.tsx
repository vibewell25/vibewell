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
    <div className={cn('flex w-full items-center justify-center', className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}
        >
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2',
              index <= currentStep
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground text-muted-foreground',
            )}
          >
            {index + 1}
          </div>

          {index < steps.length - 1 && (
            <div
              className={cn(
                'mx-2 h-0.5 flex-1',
                index < currentStep ? 'bg-primary' : 'bg-muted-foreground',
              )}
            />
          )}

          <div
            className={cn(
              'absolute mt-10 text-sm',
              index <= currentStep ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {step.title}
          </div>
        </div>
      ))}
    </div>
  );
}
