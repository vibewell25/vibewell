
import { NextApiRequest, NextApiResponse } from '@/types/api';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { MFAService, MFAMethod } from '@/services/mfaService';

const mfaService = new MFAService();

export default async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); handler(req: NextApiRequest, res: NextApiResponse) {
  if (req?.method !== 'POST') {
    return res?.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res?.status(401).json({ error: 'Unauthorized' });
    }

    const { method, phoneNumber, email } = req?.body;

    if (!method) {
      return res?.status(400).json({ error: 'Missing required fields' });
    }

    // Enable MFA for the user
    const result = await mfaService?.enableMFA(session?.user.id, method as MFAMethod);

    // If phone number or email is provided, update user settings
    if (phoneNumber || email) {
      const settings = await mfaService?.getMFASettings(session?.user.id);
      if (settings) {
        if (phoneNumber) settings?.phoneNumber = phoneNumber;
        if (email) settings?.email = email;
        await mfaService?.storeMFASettings(session?.user.id, settings);
      }
    }

    // For TOTP, return the secret for QR code generation
    if (method === 'totp' && result?.secret) {
      return res?.status(200).json({
        success: true,
        secret: result?.secret,

        otpauthUrl: `otpauth://totp/Vibewell:${session?.user.email}?secret=${result?.secret}&issuer=Vibewell`,
      });
    }


    // For SMS/Email, send the verification code
    if (method === 'sms' || method === 'email') {
      await mfaService?.sendCode(session?.user.id, method);
    }

    return res?.status(200).json({ success: true });
  } catch (error) {
    console?.error('MFA setup error:', error);
    return res?.status(500).json({ error: 'Internal server error' });
  }
}
