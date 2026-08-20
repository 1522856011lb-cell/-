import React, { useState, useMemo, useEffect } from "react";
import {
  FridgeCategory,
  FridgeItem,
  FridgeRecipeRecommendation,
  MealPlateItem,
  StorageMethod,
} from "../types";
import { COMMON_FOODS, CommonFoodItem, getFoodStorageDefaults } from "../data/foods";
import { getDaysUntilExpiry, calculateExpiryDate } from "../utils/storage";
import { getAccurateDishImage } from "../utils/unsplash";
import { DishRecipeModal } from "./DishRecipeModal";
import {
  Refrigerator,
  Plus,
  Search,
  Trash2,
  Edit3,
  Calendar,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  X,
  Clock,
  Filter,
  Check,
  ChevronRight,
  ChefHat,
  Flame,
  BookOpen,
  Loader2,
  Snowflake,
  Sun,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";

interface FridgeManagementProps {
  items: FridgeItem[];
  onAddItem: (item: FridgeItem) => void;
  onUpdateItem: (item: FridgeItem) => void;
  onDeleteItem: (id: string) => void;
  onAddToPlate?: (plateItem: MealPlateItem) => void;
  onNavigateToRecommend?: () => void;
}

export const FridgeManagement: React.FC<FridgeManagementProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddToPlate,
  onNavigateToRecommend,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");
  const [selectedStorageMethod, setSelectedStorageMethod] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FridgeItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Smart Recipe Recommendations State ("看看能做什么")
  const [recipeRecommendations, setRecipeRecommendations] = useState<FridgeRecipeRecommendation[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [showRecipesSection, setShowRecipesSection] = useState(false);

  // Detail Modal for Dish Recipe
  const [selectedRecipeForModal, setSelectedRecipeForModal] = useState<FridgeRecipeRecommendation | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // Form states for Add Item
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [formData, setFormData] = useState<{
    food_name: string;
    quantity: number;
    unit: string;
    category: FridgeCategory;
    storage_method: StorageMethod;
    purchase_date: string;
    shelf_life_days: number;
    expiry_date: string;
    emoji: string;
  }>({
    food_name: "",
    quantity: 200,
    unit: "g",
    category: "蔬菜",
    storage_method: "冷藏",
    purchase_date: todayStr,
    shelf_life_days: 5,
    expiry_date: calculateExpiryDate(todayStr, 5),
    emoji: "🥗",
  });

  const categories: FridgeCategory[] = ["蔬菜", "肉类", "蛋奶", "主食", "水果", "调料"];
  const storageMethods: StorageMethod[] = ["冷藏", "冷冻", "常温"];

  const categoryEmojis: Record<FridgeCategory, string> = {
    蔬菜: "🥦",
    肉类: "🥩",
    蛋奶: "🥚",
    主食: "🍞",
    水果: "🍎",
    调料: "🧂",
  };

  const storageMethodIcons: Record<StorageMethod, { icon: string; label: string; bg: string; text: string }> = {
    冷藏: { icon: "🧊", label: "冷藏", bg: "bg-blue-50", text: "text-blue-700" },
    冷冻: { icon: "❄️", label: "冷冻", bg: "bg-indigo-50", text: "text-indigo-700" },
    常温: { icon: "🍃", label: "常温", bg: "bg-amber-50", text: "text-amber-800" },
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Search food items in built-in database
  const searchedFoodSuggestions = useMemo(() => {
    if (!foodSearchQuery.trim()) return COMMON_FOODS.slice(0, 10);
    const q = foodSearchQuery.toLowerCase();
    return COMMON_FOODS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [foodSearchQuery]);

  // Filtered Fridge Items by category, storage method, search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory = selectedCategory === "全部" || item.category === selectedCategory;
      const matchStorage = selectedStorageMethod === "全部" || item.storage_method === selectedStorageMethod;
      const matchQuery =
        !searchQuery.trim() || item.food_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchStorage && matchQuery;
    });
  }, [items, selectedCategory, selectedStorageMethod, searchQuery]);

  // Expiry statistics
  const totalCount = items.length;
  const expiringSoonCount = useMemo(() => {
    return items.filter((i) => {
      const days = getDaysUntilExpiry(i.expiry_date);
      return days !== null && days <= 3 && days >= 0;
    }).length;
  }, [items]);

  const expiredCount = useMemo(() => {
    return items.filter((i) => {
      const days = getDaysUntilExpiry(i.expiry_date);
      return days !== null && days < 0;
    }).length;
  }, [items]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: items.length };
    categories.forEach((c) => {
      counts[c] = items.filter((i) => i.category === c).length;
    });
    return counts;
  }, [items, categories]);

  // Storage method counts
  const storageCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: items.length };
    storageMethods.forEach((s) => {
      counts[s] = items.filter((i) => (i.storage_method || "冷藏") === s).length;
    });
    return counts;
  }, [items, storageMethods]);

  // Open add modal and reset form
  const handleOpenAddModal = () => {
    const nowStr = new Date().toISOString().split("T")[0];
    setFoodSearchQuery("");
    setFormData({
      food_name: "",
      quantity: 200,
      unit: "g",
      category: "蔬菜",
      storage_method: "冷藏",
      purchase_date: nowStr,
      shelf_life_days: 5,
      expiry_date: calculateExpiryDate(nowStr, 5),
      emoji: "🥗",
    });
    setIsAddModalOpen(true);
  };

  // Handle food suggestion select -> auto-fill unit, shelf life, storage method
  const handleSelectFoodSuggestion = (food: CommonFoodItem) => {
    let cat: FridgeCategory = "蔬菜";
    if (food.category === "蛋白质") {
      cat = food.name.includes("蛋") || food.name.includes("奶") ? "蛋奶" : "肉类";
    } else if (food.category === "主食") {
      cat = "主食";
    } else if (food.category === "水果") {
      cat = "水果";
    } else if (food.category === "蔬菜") {
      cat = "蔬菜";
    }

    const defaults = getFoodStorageDefaults(food.name, cat);
    const pDate = formData.purchase_date || todayStr;
    const expDate = calculateExpiryDate(pDate, defaults.shelfLifeDays);

    setFormData({
      ...formData,
      food_name: food.name,
      category: cat,
      emoji: food.emoji,
      quantity: food.defaultPortion || 200,
      unit: defaults.defaultUnit,
      storage_method: defaults.storageMethod,
      shelf_life_days: defaults.shelfLifeDays,
      expiry_date: expDate,
    });
    setFoodSearchQuery("");
  };

  // Update purchase date and recompute expiry
  const handlePurchaseDateChange = (pDate: string) => {
    const expDate = calculateExpiryDate(pDate, formData.shelf_life_days);
    setFormData((prev) => ({
      ...prev,
      purchase_date: pDate,
      expiry_date: expDate,
    }));
  };

  // Update shelf life days and recompute expiry
  const handleShelfLifeChange = (days: number) => {
    const validDays = Math.max(1, days);
    const expDate = calculateExpiryDate(formData.purchase_date, validDays);
    setFormData((prev) => ({
      ...prev,
      shelf_life_days: validDays,
      expiry_date: expDate,
    }));
  };

  // Submit Add Item
  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.food_name.trim()) return;

    const newItem: FridgeItem = {
      id: `fridge_${Date.now()}`,
      user_id: "user_default",
      food_name: formData.food_name.trim(),
      quantity: Number(formData.quantity) || 1,
      unit: formData.unit || "g",
      category: formData.category,
      storage_method: formData.storage_method || "冷藏",
      purchase_date: formData.purchase_date || undefined,
      shelf_life_days: Number(formData.shelf_life_days) || undefined,
      expiry_date: formData.expiry_date || undefined,
      created_at: new Date().toISOString(),
      emoji: formData.emoji || categoryEmojis[formData.category] || "🥗",
    };

    onAddItem(newItem);
    setIsAddModalOpen(false);
    showToast(`已将「${newItem.food_name}」放入${newItem.storage_method || "冰箱"}！🧊✨`);

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#A8E6CF", "#DCEDC1", "#FFD3B6", "#FFAAA5"],
    });
  };

  // Submit Edit Item
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.food_name.trim()) return;

    onUpdateItem(editingItem);
    setEditingItem(null);
    showToast(`已更新「${editingItem.food_name}」信息！✨`);
  };

  // "看看能做什么" - Trigger Smart Fridge Recipes from Gemini API
  const handleFetchFridgeRecipes = async () => {
    if (items.length === 0) {
      showToast("冰箱目前还没有食材哦，请先添加食材~ 🧊");
      return;
    }

    setIsLoadingRecipes(true);
    setShowRecipesSection(true);

    try {
      const res = await fetch("/api/fridge-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fridge_items: items.map((i) => ({
            food_name: i.food_name,
            quantity: i.quantity,
            unit: i.unit,
            category: i.category,
          })),
        }),
      });

      if (!res.ok) throw new Error("获取冰箱菜谱推荐失败");
      const data: FridgeRecipeRecommendation[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRecipeRecommendations(data);
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error("fetch fridge recipes error:", err);
      showToast("推荐生成遇到网络波动，已加载精选搭配菜谱 ✨");
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Direct add ingredient to meal plate
  const handleDirectAddToPlate = (item: FridgeItem) => {
    if (!onAddToPlate) return;

    const matchedFood = COMMON_FOODS.find((f) => f.name.includes(item.food_name) || item.food_name.includes(f.name));
    const calPer100 = matchedFood ? matchedFood.caloriesPer100g : 110;
    const proteinPer100 = matchedFood ? matchedFood.proteinPer100g : 8.5;
    const carbsPer100 = matchedFood ? matchedFood.carbsPer100g : 10.0;
    const fatPer100 = matchedFood ? matchedFood.fatPer100g : 2.5;
    const fiberPer100 = matchedFood ? matchedFood.fiberPer100g : 2.0;

    const portionG = item.unit === "g" || item.unit === "克" ? item.quantity : item.quantity * 100;
    const ratio = portionG / 100;

    const plateItem: MealPlateItem = {
      cartItemId: `plate_${Date.now()}`,
      foodId: matchedFood?.id || `fridge_${item.id}`,
      name: item.food_name,
      category: item.category,
      portion_g: portionG,
      calories: Math.round(calPer100 * ratio),
      protein_g: Number((proteinPer100 * ratio).toFixed(1)),
      carbs_g: Number((carbsPer100 * ratio).toFixed(1)),
      fat_g: Number((fatPer100 * ratio).toFixed(1)),
      fiber_g: Number((fiberPer100 * ratio).toFixed(1)),
      meal_type: "晚餐",
      emoji: item.emoji || "🥗",
      caloriesPer100g: calPer100,
      proteinPer100g: proteinPer100,
      carbsPer100g: carbsPer100,
      fatPer100g: fatPer100,
      fiberPer100g: fiberPer100,
    };

    onAddToPlate(plateItem);
    showToast(`已将「${item.food_name}」加入今日晚餐餐盘！🍽️✨`);
  };

  // Add a recommended dish to meal plate
  const handleAddDishToPlate = (dish: FridgeRecipeRecommendation) => {
    if (!onAddToPlate) return;

    const matchedFood = COMMON_FOODS.find((f) => f.name.includes(dish.dish_name) || dish.dish_name.includes(f.name));
    const calPer100 = matchedFood ? matchedFood.caloriesPer100g : 125;
    const proteinPer100 = matchedFood ? matchedFood.proteinPer100g : 11.0;
    const carbsPer100 = matchedFood ? matchedFood.carbsPer100g : 8.5;
    const fatPer100 = matchedFood ? matchedFood.fatPer100g : 3.0;
    const fiberPer100 = matchedFood ? matchedFood.fiberPer100g : 2.0;

    const portionG = 250;
    const ratio = portionG / 100;

    const plateItem: MealPlateItem = {
      cartItemId: `rec_dish_${Date.now()}`,
      foodId: matchedFood?.id || `dish_${Date.now()}`,
      name: dish.dish_name,
      category: "家常菜",
      portion_g: portionG,
      calories: Math.round(calPer100 * ratio),
      protein_g: Number((proteinPer100 * ratio).toFixed(1)),
      carbs_g: Number((carbsPer100 * ratio).toFixed(1)),
      fat_g: Number((fatPer100 * ratio).toFixed(1)),
      fiber_g: Number((fiberPer100 * ratio).toFixed(1)),
      meal_type: "午餐",
      emoji: "🍲",
      caloriesPer100g: calPer100,
      proteinPer100g: proteinPer100,
      carbsPer100g: carbsPer100,
      fatPer100g: fatPer100,
      fiberPer100g: fiberPer100,
    };

    onAddToPlate(plateItem);
    showToast(`已将「${dish.dish_name}」加入今日餐盘！🍽️✨`);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-5xl mx-auto px-4 pt-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#3E3230] text-white text-sm font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <span>🌸</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div
        id="fridge-hero-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6FFFA] via-[#FFFDF9] to-[#FFF0F3] p-6 sm:p-8 border border-[#B2F5EA] shadow-card"
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-gradient-to-br from-[#81E6D9]/30 to-[#FED7E2]/30 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#81E6D9] text-xs font-bold text-[#234E52] shadow-2xs">
              <Refrigerator className="w-3.5 h-3.5 text-[#319795]" />
              <span>FitGlow 智能保鲜仓 & 保质期管家</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#234E52] tracking-tight">
              食材库存与赏味期管理 🧊
            </h1>
            <p className="text-sm text-[#4A5568] font-medium max-w-xl">
              自动计算保质期与剩余天数，一键让 AI 根据现有库存推荐低卡美味菜谱！
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-add-fridge-item"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#319795] to-[#38B2AC] text-white text-sm font-bold shadow-glow-green hover:opacity-95 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>添加食材</span>
            </button>
            <button
              id="btn-see-what-can-make"
              onClick={handleFetchFridgeRecipes}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B8B] to-[#FF8E53] text-white text-sm font-bold shadow-glow-pink hover:opacity-95 active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>看看能做什么 ✨</span>
            </button>
          </div>
        </div>

        {/* Status badges bar */}
        <div className="mt-5 pt-4 border-t border-[#B2F5EA]/60 flex flex-wrap items-center gap-2.5 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-[#2D3748] border border-[#CBD5E0]/60 shadow-2xs">
            <span>📦</span>
            <span>共有 {totalCount} 种食材</span>
          </div>
          {expiringSoonCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF5F5] text-[#DD6B20] border border-[#FBD38D] animate-pulse shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{expiringSoonCount} 种食材临期（≤3天）</span>
            </div>
          )}
          {expiredCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF5F5] text-[#E53E3E] border border-[#FEB2B2] shadow-2xs">
              <span>❌</span>
              <span>{expiredCount} 种食材已过期</span>
            </div>
          )}
          {expiringSoonCount === 0 && expiredCount === 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0FFF4] text-[#2F855A] border border-[#C6F6D5] shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>所有食材都在最佳赏味期内 ✨</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. SMART RECIPES RECOMMENDATION SECTION ("看看能做什么") */}
      {showRecipesSection && (
        <div
          id="fridge-recipes-recommendation-section"
          className="bg-gradient-to-br from-[#FFF5F7] via-white to-[#FFF9F2] rounded-3xl p-5 sm:p-6 border border-[#FFE4E8] shadow-card space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-2xl bg-[#FF6B8B] text-white flex items-center justify-center text-lg shadow-xs">
                🍳
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>AI 冰箱智能搭配推荐</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#FF6B8B] font-semibold border border-[#FFCCD5]">
                    优先消耗库存
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  根据你冰箱里的【{items.slice(0, 4).map((i) => i.food_name).join("、")}{items.length > 4 ? "等" : ""}】定制的轻食食谱
                </p>
              </div>
            </div>
            <button
              onClick={handleFetchFridgeRecipes}
              disabled={isLoadingRecipes}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#FFE4E8] text-xs font-bold text-[#FF6B8B] hover:bg-[#FFF0F3] transition-all cursor-pointer"
            >
              {isLoadingRecipes ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>换一批搭配</span>
            </button>
          </div>

          {isLoadingRecipes ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#FF6B8B] animate-spin" />
              <p className="text-sm font-bold text-gray-600">✨ 大厨 AI 正在根据你冰箱里的食材构思美味搭配...</p>
            </div>
          ) : recipeRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {recipeRecommendations.map((rec, idx) => {
                const isAllInFridge = !rec.missing_ingredients || rec.missing_ingredients.length === 0;
                const dishImg = getAccurateDishImage(rec.dish_name);

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl overflow-hidden border border-[#FFE4E8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Card Top Image */}
                    <div className="relative h-32 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={dishImg}
                        alt={rec.dish_name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getAccurateDishImage(rec.dish_name);
                        }}
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
                        ⏱️ {rec.recipe?.cooking_time || 15}分
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
                        <h4 className="text-sm font-bold text-white line-clamp-1">{rec.dish_name}</h4>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Reason */}
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2.5 bg-[#FFFDF9] p-2 rounded-xl border border-[#FAF0EE]">
                          {rec.reason}
                        </p>

                        {/* Ingredients Status */}
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <span className="font-semibold">所需食材:</span>
                            <span className="truncate max-w-[150px] font-mono text-[10px]">
                              {rec.required_ingredients?.join(" · ")}
                            </span>
                          </div>

                          {isAllInFridge ? (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> 所需食材冰箱均已齐备！🎉
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 truncate max-w-full">
                              <span>🛒 缺少:</span>
                              <span className="truncate">{rec.missing_ingredients?.join("、")}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#FAF0EE]">
                        <button
                          onClick={() => {
                            setSelectedRecipeForModal(rec);
                            setIsRecipeModalOpen(true);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#FFF0F3] text-[#FF6B8B] text-xs font-bold hover:bg-[#FFE0E6] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>查看做法</span>
                        </button>
                        <button
                          onClick={() => handleAddDishToPlate(rec)}
                          className="py-2 px-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-[#319795] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                          title="将这道菜加入今日餐盘"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>入盘</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-gray-400">
              点击上方「换一批搭配」即可生成根据冰箱食材定制的专属轻食菜单。
            </div>
          )}
        </div>
      )}

      {/* 3. Filter & Search Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2E8F0] shadow-2xs space-y-3.5">
        {/* Storage Method Filter (冷藏 / 冷冻 / 常温) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100 pb-2.5">
          <span className="text-xs font-bold text-gray-500 shrink-0 flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5" /> 储存方式:
          </span>
          <button
            onClick={() => setSelectedStorageMethod("全部")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedStorageMethod === "全部"
                ? "bg-[#234E52] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部 ({storageCounts["全部"] || 0})
          </button>
          {storageMethods.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStorageMethod(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                selectedStorageMethod === s
                  ? "bg-[#319795] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{storageMethodIcons[s].icon}</span>
              <span>{storageMethodIcons[s].label}</span>
              <span className="text-[10px] opacity-80">({storageCounts[s] || 0})</span>
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("全部")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === "全部"
                ? "bg-[#319795] text-white shadow-xs"
                : "bg-[#F7FAFC] text-[#4A5568] hover:bg-[#EDF2F7]"
            }`}
          >
            全部分类 ({categoryCounts["全部"] || 0})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-[#319795] text-white shadow-xs"
                  : "bg-[#F7FAFC] text-[#4A5568] hover:bg-[#EDF2F7]"
              }`}
            >
              <span>{categoryEmojis[cat]}</span>
              <span>{cat}</span>
              <span className="text-[10px] opacity-80">({categoryCounts[cat] || 0})</span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A0AEC0] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索冰箱中的食材名称（如：鸡胸肉、西蓝花、番茄...）"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F7FAFC] border border-[#E2E8F0] text-sm text-[#2D3748] placeholder-[#A0AEC0] focus:outline-none focus:border-[#319795] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#4A5568]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8F0] shadow-card space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#E6FFFA] flex items-center justify-center mx-auto text-3xl">
            🧊
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#2D3748]">
              {searchQuery ? "没有找到匹配的食材" : "当前筛选条件下没有食材~"}
            </h3>
            <p className="text-xs text-[#718096]">
              {searchQuery ? "换个搜索词试试吧" : "点击下方「添加食材」，将买好的美味存入冰箱吧！"}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#319795] text-white text-xs font-bold shadow-xs hover:bg-[#285E61] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>添加食材</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const daysLeft = getDaysUntilExpiry(item.expiry_date);
            const isExpired = daysLeft !== null && daysLeft < 0;
            const isExpiringWithin3Days = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
            const storage = item.storage_method || "冷藏";

            return (
              <div
                key={item.id}
                id={`fridge-item-${item.id}`}
                className={`relative bg-white rounded-3xl p-5 border transition-all duration-200 hover:shadow-card flex flex-col justify-between ${
                  isExpired
                    ? "border-red-300 bg-red-50/30"
                    : isExpiringWithin3Days
                    ? "border-amber-300 bg-amber-50/30"
                    : "border-[#E2E8F0]"
                }`}
              >
                <div>
                  {/* Top row: Emoji, Name, Category pill, Storage method, Expiry pill */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#EDF2F7] flex items-center justify-center text-2xl shadow-2xs shrink-0">
                        {item.emoji || categoryEmojis[item.category] || "🥗"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2E8F0] text-[#4A5568]">
                            {item.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${storageMethodIcons[storage].bg} ${storageMethodIcons[storage].text}`}
                          >
                            {storageMethodIcons[storage].icon} {storage}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#2D3748] mt-0.5 line-clamp-1">
                          {item.food_name}
                        </h4>
                      </div>
                    </div>

                    {/* Expiry Status Pill (Red for expired, Orange for <= 3 days, Green for normal) */}
                    {daysLeft !== null && (
                      <div className="shrink-0">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 shadow-2xs animate-pulse">
                            已过期 {Math.abs(daysLeft)} 天
                          </span>
                        ) : daysLeft === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs animate-bounce">
                            ⚠️ 今天到期
                          </span>
                        ) : daysLeft === 1 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                            🔥 剩余 1 天
                          </span>
                        ) : daysLeft <= 3 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                            ⏳ 剩余 {daysLeft} 天
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🍃 剩余 {daysLeft} 天
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity and Expiry Details Display */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F7FAFC] rounded-2xl p-2.5 text-xs text-[#4A5568] mb-4">
                    <div>
                      <span className="text-[10px] text-[#A0AEC0] block font-semibold">库存数量</span>
                      <span className="font-extrabold text-[#2D3748] text-sm">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#A0AEC0] block font-semibold">
                        {item.purchase_date ? `购于 ${item.purchase_date.slice(5)}` : "到期日"}
                      </span>
                      <span className="font-semibold text-[#4A5568] truncate block">
                        {item.expiry_date ? `至 ${item.expiry_date}` : "未设置"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-[#EDF2F7]">
                  {onAddToPlate ? (
                    <button
                      onClick={() => handleDirectAddToPlate(item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#319795] hover:text-[#234E52] py-1 px-2.5 rounded-xl hover:bg-[#E6FFFA] transition-all cursor-pointer"
                      title="直接加入今日餐盘"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>入盘做菜</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded-xl text-[#718096] hover:text-[#2D3748] hover:bg-[#EDF2F7] transition-all cursor-pointer"
                      title="编辑食材"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定要将「${item.food_name}」从冰箱移除吗？`)) {
                          onDeleteItem(item.id);
                          showToast(`已将「${item.food_name}」移除冰箱`);
                        }
                      }}
                      className="p-2 rounded-xl text-[#E53E3E] hover:bg-[#FFF5F5] transition-all cursor-pointer"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Bottom Inventory Summary Bar & "看看能做什么" CTA */}
      <div className="bg-gradient-to-r from-[#234E52] via-[#285E61] to-[#319795] rounded-3xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0">
            🧊
          </div>
          <div>
            <h4 className="font-extrabold text-base">
              冰箱当前共存储 <span className="text-[#81E6D9]">{totalCount}</span> 种食材
            </h4>
            <p className="text-xs text-white/85">
              {expiringSoonCount > 0
                ? `有 ${expiringSoonCount} 种食材临期（≤3天），建议点击右侧让 AI 优先为您消耗烹饪！`
                : "食材保鲜良好，合理规划每一餐，快乐健康吃出好身材~ ✨"}
            </p>
          </div>
        </div>

        <button
          onClick={handleFetchFridgeRecipes}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B8B] to-[#FF8E53] text-white text-xs font-extrabold shadow-md hover:opacity-95 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>看看能做什么菜</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. ADD INGREDIENT MODAL (With Auto Defaults for Unit, Shelf Life, Storage Method) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#E2E8F0] shadow-2xl animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EDF2F7] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧊</span>
                <div>
                  <h3 className="font-extrabold text-lg text-[#2D3748]">添加食材到冰箱</h3>
                  <p className="text-[11px] text-gray-400">选择食物自动预填保质期与储存方式</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-[#A0AEC0] hover:text-[#4A5568] hover:bg-[#EDF2F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search from Food Database */}
            <div>
              <label className="block text-xs font-bold text-[#4A5568] mb-1.5">
                从食物库快速选择（自动填充默认单位与保质期）：
              </label>
              <div className="relative mb-2">
                <Search className="w-4 h-4 text-[#A0AEC0] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  placeholder="搜索食物，如：鲜嫩鸡胸肉、西蓝花、鸡蛋、香蕉..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-xs text-[#2D3748] focus:outline-none focus:border-[#319795]"
                />
              </div>

              {/* Suggestions chips */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 scrollbar-none">
                {searchedFoodSuggestions.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleSelectFoodSuggestion(food)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EDF2F7] text-[11px] font-semibold text-[#2D3748] hover:bg-[#E6FFFA] hover:text-[#234E52] transition-all cursor-pointer"
                  >
                    <span>{food.emoji}</span>
                    <span>{food.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-3.5 pt-1">
              {/* Food Name */}
              <div>
                <label className="block text-xs font-bold text-[#4A5568] mb-1">
                  食材名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  placeholder="例如：鲜嫩鸡胸肉、沙瓤番茄..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-sm text-[#2D3748] focus:outline-none focus:border-[#319795]"
                />
              </div>

              {/* Storage Method (冷藏 / 冷冻 / 常温) */}
              <div>
                <label className="block text-xs font-bold text-[#4A5568] mb-1.5">储存方式</label>
                <div className="grid grid-cols-3 gap-2">
                  {storageMethods.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, storage_method: s })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.storage_method === s
                          ? "bg-[#E6FFFA] border-[#319795] text-[#234E52] scale-102 shadow-2xs font-extrabold"
                          : "bg-[#F7FAFC] border-transparent text-[#718096] hover:bg-[#EDF2F7]"
                      }`}
                    >
                      <span>{storageMethodIcons[s].icon}</span>
                      <span>{storageMethodIcons[s].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#4A5568] mb-1.5">食材类别</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          category: cat,
                          emoji: categoryEmojis[cat],
                        })
                      }
                      className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        formData.category === cat
                          ? "bg-[#E6FFFA] border-[#319795] text-[#234E52] scale-102 shadow-2xs"
                          : "bg-[#F7FAFC] border-transparent text-[#718096] hover:bg-[#EDF2F7]"
                      }`}
                    >
                      <span>{categoryEmojis[cat]}</span>
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] mb-1">数量</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-sm text-[#2D3748] focus:outline-none focus:border-[#319795]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] mb-1">单位</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-sm text-[#2D3748] focus:outline-none focus:border-[#319795]"
                  >
                    <option value="克">克 (g)</option>
                    <option value="个">个</option>
                    <option value="盒">盒</option>
                    <option value="袋">袋</option>
                    <option value="瓶">瓶</option>
                    <option value="千克">千克 (kg)</option>
                    <option value="毫升">毫升 (ml)</option>
                    <option value="份">份</option>
                  </select>
                </div>
              </div>

              {/* Purchase Date & Shelf Life */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] mb-1">购买日期</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => handlePurchaseDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-xs text-[#2D3748] focus:outline-none focus:border-[#319795]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] mb-1">保质天数 (天)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.shelf_life_days}
                    onChange={(e) => handleShelfLifeChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-xs text-[#2D3748] focus:outline-none focus:border-[#319795]"
                  />
                </div>
              </div>

              {/* Expiry Date Display / Override */}
              <div className="p-3 rounded-2xl bg-[#FFF9EE] border border-[#FFE8B8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#92400E] font-semibold block">计算到期日期：</span>
                  <span className="text-xs font-bold text-[#D97706] font-mono">
                    {formData.expiry_date || "请选择"}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[3, 5, 7, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleShelfLifeChange(d)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                        formData.shelf_life_days === d
                          ? "bg-[#D97706] text-white border-[#D97706]"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {d}天
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#718096] hover:bg-[#EDF2F7]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#319795] to-[#38B2AC] text-white text-xs font-bold shadow-glow-green hover:opacity-95 transition-all cursor-pointer"
                >
                  确认存入冰箱
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E2E8F0] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EDF2F7] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h3 className="font-extrabold text-base text-[#2D3748]">修改食材信息</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-full text-[#A0AEC0] hover:text-[#4A5568]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#4A5568] mb-1">食材名称</label>
                <input
                  type="text"
                  required
                  value={editingItem.food_name}
                  onChange={(e) => setEditingItem({ ...editingItem, food_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-sm text-[#2D3748]"
                />
              </div>

              {/* Storage Method */}
              <div>
                <label className="block text-xs font-bold text-[#4A5568] mb-1">储存方式</label>
                <div className="grid grid-cols-3 gap-2">
                  {storageMethods.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, storage_method: s })}
                      className={`py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        (editingItem.storage_method || "冷藏") === s
                          ? "bg-[#E6FFFA] border-[#319795] text-[#234E52] font-bold"
                          : "bg-[#F7FAFC] border-transparent text-[#718096]"
                      }`}
                    >
                      <span>{storageMethodIcons[s].icon}</span>
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] mb-1">数量</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, quantity: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-sm text-[#2D3748]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] mb-1">单位</label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-sm text-[#2D3748]"
                  >
                    <option value="克">克 (g)</option>
                    <option value="个">个</option>
                    <option value="盒">盒</option>
                    <option value="袋">袋</option>
                    <option value="瓶">瓶</option>
                    <option value="千克">千克 (kg)</option>
                    <option value="毫升">毫升 (ml)</option>
                    <option value="份">份</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] mb-1">购买日期</label>
                  <input
                    type="date"
                    value={editingItem.purchase_date || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        purchase_date: e.target.value,
                        expiry_date: editingItem.shelf_life_days
                          ? calculateExpiryDate(e.target.value, editingItem.shelf_life_days)
                          : editingItem.expiry_date,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-xs text-[#2D3748]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#4A5568] mb-1">到期日期</label>
                  <input
                    type="date"
                    value={editingItem.expiry_date || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-xs text-[#2D3748]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#718096]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#319795] text-white text-xs font-bold shadow-glow-green"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. ILLUSTRATED RECIPE TUTORIAL MODAL */}
      <DishRecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => {
          setIsRecipeModalOpen(false);
          setSelectedRecipeForModal(null);
        }}
        dishName={selectedRecipeForModal?.dish_name || "精选健康食谱"}
        imageKeyword={selectedRecipeForModal?.image_keyword || selectedRecipeForModal?.dish_name}
        coverImageUrl={getAccurateDishImage(selectedRecipeForModal?.dish_name || "")}
        reason={selectedRecipeForModal?.reason}
        recipe={selectedRecipeForModal?.recipe || null}
        onAddToPlate={
          selectedRecipeForModal
            ? () => handleAddDishToPlate(selectedRecipeForModal)
            : undefined
        }
      />
    </div>
  );
};
