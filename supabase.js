const SUPABASE_URL =
    "https://fkrhpmjzqyaypkqgkgaz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Bmh3TpUAp_bhXP-JNOA5hQ_lJKq4wt5";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);