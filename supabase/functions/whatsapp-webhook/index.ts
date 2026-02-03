import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface FleetData {
  veiculo: string;
  data_inicial: string;
  horario_inicial: string;
  data_final: string;
  horario_final: string;
  destino: string;
  km_inicial: number;
  km_final: number;
  responsavel: string;
  atividade: string;
  lavagem: 'realizada' | 'pendente';
  tanque: 'cheio' | 'necessario_abastecer' | 'meio_tanque';
  andar_estacionado: string;
  status?: 'agendado' | 'em_andamento' | 'finalizado' | 'cancelado';
  raw_message: string;
  source: string;
}

function parseWhatsAppMessage(message: string): FleetData | null {
  console.log("Parsing message:", message);

  try {
    const normalizedMessage = message.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    const veiculoMatch = normalizedMessage.match(/\*([^*]+)\*/);
    const veiculo = veiculoMatch ? veiculoMatch[1].trim() : '';

    // Extract Status
    const statusMatch = normalizedMessage.match(/Status:\s*([^\n]+)/i);
    let status: FleetData['status'] | undefined = undefined;
    if (statusMatch) {
      const stText = statusMatch[1].toLowerCase();
      if (stText.includes('agendamento') || stText.includes('agendado')) status = 'agendado';
      else if (stText.includes('em uso') || stText.includes('inicio') || stText.includes('início')) status = 'em_andamento';
      else if (stText.includes('cancelado')) status = 'cancelado';
      else if (stText.includes('finalizado')) status = 'finalizado';
    }

    const dataInicialMatch = normalizedMessage.match(/(?:Data|Data inicial|Data in[ií]cio):\s*(\d{2}\/\d{2}\/\d{4})/i);
    const horarioInicialMatch = normalizedMessage.match(/(?:Hor[aá]rio|Hor[aá]rio inicial|Hora inicial):\s*(\d{1,2}[:hH]?\d{0,2})/i);
    const dataFinalMatch = normalizedMessage.match(/(?:Data final|Data fim):\s*(\d{2}\/\d{2}\/\d{4})/i);
    const horarioFinalMatch = normalizedMessage.match(/(?:Hor[aá]rio final|Hora final):\s*(\d{1,2}[:hH]?\d{0,2})/i);

    const destinoMatch = normalizedMessage.match(/Destino:\s*([^\n]+)/i);
    const destino = destinoMatch ? destinoMatch[1].trim() : '';

    const kmInicialMatch = normalizedMessage.match(/Km inicial[:\s]*([0-9.,]+)/i);
    const kmFinalMatch = normalizedMessage.match(/Km final[:\s]*([0-9.,]+)/i);

    const responsavelMatch = normalizedMessage.match(/Respons[aá]vel:\s*([^\n]+)/i);
    const responsavel = responsavelMatch ? responsavelMatch[1].trim() : '';

    const atividadeMatch = normalizedMessage.match(/Atividade:\s*([^\n]+)/i);
    const atividade = atividadeMatch ? atividadeMatch[1].trim() : '';

    const lavagemMatch = normalizedMessage.match(/Lavagem:\s*([^\n]+)/i);
    let lavagem: 'realizada' | 'pendente' = 'pendente';
    if (lavagemMatch) {
      const lt = lavagemMatch[1].toLowerCase();
      if (lt.includes('realizada') || lt.includes('✅') || lt.includes('ok')) lavagem = 'realizada';
    }

    const tanqueMatch = normalizedMessage.match(/Tanque:\s*([^\n]+)/i);
    let tanque: 'cheio' | 'necessario_abastecer' | 'meio_tanque' = 'cheio';
    if (tanqueMatch) {
      const tt = tanqueMatch[1].toLowerCase();
      if (tt.includes('abastecer') || tt.includes('necessário') || tt.includes('vazio')) tanque = 'necessario_abastecer';
      else if (tt.includes('meio') || tt.includes('metade')) tanque = 'meio_tanque';
    }

    const andarMatch = normalizedMessage.match(/Andar estacionado:\s*([^\n]+)/i);
    const andar_estacionado = andarMatch ? andarMatch[1].trim() : '';

    const parseDate = (d: string) => d.split('/').reverse().join('-');
    const parseTime = (t: string) => {
      let ct = t.toLowerCase().replace(/[hH]/g, ':').replace(/[^\d:]/g, '');
      if (ct.includes(':')) {
        const p = ct.split(':');
        return `${(p[0] || '00').padStart(2, '0')}:${(p[1] || '00').padStart(2, '0')}`;
      }
      return `${ct.padStart(2, '0')}:00`;
    };
    const parseKm = (k: string) => parseFloat(k.replace(/\./g, '').replace(',', '.'));

    if (!veiculo) return null;

    const di = dataInicialMatch ? parseDate(dataInicialMatch[1]) : new Date().toISOString().split('T')[0];

    return {
      veiculo,
      data_inicial: di,
      horario_inicial: horarioInicialMatch ? parseTime(horarioInicialMatch[1]) : '00:00',
      data_final: dataFinalMatch ? parseDate(dataFinalMatch[1]) : di,
      horario_final: horarioFinalMatch ? parseTime(horarioFinalMatch[1]) : '00:00',
      destino,
      km_inicial: kmInicialMatch ? parseKm(kmInicialMatch[1]) : 0,
      km_final: kmFinalMatch ? parseKm(kmFinalMatch[1]) : 0,
      responsavel,
      atividade,
      lavagem,
      tanque,
      andar_estacionado,
      status,
      raw_message: message,
      source: 'whatsapp',
    };
  } catch (err) {
    console.error("Error parsing:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing Env');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    let message = body.message || body.text?.message || body.text || body.body || "";
    if (!message) return new Response('No message', { status: 400 });

    if (body.isGroup && body.chatName !== 'LS - Controle de Frota') {
      return new Response('Unauthorized group', { status: 200 });
    }

    const fleetData = parseWhatsAppMessage(message);
    if (!fleetData) return new Response('Parse error', { status: 400 });

    // --- LOGIC: FINISH TRIP ---
    const isFinishing = fleetData.status === 'finalizado' || (fleetData.km_final > 0 && fleetData.km_final > fleetData.km_inicial);

    if (isFinishing) {
      const { data: activeTrip } = await supabase
        .from('fleet_records')
        .select('id, km_inicial')
        .eq('veiculo', fleetData.veiculo)
        .in('status', ['em_andamento', 'agendado']) // Allow finishing even if it was just scheduled
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeTrip) {
        if (fleetData.km_final < activeTrip.km_inicial && fleetData.km_final !== 0) {
          return new Response('Invalid KM', { status: 400 });
        }
        await supabase.from('fleet_records').update({
          km_final: fleetData.km_final,
          data_final: fleetData.data_final,
          horario_final: fleetData.horario_final,
          status: 'finalizado',
          lavagem: fleetData.lavagem,
          tanque: fleetData.tanque
        }).eq('id', activeTrip.id);

        await supabase.from('vehicles').update({ status: 'disponivel' }).eq('plate', fleetData.veiculo);
        return new Response(JSON.stringify({ success: true, message: 'Finalizado' }), { headers: corsHeaders });
      }
    }

    // --- LOGIC: CANCEL TRIP ---
    if (fleetData.status === 'cancelado') {
      const { data: recentTrip } = await supabase
        .from('fleet_records')
        .select('id')
        .eq('veiculo', fleetData.veiculo)
        .in('status', ['em_andamento', 'agendado'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentTrip) {
        await supabase.from('fleet_records').update({ status: 'cancelado' }).eq('id', recentTrip.id);
        await supabase.from('vehicles').update({ status: 'disponivel' }).eq('plate', fleetData.veiculo);
        return new Response(JSON.stringify({ success: true, message: 'Cancelado' }), { headers: corsHeaders });
      }
    }

    // --- LOGIC: START OR SCHEDULE ---
    const targetStatus = fleetData.status || 'em_andamento';

    // Transition Logic: Schedule -> In Use
    if (targetStatus === 'em_andamento') {
      const { data: scheduledTrip } = await supabase
        .from('fleet_records')
        .select('id')
        .eq('veiculo', fleetData.veiculo)
        .eq('status', 'agendado')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (scheduledTrip) {
        // Promote scheduled to active
        const { data, error } = await supabase.from('fleet_records').update({
          status: 'em_andamento',
          data_inicial: fleetData.data_inicial,
          horario_inicial: fleetData.horario_inicial,
          responsavel: fleetData.responsavel,
          destino: fleetData.destino,
          km_inicial: fleetData.km_inicial,
          atividade: fleetData.atividade
        }).eq('id', scheduledTrip.id).select().single();

        await supabase.from('vehicles').update({ status: 'em_uso' }).eq('plate', fleetData.veiculo);
        return new Response(JSON.stringify({ success: true, message: 'Promovido para Em Uso', data }), { headers: corsHeaders });
      }
    }

    // Default: Check availability and insert
    const { data: vehicle } = await supabase.from('vehicles').select('status').eq('plate', fleetData.veiculo).maybeSingle();
    if (vehicle && (vehicle.status === 'em_uso' || vehicle.status === 'bloqueado')) {
      if (targetStatus !== 'agendado') return new Response('Vehicle not available', { status: 400 });
    }

    const { data, error } = await supabase.from('fleet_records').insert([{
      ...fleetData,
      status: targetStatus,
      km_final: 0
    }]).select().single();

    if (error) throw error;

    const vStatus = targetStatus === 'agendado' ? 'agendado' : 'em_uso';
    await supabase.from('vehicles').update({ status: vStatus }).eq('plate', fleetData.veiculo);

    return new Response(JSON.stringify({ success: true, data }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
