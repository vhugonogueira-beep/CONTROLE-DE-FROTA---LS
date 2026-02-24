import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Robust .env parser
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        // Strip quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        }
        env[key] = value;
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("Supabase URL:", supabaseUrl);

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error("Invalid supabaseUrl: " + supabaseUrl);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const vehicles = [
    {
        plate: 'TWB3I60',
        internal_id: 'V001',
        renavam: '01473528736',
        chassis: '9BWKL45U2TP057059',
        brand: 'VW',
        model: 'SAVEIRO',
        version: 'CS RB MF',
        manufacturing_year: 2025,
        model_year: 2026,
        vehicle_type: 'utilitário',
        color: 'BRANCA',
        category: 'Operacional',
        status: 'disponivel'
    },
    {
        plate: 'TVQ3F00',
        internal_id: 'V002',
        renavam: '01471625513',
        chassis: '9BWJL45U4TP060833',
        brand: 'VW',
        model: 'SAVEIRO',
        version: 'CD EX MF',
        manufacturing_year: 2025,
        model_year: 2026,
        vehicle_type: 'utilitário',
        color: 'BRANCA',
        category: 'Operacional',
        status: 'disponivel'
    }
];

async function insertVehicles() {
    console.log("Registering vehicles...");
    for (const vehicle of vehicles) {
        const { data, error } = await supabase
            .from('vehicles')
            .upsert(vehicle, { onConflict: 'plate' });

        if (error) {
            console.error(`Error inserting vehicle ${vehicle.plate}:`, error.message);
        } else {
            console.log(`Vehicle ${vehicle.plate} registered successfully!`);
        }
    }
}

insertVehicles();
