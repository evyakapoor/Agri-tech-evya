import { FarmActivity } from '../models/FarmActivity.js';
import { Farm } from '../models/Farm.js';

export const getActivities = async (req, res, next) => {
  try {
    const { farmId, cropId, activityType, limit = 50 } = req.query;

    const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { user: req.user._id };

    if (farmId) filter.farm = farmId;
    if (cropId) filter.crop = cropId;
    if (activityType) filter.activityType = activityType;

    const activities = await FarmActivity.find(filter)
      .populate('farm', 'farmName address')
      .populate('crop', 'cropName variety')
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (err) {
    next(err);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const { farm, crop, activityType, description, date, cost } = req.body;

    const farmDoc = await Farm.findById(farm);
    if (!farmDoc) {
      return res.status(404).json({ success: false, message: 'Farm not found.' });
    }

    if (farmDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to add activities to this farm.' });
    }

    const activity = await FarmActivity.create({
      farm,
      user: req.user._id,
      crop: crop || null,
      activityType,
      description,
      date: date || new Date(),
      cost: Number(cost || 0),
    });

    const populated = await FarmActivity.findById(activity._id)
      .populate('farm', 'farmName')
      .populate('crop', 'cropName');

    res.status(201).json({
      success: true,
      message: 'Farm activity recorded.',
      activity: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await FarmActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    if (activity.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this activity log.' });
    }

    await FarmActivity.findByIdAndDelete(activity._id);

    res.status(200).json({
      success: true,
      message: 'Activity log deleted.',
    });
  } catch (err) {
    next(err);
  }
};
