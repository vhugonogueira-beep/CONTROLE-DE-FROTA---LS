-- Add delete policy for fleet_records
CREATE POLICY "Allow public delete access"
ON public.fleet_records
FOR DELETE
USING (true);

-- Add delete policy for vehicles
CREATE POLICY "Allow public delete access"
ON public.vehicles
FOR DELETE
USING (true);
