import { AuthShell as SharedAuthShell } from '@repo/ui';
import { Link } from '../../../i18n/navigation.js';

// Paylaşılan @repo/ui AuthShell'i, web'e özgü locale-aware Link ile sarmalar — logo tıklaması
// aktif dili korumalı (plain <a> locale prefix'ini kaybeder).
export function AuthShell(props) {
  return (
    <SharedAuthShell
      {...props}
      logo={
        <Link href="/" className="auth-card__logo">
          Merasim<span>360</span>
        </Link>
      }
    />
  );
}
