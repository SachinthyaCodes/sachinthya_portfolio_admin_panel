# Supabase Storage Setup

This project uses Supabase Storage for managing project images.

## Storage Bucket Configuration

### Bucket Name
`Portfolio Images`

### Setup Instructions

1. **Create the Bucket** (if not already created):
   - Go to your Supabase Dashboard
   - Navigate to Storage section
   - Create a new bucket named: `Portfolio Images`
   - Make it **Public** (so images can be accessed via URL)

2. **Configure Bucket Policies**:
   - Go to Policies tab for the bucket
   - Add policy for public read access:
   ```sql
   CREATE POLICY "Public read access" ON storage.objects
   FOR SELECT USING (bucket_id = 'Portfolio Images');
   ```

   - Add policy for authenticated uploads:
   ```sql
   CREATE POLICY "Authenticated users can upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'Portfolio Images' AND
     auth.role() = 'authenticated'
   );
   ```

   - Add policy for authenticated deletes:
   ```sql
   CREATE POLICY "Authenticated users can delete" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'Portfolio Images' AND
     auth.role() = 'authenticated'
   );
   ```

## Image Upload Flow

### Creating a Project with Image
1. User uploads image via ProjectForm
2. Image is sent as FormData to `/api/projects` (POST)
3. Server uploads image to Supabase Storage bucket
4. Public URL is saved in `projects.image_url` field

### Updating a Project with New Image
1. User uploads new image via ProjectForm
2. Image is sent as FormData to `/api/projects/[id]` (PATCH/PUT)
3. Server uploads new image and deletes old one
4. New public URL replaces old one in database

### Deleting a Project
1. Server retrieves project's `image_url`
2. Deletes project from database
3. Deletes associated image from storage bucket

## Storage Utility Functions

Located in `src/lib/storage.ts`:

- `uploadImage(file, folder)` - Upload a new image
- `deleteImage(imageUrl)` - Delete an image by URL
- `replaceImage(oldUrl, newFile, folder)` - Replace existing image

## File Organization

Images are stored with the following structure:
```
Portfolio Images/
  └── projects/
      ├── 1702896543210-a1b2c3d.jpg
      ├── 1702896789456-x7y8z9w.png
      └── ...
```

Filename format: `{folder}/{timestamp}-{random}.{ext}`

## Image Size Limits

- Maximum file size: **5MB**
- Supported formats: jpg, jpeg, png, gif, webp
- Validation happens in the frontend (ProjectForm)

## Troubleshooting

### Images not uploading
1. Check bucket exists and is named exactly `Portfolio Images`
2. Verify bucket is set to **Public**
3. Check bucket policies are configured correctly
4. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables

### Images not displaying
1. Verify image URL in database starts with your Supabase project URL
2. Check bucket is public
3. Verify storage policies allow SELECT operations

### Old images not being deleted
1. Check the `deleteImage` function has correct URL parsing
2. Verify authenticated delete policy exists
3. Check logs for deletion errors
