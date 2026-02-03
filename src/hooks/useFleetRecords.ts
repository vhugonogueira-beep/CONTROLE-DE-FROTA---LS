import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FleetRecord } from '@/types/fleet';

export function useFleetRecords() {
  const [records, setRecords] = useState<FleetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fleet_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRecords: FleetRecord[] = (data || []).map((record) => ({
        id: record.id,
        veiculo: record.veiculo,
        dataInicial: record.data_inicial,
        horarioInicial: record.horario_inicial,
        dataFinal: record.data_final,
        horarioFinal: record.horario_final,
        destino: record.destino,
        kmInicial: Number(record.km_inicial),
        kmFinal: Number(record.km_final),
        responsavel: record.responsavel,
        atividade: record.atividade,
        lavagem: record.lavagem as 'realizada' | 'pendente',
        tanque: record.tanque as 'cheio' | 'necessario_abastecer' | 'meio_tanque',
        andarEstacionado: record.andar_estacionado,
        status: record.status as FleetRecord['status'],
        createdAt: record.created_at,
      }));

      setRecords(formattedRecords);
    } catch (err) {
      console.error('Error fetching fleet records:', err);
      setError(err instanceof Error ? err.message : 'Error fetching records');
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (newRecord: Omit<FleetRecord, 'id' | 'createdAt'>) => {
    try {
      // 1. Validation: KM Final cannot be less than KM Inicial
      if (newRecord.kmFinal < newRecord.kmInicial && newRecord.kmFinal !== 0) {
        throw new Error('O KM final não pode ser menor que o KM inicial.');
      }

      // 2. Validation: Check if vehicle is available
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('status')
        .eq('plate', newRecord.veiculo)
        .single();

      if (vehicleError || !vehicle) {
        throw new Error('Veículo não encontrado ou erro ao verificar status.');
      }

      if (vehicle.status === 'em_uso' && newRecord.status !== 'agendado') {
        throw new Error('Este veículo já está em uso.');
      }

      if (vehicle.status === 'bloqueado') {
        throw new Error('Este veículo está bloqueado para manutenção.');
      }

      // 3. Start Transaction-like flow
      // A. Create Trip
      const { data: trip, error: tripError } = await supabase
        .from('fleet_records')
        .insert([{
          veiculo: newRecord.veiculo,
          data_inicial: newRecord.dataInicial,
          horario_inicial: newRecord.horarioInicial,
          data_final: newRecord.dataFinal,
          horario_final: newRecord.horarioFinal,
          destino: newRecord.destino,
          km_inicial: newRecord.kmInicial,
          km_final: newRecord.kmFinal,
          responsavel: newRecord.responsavel,
          atividade: newRecord.atividade,
          lavagem: newRecord.lavagem,
          tanque: newRecord.tanque,
          andar_estacionado: newRecord.andarEstacionado,
          status: newRecord.status,
          source: 'manual',
        }])
        .select()
        .single();

      if (tripError) throw tripError;

      // B. Update Vehicle Status
      const nextVehicleStatus = newRecord.status === 'agendado' ? 'agendado' : 'em_uso';
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ status: nextVehicleStatus })
        .eq('plate', newRecord.veiculo);

      if (updateError) throw updateError;

      return trip;
    } catch (err) {
      console.error('Error adding fleet record:', err);
      throw err;
    }
  };

  const finishRecord = async (id: string, veiculoPlate: string, finalKm?: number) => {
    try {
      // 1. Fetch the trip details to check for pendencies
      const { data: trip, error: fetchError } = await supabase
        .from('fleet_records')
        .select('tanque, lavagem')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Update the trip status
      const { error: tripError } = await supabase
        .from('fleet_records')
        .update({
          status: 'finalizado',
          ...(finalKm !== undefined ? { km_final: finalKm } : {})
        })
        .eq('id', id);

      if (tripError) throw tripError;

      // 3. Determine if vehicle should be blocked
      // Critical pendencies: Fuel needs refilling OR Wash is still pending
      const needsMaintenance =
        trip.tanque === 'necessario_abastecer' ||
        trip.lavagem === 'pendente';

      const nextStatus = needsMaintenance ? 'bloqueado' : 'disponivel';

      // 4. Update vehicle status
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: nextStatus })
        .eq('plate', veiculoPlate);

      if (vehicleError) throw vehicleError;
    } catch (err) {
      console.error('Error finishing trip:', err);
      throw err;
    }
  };

  const cancelRecord = async (id: string, veiculoPlate: string) => {
    try {
      const { error: tripError } = await supabase
        .from('fleet_records')
        .update({ status: 'cancelado' })
        .eq('id', id);

      if (tripError) throw tripError;

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'disponivel' })
        .eq('plate', veiculoPlate);

      if (vehicleError) throw vehicleError;
    } catch (err) {
      console.error('Error cancelling trip:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRecords();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('fleet_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fleet_records',
        },
        () => {
          fetchRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    records,
    loading,
    error,
    addRecord,
    finishRecord,
    cancelRecord,
    refetch: fetchRecords,
  };
}
