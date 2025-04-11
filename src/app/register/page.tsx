import { redirect } from 'next/navigation';
import { NextPage } from 'next';

export default function RegisterRedirect() {
  redirect('/auth/sign-up');
} 