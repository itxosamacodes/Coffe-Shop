import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ehjjortrjhxxrxymaggx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-RBcvjgphSnpWb-4MXPRLQ_bU_Cinen";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
