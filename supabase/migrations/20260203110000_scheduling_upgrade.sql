-- 1. Add 'agendado' to trip_status enum
ALTER TYPE public.trip_status ADD VALUE IF NOT EXISTS 'agendado';

-- 2. Add 'agendado' to vehicle_state enum
ALTER TYPE public.vehicle_state ADD VALUE IF NOT EXISTS 'agendado';

-- 3. Update vehicles table to support 'agendado' state (optional, used when a vehicle is reserved)
-- No changes needed to columns, just data update possibilities.
