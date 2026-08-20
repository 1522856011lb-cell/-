import React, { useState, useMemo } from "react";
import { BodyProfile, FoodDiaryEntry, MealPlateItem, MealType, MetabolicMetrics, UserStreak } from "../types";
import { COMMON_FOODS, CommonFoodItem } from "../data/foods";
import {
  recordStreakActivity,
  saveRecentFoodId,
} from "../utils/storage";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Flame,
  CheckCircle2,
  X,
  PieChart,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  Share2,
  ChefHat,
  Filter,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

interface MealPlannerProps {
  profile: BodyProfile;
  metrics: MetabolicMetrics;
  diaryEntries: FoodDiaryEntry[];
  plateItems: MealPlateItem[];
  userStreak: UserStreak;
  recentFoodIds: string[];
  onUpdatePlateItems: (items: MealPlateItem[]) => void;
  onBatchAddDiaryEntries: (entries: Omit<FoodDiaryEntry, "id" | "created_at">[]) => void;
  onRefreshStreak: (streak: UserStreak) => void;
  onNavigateTab: (tab: "home" | "recommend" | "diary" | "workout" | "plan") => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  profile,
  metrics,
  diaryEntries,
  plateItems,
  userStreak,
  recentFoodIds,
  onUpdatePlateItems,
  onBatchAddDiaryEntries,
  onRefreshStreak,
  onNavigateTab,
}) => {
  const [activeMealTab, setActiveMealTab] = useState<MealType>("早餐");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [quickFilter, setQuickFilter] = useState<"all" | "high_protein" | "low_cal" | "high_fiber">("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mealTypes: MealType[] = ["早餐", "午餐", "晚餐", "加餐"];
  const mealIcons: Record<MealType, string> = {
    "早餐": "🍳",
    "午餐": "🍱",
    "晚餐": "🍲",
    "加餐": "🍇",
  };

  const mealRatios: Record<MealType, { ratio: number; label: string }> = {
    "早餐": { ratio: 0.25, label: "25%" },
    "午餐": { ratio: 0.35, label: "35%" },
    "晚餐": { ratio: 0.30, label: "30%" },
    "加餐": { ratio: 0.10, label: "10%" },
  };

  const categories = ["全部", "主食", "蛋白质", "蔬菜", "水果", "家常菜", "零食", "饮品"];

  // Show cute toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 1. Calculate today's already logged totals
  const loggedCalories = diaryEntries.reduce((sum, e) => sum + e.calories, 0);
  const loggedProtein = Number(diaryEntries.reduce((sum, e) => sum + e.protein_g, 0).toFixed(1));
  const loggedCarbs = Number(diaryEntries.reduce((sum, e) => sum + e.carbs_g, 0).toFixed(1));
  const loggedFat = Number(diaryEntries.reduce((sum, e) => sum + e.fat_g, 0).toFixed(1));
  const loggedFiber = Number(diaryEntries.reduce((sum, e) => sum + e.fiber_g, 0).toFixed(1));

  // 2. Calculate Plate Cart Totals
  const cartCalories = plateItems.reduce((sum, item) => sum + item.calories, 0);
  const cartProtein = Number(plateItems.reduce((sum, item) => sum + item.protein_g, 0).toFixed(1));
  const cartCarbs = Number(plateItems.reduce((sum, item) => sum + item.carbs_g, 0).toFixed(1));
  const cartFat = Number(plateItems.reduce((sum, item) => sum + item.fat_g, 0).toFixed(1));
  const cartFiber = Number(plateItems.reduce((sum, item) => sum + item.fiber_g, 0).toFixed(1));

  const totalProjectedCalories = loggedCalories + cartCalories;
  const totalProjectedProtein = Number((loggedProtein + cartProtein).toFixed(1));
  const totalProjectedCarbs = Number((loggedCarbs + cartCarbs).toFixed(1));
  const totalProjectedFat = Number((loggedFat + cartFat).toFixed(1));
  const totalProjectedFiber = Number((loggedFiber + cartFiber).toFixed(1));

  const targetCalories = metrics.targetCalories;
  const targetProtein = metrics.macros.proteinG;
  const targetCarbs = metrics.macros.carbsG;
  const targetFat = metrics.macros.fatG;

  // Calorie percent calculations
  const loggedCaloriePct = Math.min(100, Math.round((loggedCalories / targetCalories) * 100));
  const projectedCaloriePct = Math.min(100, Math.round((totalProjectedCalories / targetCalories) * 100));

  // Current active meal items in cart + logged
  const activeMealCartItems = plateItems.filter((i) => i.meal_type === activeMealTab);
  const activeMealLoggedItems = diaryEntries.filter((i) => i.meal_type === activeMealTab);

  const activeMealTotalCalories =
    activeMealCartItems.reduce((sum, i) => sum + i.calories, 0) +
    activeMealLoggedItems.reduce((sum, i) => sum + i.calories, 0);

  const activeMealTotalProtein = Number(
    (
      activeMealCartItems.reduce((sum, i) => sum + i.protein_g, 0) +
      activeMealLoggedItems.reduce((sum, i) => sum + i.protein_g, 0)
    ).toFixed(1)
  );

  // Filtered Foods
  const filteredFoods = useMemo(() => {
    return COMMON_FOODS.filter((food) => {
      // Category filter
      if (selectedCategory !== "全部" && food.category !== selectedCategory) {
        return false;
      }

      // Quick filter
      if (quickFilter === "high_protein" && food.proteinPer100g < 10) return false;
      if (quickFilter === "low_cal" && food.caloriesPer100g > 80) return false;
      if (quickFilter === "high_fiber" && food.fiberPer100g < 3) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = food.name.toLowerCase().includes(q);
        const matchesCategory = food.category.toLowerCase().includes(q);
        const matchesTags = food.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, quickFilter]);

  // Recent foods mapping
  const recentFoods = useMemo(() => {
    return recentFoodIds
      .map((id) => COMMON_FOODS.find((f) => f.id === id))
      .filter((f): f is CommonFoodItem => Boolean(f))
      .slice(0, 6);
  }, [recentFoodIds]);

  // Add food item to plate cart for current or chosen meal type
  const handleAddToCart = (food: CommonFoodItem, portionG?: number, mealType: MealType = activeMealTab) => {
    const portion = portionG || food.defaultPortion;
    const ratio = portion / 100;

    const newItem: MealPlateItem = {
      cartItemId: "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      foodId: food.id,
      name: food.name,
      category: food.category,
      portion_g: portion,
      calories: Math.round(food.caloriesPer100g * ratio),
      protein_g: Number((food.proteinPer100g * ratio).toFixed(1)),
      carbs_g: Number((food.carbsPer100g * ratio).toFixed(1)),
      fat_g: Number((food.fatPer100g * ratio).toFixed(1)),
      fiber_g: Number((food.fiberPer100g * ratio).toFixed(1)),
      meal_type: mealType,
      emoji: food.emoji,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      fiberPer100g: food.fiberPer100g,
    };

    onUpdatePlateItems([...plateItems, newItem]);
    saveRecentFoodId(food.id);
    showToast(`已加入「${food.name}」(${portion}g) 到【${mealType}】✨`);
  };

  // Update item portion in cart
  const handleUpdateItemPortion = (cartItemId: string, newPortionG: number) => {
    if (newPortionG <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    const updated = plateItems.map((item) => {
      if (item.cartItemId === cartItemId) {
        const ratio = newPortionG / 100;
        return {
          ...item,
          portion_g: newPortionG,
          calories: Math.round(item.caloriesPer100g * ratio),
          protein_g: Number((item.proteinPer100g * ratio).toFixed(1)),
          carbs_g: Number((item.carbsPer100g * ratio).toFixed(1)),
          fat_g: Number((item.fatPer100g * ratio).toFixed(1)),
          fiber_g: Number((item.fiberPer100g * ratio).toFixed(1)),
        };
      }
      return item;
    });
    onUpdatePlateItems(updated);
  };

  // Update item meal type in cart
  const handleUpdateItemMealType = (cartItemId: string, mealType: MealType) => {
    const updated = plateItems.map((item) =>
      item.cartItemId === cartItemId ? { ...item, meal_type: mealType } : item
    );
    onUpdatePlateItems(updated);
  };

  // Remove single item from cart
  const handleRemoveItem = (cartItemId: string) => {
    const updated = plateItems.filter((i) => i.cartItemId !== cartItemId);
    onUpdatePlateItems(updated);
  };

  // Clear cart
  const handleClearCart = () => {
    onUpdatePlateItems([]);
    showToast("餐盘已清空 🍃");
  };

  // Batch save cart items to food diary (Supabase food_entries compliant)
  const handleSaveToDiary = () => {
    if (plateItems.length === 0) return;

    const newEntries = plateItems.map((item) => ({
      food_name: item.name,
      portion_g: item.portion_g,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      fiber_g: item.fiber_g,
      meal_type: item.meal_type,
      emoji: item.emoji,
    }));

    onBatchAddDiaryEntries(newEntries);
    onUpdatePlateItems([]);
    setIsCartOpen(false);

    // Record streak
    const updatedStreak = recordStreakActivity();
    onRefreshStreak(updatedStreak);

    // Confetti celebration
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FF6B8B", "#FFD166", "#06D6A0", "#118AB2", "#FFB7B2"],
      });
    } catch (e) {
      console.log("confetti error", e);
    }

    showToast(`🎉 成功入账 ${newEntries.length} 项美食！已按餐次精准保存！`);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-5xl mx-auto px-4 pt-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[#3E3230] text-white text-xs sm:text-sm font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFD166]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Progress Rings */}
      <div
        id="meal-planner-header"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-[#FFFBF6] to-[#F5F8FF] p-5 sm:p-7 border border-[#FFE4E8] shadow-card"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#FFCCD5] text-xs font-bold text-[#D53F8C] shadow-xs mb-2">
              <span>🍽️ 今日餐盘 · 购物车式饮食规划</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B8B]"></span>
              <span className="text-[#38A169]">120+ 中华地道美食库</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E3230] tracking-tight flex items-center gap-2">
              <span>挑选今日美食，科学控卡</span>
              <span className="text-2xl">✨</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#7D6B68] font-medium mt-1">
              像逛超市一样把爱吃的食物加入餐盘，自由调整克数，一键入账今日饮食！
            </p>
          </div>

          {/* Streak & Weekly Report Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 border border-[#FFCCD5] shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B8B] to-[#FF8DA1] flex items-center justify-center text-white text-sm font-bold shadow-xs">
                <Flame className="w-4 h-4 fill-current text-white animate-bounce" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#3E3230] flex items-center gap-1">
                  <span>连续打卡</span>
                  <span className="text-[#E03164]">{userStreak.currentStreak}</span>
                  <span>天</span>
                </div>
                <div className="text-[10px] text-[#9B8986]">历史最高 {userStreak.longestStreak} 天</div>
              </div>
            </div>

            <button
              id="btn-weekly-report"
              onClick={() => setIsWeeklyReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFF0F3] border border-[#FFCCD5] text-xs sm:text-sm font-bold text-[#D53F8C] shadow-xs hover:shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#D53F8C]" />
              <span>生成轻体周报</span>
            </button>
          </div>
        </div>

        {/* Dynamic Macro Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white/80 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-[#FFEAEA]">
          {/* Calorie Progress Ring / Summary */}
          <div className="md:col-span-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-[#F7EBE8] pb-3 md:pb-0 md:pr-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
              {/* Circular Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F3E8E6"
                  strokeWidth="8"
                />
                {/* Projected / Cart segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#FFCCD5"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * projectedCaloriePct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                {/* Already Logged segment */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#FF6B8B"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * loggedCaloriePct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-semibold text-[#8C7A78]">全天进度</span>
                <span className="text-base sm:text-lg font-black text-[#3E3230] leading-none">
                  {projectedCaloriePct}%
                </span>
                {cartCalories > 0 && (
                  <span className="text-[9px] font-bold text-[#D53F8C] leading-none mt-0.5">
                    +{cartCalories}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs text-[#8C7A78]">
                <span>今日热量目标</span>
                <span className="font-bold text-[#3E3230]">{targetCalories} kcal</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[#FF6B8B] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B8B]"></span>
                  已入账
                </span>
                <span className="font-bold text-[#3E3230]">{loggedCalories} kcal</span>
              </div>
              {cartCalories > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-[#D53F8C] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#FFCCD5]"></span>
                    餐盘待存
                  </span>
                  <span className="font-bold text-[#D53F8C]">+{cartCalories} kcal</span>
                </div>
              )}
              <div className="pt-1 text-[11px] font-medium text-[#7D6B68]">
                {targetCalories - totalProjectedCalories >= 0 ? (
                  <span>
                    预计剩余可用{" "}
                    <strong className="text-[#38A169]">
                      {targetCalories - totalProjectedCalories} kcal
                    </strong>
                  </span>
                ) : (
                  <span className="text-[#E53E3E]">
                    预计超出目标 {totalProjectedCalories - targetCalories} kcal
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Macro Progress Bars */}
          <div className="md:col-span-7 space-y-2.5">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#3E3230] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B8B]"></span>
                  蛋白质 (P)
                </span>
                <span className="text-[#7D6B68]">
                  <span className="text-[#FF6B8B] font-bold">
                    {totalProjectedProtein}g
                  </span>{" "}
                  / {targetProtein}g ({Math.round((totalProjectedProtein / targetProtein) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F5E6E8] overflow-hidden flex">
                <div
                  className="h-full bg-[#FF6B8B] rounded-l-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (loggedProtein / targetProtein) * 100)}%` }}
                ></div>
                {cartProtein > 0 && (
                  <div
                    className="h-full bg-[#FFB7B2] transition-all duration-300"
                    style={{ width: `${Math.min(100 - (loggedProtein / targetProtein) * 100, (cartProtein / targetProtein) * 100)}%` }}
                  ></div>
                )}
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#3E3230] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#ED8936]"></span>
                  碳水化合物 (C)
                </span>
                <span className="text-[#7D6B68]">
                  <span className="text-[#ED8936] font-bold">
                    {totalProjectedCarbs}g
                  </span>{" "}
                  / {targetCarbs}g ({Math.round((totalProjectedCarbs / targetCarbs) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FEF0E6] overflow-hidden flex">
                <div
                  className="h-full bg-[#ED8936] rounded-l-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (loggedCarbs / targetCarbs) * 100)}%` }}
                ></div>
                {cartCarbs > 0 && (
                  <div
                    className="h-full bg-[#FBD38D] transition-all duration-300"
                    style={{ width: `${Math.min(100 - (loggedCarbs / targetCarbs) * 100, (cartCarbs / targetCarbs) * 100)}%` }}
                  ></div>
                )}
              </div>
            </div>

            {/* Fat & Fiber Mini Dual Bar */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-0.5">
                  <span className="text-[#805AD5]">优质脂肪 (F)</span>
                  <span className="text-[#8C7A78]">
                    {totalProjectedFat}/{targetFat}g
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#F3E8FF] overflow-hidden">
                  <div
                    className="h-full bg-[#805AD5] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalProjectedFat / targetFat) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-0.5">
                  <span className="text-[#38A169]">膳食纤维 (Fiber)</span>
                  <span className="text-[#8C7A78]">
                    {totalProjectedFiber}/{metrics.macros.fiberG}g
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E6F4EA] overflow-hidden">
                  <div
                    className="h-full bg-[#38A169] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalProjectedFiber / metrics.macros.fiberG) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four-Meal Tab Switcher (早餐/午餐/晚餐/加餐) */}
      <div id="meal-type-tabs-container" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#3E3230] uppercase tracking-wider">选择规划餐次</span>
            <span className="text-[11px] text-[#8C7A78]">（添加食物前请先选择餐次标签）</span>
          </div>
          {plateItems.length > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-xs font-bold text-[#D53F8C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>待入账清单 ({plateItems.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 4 Large Meal Tabs with Recommended and Remaining Intake */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {mealTypes.map((mt) => {
            const isSelected = activeMealTab === mt;
            const ratioInfo = mealRatios[mt];
            const itemsInCartForMeal = plateItems.filter((i) => i.meal_type === mt);
            const itemsLoggedForMeal = diaryEntries.filter((i) => i.meal_type === mt);

            const mealCals =
              itemsInCartForMeal.reduce((s, i) => s + i.calories, 0) +
              itemsLoggedForMeal.reduce((s, i) => s + i.calories, 0);

            const mealProtein = Number(
              (
                itemsInCartForMeal.reduce((s, i) => s + i.protein_g, 0) +
                itemsLoggedForMeal.reduce((s, i) => s + i.protein_g, 0)
              ).toFixed(1)
            );
            const mealCarbs = Number(
              (
                itemsInCartForMeal.reduce((s, i) => s + i.carbs_g, 0) +
                itemsLoggedForMeal.reduce((s, i) => s + i.carbs_g, 0)
              ).toFixed(1)
            );
            const mealFat = Number(
              (
                itemsInCartForMeal.reduce((s, i) => s + i.fat_g, 0) +
                itemsLoggedForMeal.reduce((s, i) => s + i.fat_g, 0)
              ).toFixed(1)
            );

            // Recommended calculations based on ratio (25%, 35%, 30%, 10%)
            const recCals = Math.round(targetCalories * ratioInfo.ratio);
            const recProtein = Number((targetProtein * ratioInfo.ratio).toFixed(1));
            const recCarbs = Number((targetCarbs * ratioInfo.ratio).toFixed(1));
            const recFat = Number((targetFat * ratioInfo.ratio).toFixed(1));

            // Remaining amounts (Recommended - Consumed)
            const remCals = recCals - mealCals;
            const remProtein = Number((recProtein - mealProtein).toFixed(1));
            const remCarbs = Number((recCarbs - mealCarbs).toFixed(1));
            const remFat = Number((recFat - mealFat).toFixed(1));

            return (
              <button
                key={mt}
                id={`meal-tab-${mt}`}
                onClick={() => setActiveMealTab(mt)}
                className={`relative p-3.5 rounded-3xl border transition-all duration-200 text-left flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF0F3] border-[#FF6B8B] shadow-md scale-102 ring-2 ring-[#FFCCD5]"
                    : "bg-white hover:bg-[#FFFDF9] border-[#EEDDD9] shadow-2xs hover:border-[#FFCCD5]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl">{mealIcons[mt]}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#D53F8C] text-[10px] font-bold">
                      {ratioInfo.label}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF6B8B] text-white text-[10px] font-black shadow-xs">
                      当前选中
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-[#8C7A78]">
                      {itemsInCartForMeal.length + itemsLoggedForMeal.length} 项
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-extrabold ${
                        isSelected ? "text-[#D53F8C]" : "text-[#3E3230]"
                      }`}
                    >
                      {mt}
                    </h3>
                    <div className="text-[11px] text-[#7D6B68] font-medium">
                      推荐 <span className="font-bold text-[#3E3230]">{recCals}</span> kcal
                    </div>
                  </div>

                  {/* Macros target tag */}
                  <div className="text-[10px] text-[#8C7A78] flex items-center justify-between border-t border-[#F5EAEA] pt-1">
                    <span>
                      推荐: 蛋<b className="text-[#3E3230]">{recProtein}</b> 碳<b className="text-[#3E3230]">{recCarbs}</b> 脂<b className="text-[#3E3230]">{recFat}</b>g
                    </span>
                  </div>

                  {/* Intake & Real-time Remaining Status */}
                  <div className="flex items-center justify-between pt-0.5 text-xs font-bold">
                    <span className="text-[#FF6B8B]">
                      已选 {mealCals} <span className="text-[10px] font-normal text-[#8C7A78]">kcal</span>
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        remCals >= 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {remCals >= 0 ? `余 ${remCals} kcal` : `超 ${Math.abs(remCals)} kcal`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Meal Planned Food Entries & Remaining Metrics Panel */}
        <div
          id={`active-meal-panel-${activeMealTab}`}
          className="rounded-3xl bg-white border border-[#FFE4E8] p-4 sm:p-5 shadow-card space-y-4"
        >
          {/* Header with Title and Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F7EBE8] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{mealIcons[activeMealTab]}</span>
              <div>
                <h4 className="font-black text-sm text-[#3E3230] flex items-center gap-2">
                  <span>【{activeMealTab}】推荐与规划摄入</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#D53F8C] font-bold">
                    推荐占比 {mealRatios[activeMealTab].label}
                  </span>
                </h4>
                <p className="text-[11px] text-[#8C7A78] mt-0.5">
                  已规划 {activeMealCartItems.length + activeMealLoggedItems.length} 项美食 · 实时计算剩余摄入空间
                </p>
              </div>
            </div>

            {activeMealCartItems.length > 0 && (
              <button
                onClick={handleSaveToDiary}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF6B8B] to-[#FF8DA1] text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>一键入账【{activeMealTab}】({activeMealCartItems.length}项)</span>
              </button>
            )}
          </div>

          {/* Real-time Intake vs Target & Remaining 4-Card Grid */}
          {(() => {
            const ratio = mealRatios[activeMealTab].ratio;
            const recC = Math.round(targetCalories * ratio);
            const recP = Number((targetProtein * ratio).toFixed(1));
            const recCarb = Number((targetCarbs * ratio).toFixed(1));
            const recF = Number((targetFat * ratio).toFixed(1));

            const curC = activeMealCartItems.reduce((s, i) => s + i.calories, 0) + activeMealLoggedItems.reduce((s, i) => s + i.calories, 0);
            const curP = Number((activeMealCartItems.reduce((s, i) => s + i.protein_g, 0) + activeMealLoggedItems.reduce((s, i) => s + i.protein_g, 0)).toFixed(1));
            const curCarb = Number((activeMealCartItems.reduce((s, i) => s + i.carbs_g, 0) + activeMealLoggedItems.reduce((s, i) => s + i.carbs_g, 0)).toFixed(1));
            const curF = Number((activeMealCartItems.reduce((s, i) => s + i.fat_g, 0) + activeMealLoggedItems.reduce((s, i) => s + i.fat_g, 0)).toFixed(1));

            const remC = recC - curC;
            const remP = Number((recP - curP).toFixed(1));
            const remCarb = Number((recCarb - curCarb).toFixed(1));
            const remF = Number((recF - curF).toFixed(1));

            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#FFF9FA] p-3 rounded-2xl border border-[#FFE8EC]">
                {/* Calories Card */}
                <div className="bg-white p-2.5 rounded-xl border border-[#FFE4E8] shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-0.5">
                    <span>🔥 本餐热量</span>
                    <span className="text-[10px] text-[#D53F8C] font-semibold">推荐 {recC} kcal</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">
                    {curC} <span className="text-[10px] font-normal text-gray-400">kcal</span>
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${remC >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {remC >= 0 ? `剩余 ${remC} kcal` : `已超 ${Math.abs(remC)} kcal`}
                  </div>
                </div>

                {/* Protein Card */}
                <div className="bg-white p-2.5 rounded-xl border border-[#FFE4E8] shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#6C5CE7] mb-0.5">
                    <span>🥩 蛋白质</span>
                    <span className="text-[10px] font-semibold text-gray-400">推荐 {recP}g</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">
                    {curP} <span className="text-[10px] font-normal text-gray-400">g</span>
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${remP >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {remP >= 0 ? `剩余 ${remP}g` : `已超 ${Math.abs(remP)}g`}
                  </div>
                </div>

                {/* Carbs Card */}
                <div className="bg-white p-2.5 rounded-xl border border-[#FFE4E8] shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#DD6B20] mb-0.5">
                    <span>🌾 碳水</span>
                    <span className="text-[10px] font-semibold text-gray-400">推荐 {recCarb}g</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">
                    {curCarb} <span className="text-[10px] font-normal text-gray-400">g</span>
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${remCarb >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {remCarb >= 0 ? `剩余 ${remCarb}g` : `已超 ${Math.abs(remCarb)}g`}
                  </div>
                </div>

                {/* Fat Card */}
                <div className="bg-white p-2.5 rounded-xl border border-[#FFE4E8] shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#38A169] mb-0.5">
                    <span>🥑 脂肪</span>
                    <span className="text-[10px] font-semibold text-gray-400">推荐 {recF}g</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">
                    {curF} <span className="text-[10px] font-normal text-gray-400">g</span>
                  </div>
                  <div className={`text-[10px] font-bold mt-1 ${remF >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {remF >= 0 ? `剩余 ${remF}g` : `已超 ${Math.abs(remF)}g`}
                  </div>
                </div>
              </div>
            );
          })()}

          {activeMealCartItems.length === 0 && activeMealLoggedItems.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8C7A78] space-y-1">
              <p>🍳 当前【{activeMealTab}】暂无添加食物，快在下方搜索或挑选美食吧！</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {/* Items in Cart for this meal */}
              {activeMealCartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="rounded-2xl p-2.5 sm:p-3 bg-[#FFFDF9] border border-[#F5E5E2] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-[#3E3230] flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFF0F3] text-[#D53F8C] font-semibold">
                          待存
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8C7A78]">
                        {item.calories} kcal · P:{item.protein_g}g C:{item.carbs_g}g F:{item.fat_g}g
                      </div>
                    </div>
                  </div>

                  {/* Stepper & Delete */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white border border-[#EEDDD9] rounded-xl p-0.5">
                      <button
                        onClick={() => handleUpdateItemPortion(item.cartItemId, item.portion_g - 20)}
                        className="w-5 h-5 rounded-lg bg-[#FAF4F2] hover:bg-[#FFE4E8] text-[#3E3230] flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={item.portion_g}
                        onChange={(e) =>
                          handleUpdateItemPortion(item.cartItemId, Number(e.target.value) || 0)
                        }
                        className="w-10 text-center text-xs font-bold text-[#3E3230] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#8C7A78] pr-1">g</span>
                      <button
                        onClick={() => handleUpdateItemPortion(item.cartItemId, item.portion_g + 20)}
                        className="w-5 h-5 rounded-lg bg-[#FAF4F2] hover:bg-[#FFE4E8] text-[#3E3230] flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.cartItemId)}
                      className="p-1 rounded-lg text-[#A89A97] hover:text-[#E53E3E] hover:bg-[#FFF5F5] cursor-pointer"
                      title="移除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Already logged entries for this meal */}
              {activeMealLoggedItems.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl p-2.5 sm:p-3 bg-white border border-[#EBEBEB] flex items-center justify-between gap-2 opacity-85"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{entry.emoji || "🍽️"}</span>
                    <div>
                      <div className="text-xs font-bold text-[#3E3230] flex items-center gap-1.5">
                        <span>{entry.food_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E6F4EA] text-[#2F855A] font-semibold">
                          已入账
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8C7A78]">
                        {entry.portion_g}g · {entry.calories} kcal · P:{entry.protein_g}g C:{entry.carbs_g}g
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#38A169]">✓ 已记录</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Quick Add "最近常吃" Section */}
      {recentFoods.length > 0 && (
        <div id="quick-add-section" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#3E3230] flex items-center gap-1.5">
              <span>⚡ 最近常吃 · 快捷加餐盘</span>
              <span className="text-xs font-normal text-[#8C7A78]">(点击直接加入)</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {recentFoods.map((food) => (
              <button
                key={`recent_${food.id}`}
                id={`quick-add-${food.id}`}
                onClick={() => handleAddToCart(food)}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFF5F7] border border-[#F2E4E1] hover:border-[#FFCCD5] shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer text-left active:scale-95"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{food.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-[#3E3230] group-hover:text-[#FF6B8B] transition-colors">
                    {food.name}
                  </div>
                  <div className="text-[10px] text-[#8C7A78]">
                    {food.defaultPortion}g · {Math.round(food.caloriesPer100g * (food.defaultPortion / 100))} kcal
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#FFF0F3] text-[#FF6B8B] flex items-center justify-center group-hover:bg-[#FF6B8B] group-hover:text-white transition-all ml-1">
                  <Plus className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Search & Categories Filter */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89A97]" />
          <input
            id="food-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索中国常见食物，如：米饭、番茄炒蛋、鸡胸肉、西兰花、拿铁、蓝莓..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-[#EEDDD9] text-sm text-[#3E3230] placeholder:text-[#A89A97] focus:outline-none focus:border-[#FF6B8B] focus:ring-2 focus:ring-[#FFE4E8] shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#A89A97] hover:text-[#3E3230] hover:bg-[#F2E4E1]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills & Quick Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          {/* Main Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-filter-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#FF6B8B] text-white shadow-xs scale-102"
                    : "bg-white text-[#7D6B68] hover:bg-[#FFF0F3] border border-[#F2E4E1]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Feature Filter Chips */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="filter-high-protein"
              onClick={() => setQuickFilter(quickFilter === "high_protein" ? "all" : "high_protein")}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                quickFilter === "high_protein"
                  ? "bg-[#FFF0F3] text-[#D53F8C] border border-[#FFCCD5]"
                  : "bg-white text-[#8C7A78] border border-[#EEDDD9] hover:bg-gray-50"
              }`}
            >
              🥩 高蛋白
            </button>
            <button
              id="filter-low-cal"
              onClick={() => setQuickFilter(quickFilter === "low_cal" ? "all" : "low_cal")}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                quickFilter === "low_cal"
                  ? "bg-[#E6F4EA] text-[#2F855A] border border-[#A8E6CF]"
                  : "bg-white text-[#8C7A78] border border-[#EEDDD9] hover:bg-gray-50"
              }`}
            >
              🥗 低卡刮油
            </button>
            <button
              id="filter-high-fiber"
              onClick={() => setQuickFilter(quickFilter === "high_fiber" ? "all" : "high_fiber")}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                quickFilter === "high_fiber"
                  ? "bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE]"
                  : "bg-white text-[#8C7A78] border border-[#EEDDD9] hover:bg-gray-50"
              }`}
            >
              🌾 高膳食纤维
            </button>
          </div>
        </div>
      </div>

      {/* 4. Food Cards Grid */}
      <div id="food-library-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredFoods.map((food) => {
          const portionCal = Math.round(food.caloriesPer100g * (food.defaultPortion / 100));
          const isSelectedInCart = plateItems.some((i) => i.foodId === food.id);

          return (
            <div
              key={food.id}
              id={`food-card-${food.id}`}
              className="group relative rounded-3xl bg-white p-4 border border-[#F2E4E1] hover:border-[#FFCCD5] shadow-card hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FFF5F7] to-[#FFF9F5] border border-[#FFE4E8] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-xs">
                      {food.emoji}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#3E3230] leading-snug group-hover:text-[#FF6B8B] transition-colors">
                        {food.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded-md bg-[#FFF5F7] text-[10px] font-bold text-[#D53F8C]">
                          {food.category}
                        </span>
                        <span className="text-[11px] font-medium text-[#8C7A78]">
                          默认 {food.defaultPortion}g / 约 {portionCal} kcal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    id={`btn-add-food-${food.id}`}
                    onClick={() => handleAddToCart(food)}
                    className="shrink-0 w-8 h-8 rounded-2xl bg-[#FFF0F3] hover:bg-[#FF6B8B] text-[#FF6B8B] hover:text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-xs"
                    title="加入今日餐盘"
                  >
                    <Plus className="w-4 h-4 font-bold" />
                  </button>
                </div>

                {/* Nutritional Badges */}
                <div className="grid grid-cols-4 gap-1 py-2 my-1 border-t border-b border-[#FAF2F0] text-center text-[10px]">
                  <div className="bg-[#FFF5F7] rounded-xl py-1">
                    <div className="text-[#9B8986]">热量/100g</div>
                    <div className="font-bold text-[#FF6B8B]">{food.caloriesPer100g} <span className="font-normal text-[8px]">kcal</span></div>
                  </div>
                  <div className="bg-[#FFF9F5] rounded-xl py-1">
                    <div className="text-[#9B8986]">蛋白质</div>
                    <div className="font-bold text-[#ED8936]">{food.proteinPer100g}g</div>
                  </div>
                  <div className="bg-[#F7F5FF] rounded-xl py-1">
                    <div className="text-[#9B8986]">碳水</div>
                    <div className="font-bold text-[#805AD5]">{food.carbsPer100g}g</div>
                  </div>
                  <div className="bg-[#F5FFF8] rounded-xl py-1">
                    <div className="text-[#9B8986]">脂肪</div>
                    <div className="font-bold text-[#38A169]">{food.fatPer100g}g</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {food.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-[#FAF4F2] text-[10px] font-medium text-[#7D6B68]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Meal Type Add */}
              <div className="mt-3 pt-2.5 border-t border-[#FAF2F0] flex items-center justify-between text-[11px]">
                <span className="text-[#8C7A78] font-medium">快捷指定餐次：</span>
                <div className="flex items-center gap-1">
                  {(["早餐", "午餐", "晚餐", "加餐"] as MealType[]).map((mt) => (
                    <button
                      key={mt}
                      onClick={() => handleAddToCart(food, food.defaultPortion, mt)}
                      className="px-1.5 py-0.5 rounded-lg bg-gray-50 hover:bg-[#FFE4E8] text-[#7D6B68] hover:text-[#D53F8C] text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      {mt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFoods.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#F2E4E1] p-6 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="font-bold text-base text-[#3E3230]">未找到符合条件的食物</h3>
          <p className="text-xs text-[#8C7A78] max-w-sm mx-auto">
            尝试更换搜索词，或者切换全部分类看看！您也可以直接在「今日饮食」中使用 AI 智能估算任意自制餐品。
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("全部");
              setQuickFilter("all");
            }}
            className="px-4 py-2 rounded-2xl bg-[#FFF0F3] text-[#D53F8C] text-xs font-bold hover:bg-[#FFE4E8]"
          >
            重置筛选条件
          </button>
        </div>
      )}

      {/* 5. Sticky / Floating Cart Bottom Bar */}
      <div
        id="floating-cart-bar"
        className="fixed bottom-18 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg"
      >
        <div className="relative overflow-hidden rounded-3xl bg-[#3E3230]/95 backdrop-blur-md text-white p-3.5 sm:p-4 shadow-2xl border border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B8B] to-[#FF9AA2] flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-6 h-6" />
              </div>
              {plateItems.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FFD166] text-[#3E3230] text-[11px] font-black flex items-center justify-center shadow-xs animate-pulse">
                  {plateItems.length}
                </span>
              )}
            </div>
            <div>
              <div className="text-xs text-white/80 font-medium flex items-center gap-1.5">
                <span>今日餐盘 ({plateItems.length} 项)</span>
                {plateItems.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-[#FFD166]">
                    待入账
                  </span>
                )}
              </div>
              <div className="text-base sm:text-lg font-black tracking-tight flex items-baseline gap-2">
                <span>{cartCalories} kcal</span>
                <span className="text-xs text-white/70 font-normal">
                  蛋白 {cartProtein}g · 碳水 {cartCarbs}g
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-cart-drawer"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B8B] to-[#FF8DA1] text-white text-xs sm:text-sm font-bold shadow-glow-pink hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>查看餐盘</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Plate Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div
            id="cart-drawer-modal"
            className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-3xl bg-white border border-[#FFE4E8] shadow-2xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#F7EBE8] bg-gradient-to-r from-[#FFF5F7] to-[#FFF9F5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#FFE4E8] text-[#D53F8C] flex items-center justify-center text-lg">
                  🍽️
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3E3230]">今日待入账餐盘</h3>
                  <p className="text-xs text-[#8C7A78]">
                    自由调整每道菜的食用克数与餐次，确认后一键保存
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {plateItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="px-2.5 py-1 rounded-xl text-xs text-[#E53E3E] hover:bg-[#FFF5F5] font-semibold cursor-pointer"
                  >
                    清空
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full text-[#8C7A78] hover:bg-[#F2E4E1] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {plateItems.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="text-4xl">🛒</div>
                  <h4 className="font-bold text-sm text-[#3E3230]">餐盘还是空的哦~</h4>
                  <p className="text-xs text-[#8C7A78]">
                    去食物库挑选您今天想吃的美味食材或家常菜吧！
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-4 py-2 rounded-2xl bg-[#FF6B8B] text-white text-xs font-bold hover:opacity-90"
                  >
                    去挑选食物
                  </button>
                </div>
              ) : (
                plateItems.map((item) => (
                  <div
                    key={item.cartItemId}
                    id={`cart-item-${item.cartItemId}`}
                    className="rounded-2xl p-3.5 bg-[#FFFDF9] border border-[#F2E4E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <div className="font-bold text-sm text-[#3E3230]">{item.name}</div>
                        <div className="text-xs text-[#8C7A78] flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-[#FF6B8B]">{item.calories} kcal</span>
                          <span>·</span>
                          <span>
                            P:{item.protein_g}g C:{item.carbs_g}g F:{item.fat_g}g
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Meal Type & Portion Stepper */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#FAF0EE]">
                      {/* Meal Type Selector */}
                      <select
                        value={item.meal_type}
                        onChange={(e) =>
                          handleUpdateItemMealType(item.cartItemId, e.target.value as MealType)
                        }
                        className="px-2 py-1 rounded-xl bg-white border border-[#EEDDD9] text-xs font-bold text-[#3E3230] focus:outline-none focus:border-[#FF6B8B]"
                      >
                        <option value="早餐">早餐</option>
                        <option value="午餐">午餐</option>
                        <option value="晚餐">晚餐</option>
                        <option value="加餐">加餐</option>
                      </select>

                      {/* Gram Stepper */}
                      <div className="flex items-center gap-1 bg-white border border-[#EEDDD9] rounded-xl p-0.5">
                        <button
                          onClick={() => handleUpdateItemPortion(item.cartItemId, item.portion_g - 20)}
                          className="w-6 h-6 rounded-lg bg-[#FAF4F2] hover:bg-[#FFE4E8] text-[#3E3230] flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={item.portion_g}
                          onChange={(e) =>
                            handleUpdateItemPortion(item.cartItemId, Number(e.target.value) || 0)
                          }
                          className="w-12 text-center text-xs font-bold text-[#3E3230] focus:outline-none"
                        />
                        <span className="text-[10px] text-[#8C7A78] pr-1">g</span>
                        <button
                          onClick={() => handleUpdateItemPortion(item.cartItemId, item.portion_g + 20)}
                          className="w-6 h-6 rounded-lg bg-[#FAF4F2] hover:bg-[#FFE4E8] text-[#3E3230] flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delete Item */}
                      <button
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        className="p-1.5 rounded-xl text-[#A89A97] hover:text-[#E53E3E] hover:bg-[#FFF5F5] cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Actions */}
            {plateItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#F7EBE8] bg-[#FFFBF9] space-y-3">
                {/* Summary Row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#7D6B68]">餐盘预计总计：</span>
                  <div className="text-right">
                    <span className="text-base font-black text-[#3E3230]">{cartCalories} kcal</span>
                    <span className="text-[11px] text-[#8C7A78] ml-2">
                      (蛋白质 {cartProtein}g / 碳水 {cartCarbs}g / 脂肪 {cartFat}g)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="btn-save-cart-to-diary"
                    onClick={handleSaveToDiary}
                    className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B8B] via-[#FF8DA1] to-[#FFAAA6] text-white text-sm font-extrabold shadow-glow-pink hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>一键保存入账今日饮食</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Weekly Report Modal */}
      {isWeeklyReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div
            id="weekly-report-card-modal"
            className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-[#FFFDF9] to-[#F3E8FF] p-6 sm:p-8 border border-[#FFE4E8] shadow-2xl space-y-5"
          >
            <button
              onClick={() => setIsWeeklyReportOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#8C7A78] hover:bg-white/80"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#FFCCD5] text-xs font-bold text-[#D53F8C] shadow-2xs">
                <span>🌸 FitGlow 本周轻体总结报告</span>
              </div>
              <h3 className="text-2xl font-black text-[#3E3230] tracking-tight">
                元气控卡 · 周报卡片
              </h3>
              <p className="text-xs text-[#7D6B68]">
                根据您最近的饮食与打卡习惯生成的专属健康评估
              </p>
            </div>

            {/* Grade & Streak Highlight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/90 p-4 border border-[#FFE4E8] text-center shadow-xs">
                <div className="text-xs text-[#8C7A78]">本周轻体评级</div>
                <div className="text-3xl font-black text-[#FF6B8B] mt-1">A+ 优异</div>
                <div className="text-[10px] text-[#38A169] font-semibold mt-0.5">
                  热量控制达成率 94%
                </div>
              </div>
              <div className="rounded-2xl bg-white/90 p-4 border border-[#FFE4E8] text-center shadow-xs">
                <div className="text-xs text-[#8C7A78]">坚持打卡</div>
                <div className="text-3xl font-black text-[#805AD5] mt-1">
                  {userStreak.currentStreak} <span className="text-sm">天</span>
                </div>
                <div className="text-[10px] text-[#805AD5] font-semibold mt-0.5">
                  保持良好代谢自律
                </div>
              </div>
            </div>

            {/* Weekly Macro Distribution */}
            <div className="rounded-2xl bg-white/90 p-4 border border-[#FFE4E8] space-y-2.5 shadow-xs">
              <h4 className="text-xs font-bold text-[#3E3230] flex items-center justify-between">
                <span>三大营养素平均达标概览</span>
                <span className="text-[10px] text-[#8C7A78]">科学配比 3:5:2</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#FF6B8B] font-semibold">优质蛋白</span>
                    <span className="font-bold text-[#3E3230]">良好 (92% 达标)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FFE4E8] overflow-hidden">
                    <div className="h-full bg-[#FF6B8B] w-[92%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#ED8936] font-semibold">复合碳水</span>
                    <span className="font-bold text-[#3E3230]">平稳 (88% 达标)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#FEF0E6] overflow-hidden">
                    <div className="h-full bg-[#ED8936] w-[88%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#38A169] font-semibold">膳食纤维</span>
                    <span className="font-bold text-[#3E3230]">充足 (96% 达标)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E6F4EA] overflow-hidden">
                    <div className="h-full bg-[#38A169] w-[96%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Nutritionist Warm Words */}
            <div className="rounded-2xl bg-gradient-to-r from-[#FFF0F3] to-[#F7FAFC] p-3.5 border border-[#FFCCD5] text-xs text-[#6B5A57] leading-relaxed">
              <div className="font-bold text-[#D53F8C] flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI 营养师寄语</span>
              </div>
              本周您在控油低糖和摄入深色蔬菜方面表现特别出色！继续保持餐盘的多彩搭配，适量补充水分，轻盈体态自然水到渠成✨
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  showToast("已成功复制本周周报卡片文案！🎉");
                  setIsWeeklyReportOpen(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B8B] to-[#FF8DA1] text-white text-xs sm:text-sm font-bold shadow-glow-pink hover:opacity-95"
              >
                保存并分享周报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
