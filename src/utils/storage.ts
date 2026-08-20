import {
  AppTheme,
  BodyProfile,
  DailyDishRecommendation,
  DailyPlanResponse,
  DayPlan,
  ExerciseLogEntry,
  FoodDiaryEntry,
  FridgeItem,
  HealthAssessment,
  MealPlateItem,
  MealReminderSettings,
  UserStreak,
  WeeklyReportData,
  WeightRecord,
  WorkoutPlan,
} from "../types";

export const DEFAULT_PROFILE: BodyProfile = {
  height_cm: 165,
  weight_kg: 52.5,
  age: 24,
  gender: "female",
  activity_level: "light",
  goal: "fat_loss",
  taste_preference: "清淡",
  allergies: ["海鲜"],
  cooking_time: "15-30分钟",
  budget: "中",
  updated_at: new Date().toISOString(),
};

export const DEFAULT_DIARY_ENTRIES: FoodDiaryEntry[] = [
  {
    id: "entry_1",
    food_name: "全麦无油吐司配低脂希腊酸奶",
    portion_g: 160,
    calories: 210,
    protein_g: 14.5,
    carbs_g: 28.0,
    fat_g: 3.2,
    fiber_g: 3.8,
    meal_type: "早餐",
    created_at: new Date().toISOString(),
    emoji: "🍞",
  },
  {
    id: "entry_2",
    food_name: "黑咖啡配几颗新鲜蓝莓",
    portion_g: 80,
    calories: 45,
    protein_g: 0.8,
    carbs_g: 9.5,
    fat_g: 0.3,
    fiber_g: 2.1,
    meal_type: "早餐",
    created_at: new Date().toISOString(),
    emoji: "☕",
  },
  {
    id: "entry_3",
    food_name: "慢烤迷迭香三文鱼三色藜麦碗",
    portion_g: 220,
    calories: 360,
    protein_g: 28.5,
    carbs_g: 32.0,
    fat_g: 11.2,
    fiber_g: 5.5,
    meal_type: "午餐",
    created_at: new Date().toISOString(),
    emoji: "🍣",
  },
  {
    id: "entry_4",
    food_name: "清炒脆爽西兰花胡萝卜",
    portion_g: 120,
    calories: 65,
    protein_g: 3.2,
    carbs_g: 7.0,
    fat_g: 2.1,
    fiber_g: 4.2,
    meal_type: "午餐",
    created_at: new Date().toISOString(),
    emoji: "🥦",
  },
  {
    id: "entry_5",
    food_name: "无糖生椰奇亚籽布丁",
    portion_g: 100,
    calories: 95,
    protein_g: 3.5,
    carbs_g: 7.2,
    fat_g: 4.5,
    fiber_g: 4.8,
    meal_type: "加餐",
    created_at: new Date().toISOString(),
    emoji: "🥥",
  },
];

export const DEFAULT_WEEK_PLAN: DayPlan[] = [
  {
    dayNumber: 1,
    dayName: "周一 · 唤醒日",
    theme: "低GI唤醒 & 全身燃脂",
    mealTip: "主食以全麦和燕麦为主，开启充沛代谢动力",
    workoutFocus: "20min 晨间心肺唤醒 + 核心激活",
    completed: true,
  },
  {
    dayNumber: 2,
    dayName: "周二 · 紧致日",
    theme: "高蛋白蓄能 & 臀腿雕刻",
    mealTip: "午餐增加深海鱼/虾仁等优质蛋白，促进肌纤修复",
    workoutFocus: "30min 居家自重深蹲 & 臀桥塑形",
    completed: true,
  },
  {
    dayNumber: 3,
    dayName: "周三 · 舒缓日",
    theme: "肠道轻盈 & 柔韧拉伸",
    mealTip: "多摄入绿叶深色蔬菜与奇亚籽，促进肠道蠕动",
    workoutFocus: "25min 阴瑜伽舒缓 & 脊柱减压",
    completed: false,
  },
  {
    dayNumber: 4,
    dayName: "周四 · 燃卡日",
    theme: "抗炎控糖 & 上肢美背",
    mealTip: "少油少盐烹饪，可饮用无糖绿茶或黑咖啡",
    workoutFocus: "30min 弹力带开背 & 天鹅臂塑形",
    completed: false,
  },
  {
    dayNumber: 5,
    dayName: "周五 · 充能日",
    theme: "平衡代谢 & 核心稳定",
    mealTip: "晚餐以温沙拉与优质低脂蛋白为主，无负担迎接周末",
    workoutFocus: "20min 普拉提平腹核心对抗",
    completed: false,
  },
  {
    dayNumber: 6,
    dayName: "周六 · 户外日",
    theme: "元气放风 & 户外轻运动",
    mealTip: "自制高颜值野餐轻食碗，保持好心情与松弛感",
    workoutFocus: "45min 户外快走 / 慢跑 / 骑行漫游",
    completed: false,
  },
  {
    dayNumber: 7,
    dayName: "周日 · 焕生日",
    theme: "总结复盘 & 身心疗愈",
    mealTip: "清淡排毒日，多喝温水，摄入新鲜应季浆果",
    workoutFocus: "20min 全身经络放松 & 深度冥想拉伸",
    completed: false,
  },
];

