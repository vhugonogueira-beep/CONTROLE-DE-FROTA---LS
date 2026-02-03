-- Create enum for lavagem status
CREATE TYPE public.lavagem_status AS ENUM ('realizada', 'pendente');

-- Create enum for tanque status
CREATE TYPE public.tanque_status AS ENUM ('cheio', 'necessario_abastecer', 'meio_tanque');

-- Create fleet_records table
CREATE TABLE public.fleet_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veiculo TEXT NOT NULL,
    data_inicial DATE NOT NULL,
    horario_inicial TEXT NOT NULL,
    data_final DATE NOT NULL,
    horario_final TEXT NOT NULL,
    destino TEXT NOT NULL,
    km_inicial NUMERIC(10, 1) NOT NULL,
    km_final NUMERIC(10, 1) NOT NULL,
    responsavel TEXT NOT NULL,
    atividade TEXT NOT NULL,
    lavagem lavagem_status NOT NULL DEFAULT 'pendente',
    tanque tanque_status NOT NULL DEFAULT 'cheio',
    andar_estacionado TEXT NOT NULL,
    raw_message TEXT,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fleet_records ENABLE ROW LEVEL SECURITY;

-- Create policy for public read (all fleet data is visible to anyone)
CREATE POLICY "Allow public read access"
ON public.fleet_records
FOR SELECT
USING (true);

-- Create policy for public insert (webhook can insert)
CREATE POLICY "Allow public insert access"
ON public.fleet_records
FOR INSERT
WITH CHECK (true);

-- Create policy for public update
CREATE POLICY "Allow public update access"
ON public.fleet_records
FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fleet_records_updated_at
BEFORE UPDATE ON public.fleet_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for fleet_records table
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet_records;