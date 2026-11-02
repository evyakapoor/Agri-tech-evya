import { CommunityPost } from '../models/CommunityPost.js';

export const getPosts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 15 } = req.query;

    const filter = { moderationStatus: { $ne: 'Removed' } };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter)
        .populate('author', 'name email location role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      CommunityPost.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      posts,
    });
  } catch (err) {
    next(err);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'name email location role')
      .populate('comments.user', 'name role');

    if (!post || post.moderationStatus === 'Removed') {
      return res.status(404).json({ success: false, message: 'Post not found or has been moderated.' });
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;

    const post = await CommunityPost.create({
      author: req.user._id,
      title,
      content,
      category: category || 'General Discussion',
    });

    const populatedPost = await CommunityPost.findById(post._id).populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Post published to the community forum.',
      post: populatedPost,
    });
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const post = await CommunityPost.findById(req.params.id);

    if (!post || post.moderationStatus === 'Removed') {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.comments.push({
      user: req.user._id,
      authorName: req.user.name,
      comment,
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment posted.',
      post,
    });
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own posts.' });
    }

    await CommunityPost.findByIdAndDelete(post._id);

    res.status(200).json({
      success: true,
      message: 'Community post deleted.',
    });
  } catch (err) {
    next(err);
  }
};
