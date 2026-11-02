import mongoose from 'mongoose';

const soilReportSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Soil report must reference a farm'],
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Soil report must have an owner reference'],
      index: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      default: null,
    },
    pH: {
      type: Number,
      required: [true, 'pH value is required'],
      min: [0, 'pH cannot be less than 0'],
      max: [14, 'pH cannot exceed 14'],
    },
    nitrogen: {
      type: Number,
      required: [true, 'Nitrogen (N) value in kg/ha or ppm is required'],
      min: [0, 'Nitrogen value cannot be negative'],
    },
    phosphorus: {
      type: Number,
      required: [true, 'Phosphorus (P) value in kg/ha or ppm is required'],
      min: [0, 'Phosphorus value cannot be negative'],
    },
    potassium: {
      type: Number,
      required: [true, 'Potassium (K) value in kg/ha or ppm is required'],
      min: [0, 'Potassium value cannot be negative'],
    },
    moisture: {
      type: Number,
      required: [true, 'Moisture percentage is required'],
      min: [0, 'Moisture cannot be less than 0%'],
      max: [100, 'Moisture cannot exceed 100%'],
    },
    organicMatter: {
      type: Number,
      default: 1.5,
      min: [0, 'Organic matter cannot be negative'],
      max: [100, 'Organic matter cannot exceed 100%'],
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    recommendations: {
      type: [String],
      default: [],
    },
    sourceOfMeasurements: {
      type: String,
      enum: ['manual', 'laboratory', 'simulated_demo'],
      default: 'manual',
    },
    laboratoryName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

soilReportSchema.index({ farm: 1, testDate: -1 });

export const SoilReport = mongoose.model('SoilReport', soilReportSchema);
