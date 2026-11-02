import mongoose from 'mongoose';

const weatherRecordSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      index: true,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    locationName: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    temperature: {
      type: Number,
      required: true,
    },
    feelsLike: {
      type: Number,
      default: null,
    },
    tempMin: {
      type: Number,
      default: null,
    },
    tempMax: {
      type: Number,
      default: null,
    },
    humidity: {
      type: Number,
      required: true,
    },
    pressure: {
      type: Number,
      default: null,
    },
    rainfall: {
      type: Number,
      default: 0,
    },
    windSpeed: {
      type: Number,
      default: 0,
    },
    windDirection: {
      type: String,
      default: 'N/A',
    },
    weatherCondition: {
      type: String,
      default: 'Clear',
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '01d',
    },
    forecast: {
      type: Array,
      default: [],
    },
    forecastTimestamp: {
      type: Date,
      default: Date.now,
    },
    provider: {
      type: String,
      default: 'OpenWeatherMap',
    },
    dataFreshness: {
      type: String,
      default: 'live', // 'live', 'cached', 'fallback_sample'
    },
    isLiveFeed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

weatherRecordSchema.index({ farm: 1, createdAt: -1 });

export const WeatherRecord = mongoose.model('WeatherRecord', weatherRecordSchema);
