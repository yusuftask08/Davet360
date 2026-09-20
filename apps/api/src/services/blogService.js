import { slugify } from '@repo/utils';
import { BlogPost } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';

export async function listPublishedPosts() {
  return BlogPost.find({ publishedAt: { $ne: null } }).sort({ publishedAt: -1 });
}

export async function getPublishedPostBySlug(slug) {
  const post = await BlogPost.findOne({ slug, publishedAt: { $ne: null } });
  if (!post) throw new ApiError(404, 'Yazı bulunamadı');
  return post;
}

export async function createPost(authorId, data) {
  const baseSlug = slugify(data.title);
  let slug = baseSlug;
  let attempt = 1;
  while (await BlogPost.exists({ slug })) {
    slug = `${baseSlug}-${attempt}`;
    attempt += 1;
  }

  const { publish, ...rest } = data;
  return BlogPost.create({ ...rest, slug, authorId, publishedAt: publish ? new Date() : null });
}

// Admin paneli — taslak + yayınlanmış tüm yazılar (yönetim ekranı için).
export async function listAllPostsAdmin() {
  return BlogPost.find().sort({ createdAt: -1 }).populate('authorId', 'name');
}

export async function getPostByIdAdmin(postId) {
  const post = await BlogPost.findById(postId);
  if (!post) throw new ApiError(404, 'Yazı bulunamadı');
  return post;
}

export async function updatePost(postId, data) {
  const post = await BlogPost.findById(postId);
  if (!post) throw new ApiError(404, 'Yazı bulunamadı');

  const { publish, ...rest } = data;
  Object.assign(post, rest);
  if (publish === true && !post.publishedAt) post.publishedAt = new Date();
  if (publish === false) post.publishedAt = null;

  await post.save();
  return post;
}

export async function unpublishPost(postId) {
  const post = await BlogPost.findById(postId);
  if (!post) throw new ApiError(404, 'Yazı bulunamadı');

  post.publishedAt = null;
  await post.save();
  return post;
}
