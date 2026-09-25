'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ENDPOINTS } from '@repo/api-client';
import { Spinner } from '@repo/ui';
import { Link } from '../../../../../i18n/navigation.js';
import { apiClient } from '../../../../../lib/apiClient.js';
import { LeadThread } from '../../../components/LeadThread.jsx';

const STATUS_KEY = {
  new: 'leadStatusNew',
  contacted: 'leadStatusContacted',
  booked: 'leadStatusBooked',
  declined: 'leadStatusDeclined',
  closed: 'leadStatusClosed',
};

// Yeni mesajlar için basit yoklama — sayfa açıkken ve sekme görünürken.
const POLL_MS = 15000;

export default function CustomerLeadPage({ params }) {
  const t = useTranslations('leadThread');
  const tAccount = useTranslations('account');
  const locale = useLocale();
  const [lead, setLead] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const dateFormatter = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'long' });

  const load = useCallback(() => {
    apiClient
      .get(ENDPOINTS.lead(params.id))
      .then((data) => setLead(data.lead))
      .catch(() => setLoadError(true));
  }, [params.id]);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const sendingRef = useRef(false);
  async function handleSend(body) {
    if (sendingRef.current) return false;
    sendingRef.current = true;
    try {
      const data = await apiClient.post(ENDPOINTS.leadMessages(params.id), { body });
      setLead(data.lead);
      return true;
    } catch {
      return false;
    } finally {
      sendingRef.current = false;
    }
  }

  if (loadError) {
    return (
      <main className="container page-main">
        <p className="empty-state">
          {t('loadError')}
          <Link href="/account" className="ui-button ui-button--primary">
            {t('back')}
          </Link>
        </p>
      </main>
    );
  }

  if (!lead) {
    return (
      <main className="container page-main">
        <Spinner />
      </main>
    );
  }

  const vendor = lead.vendor;

  return (
    <main className="container page-main thread-page">
      <Link href="/account" className="thread-page__back">
        ← {t('back')}
      </Link>
      <header className="thread-head">
        <div>
          <h1 className="thread-head__title">{vendor?.businessName ?? '—'}</h1>
          {vendor && (
            <Link href={`/${vendor.category}/${vendor.citySlug}/${vendor.slug}`} className="thread-head__link">
              {t('viewVendor')}
            </Link>
          )}
        </div>
        <span className={`thread-status thread-status--${lead.status}`}>{tAccount(STATUS_KEY[lead.status] ?? 'leadStatusNew')}</span>
      </header>

      <section className="thread-request">
        <h2 className="thread-request__title">{t('yourRequest')}</h2>
        <p className="thread-request__meta">
          {dateFormatter.format(new Date(lead.createdAt))}
          {lead.eventDate && ` · ${t('eventDate')}: ${dateFormatter.format(new Date(lead.eventDate))}`}
        </p>
        {lead.message && <p className="thread-request__text">{lead.message}</p>}
        <p className="thread-request__hint">{t('statusHint')}</p>
      </section>

      <LeadThread
        messages={lead.messages}
        mySide="customer"
        otherName={vendor?.businessName ?? ''}
        locale={locale}
        labels={{ you: t('you'), empty: t('empty'), placeholder: t('placeholder'), send: t('send'), sendError: t('sendError') }}
        onSend={handleSend}
      />
    </main>
  );
}
