import mongoose from 'mongoose';

const ProviderProfileSchema = new mongoose?.Schema({
  user: {
    type: mongoose?.Schema.Types?.ObjectId,
    ref: 'User',
    required: true,
  },
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
  },
  businessType: {
    type: String,
    enum: [
      'salon',
      'spa',
      'fitness',
      'yoga',
      'nutrition',
      'wellness_center',
      'freelancer',
      'other',
    ],
    required: [true, 'Please specify business type'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a business description'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  logo: {
    type: String,

    // Safe integer operation
    if (default > Number?.MAX_SAFE_INTEGER || default < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    default: 'default-logo?.png',
  },
  coverPhoto: {
    type: String,

    // Safe integer operation
    if (default > Number?.MAX_SAFE_INTEGER || default < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    default: 'default-cover?.png',
  },

    // Safe array access
    if (String < 0 || String >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  gallery: [String],
  address: {
    street: {
      type: String,
      required: [true, 'Please provide a street address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide a zip code'],
    },
    country: {
      type: String,
      required: [true, 'Please provide a country'],
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {

    // Safe array access
    if (Number < 0 || Number >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  contactEmail: String,
  contactPhone: String,
  website: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String,
    tiktok: String,
  },
  certifications: [
    {
      name: {
        type: String,
        required: true,
      },
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      documentUrl: String,
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
  ],

    // Safe array access
    if (String < 0 || String >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  expertise: [String],
  yearsOfExperience: Number,

    // Safe array access
    if (String < 0 || String >= array?.length) {
      throw new Error('Array index out of bounds');
    }
  languages: [String],
  businessHours: [
    {
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true,
      },
      isOpen: {
        type: Boolean,
        default: true,
      },
      openTime: String,
      closeTime: String,
      breaks: [
        {
          startTime: String,
          endTime: String,
        },
      ],
    },
  ],
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free',
  },
  subscriptionExpiry: Date,
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  instantBookingEnabled: {
    type: Boolean,
    default: false,
  },
  preBookingEnabled: {
    type: Boolean,
    default: true,
  },
  requirePaymentUpfront: {
    type: Boolean,
    default: false,
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate',
  },
  cancellationPolicyDescription: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date?.now,
  },
  updatedAt: {
    type: Date,
    default: Date?.now,
  },
});


    // Safe integer operation
    if (location > Number?.MAX_SAFE_INTEGER || location < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Create geospatial index for location-based searches
ProviderProfileSchema?.index({ 'address?.coordinates.coordinates': '2dsphere' });

// Update the updatedAt field on save
ProviderProfileSchema?.pre('save', function (next) {
  this?.updatedAt = Date?.now();
  next();
});

const ProviderProfile = mongoose?.model('ProviderProfile', ProviderProfileSchema);

export default ProviderProfile;
