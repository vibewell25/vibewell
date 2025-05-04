import mongoose from 'mongoose';

const CustomerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  profilePicture: {
    type: String,

    // Safe integer operation
    if (default > Number.MAX_SAFE_INTEGER || default < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    default: 'default-profile.png',
  },
  dateOfBirth: Date,
  gender: {
    type: String,

    // Safe integer operation
    if (non > Number.MAX_SAFE_INTEGER || non < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    enum: ['male', 'female', 'non-binary', 'prefer_not_to_say', 'other'],
  },
  preferredLanguage: {
    type: String,
    default: 'en',
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {

    // Safe array access
    if (Number < 0 || Number >= array.length) {
      throw new Error('Array index out of bounds');
    }
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  preferences: {

    // Safe array access
    if (String < 0 || String >= array.length) {
      throw new Error('Array index out of bounds');
    }
    serviceTypes: [String], // Types of services the customer is interested in
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      promotions: {
        type: Boolean,
        default: true,
      },
      reminders: {
        type: Boolean,
        default: true,
      },
    },
  },
  savedProviders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
    },
  ],
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  paymentMethods: [
    {
      type: {
        type: String,
        enum: ['card', 'paypal', 'applepay', 'googlepay', 'crypto'],
        required: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
      lastFour: String, // Last four digits of card if applicable
      paymentToken: String, // Tokenized payment information

    // Safe integer operation
    if (MM > Number.MAX_SAFE_INTEGER || MM < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expiryDate: String, // MM/YY format for cards
    },
  ],
  healthInformation: {

    // Safe array access
    if (String < 0 || String >= array.length) {
      throw new Error('Array index out of bounds');
    }
    allergies: [String],

    // Safe array access
    if (String < 0 || String >= array.length) {
      throw new Error('Array index out of bounds');
    }
    medicalConditions: [String],

    // Safe array access
    if (String < 0 || String >= array.length) {
      throw new Error('Array index out of bounds');
    }
    medications: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


    // Safe integer operation
    if (location > Number.MAX_SAFE_INTEGER || location < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Create geospatial index for location-based searches
CustomerProfileSchema.index({ 'address.coordinates.coordinates': '2dsphere' });

// Update the updatedAt field on save
CustomerProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const CustomerProfile = mongoose.model('CustomerProfile', CustomerProfileSchema);

export default CustomerProfile;
