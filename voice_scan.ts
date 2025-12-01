import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
const ai = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));
const VALID_CATEGORIES = [
  "groceries",
  "dining",
  "transport",
  "shopping",
  "entertainment",
  "utilities",
  "health",
  "education",
  "rent",
  "subscriptions",
  "travel",
  "income",
  "other",
];
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
Deno.serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
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
      return jsonError("Missing or invalid 'audio_file'");
    }
    if (!file.type || !file.type.startsWith("audio/")) {
      return jsonError("Uploaded file is not an audio recording");
    }
    const finalUserId = user_id.trim();
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const base64Audio = uint8ToBase64(bytes);
    const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const prompt = `
You will receive an audio recording of a person describing a purchase or several purchases.
Example: "I bought a potato for 2 bucks and fries for 3 bucks at Sprouts."

Your job is to:
1. Decide if the audio describes a financial transaction (buying, paying, etc.).
2. If yes, extract structured data.
3. If there is no merchant mentioned, just give the merchant data "Unspecified"

SCHEMA:

If the audio does NOT describe a transaction, respond with ONLY:
{
  "is_transaction": false,
  "reason": "short explanation"
}

If the audio DOES describe a transaction, respond with ONLY:
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

Rules for category:
- It MUST be EXACTLY one of:
  "groceries",
  "dining",
  "transport",
  "shopping",
  "entertainment",
  "utilities",
  "health",
  "education",
  "rent",
  "subscriptions",
  "travel",
  "income",
  "other"
- If you're unsure, use "other".

Rules for currency:
- Default to "USD" unless the user clearly specifies another currency.

Rules for transaction_date:
- If the user says a specific date, use that.
- If no date is mentioned, default to "${todayISO}".

Notes:
- "notes" can capture anything useful (e.g. "Recorded by voice, multiple items", clarifications, etc.).

IMPORTANT:
- Return ONLY valid JSON.
- No markdown, no code fences, no comments.
`;
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64Audio,
        },
      },
      {
        text: prompt,
      },
    ]);
    const textOutput = result.response.text().trim();
    if (!textOutput) {
      return jsonError("Gemini returned an empty response");
    }
    let aiData;
    try {
      aiData = JSON.parse(textOutput.replace(/```json|```/gi, "").trim());
    } catch (err) {
      return jsonError("Failed to parse Gemini output", textOutput);
    }
    if (!aiData.is_transaction) {
      return jsonError(
        "Audio is not recognized as a spending description",
        aiData.reason ?? "Gemini classified this audio as non-transaction"
      );
    }
    if (
      aiData.total_amount == null ||
      !aiData.merchant ||
      !aiData.transaction_date
    ) {
      return jsonError(
        "Could not reliably extract transaction details",
        aiData
      );
    }
    if (!VALID_CATEGORIES.includes(aiData.category)) {
      aiData.category = "other";
    }
    // build transaction payload to match DB schema
    const transactionPayload = {
      user_id: finalUserId,
      receipt_id: null,
      transaction_items: JSON.stringify(aiData.transaction_items ?? []),
      merchant: aiData.merchant ?? null,
      total_amount: aiData.total_amount ?? null,
      currency: aiData.currency ?? "USD",
      category: aiData.category,
      transaction_date: aiData.transaction_date ?? todayISO,
      notes: aiData.notes ?? "Recorded via voice transaction",
    };
    if (isAuto) {
      // auto insert into transactions
      const { data: transaction_row, error: txErr } = await supabase
        .from("transactions")
        .insert(transactionPayload)
        .select()
        .single();
      if (txErr) {
        return jsonError("Failed to insert transaction", txErr.message);
      }
      return json({
        success: true,
        mode: "auto",
        transaction: transaction_row,
      });
    }
    //  preview-only: user will edit in frontend
    return json({
      success: true,
      mode: "preview",
      transaction: transactionPayload,
    });
  } catch (err) {
    return jsonError("Unexpected error", err?.message ?? String(err));
  }
});
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
function jsonError(message, details, status = 400) {
  return json(
    {
      error: message,
      details,
    },
    status
  );
}
function uint8ToBase64(arr) {
  let str = "";
  arr.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str);
}
