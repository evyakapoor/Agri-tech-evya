import mongoose from 'mongoose';

const pestAlertSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Pest alert must be tied to a farm'],
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pest alert must have an owner reference'],
      index: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      default: null,
    },
    pestOrDiseaseName: {
      type: String,
      required: [true, 'Pest or disease name is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      required: true,
      default: 'Moderate',
    },
    description: {
      type: String,
      required: [true, 'Description of symptoms or observation is required'],
    },
    symptoms: {
      type: [String],
      default: [],
    },
    recommendedActions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Under Control', 'Resolved'],
      default: 'Active',
      index: true,
    },
    source: {
      type: String,
      enum: ['Farmer Observation', 'Agronomist Advisory', 'Weather-Triggered Alert', 'System Forecast'],
      default: 'Farmer Observation',
    },
  },
  {
    timestamps: true,
  }
);

pestAlertSchema.index({ farm: 1, status: 1 });

export const PestAlert = mongoose.model('PestAlert', pestAlertSchema);
