# Supabase Email Authentication Setup Checklist

This guide covers all Supabase configuration needed for email authentication to work properly.

## 🔧 1. Authentication Settings (Supabase Dashboard)

### Location: Authentication → Settings

- [ ] **Enable Email Provider**
  - Go to: **Authentication** → **Providers** → **Email**
  - Ensure **"Enable Email provider"** is toggled ON

- [ ] **Site URL**
  - Location: **Authentication** → **URL Configuration** → **Site URL**
  - Value: `https://your-vercel-domain.vercel.app` (or your production URL)
  - Example: `https://goosetype.vercel.app`

- [ ] **Redirect URLs**
  - Location: **Authentication** → **URL Configuration** → **Redirect URLs**
  - Add these URLs (one per line):
    ```
    https://your-vercel-domain.vercel.app/
    https://your-vercel-domain.vercel.app/**
    http://localhost:5173/
    http://localhost:5173/**
    ```
  - **Note**: The app redirects to `/` (home page) after email verification, not `/auth/sign-in`

- [ ] **Email Auth Settings**
  - **Confirm email**: Toggle ON (users must verify email)
  - **Secure email change**: Toggle ON (recommended)
  - **Disable signup**: Toggle OFF (allow new signups)

### Email Templates Configuration

- [ ] **Confirm Signup Email Template**
  - Location: **Authentication** → **Email Templates** → **Confirm signup**
  - **Subject**: Verify your email address
  - **Redirect URL**: Should contain `{{ .ConfirmationURL }}` or use the default
  - **Template**: Ensure it includes the confirmation link

- [ ] **Magic Link Email Template** (if using)
  - Location: **Authentication** → **Email Templates** → **Magic Link**
  - Ensure template is configured

## 📧 2. Email Provider Configuration

### Option A: Using Supabase Default Email (Development)
- [ ] **Email Rate Limits**
  - Location: **Authentication** → **Settings**
  - Default: 4 emails/hour per user (can be adjusted)

### Option B: Custom SMTP (Production - Recommended)
- [ ] **SMTP Settings**
  - Location: **Authentication** → **Settings** → **SMTP Settings**
  - Configure your SMTP provider:
    - **SMTP Host**: `smtp.gmail.com` (or your provider)
    - **SMTP Port**: `587` (TLS) or `465` (SSL)
    - **SMTP User**: Your email address
    - **SMTP Password**: Your app password
    - **Sender email**: Your verified sender email
    - **Sender name**: Your app name (e.g., "GooseType")

**Popular SMTP Providers:**
- Gmail (requires App Password)
- SendGrid
- Mailgun
- AWS SES
- Resend

## 🗄️ 3. Database Tables

### Table: `profiles`
**Location**: SQL Editor or Table Editor

**Required Columns:**
- [ ] `id` (uuid, PRIMARY KEY, REFERENCES auth.users)
- [ ] `username` (text, UNIQUE, NOT NULL)
- [ ] `school_name` (text, nullable)
- [ ] `created_at` (timestamp with time zone)
- [ ] `updated_at` (timestamp with time zone)

**Optional Columns (if using):**
- [ ] `tier` (text, nullable)
- [ ] `program` (text, nullable)
- [ ] `best_wpm` (numeric, nullable)
- [ ] `best_accuracy` (numeric, nullable)
- [ ] `average_wpm` (numeric, nullable)
- [ ] `total_tests` (integer, nullable)
- [ ] `time_spent_seconds` (integer, nullable)

### Table: `typing_tests`
**Required Columns:**
- [ ] `id` (uuid, PRIMARY KEY)
- [ ] `user_id` (uuid, REFERENCES auth.users)
- [ ] `username` (text, nullable)
- [ ] `test_mode` (text, NOT NULL)
- [ ] `test_duration` (integer, nullable)
- [ ] `wpm` (numeric, NOT NULL)
- [ ] `raw_wpm` (numeric, NOT NULL)
- [ ] `accuracy` (numeric, NOT NULL)
- [ ] `word_count` (integer, nullable)
- [ ] `correct_chars` (integer, NOT NULL)
- [ ] `incorrect_chars` (integer, NOT NULL)
- [ ] `extra_chars` (integer, default 0)
- [ ] `missed_chars` (integer, default 0)
- [ ] `language` (text, default 'english')
- [ ] `created_at` (timestamp with time zone)

## 🔐 4. Row Level Security (RLS) Policies

### Table: `profiles`
**Enable RLS:**
- [ ] `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`

**Required Policies:**

1. **SELECT Policy** (Everyone can view profiles):
   ```sql
   CREATE POLICY "Profiles are viewable by everyone"
   ON public.profiles
   FOR SELECT
   USING (true);
   ```

2. **INSERT Policy** (Users can insert their own profile):
   ```sql
   CREATE POLICY "Users can insert their own profile"
   ON public.profiles
   FOR INSERT
   WITH CHECK (auth.uid() = id);
   ```

3. **UPDATE Policy** (Users can update their own profile):
   ```sql
   CREATE POLICY "Users can update their own profile"
   ON public.profiles
   FOR UPDATE
   USING (auth.uid() = id);
   ```

