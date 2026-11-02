import axios from 'axios';
import { WeatherRecord } from '../models/WeatherRecord.js';
import { config } from '../config/env.js';

// Realistic agronomic weather samples by region when API key is not yet configured
const generateSampleWeatherData = (locationName, lat, lon) => {
  const currentHour = new Date().getHours();
  const baseTemp = 26 + Math.sin((currentHour - 8) / 4) * 5;
  const humidity = Math.min(95, Math.max(35, Math.round(65 + Math.cos(currentHour / 3) * 15)));
  const windSpeed = +(8 + Math.random() * 6).toFixed(1);
  const rainfall = Math.random() > 0.7 ? +(Math.random() * 5).toFixed(1) : 0;

  const forecast = [];
  const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    forecast.push({
      day: days[i],
      date: d.toISOString().split('T')[0],
      tempMin: +(baseTemp - 4 - (i % 2)).toFixed(1),
      tempMax: +(baseTemp + 5 + (i % 3)).toFixed(1),
      humidity: humidity + (i % 2 === 0 ? 5 : -5),
      rainProb: i === 2 ? 65 : 15,
      condition: i === 2 ? 'Scattered Showers' : 'Partly Cloudy',
      icon: i === 2 ? '10d' : '02d',
    });
  }

  return {
    locationName: locationName || 'Central Agricultural Zone',
    coordinates: {
      latitude: lat ? parseFloat(lat) : 28.6139,
      longitude: lon ? parseFloat(lon) : 77.2090,
    },
    temperature: +baseTemp.toFixed(1),
    feelsLike: +(baseTemp + 1.5).toFixed(1),
    tempMin: +(baseTemp - 3).toFixed(1),
    tempMax: +(baseTemp + 4).toFixed(1),
    humidity,
    pressure: 1012,
    rainfall,
    windSpeed,
    windDirection: 'NW (315°)',
    weatherCondition: rainfall > 0 ? 'Light Rain' : 'Partly Cloudy',
    description: rainfall > 0 ? 'Light moisture beneficial for root zone' : 'Scattered clouds with mild sun',
    icon: rainfall > 0 ? '10d' : '02d',
    forecast,
    forecastTimestamp: new Date(),
    provider: 'OpenWeatherMap (Simulation Mode — Set OPENWEATHER_API_KEY for live data)',
    dataFreshness: 'fallback_sample',
    isLiveFeed: false,
  };
};

export const fetchWeatherForLocation = async ({ locationName, latitude, longitude, farmId, userId }) => {
  const apiKey = config.openWeatherApiKey;

  // If no API key configured, use transparent sample data with honest indicators
  if (!apiKey || apiKey === 'your_openweather_api_key_here') {
    const sampleData = generateSampleWeatherData(locationName, latitude, longitude);
    
    // Save snapshot to MongoDB if farmId or userId provided
    const snapshot = await WeatherRecord.create({
      farm: farmId || null,
      user: userId || null,
      ...sampleData,
    });

    return snapshot;
  }

  // Live OpenWeatherMap call
  try {
    let queryParam = '';
    if (latitude && longitude) {
      queryParam = `lat=${latitude}&lon=${longitude}`;
    } else if (locationName) {
      queryParam = `q=${encodeURIComponent(locationName)}`;
    } else {
      queryParam = 'lat=28.6139&lon=77.2090'; // Default coordinates
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?${queryParam}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${queryParam}&units=metric&appid=${apiKey}`;

    const [currentRes, forecastRes] = await Promise.all([
      axios.get(currentWeatherUrl, { timeout: 8000 }),
      axios.get(forecastUrl, { timeout: 8000 }).catch(() => null),
    ]);

    const c = currentRes.data;
    const f = forecastRes ? forecastRes.data : null;

    // Aggregate 5-day daily forecast from 3-hour slices
    const dailyForecastMap = {};
    if (f && Array.isArray(f.list)) {
      for (const item of f.list) {
        const dateKey = item.dt_txt.split(' ')[0];
        if (!dailyForecastMap[dateKey]) {
          dailyForecastMap[dateKey] = {
            date: dateKey,
            temps: [],
            humidities: [],
            conditions: [],
            icons: [],
            pop: item.pop || 0,
          };
        }
        dailyForecastMap[dateKey].temps.push(item.main.temp);
        dailyForecastMap[dateKey].humidities.push(item.main.humidity);
        dailyForecastMap[dateKey].conditions.push(item.weather[0]?.main || 'Clear');
        dailyForecastMap[dateKey].icons.push(item.weather[0]?.icon || '01d');
      }
    }

    const parsedForecast = Object.values(dailyForecastMap).slice(0, 5).map((d, index) => ({
      day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `Day ${index + 1}`,
      date: d.date,
      tempMin: Math.min(...d.temps),
      tempMax: Math.max(...d.temps),
      humidity: Math.round(d.humidities.reduce((a, b) => a + b, 0) / d.humidities.length),
      rainProb: Math.round((d.pop || 0) * 100),
      condition: d.conditions[0] || 'Clear',
      icon: d.icons[0] || '01d',
    }));

    const weatherData = {
      farm: farmId || null,
      user: userId || null,
      locationName: c.name || locationName || 'Farm Location',
      coordinates: {
        latitude: c.coord?.lat || latitude || null,
        longitude: c.coord?.lon || longitude || null,
      },
      temperature: Math.round(c.main.temp * 10) / 10,
      feelsLike: Math.round(c.main.feels_like * 10) / 10,
      tempMin: Math.round(c.main.temp_min * 10) / 10,
      tempMax: Math.round(c.main.temp_max * 10) / 10,
      humidity: c.main.humidity,
      pressure: c.main.pressure,
      rainfall: c.rain ? c.rain['1h'] || c.rain['3h'] || 0 : 0,
      windSpeed: Math.round(c.wind.speed * 3.6 * 10) / 10, // convert m/s to km/h
      windDirection: `${c.wind.deg || 0}°`,
      weatherCondition: c.weather[0]?.main || 'Clear',
      description: c.weather[0]?.description || '',
      icon: c.weather[0]?.icon || '01d',
      forecast: parsedForecast,
      forecastTimestamp: new Date(),
      provider: 'OpenWeatherMap (Live)',
      dataFreshness: 'live',
      isLiveFeed: true,
    };

    const savedRecord = await WeatherRecord.create(weatherData);
    return savedRecord;
  } catch (err) {
    console.warn(`[WeatherService] Provider error: ${err.message}. Using graceful fallback.`);
    const fallbackData = generateSampleWeatherData(locationName, latitude, longitude);
    fallbackData.provider = 'OpenWeatherMap (Unavailable / Fallback Data)';
    fallbackData.dataFreshness = 'provider_unavailable_fallback';
    fallbackData.isLiveFeed = false;

    const saved = await WeatherRecord.create({
      farm: farmId || null,
      user: userId || null,
      ...fallbackData,
    });
    return saved;
  }
};
