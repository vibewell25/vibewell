import mongoose from 'mongoose';
import { User, IUser } from '../User';
import bcrypt from 'bcryptjs';

describe('User Model Test Suite', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Schema Validation', () => {
    it('should create a valid user with required fields', async () => {
      const validUser = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User'
      };

      const user = await User.create(validUser);
      expect(user._id).toBeDefined();
      expect(user.email).toBe(validUser.email);
      expect(user.name).toBe(validUser.name);
      expect(user.role).toBe('user'); // default role
      expect(user.emailVerified).toBe(false); // default value
      expect(user.twoFactorEnabled).toBe(false); // default value
    });

    it('should fail to create user without required fields', async () => {
      const invalidUser = {
        email: 'test@example.com'
        // missing name and password
      };

      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce email format', async () => {
      const invalidEmailUser = {
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User'
      };

      await expect(User.create(invalidEmailUser)).rejects.toThrow();
    });
  });

  describe('Password Handling', () => {
    it('should hash password before saving', async () => {
      const password = 'Password123!';
      const user = await User.create({
        email: 'test@example.com',
        password,
        name: 'Test User'
      });

      const savedUser = await User.findById(user._id).select('+password');
      expect(savedUser?.password).not.toBe(password);
      expect(await bcrypt.compare(password, savedUser!.password!)).toBe(true);
    });

    it('should not rehash password if not modified', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User'
      });

      const savedUser = await User.findById(user._id).select('+password');
      const originalHash = savedUser!.password;

      savedUser!.name = 'Updated Name';
      await savedUser!.save();

      expect(savedUser!.password).toBe(originalHash);
    });

    it('should correctly compare passwords', async () => {
      const password = 'Password123!';
      const user = await User.create({
        email: 'test@example.com',
        password,
        name: 'Test User'
      });

      const savedUser = await User.findById(user._id);
      expect(await savedUser!.comparePassword(password)).toBe(true);
      expect(await savedUser!.comparePassword('wrongpassword')).toBe(false);
    });
  });

  describe('Social Authentication', () => {
    it('should allow user creation without password when using social auth', async () => {
      const socialUser = {
        email: 'social@example.com',
        name: 'Social User',
        authProvider: 'google',
        googleId: '123456789'
      };

      const user = await User.create(socialUser);
      expect(user._id).toBeDefined();
      expect(user.authProvider).toBe('google');
      expect(user.googleId).toBe('123456789');
    });

    it('should handle multiple social providers for the same user', async () => {
      const user = await User.create({
        email: 'multi@example.com',
        name: 'Multi Social User',
        authProvider: 'google',
        googleId: '123456789'
      });

      user.facebookId = '987654321';
      await user.save();

      const savedUser = await User.findById(user._id);
      expect(savedUser!.googleId).toBe('123456789');
      expect(savedUser!.facebookId).toBe('987654321');
    });

    it('should validate auth provider enum values', async () => {
      const invalidProvider = {
        email: 'test@example.com',
        name: 'Test User',
        authProvider: 'invalid-provider'
      };

      await expect(User.create(invalidProvider)).rejects.toThrow();
    });
  });

  describe('Two-Factor Authentication', () => {
    it('should handle 2FA fields securely', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
        twoFactorEnabled: true,
        twoFactorSecret: 'secret123',
        backupCodes: ['code1', 'code2']
      });

      // 2FA fields should not be returned in normal queries
      const savedUser = await User.findById(user._id);
      expect(savedUser!.twoFactorEnabled).toBe(true);
      expect(savedUser!.twoFactorSecret).toBeUndefined();
      expect(savedUser!.backupCodes).toBeUndefined();

      // 2FA fields should be accessible when explicitly selected
      const userWithSecret = await User.findById(user._id).select('+twoFactorSecret +backupCodes');
      expect(userWithSecret!.twoFactorSecret).toBe('secret123');
      expect(userWithSecret!.backupCodes).toEqual(['code1', 'code2']);
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt timestamps', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User'
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();

      const originalUpdatedAt = user.updatedAt;
      
      // Wait 1ms to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      user.name = 'Updated Name';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
}); 