const STORAGE_KEYS = {
  PROFILE: "fitglow_body_profile_v1",
  DIARY: "fitglow_food_diary_v1",
  WORKOUT: "fitglow_active_workout_v1",
  WATER: "fitglow_water_intake_v1",
  WEEK: "fitglow_week_plan_v1",
  MEAL_PLATE: "fitglow_meal_plate_cart_v1",
  STREAK: "fitglow_user_streak_v1",
  RECENT_FOODS: "fitglow_recent_foods_v1",
  EXERCISE_LOGS: "fitglow_exercise_entries_v1",
  THEME: "fitglow_app_theme_v1",
  REMINDERS: "fitglow_meal_reminders_v1",
  UNSPLASH_KEY: "fitglow_unsplash_key_v1",
  FRIDGE: "fitglow_fridge_items_v1",
  HEALTH_ASSESSMENT: "fitglow_health_assessment_v1",
  DAILY_PLAN: "fitglow_daily_plan_v1",
  DAILY_RECOMMENDATION: "fitglow_daily_recommendation_v1",
  WEIGHT_RECORDS: "fitglow_weight_records_v1",
  WEEKLY_REPORT: "fitglow_weekly_report_v1",
};

// Helper to get formatted date string offset by days
function getDateOffsetString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

export const DEFAULT_FRIDGE_ITEMS: FridgeItem[] = [
  {
    id: "fridge_1",
    user_id: "user_default",
    food_name: "鲜嫩鸡胸肉",
    quantity: 400,
    unit: "克",
    category: "肉类",
    storage_method: "冷藏",
    purchase_date: getDateOffsetString(-1),
    shelf_life_days: 2,
    expiry_date: getDateOffsetString(1), // expiring tomorrow (shows warning!)
    created_at: new Date().toISOString(),
    emoji: "🍗",
  },
  {
    id: "fridge_2",
    user_id: "user_default",
    food_name: "沙瓤多汁番茄",
    quantity: 3,
    unit: "个",
    category: "蔬菜",
    storage_method: "冷藏",
    purchase_date: getDateOffsetString(-3),
    shelf_life_days: 5,
    expiry_date: getDateOffsetString(2),
    created_at: new Date().toISOString(),
    emoji: "🍅",
  },
  {
    id: "fridge_3",
    user_id: "user_default",
    food_name: "新鲜绿西蓝花",
    quantity: 300,
    unit: "克",
    category: "蔬菜",
    storage_method: "冷藏",
    purchase_date: getDateOffsetString(-1),
    shelf_life_days: 4,
    expiry_date: getDateOffsetString(3),
    created_at: new Date().toISOString(),
    emoji: "🥦",
  },
  {
    id: "fridge_4",
    user_id: "user_default",
    food_name: "无菌高品质鸡蛋",
    quantity: 8,
    unit: "个",
    category: "蛋奶",
    storage_method: "冷藏",
    purchase_date: getDateOffsetString(-5),
    shelf_life_days: 30,
    expiry_date: getDateOffsetString(25),
    created_at: new Date().toISOString(),
    emoji: "🥚",
  },
  {
    id: "fridge_5",
    user_id: "user_default",
    food_name: "即食纯燕麦片",
    quantity: 500,
    unit: "克",
    category: "主食",
    storage_method: "常温",
    purchase_date: getDateOffsetString(-10),
    shelf_life_days: 365,
    expiry_date: getDateOffsetString(355),
    created_at: new Date().toISOString(),
    emoji: "🥣",
  },
  {
    id: "fridge_6",
    user_id: "user_default",
    food_name: "新鲜蓝莓",
    quantity: 1,
    unit: "盒",
    category: "水果",
    storage_method: "冷藏",
    purchase_date: getDateOffsetString(-3),
    shelf_life_days: 4,
    expiry_date: getDateOffsetString(1), // expiring tomorrow (shows warning!)
    created_at: new Date().toISOString(),
    emoji: "🫐",
  },
  {
    id: "fridge_7",
    user_id: "user_default",
    food_name: "特级初榨橄榄油",
    quantity: 250,
    unit: "瓶",
    category: "调料",
    storage_method: "常温",
    purchase_date: getDateOffsetString(-20),
    shelf_life_days: 365,
    expiry_date: getDateOffsetString(345),
    created_at: new Date().toISOString(),
    emoji: "🫒",
  },
  {
    id: "fridge_8",
    user_id: "user_default",
    food_name: "低脂希腊酸奶",
    quantity: 2,
    unit: "盒",
    category: "蛋奶",
    storage_method: "冷藏",
    purchase_date: getDateOffsetString(-3),
    shelf_life_days: 7,
    expiry_date: getDateOffsetString(4),
    created_at: new Date().toISOString(),
    emoji: "🥛",
  },
];


