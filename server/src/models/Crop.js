import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Crop must be associated with a farm'],
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Crop must have an owner reference'],
      index: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    variety: {
      type: String,
      trim: true,
      default: '',
    },
    plantingDate: {
      type: Date,
      required: [true, 'Planting date is required'],
    },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Expected harvest date is required'],
    },
    fieldArea: {
      type: Number,
      required: [true, 'Field area is required'],
      min: [0, 'Field area cannot be negative'],
    },
    growthStage: {
      type: String,
      enum: ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvested'],
      default: 'Sowing',
    },
    healthStatus: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Stressed', 'Diseased'],
      default: 'Good',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

cropSchema.index({ farm: 1, growthStage: 1 });
cropSchema.index({ owner: 1, expectedHarvestDate: 1 });

export const Crop = mongoose.model('Crop', cropSchema);
