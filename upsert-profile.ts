// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
Deno.serve(async (req)=>{
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({
        error: "Use POST"
      }), {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: "Missing Authorization header"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    // Auth client (validates user)
    const supabaseAuth = createClient(Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "", Deno.env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") || "", {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    // Service client (bypasses RLS)
    const supabase = createClient(Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || "", Deno.env.get("SERVICE_ROLE_KEY") || "");
    // Get logged-in user
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({
        error: "Invalid or expired session"
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const uid = userData.user.id;
    // Parse body
    const body = await req.json().catch(()=>({}));
    const { full_name, preferred_currency, occupation, age } = body;
    // Validation
    if (!full_name || !preferred_currency) {
      return new Response(JSON.stringify({
        error: "full_name and preferred_currency are required"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    if (age && (typeof age !== "number" || age < 13 || age > 120)) {
      return new Response(JSON.stringify({
        error: "age must be a number between 13 and 120"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    // Upsert profile
    const { error: upsertError } = await supabase.from("profiles").upsert({
      user_id: uid,
      full_name,
      preferred_currency,
      occupation: occupation || null,
      age: age || null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: "user_id"
    });
    if (upsertError) {
      throw upsertError;
    }
    // Return complete profile
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("user_id", uid).single();
    if (profileError) {
      throw profileError;
    }
    return new Response(JSON.stringify({
      profile
    }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: String(e)
    }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  }
});
