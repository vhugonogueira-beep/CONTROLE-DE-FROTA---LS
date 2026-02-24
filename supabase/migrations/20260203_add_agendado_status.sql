-- Add 'agendado' to trip_status enum
ALTER TYPE trip_status ADD VALUE IF NOT EXISTS 'agendado';

-- Add 'agendado' to vehicle_state enum  
ALTER TYPE vehicle_state ADD VALUE IF NOT EXISTS 'agendado';
