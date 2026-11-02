import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Community post must have an author'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    category: {
      type: String,
      enum: ['General Discussion', 'Farming Tips', 'Market Trends', 'Tech in Farming', 'Pest Warnings', 'Success Stories'],
      default: 'General Discussion',
      index: true,
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    moderationStatus: {
      type: String,
      enum: ['Published', 'Flagged', 'Removed'],
      default: 'Published',
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

communityPostSchema.index({ moderationStatus: 1, createdAt: -1 });

export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
