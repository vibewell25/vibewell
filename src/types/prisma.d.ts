import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaClient {
    interface UserInclude {
      authenticators: boolean;
      challenges: boolean;
    }

    interface WebAuthnAuthenticator {
      id: string;
      userId: string;
      credentialId: Buffer;
      credentialPublicKey: Buffer;
      counter: bigint;
      transports: string[];
      name?: string | null;
      isBiometric: boolean;
      createdAt: Date;
      lastUsed?: Date | null;
    }

    interface WebAuthnChallenge {
      id: string;
      challenge: string;
      userId: string;
      createdAt: Date;
      expiresAt: Date;
    }
  }
}

declare module '@prisma/client' {
  interface PrismaClient {
    webAuthnAuthenticator: Prisma.WebAuthnAuthenticatorDelegate<DefaultArgs>;
    webAuthnChallenge: Prisma.WebAuthnChallengeDelegate<DefaultArgs>;
  }

  interface User {
    authenticators: WebAuthnAuthenticator[];
    challenges: WebAuthnChallenge[];
  }
} 