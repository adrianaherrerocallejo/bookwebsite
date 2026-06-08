const SUPABASE_URL = "https://ttkdmerseqhhhdkzyvdw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iFZmSSSwJrF6MF8Pys1RNQ_Kd8XZw7X";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;
