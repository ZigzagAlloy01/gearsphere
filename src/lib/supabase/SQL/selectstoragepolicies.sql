SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname IN (
      'Public can view listing images',
      'Users can upload own listing images',
      'Users can update own listing images',
      'Users can delete own listing images'
  )
ORDER BY policyname;