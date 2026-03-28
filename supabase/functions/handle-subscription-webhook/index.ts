import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const REVENUECAT_WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-rc-webhook-secret, content-type",
};

// Map RevenueCat product_id to plan name
function mapProductToPlan(productId: string): "basic" | "pro" {
  if (
    productId === "glow.provider.basic.monthly" ||
    productId === "glow.provider.basic.yearly"
  ) {
    return "basic";
  }
  return "pro";
}

// Map RevenueCat product_id to period
function mapProductToPeriod(productId: string): "monthly" | "yearly" {
  if (productId.endsWith(".yearly")) {
    return "yearly";
  }
  return "monthly";
}

// Map RevenueCat event type to subscription status
function mapEventTypeToStatus(
  eventType: string,
): "active" | "cancelled" | "expired" | "billing_retry" | null {
  switch (eventType) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
      return "active";
    case "CANCELLATION":
      return "cancelled";
    case "EXPIRATION":
      return "expired";
    case "BILLING_ISSUE_DETECTED":
      return "billing_retry";
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("authorization") ??
      req.headers.get("x-rc-webhook-secret");

    if (!authHeader || authHeader !== REVENUECAT_WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const event = body.event;

    if (!event) {
      return new Response(
        JSON.stringify({ error: "Missing event in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const eventType: string = event.type;
    const appUserId: string = event.app_user_id;
    const productId: string = event.product_id ?? "";
    const expirationAtMs: number | null = event.expiration_at_ms ?? null;
    const purchasedAtMs: number | null = event.purchased_at_ms ?? null;
    const environment: string = event.environment ?? "PRODUCTION";

    const status = mapEventTypeToStatus(eventType);

    if (!status) {
      // Log unhandled event types but still return 200
      console.log(`Unhandled event type: ${eventType}`);
      await supabase.from("subscription_events").insert({
        user_id: appUserId,
        revenuecat_customer_id: appUserId,
        event_type: eventType,
        product_id: productId,
        payload: body,
      });
      return new Response(
        JSON.stringify({ message: "Event logged but no action taken" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const plan = status === "expired" ? "free" : mapProductToPlan(productId);
    const period = mapProductToPeriod(productId);
    const isSandbox = environment === "SANDBOX";
    const expirationDate = expirationAtMs
      ? new Date(expirationAtMs).toISOString()
      : null;
    const purchasedDate = purchasedAtMs
      ? new Date(purchasedAtMs).toISOString()
      : null;

    // Upsert subscription record
    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: appUserId,
          revenuecat_customer_id: appUserId,
          plan,
          period,
          product_id: productId,
          status,
          original_purchase_date: purchasedDate,
          current_period_end: expirationDate,
          is_sandbox: isSandbox,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      console.error("Subscription upsert error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to upsert subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Update denormalized plan on profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ subscription_plan: plan })
      .eq("id", appUserId);

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    // Insert audit event
    const { error: eventError } = await supabase
      .from("subscription_events")
      .insert({
        user_id: appUserId,
        revenuecat_customer_id: appUserId,
        event_type: eventType,
        product_id: productId,
        payload: body,
      });

    if (eventError) {
      console.error("Event insert error:", eventError);
    }

    return new Response(
      JSON.stringify({ message: "Webhook processed", plan, status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("handle-subscription-webhook error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
