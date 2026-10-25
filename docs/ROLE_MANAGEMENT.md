# Role Management

UI path: `/admin/dashboard` → **Role Management** → `/admin/manage` → edit another administrator → **CRM Admin** (`full_access_admin`) → save. Only a signed-in, active `super_admin` can assign roles. Own-role changes are disabled and rejected by the API and database function. CRM access does not confer billing or support administration permissions.

The page and selectors already existed; the old navigation label was “Admins”. Generic admins intentionally cannot see this link. Page access now checks `/api/admin/session`, rather than trusting localStorage. Role-bearing updates reuse `/api/private-data` and execute `assign_admin_role`, which atomically updates and audits the assignment. Apply migration `00043_audited_admin_role_assignment.sql` through the approved database migration process before using this changed workflow. No migration or role change was executed during this fix.

Account availability is unverified: no database credentials or account data were inspected. Migration 00004 deliberately seeds no administrator. An account cannot be established as legitimate merely from a role string: an authorized operator must verify its ownership and approval.

An authorized database operator can use a trusted SQL administration connection for this read-only inventory:

```sql
SELECT id, email, full_name, role, is_active
FROM public.admin_users
WHERE role = 'super_admin';
```

If an active, approved Super Admin exists, its owner should sign in and use the UI above. Do not promote the current generic admin through browser storage, JWT claims, RLS changes, or a client-side SQL/RPC call.

If none is available, use a separately approved bootstrap/recovery procedure under database-owner control. Verify the environment, operator approval, intended owner and exact account UUID first. Prefer a separate named Super Admin account with a new secret. Follow `FRESH_SUPABASE_SECURITY.md` for the server-compatible `scrypt$<salt>$<64-byte hex digest>` password format; never commit credentials. Inspect deployed migrations and audit requirements before execution.

In one explicit transaction, lock the intended `admin_users` row, verify its email/UUID and previous role/status against the approval, create or restore only that approved Super Admin, and insert an `activity_logs` entry using the approved operator/account UUID (`user_id` is UUID NOT NULL), action `BOOTSTRAP_SUPER_ADMIN`, target UUID, old/new roles and the approval reference in `details`. Verify affected row counts and the audit insert before COMMIT; ROLLBACK on any mismatch. Keep an independent operator audit trail and use dual review where required. Keep RLS and existing grants enabled. No executable bootstrap mutation is included here to prevent accidental account promotion.

After recovery, the Super Admin should assign CRM Admin to the intended separate account through Role Management. The server re-reads stored roles on each request; refresh the affected browser to update navigation. Test on a local database first. The new database function has source checks and mocked API tests; it still needs a migration/integration check against PostgreSQL before release.
