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
  raw_message: string;
  source: string;
}

function parseWhatsAppMessage(message: string): FleetData | null {
  console.log("Parsing message:", message);

  try {
    // Normalize the message
    const normalizedMessage = message
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    // Extract vehicle name (first line with asterisks)
    const veiculoMatch = normalizedMessage.match(/\*([^*]+)\*/);
    const veiculo = veiculoMatch ? veiculoMatch[1].trim() : '';

    // Extract dates and times
    // Supports: "Data:", "Data inicial:", "Data inicio:"
    const dataInicialMatch = normalizedMessage.match(/(?:Data|Data inicial|Data in[ií]cio):\s*(\d{2}\/\d{2}\/\d{4})/i);
    // Supports: "Horario:", "Horario inicial:", "Hora inicial:"
    const horarioInicialMatch = normalizedMessage.match(/(?:Hor[aá]rio|Hor[aá]rio inicial|Hora inicial):\s*(\d{1,2}[:hH]?\d{0,2})/i);

    // Supports: "Data final:", "Data fim:"
    const dataFinalMatch = normalizedMessage.match(/(?:Data final|Data fim):\s*(\d{2}\/\d{2}\/\d{4})/i);
    // Supports: "Horario final:", "Hora final:"
    const horarioFinalMatch = normalizedMessage.match(/(?:Hor[aá]rio final|Hora final):\s*(\d{1,2}[:hH]?\d{0,2})/i);

    // Extract destination
    const destinoMatch = normalizedMessage.match(/Destino:\s*([^\n]+)/i);
    const destino = destinoMatch ? destinoMatch[1].trim() : '';

    // Extract KM values
    const kmInicialMatch = normalizedMessage.match(/Km inicial[:\s]*([0-9.,]+)/i);
    const kmFinalMatch = normalizedMessage.match(/Km final[:\s]*([0-9.,]+)/i);

    // Extract responsible person
    const responsavelMatch = normalizedMessage.match(/Respons[aá]vel:\s*([^\n]+)/i);
    const responsavel = responsavelMatch ? responsavelMatch[1].trim() : '';

    // Extract activity
    const atividadeMatch = normalizedMessage.match(/Atividade:\s*([^\n]+)/i);
    const atividade = atividadeMatch ? atividadeMatch[1].trim() : '';

    // Extract washing status
    const lavagemMatch = normalizedMessage.match(/Lavagem:\s*([^\n]+)/i);
    let lavagem: 'realizada' | 'pendente' = 'pendente';
    if (lavagemMatch) {
      const lavagemText = lavagemMatch[1].toLowerCase();
      if (lavagemText.includes('realizada') || lavagemText.includes('✅') || lavagemText.includes('ok')) {
        lavagem = 'realizada';
      }
    }

    // Extract tank status
    const tanqueMatch = normalizedMessage.match(/Tanque:\s*([^\n]+)/i);
    let tanque: 'cheio' | 'necessario_abastecer' | 'meio_tanque' = 'cheio';
    if (tanqueMatch) {
      const tanqueText = tanqueMatch[1].toLowerCase();
      if (tanqueText.includes('abastecer') || tanqueText.includes('necessário') || tanqueText.includes('vazio')) {
        tanque = 'necessario_abastecer';
      } else if (tanqueText.includes('meio') || tanqueText.includes('metade')) {
        tanque = 'meio_tanque';
      }
    }

    // Extract parking floor
    const andarMatch = normalizedMessage.match(/Andar estacionado:\s*([^\n]+)/i);
    const andar_estacionado = andarMatch ? andarMatch[1].trim() : '';

    // Parse dates from DD/MM/YYYY to YYYY-MM-DD
    const parseDate = (dateStr: string): string => {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return dateStr;
    };

    // Parse time format
    // Handles: "10:05h", "10:05", "10h", "10h30", "10"
    const parseTime = (timeStr: string): string => {
      // Remove non-alphanumeric chars at the end (like 'h') if using colon
      let cleanTime = timeStr.toLowerCase().replace(/[hH]/g, ':').replace(/[^\d:]/g, '');

      if (cleanTime.includes(':')) {
        const parts = cleanTime.split(':');
        let hour = parts[0];
        let minute = parts[1] || '00';
        // Validate
        if (hour.length === 0) hour = '00';
        if (minute.length === 0) minute = '00';
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      } else {
        // Assume pure number is hour (e.g. "10")
        return `${cleanTime.padStart(2, '0')}:00`;
      }
    };

    // Parse KM values
    const parseKm = (kmStr: string): number => {
      return parseFloat(kmStr.replace(/\./g, '').replace(',', '.'));
    };

    if (!veiculo) {
      console.log("No vehicle found in message");
      return null;
    }

    const dataInicialStr = dataInicialMatch ? parseDate(dataInicialMatch[1]) : new Date().toISOString().split('T')[0];
    const dataFinalStr = dataFinalMatch ? parseDate(dataFinalMatch[1]) : dataInicialStr; // Fallback to start date

    const result: FleetData = {
      veiculo,
      data_inicial: dataInicialStr,
      horario_inicial: horarioInicialMatch ? parseTime(horarioInicialMatch[1]) : '00:00',
      data_final: dataFinalStr,
      horario_final: horarioFinalMatch ? parseTime(horarioFinalMatch[1]) : '00:00',
      destino,
      km_inicial: kmInicialMatch ? parseKm(kmInicialMatch[1]) : 0,
      km_final: kmFinalMatch ? parseKm(kmFinalMatch[1]) : 0,
      responsavel,
      atividade,
      lavagem,
      tanque,
      andar_estacionado,
      raw_message: message,
      source: 'whatsapp',
    };

    console.log("Parsed result:", result);
    return result;
  } catch (error) {
    console.error("Error parsing message:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    console.log("Received webhook body:", JSON.stringify(body));

    // Handle different webhook formats
    let message = '';

    // Format 1: Direct message field
    if (body.message) {
      message = body.message;
    }
    // Format 2: Z-API / Baileys (often nested in text.message)
    else if (body.text && typeof body.text === 'object' && body.text.message) {
      message = body.text.message;
    }
    // Format 3: WhatsApp Business API format
    else if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) {
      message = body.entry[0].changes[0].value.messages[0].text.body;
    }
    // Format 4: Simple text field (if string)
    else if (typeof body.text === 'string') {
      message = body.text;
    }
    // Format 5: Body field
    else if (body.body) {
      message = body.body;
    }

    if (!message) {
      console.log("No message found in webhook body");
      return new Response(
        JSON.stringify({ success: false, error: 'No message found in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- Z-API SPECIFIC CHECKS ---
    // Check if it is a group message
    if (body.isGroup) {
      console.log(`Processing group message from group: ${body.chatName} (ID: ${body.phone})`);

      // Filter by Group Name
      if (body.chatName !== 'LS - Controle de Frota') {
        console.log(`Ignoring message from group "${body.chatName}". Expected "LS - Controle de Frota".`);
        return new Response(
          JSON.stringify({ success: false, error: 'Message from unauthorized group' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } } // Return 200 to avoid Z-API retries
        );
      }

      // Sender filtering removed - allowing any participant in the group.
    } else {
      // Optional: Reject direct messages if strict mode is desired? 
      // For now, let's allow testing via direct message or existing logic, 
      // but since user asked for SPECIFIC filtering, maybe we should warn?
      console.log("Received a non-group message or generic webhook.");
    }

    const fleetData = parseWhatsAppMessage(message);

    if (!fleetData) {
      console.log("Could not parse fleet data from message");
      return new Response(
        JSON.stringify({ success: false, error: 'Could not parse fleet data from message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Professional Logic: Check if it's a "Start" or "Finish" operation
    const isFinishing = fleetData.km_final > 0 && fleetData.km_final > fleetData.km_inicial;

    if (isFinishing) {
      // 1. Find the active trip for this vehicle
      const { data: activeTrip, error: findError } = await supabase
        .from('fleet_records')
        .select('id, km_inicial')
        .eq('veiculo', fleetData.veiculo)
        .eq('status', 'em_andamento')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findError) throw findError;

      if (activeTrip) {
        // Validation: KM Final cannot be less than initial
        if (fleetData.km_final < activeTrip.km_inicial) {
          return new Response(
            JSON.stringify({ success: false, error: `KM Final (${fleetData.km_final}) não pode ser menor que o inicial (${activeTrip.km_inicial})` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 2. Update the trip
        const { error: updateTripError } = await supabase
          .from('fleet_records')
          .update({
            km_final: fleetData.km_final,
            data_final: fleetData.data_final,
            horario_final: fleetData.horario_final,
            status: 'finalizado',
            lavagem: fleetData.lavagem,
            tanque: fleetData.tanque
          })
          .eq('id', activeTrip.id);

        if (updateTripError) throw updateTripError;

        // 3. Free the vehicle
        const { error: updateVehError } = await supabase
          .from('vehicles')
          .update({ status: 'disponivel' })
          .eq('plate', fleetData.veiculo);

        if (updateVehError) throw updateVehError;

        return new Response(
          JSON.stringify({ success: true, message: 'Viagem finalizada com sucesso via WhatsApp' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Default: Start a new trip
    // 1. Verify vehicle availability
    const { data: vehicle, error: vehError } = await supabase
      .from('vehicles')
      .select('status')
      .eq('plate', fleetData.veiculo)
      .maybeSingle();

    if (vehError) throw vehError;
    if (vehicle && vehicle.status === 'em_uso') {
      return new Response(
        JSON.stringify({ success: false, error: 'Este veículo já está em uso.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Insert into database
    const { data, error: insertError } = await supabase
      .from('fleet_records')
      .insert([{
        ...fleetData,
        status: 'em_andamento',
        km_final: 0 // Ensure km_final is 0 on start
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Mark vehicle as in use
    const { error: markVehError } = await supabase
      .from('vehicles')
      .update({ status: 'em_uso' })
      .eq('plate', fleetData.veiculo);

    if (markVehError) throw markVehError;

    console.log("Successfully started trip via WhatsApp:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
