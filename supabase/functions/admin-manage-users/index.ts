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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables (URL or Service Role Key)');
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed: Invalid token or session expired');
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
      throw new Error('Unauthorized: Only designated admin emails can sync profiles');
    }

    // For other actions, verify admin status in DB
    const { data: profile, error: profileFetchError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const isDbAdmin = profile?.role === 'admin';
    const isUpdatingSelf = userId === user.id;

    if (!isAdminEmail && !isDbAdmin && !isUpdatingSelf) {
      return new Response(JSON.stringify({ error: 'Access Denied: Admin privileges required for this action' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (action === 'create') {
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      
      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      
      // Ensure profile is created
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        role: 'user'
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      return new Response(JSON.stringify({ success: true, user: data.user }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    if (action === 'delete') {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (deleteError) throw deleteError;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'update-password') {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });
      if (updateError) throw updateError;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error(`Invalid action: ${action}`)
  } catch (error: any) {
    console.error("Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})