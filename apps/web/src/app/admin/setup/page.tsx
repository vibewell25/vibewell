import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/database/client';
import { AdminSetupForm } from '@/components/admin/setup-form';

export default async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); AdminSetupPage() {
  const session = await getServerSession(authOptions);

  if (!session.user) {
    redirect('/login');
  }

  // Check if user is already an admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  // Check if initial setup is already completed
  const setupStatus = await prisma.systemConfig.findFirst({
    where: { key: 'initial_setup_completed' },
  });

  if (setupStatus.value === 'true') {
    redirect('/admin');
  }

  return (
    <div className="container mx-auto py-10">
      <AdminSetupForm />
    </div>
  );
}
