'use client';

import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';

export const Link = NextLink;

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to === -1) window.history.back();
      return;
    }
    if (options?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  return { pathname, search, hash: '', state: null, key: 'default' };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);
  const result: Record<string, string> = {};
  // The legacy pages only use `:id` params. This keeps those URLs working during migration.
  const last = segments.at(-1);
  if (last) result.id = decodeURIComponent(last);
  return result as T;
}

export type LinkProps = ComponentProps<typeof NextLink>;
