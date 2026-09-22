import Link from 'next/link';
import { AuthShell as SharedAuthShell } from '@repo/ui';

export function AuthShell(props) {
  return (
    <SharedAuthShell
      {...props}
      logo={
        <Link href="/login" className="auth-card__logo">
          Merasim<span>360</span> <span style={{ fontSize: 'var(--font-size-sm)' }}>Admin</span>
        </Link>
      }
    />
  );
}
