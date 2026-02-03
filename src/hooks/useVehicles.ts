import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/types/vehicle';

export function useVehicles() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .order('model', { ascending: true });

            if (error) throw error;

            const formattedVehicles: Vehicle[] = (data || []).map((v) => ({
                id: v.id,
                internalId: v.internal_id,
                plate: v.plate,
                renavam: v.renavam,
                chassis: v.chassis,
                brand: v.brand,
                model: v.model,
                version: v.version,
                manufacturingYear: v.manufacturing_year,
                modelYear: v.model_year,
                vehicleType: v.vehicle_type,
                color: v.color,
                category: v.category,
                status: v.status as Vehicle['status'],
                createdAt: v.created_at,
                updatedAt: v.updated_at,
            }));

            setVehicles(formattedVehicles);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError(err instanceof Error ? err.message : 'Error fetching vehicles');
        } finally {
            setLoading(false);
        }
    };

    const addVehicle = async (newVehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .insert([{
                    internal_id: newVehicle.internalId,
                    plate: newVehicle.plate,
                    renavam: newVehicle.renavam,
                    chassis: newVehicle.chassis,
                    brand: newVehicle.brand,
                    model: newVehicle.model,
                    version: newVehicle.version,
                    manufacturing_year: newVehicle.manufacturingYear,
                    model_year: newVehicle.modelYear,
                    vehicle_type: newVehicle.vehicleType,
                    color: newVehicle.color,
                    category: newVehicle.category,
                    status: 'disponivel',
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error adding vehicle:', err);
            throw err;
        }
    };

    const updateVehicle = async (id: string, updates: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .update({
                    internal_id: updates.internalId,
                    plate: updates.plate,
                    renavam: updates.renavam,
                    chassis: updates.chassis,
                    brand: updates.brand,
                    model: updates.model,
                    version: updates.version,
                    manufacturing_year: updates.manufacturingYear,
                    model_year: updates.modelYear,
                    vehicle_type: updates.vehicleType,
                    color: updates.color,
                    category: updates.category,
                    status: updates.status,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('Error updating vehicle:', err);
            throw err;
        }
    };

    const deleteVehicle = async (id: string) => {
        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            console.error('Error deleting vehicle:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchVehicles();

        const channel = supabase
            .channel('vehicles_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'vehicles',
                },
                () => {
                    fetchVehicles();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        vehicles,
        loading,
        error,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        refetch: fetchVehicles,
    };
}
