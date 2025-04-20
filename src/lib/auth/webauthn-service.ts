import { PrismaClient } from '@prisma/client';
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

interface WebAuthnAuthenticator {
  id: string;
  userId: string;
  credentialId: string;
  credentialPublicKey: string;
  counter: number;
  transports: AuthenticatorTransportFuture[];
}

interface UserWithAuthenticators {
  id: string;
  email: string;
  authenticators: WebAuthnAuthenticator[];
}

export class WebAuthnError extends Error {
  constructor(
    message: string,
    public code: 'CHALLENGE_NOT_FOUND' | 'USER_NOT_FOUND' | 'VERIFICATION_FAILED'
  ) {
    super(message);
    this.name = 'WebAuthnError';
  }
}

export class WebAuthnService {
  constructor(
    private prisma: PrismaClient,
    private rpName: string,
    private rpID: string,
    private origin: string
  ) {}

  async generateRegistrationOptions(user: UserWithAuthenticators): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const existingAuthenticators = await this.prisma.$queryRaw<WebAuthnAuthenticator[]>`
      SELECT * FROM "Authenticator" WHERE "userId" = ${user.id}
    `;

    const userIDBuffer = new TextEncoder().encode(user.id);

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: userIDBuffer,
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      excludeCredentials: existingAuthenticators.map(auth => ({
        id: auth.credentialId,
        type: 'public-key',
        transports: auth.transports
      }))
    });

    await this.prisma.$queryRaw`
      INSERT INTO "Challenge" ("userId", "challenge")
      VALUES (${user.id}, ${options.challenge})
    `;

    return options;
  }

  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON
  ): Promise<WebAuthnAuthenticator> {
    const challenge = await this.prisma.$queryRaw<{ challenge: string }[]>`
      SELECT "challenge" FROM "Challenge"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    if (!challenge.length) {
      throw new WebAuthnError('Challenge not found', 'CHALLENGE_NOT_FOUND');
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge[0].challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      requireUserVerification: false
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new WebAuthnError('Registration verification failed', 'VERIFICATION_FAILED');
    }

    const { credential } = verification.registrationInfo;

    const authenticators = await this.prisma.$queryRaw<WebAuthnAuthenticator[]>`
      INSERT INTO "Authenticator" (
        "userId",
        "credentialId",
        "credentialPublicKey",
        "counter",
        "transports"
      ) VALUES (
        ${userId},
        ${credential.id},
        ${isoBase64URL.fromBuffer(credential.publicKey)},
        ${credential.counter},
        ${JSON.stringify(response.response.transports || [])}
      )
      RETURNING *
    `;

    await this.prisma.$queryRaw`
      DELETE FROM "Challenge"
      WHERE "userId" = ${userId}
    `;

    return authenticators[0];
  }

  async generateAuthenticationOptions(user: UserWithAuthenticators): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const allowCredentials = user.authenticators.map((auth) => ({
      id: auth.credentialId,
      type: 'public-key' as const,
      transports: auth.transports
    }));

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials,
      userVerification: 'preferred'
    });

    await this.prisma.$queryRaw`
      INSERT INTO "Challenge" ("userId", "challenge")
      VALUES (${user.id}, ${options.challenge})
    `;

    return options;
  }

  async verifyAuthentication(
    userId: string,
    response: AuthenticationResponseJSON
  ): Promise<boolean> {
    const challenge = await this.prisma.$queryRaw<{ challenge: string }[]>`
      SELECT "challenge" FROM "Challenge"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    if (!challenge.length) {
      throw new WebAuthnError('Challenge not found', 'CHALLENGE_NOT_FOUND');
    }

    const authenticator = await this.prisma.$queryRaw<WebAuthnAuthenticator[]>`
      SELECT * FROM "Authenticator"
      WHERE "credentialId" = ${response.id}
      LIMIT 1
    `;

    if (!authenticator.length) {
      throw new WebAuthnError('Authenticator not found', 'USER_NOT_FOUND');
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge[0].challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      requireUserVerification: true,
      credential: {
        id: authenticator[0].credentialId,
        publicKey: isoBase64URL.toBuffer(authenticator[0].credentialPublicKey),
        counter: authenticator[0].counter
      }
    });

    if (verification.verified) {
      await this.prisma.$queryRaw`
        UPDATE "Authenticator"
        SET "counter" = ${verification.authenticationInfo.newCounter}
        WHERE "credentialId" = ${response.id}
      `;

      await this.prisma.$queryRaw`
        DELETE FROM "Challenge"
        WHERE "userId" = ${userId}
      `;
    }

    return verification.verified;
  }
}