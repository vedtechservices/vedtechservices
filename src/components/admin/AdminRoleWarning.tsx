import React from 'react';
import { AlertTriangle, ShieldAlert, LogIn, RefreshCw } from 'lucide-react';
import { useNavigate } from '@/lib/next-router';
import { Button } from '@/components/ui/button';
import { useAdminCheck } from '@/hooks/use-admin-check';

/**
 * Drop this component at the top of any admin page.
 * It silently passes when the session is valid; shows a prominent
 * warning banner when the logged-in user is not found (or inactive)
 * in the admin_users table.
 */
const AdminRoleWarning: React.FC = () => {
  const { state, adminName } = useAdminCheck();
  const navigate = useNavigate();

  // Nothing to show while loading or when everything is fine
  if (state === 'loading' || state === 'valid') return null;

  const handleRelogin = () => {
    void fetch('/api/admin/session', { method: 'DELETE' });
    localStorage.removeItem('vts_admin_auth');
    localStorage.removeItem('vts_admin_id');
    localStorage.removeItem('vts_admin_email');
    localStorage.removeItem('vts_admin_role');
    navigate('/admin/login');
  };

  if (state === 'no-session') {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 mb-4 shadow-sm">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-yellow-800">Session not found</p>
          <p className="text-xs text-yellow-700 mt-0.5">
            No admin session detected in this browser. Some actions may fail until you log in.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-yellow-400 text-yellow-800 hover:bg-yellow-100 h-8 text-xs gap-1"
          onClick={handleRelogin}
        >
          <LogIn className="h-3.5 w-3.5" />
          Log In
        </Button>
      </div>
    );
  }

  // state === 'invalid'
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 mb-4 shadow-sm">
      <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-800">Admin account not recognised</p>
        <p className="text-xs text-red-700 mt-0.5">
          The currently logged-in user was not found in the admin directory or has been deactivated.
          Actions requiring admin privileges will be blocked. Please log in with a valid admin account.
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100 h-8 text-xs gap-1"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs gap-1"
          onClick={handleRelogin}
        >
          <LogIn className="h-3.5 w-3.5" />
          Re-login
        </Button>
      </div>
    </div>
  );
};

export default AdminRoleWarning;
