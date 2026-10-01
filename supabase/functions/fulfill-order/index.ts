// supabase/functions/fulfill-order/index.ts
// Handles admin or automated fulfillment of subscription delivery records

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id, delivery_record_id, access_information, delivery_instructions } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Update delivery record
    if (delivery_record_id) {
      await supabase
        .from("delivery_records")
        .update({
          delivery_status: "delivered",
          access_information: access_information || "Access activated.",
          delivery_instructions: delivery_instructions || "Check your email/WhatsApp for details.",
          fulfilled_at: new Date().toISOString(),
        })
        .eq("id", delivery_record_id);
    } else {
      await supabase
        .from("delivery_records")
        .update({
          delivery_status: "delivered",
          access_information: access_information || "Access activated.",
          delivery_instructions: delivery_instructions || "Check your email/WhatsApp for details.",
          fulfilled_at: new Date().toISOString(),
        })
        .eq("order_id", order_id);
    }

    // Check if all delivery records for this order are delivered
    const { data: records } = await supabase
      .from("delivery_records")
      .select("delivery_status")
      .eq("order_id", order_id);

    const allDelivered = records && records.every((r) => r.delivery_status === "delivered");

    if (allDelivered) {
      await supabase
        .from("orders")
        .update({
          order_status: "fulfilled",
          delivery_status: "delivered",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order_id);
    }

    return new Response(JSON.stringify({ success: true, message: "Order fulfilled successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
