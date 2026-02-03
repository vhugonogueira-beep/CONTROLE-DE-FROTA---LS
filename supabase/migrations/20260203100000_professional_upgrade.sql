-- 1. Create Enums for Statuses
DO $$ BEGIN
    CREATE TYPE public.trip_status AS ENUM ('em_andamento', 'finalizado', 'cancelado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.vehicle_state AS ENUM ('disponivel', 'em_uso', 'bloqueado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update fleet_records table
ALTER TABLE public.fleet_records 
    ADD COLUMN IF NOT EXISTS status trip_status NOT NULL DEFAULT 'em_andamento';

-- 3. Update vehicles table
-- Handle existing data for status and type conversion
DO $$ 
BEGIN
    -- Only proceed if the column is still text
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'status' AND data_type = 'text') THEN
        -- Drop the existing default first to avoid casting errors
        ALTER TABLE public.vehicles ALTER COLUMN status DROP DEFAULT;
        
        -- Convert the type
        ALTER TABLE public.vehicles ALTER COLUMN status TYPE vehicle_state USING 
            CASE 
                WHEN status = 'active' THEN 'disponivel'::vehicle_state
                WHEN status = 'inactive' THEN 'bloqueado'::vehicle_state
                ELSE 'disponivel'::vehicle_state
            END;
    END IF;
END $$;

-- 4. Set new default to disponivel for vehicles
ALTER TABLE public.vehicles ALTER COLUMN status SET DEFAULT 'disponivel';

-- 5. Enable realtime for fleet_records status (if needed, usually already enabled for table)

-- 6. Add updated_at trigger to fleet_records if not exists (already exists in original migration)
