export type Gender = "female" | "male";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "heavy";

export type Goal = "fat_loss" | "muscle_gain" | "maintenance";

export type MealType = "早餐" | "午餐" | "晚餐" | "加餐";

export interface BodyProfile {
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: Gender;
  activity_level: ActivityLevel;
  goal: Goal;
  taste_preference?: string; // "辣" | "甜" | "清淡" | "不忌口"
  allergies?: string[]; // ["花生", "海鲜", "乳糖", "生麸质", "牛羊肉"]
  cooking_time?: string; // "<15分钟" | "15-30分钟" | "30分钟以上"
  budget?: string; // "低" | "中" | "高"
  updated_at?: string;
}

export interface WeightRecord {
  id: string;
  weight_kg: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface WeeklyReportData {
  weekly_grade: string;
  avg_daily_calories: number;
  target_calories: number;
  avg_daily_protein: number;
  target_protein: number;
  calorie_adherence_percent: number;
  protein_adherence_percent: number;
  total_workout_minutes: number;
  total_burned_calories: number;
  weight_change_kg: number;
  summary: string;
  highlights: string[];
  next_week_action: string;
  generated_at?: string;
}

export interface MetabolicMetrics {
  bmi: number;
  bmiCategory: {
    label: string;
    color: string;
    badgeBg: string;
    advice: string;
  };
  bodyFatPercent: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    proteinCal: number;
    carbsCal: number;
    fatCal: number;
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  meal_type: MealType;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  tags: string[];
  description: string;
  suggested_portion_g: number;
  emoji: string;
}

export interface FoodDiaryEntry {
  id: string;
  food_name: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  meal_type: MealType;
  created_at: string;
  emoji?: string;
}

export interface DbRecipe {
  id: string;
  dish_name: string;
  category?: string;
  ingredients: { name: string; amount: string; notes?: string; in_fridge?: boolean }[];
  steps: { step_number: number; title?: string; instruction?: string; detail?: string; image_keyword?: string; image_url?: string }[];
  cooking_time_min: number;
  prep_time_min?: number;
  difficulty: string;
  tips?: string;
  image_url?: string;
  image_keyword?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  created_at?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  notes?: string;
}

export interface RecipeStep {
  step_number: number;
  title: string;
  instruction?: string;
  detail: string;
  image_keyword?: string;
  image_url?: string;
}

export interface RecipeDetail {
  recipe_name?: string;
  dish_name?: string;
  subtitle?: string;
  category?: string;
  image_keyword?: string;
  image_url?: string;
  prep_time_min?: number;
  cook_time_min?: number;
  cooking_time_min?: number;
  difficulty: string;
  servings?: number;
  total_calories?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tips?: string;
  chef_tips?: string[];
  created_at?: string;
}

export interface WorkoutExercise {
  id?: string;
  section: string; // "热身激活" | "核心主训" | "舒缓拉伸"
  name: string;
  target_muscle: string;
  reps_or_time: string;
  duration_min?: number;
  met_value: number;
  calories_burned: number;
  instructions: string;
  breath_tip?: string;
  exercise_gif?: string;
  gif_url?: string;
  completed?: boolean;
}

export interface WorkoutPlan {
  plan_title: string;
  subtitle: string;
  location: string;
  duration_min: number;
  total_calories_burned: number;
  intensity_level: string;
  encouragement: string;
  exercises: WorkoutExercise[];
  created_at?: string;
}

export interface ExerciseLogEntry {
  id: string;
  exercise_name: string;
  category: string;
  duration_min: number;
  met_value: number;
  calories_burned: number;
  logged_at: string;
  emoji: string;
}

export type AppTheme = "girly" | "beast";

export interface MealReminderSettings {
  enabled: boolean;
  breakfastTime: string;
  breakfastEnabled: boolean;
  lunchTime: string;
  lunchEnabled: boolean;
  dinnerTime: string;
  dinnerEnabled: boolean;
  snackTime: string;
  snackEnabled: boolean;
}

export interface DayPlan {
  dayNumber: number;
  dayName: string;
  theme: string;
  mealTip: string;
  workoutFocus: string;
  completed: boolean;
  notes?: string;
}

export interface MealPlateItem {
  cartItemId: string;
  foodId: string;
  name: string;
  category: string;
  portion_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  meal_type: MealType;
  emoji: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  historyDates: string[]; // list of YYYY-MM-DD recorded
}

// 1. Fridge Items Management (Supabase-compliant schema)
export type FridgeCategory = "蔬菜" | "肉类" | "蛋奶" | "主食" | "水果" | "调料";
export type StorageMethod = "冷藏" | "冷冻" | "常温";
export type FoodUnit = "克" | "个" | "盒" | "袋" | "瓶";

export interface FridgeItem {
  id: string;
  user_id?: string;
  food_name: string;
  quantity: number;
  unit: string;
  category: FridgeCategory;
  storage_method?: StorageMethod;
  purchase_date?: string; // YYYY-MM-DD
  shelf_life_days?: number;
  expiry_date?: string; // YYYY-MM-DD
  created_at: string;
  emoji?: string;
}

// 2. Daily Health Assessment
export interface HealthAssessmentDetail {
  label: string;
  value: number | string;
  target: number | string;
  unit: string;
  status: "perfect" | "good" | "warning" | "info";
}

export interface HealthAssessment {
  score: number;
  summary: string;
  details: HealthAssessmentDetail[];
  suggestions: string;
  evaluated_at?: string;
}

// 3. Customized Daily Plan
export interface DailyMealSuggestion {
  food_name: string;
  portion_g: number;
  reason: string;
}

export interface DailyMealPlanGroup {
  meal_type: MealType;
  suggestions: DailyMealSuggestion[];
}

export interface DailyPlanWorkout {
  exercise_name: string;
  duration_min: number;
  calories_burned: number;
  instructions: string;
}

export interface DailyPlanResponse {
  meals: DailyMealPlanGroup[];
  workout: DailyPlanWorkout;
  generated_at?: string;
}

// 4. Daily Dish Recommendation
export interface DishIngredient {
  name: string;
  amount: string;
  in_fridge?: boolean;
}

export interface DishStep {
  step_number: number;
  instruction: string;
  image_keyword?: string;
  image_url?: string;
}

export interface DailyDishRecipe {
  ingredients: DishIngredient[];
  steps: string[] | DishStep[];
  cooking_time: number;
  difficulty: string;
  tips: string;
}

export interface DailyDishRecommendation {
  dish_name: string;
  image_keyword: string;
  image_url?: string;
  reason: string;
  recipe: DailyDishRecipe;
  recommended_at?: string;
}

// 5. Fridge Smart Recipe Recommendation (/api/fridge-recipes)
export interface FridgeRecipeRecommendation {
  dish_name: string;
  image_keyword: string;
  image_url?: string;
  required_ingredients: string[];
  missing_ingredients: string[];
  reason: string;
  recipe: {
    cooking_time: number;
    difficulty: string;
    tips: string;
    ingredients: { name: string; amount: string; in_fridge: boolean }[];
    steps: { step_number: number; instruction: string; image_keyword?: string; image_url?: string }[];
  };
}

