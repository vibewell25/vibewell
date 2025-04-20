import { Schema, model, Document, Types } from 'mongoose';

export interface PerformanceMetric {
  id: string;
  name: string;
  category: 'service_quality' | 'client_satisfaction' | 'efficiency' | 'revenue' | 'professional_development';
  description: string;
  targetValue?: number;
  weight: number; // Percentage weight in overall score
  scoringCriteria: {
    excellent: string;
    good: string;
    satisfactory: string;
    needsImprovement: string;
  };
}

export interface MetricEvaluation {
  metricId: string;
  score: number; // 1-5 scale
  notes: string;
  supportingData?: Record<string, any>;
  evaluatorId: Types.ObjectId;
  evaluationDate: Date;
}

export interface DevelopmentGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress: number; // Percentage
  milestones: {
    title: string;
    dueDate: Date;
    completedDate?: Date;
    status: 'pending' | 'completed';
  }[];
  resources: {
    type: 'training' | 'certification' | 'mentorship' | 'other';
    description: string;
    link?: string;
  }[];
  notes: string[];
}

export interface PerformanceReview extends Document {
  practitionerId: Types.ObjectId;
  reviewPeriod: {
    start: Date;
    end: Date;
  };
  reviewType: 'quarterly' | 'annual' | 'probation' | 'special';
  status: 'draft' | 'in_review' | 'completed' | 'archived';
  overallScore: number;
  metrics: MetricEvaluation[];
  strengths: string[];
  areasForImprovement: string[];
  developmentGoals: DevelopmentGoal[];
  feedback: {
    clientFeedback: {
      averageRating: number;
      testimonials: string[];
      improvements: string[];
    };
    peerFeedback: {
      reviewerId: Types.ObjectId;
      rating: number;
      comments: string;
      date: Date;
    }[];
    selfAssessment: {
      strengths: string[];
      challenges: string[];
      goals: string[];
      submitted: Date;
    };
  };
  compensation: {
    currentSalary: number;
    recommendedAdjustment?: number;
    adjustmentReason?: string;
    bonusRecommendation?: number;
    bonusJustification?: string;
  };
  reviewMeetings: {
    scheduledDate: Date;
    actualDate?: Date;
    duration: number;
    attendees: Types.ObjectId[];
    notes: string;
    actionItems: {
      description: string;
      assignedTo: Types.ObjectId;
      dueDate: Date;
      status: 'pending' | 'completed';
    }[];
  }[];
  attachments: {
    name: string;
    type: string;
    url: string;
    uploadedBy: Types.ObjectId;
    uploadDate: Date;
  }[];
  signatures: {
    practitioner: {
      signed: boolean;
      date?: Date;
      comments?: string;
    };
    reviewer: {
      userId: Types.ObjectId;
      signed: boolean;
      date?: Date;
      comments?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const performanceReviewSchema = new Schema<PerformanceReview>({
  practitionerId: { type: Schema.Types.ObjectId, ref: 'Practitioner', required: true },
  reviewPeriod: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  reviewType: { 
    type: String, 
    enum: ['quarterly', 'annual', 'probation', 'special'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'in_review', 'completed', 'archived'],
    default: 'draft'
  },
  overallScore: { type: Number, min: 1, max: 5 },
  metrics: [{
    metricId: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    notes: String,
    supportingData: Schema.Types.Mixed,
    evaluatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    evaluationDate: { type: Date, default: Date.now }
  }],
  strengths: [String],
  areasForImprovement: [String],
  developmentGoals: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    category: String,
    targetDate: Date,
    status: { 
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'overdue'],
      default: 'not_started'
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    milestones: [{
      title: { type: String, required: true },
      dueDate: Date,
      completedDate: Date,
      status: { 
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      }
    }],
    resources: [{
      type: { 
        type: String,
        enum: ['training', 'certification', 'mentorship', 'other']
      },
      description: String,
      link: String
    }],
    notes: [String]
  }],
  feedback: {
    clientFeedback: {
      averageRating: Number,
      testimonials: [String],
      improvements: [String]
    },
    peerFeedback: [{
      reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comments: String,
      date: { type: Date, default: Date.now }
    }],
    selfAssessment: {
      strengths: [String],
      challenges: [String],
      goals: [String],
      submitted: Date
    }
  },
  compensation: {
    currentSalary: { type: Number, required: true },
    recommendedAdjustment: Number,
    adjustmentReason: String,
    bonusRecommendation: Number,
    bonusJustification: String
  },
  reviewMeetings: [{
    scheduledDate: { type: Date, required: true },
    actualDate: Date,
    duration: { type: Number, required: true }, // minutes
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    notes: String,
    actionItems: [{
      description: { type: String, required: true },
      assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      dueDate: { type: Date, required: true },
      status: { 
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      }
    }]
  }],
  attachments: [{
    name: { type: String, required: true },
    type: String,
    url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadDate: { type: Date, default: Date.now }
  }],
  signatures: {
    practitioner: {
      signed: { type: Boolean, default: false },
      date: Date,
      comments: String
    },
    reviewer: {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      signed: { type: Boolean, default: false },
      date: Date,
      comments: String
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
performanceReviewSchema.index({ practitionerId: 1, 'reviewPeriod.start': 1 });
performanceReviewSchema.index({ status: 1 });
performanceReviewSchema.index({ 'reviewPeriod.end': 1 });

// Add pre-save middleware to update timestamps
performanceReviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const PerformanceReviewModel = model<PerformanceReview>('PerformanceReview', performanceReviewSchema); 