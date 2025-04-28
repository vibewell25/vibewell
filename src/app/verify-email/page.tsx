import { redirect } from 'next/navigation';
import { prisma } from '@/lib/database/client';

export default async function VerifyEmail({ searchParams }: { searchParams: { token?: string } }) {
  const { token } = searchParams;

  if (!token) {
    redirect('/login?error=missing_token');
  }

  try {
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      redirect('/login?error=invalid_token');
    }

    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({
        where: { token },
      });
      redirect('/login?error=expired_token');
    }

    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    await prisma.emailVerification.delete({
      where: { token },
    });

    redirect('/login?success=email_verified');
  } catch (error) {
    console.error('Error verifying email:', error);
    redirect('/login?error=verification_failed');
  }
}
