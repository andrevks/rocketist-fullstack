-- Enable Realtime replication for tasks table
-- This allows Supabase Realtime to send updates to clients when tasks change

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