export const DEFAULT_EXERCISE_LOGS: ExerciseLogEntry[] = [
  {
    id: "ex_log_1",
    exercise_name: "户外慢跑",
    category: "有氧心肺",
    duration_min: 30,
    met_value: 8.0,
    calories_burned: 210,
    logged_at: new Date().toISOString(),
    emoji: "🏃",
  },
  {
    id: "ex_log_2",
    exercise_name: "居家力量训练与塑形",
    category: "抗阻力量",
    duration_min: 25,
    met_value: 6.0,
    calories_burned: 130,
    logged_at: new Date().toISOString(),
    emoji: "🏋️",
  },
];

export const DEFAULT_REMINDERS: MealReminderSettings = {
  enabled: true,
  breakfastTime: "08:00",
  breakfastEnabled: true,
  lunchTime: "12:00",
  lunchEnabled: true,
  dinnerTime: "18:30",
  dinnerEnabled: true,
  snackTime: "15:30",
  snackEnabled: true,
};

export function loadExerciseLogs(): ExerciseLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISE_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load exercise logs", e);
  }
  return DEFAULT_EXERCISE_LOGS;
}

export const getExerciseLogs = loadExerciseLogs;

export function saveExerciseLogs(logs: ExerciseLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISE_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error("Failed to save exercise logs", e);
  }
}

export function saveExerciseEntry(entry: ExerciseLogEntry): void {
  const current = loadExerciseLogs();
  const updated = [entry, ...current];
  saveExerciseLogs(updated);
}

export function deleteExerciseEntry(id: string): void {
  const current = loadExerciseLogs();
  const updated = current.filter((item) => item.id !== id);
  saveExerciseLogs(updated);
}

export function loadTheme(defaultGoal?: string): AppTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme | null;
    if (raw === "girly" || raw === "beast") {
      return raw;
    }
  } catch (e) {
    console.error("Failed to load theme", e);
  }
  return defaultGoal === "muscle_gain" ? "beast" : "girly";
}

export const getTheme = loadTheme;

export function saveTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error("Failed to save theme", e);
  }
}

export function loadReminderSettings(): MealReminderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load reminder settings", e);
  }
  return DEFAULT_REMINDERS;
}

export const getMealReminders = loadReminderSettings;

export function saveReminderSettings(settings: MealReminderSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save reminder settings", e);
  }
}

export const saveMealReminders = saveReminderSettings;


export function loadUnsplashKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.UNSPLASH_KEY) || "";
  } catch (e) {
    return "";
  }
}

export function saveUnsplashKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.UNSPLASH_KEY, key);
  } catch (e) {
    console.error("Failed to save unsplash key", e);
  }
}

export function loadProfile(): BodyProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load profile from storage", e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: BodyProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile to storage", e);
  }
}

export function loadFoodDiary(): FoodDiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIARY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load food diary", e);
  }
  return DEFAULT_DIARY_ENTRIES;
}

export function saveFoodDiary(entries: FoodDiaryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(entries));
  } catch (e) {
    console.error("Failed to save food diary", e);
  }
}

export function loadMealPlate(): MealPlateItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEAL_PLATE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load meal plate", e);
  }
  return [];
}

export function saveMealPlate(items: MealPlateItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEAL_PLATE, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save meal plate", e);
  }
}

export function loadStreak(): UserStreak {
  const todayStr = new Date().toISOString().split("T")[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load streak", e);
  }
  return {
    currentStreak: 3, // initial motivating start
    longestStreak: 5,
    lastActiveDate: todayStr,
    historyDates: [todayStr],
  };
}

export function recordStreakActivity(): UserStreak {
  const current = loadStreak();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (!current.historyDates.includes(todayStr)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    if (current.lastActiveDate === yesterdayStr) {
      newStreak = current.currentStreak + 1;
    } else if (current.lastActiveDate === todayStr) {
      newStreak = current.currentStreak;
    }

    const updated: UserStreak = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, current.longestStreak),
      lastActiveDate: todayStr,
      historyDates: [...current.historyDates, todayStr].slice(-60), // keep last 60 days
    };
    try {
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save streak", e);
    }
    return updated;
  }
  return current;
}

export function loadRecentFoodIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_FOODS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load recent foods", e);
  }
  return ["staple_1", "staple_10", "protein_1", "protein_8", "veg_1"];
}

