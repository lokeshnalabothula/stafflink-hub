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
    const { mobile, name, department, position, salary, join_date, address } = await req.json();

    if (!mobile || !name) {
      return new Response(JSON.stringify({ error: 'Mobile and name are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify the caller is an owner
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify caller is owner
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check caller is owner
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (callerRole?.role !== 'owner') {
      return new Response(JSON.stringify({ error: 'Only owners can add workers' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Normalize mobile
    let normalizedMobile = mobile.trim().replace(/\s+/g, '');
    if (!normalizedMobile.startsWith('+')) {
      normalizedMobile = '+91' + normalizedMobile;
    }

    // Check if profile already exists with this mobile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('mobile', normalizedMobile)
      .single();

    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'A worker with this mobile number already exists' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create auth user for the worker
    const email = `${normalizedMobile.replace(/[^0-9]/g, '')}@staffhub.local`;
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      phone: normalizedMobile,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { name, mobile: normalizedMobile, role: 'worker' },
    });

    if (createErr || !newUser.user) {
      console.error('Create user error:', createErr);
      return new Response(JSON.stringify({ error: createErr?.message || 'Failed to create worker' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = newUser.user.id;

    // Create profile with status 'pending'
    await supabaseAdmin.from('profiles').insert({
      user_id: userId,
      name,
      mobile: normalizedMobile,
      department: department || null,
      position: position || null,
      salary: salary ? Number(salary) : 0,
      join_date: join_date || new Date().toISOString().split('T')[0],
      address: address || null,
      status: 'pending',
    });

    // Assign worker role
    await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role: 'worker',
    });

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('add-worker error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
