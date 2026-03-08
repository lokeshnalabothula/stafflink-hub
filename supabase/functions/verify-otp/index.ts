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
    let { mobile, otp, name, role } = await req.json();

    if (!mobile || !otp) {
      return new Response(JSON.stringify({ error: 'Mobile and OTP are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Normalize mobile
    mobile = mobile.trim().replace(/\s+/g, '');
    if (!mobile.startsWith('+')) {
      mobile = '+91' + mobile;
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get stored OTP
    const { data: otpRecord } = await supabaseAdmin
      .from('otp_verification')
      .select('*')
      .eq('mobile', mobile)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!otpRecord) {
      return new Response(JSON.stringify({ error: 'No OTP found. Please request a new one.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check expiry
    if (new Date(otpRecord.expiry_time) < new Date()) {
      await supabaseAdmin.from('otp_verification').delete().eq('id', otpRecord.id);
      return new Response(JSON.stringify({ error: 'OTP expired. Please request a new one.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await supabaseAdmin.from('otp_verification').delete().eq('id', otpRecord.id);
      return new Response(JSON.stringify({ error: 'Too many attempts. Please request a new OTP.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Hash the provided OTP and compare
    const encoder = new TextEncoder();
    const data = encoder.encode(otp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (otpHash !== otpRecord.otp_hash) {
      // Increment attempts
      await supabaseAdmin
        .from('otp_verification')
        .update({ attempts: (otpRecord.attempts || 0) + 1 })
        .eq('id', otpRecord.id);
      return new Response(JSON.stringify({ error: 'Invalid OTP' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // OTP verified! Delete it
    await supabaseAdmin.from('otp_verification').delete().eq('id', otpRecord.id);

    // Check if user exists by mobile in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('mobile', mobile)
      .single();

    let userId: string;
    let isNewUser = false;

    if (existingProfile) {
      userId = existingProfile.user_id;
    } else {
      // New user — create auth user with phone
      isNewUser = true;
      const email = `${mobile.replace(/[^0-9]/g, '')}@staffhub.local`;
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        phone: mobile,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { name: name || 'User', mobile, role: role || 'worker' },
      });

      if (createErr || !newUser.user) {
        console.error('Create user error:', createErr);
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      userId = newUser.user.id;

      // Create profile
      await supabaseAdmin.from('profiles').insert({
        user_id: userId,
        name: name || 'User',
        mobile,
      });

      // Assign role
      await supabaseAdmin.from('user_roles').insert({
        user_id: userId,
        role: role || 'worker',
      });
    }

    // Generate a session token using admin
    const { data: session, error: signInErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${mobile.replace(/[^0-9]/g, '')}@staffhub.local`,
    });

    if (signInErr) {
      console.error('Generate link error:', signInErr);
      // Fallback: sign in with password-like approach
    }

    // Get user's role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return new Response(JSON.stringify({
      success: true,
      is_new_user: isNewUser,
      user_id: userId,
      role: roleData?.role || 'worker',
      profile,
      // Include the hashed properties token for client-side session
      token_hash: session?.properties?.hashed_token,
      verification_url: session?.properties?.verification_type ? 
        `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${session?.properties?.hashed_token}&type=magiclink` : null,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('verify-otp error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
