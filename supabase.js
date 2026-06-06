// ============================================
// EASTGATE ACADEMY — SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = 'https://oflmufiebyyoiatofgpe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbG11ZmllYnl5b2lhdG9mZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Nzk5ODksImV4cCI6MjA5NDQ1NTk4OX0.V2N8rse_HAJLHB6ZMWWVUWhyaFAyGdxl2L-pwoi2Kng';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);