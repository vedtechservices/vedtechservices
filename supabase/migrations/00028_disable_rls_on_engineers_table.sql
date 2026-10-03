-- Keep engineer records private. The old browser-side custom auth is not a
-- database authorization boundary; trusted server routes must perform CRUD.
ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.engineers FROM PUBLIC, anon, authenticated;
