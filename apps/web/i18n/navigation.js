import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing.js';

// Locale-aware Link/router — apps/web'in tüm iç linkleri bunu kullanır, next/link değil.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
