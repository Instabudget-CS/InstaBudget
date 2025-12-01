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
  if (req.method !== "POST") {
    return jsonError("Method not allowed", null, 405);
  }
  try {
    const body = await req.json();
    const user_id = body?.user_id;
    if (!user_id || typeof user_id !== "string" || !user_id.trim()) {
      return jsonError("Missing or invalid 'user_id'");
    }
    const finalUserId = user_id.trim();
    const timeframeDays = 30;
    const now = new Date();
    const since = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
    const sinceISO = since.toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const { data: budgets, error: budgetErr } = await supabase
      .from("budget_categories")
      .select("category_name, limit_amount")
      .eq("user_id", finalUserId);
    if (budgetErr) {
      return jsonError("Failed to fetch budget categories", budgetErr.message);
    }
    const { data: txs, error: txErr } = await supabase
      .from("transactions")
      .select("category, total_amount, transaction_date")
      .eq("user_id", finalUserId)
      .gte("transaction_date", sinceISO);
    if (txErr) {
      return jsonError("Failed to fetch transactions", txErr.message);
    }
    const safeBudgets = budgets ?? [];
    const safeTxs = txs ?? [];
    const spentByCategory = {};
    let totalSpent = 0;
    for (const tx of safeTxs) {
      const category = VALID_CATEGORIES.includes(tx.category)
        ? tx.category
        : "other";
      const amount = Number(tx.total_amount) || 0;
      if (!spentByCategory[category]) spentByCategory[category] = 0;
      spentByCategory[category] += amount;
      totalSpent += amount;
    }
    let totalLimit = 0;
    const categoryStats = safeBudgets.map((bc) => {
      const cat = bc.category_name;
      const limit = Number(bc.limit_amount) || 0;
      const spent = spentByCategory[cat] ?? 0;
      const percent_used =
        limit > 0 ? Number((spent / limit).toFixed(3)) : null;
      totalLimit += limit;
      return {
        category: cat,
        limit,
        spent,
        percent_used,
      };
    });
    const stats = {
      timeframe_days: timeframeDays,
      total_spent: Number(totalSpent.toFixed(2)),
      total_budget_limit: Number(totalLimit.toFixed(2)),
      categories: categoryStats,
      transaction_count: safeTxs.length,
      since_date: sinceISO,
      today: now.toISOString().slice(0, 10),
    };
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const insightsPrompt = `
You are a friendly budgeting coach.

I will give you JSON with a user's recent spending and budgets for the last ${timeframeDays} days.

JSON:
${JSON.stringify(stats, null, 2)}

Please analyze it and respond with SHORT, CONCRETE insights about how this user is spending.

Rules:
- Focus on helpful, non-judgmental comments.
- Look for: categories close to or over budget, categories far under budget, very unbalanced spending, and any meaningful patterns.
- Include at least 2 insights, at most 3.
- Each insight should be ONE sentence, max ~25 words.
- Avoid generic advice like "save more" without context; tie your advice to the numbers.
- Do NOT mention exact JSON or internal field names; speak like a human coach.

Respond ONLY as valid JSON in this format:
{
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ]
}
`;
    const aiResult = await model.generateContent([
      {
        text: insightsPrompt,
      },
    ]);
    const aiText = aiResult.response.text().trim();
    if (!aiText) {
      return jsonError("Gemini returned an empty response");
    }
    let aiInsights;
    try {
      aiInsights = JSON.parse(aiText.replace(/```json|```/gi, "").trim());
    } catch (err) {
      return jsonError("Failed to parse Gemini insights output", aiText);
    }
    if (
      !aiInsights ||
      !Array.isArray(aiInsights.insights) ||
      aiInsights.insights.length === 0
    ) {
      return jsonError(
        "Gemini did not return a valid insights array",
        aiInsights
      );
    }
    return json({
      success: true,
      timeframe_days: timeframeDays,
      stats,
      insights: aiInsights.insights,
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
