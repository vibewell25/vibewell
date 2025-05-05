import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
export {};
