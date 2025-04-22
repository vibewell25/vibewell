import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  picture?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  authProvider?: string;
  googleId?: string;
  facebookId?: string;
  twitterId?: string;
  linkedinId?: string;
  githubId?: string;
  appleId?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function(this: IUser) {
      // Password is required only if no social auth provider is used
      return !this.authProvider;
    },
    minlength: 8,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  authProvider: {
    type: String,
    enum: ['google', 'facebook', 'twitter', 'linkedin', 'github', 'apple', null],
    default: null
  },
  googleId: String,
  facebookId: String,
  twitterId: String,
  linkedinId: String,
  githubId: String,
  appleId: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  backupCodes: {
    type: [String],
    select: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this as IUser;
  
  if (!user.isModified('password') || !user.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const user = this as IUser;
  
  if (!user.password) {
    return false;
  }

  try {
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    return false;
  }
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ facebookId: 1 });
userSchema.index({ twitterId: 1 });
userSchema.index({ linkedinId: 1 });
userSchema.index({ githubId: 1 });
userSchema.index({ appleId: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 