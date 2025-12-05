
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import OpenAI from "npm:openai";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";


const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);


const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});


const ai = new GoogleGenerativeAI(
  Deno.env.get("GEMINI_API_KEY")
);


const VALID_CATEGORIES = [
  "groceries", "dining", "transport", "shopping", "entertainment",
  "utilities", "health", "education", "rent", "subscriptions",
  "travel", "income", "other"
];


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonError("Method not allowed", null, 405);
  }

  try {
    const form = await req.formData();
    const file = form.get("audio_file");
    const user_id = form.get("user_id");
    const isAuto = form.get("isAuto") === "true";

    if (!user_id || typeof user_id !== "string" || !user_id.trim()) {
      return jsonError("Missing or invalid 'user_id'");
    }
    if (!file || !(file instanceof File)) {
      return jsonError("Missing audio file");
    }
    if (!file.type.startsWith("audio/")) {
      return jsonError("Invalid audio MIME type");
    }

    const finalUserId = user_id.trim();
    const todayISO = new Date().toISOString().slice(0, 10);

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe"
    });

    const spokenText = transcription.text?.trim();
    if (!spokenText) {
      return jsonError("Failed to transcribe audio");
    }

    const prompt = `
Transcribed audio: "${spokenText}"

Extract transaction info as JSON ONLY.

Use this schema:

If NOT a transaction:
{
  "is_transaction": false,
  "reason": "short explanation"
}

If YES:
{
  "is_transaction": true,
  "transaction_items": [
    { "item": "string", "price": number }
  ],
  "merchant": "string",
  "total_amount": number,
  "currency": "string",
  "category": "string",
  "transaction_date": "YYYY-MM-DD",
  "notes": "string"
}

CATEGORY must be EXACTLY:
${VALID_CATEGORIES.map((c) => `"${c}"`).join(", ")}

Defaults:
- merchant: "Unspecified"
- currency: "USD"
- transaction_date: "${todayISO}"
- category: "other" if unsure
- notes: not empty

Return ONLY valid JSON.
    `;

    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([{ text: prompt }]);
    const textOutput = result.response.text().trim();

    let aiData;
    try {
      aiData = JSON.parse(textOutput.replace(/```json|```/gi, "").trim());
    } catch {
      return jsonError("Failed to parse Gemini JSON", textOutput);
    }

    if (!aiData.is_transaction) {
      return jsonError("Audio not a transaction", aiData.reason ?? "Unknown");
    }

    if (!VALID_CATEGORIES.includes(aiData.category)) {
      aiData.category = "other";
    }

    const transactionPayload = {
      user_id: finalUserId,
      receipt_id: null,
      transaction_items: JSON.stringify(aiData.transaction_items ?? []),
      merchant: aiData.merchant || "Unspecified",
      total_amount: aiData.total_amount ?? 0,
      currency: aiData.currency ?? "USD",
      category: aiData.category,
      transaction_date: aiData.transaction_date ?? todayISO,
      notes: aiData.notes ?? "Recorded via voice transaction",
    };

    if (isAuto) {
      const { data: row, error } = await supabase
        .from("transactions")
        .insert(transactionPayload)
        .select()
        .single();

      if (error) {
        return jsonError("Database insert failed", error.message);
      }

      return json({
        success: true,
        mode: "auto",
        transaction: row,
      });
    }

    return json({
      success: true,
      mode: "preview",
      transaction: transactionPayload,
      transcription: spokenText
    });

  } catch (err) {
    return jsonError("Unexpected error", err?.message ?? String(err));
  }
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(message, details, status = 400) {
  return json({ error: message, details }, status);
}
