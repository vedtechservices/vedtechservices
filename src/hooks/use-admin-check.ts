import { useEffect, useState } from 'react';

export type AdminCheckState = 'loading' | 'valid' | 'invalid' | 'no-session';

export function useAdminCheck() {
  const [state, setState] = useState<AdminCheckState>('loading');
  const [adminName, setAdminName] = useState<string>('');

  useEffect(() => {
    const adminAuth = localStorage.getItem('vts_admin_auth');

    if (!adminAuth) {
      setState('no-session');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/admin/session', { cache: 'no-store' });
        const result = await response.json();

        if (cancelled) return;

        if (!response.ok || !result.authenticated || !result.admin) {
          setState('invalid');
        } else {
          setAdminName(result.admin.full_name || '');
          setState('valid');
        }
      } catch {
        if (!cancelled) setState('invalid');
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { state, adminName };
}
