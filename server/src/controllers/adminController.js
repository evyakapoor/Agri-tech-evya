import { User } from '../models/User.js';
import { Farm } from '../models/Farm.js';
import { Crop } from '../models/Crop.js';
import { Resource } from '../models/Resource.js';
import { Order } from '../models/Order.js';
import { Consultation } from '../models/Consultation.js';
import { CommunityPost } from '../models/CommunityPost.js';
import { PestAlert } from '../models/PestAlert.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFarms,
      totalCrops,
      totalResources,
      totalOrders,
      openConsultations,
      activePestAlerts,
      totalPosts,
    ] = await Promise.all([
      User.countDocuments(),
      Farm.countDocuments(),
      Crop.countDocuments(),
      Resource.countDocuments(),
      Order.countDocuments(),
      Consultation.countDocuments({ status: { $in: ['Open', 'In Progress'] } }),
      PestAlert.countDocuments({ status: 'Active' }),
      CommunityPost.countDocuments(),
    ]);

    // Calculate total order revenue
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFarms,
        totalCrops,
        totalResources,
        totalOrders,
        totalRevenue,
        openConsultations,
        activePestAlerts,
        totalPosts,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['farmer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Administrators cannot delete their own account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Cascade delete user data
    await Promise.all([
      Farm.deleteMany({ owner: user._id }),
      Crop.deleteMany({ owner: user._id }),
      Order.deleteMany({ user: user._id }),
      User.findByIdAndDelete(user._id),
    ]);

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const moderatePost = async (req, res, next) => {
  try {
    const { moderationStatus } = req.body;
    if (!['Published', 'Flagged', 'Removed'].includes(moderationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid moderation status.' });
    }

    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { moderationStatus },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Post status changed to ${moderationStatus}.`,
      post,
    });
  } catch (err) {
    next(err);
  }
};
