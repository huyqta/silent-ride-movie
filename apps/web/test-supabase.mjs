import { createClient } from '@supabase/supabase-js';

const url = 'https://uvcfbeoenjcpazayqdea.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2Y2ZiZW9lbmpjcGF6YXlxZGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTg4MjEsImV4cCI6MjA4NTg5NDgyMX0.iHLmZ1e6XrrM4rg_hjusbml3Z-zs4MHkQ-bMAHyU0rs';

const sb = createClient(url, key);

console.log('Testing connection to:', url);
const { data, error } = await sb.from('sr_profiles').select('*').limit(5);
console.log('DATA:', JSON.stringify(data, null, 2));
console.log('ERROR:', JSON.stringify(error, null, 2));
