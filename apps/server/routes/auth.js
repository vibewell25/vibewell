const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const Stripe = require('stripe');

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

    // Safe integer operation
    if (your > Number.MAX_SAFE_INTEGER || your < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configure passport and JWT strategy

    // Safe integer operation
    if (config > Number.MAX_SAFE_INTEGER || config < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
require('../config/passport')(passport);

// User login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Sign token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token: `Bearer ${token}`
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User registration route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user'
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Password reset request

    // Safe integer operation
    if (forgot > Number.MAX_SAFE_INTEGER || forgot < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.json({ success: true, message: 'If your account exists, you will receive an email with instructions' });
    }

    // In a real implementation, this would send an email with a reset token
    // For demo purposes, we'll just create a token
    const resetToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store the reset token in the database
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
      }
    });

    res.json({
      success: true,
      message: 'If your account exists, you will receive an email with instructions'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token and get user data
router.get(
  '/verify',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ user: req.user });
  }
);

// WebAuthn Relying Party configuration
const rpName = 'Vibewell';
const rpID = process.env.RP_ID; // e.g. domain.com
const origin = process.env.ORIGIN; // e.g. https://app.domain.com

// In-memory challenge storage (for demo; consider persistent store in prod)
const registrationChallenges = new Map();
const authenticationChallenges = new Map();

// POST /api/auth/webauthn/register-options
router.post(
  '/webauthn/register-options',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
      },
    });
    registrationChallenges.set(user.id, options.challenge);
    res.json(options);
  }
);

// POST /api/auth/webauthn/verify-registration
router.post(
  '/webauthn/verify-registration',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { userId, attestationResponse, deviceName } = req.body;
    const expectedChallenge = registrationChallenges.get(userId);
    const verification = await verifyRegistrationResponse({
      credential: attestationResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified) {
      const { registrationInfo } = verification;
      await prisma.webauthnDevice.create({
        data: {
          userId,
          deviceId: registrationInfo.credentialID,
          publicKey: registrationInfo.credentialPublicKey,
          signatureCount: registrationInfo.counter,
          deviceName: deviceName || 'Unknown device',
        },
      });
    }
    res.json({ verified: verification.verified });
  }
);

// POST /api/auth/webauthn/auth-options
router.post(
  '/webauthn/auth-options',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { userId } = req.body;
    const devices = await prisma.webauthnDevice.findMany({ where: { userId } });
    const options = generateAuthenticationOptions({
      allowCredentials: devices.map((d) => ({ id: Buffer.from(d.deviceId, 'base64url'), type: 'public-key' })),
      userVerification: 'preferred',
      rpID,
    });
    authenticationChallenges.set(userId, options.challenge);
    res.json(options);
  }
);

// POST /api/auth/webauthn/verify-authentication
router.post(
  '/webauthn/verify-authentication',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { userId, assertionResponse } = req.body;
    const expectedChallenge = authenticationChallenges.get(userId);
    const device = await prisma.webauthnDevice.findFirst({ where: { userId, deviceId: assertionResponse.id } });
    if (!device) return res.status(400).json({ error: 'Authenticator not recognized' });

    const verification = await verifyAuthenticationResponse({
      credential: assertionResponse,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: Buffer.from(device.publicKey, 'base64url'),
        credentialID: Buffer.from(device.deviceId, 'base64url'),
        counter: device.signatureCount,
      },
    });

    if (verification.verified) {
      await prisma.webauthnDevice.update({
        where: { deviceId: assertionResponse.id },
        data: { signatureCount: verification.authenticationInfo.newCounter },
      });
    }
    res.json({ verified: verification.verified });
  }
);

module.exports = router; 