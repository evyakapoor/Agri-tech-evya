import { fetchWeatherForLocation } from '../services/weatherService.js';
import { WeatherRecord } from '../models/WeatherRecord.js';
import { Farm } from '../models/Farm.js';

export const getWeather = async (req, res, next) => {
  try {
    const { farmId, locationName, lat, lon } = req.query;

    let targetLocation = locationName;
    let targetLat = lat;
    let targetLon = lon;

    if (farmId) {
      const farm = await Farm.findById(farmId);
      if (farm) {
        targetLocation = farm.address || farm.region || farm.farmName;
        if (farm.coordinates?.latitude && farm.coordinates?.longitude) {
          targetLat = farm.coordinates.latitude;
          targetLon = farm.coordinates.longitude;
        }
      }
    }

    // Check if we have a recent snapshot (within last 30 minutes) for this farm or location to avoid spamming the external API
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const existingSnapshot = await WeatherRecord.findOne({
      ...(farmId ? { farm: farmId } : { locationName: targetLocation || 'Central Agricultural Zone' }),
      createdAt: { $gte: thirtyMinutesAgo },
    }).sort({ createdAt: -1 });

    if (existingSnapshot && req.query.forceRefresh !== 'true') {
      return res.status(200).json({
        success: true,
        source: 'cached_snapshot',
        weather: existingSnapshot,
      });
    }

    const weather = await fetchWeatherForLocation({
      locationName: targetLocation,
      latitude: targetLat,
      longitude: targetLon,
      farmId,
      userId: req.user?._id,
    });

    res.status(200).json({
      success: true,
      source: 'fresh_fetch',
      weather,
    });
  } catch (err) {
    next(err);
  }
};

export const getWeatherHistory = async (req, res, next) => {
  try {
    const { farmId, limit = 10 } = req.query;
    const filter = farmId ? { farm: farmId } : {};

    const history = await WeatherRecord.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err) {
    next(err);
  }
};
