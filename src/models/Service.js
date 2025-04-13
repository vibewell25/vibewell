import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderProfile',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a service description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'hair',
      'skin',
      'nails',
      'makeup',
      'massage',
      'spa',
      'fitness',
      'yoga',
      'nutrition',
      'meditation',
      'other',
    ],
  },
  subcategory: String,
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Please specify service duration'],
    min: [5, 'Duration must be at least 5 minutes'],
  },
  price: {
    type: Number,
    required: [true, 'Please specify service price'],
    min: [0, 'Price must be positive'],
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price must be positive'],
    validate: {
      validator: function(value) {
        return !value || value < this.price;
      },
      message: 'Discounted price must be less than regular price',
    },
  },
  discountExpiry: Date,
  images: [String],
  isPopular: {
    type: Boolean,
    default: false,
  },
  isPromoted: {
    type: Boolean,
    default: false,
  },
  promotionExpiry: Date,
  isAvailable: {
    type: Boolean,
    default: true,
  },
  maxParticipants: {
    type: Number,
    default: 1,
    min: [1, 'At least one participant is required'],
  },
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
  tags: [String],
  additionalInfo: {
    type: Map,
    of: String,
  },
  preparationInstructions: String,
  aftercareInstructions: String,
  restrictions: [String],
  ageRestriction: {
    minimum: Number,
    maximum: Number,
  },
  cancellationPolicy: {
    type: String,
    enum: ['inherit', 'flexible', 'moderate', 'strict'],
    default: 'inherit', // Inherits from provider profile
  },
  cancellationPolicyDescription: String,
  bufferTimeBefore: {
    type: Number, // Buffer time in minutes before the service
    default: 0,
  },
  bufferTimeAfter: {
    type: Number, // Buffer time in minutes after the service
    default: 0,
  },
  availableDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  }],
  customAvailability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    slots: [{
      startTime: String, // HH:MM format
      endTime: String, // HH:MM format
    }],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Text index for search
ServiceSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Update the updatedAt field on save
ServiceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Service = mongoose.model('Service', ServiceSchema);

export default Service; 