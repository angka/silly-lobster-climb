import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const isAdminEmail = user.email === 'angka@gmail.com' || user.email === 'admin@example.com';
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isDbAdmin = profile?.role === 'admin';

    // If they are an admin by email but not in DB, we allow the 'sync-profile' action
    const { action, email, password, userId } = await req.json()

    if (action === 'sync-profile') {
      if (isAdminEmail) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
        return new Response(JSON.stringify({ success: true, role: 'admin' }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      throw new Error('Unauthorized for sync');
    }

    // For other actions, they must be a verified admin (either by email or DB)
    if (!isAdminEmail && !isDbAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (action === 'create') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      if (error) throw error;
      
      // Ensure profile is created immediately if trigger is slow
      await supabaseAdmin.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        role: 'user'
      }).onConflict('id').ignore();

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'delete') {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error('Invalid action')
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})