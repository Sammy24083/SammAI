// supabase/functions/verify-payment/index.ts
// Verifies transaction directly with Paystack API before updating order to PAID

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { reference, order_id } = await req.json();

    if (!reference || !order_id) {
      return new Response(
        JSON.stringify({
          error: "Transaction reference and order ID are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Payment verification is not configured on the server.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: pendingOrder, error: pendingOrderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_email, total_amount, currency, payment_status",
      )
      .eq("id", order_id)
      .single();
    if (pendingOrderError || !pendingOrder)
      throw new Error("The order could not be found.");

    // Verify transaction with Paystack official endpoint.
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const verifyData = await verifyRes.json();

    if (
      !verifyRes.ok ||
      !verifyData.status ||
      verifyData.data?.status !== "success"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment verification failed or pending",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const transaction = verifyData.data;
    const expectedKobo = Math.round(Number(pendingOrder.total_amount) * 100);
    if (
      transaction.amount !== expectedKobo ||
      transaction.currency !== pendingOrder.currency
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "The payment amount or currency does not match this order.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (
      transaction.customer?.email?.toLowerCase() !==
      pendingOrder.customer_email.toLowerCase()
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "The payment email does not match this order.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update the exact pending order whose amount and email were checked above.
    const targetOrderId = pendingOrder.id;
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "processing",
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetOrderId)
      .select("*, order_items(*)")
      .single();

    if (orderErr) throw orderErr;

    // 2. Record payment in payments ledger
    await supabase.from("payments").insert({
      order_id: targetOrderId,
      order_number: order.order_number,
      customer_id: order.customer_id,
      customer_email: order.customer_email,
      provider: "Paystack",
      reference: reference,
      amount: transaction.amount / 100,
      currency: transaction.currency,
      status: "successful",
      gateway_response: transaction.gateway_response,
      paid_at: transaction.paid_at,
    });

    return new Response(
      JSON.stringify({
        success: true,
        order_id: targetOrderId,
        order_number: order.order_number,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
