import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { name, email, phone, password, baptism_name, address } = await req.json();

    console.log('Creating auth account for GLV:', email);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      throw authError;
    }

    console.log('Auth account created:', authData.user.id);

    // Update profile (should already exist from trigger)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: name,
        email: email,
        phone: phone,
        baptism_name: baptism_name,
        address: address
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    // Set role to glv
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role: 'glv' })
      .eq('user_id', authData.user.id);

    if (roleError) {
      console.error('Role update error:', roleError);
      throw roleError;
    }

    console.log('GLV account setup complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authData.user.id,
        login_info: {
          email: email,
          password: password
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-glv-account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
