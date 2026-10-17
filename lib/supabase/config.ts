// Public Supabase settings for the NunyaLink Admin project. Both values are
// safe to ship to the browser: the publishable key only grants what the
// database's row-level security policies allow. Environment variables
// override the defaults so the project can be swapped without a code change.

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://hlepiswkgsndkuwaiixq.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_vJREkEwNGxcGL_mUVj3Q1A_7RBOro0J";
