import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Instantiate Prisma client
const prisma = new PrismaClient();

export interface GraphQLContext {
  prisma: PrismaClient;
  session: any; // Replace with your session type
  user: any | null; // Replace with your user type
}

export async function createContext({ req, res }): Promise<GraphQLContext> {
  // Get the user's session based on the request
  const session = await getServerSession(authOptions);
  
  // If the user is not logged in, set user to null
  let user = null;
  
  // If the user is logged in, get their record from the database
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  }
  
  return {
    prisma,
    session,
    user,
  };
} 