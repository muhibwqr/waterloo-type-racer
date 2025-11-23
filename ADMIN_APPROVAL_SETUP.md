# Admin Approval System Setup Guide

## Overview
The admin approval system flags suspicious typing test submissions and requires admin approval before they appear on the leaderboard.

## Flagging Criteria
Tests are automatically flagged if:
- WPM > 130, OR
- Accuracy > 98% AND WPM > 110

## Database Setup

### 1. Run Migration
Execute the migration file in Supabase:
```
supabase/migrations/20251115000000_add_approval_system.sql
```

This adds:
- `flagged` column (boolean)
- `approved` column (boolean, nullable)
- `approved_at` timestamp
- `approved_by` UUID reference
- Indexes for performance
- RLS policies for admin access

### 2. Set Admin Role
To grant admin access to a user:

1. Go to Supabase Dashboard → Authentication → Users
2. Find the user you want to make admin
3. Click "Edit" → "Raw App Meta Data"
4. Add:
```json
{
  "role": "admin"
}
```

Or use SQL:
```sql
UPDATE auth.users 
SET app_metadata = jsonb_set(
  COALESCE(app_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@example.com';
```

## Admin Portal Access

### Login Page
- URL: `/admin-approval-auth`
- Email/password authentication
- Checks for `app_metadata.role === 'admin'`

### Dashboard
- URL: `/admin-approval-auth/dashboard`
- Shows all flagged tests pending approval
- Real-time updates when new tests are flagged
- Actions:
  - **Approve**: Sets `approved = true`, records approver and timestamp
  - **Deny**: Deletes the test record

## Leaderboard Filtering

The leaderboard should only show:
- Tests where `approved = true` (flagged and approved), OR
- Tests where `flagged = false` (not flagged)

**Note**: If the `leaderboard` table is a separate table or view, you may need to update it to filter by approval status. Check if there's a trigger or process that populates the leaderboard table.

## Testing

1. Submit a test with WPM > 130 or high accuracy + high WPM
2. Verify it's flagged (check database or admin dashboard)
3. Login as admin at `/admin-approval-auth`
4. Approve or deny the flagged test
5. Verify approved tests appear on leaderboard

## Security Notes

- Admin role is checked via `app_metadata.role`
- RLS policies ensure only admins can approve/deny tests
- Admin authentication is separate from regular user auth
- All admin actions are logged (approved_by, approved_at)

