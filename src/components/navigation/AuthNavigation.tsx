import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { WebAuthnButton } from '../WebAuthnButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  User,
  LogOut,
  Settings,
  UserPlus,
  Bell,
  Shield,
  Key,
  HelpCircle,
  Mail,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

interface AuthNavigationProps {
  isAuthenticated: boolean;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    unreadNotifications?: number;
  };
  onLogout: () => void;
}

export const AuthNavigation: React.FC<AuthNavigationProps> = ({
  isAuthenticated,
  user,
  onLogout,
}) => {
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLoginSuccess = async (response: any) => {
    router.push('/dashboard');
  };

  const handleLoginError = (error: Error) => {
    console.error('Login error:', error);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <WebAuthnButton
          mode="login"
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
          className="hidden sm:flex"
        />
        <Link href="/auth/login">
          <Button variant="ghost" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Up</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Notifications */}
      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {user?.unreadNotifications ? (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0"
              >
                {user.unreadNotifications}
              </Badge>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          {/* Add notifications content here */}
        </SheetContent>
      </Sheet>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User avatar'}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user?.name && <p className="font-medium">{user.name}</p>}
              {user?.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/security" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/help" className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
