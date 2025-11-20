# Supabase Setup Guide for GooseType

This guide covers all the Supabase configuration needed to make GooseType work properly.

## 1. Database Migrations

Run these migrations in order in your Supabase SQL Editor:

### Migration 1: Add Faculty to Profiles
**File:** `supabase/migrations/20251112010100_add_faculty_to_profiles.sql`
```sql
ALTER TABLE public.profiles
ADD COLUMN faculty TEXT;
```

### Migration 2: Add Username and Faculty to Typing Tests
**File:** `supabase/migrations/20251112013500_add_username_and_faculty_to_typing_tests.sql`
```sql
ALTER TABLE public.typing_tests
ADD COLUMN username TEXT;

ALTER TABLE public.typing_tests
ADD COLUMN faculty TEXT;
```

### Migration 3: Get Email by Username Function
**File:** `supabase/migrations/20251112020000_get_email_by_username.sql`
```sql
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT auth.users.email
    INTO user_email
    FROM public.profiles
    JOIN auth.users ON public.profiles.id = auth.users.id
    WHERE public.profiles.username = p_username;

    RETURN user_email;
END;
$$;
```

### Migration 4: Add ID Verification Fields
**File:** `supabase/migrations/20251113000000_add_id_verification.sql`
```sql
-- Add ID verification fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN id_verification_status TEXT DEFAULT 'pending' CHECK (id_verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN id_image_url TEXT,
ADD COLUMN id_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN id_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN id_review_notes TEXT;

-- Create index for verification status queries
CREATE INDEX idx_profiles_verification_status ON public.profiles(id_verification_status);
```

### Migration 5: Add School Name
**File:** `supabase/migrations/20251113010000_add_school_name.sql`
```sql
-- Add school_name column to profiles table
ALTER TABLE public.profiles
ADD COLUMN school_name TEXT;
```

## 2. Storage Bucket Setup

### Create the Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Name: `id-verifications`
4. **Make it Private** (uncheck "Public bucket")
5. Click **"Create bucket"**

### Set Storage Policies

Go to **Storage** → **Policies** → **id-verifications** and add these policies:

#### Policy 1: Users can upload their own ID
```sql
CREATE POLICY "Users can upload their own ID"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-verifications' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Users can read their own ID
```sql
CREATE POLICY "Users can read their own ID"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-verifications' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Service role can read all IDs (for admin review)
```sql
CREATE POLICY "Service role can read all IDs"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'id-verifications');
```

**Note:** For admin review, you can also use the Supabase Dashboard to view files directly, or create a custom admin function.

## 3. Row Level Security (RLS) Verification

Ensure these RLS policies exist on the `profiles` table:

- ✅ Profiles are viewable by everyone (SELECT)
- ✅ Users can insert their own profile (INSERT)
- ✅ Users can update their own profile (UPDATE)

The existing policies should work, but verify they allow users to update:
- `id_image_url`
- `id_submitted_at`
- `school_name`
- `faculty`

## 4. Admin Review Process

To approve/reject user IDs:

1. Go to **Supabase Dashboard** → **Table Editor** → **profiles**
2. Filter by `id_verification_status = 'pending'`
3. Click on a user row
4. Update:
   - `id_verification_status`: Change to `'approved'` or `'rejected'`
   - `id_reviewed_at`: Set to current timestamp
   - `id_review_notes`: (Optional) Add any notes
5. Save changes

**Or use SQL:**
```sql
UPDATE public.profiles
SET 
  id_verification_status = 'approved',
  id_reviewed_at = now(),
  id_review_notes = 'Verified successfully'
WHERE id = 'user-uuid-here';
```

## 5. Verification Checklist

After setup, verify:

- [ ] All migrations have been run
- [ ] `id-verifications` storage bucket exists and is private
- [ ] Storage policies are set correctly
- [ ] Users can sign up with school name
- [ ] ID images upload successfully
- [ ] Leaderboard only shows approved users
- [ ] University leaderboard groups by `school_name` correctly

## Troubleshooting

### ID upload fails
- Check storage bucket exists and is named exactly `id-verifications`
- Verify storage policies allow INSERT for authenticated users
- Check file size is under 5MB

### Users can't upload scores
- Verify `id_verification_status` column exists
- Check that users have `id_verification_status = 'approved'` to appear on leaderboard

### University leaderboard empty
- Ensure `school_name` column exists in profiles table
- Verify users have `school_name` set during signup
- Check that users are approved (`id_verification_status = 'approved'`)

