'use client';

import { useEffect, useRef, useState } from 'react';

// Teklif yazışması: mesaj balonları + alttaki yazma alanı. Metinler çağıran sayfadan gelir
// (next-intl), mesaj gönderme de — bu bileşen sadece görünüm ve yazma alanı durumunu yönetir.
export function LeadThread({ messages, mySide, otherName, locale, labels, onSend }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const endRef = useRef(null);
  const timeFormatter = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Sadece sayfa açıkken yeni mesaj gelince (gönderim veya yoklama) en alta kaydır — ilk
  // açılışta kaydırılırsa teklif detayı ve durum seçimi ekranın dışında kalıyordu.
  const seenCountRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length > seenCountRef.current) {
      endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
    seenCountRef.current = messages.length;
  }, [messages.length]);

  async function handleSubmit(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(false);
    const ok = await onSend(body);
    setSending(false);
    if (ok) setDraft('');
    else setError(true);
  }

  function handleKeyDown(event) {
    // Masaüstünde Enter gönderir, Shift+Enter yeni satır. Mobil klavyede Enter yeni satırdır.
    if (event.key === 'Enter' && !event.shiftKey && window.matchMedia('(pointer: fine)').matches) {
      handleSubmit(event);
    }
  }

  return (
    <section className="thread">
      <ol className="thread__list">
        {messages.length === 0 && <li className="thread__empty">{labels.empty}</li>}
        {messages.map((message) => {
          const mine = message.senderRole === mySide;
          return (
            <li key={message._id} className={`thread__item${mine ? ' thread__item--mine' : ''}`}>
              <div className="thread__bubble">{message.body}</div>
              <span className="thread__meta">
                {mine ? labels.you : otherName} · {timeFormatter.format(new Date(message.createdAt))}
              </span>
            </li>
          );
        })}
        <li ref={endRef} aria-hidden="true" />
      </ol>

      <form className="thread__composer" onSubmit={handleSubmit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          rows={1}
          maxLength={2000}
        />
        <button type="submit" className="ui-button ui-button--primary" disabled={sending || !draft.trim()}>
          {labels.send}
        </button>
      </form>
      {error && (
        <p className="ui-error-text" role="alert">
          {labels.sendError}
        </p>
      )}
    </section>
  );
}
