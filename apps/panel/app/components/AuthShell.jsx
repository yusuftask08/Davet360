import Link from 'next/link';
import { AuthShell as SharedAuthShell } from '@repo/ui';

// Paylaşılan @repo/ui AuthShell'i, panel'e özgü logo hedefiyle (girişe geri) sarmalar.
export function AuthShell(props) {
  return (
    <SharedAuthShell
      {...props}
      logo={
        <Link href="/login" className="auth-card__logo">
          Merasim<span>360</span>
        </Link>
      }
    />
  );
}
