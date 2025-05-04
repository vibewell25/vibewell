import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default function BeautyLayout({ children }: { children: ReactNode }) {
  redirect('/services');
  return null;
} 