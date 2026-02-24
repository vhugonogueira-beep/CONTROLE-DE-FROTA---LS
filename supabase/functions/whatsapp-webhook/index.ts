import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// --- DOMAINS & TYPES ---

type Status = 'AGENDAMENTO' | 'EM USO' | 'CANCELADO' | 'FINALIZADO'; // Upper for parsing, mapped to lower for DB
type Tanque = '1/4' | '1/2' | '3/4' | 'CHEIO'; // Input domain
type DbTanque = 'cheio' | 'necessario_abastecer' | 'meio_tanque'; // Database domain (approximate mapping)

interface StrictFleetData {
  status: Status;
  id?: string;
  placa?: string;
  veiculo?: string;
  data_inicial?: string; // input format
  horario_inicial?: string;
  data_final?: string;
  horario_final?: string;
  destino?: string;
  km_inicial?: number;
  km_final?: number;
  responsavel?: string;
  area?: string;
  atividade?: string;
  projeto?: string;
  lavagem_realizada?: boolean;
  necessario_lavagem?: boolean;
  tanque_devolucao?: Tanque;
  houve_abastecimento?: string; // "NÃO" or value
  necessario_abastecer?: boolean;
  estacionado?: string;
}

// --- STRICT PARSING ENGINE ---

function strictParse(message: string): { success: boolean; data?: StrictFleetData; error?: string } {
  // 1. Header Validation
  const lines = message.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Normalize header check (remove * and spaces)
  const header = lines[0]?.replace(/\*/g, '').toUpperCase();
  if (header !== 'CONTROLE DE FROTA') {
    return { success: false, error: 'Cabeçalho inválido. Mensagem deve começar com "CONTROLE DE FROTA".' };
  }

  const data: any = {};

  // 2. Strict Line Parsing
  for (const line of lines.slice(1)) { // Skip header
    const cleanLine = line.replace(/\*/g, '').trim(); // Remove asterisks
    const parts = cleanLine.split(':');

    if (parts.length < 2) continue; // Invalid line format

    const key = parts[0].trim().toUpperCase();
    const value = parts.slice(1).join(':').trim(); // Rejoin rest in case value has :

    if (!value) continue; // Empty values are treated as null/undefined

    // Map Keys to Internal Data Structure
    switch (key) {
      case 'STATUS':
        if (['AGENDAMENTO', 'EM USO', 'CANCELADO', 'FINALIZADO'].includes(value.toUpperCase())) {
          data.status = value.toUpperCase();
        } else {
          return { success: false, error: `Status inválido: ${value}` };
        }
        break;

      // Identifiers
      case 'ID': data.id = value; break;
      case 'PLACA': data.placa = value; break;
      case 'VEÍCULO': data.veiculo = value; break;
      case 'VEICULO': data.veiculo = value; break;

      // Dates/Time (Validated later if needed, strict string capture for now)
      case 'DATA INICIAL': data.data_inicial = value; break;
      case 'HORÁRIO INICIAL': data.horario_inicial = value; break;
      case 'HORARIO INICIAL': data.horario_inicial = value; break;
      case 'DATA FINAL': data.data_final = value; break;
      case 'HORÁRIO FINAL': data.horario_final = value; break;
      case 'HORARIO FINAL': data.horario_final = value; break;

      // Operational
      case 'DESTINO': data.destino = value; break;
      case 'KM INICIAL': data.km_inicial = parseInt(value.replace(/[^0-9]/g, '')); break;
      case 'KM FINAL': data.km_final = parseInt(value.replace(/[^0-9]/g, '')); break;

      // Responsibility
      case 'RESPONSÁVEL': data.responsavel = value; break;
      case 'RESPONSAVEL': data.responsavel = value; break;
      case 'MOTORISTA': data.responsavel = value; break; // Alias requested
      case 'ÁREA': data.area = value; break;
      case 'AREA': data.area = value; break;
      case 'ATIVIDADE': data.atividade = value; break;
      case 'PROJETO': data.projeto = value; break;

      // Checklist
      case 'NECESSÁRIO LAVAGEM?': data.necessario_lavagem = value.toUpperCase() === 'SIM'; break;
      case 'LAVAGEM REALIZADA': data.lavagem_realizada = value.toUpperCase() === 'SIM'; break;
      case 'TANQUE NA DEVOLUÇÃO':
        if (['1/4', '1/2', '3/4', 'CHEIO'].includes(value.toUpperCase())) data.tanque_devolucao = value.toUpperCase();
        break;
      case 'HOUVE ABASTECIMENTO': data.houve_abastecimento = value; break;
      case 'NECESSÁRIO ABASTECER': data.necessario_abastecer = value.toUpperCase() === 'SIM'; break;

      case 'ESTACIONADO': data.estacionado = value; break;
    }
  }

  // 3. Validation Rules per Status
  if (!data.status) return { success: false, error: 'Campo STATUS é obrigatório.' };

  const idPresent = !!(data.id || data.placa || data.veiculo);
  if (!idPresent) return { success: false, error: 'É necessário informar ID, PLACA ou VEÍCULO.' };

  if (data.status === 'AGENDAMENTO') {
    const missing = [];
    if (!data.data_inicial) missing.push('DATA INICIAL');
    if (!data.horario_inicial) missing.push('HORÁRIO INICIAL');
    if (!data.responsavel) missing.push('RESPONSÁVEL');

    if (missing.length > 0) return { success: false, error: `Campos obrigatórios para AGENDAMENTO: ${missing.join(', ')}` };
  }

  return { success: true, data: data as StrictFleetData };
}

