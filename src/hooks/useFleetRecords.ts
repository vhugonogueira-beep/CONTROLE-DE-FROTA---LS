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
        area: record.source || 'Não Definido',
        rawMessage: record.raw_message,
        fotoPainelInicialUrl: record.foto_painel_inicial_url,
        fotoPainelFinalUrl: record.foto_painel_final_url,
        comprovanteAbastecimentoUrl: record.comprovante_abastecimento_url,
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


      // 3. Start Transaction-like flow
      // A. Create Trip
      const { data: trip, error: tripError } = await supabase
        .from('fleet_records')
        .insert([{
          veiculo: newRecord.veiculo,
          data_inicial: newRecord.dataInicial,
          horario_inicial: newRecord.horarioInicial,
          data_final: newRecord.dataFinal || null,
          horario_final: newRecord.horarioFinal || null,
          destino: newRecord.destino,
          km_inicial: newRecord.kmInicial,
          km_final: newRecord.kmFinal === 0 ? null : newRecord.kmFinal,
          responsavel: newRecord.responsavel,
          atividade: newRecord.atividade,
          lavagem: newRecord.lavagem,
          tanque: newRecord.tanque,
          andar_estacionado: newRecord.andarEstacionado,
          status: newRecord.status,
          source: newRecord.area || 'manual',
          foto_painel_inicial_url: newRecord.fotoPainelInicialUrl || null,
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

  const finishRecord = async (
    id: string,
    veiculoPlate: string,
    finalKm?: number,
    fotoPainelUrl?: string,
    comprovanteAbastecimentoUrl?: string
  ) => {
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
          ...(finalKm !== undefined ? { km_final: finalKm } : {}),
          ...(fotoPainelUrl !== undefined ? { foto_painel_final_url: fotoPainelUrl } : {}),
          ...(comprovanteAbastecimentoUrl !== undefined ? { comprovante_abastecimento_url: comprovanteAbastecimentoUrl } : {})
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

  const startRecord = async (id: string, veiculoPlate: string) => {
    try {
      const { error: tripError } = await supabase
        .from('fleet_records')
        .update({ status: 'em_andamento' })
        .eq('id', id);

      if (tripError) throw tripError;

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'em_uso' })
        .eq('plate', veiculoPlate);

      if (vehicleError) throw vehicleError;
    } catch (err) {
      console.error('Error starting trip:', err);
      throw err;
    }
  };

  const updateRecord = async (id: string, updates: Partial<FleetRecord>) => {
    try {
      // 1. Get the current record to check for vehicle changes
      const { data: currentRecord, error: fetchError } = await supabase
        .from('fleet_records')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Prepare the update data for Supabase
      const supabaseUpdates: any = {};
      if (updates.veiculo !== undefined) supabaseUpdates.veiculo = updates.veiculo;
      if (updates.dataInicial !== undefined) supabaseUpdates.data_inicial = updates.dataInicial;
      if (updates.horarioInicial !== undefined) supabaseUpdates.horario_inicial = updates.horarioInicial;
      if (updates.dataFinal !== undefined) supabaseUpdates.data_final = updates.dataFinal;
      if (updates.horarioFinal !== undefined) supabaseUpdates.horario_final = updates.horarioFinal;
      if (updates.destino !== undefined) supabaseUpdates.destino = updates.destino;
      if (updates.kmInicial !== undefined) supabaseUpdates.km_inicial = updates.kmInicial;
      if (updates.kmFinal !== undefined) supabaseUpdates.km_final = updates.kmFinal;
      if (updates.responsavel !== undefined) supabaseUpdates.responsavel = updates.responsavel;
      if (updates.atividade !== undefined) supabaseUpdates.atividade = updates.atividade;
      if (updates.lavagem !== undefined) supabaseUpdates.lavagem = updates.lavagem;
      if (updates.tanque !== undefined) supabaseUpdates.tanque = updates.tanque;
      if (updates.andarEstacionado !== undefined) supabaseUpdates.andar_estacionado = updates.andarEstacionado;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.area !== undefined) supabaseUpdates.source = updates.area;
      if (updates.fotoPainelInicialUrl !== undefined) supabaseUpdates.foto_painel_inicial_url = updates.fotoPainelInicialUrl;
      if (updates.fotoPainelFinalUrl !== undefined) supabaseUpdates.foto_painel_final_url = updates.fotoPainelFinalUrl;
      if (updates.comprovanteAbastecimentoUrl !== undefined) supabaseUpdates.comprovante_abastecimento_url = updates.comprovanteAbastecimentoUrl;

      // 3. Update the record
      const { error: updateError } = await supabase
        .from('fleet_records')
        .update(supabaseUpdates)
        .eq('id', id);

      if (updateError) throw updateError;

      // 4. Handle vehicle change logic
      if (updates.veiculo !== undefined && updates.veiculo !== currentRecord.veiculo) {
        const isCurrentActive = currentRecord.status === 'em_andamento' || currentRecord.status === 'agendado';

        if (isCurrentActive) {
          // Free old vehicle
          await supabase.from('vehicles').update({ status: 'disponivel' }).eq('plate', currentRecord.veiculo);

          // Occupation of new vehicle
          const nextStatus = currentRecord.status === 'agendado' ? 'agendado' : 'em_uso';
          await supabase.from('vehicles').update({ status: nextStatus }).eq('plate', updates.veiculo);
        }
      }
    } catch (err) {
      console.error('Error updating fleet record:', err);
      throw err;
    }
  };

  const deleteRecord = async (id: string, veiculoPlate: string) => {
    try {
      // 1. Get record status to know if we need to free the vehicle
      const { data: record, error: fetchError } = await supabase
        .from('fleet_records')
        .select('status')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete the record
      const { error: deleteError } = await supabase
        .from('fleet_records')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // 3. If record was active, free the vehicle
      if (record.status === 'agendado' || record.status === 'em_andamento') {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ status: 'disponivel' })
          .eq('plate', veiculoPlate);

        if (vehicleError) throw vehicleError;
      }

    } catch (err) {
      console.error('Error deleting record:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRecords();

    // Subscribe to realtime changes
    // Subscribe to realtime changes
    const channel = supabase
      .channel('fleet_updates_v3')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fleet_records',
        },
        (payload) => {
          console.log('🔄 Realtime update received:', payload);
          fetchRecords();
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    finishRecord,
    cancelRecord,
    startRecord,
    deleteRecord,
    refetch: fetchRecords,
  };
}
