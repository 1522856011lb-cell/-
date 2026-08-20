import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { BodyProfile, ExerciseLogEntry, FoodDiaryEntry } from "../types";

let supabaseClient: SupabaseClient | null = null;

// Get Supabase URL and Key from import.meta.env or localStorage overrides (for preview configuration)
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || "";
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || "";
  
  const localUrl = localStorage.getItem("fitglow_supabase_url") || "";
  const localKey = localStorage.getItem("fitglow_supabase_key") || "";

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith("http"));
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }
  const { url, anonKey } = getSupabaseCredentials();
  if (url && anonKey && url.startsWith("http")) {
    try {
      supabaseClient = createClient(url, anonKey);
      return supabaseClient;
    } catch (e) {
      console.warn("Failed to initialize Supabase client:", e);
      return null;
    }
  }
  return null;
}

export function resetSupabaseClient() {
  supabaseClient = null;
}

export interface WeightEntry {
  id: string;
  user_id?: string;
  weight_kg: number;
  created_at: string;
  note?: string;
}

// SQL Schema for Supabase Tables (can be copied by user in SQL editor)
export const SUPABASE_SQL_SCHEMA = `-- FitGlow Database Schema
-- Run this in your Supabase SQL Editor:

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  height_cm NUMERIC NOT NULL,
  weight_kg NUMERIC NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  goal TEXT NOT NULL,
  activity_level TEXT NOT NULL,
  taste_preference TEXT DEFAULT '清淡',
  allergies JSONB DEFAULT '[]'::jsonb,
  cooking_time TEXT DEFAULT '15-30分钟',
  budget TEXT DEFAULT '中',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Food Entries Table
CREATE TABLE IF NOT EXISTS public.food_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  food_name TEXT NOT NULL,
  portion_g NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  fiber_g NUMERIC DEFAULT 0,
  meal_type TEXT NOT NULL,
  emoji TEXT DEFAULT '🥗',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Exercise Entries Table
CREATE TABLE IF NOT EXISTS public.exercise_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  duration_min NUMERIC NOT NULL,
  calories_burned NUMERIC NOT NULL,
  category TEXT DEFAULT '有氧燃脂',
  met_value NUMERIC DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Weight Entries Table
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Recipes Table (菜谱与做法缓存)
CREATE TABLE IF NOT EXISTS public.recipes (
  id TEXT PRIMARY KEY,
  dish_name TEXT UNIQUE NOT NULL,
  category TEXT,
  ingredients JSONB NOT NULL,
  steps JSONB NOT NULL,
  cooking_time_min INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  tips TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
`;

// Supabase Data Sync Helpers
export async function syncUserProfile(profile: BodyProfile, userId: string = "user_default") {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        age: profile.age,
        gender: profile.gender,
        goal: profile.goal,
        activity_level: profile.activity_level,
        taste_preference: profile.taste_preference || "清淡",
        allergies: profile.allergies || [],
        cooking_time: profile.cooking_time || "15-30分钟",
        budget: profile.budget || "中",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) console.warn("Supabase upsert profile error:", error);
  } catch (err) {
    console.warn("Supabase sync error:", err);
  }
}

export async function fetchUserProfile(userId: string = "user_default"): Promise<BodyProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error || !data) return null;
    return {
      height_cm: Number(data.height_cm),
      weight_kg: Number(data.weight_kg),
      age: Number(data.age),
      gender: data.gender,
      goal: data.goal,
      activity_level: data.activity_level,
      taste_preference: data.taste_preference,
      allergies: data.allergies || [],
      cooking_time: data.cooking_time,
      budget: data.budget,
      updated_at: data.updated_at,
    };
  } catch (e) {
    return null;
  }
}

export async function syncFoodEntry(entry: FoodDiaryEntry, userId: string = "user_default") {
  const supabase = getSupabase();
  if (!supabase) return;
  try {
    await supabase.from("food_entries").insert({
      user_id: userId,
      food_name: entry.food_name,
      portion_g: entry.portion_g,
      calories: entry.calories,
      protein_g: entry.protein_g,
      carbs_g: entry.carbs_g,
      fat_g: entry.fat_g,
      fiber_g: entry.fiber_g || 0,
      meal_type: entry.meal_type,
      emoji: entry.emoji || "🥗",
      created_at: entry.created_at || new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Supabase food sync error:", e);
  }
}

// 6. Recipe Database Helpers
export async function fetchRecipeFromSupabase(dishName: string): Promise<any | null> {
  const supabase = getSupabase();
  if (!supabase || !dishName) return null;
  try {
    const cleanName = dishName.trim();
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .ilike("dish_name", cleanName)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("Supabase fetch recipe error:", error);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

export async function saveRecipeToSupabase(recipe: any): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !recipe || !recipe.dish_name) return false;
  try {
    const { error } = await supabase.from("recipes").upsert(
      {
        id: recipe.id || `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        dish_name: recipe.dish_name,
        category: recipe.category || "家常菜",
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        cooking_time_min: recipe.cooking_time_min || recipe.cooking_time || recipe.cook_time_min || 15,
        difficulty: recipe.difficulty || "新手友好",
        tips: recipe.tips || (recipe.chef_tips ? recipe.chef_tips.join(" ") : ""),
        image_url: recipe.image_url || "",
        created_at: recipe.created_at || new Date().toISOString(),
      },
      { onConflict: "dish_name" }
    );
    return !error;
  } catch (e) {
    console.warn("Supabase save recipe error:", e);
    return false;
  }
}

