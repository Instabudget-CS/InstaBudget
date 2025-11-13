import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY")!);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode");

  if (mode === "receipt") return await handleReceipt(req);
  if (mode === "manual") return await handleManual(req);

  return new Response(JSON.stringify({ error: "Missing or invalid mode" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
});

async function handleReceipt(req: Request) {
  // TODO: parse form-data, call Gemini, save result
  // need to figure out path for the image

  const form = await req.formData();
  const file = form.get("file") as File;

  if (!file) {
    return new Response(JSON.stringify({ error: "Missing file" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const buffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  const receipt = [
    {
      inlineData: { mimeType: file.type, data: base64 },
    },
    {
      text:
        "Please analyze the uploaded receipt image. Extract all data fields listed in the JSON schema below and return the result strictly as a single JSON object. Ensure 'transaction_items' is an array of objects. " +
        JSON.stringify({
          request_type: "RECEIPT_ANALYSIS",
          output_format: "JSON",
          json_schema: {
            merchant: "string (name of the store or person)",
            transaction_date: "string (YYYY-MM-DD)",
            total_amount: "number (the final amount paid)",
            currency: "string (e.g., USD, EUR)",
            category:
              "enum_placeholder (Please replace this with one of your predefined categories, e.g., 'Groceries', 'Fuel', 'Entertainment')",
            transaction_items: [
              {
                item: "string (name of the product)",
                price: "number (unit or total price of the item)",
              },
            ],
            notes:
              "string (any helpful or interesting observations about the receipt, e.g., location, time, pump number)",
          },
        }),
    },
  ];

  const receiptData = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: receipt,
  });
  const geminiOutput = receiptData.response.text();
  console.log("Gemini raw output", geminiOutput);

  let parsed;
  try {
    parsed = JSON.parse(geminiOutput);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Gemini did not return valid JSON" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (
    !parsed.merchant ||
    !parsed.total_amount ||
    !parsed.currency ||
    !parsed.category
  ) {
    return new Response(
      JSON.stringify({ error: "Incomplete data from Gemini" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  const { data, error } = await supabase
    .from("transactions")
    .insert(Array.isArray(parsed) ? parsed : [parsed]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  // Return success
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleManual(req: Request) {
  // TODO: parse JSON body, save to DB
  const receiptData = await req.json();
  const { error } = await supabase.from("transactions").insert(receiptData);
  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  return new Response(JSON.stringify({ success: true }));
}
