import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import type { User } from 'npm:@supabase/supabase-js@2';

interface Profile {
  cycle_startDate: string;
  cycle_endDate: string;
}
interface Transaction {
  category: string;
  amount: number;
}
interface Category {
  id: string;
  user_id: string;
  created_at: string;
  category_name: string;
  limit_amount: number;
  spent_amount?: number;
}
interface AuthResult {
  supabase: SupabaseClient;
  user: User;
  errorResponse?: Response;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { supabase, user, errorResponse } = await authenticateUser(req);
    if (errorResponse) {
      return errorResponse;
    }
    
    return await handleRequest(req, supabase, user);

  } catch (err) {
    return createErrorResponse(err.message || 'Something went wrong', 500);
  }
});

function createErrorResponse(message: string, status: number) {
  console.error(`Error ${status}: ${message}`);
  return new Response(JSON.stringify({ error: message }), {
    status: status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function authenticateUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { supabase: null, user: null, errorResponse: createErrorResponse('Missing Authorization header', 401) };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { supabase: null, user: null, errorResponse: createErrorResponse('Not authenticated or invalid token', 401) };
  }
  
  return { supabase, user, errorResponse: null };
}

async function handleRequest(req: Request, supabase: SupabaseClient, user: User) {
  switch (req.method) {
    case 'GET':
      return await handleGet(supabase, user);
    case 'POST':
      return await handlePost(supabase, user, req);
    case 'PUT':
      return await handlePut(supabase, user, req);
    case 'DELETE':
      return await handleDelete(supabase, user, req);
    default:
      return createErrorResponse('Method Not Allowed', 405);
  }
}

async function handleGet(supabase: SupabaseClient, user: User) {
  console.log(`GET request from user ${user.id}`);
  
  try {
    const profile = await getUserProfile(supabase, user.id);
    const transactions = await getTransactionsInCycle(supabase, user.id, profile.cycle_startDate, profile.cycle_endDate);
    const spendingTotals = calculateSpending(transactions);
    const categories = await getBudgetCategories(supabase, user.id);
    const categoriesWithSpending = combineCategoriesWithSpending(categories, spendingTotals);

    return new Response(JSON.stringify(categoriesWithSpending), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.message.includes('User profile is missing')) {
      return createErrorResponse(error.message, 400);
    }
    return createErrorResponse(error.message, 500);
  }
}

async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<Profile> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('cycle_startDate, cycle_endDate')
    .eq('user_id', userId) 
    .single();

  if (profileError) {
    throw new Error(`User profile not found: ${profileError.message}`);
  }
  if (!profile.cycle_startDate || !profile.cycle_endDate) {
    throw new Error('User profile is missing cycle_startDate or cycle_endDate.');
  }
  return profile;
}

async function getTransactionsInCycle(supabase: SupabaseClient, userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('category, total_amount: amount')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (txError) {
    throw new Error(`Failed to fetch transactions: ${txError.message}`);
  }
  return transactions;
}

async function getBudgetCategories(supabase: SupabaseClient, userId: string): Promise<Category[]> {
  const { data: categories, error: catError } = await supabase
    .from('budget_categories')
    .select('*')
    .eq('user_id', userId);

  if (catError) {
    throw new Error(`Failed to fetch categories: ${catError.message}`);
  }
  return categories;
}

function calculateSpending(transactions: Transaction[]): Map<string, number> {
  const spendingTotals = new Map<string, number>();
  for (const tx of transactions) {
    const currentTotal = spendingTotals.get(tx.category) || 0;
    spendingTotals.set(tx.category, currentTotal + tx.amount);
  }
  return spendingTotals;
}

function combineCategoriesWithSpending(categories: Category[], spendingTotals: Map<string, number>): Category[] {
  return categories.map((cat) => ({
    ...cat,
    spent_amount: spendingTotals.get(cat.category_name) || 0,
  }));
}

async function handlePost(supabase: SupabaseClient, user: User, req: Request) {
  console.log(`POST request from user ${user.id}`);
  const { category_name, limit_amount } = await req.json();

  if (!category_name || limit_amount == null) {
    return createErrorResponse('Missing category_name or limit_amount', 400);
  }

  const { data, error } = await supabase
    .from('budget_categories')
    .insert({
      category_name,
      limit_amount,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return createErrorResponse(`Failed to create category: ${error.message}`, 500);
  }

  return new Response(JSON.stringify(data), {
    status: 201, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handlePut(supabase: SupabaseClient, user: User, req: Request) {
  console.log(`PUT request from user ${user.id}`);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return createErrorResponse('Missing category ID in query parameters', 400);
  }

  const { category_name, limit_amount } = await req.json();

  const { data, error } = await supabase
    .from('budget_categories')
    .update({
      category_name,
      limit_amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return createErrorResponse(`Failed to update category: ${error.message}`, 500);
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDelete(supabase: SupabaseClient, user: User, req: Request) {
  console.log(`DELETE request from user ${user.id}`);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return createErrorResponse('Missing category ID in query parameters', 400);
  }

  const { error } = await supabase
    .from('budget_categories')
    .delete()
    .eq('id', id);

  if (error) {
    return createErrorResponse(`Failed to delete category: ${error.message}`, 500);
  }

  return new Response(JSON.stringify({ message: 'Category deleted successfully' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
