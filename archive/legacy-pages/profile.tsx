import React, { useState } from 'react';
import type { NextPage } from 'next';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Link from 'next/link';
import { useUser } from '../src/utils/auth-utils';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

const Profile: NextPage = () => {
  const { user, error, isLoading } = useUser();
  const [name, setName] = useState(user?.name || 'John Doe');
  const [email, setEmail] = useState(user?.email || 'john@example.com');
  const [avatar, setAvatar] = useState(user?.picture || 'https://via.placeholder.com/150');
  const [msg, setMsg] = useState('');

  const handleUpdate = async () => {
    try {
      const res = await fetchWithTimeout('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar }),
      });
      if (res.ok) setMsg('Profile updated');
      else setMsg('Error updating profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMsg('Failed to update profile');
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error?.message}</p>;

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      {msg && <p className="mb-4 text-green-600">{msg}</p>}
      <div className="flex flex-col space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <Input value={email} disabled />
        </div>
        <div>
          <label className="block mb-1">Avatar URL</label>
          <Input value={avatar} onChange={e => setAvatar(e.target.value)} />
        </div>
        <Button onClick={handleUpdate}>Save Changes</Button>
        <Link href="/change-password">
          <Button className="bg-gray-500 hover:bg-gray-600 w-full">
            Change Password
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Profile;
