import { Consultation } from '../models/Consultation.js';
import { createNotification } from '../services/notificationService.js';

export const getMyConsultations = async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ farmer: req.user._id })
      .populate('expert', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      consultations,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllConsultations = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const consultations = await Consultation.find(filter)
      .populate('farmer', 'name email phone location')
      .populate('expert', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consultations.length,
      consultations,
    });
  } catch (err) {
    next(err);
  }
};

export const createConsultation = async (req, res, next) => {
  try {
    const { subject, category, question } = req.body;

    const consultation = await Consultation.create({
      farmer: req.user._id,
      subject,
      category: category || 'General Farming',
      question,
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted to agricultural specialists.',
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

export const respondToConsultation = async (req, res, next) => {
  try {
    const { response, status } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation ticket not found.' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only authorized agronomists and admins can provide official expert responses.' });
    }

    consultation.response = response;
    consultation.expert = req.user._id;
    consultation.status = status || 'Answered';
    consultation.respondedAt = new Date();

    await consultation.save();

    // Notify farmer of verified answer
    await createNotification({
      userId: consultation.farmer,
      title: 'Agronomist Replied',
      message: `An expert has answered your consultation regarding "${consultation.subject}".`,
      type: 'Consultation Reply',
      link: '/consultations',
    });

    res.status(200).json({
      success: true,
      message: 'Expert response registered.',
      consultation,
    });
  } catch (err) {
    next(err);
  }
};
