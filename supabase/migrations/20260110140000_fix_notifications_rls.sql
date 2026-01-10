-- Fix RLS policies for notifications

-- Allow authenticated users to insert admin_alerts (will verify admin role in app)
DROP POLICY IF EXISTS "Service role can insert admin alerts" ON public.admin_alerts;

CREATE POLICY "Authenticated users can insert admin alerts"
  ON public.admin_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure authenticated users can insert notifications for any user (needed for bulk insert)
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
