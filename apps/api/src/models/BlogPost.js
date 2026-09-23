import mongoose from 'mongoose';
import { CATEGORY_SLUGS } from '@repo/constants';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    tags: [{ type: String }],
    relatedCategory: { type: String, enum: CATEGORY_SLUGS },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seoTitle: { type: String },
    seoDescription: { type: String },
    publishedAt: { type: Date, index: true },
  },
  { timestamps: true },
);

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
