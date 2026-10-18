'use client';

import React, { Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import IntersectObserver from '@/components/common/IntersectObserver';
import { PageLoader } from '@/components/common/Loader';
import MainLayout from '@/components/layouts/MainLayout';
import { Toaster } from '@/components/ui/toaster';
import routes from '@/routes';

function matchesRoute(pattern: string, pathname: string) {
  if (pattern === pathname) return true;
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
}

export default function RouterView() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [ready, setReady] = React.useState(true);

  useEffect(() => {
    setReady(true);
    const routeExists = routes.some((route) => matchesRoute(route.path, pathname));
    if (!routeExists) router.replace('/');
  }, [pathname, router]);

  if (!ready) return <PageLoader />;

  const route = routes.find((item) => matchesRoute(item.path, pathname));

  return (
    <>
      <IntersectObserver />
      <MainLayout>
        <Suspense fallback={<PageLoader />}>{route?.element ?? <PageLoader />}</Suspense>
      </MainLayout>
      <Toaster />
    </>
  );
}
