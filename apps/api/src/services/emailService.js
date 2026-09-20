import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Kullanıcıdan gelen metin HTML e-postaya gömülmeden önce kaçış karakterlerine çevrilir —
// e-posta istemcisinde HTML/script enjeksiyonu önlenir.
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// SMTP tanımlı değilse (local dev'de sık durum) gerçek mail atmaya çalışıp hata vermek yerine
// linki konsola basar — geliştirici akışı bozulmaz, prod'da SMTP_* set edilince otomatik gerçek
// mail atmaya geçer, kod değişmez.
const transporter = env.smtp.host
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : null;

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`[email] SMTP tanımlı değil — "${subject}" e-postası ${to} adresine gönderilmedi:\n${text}`);
    return;
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, html, text });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  await sendMail({
    to,
    subject: 'Davet360 — Şifre Sıfırlama',
    text: `Şifrenizi sıfırlamak için: ${resetUrl}\n\nBu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz. Link 1 saat içinde geçersiz olur.`,
    html: `
      <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz. Link 1 saat içinde geçersiz olur.</p>
    `,
  });
}

export async function sendContactMessage({ name, email, message }) {
  if (!env.contactEmail) {
    console.log(`[email] CONTACT_EMAIL tanımlı değil — iletişim mesajı loglandı:\n${name} <${email}>: ${message}`);
    return;
  }
  await sendMail({
    to: env.contactEmail,
    subject: `Davet360 İletişim Formu — ${name}`,
    text: `Gönderen: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>Gönderen:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
  });
}

// Vendor'a yeni bir teklif talebi geldiğinde — panelde arayıp bulmasını beklemek yerine
// anında haber verilir.
export async function sendNewLeadEmail(to, { businessName, customerName, customerPhone, message, panelUrl }) {
  const safeMessage = message ? escapeHtml(message) : '';
  await sendMail({
    to,
    subject: `Davet360 — "${businessName}" için yeni teklif talebi`,
    text: `${customerName} (${customerPhone}) size teklif talebi gönderdi.\n\n${message ?? ''}\n\nDetaylar için panele giriş yapın: ${panelUrl}/vendor`,
    html: `
      <p><strong>${escapeHtml(customerName)}</strong> (${escapeHtml(customerPhone)}) size teklif talebi gönderdi.</p>
      ${safeMessage ? `<p>${safeMessage}</p>` : ''}
      <p><a href="${panelUrl}/vendor">Panelden görüntüle</a></p>
    `,
  });
}

// Admin bir ilanı onayladığında vendor'a otomatik bildirim.
export async function sendVendorApprovedEmail(to, { businessName, webUrl: siteUrl }) {
  await sendMail({
    to,
    subject: `Davet360 — "${businessName}" onaylandı ve yayında!`,
    text: `Tebrikler! "${businessName}" ilanınız onaylandı ve artık Davet360'da yayında. ${siteUrl}`,
    html: `<p>Tebrikler! <strong>${escapeHtml(businessName)}</strong> ilanınız onaylandı ve artık Davet360'da yayında.</p>`,
  });
}

// Yeni bir vendor başvurusu geldiğinde tüm adminlere bildirim — kimse panele bakmayı unutup
// başvuruyu günlerce beklemede bırakmasın.
export async function sendNewVendorApplicationEmail(adminEmails, { businessName, city, category, panelUrl }) {
  if (adminEmails.length === 0) return;
  await sendMail({
    to: adminEmails.join(','),
    subject: `Davet360 — yeni vendor başvurusu: ${businessName}`,
    text: `${businessName} (${category}, ${city}) onay bekliyor. Panelden inceleyin: ${panelUrl}/admin/vendors?status=pending`,
    html: `
      <p><strong>${escapeHtml(businessName)}</strong> (${escapeHtml(category)}, ${escapeHtml(city)}) onay bekliyor.</p>
      <p><a href="${panelUrl}/admin/vendors?status=pending">Panelden incele</a></p>
    `,
  });
}
