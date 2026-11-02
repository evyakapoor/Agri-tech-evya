import { Crop } from '../models/Crop.js';
import { Farm } from '../models/Farm.js';
import { FarmActivity } from '../models/FarmActivity.js';
import { PestAlert } from '../models/PestAlert.js';

export const getCrops = async (req, res, next) => {
  try {
    const { farmId, growthStage, healthStatus, search } = req.query;

    const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { owner: req.user._id };

    if (farmId) filter.farm = farmId;
    if (growthStage) filter.growthStage = growthStage;
    if (healthStatus) filter.healthStatus = healthStatus;
    if (search) {
      filter.$or = [
        { cropName: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } },
      ];
    }

    const crops = await Crop.find(filter)
      .populate('farm', 'farmName address soilType irrigationMethod')
      .sort({ expectedHarvestDate: 1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      crops,
    });
  } catch (err) {
    next(err);
  }
};

export const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'farmName address soilType totalArea');
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found.' });
    }

    if (crop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this crop.' });
    }

    const [activities, pestAlerts] = await Promise.all([
      FarmActivity.find({ crop: crop._id }).sort({ date: -1 }),
      PestAlert.find({ crop: crop._id }).sort({ createdAt: -1 }),
    ]);

    // Rule-based stage recommendation
    const stageRecommendations = {
      Sowing: 'Ensure proper seed treatment with bio-fungicide (Trichoderma) and maintain adequate seed-bed moisture.',
      Germination: 'Monitor emergence percentage; irrigate lightly to avoid crust formation.',
      Vegetative: 'Optimal timing for primary vegetative growth. Check nitrogen status and initiate weeding.',
      Flowering: 'Critical water-sensitive period. Avoid heavy moisture stress and apply balanced potassium/boron.',
      Fruiting: 'Support fruit/grain development with balanced nutrition; monitor for pod/fruit borers.',
      Maturity: 'Begin pre-harvest interval; withhold chemical sprays and gradually decrease irrigation.',
      Harvested: 'Record final yield, clear crop residues, and plan soil replenishment for the next rotation.',
    };

    res.status(200).json({
      success: true,
      crop,
      activities,
      pestAlerts,
      stageRecommendation: stageRecommendations[crop.growthStage] || 'Monitor crop health and schedule regular irrigation.',
    });
  } catch (err) {
    next(err);
  }
};

export const createCrop = async (req, res, next) => {
  try {
    const { farm, cropName, variety, plantingDate, expectedHarvestDate, fieldArea, growthStage, healthStatus, notes } = req.body;

    const farmDoc = await Farm.findById(farm);
    if (!farmDoc) {
      return res.status(404).json({ success: false, message: 'Associated farm does not exist.' });
    }

    if (farmDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not own the specified farm.' });
    }

    const crop = await Crop.create({
      farm,
      owner: req.user._id,
      cropName,
      variety: variety || '',
      plantingDate,
      expectedHarvestDate,
      fieldArea,
      growthStage: growthStage || 'Sowing',
      healthStatus: healthStatus || 'Good',
      notes: notes || '',
    });

    // Automatically log a planting activity if growthStage is Sowing or plantingDate is today
    await FarmActivity.create({
      farm,
      user: req.user._id,
      crop: crop._id,
      activityType: 'Planting',
      description: `Planted ${cropName} (${variety || 'standard variety'}) over ${fieldArea} ${farmDoc.areaUnit}.`,
      date: plantingDate || new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Crop registered and initial activity logged.',
      crop,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found.' });
    }

    if (crop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this crop.' });
    }

    const { cropName, variety, plantingDate, expectedHarvestDate, fieldArea, growthStage, healthStatus, notes } = req.body;

    if (cropName) crop.cropName = cropName;
    if (variety !== undefined) crop.variety = variety;
    if (plantingDate) crop.plantingDate = plantingDate;
    if (expectedHarvestDate) crop.expectedHarvestDate = expectedHarvestDate;
    if (fieldArea !== undefined) crop.fieldArea = fieldArea;
    if (growthStage) crop.growthStage = growthStage;
    if (healthStatus) crop.healthStatus = healthStatus;
    if (notes !== undefined) crop.notes = notes;

    await crop.save();

    res.status(200).json({
      success: true,
      message: 'Crop details updated.',
      crop,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found.' });
    }

    if (crop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this crop.' });
    }

    await Promise.all([
      FarmActivity.deleteMany({ crop: crop._id }),
      PestAlert.deleteMany({ crop: crop._id }),
      Crop.findByIdAndDelete(crop._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Crop and linked logs removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};
