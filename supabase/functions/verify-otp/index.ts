import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
      .select('user_id, status')
      .eq('mobile', mobile)
      .single();

    let userId: string;
    let isNewUser = false;
    const email = `${mobile.replace(/[^0-9]/g, '')}@staffhub.local`;
    const tempPassword = `StaffHub_${mobile.replace(/[^0-9]/g, '')}_Secure!`;

    if (existingProfile) {
      userId = existingProfile.user_id;
      // If profile was pre-registered by owner, mark as active now
      if (existingProfile.status === 'pending') {
        await supabaseAdmin
          .from('profiles')
          .update({ status: 'active' })
          .eq('user_id', userId);
        
        // Update password for the pre-created user so they can sign in
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: tempPassword,
        });
      }
    } else {
      // New user
      isNewUser = true;

      if (!name) {
        return new Response(JSON.stringify({ error: 'Name is required for new users', is_new_user: true }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        phone: mobile,
        password: tempPassword,
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

      await supabaseAdmin.from('profiles').insert({
        user_id: userId,
        name: name || 'User',
        mobile,
        status: 'active',
      });

      await supabaseAdmin.from('user_roles').insert({
        user_id: userId,
        role: role || 'worker',
      });
    }

    // Sign in the user to get a real session
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Ensure password is set
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: tempPassword,
    });

    const signInClient = createClient(supabaseUrl, anonKey);
    const { data: signInData, error: signInErr } = await signInClient.auth.signInWithPassword({
      email,
      password: tempPassword,
    });

    if (signInErr || !signInData.session) {
      console.error('Sign in error:', signInErr);
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
      session: {
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      },
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
