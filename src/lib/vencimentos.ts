import { createClient } from "@/lib/supabase/server";

export async function aplicarVencimentos() {
  const supabase = await createClient();
  await supabase.rpc("aplicar_vencimentos");
}
