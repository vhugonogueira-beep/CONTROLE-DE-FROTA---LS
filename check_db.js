
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hqiztazjruxujwwuupfq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaXp0YXpqcnV4dWp3d3V1cGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODIyNjEsImV4cCI6MjA4NTY1ODI2MX0.lPayB7cqM4yqvnAd5PsJ44DUWTnIu1nUwkEIaY9JMcA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLatest() {
    const { data, error } = await supabase
        .from('fleet_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Latest Record:', JSON.stringify(data, null, 2))
    }
}

checkLatest()
