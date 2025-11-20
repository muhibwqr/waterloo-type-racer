# UniversityType

Competitive typing platform open to students from all universities worldwide. Race through university-themed prompts, track your stats, and climb the leaderboard. ID verification required for leaderboard participation.

## Getting Started

```bash
git clone https://github.com/muhibwqr/waterloo-type-racer.git
cd waterloo-type-racer
npm install
npm run dev
```

The development server runs on port `8080` by default. Update the Supabase environment variables if you need to point to a different backend.

## Tech Stack

- Vite + React (TypeScript)
- Tailwind CSS + shadcn/ui
- Supabase (auth + database)
- React Router

## ID Verification Setup

This app requires ID verification for users to appear on the leaderboard. To set this up:

1. **Create Storage Bucket in Supabase:**
   - Go to your Supabase dashboard → Storage
   - Create a new bucket named `id-verifications`
   - Set it to **Private** (not public)
   - Add a policy to allow authenticated users to upload:
     ```sql
     -- Allow users to upload their own ID images
     CREATE POLICY "Users can upload their own ID"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (
       bucket_id = 'id-verifications' 
       AND (storage.foldername(name))[1] = auth.uid()::text
     );
     ```
   - Add a policy to allow admins to read all files (for review):
     ```sql
     -- Allow admins to read all ID images for review
     -- Note: Adjust this based on your admin role setup
     CREATE POLICY "Admins can read all IDs"
     ON storage.objects FOR SELECT
     TO authenticated
     USING (bucket_id = 'id-verifications');
     ```
   - Alternatively, use Supabase dashboard to set bucket policies via UI

2. **Run Database Migrations:**
   ```bash
   # Apply the ID verification migration
   # This adds verification status fields to the profiles table
   ```

3. **Admin Review Process:**
   - Admins can review pending verifications in the Supabase dashboard
   - Update `id_verification_status` to 'approved' or 'rejected' in the `profiles` table
   - Add review notes in `id_review_notes` if needed
   - Set `id_reviewed_at` timestamp when reviewing

## Deployment

Build the production bundle with:

```bash
npm run build
```

Serve the generated `dist/` directory using your preferred hosting platform (Netlify, Vercel, Cloudflare Pages, etc.).
