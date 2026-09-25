'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ENDPOINTS } from '@repo/api-client';
import { Card, Badge, Spinner } from '@repo/ui';
import { apiClient } from '../../../../lib/apiClient.js';
import { AdminHeader } from '../../../components/AdminHeader.jsx';
import { statusLabel, leadStatusVariant } from '../../../../lib/labels.js';

const dateTime = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });

// Salt okunur — admin yazışmayı denetim (spam/şikayet) için görür, katılamaz ve açması
// tarafların okunmamış sayaçlarını değiştirmez (API tarafında garanti).
export default function AdminLeadDetailPage({ params }) {
  const [lead, setLead] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get(ENDPOINTS.lead(params.id))
      .then((data) => setLead(data.lead))
      .catch((err) => setError(err.message));
  }, [params.id]);

  return (
    <main className="container admin-main admin-main--narrow">
      <Link href="/leads" className="admin-back">← Teklif Talepleri</Link>
      {error && <p className="ui-error-text" role="alert">{error}</p>}
      {!lead && !error && <Spinner label="Yükleniyor..." />}
      {lead && (
        <>
          <AdminHeader
            title={lead.vendor?.businessName ?? 'Silinmiş işletme'}
            subtitle={`${lead.customerName} · ${lead.customerPhone}${lead.customerEmail ? ` · ${lead.customerEmail}` : ''}`}
            action={<Badge variant={leadStatusVariant(lead.status)}>{statusLabel(lead.status)}</Badge>}
          />
          <Card>
            <p className="admin-muted">
              {dateTime.format(new Date(lead.createdAt))}
              {lead.eventDate && ` · Etkinlik: ${new Date(lead.eventDate).toLocaleDateString('tr-TR')}`}
            </p>
            {lead.message && <p style={{ margin: 0 }}>{lead.message}</p>}
          </Card>

          <h2 className="admin-section-title">Yazışma ({lead.messages.length})</h2>
          {lead.messages.length === 0 ? (
            <p className="admin-muted">Henüz mesaj yok.</p>
          ) : (
            <ol className="admin-thread">
              {lead.messages.map((message) => (
                <li key={message._id} className={`admin-thread__item admin-thread__item--${message.senderRole}`}>
                  <span className="admin-thread__who">
                    {message.senderRole === 'vendor' ? lead.vendor?.businessName ?? 'İşletme' : lead.customerName} ·{' '}
                    {dateTime.format(new Date(message.createdAt))}
                  </span>
                  <p className="admin-thread__body">{message.body}</p>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </main>
  );
}
