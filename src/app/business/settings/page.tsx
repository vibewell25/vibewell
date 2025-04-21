import { BusinessHours } from '@/components/business/BusinessHours';
import { ConsultationForms } from '@/components/business/ConsultationForms';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function BusinessSettingsPage() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  const business = await prisma.business.findFirst({
    where: { id: session.user.businessId },
  });

  if (!business) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Business Settings</h1>

      <div className="space-y-8">
        <BusinessHours businessId={business.id} />
        <ConsultationForms businessId={business.id} />
      </div>
    </div>
  );
}
