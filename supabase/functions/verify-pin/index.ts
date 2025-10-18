import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

    // Check rate limiting - get recent attempts in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('pin_attempts')
      .select('*')
      .eq('phone', phone)
      .gte('attempt_time', fifteenMinutesAgo)
      .order('attempt_time', { ascending: false });

    if (attemptsError) {
      console.error('Error checking attempts:', attemptsError);
    }

    // Rate limiting logic: Max 5 attempts in 15 minutes
    if (recentAttempts && recentAttempts.length >= 5) {
      const lastAttempt = new Date(recentAttempts[0].attempt_time);
      const unlockTime = new Date(lastAttempt.getTime() + 15 * 60 * 1000);
      const minutesRemaining = Math.ceil((unlockTime.getTime() - Date.now()) / 60000);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Too many failed attempts. Please try again in ${minutesRemaining} minutes.` 
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Get user by phone number
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      throw userError;
    }

    const user = users.users.find(u => u.phone === phone);
    
    if (!user) {
      // Log failed attempt even if user not found (prevents user enumeration via timing)
      await supabase.from('pin_attempts').insert({
        phone,
        attempt_time: new Date().toISOString(),
        successful: false,
      });
      
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        {
          status: 401,
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
      // Log failed attempt
      await supabase.from('pin_attempts').insert({
        phone,
        attempt_time: new Date().toISOString(),
        successful: false,
      });
      
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid credentials' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify PIN using bcrypt
    const isValid = await bcrypt.compare(pin, pinData.pin_hash);

    if (isValid) {
      // Log successful attempt
      await supabase.from('pin_attempts').insert({
        phone,
        attempt_time: new Date().toISOString(),
        successful: true,
      });

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

    // Log failed attempt
    await supabase.from('pin_attempts').insert({
      phone,
      attempt_time: new Date().toISOString(),
      successful: false,
    });

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
