import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { WebAuthnButton } from '../web-authn-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
from '../ui/dropdown-menu';
import { User, LogOut, Settings, UserPlus, Bell, Shield, HelpCircle, Mail } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

interface AuthNavigationProps {
  isAuthenticated: boolean;
  user?: {
    name?: string;
    email: string;
    avatar?: string;
    unreadNotifications?: number;
onLogout: () => void;
export {};
