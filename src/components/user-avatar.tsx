import { Icons } from '@/components/icons';
'use client';
import Image from 'next/image';
interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fallbackInitials?: string;
}
export function UserAvatar({ 
  src, 
  alt = 'User avatar', 
  size = 'md',
  fallbackInitials
}: UserAvatarProps) {
  // Size mapping in pixels
  const sizeMap = {
    xs: 24, // h-6 w-6
    sm: 32, // h-8 w-8
    md: 40, // h-10 w-10
    lg: 48  // h-12 w-12
  };
  // Size mapping for classes
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  // Get initials from name
  const getInitials = () => {
    if (!fallbackInitials) return '';
    return fallbackInitials
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  // If we have a src, render an Image component
  if (src) {
    return (
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 bg-muted`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    );
  }
  // If we have fallback initials, show them
  if (fallbackInitials) {
    return (
      <div className={`${sizeClasses[size]} rounded-full flex-shrink-0 bg-primary/10 flex items-center justify-center text-primary font-medium text-sm`}>
        {getInitials()}
      </div>
    );
  }
  // Otherwise, show the default user icon
  return (
    <div className={`${sizeClasses[size]} rounded-full flex-shrink-0 bg-muted flex items-center justify-center`}>
      <Icons.UserCircleIcon className="h-full w-full text-muted-foreground" />
    </div>
  );
} 