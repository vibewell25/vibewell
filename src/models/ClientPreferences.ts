import { Schema, model, Document, Types } from 'mongoose';

export interface ServicePreference {
  serviceId: Types.ObjectId;
  rating: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  preferredDuration: number;
  notes: string;
  lastUpdated: Date;
}

export interface PractitionerPreference {
  practitionerId: Types.ObjectId;
  rating: number;
  preferredCommunication: 'email' | 'sms' | 'app' | 'phone';
  notes: string;
  lastUpdated: Date;
}

export interface SchedulingPreference {
  preferredDays: string[];
  preferredTimeSlots: {
    start: string;
    end: string;
  }[];
  flexibility: 'strict' | 'moderate' | 'flexible';
  advanceBooking: number; // days
  reminderPreference: {
    timing: number; // hours before appointment
    method: 'email' | 'sms' | 'app' | 'all';
  };
}

export interface CommunicationPreference {
  marketingEmails: boolean;
  promotionalSMS: boolean;
  appointmentReminders: boolean;
  feedbackRequests: boolean;
  newsletterSubscription: boolean;
  preferredLanguage: string;
  preferredCommunicationTime: {
    start: string;
    end: string;
  };
}

export interface ClientPreferences extends Document {
  clientId: Types.ObjectId;
  servicePreferences: ServicePreference[];
  practitionerPreferences: PractitionerPreference[];
  schedulingPreferences: SchedulingPreference;
  communicationPreferences: CommunicationPreference;
  specialRequirements: string[];
  allergies: string[];
  healthConditions: string[];
  goals: {
    type: string;
    description: string;
    targetDate?: Date;
    status: 'active' | 'achieved' | 'abandoned';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientBehavior extends Document {
  clientId: Types.ObjectId;
  bookingPatterns: {
    averageBookingFrequency: number; // days
    preferredBookingChannel: 'web' | 'mobile' | 'phone';
    cancellationRate: number;
    rescheduleRate: number;
    noShowCount: number;
    lastMinuteBookingCount: number;
  };
  serviceHistory: {
    serviceId: Types.ObjectId;
    bookingCount: number;
    lastBooked: Date;
    averageRating: number;
    totalSpent: number;
    notes: string;
  }[];
  practitionerHistory: {
    practitionerId: Types.ObjectId;
    bookingCount: number;
    lastBooked: Date;
    averageRating: number;
    notes: string;
  }[];
  spendingPatterns: {
    averageSpendPerVisit: number;
    totalSpendYTD: number;
    preferredPaymentMethod: string;
    productPurchaseHistory: {
      productId: Types.ObjectId;
      purchaseCount: number;
      lastPurchased: Date;
    }[];
  };
  feedback: {
    lastFeedbackDate: Date;
    averageRating: number;
    commonThemes: string[];
    improvements: string[];
    compliments: string[];
  };
  engagement: {
    appUsage: {
      lastLogin: Date;
      loginFrequency: number;
      featureUsage: Record<string, number>;
    };
    marketingResponses: {
      emailOpenRate: number;
      smsResponseRate: number;
      promotionRedemptions: number;
    };
  };
  updatedAt: Date;
}

const clientPreferencesSchema = new Schema<ClientPreferences>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  servicePreferences: [{
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    rating: { type: Number, min: 1, max: 5 },
    frequency: { 
      type: String, 
      enum: ['weekly', 'monthly', 'quarterly', 'annually']
    },
    preferredDuration: Number,
    notes: String,
    lastUpdated: { type: Date, default: Date.now }
  }],
  practitionerPreferences: [{
    practitionerId: { type: Schema.Types.ObjectId, ref: 'Practitioner', required: true },
    rating: { type: Number, min: 1, max: 5 },
    preferredCommunication: { 
      type: String, 
      enum: ['email', 'sms', 'app', 'phone']
    },
    notes: String,
    lastUpdated: { type: Date, default: Date.now }
  }],
  schedulingPreferences: {
    preferredDays: [String],
    preferredTimeSlots: [{
      start: String,
      end: String
    }],
    flexibility: { 
      type: String, 
      enum: ['strict', 'moderate', 'flexible'],
      default: 'moderate'
    },
    advanceBooking: { type: Number, default: 7 },
    reminderPreference: {
      timing: { type: Number, default: 24 },
      method: { 
        type: String, 
        enum: ['email', 'sms', 'app', 'all'],
        default: 'all'
      }
    }
  },
  communicationPreferences: {
    marketingEmails: { type: Boolean, default: true },
    promotionalSMS: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true },
    feedbackRequests: { type: Boolean, default: true },
    newsletterSubscription: { type: Boolean, default: true },
    preferredLanguage: { type: String, default: 'en' },
    preferredCommunicationTime: {
      start: String,
      end: String
    }
  },
  specialRequirements: [String],
  allergies: [String],
  healthConditions: [String],
  goals: [{
    type: String,
    description: String,
    targetDate: Date,
    status: { 
      type: String, 
      enum: ['active', 'achieved', 'abandoned'],
      default: 'active'
    }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const clientBehaviorSchema = new Schema<ClientBehavior>({
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  bookingPatterns: {
    averageBookingFrequency: Number,
    preferredBookingChannel: { 
      type: String, 
      enum: ['web', 'mobile', 'phone']
    },
    cancellationRate: Number,
    rescheduleRate: Number,
    noShowCount: { type: Number, default: 0 },
    lastMinuteBookingCount: { type: Number, default: 0 }
  },
  serviceHistory: [{
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    bookingCount: { type: Number, default: 0 },
    lastBooked: Date,
    averageRating: Number,
    totalSpent: { type: Number, default: 0 },
    notes: String
  }],
  practitionerHistory: [{
    practitionerId: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    bookingCount: { type: Number, default: 0 },
    lastBooked: Date,
    averageRating: Number,
    notes: String
  }],
  spendingPatterns: {
    averageSpendPerVisit: Number,
    totalSpendYTD: { type: Number, default: 0 },
    preferredPaymentMethod: String,
    productPurchaseHistory: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      purchaseCount: { type: Number, default: 0 },
      lastPurchased: Date
    }]
  },
  feedback: {
    lastFeedbackDate: Date,
    averageRating: Number,
    commonThemes: [String],
    improvements: [String],
    compliments: [String]
  },
  engagement: {
    appUsage: {
      lastLogin: Date,
      loginFrequency: Number,
      featureUsage: Schema.Types.Mixed
    },
    marketingResponses: {
      emailOpenRate: Number,
      smsResponseRate: Number,
      promotionRedemptions: { type: Number, default: 0 }
    }
  },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
clientPreferencesSchema.index({ clientId: 1 });
clientPreferencesSchema.index({ 'servicePreferences.serviceId': 1 });
clientPreferencesSchema.index({ 'practitionerPreferences.practitionerId': 1 });

clientBehaviorSchema.index({ clientId: 1 });
clientBehaviorSchema.index({ 'serviceHistory.serviceId': 1 });
clientBehaviorSchema.index({ 'practitionerHistory.practitionerId': 1 });

// Add pre-save middleware to update timestamps
clientPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

clientBehaviorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ClientPreferencesModel = model<ClientPreferences>('ClientPreferences', clientPreferencesSchema);
export const ClientBehaviorModel = model<ClientBehavior>('ClientBehavior', clientBehaviorSchema); 