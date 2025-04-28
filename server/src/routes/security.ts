import { Router, Request, Response } from 'express';
import base64url from 'base64url';
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import { Fido2Lib } from 'fido2-lib';
import { checkJwt } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const f2l = new Fido2Lib({
  rpId: process.env.RP_ID || 'localhost',
  rpName: 'Vibewell',
  timeout: 60000,
  challengeSize: 32,
  attestation: 'none',
  cryptoParams: [-7, -257],
});

const webauthnRegChallenges = new Map<string, Buffer>();
const webauthnAuthnChallenges = new Map<string, Buffer>();

// TOTP setup
router.get('/totp/setup', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const secret = speakeasy.generateSecret({ length: 20 });
  await prisma.twoFactorAuth.upsert({
    where: { userId },
    update: { secret: secret.base32, verified: false },
    create: { userId, secret: secret.base32, verified: false }
  });
  res.json({ otpauthUrl: secret.otpauth_url, base32: secret.base32 });
});

// TOTP verify
router.post('/totp/verify', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const { token } = req.body;
  const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId } });
  if (!tfa) return res.status(404).json({ error: 'TOTP not setup' });
  const valid = speakeasy.totp.verify({ secret: tfa.secret, encoding: 'base32', token });
  if (valid) await prisma.twoFactorAuth.update({ where: { userId }, data: { verified: true } });
  res.json({ success: valid });
});

// WebAuthn registration options
router.get('/webauthn/register', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const opts = await f2l.attestationOptions({
    user: { id: Buffer.from(userId), name: user.email, displayName: user.name || user.email },
    authenticatorSelection: { userVerification: 'preferred' }
  });
  webauthnRegChallenges.set(userId, opts.challenge);
  res.json(opts);
});

// WebAuthn register response handling
router.post('/webauthn/register', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const attestationResponse = req.body;
  const expected = webauthnRegChallenges.get(userId);
  if (!expected) return res.status(400).json({ error: 'No registration in progress' });
  try {
    const regResult = await f2l.attestationResult(attestationResponse, {
      challenge: expected,
      origin: process.env.FRONTEND_URL!,
      factor: 'either',
      rpId: process.env.RP_ID || ''
    });
    const credId = base64url.encode(regResult.authnrData.get('credId'));
    const publicKey = base64url.encode(regResult.authnrData.get('credentialPublicKey'));
    await prisma.webAuthnCredential.create({ data: { userId, credentialId: credId, publicKey, counter: regResult.authnrData.get('counter'), transports: attestationResponse.transports || [] } });
    webauthnRegChallenges.delete(userId);
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// WebAuthn assertion options
router.get('/webauthn/authenticate', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const creds = await prisma.webAuthnCredential.findMany({ where: { userId } });
  if (!creds.length) return res.status(404).json({ error: 'No credentials registered' });
  const allow = creds.map(c => ({ type: 'public-key', id: Buffer.from(c.credentialId, 'base64'), transports: c.transports }));
  const opts = await f2l.assertionOptions({ challengeLength: 32, allowCredentials: allow, userVerification: 'preferred' });
  webauthnAuthnChallenges.set(userId, opts.challenge);
  res.json(opts);
});

// WebAuthn assertion result handling
router.post('/webauthn/authenticate', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const assertionResponse = req.body;
  const expected = webauthnAuthnChallenges.get(userId);
  if (!expected) return res.status(400).json({ error: 'No authentication in progress' });
  try {
    const cred = await prisma.webAuthnCredential.findUnique({ where: { credentialId: assertionResponse.id } });
    if (!cred) return res.status(404).json({ error: 'Credential not found' });
    const authn = await f2l.assertionResult(assertionResponse, {
      challenge: expected,
      origin: process.env.FRONTEND_URL!,
      factor: 'either',
      publicKey: Buffer.from(cred.publicKey, 'base64'),
      prevCounter: cred.counter,
      rpId: process.env.RP_ID || ''
    });
    await prisma.webAuthnCredential.update({ where: { id: cred.id }, data: { counter: authn.authnrData.get('counter') } });
    webauthnAuthnChallenges.delete(userId);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

export default router;
