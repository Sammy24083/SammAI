// supabase/functions/paystack-webhook/index.ts
// Secure Paystack Webhook Handler verifying HMAC SHA512 signature

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    const rawBody = await req.text();

    // Verify webhook signature with crypto HMAC
    const encoder = new TextEncoder();
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY || "");
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const computedHash = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedHash !== signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const { reference, amount, metadata, gateway_response, paid_at } = event.data;
      const orderId = metadata?.order_id;

      if (orderId) {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            order_status: "processing",
            payment_reference: reference,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        await supabase.from("payments").insert({
          order_id: orderId,
          order_number: metadata?.order_number || "SAMM-AUTO",
          customer_email: event.data.customer?.email || "unknown",
          provider: "Paystack",
          reference: reference,
          amount: amount / 100,
          currency: "NGN",
          status: "successful",
          gateway_response,
          paid_at,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400 });
  }
});
