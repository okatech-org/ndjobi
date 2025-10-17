import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html }: EmailRequest = await req.json();

    if (!RESEND_API_KEY) {
      throw new Error('Resend API key not configured');
    }

    // Appel à l'API Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NDJOBI <noreply@ndjobi.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.json();
      throw new Error(`Resend error: ${error.message}`);
    }

    const data = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