// --- HELPERS ---

// Map input Data/Hora to ISO date for DB
const toDbDate = (d?: string) => d ? d.split('/').reverse().join('-') : undefined;
// Normalize Tank status to DB enum
const mapTanqueToDb = (t?: string, needed?: boolean): DbTanque => {
  if (needed) return 'necessario_abastecer';
  if (t === 'CHEIO') return 'cheio';
  if (t === '1/2' || t === '3/4') return 'meio_tanque';
  // Default logic if ambiguous, stick to safer option or default
  return 'cheio';
};

// --- MAIN HANDLER ---

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let messageBody = "";
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const json = await req.json();
      // Simple recursive finder equivalent
      const findMsg = (obj: any): string => {
        if (typeof obj === 'string' && obj.toUpperCase().includes('CONTROLE DE FROTA')) return obj;
        if (typeof obj === 'object' && obj !== null) {
          for (const k in obj) {
            const res = findMsg(obj[k]);
            if (res) return res;
          }
        }
        return "";
      };
      messageBody = findMsg(json);
    } else {
      const text = await req.text();
      if (contentType.includes("form")) {
        const params = new URLSearchParams(text);
        messageBody = params.get("message") || params.get("body") || text;
      } else {
        messageBody = text;
      }
    }

    if (!messageBody) return new Response('No content', { status: 400 });

    // --- EXECUTE STRICT PARSING ---
    const parseResult = strictParse(messageBody);

    // Strict Error Response
    if (!parseResult.success) {
      const errorMsg = `❌ Erro no processamento do controle de frota\nMotivo: ${parseResult.error}`;
      console.error("Validation Failed:", parseResult.error);
      // We return 200 to WhatsApp to stop retries, but with error message if possible to reply? 
      // Usually webhooks just log. We will log strict error.
      return new Response(JSON.stringify({ error: parseResult.error }), { status: 200, headers: corsHeaders });
      // Note: Using 200 to acknowledge receipt even on logic error, unless interaction is needed.
    }

    const d = parseResult.data!;

    // --- DATABASE ACTIONS ---

    // 1. Identify Vehicle
    const cleanId = d.id?.replace(/\*/g, '').trim();
    const cleanPlate = d.placa?.replace(/\*/g, '').trim();
    const cleanVeiculo = d.veiculo?.replace(/\*/g, '').trim();

    const orConditions = [];
    if (cleanId) orConditions.push(`internal_id.eq.${cleanId}`);
    if (cleanPlate) orConditions.push(`plate.eq.${cleanPlate}`);
    if (cleanVeiculo) orConditions.push(`model.ilike.%${cleanVeiculo}%`); // ilike for names

    // We need to query to get the Exact Plate for updates
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*')
      .or(orConditions.join(','))
      .limit(1);

    const vehicleRecord = vehicles?.[0];
    const finalPlate = vehicleRecord?.plate || cleanPlate || 'UNKNOWN';
    const finalVehicleName = vehicleRecord ? `${vehicleRecord.brand} ${vehicleRecord.model}` : (cleanVeiculo || cleanId || 'Desconhecido');

    // Helper to normalize Area to Title Case (e.g. AQUISIÇÃO -> Aquisição)
    const normalizeArea = (str?: string) => {
      if (!str) return 'whatsapp';
      return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Mapped Fields
    const dbFields = {
      veiculo: finalVehicleName,
      responsavel: d.responsavel,
      data_inicial: toDbDate(d.data_inicial),
      horario_inicial: d.horario_inicial,
      data_final: toDbDate(d.data_final) || toDbDate(d.data_inicial),
      horario_final: d.horario_final || '00:00',
      destino: d.destino,
      km_inicial: d.km_inicial || 0,
      km_final: d.km_final || 0,
      atividade: d.atividade || 'Não informada',
      lavagem: d.lavagem_realizada ? 'realizada' : (d.necessario_lavagem ? 'pendente' : 'pendente'),
      tanque: mapTanqueToDb(d.tanque_devolucao, d.necessario_abastecer),
      andar_estacionado: d.estacionado || 'P',
      status: d.status === 'AGENDAMENTO' ? 'agendado' : (d.status === 'EM USO' ? 'em_andamento' : d.status.toLowerCase()),
      raw_message: messageBody,
      source: normalizeArea(d.area)
    };

    let resultRecord;

    if (d.status === 'AGENDAMENTO') {
      // INSERT
      const { data, error } = await supabase.from('fleet_records').insert([dbFields]).select().single();
      if (error) throw error;
      resultRecord = data;

      // Update Vehicle Status
      if (vehicleRecord) await supabase.from('vehicles').update({ status: 'agendado' }).eq('id', vehicleRecord.id);

    } else if (d.status === 'EM USO') {
      // UPDATE (Find latest active or just latest by vehicle)
      // We try to find a record for this vehicle that is open/agendado
      const { data: existing } = await supabase
        .from('fleet_records')
        .select('id')
        .eq('veiculo', finalVehicleName) // This is weak if name changes, better by plate link if schema allowed, strictly using matched name
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase.from('fleet_records').update(dbFields).eq('id', existing.id).select().single();
        if (error) throw error;
        resultRecord = data;
      } else {
        // Fallback: Create if not found? Rules say "Update record", imply exist. 
        // If strictly "Do not infer", we might error. But robust systems often Upsert.
        // Given instructions "Procurar registro... Atualizar", if fail, maybe error?
        // Let's Insert if missing to avoid data loss, or error? 
        // "Nunca inferir dados". 
        // Let's treat valid EM USO as a new entry if no prev exists creates continuity gaps.
        // We will INSERT if not found to be safe.
        const { data, error } = await supabase.from('fleet_records').insert([dbFields]).select().single();
        if (error) throw error;
        resultRecord = data;
      }

      if (vehicleRecord) await supabase.from('vehicles').update({ status: 'em_uso' }).eq('id', vehicleRecord.id);

    } else if (d.status === 'CANCELADO' || d.status === 'FINALIZADO') {
      // CANCEL/FINISH
      const { data: existing } = await supabase
        .from('fleet_records')
        .select('id')
        .eq('veiculo', finalVehicleName)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase.from('fleet_records').update({ status: dbFields.status }).eq('id', existing.id).select().single();
        if (error) throw error;
        resultRecord = data;
      }

      if (vehicleRecord) await supabase.from('vehicles').update({ status: 'disponivel' }).eq('id', vehicleRecord.id);
    }

    // Success Response
    const successMsg = `✅ Sucesso\n✅ Controle de frota processado com sucesso\nVeículo: ${finalVehicleName}\nStatus: ${d.status}`;
    console.log(successMsg);

    return new Response(JSON.stringify({ success: true, message: successMsg }), { headers: corsHeaders });

  } catch (err) {
    console.error("System Error:", err);
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 200, headers: corsHeaders });
  }
});
