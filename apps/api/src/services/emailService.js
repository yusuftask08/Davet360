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
    subject: 'Merasim360 — Şifre Sıfırlama',
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
    subject: `Merasim360 İletişim Formu — ${name}`,
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
    subject: `Merasim360 — "${businessName}" için yeni teklif talebi`,
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
    subject: `Merasim360 — "${businessName}" onaylandı ve yayında!`,
    text: `Tebrikler! "${businessName}" ilanınız onaylandı ve artık Merasim360'da yayında. ${siteUrl}`,
    html: `<p>Tebrikler! <strong>${escapeHtml(businessName)}</strong> ilanınız onaylandı ve artık Merasim360'da yayında.</p>`,
  });
}

// Admin bir ilanı reddettiğinde/askıya aldığında vendor'a otomatik bildirim — aksi halde
// panele bakmadıkça (ki çoğu vendor bakmaz) hiç haberi olmaz. reason boşsa genel bir metin kullanılır.
export async function sendVendorStatusChangeEmail(to, { businessName, status, reason, panelUrl }) {
  const isRejected = status === 'rejected';
  const subject = isRejected
    ? `Merasim360 — "${businessName}" başvurunuz hakkında`
    : `Merasim360 — "${businessName}" yayından kaldırıldı`;
  const intro = isRejected
    ? `"${businessName}" başvurunuz şu anda onaylanamadı.`
    : `"${businessName}" ilanınız yayından kaldırıldı.`;
  const reasonText = reason?.trim()
    ? `Belirtilen neden: ${reason.trim()}`
    : 'Bir neden belirtilmedi, detay için panelden bize ulaşabilirsiniz.';

  await sendMail({
    to,
    subject,
    text: `${intro}\n\n${reasonText}\n\nBilgilerinizi güncelleyip tekrar gönderebilirsiniz: ${panelUrl}/vendor/edit`,
    html: `
      <p>${escapeHtml(intro)}</p>
      <p>${escapeHtml(reasonText)}</p>
      <p><a href="${panelUrl}/vendor/edit">Panelden bilgilerinizi güncelleyin</a></p>
    `,
  });
}

// Yeni bir vendor başvurusu geldiğinde tüm adminlere bildirim — kimse panele bakmayı unutup
// başvuruyu günlerce beklemede bırakmasın.
export async function sendNewVendorApplicationEmail(adminEmails, { businessName, city, category, panelUrl }) {
  if (adminEmails.length === 0) return;
  await sendMail({
    to: adminEmails.join(','),
    subject: `Merasim360 — yeni vendor başvurusu: ${businessName}`,
    text: `${businessName} (${category}, ${city}) onay bekliyor. Panelden inceleyin: ${panelUrl}/admin/vendors?status=pending`,
    html: `
      <p><strong>${escapeHtml(businessName)}</strong> (${escapeHtml(category)}, ${escapeHtml(city)}) onay bekliyor.</p>
      <p><a href="${panelUrl}/admin/vendors?status=pending">Panelden incele</a></p>
    `,
  });
}
