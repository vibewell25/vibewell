const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderProfile',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerProfile',
    required: true,
  },
  serviceType: {
    type: String,
    enum: ['service', 'bundle', 'training'],
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'serviceModel',
  },
  serviceModel: {
    type: String,
    enum: ['Service', 'ServiceBundle', 'TrainingProgram'],
    required: function() {
      return this.service !== undefined;
    },
  },
  serviceName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // HH:MM format
    required: true,
  },
  endTime: {
    type: String, // HH:MM format
    required: true,
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed', 
      'completed', 
      'cancelled_by_customer', 
      'cancelled_by_provider', 
      'no_show',
      'rescheduled'
    ],
    default: 'pending',
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'paypal', 'applepay', 'googlepay', 'crypto', 'other'],
  },
  paymentId: String, // Reference to payment transaction
  commission: {
    amount: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 15,
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'paid'],
      default: 'pending',
    },
  },
  participants: {
    type: Number,
    default: 1,
    min: [1, 'At least one participant is required'],
  },
  specialRequests: String,
  notes: {
    customerNotes: String,
    providerNotes: String,
    adminNotes: String,
  },
  cancellationReason: String,
  cancellationDate: Date,
  refundAmount: Number,
  previousBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }, // For rescheduled bookings
  customerAttended: {
    type: Boolean,
    default: null,
  },
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
    },
    sentAt: Date,
    status: String,
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Update the updatedAt field on save
BookingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate commission when booking is confirmed
BookingSchema.pre('save', function (next) {
  if (this.status === 'confirmed' && this.paymentStatus === 'paid') {
    // Calculate commission amount based on percentage
    this.commission.amount = (this.price * this.commission.percentage) / 100;
  }
  next();
});

// Create compound index for provider, date, startTime for availability checks
BookingSchema.index({ provider: 1, date: 1, startTime: 1 });

// Create index for customer to get customer bookings
BookingSchema.index({ customer: 1, date: 1 });

module.exports = mongoose.model('Booking', BookingSchema); 