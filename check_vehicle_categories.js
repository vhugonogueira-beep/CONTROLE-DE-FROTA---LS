
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

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    console.log("Fetching vehicle categories...");
    const { data, error } = await supabase
        .from('vehicles')
        .select('plate, model, category');

    if (error) {
        console.error('Error fetching vehicles:', error);
    } else {
        console.log(`Total vehicles found: ${data.length}`);
        data.forEach(v => {
            console.log(`- ${v.plate} (${v.model}): category=${v.category}`);
        });
    }
}

checkCategories();
