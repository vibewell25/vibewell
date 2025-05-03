import { Button } from '@/components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function PaginationArrow({
  direction,
  onClick,
  disabled = false,
  className,
}: PaginationArrowProps) {
  const Icon = direction === 'left' ? ChevronLeftIcon : ChevronRightIcon;

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('h-8 w-8', className)}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{direction === 'left' ? 'Previous page' : 'Next page'}</span>
    </Button>
  );
}
