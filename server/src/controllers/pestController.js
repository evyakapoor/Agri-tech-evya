import { PestAlert } from '../models/PestAlert.js';
import { Farm } from '../models/Farm.js';
import { Crop } from '../models/Crop.js';
import { getIPMRecommendations } from '../services/agronomyService.js';
import { createNotification } from '../services/notificationService.js';

export const getPestAlerts = async (req, res, next) => {
  try {
    const { farmId, severity, status } = req.query;

    const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { owner: req.user._id };

    if (farmId) filter.farm = farmId;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const alerts = await PestAlert.find(filter)
      .populate('farm', 'farmName address')
      .populate('crop', 'cropName variety')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (err) {
    next(err);
  }
};

export const createPestAlert = async (req, res, next) => {
  try {
    const { farm, crop, pestOrDiseaseName, severity, description, symptoms, source } = req.body;

    const farmDoc = await Farm.findById(farm);
    if (!farmDoc) {
      return res.status(404).json({ success: false, message: 'Farm not found.' });
    }

    if (farmDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this farm.' });
    }

    // Generate safe IPM recommendations
    const recommendedActions = getIPMRecommendations(pestOrDiseaseName, severity);

    const alert = await PestAlert.create({
      farm,
      owner: req.user._id,
      crop: crop || null,
      pestOrDiseaseName,
      severity: severity || 'Moderate',
      description,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean),
      recommendedActions,
      status: 'Active',
      source: source || 'Farmer Observation',
    });

    // Send high-priority notification to farmer
    await createNotification({
      userId: req.user._id,
      title: `Pest Advisory: ${pestOrDiseaseName}`,
      message: `${severity} severity alert recorded on ${farmDoc.farmName}. Safe IPM guidelines generated.`,
      type: 'Pest Alert',
      link: '/pest-alerts',
    });

    res.status(201).json({
      success: true,
      message: 'Pest observation recorded and advisory guidelines generated.',
      alert,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePestAlert = async (req, res, next) => {
  try {
    const alert = await PestAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    if (alert.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this observation.' });
    }

    const { status, description, severity } = req.body;

    if (status) alert.status = status;
    if (description) alert.description = description;
    if (severity) {
      alert.severity = severity;
      alert.recommendedActions = getIPMRecommendations(alert.pestOrDiseaseName, severity);
    }

    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Pest alert updated.',
      alert,
    });
  } catch (err) {
    next(err);
  }
};

export const deletePestAlert = async (req, res, next) => {
  try {
    const alert = await PestAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    if (alert.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this alert.' });
    }

    await PestAlert.findByIdAndDelete(alert._id);

    res.status(200).json({
      success: true,
      message: 'Pest alert record removed.',
    });
  } catch (err) {
    next(err);
  }
};
