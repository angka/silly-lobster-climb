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

    // Verify the requester is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[admin-manage-users] No authorization header provided");
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("[admin-manage-users] Auth error or user not found:", authError);
      throw new Error('Invalid token');
    }

    console.log("[admin-manage-users] Verifying permissions for:", user.email);

    // Check if user is admin by email or by database role
    const isAdminEmail = user.email === 'angka@gmail.com' || user.email === 'admin@example.com';
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isDbAdmin = profile?.role === 'admin';

    if (!isAdminEmail && !isDbAdmin) {
      console.warn("[admin-manage-users] Unauthorized access attempt by:", user.email);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { action, email, password, userId } = await req.json()
    console.log(`[admin-manage-users] Performing action: ${action} for target: ${email || userId}`);

    if (action === 'create') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      if (error) {
        console.error("[admin-manage-users] Create user error:", error);
        throw error;
      }
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'delete') {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) {
        console.error("[admin-manage-users] Delete user error:", error);
        throw error;
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error("[admin-manage-users] Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})