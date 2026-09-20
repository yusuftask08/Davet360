import { getTranslations } from 'next-intl/server';
import { Link } from '../../../i18n/navigation.js';

export async function Footer() {
  const t = await getTranslations();
  const panelUrl = process.env.NEXT_PUBLIC_PANEL_URL ?? 'http://localhost:3001';

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <div className="site-navbar__logo" style={{ marginBottom: 'var(--space-sm)' }}>
            Davet<span>360</span>
          </div>
          <p className="site-footer__muted">{t('footer.tagline')}</p>
        </div>

        <div>
          <h3 className="site-footer__heading">{t('footer.companyHeading')}</h3>
          <ul className="site-footer__list">
            <li><Link href="/about">{t('footer.about')}</Link></li>
            <li><Link href="/contact">{t('footer.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="site-footer__heading">{t('footer.legalHeading')}</h3>
          <ul className="site-footer__list">
            <li><Link href="/privacy">{t('footer.privacy')}</Link></li>
            <li><Link href="/terms">{t('footer.terms')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="site-footer__heading">{t('footer.vendorsHeading')}</h3>
          <ul className="site-footer__list">
            <li>
              <a href={`${panelUrl}/register`}>{t('footer.addBusiness')}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container site-footer__bottom">
        © {new Date().getFullYear()} Davet360 — {t('footer.rights')}
      </div>
    </footer>
  );
}
