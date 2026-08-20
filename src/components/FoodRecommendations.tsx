import React, { useState, useEffect } from "react";
import { BodyProfile, FoodDiaryEntry, FoodItem, RecipeDetail } from "../types";
import { Sparkles, UtensilsCrossed, Clock, ChefHat, Plus, Eye, X, Loader2, Check, RefreshCw, Flame, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { getAccurateDishImage } from "../utils/unsplash";

interface FoodRecommendationsProps {
  profile: BodyProfile;
  targetCalories: number;
  onAddFoodEntry: (entry: Omit<FoodDiaryEntry, "id" | "created_at">) => void;
}

export const FoodRecommendations: React.FC<FoodRecommendationsProps> = ({
  profile,
  targetCalories,
  onAddFoodEntry,
}) => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  // Recipe Modal State
  const [activeRecipe, setActiveRecipe] = useState<RecipeDetail | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedFoodForRecipe, setSelectedFoodForRecipe] = useState<FoodItem | null>(null);

  // Quick Log Modal State
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [foodToLog, setFoodToLog] = useState<FoodItem | null>(null);
  const [portionInput, setPortionInput] = useState<number>(150);
  const [mealTypeInput, setMealTypeInput] = useState<"早餐" | "午餐" | "晚餐" | "加餐">("午餐");
  const [justLoggedSuccess, setJustLoggedSuccess] = useState(false);

  const categories = ["全部", "高蛋白", "优质碳水", "减脂刮油", "低卡甜点"];

  const fetchRecommendations = async (customCategory?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/recommend-foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          goal: profile.goal,
          target_calories: targetCalories,
          category: customCategory && customCategory !== "全部" ? customCategory : undefined,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setFoods(data);
      }
    } catch (e) {
      console.error("Error fetching recommended foods:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [profile.goal, targetCalories]);

  const handleOpenRecipe = async (food: FoodItem) => {
    setSelectedFoodForRecipe(food);
    setRecipeModalOpen(true);
    setIsLoadingRecipe(true);
    setActiveRecipe(null);

    try {
      const res = await fetch(`/api/recipes/${encodeURIComponent(food.name)}?goal=${encodeURIComponent(profile.goal || "健康轻体")}`);
      const data = await res.json();
      setActiveRecipe(data);
    } catch (e) {
      console.error("Error fetching recipe:", e);
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const handleOpenLogModal = (food: FoodItem) => {
    setFoodToLog(food);
    setPortionInput(food.suggested_portion_g || 150);
    setMealTypeInput(food.meal_type || "午餐");
    setLogModalOpen(true);
  };

  const handleConfirmLog = () => {
    if (!foodToLog) return;
    const ratio = portionInput / 100;
    const entry = {
      food_name: foodToLog.name,
      portion_g: portionInput,
      calories: Math.round(foodToLog.calories_per_100g * ratio),
      protein_g: Number((foodToLog.protein_per_100g * ratio).toFixed(1)),
      carbs_g: Number((foodToLog.carbs_per_100g * ratio).toFixed(1)),
      fat_g: Number((foodToLog.fat_per_100g * ratio).toFixed(1)),
      fiber_g: Number((foodToLog.fiber_per_100g * ratio).toFixed(1)),
      meal_type: mealTypeInput,
      emoji: foodToLog.emoji || "🥗",
    };

    onAddFoodEntry(entry);
    setJustLoggedSuccess(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#E2F0CB", "#B5EAD7", "#C7CEEA"],
      });
    } catch (_) {}

    setTimeout(() => {
      setJustLoggedSuccess(false);
      setLogModalOpen(false);
    }, 1200);
  };

  const filteredFoods =
    selectedCategory === "全部"
      ? foods
      : foods.filter((f) => f.category === selectedCategory || f.tags.includes(selectedCategory));

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto px-4 pt-4">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#E6F4EA] via-[#FFFDF9] to-[#FFF0F3] p-6 border border-[#C6F6D5] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#A8E6CF] text-xs font-bold text-[#2F855A]">
            <Sparkles className="w-3.5 h-3.5 text-[#48BB78]" />
            <span>Gemini AI 智能食谱库</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E3230]">
            高颜值轻食推荐 · 兼顾美味与控卡
          </h2>
          <p className="text-xs sm:text-sm text-[#7D6B68]">
            根据你的目标（{profile.goal === "fat_loss" ? "减脂塑形" : profile.goal === "muscle_gain" ? "增肌紧致" : "健康维持"}）定制，每道菜都附有极细致的做法与营养数据！
          </p>
        </div>

        <button
          onClick={() => fetchRecommendations(selectedCategory)}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E2D5D2] hover:border-[#FF9AA2] text-xs font-bold text-[#5A4A47] hover:text-[#FF6B8B] shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#FF6B8B]" : ""}`} />
          <span>{isLoading ? "AI 正在重新生成..." : "换一批推荐"}</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#4A3E3D] text-white shadow-sm scale-102"
                : "bg-white border border-[#EADBDA] text-[#7D6B68] hover:bg-[#FAF7F5]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Cards Grid */}
      {isLoading && foods.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-white rounded-3xl border border-[#F3E5E3]">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] flex items-center justify-center animate-bounce text-2xl">
            🥣
          </div>
          <p className="text-sm font-bold text-[#3E3230]">Gemini 正在为你定制精致轻食推荐...</p>
          <p className="text-xs text-[#9B8986]">计算热量、营养成分与烹饪秘笈中</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFoods.map((food) => (
            <div
              key={food.id || food.name}
              className="bg-white rounded-3xl p-5 border border-[#F3E5E3] hover:border-[#FFCCD5] shadow-card hover:shadow-soft transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header with Emoji & Category */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF5F7] to-[#FFF9F5] border border-[#FFE4E8] text-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      {food.emoji || "🥗"}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#3E3230] leading-snug">
                        {food.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-[#8C7A78]">
                        适宜：{food.meal_type} · 建议份量 ~{food.suggested_portion_g}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#7A6966] leading-relaxed line-clamp-2">
                  {food.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {food.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-[#FAF5F4] text-[10px] font-bold text-[#8C6D68]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Macro pill summary per 100g */}
                <div className="bg-[#FAF7F5] rounded-2xl p-3 grid grid-cols-4 gap-1 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C7A78] block">热量</span>
                    <span className="font-bold text-[#E03164]">{food.calories_per_100g}</span>
                    <span className="text-[9px] text-[#A89895] block">kcal</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C7A78] block">蛋白质</span>
                    <span className="font-bold text-[#3E3230]">{food.protein_per_100g}g</span>
                    <span className="text-[9px] text-[#A89895] block">高蛋白</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C7A78] block">碳水</span>
                    <span className="font-bold text-[#3E3230]">{food.carbs_per_100g}g</span>
                    <span className="text-[9px] text-[#A89895] block">慢碳</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8C7A78] block">脂肪</span>
                    <span className="font-bold text-[#3E3230]">{food.fat_per_100g}g</span>
                    <span className="text-[9px] text-[#A89895] block">优脂</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#F7EAE8]">
                <button
                  onClick={() => handleOpenRecipe(food)}
                  className="py-2.5 px-3 rounded-2xl bg-[#FFF0F3] hover:bg-[#FFE4E8] text-[#D53F8C] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>查看做法</span>
                </button>
                <button
                  onClick={() => handleOpenLogModal(food)}
                  className="py-2.5 px-3 rounded-2xl bg-[#48BB78] hover:bg-[#38A169] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>记录我吃了</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECIPE DETAILS MODAL */}
      {recipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-[#F3E5E3] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#F7EAE8] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[11px] font-bold text-[#E03164] mb-1">
                  <ChefHat className="w-3 h-3" />
                  <span>FitGlow 营养师主厨食谱</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#3E3230]">
                  {selectedFoodForRecipe?.name}
                </h3>
                {activeRecipe && (
                  <p className="text-xs text-[#8C7A78] font-medium mt-0.5">
                    {activeRecipe.subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setRecipeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F5] hover:bg-[#F2EAE8] flex items-center justify-center text-[#7A6966] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {isLoadingRecipe ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B8B] mx-auto" />
                <p className="text-sm font-bold text-[#3E3230]">Gemini 正在撰写独家 ins 风料理步骤与小贴士...</p>
              </div>
            ) : activeRecipe ? (
              <div className="space-y-6">
                {/* Recipe Hero Photo Banner */}
                <div className="relative rounded-2xl overflow-hidden h-44 sm:h-52 bg-gradient-to-tr from-[#FFF0F3] to-[#FFF9F5] border border-[#FFE4E8]">
                  <img
                    src={activeRecipe.image_url && !activeRecipe.image_url.includes("via.placeholder.com") ? activeRecipe.image_url : getAccurateDishImage(activeRecipe.recipe_name || activeRecipe.dish_name || "")}
                    alt={activeRecipe.recipe_name || activeRecipe.dish_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getAccurateDishImage(activeRecipe.recipe_name || activeRecipe.dish_name || "");
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <div className="text-white space-y-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-xs font-bold uppercase tracking-wider">
                        {activeRecipe.image_keyword || selectedFoodForRecipe?.category || "元气轻食"}
                      </span>
                      <h4 className="text-lg font-black">{activeRecipe.recipe_name}</h4>
                      <p className="text-xs text-white/90">{activeRecipe.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Highlights bar: time, difficulty, single-portion calories */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#FAF7F5] rounded-2xl text-center">
                  <div>
                    <span className="text-[11px] text-[#8C7A78] block">难度等级</span>
                    <span className="text-xs font-bold text-[#3E3230]">{activeRecipe.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8C7A78] block">备菜+烹饪</span>
                    <span className="text-xs font-bold text-[#3E3230]">
                      {activeRecipe.prep_time_min + activeRecipe.cook_time_min} 分钟
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#8C7A78] block">一份总热量</span>
                    <span className="text-xs font-bold text-[#E03164]">
                      {activeRecipe.total_calories} kcal
                    </span>
                  </div>
                </div>

                {/* Ingredients list */}
                <div className="space-y-2.5">
                  <h4 className="font-bold text-sm text-[#3E3230] flex items-center gap-1.5">
                    <span>🛒</span>
                    <span>所需食材与调料清单</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeRecipe.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF9] border border-[#F3E5E3] text-xs"
                      >
                        <span className="font-bold text-[#4A3E3D]">{ing.name}</span>
                        <div className="text-right">
                          <span className="font-semibold text-[#8C6D68]">{ing.amount}</span>
                          {ing.notes && (
                            <span className="text-[10px] text-[#A89895] block">{ing.notes}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step by step */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#3E3230] flex items-center gap-1.5">
                    <span>🍳</span>
                    <span>保姆级详细烹饪步骤</span>
                  </h4>
                  <div className="space-y-3">
                    {activeRecipe.steps.map((step) => (
                      <div
                        key={step.step_number}
                        className="p-3.5 rounded-2xl bg-white border border-[#F0E4E2] space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#FFE4E8] text-[#D53F8C] text-xs font-extrabold flex items-center justify-center">
                            {step.step_number}
                          </span>
                          <span className="font-bold text-xs text-[#3E3230]">{step.title}</span>
                        </div>
                        <p className="text-xs text-[#6D5D5A] leading-relaxed pl-7">
                          {step.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chef tips */}
                {activeRecipe.chef_tips && activeRecipe.chef_tips.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#FFD6DF] space-y-2">
                    <h5 className="font-bold text-xs text-[#D53F8C] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>营养师独家风味秘诀</span>
                    </h5>
                    <ul className="text-xs text-[#7A5860] space-y-1 list-disc list-inside">
                      {activeRecipe.chef_tips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F7EAE8]">
              <button
                onClick={() => setRecipeModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#FAF7F5] hover:bg-[#F2EAE8] font-bold text-xs text-[#6D5D5A] cursor-pointer"
              >
                关闭
              </button>
              {selectedFoodForRecipe && (
                <button
                  onClick={() => {
                    setRecipeModalOpen(false);
                    handleOpenLogModal(selectedFoodForRecipe);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[#48BB78] hover:bg-[#38A169] font-bold text-xs text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>记录已制作此餐</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUICK PORTION LOG MODAL */}
      {logModalOpen && foodToLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-[#F3E5E3] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F7EAE8] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{foodToLog.emoji || "🥗"}</span>
                <div>
                  <h3 className="font-bold text-base text-[#3E3230]">记录到今日饮食</h3>
                  <span className="text-xs text-[#8C7A78]">{foodToLog.name}</span>
                </div>
              </div>
              <button
                onClick={() => setLogModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F5] flex items-center justify-center text-[#7A6966] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Meal Type selection */}
              <div>
                <label className="block text-xs font-bold text-[#6D5D5A] mb-1.5">记录餐次</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["早餐", "午餐", "晚餐", "加餐"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMealTypeInput(m)}
                      className={`py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        mealTypeInput === m
                          ? "bg-[#FFF0F3] border-[#FF9AA2] text-[#E03164] shadow-xs"
                          : "bg-[#FAF7F5] border-transparent text-[#7D6B68]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion Input */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#6D5D5A] mb-1.5">
                  <span>食用份量 (克)</span>
                  <span className="text-[#E03164]">
                    ≈ {Math.round(foodToLog.calories_per_100g * (portionInput / 100))} kcal
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={portionInput}
                    onChange={(e) => setPortionInput(Math.max(1, Number(e.target.value) || 0))}
                    className="w-28 bg-[#FAF7F5] border border-[#EADBDA] rounded-2xl px-3 py-2.5 text-center font-extrabold text-[#3E3230] text-base outline-none focus:border-[#FF9AA2]"
                  />
                  <div className="flex-1 flex gap-1.5">
                    {[100, 150, 200, 300].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPortionInput(p)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                          portionInput === p
                            ? "bg-[#4A3E3D] text-white border-[#4A3E3D]"
                            : "bg-[#FAF7F5] border-[#EADBDA] text-[#6D5D5A]"
                        }`}
                      >
                        {p}g
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Macro Preview */}
              <div className="p-3 bg-[#FAF7F5] rounded-2xl grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <span className="text-[10px] text-[#8C7A78] block">热量</span>
                  <span className="font-bold text-[#E03164]">
                    {Math.round(foodToLog.calories_per_100g * (portionInput / 100))}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A78] block">蛋白质</span>
                  <span className="font-bold text-[#3E3230]">
                    {(foodToLog.protein_per_100g * (portionInput / 100)).toFixed(1)}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A78] block">碳水</span>
                  <span className="font-bold text-[#3E3230]">
                    {(foodToLog.carbs_per_100g * (portionInput / 100)).toFixed(1)}g
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A78] block">脂肪</span>
                  <span className="font-bold text-[#3E3230]">
                    {(foodToLog.fat_per_100g * (portionInput / 100)).toFixed(1)}g
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmLog}
              disabled={justLoggedSuccess}
              className={`w-full py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                justLoggedSuccess
                  ? "bg-[#48BB78] text-white"
                  : "bg-[#FF6B8B] hover:bg-[#FF4D79] text-white shadow-glow-pink"
              }`}
            >
              {justLoggedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>已成功记录到今日饮食！</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>确认保存饮食记录</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
