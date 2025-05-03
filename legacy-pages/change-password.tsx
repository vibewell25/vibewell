import React from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Button from '../components/ui/Button';

const ChangePassword: NextPage = () => (
  <div className="max-w-md mx-auto mt-16 p-6">
    <h1 className="text-3xl font-bold mb-6">Change Password</h1>
    <div className="flex flex-col space-y-4">
      <a href="/api/auth/login?screen_hint=reset">
        <Button>Change Password</Button>
      </a>
    </div>
    <p className="mt-4">
      Back to <Link href="/profile"><a className="text-blue-500">Profile</a></Link>
    </p>
  </div>
);

export default ChangePassword;
