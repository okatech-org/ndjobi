import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Channel = "sms" | "whatsapp" | "email";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, channel = "sms" } = (await req.json()) as { to: string; channel?: Channel };

    if (!to) {
      return new Response(JSON.stringify({ error: "Missing 'to'" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    if (!["sms", "whatsapp", "email"].includes(channel)) {
      return new Response(JSON.stringify({ error: "Invalid channel" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const serviceSid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!accountSid || !authToken || !serviceSid) {
      return new Response(JSON.stringify({ error: "Twilio env vars not configured" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const params = new URLSearchParams();
    params.append("To", to);
    params.append("Channel", channel);

    const res = await fetch(`https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.message || "Twilio error" }), { status: res.status, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ sid: data.sid, status: data.status, to: data.to, channel: data.channel }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Server error" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});


