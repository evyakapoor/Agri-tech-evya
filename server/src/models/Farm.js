import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farm must belong to a user'],
      index: true,
    },
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      maxlength: [120, 'Farm name cannot exceed 120 characters'],
    },
    address: {
      type: String,
      required: [true, 'Farm address or region is required'],
      trim: true,
    },
    region: {
      type: String,
      trim: true,
      default: '',
    },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    totalArea: {
      type: Number,
      required: [true, 'Total area is required'],
      min: [0.01, 'Total area must be greater than 0'],
    },
    areaUnit: {
      type: String,
      enum: ['acres', 'hectares', 'bigha'],
      default: 'acres',
    },
    soilType: {
      type: String,
      enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Loamy', 'Sandy', 'Clayey', 'Other'],
      default: 'Loamy',
    },
    irrigationMethod: {
      type: String,
      enum: ['Drip', 'Sprinkler', 'Flood', 'Rainfed', 'Canal', 'Other'],
      default: 'Drip',
    },
  },
  {
    timestamps: true,
  }
);

farmSchema.index({ owner: 1, createdAt: -1 });

export const Farm = mongoose.model('Farm', farmSchema);