export function saveRecentFoodId(foodId: string): void {
  try {
    const current = loadRecentFoodIds();
    const filtered = current.filter((id) => id !== foodId);
    const updated = [foodId, ...filtered].slice(0, 8);
    localStorage.setItem(STORAGE_KEYS.RECENT_FOODS, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save recent food", e);
  }
}

export function loadActiveWorkout(): WorkoutPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load active workout", e);
  }
  return null;
}

export function saveActiveWorkout(plan: WorkoutPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(plan));
  } catch (e) {
    console.error("Failed to save active workout", e);
  }
}

export function loadWaterIntake(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER);
    if (raw !== null) {
      return Number(raw);
    }
  } catch (e) {
    console.error("Failed to load water intake", e);
  }
  return 1250; // default 5 glasses of water drunk today
}

export function saveWaterIntake(ml: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATER, String(ml));
  } catch (e) {
    console.error("Failed to save water intake", e);
  }
}

export function loadWeekPlan(): DayPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEK);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load week plan", e);
  }
  return DEFAULT_WEEK_PLAN;
}

export function saveWeekPlan(plan: DayPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEK, JSON.stringify(plan));
  } catch (e) {
    console.error("Failed to save week plan", e);
  }
}

// ---------------- FRIDGE MANAGEMENT UTILS ----------------

export function loadFridgeItems(): FridgeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIDGE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load fridge items", e);
  }
  return DEFAULT_FRIDGE_ITEMS;
}

export function saveFridgeItems(items: FridgeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FRIDGE, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save fridge items", e);
  }
}

export function addFridgeItem(item: FridgeItem): FridgeItem[] {
  const current = loadFridgeItems();
  const updated = [item, ...current];
  saveFridgeItems(updated);
  return updated;
}

export function updateFridgeItem(updatedItem: FridgeItem): FridgeItem[] {
  const current = loadFridgeItems();
  const updated = current.map((item) => (item.id === updatedItem.id ? updatedItem : item));
  saveFridgeItems(updated);
  return updated;
}

export function deleteFridgeItem(id: string): FridgeItem[] {
  const current = loadFridgeItems();
  const updated = current.filter((item) => item.id !== id);
  saveFridgeItems(updated);
  return updated;
}

export function calculateExpiryDate(purchaseDateStr: string, shelfLifeDays: number): string {
  if (!purchaseDateStr || !shelfLifeDays) return "";
  const d = new Date(purchaseDateStr);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Number(shelfLifeDays));
  return d.toISOString().split("T")[0];
}

export function getDaysUntilExpiry(expiryDateStr?: string): number | null {
  if (!expiryDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDateStr);
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ---------------- HEALTH ASSESSMENT STORAGE ----------------

export function loadHealthAssessment(): HealthAssessment | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HEALTH_ASSESSMENT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load health assessment", e);
  }
  return null;
}

export function saveHealthAssessment(assessment: HealthAssessment): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HEALTH_ASSESSMENT, JSON.stringify(assessment));
  } catch (e) {
    console.error("Failed to save health assessment", e);
  }
}

// ---------------- DAILY PLAN STORAGE ----------------

export function loadDailyPlan(): DailyPlanResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_PLAN);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load daily plan", e);
  }
  return null;
}

export function saveDailyPlan(plan: DailyPlanResponse): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error("Failed to save daily plan", e);
  }
}

// ---------------- DAILY RECOMMENDATION DISH STORAGE ----------------

export function loadDailyRecommendation(): DailyDishRecommendation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_RECOMMENDATION);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load daily recommendation", e);
  }
  return null;
}

export function saveDailyRecommendation(dish: DailyDishRecommendation): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_RECOMMENDATION, JSON.stringify(dish));
  } catch (e) {
    console.error("Failed to save daily recommendation", e);
  }
}

// ---------------- WEIGHT RECORDS STORAGE ----------------

export function loadWeightRecords(): WeightRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHT_RECORDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load weight records", e);
  }
  // Default 7-day initial weight trend
  const today = new Date();
  const records: WeightRecord[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const offsetWeight = Number((53.2 - (6 - i) * 0.12).toFixed(1));
    records.push({
      id: `wt_${i}`,
      weight_kg: offsetWeight,
      date: dateStr,
      note: i === 0 ? "今日晨起空腹" : "晨起空腹",
    });
  }
  return records;
}

export function saveWeightRecords(records: WeightRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error("Failed to save weight records", e);
  }
}

// ---------------- WEEKLY REPORT STORAGE ----------------

export function loadWeeklyReport(): WeeklyReportData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_REPORT);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load weekly report", e);
  }
  return null;
}

export function saveWeeklyReport(report: WeeklyReportData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_REPORT, JSON.stringify(report));
  } catch (e) {
    console.error("Failed to save weekly report", e);
  }
}


