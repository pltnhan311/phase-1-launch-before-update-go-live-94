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

    const { student_id, student_db_id } = await req.json();

    console.log('Creating auth account for student:', student_id);

    // Create auth user with email = {student_id}@student.local, password = 123456
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `${student_id}@student.local`,
      password: '123456',
      email_confirm: true,
      user_metadata: {
        is_student: true,
        student_id: student_id
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      throw authError;
    }

    console.log('Auth account created:', authData.user.id);

    // Delete the auto-created catechist from trigger (role will be 'admin')
    const { error: deleteError } = await supabase
      .from('catechists')
      .delete()
      .eq('user_id', authData.user.id);

    if (deleteError) {
      console.error('Delete auto-created catechist error:', deleteError);
    }

    // Delete the auto-created role from trigger
    const { error: deleteRoleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', authData.user.id);

    if (deleteRoleError) {
      console.error('Delete auto-created role error:', deleteRoleError);
    }

    // Link user_id to students table and set role
    const { error: updateError } = await supabase
      .from('students')
      .update({ user_id: authData.user.id })
      .eq('id', student_db_id);

    if (updateError) {
      console.error('Student update error:', updateError);
      throw updateError;
    }

    // Set role to student
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ 
        user_id: authData.user.id, 
        role: 'student' 
      });

    if (roleError) {
      console.error('Role creation error:', roleError);
      throw roleError;
    }

    console.log('Student account setup complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authData.user.id,
        login_info: {
          student_id: student_id,
          password: '123456'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-student-account:', error);
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