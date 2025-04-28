import { Schema, model, Document, Types } from 'mongoose';

export interface CertificationRequirement {
  id: string;
  name: string;
  description: string;
  type: 'training' | 'exam' | 'experience' | 'document';
  minimumScore?: number;
  minimumHours?: number;
  validityPeriod?: number; // in months
  isRequired: boolean;
}

export interface CertificationProgress {
  requirementId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  completionDate?: Date;
  expiryDate?: Date;
  score?: number;
  hoursCompleted?: number;
  verificationDocument?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface Certification extends Document {
  name: string;
  provider: string;
  description: string;
  category: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requirements: CertificationRequirement[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PractitionerCertification extends Document {
  practitionerId: Types.ObjectId;
  certificationId: Types.ObjectId;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  progress: CertificationProgress[];
  issueDate?: Date;
  expiryDate?: Date;
  certificateNumber?: string;
  verificationUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const certificationSchema = new Schema<Certification>({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  description: { type: String, required: true },
  category: [{ type: String }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true,
  },
  requirements: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      type: {
        type: String,
        enum: ['training', 'exam', 'experience', 'document'],
        required: true,
      },
      minimumScore: Number,
      minimumHours: Number,
      validityPeriod: Number,
      isRequired: { type: Boolean, default: true },
    },
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const practitionerCertificationSchema = new Schema<PractitionerCertification>({
  practitionerId: { type: Schema.Types.ObjectId, ref: 'Practitioner', required: true },
  certificationId: { type: Schema.Types.ObjectId, ref: 'Certification', required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'expired'],
    default: 'pending',
  },
  progress: [
    {
      requirementId: { type: String, required: true },
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'expired'],
        default: 'not_started',
      },
      completionDate: Date,
      expiryDate: Date,
      score: Number,
      hoursCompleted: Number,
      verificationDocument: String,
      verifiedBy: String,
      notes: String,
    },
  ],
  issueDate: Date,
  expiryDate: Date,
  certificateNumber: String,
  verificationUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
certificationSchema.index({ name: 1, provider: 1 }, { unique: true });
certificationSchema.index({ category: 1 });
certificationSchema.index({ level: 1 });

practitionerCertificationSchema.index({ practitionerId: 1, certificationId: 1 }, { unique: true });
practitionerCertificationSchema.index({ status: 1 });
practitionerCertificationSchema.index({ expiryDate: 1 });

// Add pre-save middleware to update timestamps
certificationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

practitionerCertificationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export {};
export {};
