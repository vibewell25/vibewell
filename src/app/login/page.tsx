import { redirect } from 'next/navigation';
import { NextPage } from 'next';

export default function LoginRedirect() {
  redirect('/auth/sign-in');
} 