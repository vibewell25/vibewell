'use client';;
import Image from 'next/image';
import { User } from 'lucide-react';

/**
 * UserAvatarProps interface defines the properties for the UserAvatar component
 * @interface UserAvatarProps
 * @property {string | null} [src] - The source URL for the avatar image
 * @property {string} [alt] - Alternative text for the avatar image
 * @property {'xs' | 'sm' | 'md' | 'lg'} [size] - Size of the avatar
 * @property {string} [fallbackInitials] - Initials to display when no image is available
 */
interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fallbackInitials?: string;
}

/**
 * UserAvatar component displays a user's avatar image, initials, or a fallback icon
 *
 * The component will render one of the following based on available data:
 * 1. An image if src is provided
 * 2. Initials if fallbackInitials is provided but no src
 * 3. A default user icon if neither src nor fallbackInitials are provided
 *
 * @param {UserAvatarProps} props - Component properties
 * @returns {JSX.Element} Rendered avatar component
 */
export function UserAvatar({
  src,
  alt = 'User avatar',
  size = 'md',
  fallbackInitials,
}: UserAvatarProps) {
  // Size mapping for classes
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  /**
   * Extracts initials from the user's name
   * @returns {string} Up to two uppercase initials from the name
   */
  const getInitials = () => {
    if (!fallbackInitials) return '';
    return fallbackInitials
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  // If we have a src, render an Image component
  if (src) {
    return (
      <div
        className={`relative ${sizeClasses[size]} flex-shrink-0 overflow-hidden rounded-full bg-muted`}
      >
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    );
  }
  // If we have fallback initials, show them
  if (fallbackInitials) {
    return (
      <div
        className={`${sizeClasses[size]} bg-primary/10 text-primary flex flex-shrink-0 items-center justify-center rounded-full text-sm font-medium`}
      >
        {getInitials()}
      </div>
    );
  }
  // Otherwise, show the default user icon
  return (
    <div
      className={`${sizeClasses[size]} flex flex-shrink-0 items-center justify-center rounded-full bg-muted`}
    >
      <User className="h-full w-full text-muted-foreground" />
    </div>
  );
}
