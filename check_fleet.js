
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        }
        env[key] = value;
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFleet() {
    console.log("Fetching active fleet records...");
    const { data, error } = await supabase
        .from('fleet_records')
        .select('*')
        .in('status', ['agendado', 'em_andamento']);

    if (error) {
        console.error('Error fetching records:', error);
    } else {
        console.log(`Total active records found: ${data.length}`);
        data.forEach(r => {
            console.log(`- ${r.veiculo} (${r.responsavel}): status=${r.status}, data=${r.data_inicial}`);
        });
    }
}

checkFleet();
