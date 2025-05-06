import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const SignIn: NextPage = () => (
  <div className="max-w-md mx-auto mt-16 p-6">
    <h1 className="text-3xl font-bold mb-6">Sign In</h1>
    <div className="flex flex-col space-y-4">
      <a href="/api/auth/login"><Button>Sign In</Button></a>
    </div>
    <p className="mt-4">
      Don't have an account? <Link href="/signup"><a className="text-blue-500">Sign Up</a></Link>
    </p>
    <p className="mt-2">
      <Link href="/forgot-password"><a className="text-blue-500">Forgot Password?</a></Link>
    </p>
  </div>
export default SignIn;
