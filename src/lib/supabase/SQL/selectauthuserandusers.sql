SELECT
    au.id AS auth_user_id,
    au.email,
    u.id AS users_id
FROM auth.users AS au
LEFT JOIN public.users AS u
    ON u.id = au.id
ORDER BY au.created_at DESC;