'use client';
import { useRouter } from 'next/navigation';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Icons } from '@/components/icons';
export default function SelectRolePage() {
  const router = useRouter();
  const roles = [
    {
      id: 'seeker',
      title: 'Service Seeker',
      description: '(Customer)',
      icon: <Icons.UserIcon className="text-primary h-6 w-6" />,
      onClick: () => router.push('/feed'),
    },
    {
      id: 'provider',
      title: 'Service Provider',
      description: '(Beautician/Practitioner)',
      icon: <Icons.UserIcon className="text-primary h-6 w-6" />,
      onClick: () => router.push('/provider/dashboard'),
    },
    {
      id: 'admin',
      title: 'Admin',
      description: '(Web-Based Panel)',
      icon: <Icons.UserIcon className="text-primary h-6 w-6" />,
      onClick: () => router.push('/admin/dashboard'),
    },
  ];
  return (
    <MobileLayout hideNavigation>
      <div className="flex h-full flex-col px-6 py-12">
        <h1 className="mb-8 text-2xl font-bold">Select Your Role</h1>
        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={role.onClick}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                  {role.icon}
                </div>
                <div className="ml-3 text-left">
                  <p className="text-base font-medium text-gray-900">{role.title}</p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <Icons.ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4">
          <div className="flex space-x-6">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <Icons.UserIcon className="h-5 w-5 text-gray-500" />
              </div>
              <span className="mt-1 text-xs text-gray-500">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
