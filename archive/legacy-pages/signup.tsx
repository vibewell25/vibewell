import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Button from '../components/ui/Button';

const SignUp: NextPage = () => (
  <div className="max-w-md mx-auto mt-16 p-6">
    <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
    <div className="flex flex-col space-y-4">
      <a href="/api/auth/login?screen_hint=signup"><Button>Sign Up</Button></a>
    </div>
    <p className="mt-4">
      Already have an account? <Link href="/signin"><a className="text-blue-500">Sign In</a></Link>
    </p>
  </div>
);

export default SignUp;
