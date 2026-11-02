import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Consultation must be associated with a farmer'],
      index: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Crop Health', 'Soil Fertility', 'Pest Control', 'Irrigation', 'Market & Storage', 'General Farming'],
      default: 'General Farming',
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
    },
    response: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Answered', 'Closed'],
      default: 'Open',
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

consultationSchema.index({ farmer: 1, createdAt: -1 });

export const Consultation = mongoose.model('Consultation', consultationSchema);
