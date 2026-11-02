import { SoilReport } from '../models/SoilReport.js';
import { Farm } from '../models/Farm.js';
import { Crop } from '../models/Crop.js';
import { generateSoilRecommendations } from '../services/agronomyService.js';
import { createNotification } from '../services/notificationService.js';

export const getSoilReports = async (req, res, next) => {
  try {
    const { farmId, source } = req.query;

    const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { owner: req.user._id };

    if (farmId) filter.farm = farmId;
    if (source) filter.sourceOfMeasurements = source;

    const reports = await SoilReport.find(filter)
      .populate('farm', 'farmName address soilType')
      .populate('crop', 'cropName variety')
      .sort({ testDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (err) {
    next(err);
  }
};

export const getSoilReportById = async (req, res, next) => {
  try {
    const report = await SoilReport.findById(req.params.id)
      .populate('farm', 'farmName address soilType')
      .populate('crop', 'cropName variety');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Soil report not found.' });
    }

    if (report.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this report.' });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (err) {
    next(err);
  }
};

export const createSoilReport = async (req, res, next) => {
  try {
    const { farm, crop, pH, nitrogen, phosphorus, potassium, moisture, organicMatter, testDate, sourceOfMeasurements, laboratoryName } = req.body;

    const farmDoc = await Farm.findById(farm);
    if (!farmDoc) {
      return res.status(404).json({ success: false, message: 'Associated farm not found.' });
    }

    if (farmDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this farm.' });
    }

    let cropName = null;
    if (crop) {
      const cropDoc = await Crop.findById(crop);
      if (cropDoc) cropName = cropDoc.cropName;
    }

    // Generate rule-based agronomic recommendations
    const recommendations = generateSoilRecommendations({
      pH: Number(pH),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      moisture: Number(moisture),
      organicMatter: Number(organicMatter || 1.5),
      cropName,
    });

    const report = await SoilReport.create({
      farm,
      owner: req.user._id,
      crop: crop || null,
      pH: Number(pH),
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      moisture: Number(moisture),
      organicMatter: Number(organicMatter || 1.5),
      testDate: testDate || new Date(),
      recommendations,
      sourceOfMeasurements: sourceOfMeasurements || 'manual',
      laboratoryName: sourceOfMeasurements === 'laboratory' ? laboratoryName || 'Certified Soil Testing Laboratory' : '',
    });

    // Alert user if severe pH or moisture deficit detected
    if (Number(pH) < 5.5 || Number(pH) > 8.5 || Number(moisture) < 25) {
      await createNotification({
        userId: req.user._id,
        title: 'Soil Health Notice',
        message: `Crucial metric detected for ${farmDoc.farmName}: pH ${pH}, moisture ${moisture}%. Review recommendations.`,
        type: 'Soil Alert',
        link: '/soil',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Soil report saved with agronomic recommendations.',
      report,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteSoilReport = async (req, res, next) => {
  try {
    const report = await SoilReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Soil report not found.' });
    }

    if (report.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this report.' });
    }

    await SoilReport.findByIdAndDelete(report._id);

    res.status(200).json({
      success: true,
      message: 'Soil report deleted.',
    });
  } catch (err) {
    next(err);
  }
};
