
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

async function fixVehicles() {
    console.log("Updating vehicle statuses to 'disponivel'...");
    const { data, error } = await supabase
        .from('vehicles')
        .update({ status: 'disponivel' })
        .eq('status', 'active');

    if (error) {
        console.error('Error updating vehicles:', error);
    } else {
        console.log('Update result:', data);

        // Also check if there are ANY vehicles
        const { data: allVehicles, error: fetchError } = await supabase
            .from('vehicles')
            .select('*');

        if (fetchError) {
            console.error('Error fetching vehicles:', fetchError);
        } else {
            console.log(`Total vehicles in DB: ${allVehicles.length}`);
            allVehicles.forEach(v => {
                console.log(`- ${v.plate}: ${v.status}`);
            });
        }
    }
}

fixVehicles();
