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
      icon: <Icons.UserIcon className="w-6 h-6 text-primary" />,
      onClick: () => router.push('/feed'),
    },
    {
      id: 'provider',
      title: 'Service Provider',
      description: '(Beautician/Practitioner)',
      icon: <Icons.UserIcon className="w-6 h-6 text-primary" />,
      onClick: () => router.push('/provider/dashboard'),
    },
    {
      id: 'admin',
      title: 'Admin',
      description: '(Web-Based Panel)',
      icon: <Icons.UserIcon className="w-6 h-6 text-primary" />,
      onClick: () => router.push('/admin/dashboard'),
    },
  ];
  return (
    <MobileLayout hideNavigation>
      <div className="flex flex-col px-6 py-12 h-full">
        <h1 className="text-2xl font-bold mb-8">Select Your Role</h1>
        <div className="space-y-4">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={role.onClick}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                  {role.icon}
                </div>
                <div className="ml-3 text-left">
                  <p className="text-base font-medium text-gray-900">{role.title}</p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <Icons.ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center">
          <div className="flex space-x-6">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                <Icons.UserIcon className="w-5 h-5 text-gray-500" />
              </div>
              <span className="mt-1 text-xs text-gray-500">Profile</span>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
