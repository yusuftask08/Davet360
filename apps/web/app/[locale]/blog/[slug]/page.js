import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { getCategoryBySlug } from '@repo/constants';
import { Link } from '../../../../i18n/navigation.js';
import { RichText } from '../../lib/richText.jsx';
import { Breadcrumb } from '../../components/Breadcrumb.jsx';
import { buildAlternates, buildOpenGraph, buildTwitter } from '../../lib/seo.js';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

async function fetchPost(slug) {
  try {
    const data = await apiClient.get(ENDPOINTS.blogBySlug(slug));
    return data.post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const post = await fetchPost(params.slug);
  if (!post) return {};

  const description = post.seoDescription || post.content.slice(0, 155);
  const images = post.coverImage ? [apiClient.assetUrl(post.coverImage)] : undefined;
  return {
    title: post.seoTitle || post.title,
    description,
    alternates: buildAlternates(params.locale, `/blog/${post.slug}`),
    openGraph: buildOpenGraph(params.locale, { title: post.title, description, images, type: 'article' }),
    twitter: buildTwitter({ title: post.title, description, images }),
  };
}

export default async function BlogPostPage({ params }) {
  setRequestLocale(params.locale);
  const post = await fetchPost(params.slug);
  if (!post) notFound();

  const t = await getTranslations();
  const category = post.relatedCategory ? getCategoryBySlug(post.relatedCategory) : null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.publishedAt,
    image: post.coverImage ? [apiClient.assetUrl(post.coverImage)] : undefined,
  };

  return (
    <main className="container page-main" style={{ maxWidth: 720 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <Breadcrumb
        locale={params.locale}
        items={[
          { name: 'Merasim360', href: '' },
          { name: t('blog.heading'), href: '/blog' },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      {post.coverImage && (
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            aspectRatio: '16 / 7',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <Image
            src={apiClient.assetUrl(post.coverImage)}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      <h1 className="page-header__title">{post.title}</h1>
      {post.publishedAt && (
        <p className="page-header__meta">
          {new Intl.DateTimeFormat(params.locale === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'long' }).format(
            new Date(post.publishedAt),
          )}
        </p>
      )}
      <RichText content={post.content} />

      {category && (
        <p style={{ marginTop: 'var(--space-xl)' }}>
          <Link href={`/${category.slug}`} className="ui-button ui-button--secondary">
            {t(`categories.${category.slug}`)}
          </Link>
        </p>
      )}
    </main>
  );
}
