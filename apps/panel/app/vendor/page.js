'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { CATEGORIES } from '@repo/constants';
import { Card, Button, Spinner, Phone, MessageCircle, Mail } from '@repo/ui';
import { apiClient } from '../../lib/apiClient.js';
import { PanelHeader } from '../components/PanelHeader.jsx';
import { LEAD_STATUS_LABEL } from '../components/leadStatus.js';

const WEB_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3600';

const STATUS_BANNER = {
  pending: { tone: 'warning', text: 'İlanınız admin onayı bekliyor. Onaylandığında yayına alınacak.' },
  rejected: { tone: 'error', text: 'İlanınız reddedildi. Bilgilerinizi düzenleyip tekrar onaya gönderebilirsiniz.' },
  suspended: { tone: 'error', text: 'İlanınız yayından kaldırıldı. Tekrar yayına alınması için bizimle iletişime geçin.' },
};

const VENDOR_STATUS_LABEL = {
  approved: { label: 'Yayında', tone: 'success' },
  pending: { label: 'Onay bekliyor', tone: 'warning' },
  rejected: { label: 'Reddedildi', tone: 'error' },
  suspended: { label: 'Yayından kaldırıldı', tone: 'error' },
};


const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

function formatDate(value) {
  return value ? dateFormatter.format(new Date(value)) : null;
}

// wa.me sadece rakam kabul eder — "+90 532 ..." gibi girilmiş numaralardan diğer karakterler atılır.
function whatsappLink(phone) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

export default function VendorDashboard() {
  const [leads, setLeads] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [hasVendor, setHasVendor] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (!user?.vendorId) {
      setHasVendor(false);
      return;
    }
    apiClient
      .get(ENDPOINTS.vendorOwn(user.vendorId))
      .then((data) => setVendor(data.vendor))
      .catch((err) => setError(err.message));
    apiClient
      .get(ENDPOINTS.vendorLeads(user.vendorId))
      .then((data) => setLeads(data.items))
      .catch((err) => setError(err.message));
  }, []);

  if (!hasVendor) {
    return (
      <main className="container panel-main">
        <PanelHeader title="Hoş geldiniz" />
        <Card className="panel-empty">
          <h2>Henüz bir ilanınız yok</h2>
          <p>Teklif talebi alabilmek için önce işletme bilgilerinizi girmeniz gerekiyor.</p>
          <Link href="/vendor/new" className="ui-button ui-button--primary">
            İlan Oluştur
          </Link>
        </Card>
      </main>
    );
  }

  const banner = vendor?.status ? STATUS_BANNER[vendor.status] : null;
  const vendorStatus = vendor?.status ? VENDOR_STATUS_LABEL[vendor.status] : null;
  const category = vendor ? CATEGORIES.find((c) => c.slug === vendor.category) : null;
  const newCount = leads?.filter((lead) => lead.status === 'new').length ?? 0;
  const contactedCount = leads?.filter((lead) => lead.status === 'contacted').length ?? 0;
  const bookedCount = leads?.filter((lead) => lead.status === 'booked').length ?? 0;

  return (
    <main className="container panel-main">
      <PanelHeader title="Teklif Talepleri" subtitle="Çiftlerin size gönderdiği teklif talepleri burada listelenir." />

      {banner && (
        <div className={`panel-banner panel-banner--${banner.tone}`} role="status">
          <p className="panel-banner__text">{banner.text}</p>
          {vendor.statusReason && <p className="panel-banner__reason">{vendor.statusReason}</p>}
        </div>
      )}

      {vendor && (
        <Card className="panel-listing">
          <div className="panel-listing__media">
            {vendor.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={apiClient.assetUrl(vendor.images[0])} alt="" />
            ) : (
              <span>{vendor.businessName.charAt(0)}</span>
            )}
          </div>
          <div className="panel-listing__body">
            <div className="panel-listing__row">
              <h2 className="panel-listing__name">{vendor.businessName}</h2>
              {vendorStatus && (
                <span className={`panel-pill panel-pill--${vendorStatus.tone}`}>{vendorStatus.label}</span>
              )}
            </div>
            <p className="panel-listing__meta">
              {vendor.city}
              {category ? ` · ${category.label}` : ''}
            </p>
            <div className="panel-listing__actions">
              <Link href="/vendor/edit" className="ui-button ui-button--secondary">
                İlanımı Düzenle
              </Link>
              {vendor.status === 'approved' && (
                <a
                  href={`${WEB_URL}/tr/${vendor.category}/${vendor.citySlug}/${vendor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui-button ui-button--ghost"
                >
                  Sitede Gör
                </a>
              )}
            </div>
          </div>
        </Card>
      )}

      {leads && leads.length > 0 && (
        <div className="panel-stats">
          <div className="panel-stat">
            <span className="panel-stat__value">{leads.length}</span>
            <span className="panel-stat__label">Toplam talep</span>
          </div>
          <div className="panel-stat">
            <span className="panel-stat__value">{newCount}</span>
            <span className="panel-stat__label">Yeni</span>
          </div>
          <div className="panel-stat">
            <span className="panel-stat__value">{contactedCount}</span>
            <span className="panel-stat__label">Görüşülüyor</span>
          </div>
          <div className="panel-stat">
            <span className="panel-stat__value">{bookedCount}</span>
            <span className="panel-stat__label">Anlaşıldı</span>
          </div>
        </div>
      )}

      {error && <p className="ui-error-text" role="alert">{error}</p>}
      {!leads && !error ? (
        <Spinner label="Yükleniyor..." />
      ) : (
        <div className="lead-list">
          {(leads ?? []).map((lead) => {
            const status = LEAD_STATUS_LABEL[lead.status] ?? { label: lead.status, tone: 'neutral' };
            return (
              <Card key={lead._id} className="lead-card">
                <div className="lead-card__head">
                  <div>
                    <h3 className="lead-card__name">{lead.customerName}</h3>
                    <p className="lead-card__received">{formatDate(lead.createdAt)}</p>
                  </div>
                  <span className={`panel-pill panel-pill--${status.tone}`}>{status.label}</span>
                </div>
                {lead.eventDate && (
                  <p className="lead-card__event">
                    Etkinlik tarihi: <strong>{formatDate(lead.eventDate)}</strong>
                  </p>
                )}
                {(lead.lastMessagePreview ?? lead.message) && (
                  <p className="lead-card__message">{lead.lastMessagePreview ?? lead.message}</p>
                )}
                <div className="lead-card__actions">
                  <Link href={`/vendor/leads/${lead._id}`} className="ui-button ui-button--primary">
                    Mesajlar
                    {lead.vendorUnread > 0 && <span className="unread-count">{lead.vendorUnread}</span>}
                  </Link>
                  <a href={`tel:${lead.customerPhone}`} className="ui-button ui-button--secondary">
                    <Phone size={16} strokeWidth={2} aria-hidden="true" />
                    Ara
                  </a>
                  <a
                    href={whatsappLink(lead.customerPhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-button ui-button--secondary"
                  >
                    <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
                    WhatsApp
                  </a>
                  {lead.customerEmail && (
                    <a href={`mailto:${lead.customerEmail}`} className="ui-button ui-button--ghost">
                      <Mail size={16} strokeWidth={2} aria-hidden="true" />
                      E-posta
                    </a>
                  )}
                </div>
                <p className="lead-card__phone">{lead.customerPhone}</p>
              </Card>
            );
          })}
          {leads?.length === 0 && !error && (
            <Card className="panel-empty">
              <h2>Henüz teklif talebi yok</h2>
              <p>İlanınız yayındayken çiftlerin gönderdiği talepler burada görünecek.</p>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
