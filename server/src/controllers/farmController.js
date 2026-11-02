import { Farm } from '../models/Farm.js';
import { Crop } from '../models/Crop.js';
import { SoilReport } from '../models/SoilReport.js';
import { PestAlert } from '../models/PestAlert.js';
import { FarmActivity } from '../models/FarmActivity.js';

export const getFarms = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { owner: req.user._id };
    const farms = await Farm.find(filter).sort({ createdAt: -1 });

    // Attach count of crops for each farm
    const farmIds = farms.map((f) => f._id);
    const cropCounts = await Crop.aggregate([
      { $match: { farm: { $in: farmIds } } },
      { $group: { _id: '$farm', count: { $sum: 1 } } },
    ]);
    const cropCountMap = {};
    cropCounts.forEach((c) => {
      cropCountMap[c._id.toString()] = c.count;
    });

    const farmsWithMeta = farms.map((farm) => ({
      ...farm.toObject(),
      cropCount: cropCountMap[farm._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: farms.length,
      farms: farmsWithMeta,
    });
  } catch (err) {
    next(err);
  }
};

export const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found.' });
    }

    if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this farm.' });
    }

    const [crops, soilReports, pestAlerts, activities] = await Promise.all([
      Crop.find({ farm: farm._id }).sort({ plantingDate: -1 }),
      SoilReport.find({ farm: farm._id }).sort({ testDate: -1 }),
      PestAlert.find({ farm: farm._id }).sort({ createdAt: -1 }),
      FarmActivity.find({ farm: farm._id }).sort({ date: -1 }).limit(10),
    ]);

    res.status(200).json({
      success: true,
      farm,
      crops,
      soilReports,
      pestAlerts,
      activities,
    });
  } catch (err) {
    next(err);
  }
};

export const createFarm = async (req, res, next) => {
  try {
    const { farmName, address, region, coordinates, totalArea, areaUnit, soilType, irrigationMethod } = req.body;

    const farm = await Farm.create({
      owner: req.user._id,
      farmName,
      address,
      region: region || '',
      coordinates: coordinates || {},
      totalArea,
      areaUnit: areaUnit || 'acres',
      soilType: soilType || 'Loamy',
      irrigationMethod: irrigationMethod || 'Drip',
    });

    res.status(201).json({
      success: true,
      message: 'Farm registered successfully.',
      farm,
    });
  } catch (err) {
    next(err);
  }
};

export const updateFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found.' });
    }

    if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this farm.' });
    }

    const { farmName, address, region, coordinates, totalArea, areaUnit, soilType, irrigationMethod } = req.body;

    if (farmName) farm.farmName = farmName;
    if (address) farm.address = address;
    if (region !== undefined) farm.region = region;
    if (coordinates) farm.coordinates = coordinates;
    if (totalArea) farm.totalArea = totalArea;
    if (areaUnit) farm.areaUnit = areaUnit;
    if (soilType) farm.soilType = soilType;
    if (irrigationMethod) farm.irrigationMethod = irrigationMethod;

    await farm.save();

    res.status(200).json({
      success: true,
      message: 'Farm details updated successfully.',
      farm,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found.' });
    }

    if (farm.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this farm.' });
    }

    // Cascade delete associated crops, soil reports, activities, pest alerts
    await Promise.all([
      Crop.deleteMany({ farm: farm._id }),
      SoilReport.deleteMany({ farm: farm._id }),
      PestAlert.deleteMany({ farm: farm._id }),
      FarmActivity.deleteMany({ farm: farm._id }),
      Farm.findByIdAndDelete(farm._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Farm and associated crop records deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
