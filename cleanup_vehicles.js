
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

async function cleanupVehicles() {
    console.log("Starting vehicle status cleanup...");

    // 1. Fetch all vehicles
    const { data: vehicles, error: vError } = await supabase
        .from('vehicles')
        .select('id, plate, status');

    if (vError) {
        console.error('Error fetching vehicles:', vError);
        return;
    }

    // 2. Fetch all active trips
    const { data: trips, error: tError } = await supabase
        .from('fleet_records')
        .select('veiculo')
        .in('status', ['agendado', 'em_andamento']);

    if (tError) {
        console.error('Error fetching trips:', tError);
        return;
    }

    const activeVehiclePlates = new Set(trips.map(t => t.veiculo));

    console.log(`Active vehicle plates: ${Array.from(activeVehiclePlates).join(', ') || 'none'}`);

    for (const vehicle of vehicles) {
        if (!activeVehiclePlates.has(vehicle.plate) && vehicle.status !== 'disponivel' && vehicle.status !== 'bloqueado') {
            console.log(`Resetting status for vehicle ${vehicle.plate} (Current: ${vehicle.status}) -> disponivel`);
            const { error: uError } = await supabase
                .from('vehicles')
                .update({ status: 'disponivel' })
                .eq('id', vehicle.id);

            if (uError) {
                console.error(`Error resetting ${vehicle.plate}:`, uError);
            }
        } else {
            console.log(`Vehicle ${vehicle.plate} is already correct (Status: ${vehicle.status})`);
        }
    }

    console.log("Cleanup finished.");
}

cleanupVehicles();
