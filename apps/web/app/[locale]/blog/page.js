import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { Link } from '../../../i18n/navigation.js';
import { buildAlternates } from '../lib/seo.js';
import { excerpt } from '../lib/richText.jsx';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: t('heading'), alternates: buildAlternates(locale, '/blog') };
}

export default async function BlogListPage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const data = await apiClient.get(ENDPOINTS.blogList).catch(() => ({ items: [] }));
  const dateFormatter = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'long' });

  return (
    <main className="container page-main">
      <h1 className="page-header__title" style={{ marginBottom: 'var(--space-lg)' }}>{t('heading')}</h1>
      {data.items.length === 0 ? (
        <p className="empty-state">{t('empty')}</p>
      ) : (
        <div className="blog-grid">
          {data.items.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} className="blog-card">
              <div className="blog-card__media">
                {post.coverImage ? (
                  <Image
                    src={apiClient.assetUrl(post.coverImage)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <span aria-hidden="true">{post.title.charAt(0)}</span>
                )}
              </div>
              <div className="blog-card__body">
                {post.publishedAt && (
                  <time className="blog-card__date" dateTime={post.publishedAt}>
                    {dateFormatter.format(new Date(post.publishedAt))}
                  </time>
                )}
                <h2 className="blog-card__title">{post.title}</h2>
                <p className="blog-card__excerpt">{excerpt(post.content)}</p>
                <span className="blog-card__more">{t('readMore')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
