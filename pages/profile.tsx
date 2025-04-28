import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useUser } from '@auth0/nextjs-auth0';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Profile: NextPage = () => {
  const { user, error, isLoading } = useUser();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.picture || '');
    }
  }, [user]);

  const handleUpdate = async () => {
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar }),
    });
    if (res.ok) setMsg('Profile updated');
    else setMsg('Error updating profile');
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
          <Input value={user?.email || ''} disabled />
        </div>
        <div>
          <label className="block mb-1">Avatar URL</label>
          <Input value={avatar} onChange={e => setAvatar(e.target.value)} />
        </div>
        <Button onClick={handleUpdate}>Save Changes</Button>
        <Button as="link" href="/change-password" variant="secondary">
          Change Password
        </Button>
      </div>
    </div>
  );
};

export default Profile;
