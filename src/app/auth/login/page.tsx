import { redirect } from 'next/navigation';

export default function LoginRedirect() {
  redirect('/auth/sign-in');
} 