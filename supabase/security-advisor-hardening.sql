-- Apply once in Supabase SQL Editor for the existing CasaMia project.
-- The database owner retains access; exposed API roles must not invoke this
-- SECURITY DEFINER helper directly.

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
