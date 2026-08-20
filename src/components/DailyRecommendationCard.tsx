import React, { useState, useEffect } from "react";
import { DailyDishRecommendation, FoodDiaryEntry, FridgeItem, MealPlateItem } from "../types";
import { loadDailyRecommendation, saveDailyRecommendation } from "../utils/storage";
import { COMMON_FOODS } from "../data/foods";
import { DishRecipeModal } from "./DishRecipeModal";
import {
  Sparkles,
  RefreshCw,
  Utensils,
  ChefHat,
  Clock,
  Flame,
  CheckCircle,
  ShoppingBag,
  X,
  BookOpen,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DailyRecommendationCardProps {
  fridgeItems: FridgeItem[];
  diaryEntries: FoodDiaryEntry[];
  goal?: string;
  onAddToPlate?: (item: MealPlateItem) => void;
}

export const DailyRecommendationCard: React.FC<DailyRecommendationCardProps> = ({
  fridgeItems,
  diaryEntries,
  goal = "fat_loss",
  onAddToPlate,
}) => {
  const [dish, setDish] = useState<DailyDishRecommendation | null>(() => loadDailyRecommendation());
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);

  const fetchRecommendation = async () => {
    setLoading(true);
    setHasAccepted(false);
    try {
      const res = await fetch("/api/daily-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fridge_items: fridgeItems,
          diary_entries: diaryEntries,
          goal,
        }),
      });

      if (!res.ok) throw new Error("获取今日推荐菜谱失败");

      const data: DailyDishRecommendation = await res.json();
      data.recommended_at = new Date().toISOString();
      setDish(data);
      saveDailyRecommendation(data);
    } catch (err: any) {
      console.error("fetchRecommendation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dish) {
      fetchRecommendation();
    }
  }, []);

  const handleAcceptDish = () => {
    if (!dish) return;

    if (onAddToPlate) {
      const matched = COMMON_FOODS.find((f) => f.name.includes(dish.dish_name) || dish.dish_name.includes(f.name));
      const calPer100 = matched ? matched.caloriesPer100g : 130;
      const proteinPer100 = matched ? matched.proteinPer100g : 12.0;
      const carbsPer100 = matched ? matched.carbsPer100g : 8.0;
      const fatPer100 = matched ? matched.fatPer100g : 3.5;
      const fiberPer100 = matched ? matched.fiberPer100g : 2.5;

      const portionG = 250;
      const ratio = portionG / 100;

      const plateItem: MealPlateItem = {
        cartItemId: `rec_plate_${Date.now()}`,
        foodId: matched?.id || `dish_${Date.now()}`,
        name: dish.dish_name,
        category: "家常菜",
        portion_g: portionG,
        calories: Math.round(calPer100 * ratio),
        protein_g: Number((proteinPer100 * ratio).toFixed(1)),
        carbs_g: Number((carbsPer100 * ratio).toFixed(1)),
        fat_g: Number((fatPer100 * ratio).toFixed(1)),
        fiber_g: Number((fiberPer100 * ratio).toFixed(1)),
        meal_type: "晚餐",
        emoji: "🍲",
        caloriesPer100g: calPer100,
        proteinPer100g: proteinPer100,
        carbsPer100g: carbsPer100,
        fatPer100g: fatPer100,
        fiberPer100g: fiberPer100,
      };

      onAddToPlate(plateItem);
    }

    setHasAccepted(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div
      id="daily-recommendation-card"
      className="bg-white rounded-3xl p-6 sm:p-7 border border-[#FED7AA] shadow-card relative overflow-hidden space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center text-xl shadow-2xs">
            🥗
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#431407]">
              AI 今日灵感大厨推荐
            </h3>
            <p className="text-xs text-[#9A7D76]">优先结合你冰箱的食材库存定制</p>
          </div>
        </div>

        <button
          onClick={fetchRecommendation}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFF7ED] text-[#C2410C] text-xs font-bold hover:bg-[#FFEDD5] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "构思中..." : "换一道"}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#FED7AA] border-t-[#EA580C] animate-spin" />
          <p className="text-xs font-bold text-[#9A7D76]">
            AI 主厨正在搜寻你冰箱中最鲜美的食材进行灵感搭配... 🍳✨
          </p>
        </div>
      ) : dish ? (
        <div className="space-y-4 relative z-10">
          {/* Hero Dish Presentation */}
          <div className="bg-gradient-to-br from-[#FFF7ED] via-[#FFFDFB] to-[#FEF2F2] rounded-3xl p-5 border border-[#FED7AA]/70 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#EA580C]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>今日必吃灵感</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-[#431407]">
                  {dish.dish_name}
                </h4>
              </div>

              {/* Quick stats tags */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white text-xs font-bold text-[#7C2D12] border border-[#FED7AA]">
                  <Clock className="w-3 h-3 text-[#EA580C]" />
                  <span>{dish.recipe.cooking_time} 分钟快手</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#ECFDF5] text-xs font-bold text-[#065F46] border border-[#A7F3D0]">
                  <span>{dish.recipe.difficulty}</span>
                </span>
              </div>
            </div>

            {/* Recommendation Reason */}
            <p className="text-xs sm:text-sm font-semibold text-[#78350F] leading-relaxed bg-white/80 rounded-2xl p-3 border border-[#FED7AA]/50">
              💡 {dish.reason}
            </p>

            {/* Ingredients overview */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#9A3412] block">所需食材及冰箱比对：</span>
              <div className="flex flex-wrap gap-1.5">
                {dish.recipe.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${
                      ing.in_fridge
                        ? "bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]"
                        : "bg-white text-[#52525B] border border-[#E4E4E7]"
                    }`}
                  >
                    <span>{ing.in_fridge ? "✅ 冰箱已有" : "🛒 需准备"}</span>
                    <span>{ing.name} ({ing.amount})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              onClick={() => setIsRecipeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-[#E5E7EB] text-[#374151] text-xs font-bold hover:bg-[#F9FAFB] transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#6B7280]" />
              <span>查看图文做法教程</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchRecommendation}
                className="px-4 py-2.5 rounded-2xl bg-[#FFF7ED] text-[#C2410C] text-xs font-bold hover:bg-[#FFEDD5] transition-all cursor-pointer"
              >
                换一道
              </button>

              <button
                id="btn-accept-dish"
                onClick={handleAcceptDish}
                disabled={hasAccepted}
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-xs transition-all cursor-pointer ${
                  hasAccepted
                    ? "bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]"
                    : "bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white hover:opacity-95"
                }`}
              >
                {hasAccepted ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>已加入今日餐盘</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>就吃这个！一键入盘</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ILLUSTRATED RECIPE TUTORIAL MODAL */}
      <DishRecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        dishName={dish?.dish_name || "今日推荐菜"}
        imageKeyword={dish?.image_keyword || dish?.dish_name}
        reason={dish?.reason}
        recipe={dish?.recipe || null}
        onAddToPlate={handleAcceptDish}
      />
    </div>
  );
};
