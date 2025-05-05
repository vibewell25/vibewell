import Link from 'next/link';
import { NotificationIndicator } from '@/components/notifications/NotificationIndicator';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/user-menu';

export interface HeaderProps {
  className?: string;
export function Header({ className = '' }: HeaderProps) {
  const { user, loading } = useAuth();

  return (
    <header className={`border-b border-border bg-background py-4 ${className}`}>
      <div className="container-app mx-auto flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-primary text-2xl font-bold">Vibewell</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center space-x-4">
                  <NotificationIndicator />
                  <UserMenu />
                </div>
              ) : (
                <Link href="/auth/sign-in" className="btn-primary">
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
export default Header;
