import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile } = await req.json();
    if (!mobile || mobile.length < 10) {
      return new Response(JSON.stringify({ error: 'Invalid mobile number' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Rate limit: check recent OTPs for this mobile
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentOtps } = await supabaseAdmin
      .from('otp_verification')
      .select('id')
      .eq('mobile', mobile)
      .gte('created_at', fiveMinAgo);

    if (recentOtps && recentOtps.length >= 3) {
      return new Response(JSON.stringify({ error: 'Too many OTP requests. Try again later.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Hash OTP using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(otp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store hashed OTP with 5 min expiry
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Delete old OTPs for this mobile
    await supabaseAdmin
      .from('otp_verification')
      .delete()
      .eq('mobile', mobile);

    // Insert new OTP
    await supabaseAdmin
      .from('otp_verification')
      .insert({ mobile, otp_hash: otpHash, expiry_time: expiryTime, attempts: 0 });

    // Send OTP via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromPhone) {
      console.error('Twilio credentials not configured');
      return new Response(JSON.stringify({ error: 'SMS service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: mobile,
        From: fromPhone,
        Body: `Your StaffHub verification code is: ${otp}. Valid for 5 minutes.`,
      }),
    });

    if (!twilioResponse.ok) {
      const errData = await twilioResponse.text();
      console.error('Twilio error:', errData);
      return new Response(JSON.stringify({ error: 'Failed to send OTP' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('send-otp error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
