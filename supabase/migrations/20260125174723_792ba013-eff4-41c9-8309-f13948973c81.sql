-- Allow authenticated users to insert organizations (for signup flow)
CREATE POLICY "Users can create organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to insert their own role during signup
-- This is needed because new users won't have a role yet
CREATE POLICY "Users can insert their own role"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());