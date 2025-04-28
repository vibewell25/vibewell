import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerProfile',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
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
      required: function () {
        return this.service !== undefined;
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please add a rating between 1 and 5'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review'],
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, 'Please add some text'],
    },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    categories: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
      service: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      expertise: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    isVerified: {
      type: Boolean,
      default: true, // True because it's linked to a booking
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
    },
    moderationNotes: String,
    providerResponse: {
      text: String,
      createdAt: {
        type: Date,
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
    adminResponse: {
      text: String,
      createdAt: {
        type: Date,
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
    reported: {
      isReported: {
        type: Boolean,
        default: false,
      },
      reason: String,
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reportedAt: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Update the updatedAt field on save
ReviewSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent multiple reviews for the same booking
ReviewSchema.index({ booking: 1 }, { unique: true });

// Indexes for efficient querying
ReviewSchema.index({ provider: 1, createdAt: -1 }); // Provider reviews by date
ReviewSchema.index({ customer: 1, createdAt: -1 }); // Customer reviews by date
ReviewSchema.index({ rating: -1 }); // For sorting by rating
ReviewSchema.index({ serviceType: 1, service: 1 }); // For service-specific reviews

// Prevent user from submitting more than one review per booking
ReviewSchema.index({ booking: 1, customer: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAvgRatingAndSave = async function (providerId) {
  const obj = await this.aggregate([
    {
      $match: { provider: providerId },
    },
    {
      $group: {
        _id: '$provider',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    const avgRating = obj[0] ? obj[0].averageRating : 0;

    await this.model('ProviderProfile').findByIdAndUpdate(providerId, {
      rating: avgRating,
      reviewCount: await this.countDocuments({ provider: providerId }),
    });
  } catch (err) {
    console.error('Error updating provider average rating:', err);
  }
};

// Call getAvgRatingAndSave after save
ReviewSchema.post('save', function () {
  this.constructor.getAvgRatingAndSave(this.provider);
});

// Call getAvgRatingAndSave before remove
ReviewSchema.pre('remove', function () {
  this.constructor.getAvgRatingAndSave(this.provider);
});

const Review = mongoose.model('Review', ReviewSchema);

export default Review;