### Table: `typing_tests`
**Enable RLS:**
- [ ] `ALTER TABLE public.typing_tests ENABLE ROW LEVEL SECURITY;`

**Required Policies:**

1. **SELECT Policy** (Everyone can read typing tests):
   ```sql
   CREATE POLICY "Anyone can read typing tests"
   ON public.typing_tests
   FOR SELECT
   USING (true);
   ```

2. **INSERT Policy** (Authenticated users can insert):
   ```sql
   CREATE POLICY "Authenticated users can insert typing tests"
   ON public.typing_tests
   FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = user_id);
   ```

## 🔄 5. Database Triggers & Functions

### Trigger: Auto-create profile on signup
**Location**: SQL Editor

- [ ] **Create function**:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, username, school_name)
     VALUES (
       NEW.id,
       COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
       COALESCE(NEW.raw_user_meta_data->>'schoolName', NULL)
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

- [ ] **Create trigger**:
   ```sql
   CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW
   EXECUTE FUNCTION public.handle_new_user();
   ```

## 📦 6. Storage Buckets (Optional - for ID verification)

**Note**: ID verification has been removed from the app, but if you want to keep the bucket:

- [ ] **Bucket Name**: `id-verifications`
- [ ] **Public**: NO (Private bucket)
- [ ] **File size limit**: 5MB
- [ ] **Allowed MIME types**: image/*

## 🌐 7. Environment Variables

### Required in `.env.local` (Development)
```
VITE_SUPABASE_URL=https://gqxueudlbggzejhyrhjd.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Required in Vercel (Production)
Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

- [ ] `VITE_SUPABASE_URL` = `https://gqxueudlbggzejhyrhjd.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

**Find these values:**
- Location: **Supabase Dashboard** → **Settings** → **API**
- **Project URL**: Copy to `VITE_SUPABASE_URL`
- **anon/public key**: Copy to `VITE_SUPABASE_ANON_KEY`

## ✅ 8. Email Authentication Checklist

### Critical Settings:
- [ ] **Email provider is enabled** in Authentication → Providers
- [ ] **Site URL is set** correctly (your production domain)
- [ ] **Redirect URLs include** `/auth/sign-in` path
- [ ] **Confirm email is enabled** (requires email verification)
- [ ] **SMTP is configured** (if using custom SMTP)

### Email Templates:
- [ ] **Confirm signup template** is configured
- [ ] **Email confirmation link** uses `{{ .ConfirmationURL }}`
- [ ] **Redirect URL in template** matches your site URL

### Database:
- [ ] **`profiles` table exists** with all required columns
- [ ] **`typing_tests` table exists** with all required columns
- [ ] **RLS policies are set** for both tables
- [ ] **Trigger exists** to auto-create profile on signup

## 🔍 9. Troubleshooting Email Issues

### Emails not sending:
1. **Check Authentication → Providers → Email**
   - Ensure email provider is enabled
   - Check if there are any rate limits reached

2. **Check Site URL**
   - Must match your actual domain (no trailing slash)
   - Check for typos

3. **Check Redirect URLs**
   - Must include the exact path: `/auth/sign-in`
   - Include both `https://` and `http://localhost` versions

4. **Check Email Templates**
   - Verify the template contains the confirmation link
   - Check that `{{ .ConfirmationURL }}` is present

5. **Check SMTP Settings** (if using custom SMTP)
   - Verify SMTP credentials are correct
   - Test SMTP connection
   - Check sender email is verified

6. **Check Browser Console**
   - Look for errors when calling `signUp()`
   - Check Network tab for failed requests

### Common Issues:

**Issue**: "Email rate limit exceeded"
- **Solution**: Wait 1 hour or upgrade Supabase plan
- **Location**: Check in Authentication → Settings

**Issue**: "Invalid redirect URL"
- **Solution**: Add the exact URL to Redirect URLs list
- **Format**: `https://yourdomain.com/auth/sign-in`

**Issue**: "Email not received"
- **Solution**: Check spam folder
- **Solution**: Verify email address is correct
- **Solution**: Use `resendVerification()` function to resend

**Issue**: "User created but no profile"
- **Solution**: Verify the `handle_new_user()` trigger exists
- **Solution**: Check trigger is enabled and working

## 📝 10. Quick Verification SQL Queries

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check if profiles table exists and has correct columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public';

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check RLS policies on profiles
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Check recent signups (to verify emails are being sent)
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Check if profiles are being created
SELECT p.id, p.username, u.email, u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
```

## 🚨 Critical Checklist for Email Auth to Work

1. ✅ Email provider enabled in Supabase Dashboard
2. ✅ Site URL configured correctly
3. ✅ Redirect URLs include `/auth/sign-in`
4. ✅ Confirm email is enabled (Email Auth settings)
5. ✅ Email template includes confirmation link
6. ✅ SMTP configured (if using custom SMTP) OR using Supabase default
7. ✅ `profiles` table exists with required columns
8. ✅ `handle_new_user()` trigger exists and is enabled
9. ✅ RLS policies allow profile creation
10. ✅ Environment variables are set in Vercel

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)

