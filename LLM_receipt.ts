import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
if (!Deno.env.get("GEMINI_API_KEY")) {
  throw new Error("GEMINI_API_KEY is not set");
}
const ai = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY"));
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode");
  if (mode === "receipt") return await handleReceipt(req);
  if (mode === "manual") return await handleManual(req);
  return new Response(
    JSON.stringify({
      error: "Missing or invalid mode",
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});
function uint8ToBase64(uint8) {
  let binary = "";
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}
async function handleReceipt(req) {
  try {
    const form = await req.formData();
    const file = form.get("receipt_file");
    const user_id = form.get("user_id");
    let finalUserId;
    if (typeof user_id === "string" && user_id.trim() !== "") {
      // 2. Trim the string and then parse the integer
      finalUserId = user_id.trim();
    } else {
      // Handle the case where user_id is null or not a string
      return new Response(
        JSON.stringify({
          error: "Missing required field",
          details: "The 'user_id' form field is required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({
          error:
            "Missing or invalid file upload. Ensure the key is 'receipt_file'.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const buffer = await file.arrayBuffer();
    const base64Receipt = uint8ToBase64(new Uint8Array(buffer));
    // Get the model instance correctly
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const prompt = `
Please analyze the uploaded receipt image. 
Return the result **STRICTLY** as a single JSON object. 
**DO NOT** include any markdown formatting (like \`\`\`json\`), notes, or conversational text outside of the JSON object.

JSON schema:
${JSON.stringify(
  {
    transaction_items: [
      {
        item: "string (name of the product)",
        price: "number (unit or total price)",
      },
    ],
    merchant: "string (name of the store or person)",
    total_amount: "number (the final amount paid)",
    // 4. currency
    currency: "string (e.g., USD, EUR)",
    category:
      "string (MUST be one of: groceries, dining, transport, shopping, entertainment, utilities, health, education, rent, subscriptions, travel, income, other)",
    transaction_date: "string (YYYY-MM-DD)",
    notes: "string (any helpful observations)",
  },
  null,
  2
)}
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
    const response = await result.response;
    const geminiOutput = response.text();
    if (!geminiOutput || geminiOutput === "") {
      throw new Error("Gemini returned an empty response.");
    }
    let receiptData;
    try {
      const cleanedOutput = geminiOutput
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      receiptData = JSON.parse(cleanedOutput);
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          error: "Failed to parse Gemini response",
          details: parseError.message,
          rawOutput: geminiOutput,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const finalTransactionRecord = {
      user_id: finalUserId,
      ...receiptData,
    };
    return new Response(
      JSON.stringify({
        success: true,
        data: finalTransactionRecord,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Gemini API error",
        details: err.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
async function handleManual(req) {
  try {
    const receiptData = await req.json();
    const { error } = await supabase.from("transactions").insert(receiptData);
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        details: err.message,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
