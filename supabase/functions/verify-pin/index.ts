import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPinRequest {
  phone: string;
  pin: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, pin }: VerifyPinRequest = await req.json();

    if (!phone || !pin) {
      console.error('Missing phone or pin');
      return new Response(
        JSON.stringify({ success: false, error: 'Phone and PIN are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user by phone number
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      throw userError;
    }

    const user = users.users.find(u => u.phone === phone);
    
    if (!user) {
      console.error('User not found for phone:', phone);
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get stored PIN hash
    const { data: pinData, error: pinError } = await supabase
      .from('user_pins')
      .select('pin_hash')
      .eq('user_id', user.id)
      .single();

    if (pinError || !pinData) {
      console.error('PIN not found for user:', user.id, pinError);
      return new Response(
        JSON.stringify({ success: false, error: 'PIN not configured' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify PIN (simple comparison for demo, use bcrypt in production)
    const pinHash = btoa(pin);
    const isValid = pinHash === pinData.pin_hash;

    console.log('PIN verification result:', isValid);

    if (isValid) {
      // Create session for the user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email || `${user.phone}@phone.auth`,
      });

      if (sessionError) {
        console.error('Error generating session:', sessionError);
        throw sessionError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: { id: user.id, phone: user.phone },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid PIN' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in verify-pin function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
