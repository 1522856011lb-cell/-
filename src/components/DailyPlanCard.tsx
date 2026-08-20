import React, { useState, useEffect } from "react";
import {
  BodyProfile,
  DailyPlanResponse,
  ExerciseLogEntry,
  FoodDiaryEntry,
  FridgeItem,
  MealPlateItem,
  MealType,
  WorkoutPlan,
} from "../types";
import { loadDailyPlan, saveDailyPlan } from "../utils/storage";
import { COMMON_FOODS } from "../data/foods";
import {
  CalendarDays,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  Dumbbell,
  Check,
  ChevronRight,
  Flame,
  Clock,
  Plus,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DailyPlanCardProps {
  profile: BodyProfile;
  diaryEntries: FoodDiaryEntry[];
  fridgeItems: FridgeItem[];
  exerciseLogs: ExerciseLogEntry[];
  onAddToPlate?: (item: MealPlateItem) => void;
  onStartWorkout?: (workoutData: { name: string; duration_min: number; calories_burned: number; instructions: string }) => void;
}

export const DailyPlanCard: React.FC<DailyPlanCardProps> = ({
  profile,
  diaryEntries,
  fridgeItems,
  exerciseLogs,
  onAddToPlate,
  onStartWorkout,
}) => {
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResponse | null>(() => loadDailyPlan());
  const [loading, setLoading] = useState<boolean>(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const fetchDailyPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          diary_entries: diaryEntries,
          fridge_items: fridgeItems,
          exercise_logs: exerciseLogs,
        }),
      });

      if (!res.ok) throw new Error("获取定制计划失败");

      const data: DailyPlanResponse = await res.json();
      data.generated_at = new Date().toISOString();
      setDailyPlan(data);
      saveDailyPlan(data);
    } catch (err: any) {
      console.error("fetchDailyPlan error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dailyPlan) {
      fetchDailyPlan();
    }
  }, []);

  const handleAddSuggestionToPlate = (
    mealType: string,
    foodName: string,
    portionG: number,
    key: string
  ) => {
    if (!onAddToPlate) return;

    // Look up or estimate nutrition
    const matched = COMMON_FOODS.find((f) => f.name.includes(foodName) || foodName.includes(f.name));
    const calPer100 = matched ? matched.caloriesPer100g : 120;
    const proteinPer100 = matched ? matched.proteinPer100g : 8.0;
    const carbsPer100 = matched ? matched.carbsPer100g : 14.0;
    const fatPer100 = matched ? matched.fatPer100g : 3.0;
    const fiberPer100 = matched ? matched.fiberPer100g : 2.0;

    const ratio = portionG / 100;

    const validMealType: MealType =
      mealType === "早餐" ? "早餐" : mealType === "午餐" ? "午餐" : mealType === "加餐" ? "加餐" : "晚餐";

    const plateItem: MealPlateItem = {
      cartItemId: `plate_rec_${Date.now()}`,
      foodId: matched?.id || `rec_${Date.now()}`,
      name: foodName,
      category: matched?.category || "家常菜",
      portion_g: portionG,
      calories: Math.round(calPer100 * ratio),
      protein_g: Number((proteinPer100 * ratio).toFixed(1)),
      carbs_g: Number((carbsPer100 * ratio).toFixed(1)),
      fat_g: Number((fatPer100 * ratio).toFixed(1)),
      fiber_g: Number((fiberPer100 * ratio).toFixed(1)),
      meal_type: validMealType,
      emoji: matched?.emoji || "🥗",
      caloriesPer100g: calPer100,
      proteinPer100g: proteinPer100,
      carbsPer100g: carbsPer100,
      fatPer100g: fatPer100,
      fiberPer100g: fiberPer100,
    };

    onAddToPlate(plateItem);
    setAddedItems((prev) => ({ ...prev, [key]: true }));

    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.6 },
    });
  };

  return (
    <div
      id="daily-plan-card"
      className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-card space-y-5 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EDF2F7] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#319795] to-[#81E6D9] flex items-center justify-center text-white shadow-2xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-[#2D3748]">今日专属健康计划</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6FFFA] text-[#234E52]">
                冰箱食材智能互补
              </span>
            </div>
            <p className="text-[11px] text-[#718096]">
              根据今日已摄入与冰箱库存，动态定制剩余餐次及运动
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-daily-plan"
          onClick={fetchDailyPlan}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-[#718096] hover:text-[#2D3748] hover:bg-[#EDF2F7] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#319795]" : ""}`} />
          <span>{loading ? "定制中..." : "重新定制"}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#B2F5EA] border-t-[#319795] animate-spin"></div>
          <p className="text-xs font-bold text-[#4A5568]">
            AI 导师正在结合您的冰箱库存与今日餐单生成专属方案... 🥗
          </p>
        </div>
      ) : dailyPlan ? (
        <div className="space-y-4">
          {/* Meals Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#4A5568] flex items-center gap-1.5">
              <span>🍽️</span>
              <span>今日剩余餐次补充建议：</span>
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {dailyPlan.meals.map((mealGroup, gIdx) => (
                <div
                  key={gIdx}
                  className="bg-[#F7FAFC] rounded-2xl p-4 border border-[#E2E8F0] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-[#234E52] text-white">
                      {mealGroup.meal_type}推荐
                    </span>
                    <span className="text-[11px] text-[#718096]">
                      低脂少油 · 优先搭配
                    </span>
                  </div>

                  <div className="space-y-2">
                    {mealGroup.suggestions.map((sug, sIdx) => {
                      const itemKey = `${gIdx}_${sIdx}`;
                      const isAdded = !!addedItems[itemKey];

                      return (
                        <div
                          key={sIdx}
                          className="bg-white rounded-xl p-3 border border-[#EDF2F7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#2D3748]">
                                {sug.food_name}
                              </span>
                              <span className="text-[11px] font-bold text-[#319795] bg-[#E6FFFA] px-2 py-0.5 rounded-md">
                                {sug.portion_g}g
                              </span>
                            </div>
                            <p className="text-xs text-[#718096] leading-relaxed">
                              {sug.reason}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              handleAddSuggestionToPlate(
                                mealGroup.meal_type,
                                sug.food_name,
                                sug.portion_g,
                                itemKey
                              )
                            }
                            disabled={isAdded}
                            className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isAdded
                                ? "bg-[#E6FFFA] text-[#234E52] border border-[#81E6D9]"
                                : "bg-[#319795] text-white shadow-xs hover:bg-[#285E61]"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#319795]" />
                                <span>已入餐盘</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>加入餐盘</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Workout Section */}
          {dailyPlan.workout && (
            <div className="bg-gradient-to-r from-[#FFF5F5] to-[#FFFAF0] rounded-2xl p-4 border border-[#FED7D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#E53E3E] text-white flex items-center justify-center text-xs">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-extrabold text-[#2D3748]">
                    {dailyPlan.workout.exercise_name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FED7D7] text-[#C53030] flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    约 {dailyPlan.workout.calories_burned} kcal
                  </span>
                </div>
                <p className="text-xs text-[#718096] pl-9">
                  {dailyPlan.workout.instructions}
                </p>
              </div>

              {onStartWorkout && (
                <button
                  onClick={() => onStartWorkout(dailyPlan.workout)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#E53E3E] text-white text-xs font-bold shadow-xs hover:bg-[#C53030] transition-all cursor-pointer shrink-0 self-end sm:self-center"
                >
                  <span>开始运动</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
