'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { Spinner, Phone, MessageCircle } from '@repo/ui';
import { apiClient } from '../../../../lib/apiClient.js';
import { LeadThread } from '../../../components/LeadThread.jsx';
import { LEAD_STATUS_LABEL, SETTABLE_STATUSES } from '../../../components/leadStatus.js';

const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
const POLL_MS = 15000;

export default function VendorLeadPage({ params }) {
  const [lead, setLead] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const load = useCallback(() => {
    apiClient
      .get(ENDPOINTS.lead(params.id))
      .then((data) => setLead(data.lead))
      .catch((err) => setLoadError(err.message));
  }, [params.id]);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function handleSend(body) {
    try {
      const data = await apiClient.post(ENDPOINTS.leadMessages(params.id), { body });
      setLead(data.lead);
      return true;
    } catch {
      return false;
    }
  }

  async function changeStatus(status) {
    setStatusSaving(true);
    setStatusError(null);
    try {
      const data = await apiClient.patch(ENDPOINTS.leadStatus(params.id), { status });
      setLead(data.lead);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusSaving(false);
    }
  }

  if (loadError) {
    return (
      <main className="container panel-main panel-main--narrow">
        <p className="ui-error-text" role="alert">{loadError}</p>
        <Link href="/vendor" className="ui-button ui-button--secondary">Tekliflere dön</Link>
      </main>
    );
  }
  if (!lead) {
    return (
      <main className="container panel-main panel-main--narrow">
        <Spinner label="Yükleniyor..." />
      </main>
    );
  }

  const status = LEAD_STATUS_LABEL[lead.status] ?? LEAD_STATUS_LABEL.new;
  const digits = lead.customerPhone.replace(/\D/g, '');

  return (
    <main className="container panel-main panel-main--narrow">
      <Link href="/vendor" className="thread-back">← Teklifler</Link>

      <div className="thread-head">
        <div>
          <h1 className="thread-head__title">{lead.customerName}</h1>
          <p className="thread-head__meta">
            {dateFormatter.format(new Date(lead.createdAt))}
            {lead.eventDate && ` · Etkinlik: ${dateFormatter.format(new Date(lead.eventDate))}`}
          </p>
        </div>
        <span className={`panel-pill panel-pill--${status.tone}`}>{status.label}</span>
      </div>

      <div className="lead-detail">
        {lead.message && <p className="lead-card__message">{lead.message}</p>}
        <div className="lead-card__actions">
          <a href={`tel:${lead.customerPhone}`} className="ui-button ui-button--primary">
            <Phone size={16} strokeWidth={2} aria-hidden="true" />
            Ara
          </a>
          <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="ui-button ui-button--secondary">
            <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
            WhatsApp
          </a>
        </div>

        <div className="lead-status-picker" role="group" aria-label="Teklif durumu">
          <span className="lead-status-picker__label">Durum</span>
          <div className="lead-status-picker__options">
            {SETTABLE_STATUSES.map((value) => (
              <button
                key={value}
                type="button"
                className={`status-option${lead.status === value ? ' is-active' : ''}`}
                aria-pressed={lead.status === value}
                disabled={statusSaving}
                onClick={() => changeStatus(value)}
              >
                {LEAD_STATUS_LABEL[value].label}
              </button>
            ))}
          </div>
          {statusError && <p className="ui-error-text" role="alert">{statusError}</p>}
          <p className="lead-status-picker__hint">Durumu değiştirdiğinizde müşteriye e-posta ile bildirilir.</p>
        </div>
      </div>

      <LeadThread messages={lead.messages} otherName={lead.customerName} onSend={handleSend} />
    </main>
  );
}
