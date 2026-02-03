-- Create vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_id TEXT,
    plate TEXT NOT NULL UNIQUE,
    renavam TEXT,
    chassis TEXT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    version TEXT,
    manufacturing_year INTEGER,
    model_year INTEGER,
    vehicle_type TEXT NOT NULL, -- utilitário, passeio, caminhão leve, moto
    color TEXT,
    category TEXT NOT NULL, -- Operacional / Administrativo / Terceirizado
    status TEXT NOT NULL DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
CREATE POLICY "Allow public read access"
ON public.vehicles
FOR SELECT
USING (true);

-- Create policy for public insert
CREATE POLICY "Allow public insert access"
ON public.vehicles
FOR INSERT
WITH CHECK (true);

-- Create policy for public update
CREATE POLICY "Allow public update access"
ON public.vehicles
FOR UPDATE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for vehicles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
