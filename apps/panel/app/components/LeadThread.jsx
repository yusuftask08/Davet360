'use client';

import { useEffect, useRef, useState } from 'react';

const timeFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Teklif yazışması (işletme tarafı) — web'deki müşteri görünümüyle aynı yapı, metinler Türkçe.
export function LeadThread({ messages, otherName, onSend }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const endRef = useRef(null);

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
        {messages.length === 0 && (
          <li className="thread__empty">Henüz mesaj yok. Müşteriye buradan yazabilirsiniz — cevabınız e-posta ile de bildirilir.</li>
        )}
        {messages.map((message) => {
          const mine = message.senderRole === 'vendor';
          return (
            <li key={message._id} className={`thread__item${mine ? ' thread__item--mine' : ''}`}>
              <div className="thread__bubble">{message.body}</div>
              <span className="thread__meta">
                {mine ? 'Siz' : otherName} · {timeFormatter.format(new Date(message.createdAt))}
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
          placeholder="Mesajınızı yazın..."
          aria-label="Mesajınız"
          rows={1}
          maxLength={2000}
        />
        <button type="submit" className="ui-button ui-button--primary" disabled={sending || !draft.trim()}>
          Gönder
        </button>
      </form>
      {error && (
        <p className="ui-error-text" role="alert">
          Mesaj gönderilemedi, lütfen tekrar deneyin.
        </p>
      )}
    </section>
  );
}
