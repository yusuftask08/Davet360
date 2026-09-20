import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createApiClient, ENDPOINTS } from '@repo/api-client';
import { Card } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';

const apiClient = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL });

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  return { title: t('heading') };
}

export default async function BlogListPage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const data = await apiClient.get(ENDPOINTS.blogList).catch(() => ({ items: [] }));

  return (
    <main className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      <h1 style={{ fontSize: 'var(--font-size-xl)' }}>{t('heading')}</h1>
      {data.items.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-500)' }}>{t('empty')}</p>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
          {data.items.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <Card>
                {post.coverImage && (
                  <div
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      aspectRatio: '16 / 7',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--space-md)',
                    }}
                  >
                    <Image
                      src={apiClient.assetUrl(post.coverImage)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 720px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h2 style={{ margin: '0 0 4px' }}>{post.title}</h2>
                <p style={{ color: 'var(--color-neutral-500)', margin: 0 }}>{t('readMore')}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
