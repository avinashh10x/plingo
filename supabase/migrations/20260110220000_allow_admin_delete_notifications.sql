-- Allow admins to delete any notification
-- This checks the 'user_roles' table to see if the current user has the 'admin' role
CREATE POLICY "Admins can delete any notification"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow admins to update any notification (e.g. edit title/message)
CREATE POLICY "Admins can update any notification"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
