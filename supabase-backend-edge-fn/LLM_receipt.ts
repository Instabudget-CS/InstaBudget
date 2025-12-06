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
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    const form = await req.formData();
    const file = form.get("receipt_file");
    const user_id = form.get("user_id");
    const isAuto = form.get("isAuto") === "true";
    // ---- basic validation ----
    if (!user_id || typeof user_id !== "string" || !user_id.trim()) {
      return jsonError("Missing or invalid 'user_id'");
    }
    if (!file || !(file instanceof File)) {
      return jsonError("Missing or invalid 'receipt_file'");
    }
    if (!file.type || !file.type.startsWith("image/")) {
      return jsonError("Uploaded file is not an image");
    }
    const finalUserId = user_id.trim();
    // ---- read file into memory ----
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // ---- upload to storage (receipts bucket) ----
    const fileExt = file.name.split(".").pop() || "png";
    const filePath = `user-${finalUserId}/${crypto.randomUUID()}.${fileExt}`;
    const { data: storageData, error: uploadErr } = await supabase.storage
      .from("receipts")
      .upload(filePath, bytes, {
        contentType: file.type || "image/png",
      });
    if (uploadErr) {
      return jsonError("Failed to upload receipt image", uploadErr.message);
    }
    // ---- insert into receipts table ----
    const { data: receiptRow, error: receiptErr } = await supabase
      .from("receipts")
      .insert({
        user_id: finalUserId,
        storage_path: storageData.path,
      })
      .select()
      .single();
    if (receiptErr) {
      return jsonError("Failed to insert receipts row", receiptErr.message);
    }
    // ---- Gemini call ----
    const base64Receipt = uint8ToBase64(bytes);
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const prompt = `
You are analyzing an image to determine if it is a purchase / payment receipt.

1. If the image is NOT a receipt (e.g. random photo, selfie, landscape, etc.),
   respond with ONLY this JSON shape:
   {
     "is_receipt": false,
     "reason": "short explanation of why it's not a receipt"
   }

2. If the image IS a receipt, respond with ONLY this JSON shape:
   {
     "is_receipt": true,
     "transaction_items": [{ "item": "string", "price": number }],
     "merchant": "string",
     "total_amount": number,
     "currency": "string",
     "category": "string",
     "transaction_date": "YYYY-MM-DD",
     "notes": "string"
   }
   Note: Include taxes and tips as part of an item along with their price in the transactions_items list

STRICT RULES FOR 'category':
- It MUST be exactly one of the following options:
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
- If unsure which category fits, choose "other".

Rules:
- Return ONLY valid JSON. No markdown, no code fences, no comments.
- Do NOT include extra fields outside the specified schema.
`;
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type || "image/png",
          data: base64Receipt,
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
    if (!aiData.is_receipt) {
      return jsonError(
        "Uploaded image is not recognized as a receipt",
        aiData.reason ?? "Gemini classified this image as non-receipt"
      );
    }
    if (
      aiData.total_amount == null ||
      !aiData.merchant ||
      !aiData.transaction_date
    ) {
      return jsonError("Could not reliably extract receipt details", aiData);
    }
    if (!VALID_CATEGORIES.includes(aiData.category)) {
      aiData.category = "other";
    }
    // ---- build transaction payload to match DB schema ----
    const transactionPayload = {
      user_id: finalUserId,
      receipt_id: receiptRow.id,
      transaction_items: JSON.stringify(aiData.transaction_items ?? []),
      merchant: aiData.merchant ?? null,
      total_amount: aiData.total_amount ?? null,
      currency: aiData.currency ?? null,
      category: aiData.category,
      transaction_date: aiData.transaction_date ?? null,
      notes: aiData.notes ?? null,
    };
    if (isAuto) {
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
