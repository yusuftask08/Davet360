import { Card } from './Card.jsx';

// Login/register/forgot-password/reset-password sayfalarının ortak iskeleti: ortalanmış
// kart, arkada marka gradyanından yumuşak bir glow, üstte logo+başlık+alt başlık. Form
// içeriği ve alt footer linkleri sayfadan children/footer olarak gelir. Web ve panel
// aynı bileşeni kullanır (logoHref ile hedefleri farklılaşır: web "/" panel "/login").
export function AuthShell({ title, subtitle, children, footer, logo, logoHref = '/' }) {
  return (
    <main className="auth-page">
      <div className="auth-page__decor" aria-hidden="true" />
      <Card className="auth-card">
        {logo ?? (
          <a href={logoHref} className="auth-card__logo">
            Merasim<span>360</span>
          </a>
        )}
        {title && <h1 className="auth-card__title">{title}</h1>}
        {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
        {children}
        {footer && <div className="auth-card__footer">{footer}</div>}
      </Card>
    </main>
  );
}
