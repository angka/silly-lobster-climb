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
    
    const { action, email, password, userId, newPassword } = await req.json()

    // Special action to fix the admin's own profile
    if (action === 'sync-profile') {
      if (isAdminEmail) {
        const { error: upsertError } = await supabaseAdmin
          .from('profiles')
          .upsert({ 
            id: user.id, 
            email: user.email,
            role: 'admin',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        
        if (upsertError) throw upsertError;
        
        return new Response(JSON.stringify({ success: true, role: 'admin' }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      throw new Error('Unauthorized for sync');
    }

    // For other actions, verify admin status in DB
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isDbAdmin = profile?.role === 'admin';

    // Allow users to update their OWN password via this function if needed, 
    // but primarily this is for admins managing others.
    const isUpdatingSelf = userId === user.id;

    if (!isAdminEmail && !isDbAdmin && !isUpdatingSelf) {
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

    if (action === 'update-password') {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });
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