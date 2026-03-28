import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIREBASE_SERVICE_ACCOUNT_KEY = JSON.parse(
  Deno.env.get("FIREBASE_SERVICE_ACCOUNT_KEY")!,
);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface BookingRow {
  id: string;
  user_id: string;
  service_id: string;
  date: string;
  time_slot: string;
  status: string;
  services: {
    name: string;
    user_id: string;
  };
  profiles: {
    name: string;
  };
}

const NOTIFICATION_CONFIG: Record<
  string,
  {
    getTargetUserId: (booking: BookingRow) => string;
    title: string;
    bodyTemplate: string;
    screen: string;
  }
> = {
  created: {
    getTargetUserId: (b) => b.services.user_id,
    title: "New Booking Request",
    bodyTemplate: "{{customerName}} booked {{serviceName}}",
    screen: "BookingRequests",
  },
  confirmed: {
    getTargetUserId: (b) => b.user_id,
    title: "Booking Confirmed",
    bodyTemplate:
      "Your booking for {{serviceName}} has been confirmed",
    screen: "BookingHistory",
  },
  cancelled: {
    getTargetUserId: (b) => b.user_id,
    title: "Booking Cancelled",
    bodyTemplate:
      "Your booking for {{serviceName}} has been cancelled",
    screen: "BookingHistory",
  },
  completed: {
    getTargetUserId: (b) => b.user_id,
    title: "Booking Completed",
    bodyTemplate:
      "Your booking for {{serviceName}} is complete. Leave a review!",
    screen: "BookingHistory",
  },
  rescheduled: {
    getTargetUserId: (b) => b.services.user_id,
    title: "Booking Rescheduled",
    bodyTemplate:
      "Booking for {{serviceName}} has been rescheduled",
    screen: "BookingRequests",
  },
};

async function getAccessToken(): Promise<string> {
  const key = FIREBASE_SERVICE_ACCOUNT_KEY;
  const now = Math.floor(Date.now() / 1000);

  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );

  const textEncoder = new TextEncoder();
  const inputData = textEncoder.encode(`${header}.${payload}`);

  // Import the private key
  const pemContents = key.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    inputData,
  );

  const signatureBase64 = btoa(
    String.fromCharCode(...new Uint8Array(signature)),
  );
  const jwt = `${header}.${payload}.${signatureBase64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function sendFcmMessage(
  accessToken: string,
  projectId: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<void> {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data,
          android: { priority: "high" },
          apns: {
            payload: { aps: { sound: "default", badge: 1 } },
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`FCM send failed for token ${token}: ${errorText}`);

    // Remove invalid token
    if (
      errorText.includes("UNREGISTERED") ||
      errorText.includes("INVALID_ARGUMENT")
    ) {
      await supabase.from("device_tokens").delete().eq("token", token);
    }
  }
}

Deno.serve(async (req) => {
  try {
    const { booking_id, event_type } = await req.json();

    const config = NOTIFICATION_CONFIG[event_type];
    if (!config) {
      return new Response(JSON.stringify({ error: "Unknown event type" }), {
        status: 400,
      });
    }

    // Fetch booking with service and customer profile
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*, services!inner(name, user_id), profiles:profiles!user_id(name)")
      .eq("id", booking_id)
      .single();

    if (error || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
      });
    }

    const targetUserId = config.getTargetUserId(booking as BookingRow);

    // Fetch device tokens for target user
    const { data: tokens } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("user_id", targetUserId);

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No tokens found" }), {
        status: 200,
      });
    }

    const customerName = booking.profiles?.name ?? "Someone";
    const serviceName = booking.services?.name ?? "a service";

    const body = config.bodyTemplate
      .replace("{{customerName}}", customerName)
      .replace("{{serviceName}}", serviceName);

    const data = {
      booking_id,
      event_type,
      screen: config.screen,
    };

    const accessToken = await getAccessToken();
    const projectId = FIREBASE_SERVICE_ACCOUNT_KEY.project_id;

    await Promise.all(
      tokens.map((t: { token: string }) =>
        sendFcmMessage(accessToken, projectId, t.token, config.title, body, data)
      ),
    );

    return new Response(
      JSON.stringify({ message: "Notifications sent", count: tokens.length }),
      { status: 200 },
    );
  } catch (err) {
    console.error("send-notification error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
