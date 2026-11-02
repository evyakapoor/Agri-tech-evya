import { Resource } from '../models/Resource.js';

export const getResources = async (req, res, next) => {
  try {
    const { category, search, approvalStatus } = req.query;

    const filter = {};

    // Regular users only see approved resources
    if (!req.user || req.user.role !== 'admin') {
      filter.approvalStatus = 'Approved';
    } else if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (err) {
    next(err);
  }
};

export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource item not found.' });
    }
    res.status(200).json({ success: true, resource });
  } catch (err) {
    next(err);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const { name, category, description, price, unit, stockQuantity, imageUrl, approvalStatus } = req.body;

    const resource = await Resource.create({
      name,
      category,
      description,
      price: Number(price),
      unit: unit || 'unit',
      stockQuantity: Number(stockQuantity || 0),
      imageUrl: imageUrl || '',
      approvalStatus: req.user.role === 'admin' ? approvalStatus || 'Approved' : 'Pending',
      creator: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Product listing created.',
      resource,
    });
  } catch (err) {
    next(err);
  }
};

export const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    if (req.user.role !== 'admin' && resource.creator?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this resource.' });
    }

    const { name, category, description, price, unit, stockQuantity, imageUrl, approvalStatus } = req.body;

    if (name) resource.name = name;
    if (category) resource.category = category;
    if (description) resource.description = description;
    if (price !== undefined) resource.price = Number(price);
    if (unit) resource.unit = unit;
    if (stockQuantity !== undefined) resource.stockQuantity = Number(stockQuantity);
    if (imageUrl !== undefined) resource.imageUrl = imageUrl;
    if (approvalStatus && req.user.role === 'admin') resource.approvalStatus = approvalStatus;

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      resource,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only administrators can delete marketplace items.' });
    }

    await Resource.findByIdAndDelete(resource._id);

    res.status(200).json({
      success: true,
      message: 'Resource removed from catalog.',
    });
  } catch (err) {
    next(err);
  }
};
