BEGIN;

ALTER TABLE storage.objects DISABLE TRIGGER ALL;

DELETE FROM storage.objects
WHERE owner_id = '56dabbde-bd0a-4246-9fc3-9156320d9da4';

DELETE FROM public.users
WHERE id = '56dabbde-bd0a-4246-9fc3-9156320d9da4';

DELETE FROM auth.users
WHERE id = '56dabbde-bd0a-4246-9fc3-9156320d9da4';

ALTER TABLE storage.objects ENABLE TRIGGER ALL;

COMMIT;