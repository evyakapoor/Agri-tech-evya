import mongoose from 'mongoose';

const farmActivitySchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Activity must be linked to a farm'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must belong to a user'],
      index: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      default: null,
    },
    activityType: {
      type: String,
      enum: [
        'Planting',
        'Irrigation',
        'Fertilization',
        'Spraying',
        'Soil Testing',
        'Inspection',
        'Weeding',
        'Harvesting',
        'Pruning',
        'Other',
      ],
      required: [true, 'Activity type is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Activity description is required'],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

farmActivitySchema.index({ farm: 1, date: -1 });

export const FarmActivity = mongoose.model('FarmActivity', farmActivitySchema);
