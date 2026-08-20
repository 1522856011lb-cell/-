import React, { useState, useEffect, useRef } from "react";
import { FoodDiaryEntry, MealType, MetabolicMetrics } from "../types";
import {
  Plus,
  Trash2,
  Sparkles,
  Flame,
  CheckCircle2,
  ChevronRight,
  Loader2,
  X,
  Camera,
  Search,
  Zap,
  Upload,
  RefreshCw,
  Info,
  Check,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface FoodDiaryProps {
  entries: FoodDiaryEntry[];
  metrics: MetabolicMetrics;
  onAddEntry: (entry: Omit<FoodDiaryEntry, "id" | "created_at">) => void;
  onDeleteEntry: (id: string) => void;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({
  entries,
  metrics,
  onAddEntry,
  onDeleteEntry,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"photo" | "search" | "quick">("photo");

  // Daily advice state
  const [dailyAdvice, setDailyAdvice] = useState<{
    advice: string;
    focus_macro: string;
    status: string;
    icon: string;
  } | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  // Photo recognition states
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoNotes, setPhotoNotes] = useState("");
  const [isPhotoAnalyzing, setIsPhotoAnalyzing] = useState(false);
  const [photoResult, setPhotoResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSearchFood, setSelectedSearchFood] = useState<any | null>(null);
  const [searchPortion, setSearchPortion] = useState<number>(100);

  // Quick / Natural text states
  const [quickText, setQuickText] = useState("");
  const [isQuickAnalyzing, setIsQuickAnalyzing] = useState(false);
  const [quickParsedFoods, setQuickParsedFoods] = useState<any[]>([]);

  // Shared Form Fields for final submission
  const [foodName, setFoodName] = useState("");
  const [portionG, setPortionG] = useState<number>(150);
  const [calories, setCalories] = useState<number>(200);
  const [proteinG, setProteinG] = useState<number>(15);
  const [carbsG, setCarbsG] = useState<number>(20);
  const [fatG, setFatG] = useState<number>(5);
  const [fiberG, setFiberG] = useState<number>(3);
  const [mealType, setMealType] = useState<MealType>("午餐");
  const [emoji, setEmoji] = useState("🥗");
  const [nutritionAdvice, setNutritionAdvice] = useState<string | null>(null);

  // Calculate today's totals
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = Number(entries.reduce((sum, e) => sum + e.protein_g, 0).toFixed(1));
  const totalCarbs = Number(entries.reduce((sum, e) => sum + e.carbs_g, 0).toFixed(1));
  const totalFat = Number(entries.reduce((sum, e) => sum + e.fat_g, 0).toFixed(1));
  const totalFiber = Number(entries.reduce((sum, e) => sum + (e.fiber_g || 0), 0).toFixed(1));

  const remainingCalories = metrics.targetCalories - totalCalories;
  const caloriePercent = Math.min(100, Math.round((totalCalories / metrics.targetCalories) * 100));

  const proteinPercent = Math.min(100, Math.round((totalProtein / metrics.macros.proteinG) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / metrics.macros.carbsG) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / metrics.macros.fatG) * 100));
  const fiberPercent = Math.min(100, Math.round((totalFiber / metrics.macros.fiberG) * 100));

  const mealSections: MealType[] = ["早餐", "午餐", "晚餐", "加餐"];

  // Fetch real-time AI daily advice
  const fetchDailyAdvice = async () => {
    setAdviceLoading(true);
    try {
      const res = await fetch("/api/daily-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          today_calories: totalCalories,
          today_protein: totalProtein,
          today_carbs: totalCarbs,
          today_fat: totalFat,
          target_calories: metrics.targetCalories,
          target_protein: metrics.macros.proteinG,
          target_carbs: metrics.macros.carbsG,
          target_fat: metrics.macros.fatG,
          diary_entries: entries,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDailyAdvice(data);
      }
    } catch (e) {
      console.warn("Failed to fetch daily advice", e);
    } finally {
      setAdviceLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAdvice();
  }, [entries.length, totalCalories]);

  // Handle Photo Upload & Recognition
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setPhotoBase64(base64);
      setPhotoResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzePhoto = async () => {
    if (!photoBase64) return;
    setIsPhotoAnalyzing(true);
    setPhotoResult(null);

    try {
      const res = await fetch("/api/identify-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: photoBase64,
          notes: photoNotes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPhotoResult(data);
        setFoodName(data.food_name || "AI 识别轻食");
        setPortionG(data.portion_g || 180);
        setCalories(data.calories || 240);
        setProteinG(data.protein_g || 16);
        setCarbsG(data.carbs_g || 22);
        setFatG(data.fat_g || 6);
        setFiberG(data.fiber_g || 4);
        setEmoji(data.emoji || "🥗");
        setNutritionAdvice(data.advice || "色彩搭配超有食欲，营养均衡！✨");
      }
    } catch (err) {
      console.error("Photo analysis error:", err);
    } finally {
      setIsPhotoAnalyzing(false);
    }
  };

  // Handle Search
  const handleSearchSubmit = async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) return;
    setIsSearching(true);
    setSelectedSearchFood(null);

    try {
      const res = await fetch(`/api/nutritionix/search?query=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.common || []);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchFood = (item: any) => {
    setSelectedSearchFood(item);
    setFoodName(item.food_name);
    setPortionG(item.serving_qty * (item.serving_unit === "克" ? 1 : 100) || 100);
    setCalories(item.calories || 120);
    setProteinG(item.protein_g || 6);
    setCarbsG(item.carbs_g || 18);
    setFatG(item.fat_g || 3);
    setFiberG(item.fiber_g || 2);
    setEmoji(item.emoji || "🥗");
  };

  // Handle Quick / Natural text analysis
  const handleQuickNaturalParse = async () => {
    if (!quickText.trim()) return;
    setIsQuickAnalyzing(true);
    setQuickParsedFoods([]);

    try {
      const res = await fetch("/api/nutritionix/natural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: quickText }),
      });
      if (res.ok) {
        const data = await res.json();
        const foods = data.foods || [];
        setQuickParsedFoods(foods);
        if (foods.length > 0) {
          const first = foods[0];
          setFoodName(first.food_name);
          setPortionG(first.serving_weight_grams || 150);
          setCalories(Math.round(first.nf_calories || 200));
          setProteinG(Number((first.nf_protein || 10).toFixed(1)));
          setCarbsG(Number((first.nf_total_carbohydrate || 20).toFixed(1)));
          setFatG(Number((first.nf_total_fat || 5).toFixed(1)));
          setFiberG(Number((first.nf_dietary_fiber || 3).toFixed(1)));
          setEmoji(first.emoji || "🥗");
        }
      }
    } catch (err) {
      console.error("Quick parse error:", err);
    } finally {
      setIsQuickAnalyzing(false);
    }
  };

  // Save entry
  const handleSaveFood = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!foodName.trim()) return;

    onAddEntry({
      food_name: foodName,
      portion_g: portionG,
      calories,
      protein_g: proteinG,
      carbs_g: carbsG,
      fat_g: fatG,
      fiber_g: fiberG,
      meal_type: mealType,
      emoji: emoji || "🥗",
    });

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#FF9AA2", "#FFB7B2", "#FFDAC1", "#B5EAD7"],
      });
    } catch (_) {}

    // Reset & Close
    resetModal();
    setModalOpen(false);
  };

  const resetModal = () => {
    setFoodName("");
    setPhotoPreview(null);
    setPhotoBase64(null);
    setPhotoResult(null);
    setPhotoNotes("");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedSearchFood(null);
    setQuickText("");
    setQuickParsedFoods([]);
    setNutritionAdvice(null);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto px-4 pt-4">
      {/* 1. Real-time AI Daily Advice Banner */}
      <div
        id="daily-advice-banner"
        className="rounded-3xl bg-gradient-to-r from-[#FFF5F7] via-[#FFF9F5] to-[#F5F3FF] p-4 sm:p-5 border border-[#FFE4E8] shadow-xs flex items-start justify-between gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-[#FFCCD5] flex items-center justify-center text-xl shrink-0">
            {dailyAdvice?.icon || "✨"}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#E03164] bg-white px-2 py-0.5 rounded-full border border-[#FFCCD5]">
                AI 实时营养顾问
              </span>
              <span className="text-[11px] text-[#9A8A87]">根据今日摄入与目标动态建议</span>
            </div>
            <p className="text-sm font-semibold text-[#3E3230] leading-relaxed">
              {adviceLoading ? (
                <span className="inline-flex items-center gap-2 text-[#9A8A87]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF6B8B]" />
                  正在智能分析今日营养结构...
                </span>
              ) : (
                dailyAdvice?.advice ||
                "今日蛋白质摄入还差约 20g，晚餐建议加一个水煮蛋或一块香煎鸡胸肉哦🥛✨"
              )}
            </p>
          </div>
        </div>
        <button
          id="btn-refresh-advice"
          onClick={fetchDailyAdvice}
          disabled={adviceLoading}
          className="p-2 rounded-xl bg-white border border-[#EEDDD9] text-[#7A6B68] hover:text-[#E03164] hover:border-[#FFCCD5] transition-all cursor-pointer shrink-0"
          title="刷新建议"
        >
          <RefreshCw className={`w-4 h-4 ${adviceLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* 2. Nutrition Summary & Target Comparison Hero */}
      <div
        id="today-summary-hero"
        className="rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-[#FFF9F5] to-[#F5F3FF] p-6 border border-[#FFE4E8] shadow-card space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-bold text-[#E03164] border border-[#FFCCD5] shadow-xs mb-1">
              <span>🥗</span>
              <span>今日饮食摄入与热量进度</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E3230]">
              今日摄入 <span className="text-[#FF4D79]">{totalCalories}</span> / {metrics.targetCalories} kcal
            </h2>
          </div>

          <button
            id="btn-open-add-food"
            onClick={() => {
              resetModal();
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6B8B] to-[#FF8DA1] text-white font-bold text-sm shadow-glow-pink hover:opacity-95 active:scale-98 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>记一笔 (拍照 / 搜索 / AI)</span>
          </button>
        </div>

        {/* Big Calorie Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#7D6B68]">
              已摄入 {caloriePercent}%{" "}
              {remainingCalories >= 0
                ? `· 尚余 ${remainingCalories} kcal`
                : `· 略超 ${Math.abs(remainingCalories)} kcal`}
            </span>
            <span className={remainingCalories >= 0 ? "text-[#38A169]" : "text-[#E53E3E]"}>
              {remainingCalories >= 0 ? "处于热量缺口中 ✨" : "可适当增加运动消耗 🏃‍♀️"}
            </span>
          </div>
          <div className="h-4 w-full rounded-full bg-white border border-[#F3E5E3] overflow-hidden p-0.5 shadow-inner">
            <div
              style={{ width: `${Math.min(100, caloriePercent)}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                caloriePercent > 100
                  ? "bg-gradient-to-r from-[#FF8DA1] to-[#E53E3E]"
                  : "bg-gradient-to-r from-[#FF9AA2] via-[#FFB7B2] to-[#FF8DA1]"
              }`}
            ></div>
          </div>
        </div>

        {/* Macro Progress 4-Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Protein */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#FFD6DF] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#D53F8C]">
              <span>🥩 蛋白质</span>
              <span>{proteinPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1 text-[#3E3230]">
              <span className="text-lg font-extrabold">{totalProtein}</span>
              <span className="text-xs text-[#8C7A78]">/ {metrics.macros.proteinG}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#FAF5F4] rounded-full overflow-hidden">
              <div
                style={{ width: `${proteinPercent}%` }}
                className="h-full bg-[#FF6B8B] rounded-full"
              ></div>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#FEEBC8] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#DD6B20]">
              <span>🌾 碳水</span>
              <span>{carbsPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1 text-[#3E3230]">
              <span className="text-lg font-extrabold">{totalCarbs}</span>
              <span className="text-xs text-[#8C7A78]">/ {metrics.macros.carbsG}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#FAF5F4] rounded-full overflow-hidden">
              <div
                style={{ width: `${carbsPercent}%` }}
                className="h-full bg-[#ED8936] rounded-full"
              ></div>
            </div>
          </div>

          {/* Fat */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#C6F6D5] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#2F855A]">
              <span>🥑 脂肪</span>
              <span>{fatPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1 text-[#3E3230]">
              <span className="text-lg font-extrabold">{totalFat}</span>
              <span className="text-xs text-[#8C7A78]">/ {metrics.macros.fatG}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#FAF5F4] rounded-full overflow-hidden">
              <div
                style={{ width: `${fatPercent}%` }}
                className="h-full bg-[#48BB78] rounded-full"
              ></div>
            </div>
          </div>

          {/* Fiber */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-[#E9D8FD] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#805AD5]">
              <span>🥦 膳食纤维</span>
              <span>{fiberPercent}%</span>
            </div>
            <div className="flex items-baseline gap-1 text-[#3E3230]">
              <span className="text-lg font-extrabold">{totalFiber}</span>
              <span className="text-xs text-[#8C7A78]">/ {metrics.macros.fiberG}g</span>
            </div>
            <div className="h-1.5 w-full bg-[#FAF5F4] rounded-full overflow-hidden">
              <div
                style={{ width: `${fiberPercent}%` }}
                className="h-full bg-[#9F7AEA] rounded-full"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grouped Meal List */}
      <div className="space-y-4">
        {mealSections.map((meal) => {
          const mealEntries = entries.filter((e) => e.meal_type === meal);
          const mealCalories = mealEntries.reduce((sum, e) => sum + e.calories, 0);

          return (
            <div
              key={meal}
              id={`meal-card-${meal}`}
              className="bg-white rounded-3xl p-5 border border-[#F3E5E3] shadow-card space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#FAF5F4] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {meal === "早餐" ? "🌅" : meal === "午餐" ? "☀️" : meal === "晚餐" ? "🌙" : "🍵"}
                  </span>
                  <h3 className="font-bold text-base text-[#3E3230]">{meal}</h3>
                  <span className="text-xs text-[#9B8986] font-semibold">
                    ({mealEntries.length} 样食物)
                  </span>
                </div>
                <div className="text-xs font-extrabold text-[#E03164] bg-[#FFF0F3] px-2.5 py-1 rounded-full border border-[#FFD6DF]">
                  共 {mealCalories} kcal
                </div>
              </div>

              {mealEntries.length === 0 ? (
                <div className="py-4 text-center text-xs text-[#B5A5A3] flex items-center justify-center gap-2">
                  <span>🍃</span>
                  <span>暂无{meal}记录，点击添加一份元气美味吧~</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {mealEntries.map((item) => (
                    <div
                      key={item.id}
                      id={`food-entry-${item.id}`}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFDF9] hover:bg-[#FAF7F5] border border-[#F5EAE8] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.emoji || "🥗"}</span>
                        <div>
                          <h4 className="font-bold text-sm text-[#3E3230]">{item.food_name}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-[#8C7A78] mt-0.5">
                            <span>份量: {item.portion_g}g</span>
                            <span>·</span>
                            <span>蛋 {item.protein_g}g</span>
                            <span>·</span>
                            <span>碳 {item.carbs_g}g</span>
                            <span>·</span>
                            <span>脂 {item.fat_g}g</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-[#3E3230]">
                            {item.calories}
                          </span>
                          <span className="text-[10px] text-[#9B8986] ml-0.5">kcal</span>
                        </div>
                        <button
                          id={`btn-delete-entry-${item.id}`}
                          onClick={() => onDeleteEntry(item.id)}
                          className="opacity-60 hover:opacity-100 p-1.5 rounded-xl hover:bg-[#FFE4E8] text-[#E53E3E] transition-all cursor-pointer"
                          title="删除记录"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Logging Modal with 3 Tabs: Photo Recognition, Search, Quick Add */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#FFE4E8] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F7EBE8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F3] text-[#FF6B8B] flex items-center justify-center font-bold">
                  ✨
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#3E3230]">添加饮食记录</h3>
                  <p className="text-xs text-[#8C7A78]">AI 视觉识别 / 搜索 / 极速记录</p>
                </div>
              </div>
              <button
                id="btn-close-food-modal"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F7EBE8] text-[#7A6B68] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Tab Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF5F4] rounded-2xl">
              <button
                id="tab-mode-photo"
                type="button"
                onClick={() => setActiveTab("photo")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "photo"
                    ? "bg-white text-[#FF4D79] shadow-xs"
                    : "text-[#7A6B68] hover:text-[#3E3230]"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📸 拍照识别</span>
              </button>
              <button
                id="tab-mode-search"
                type="button"
                onClick={() => setActiveTab("search")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "search"
                    ? "bg-white text-[#48BB78] shadow-xs"
                    : "text-[#7A6B68] hover:text-[#3E3230]"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>🔍 搜索食物</span>
              </button>
              <button
                id="tab-mode-quick"
                type="button"
                onClick={() => setActiveTab("quick")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "quick"
                    ? "bg-white text-[#805AD5] shadow-xs"
                    : "text-[#7A6B68] hover:text-[#3E3230]"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ AI 语言</span>
              </button>
            </div>

            {/* TAB 1: 拍照视觉识别 (Gemini Vision) */}
            {activeTab === "photo" && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  className="hidden"
                />

                {!photoPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#FFCCD5] hover:border-[#FF6B8B] bg-[#FFF9FA] rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-[#FFF0F3] group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-[#FF6B8B] mb-2 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm text-[#3E3230]">点击上传或拍摄餐食照片</h4>
                    <p className="text-xs text-[#9A8A87] mt-1">
                      Gemini Vision 智能识别菜品、估算份量与宏量营养
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-[#FFCCD5] max-h-48 flex items-center justify-center bg-black/5">
                      <img
                        src={photoPreview}
                        alt="Food preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setPhotoBase64(null);
                          setPhotoResult(null);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={photoNotes}
                      onChange={(e) => setPhotoNotes(e.target.value)}
                      placeholder="补充说明（如：少油、去皮、大份）可选"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF5F4] border border-[#F3E5E3] text-xs focus:bg-white focus:border-[#FF6B8B] focus:outline-hidden"
                    />

                    <button
                      id="btn-analyze-photo"
                      type="button"
                      onClick={handleAnalyzePhoto}
                      disabled={isPhotoAnalyzing}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B8B] to-[#FF8DA1] text-white font-bold text-xs shadow-glow-pink hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isPhotoAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI 视觉正在精密计算营养...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>识别照片营养成分</span>
                        </>
                      )}
                    </button>

                    {photoResult && (
                      <div className="bg-[#FFF9FA] border border-[#FFD6DF] rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#E03164]">
                            ✨ 识别结果: {photoResult.food_name}
                          </span>
                          <span className="text-[10px] bg-[#E6F4EA] text-[#2F855A] font-bold px-2 py-0.5 rounded-full">
                            置信度 {Math.round(photoResult.confidence * 100)}%
                          </span>
                        </div>
                        {photoResult.detected_items && (
                          <div className="flex flex-wrap gap-1">
                            {photoResult.detected_items.map((item: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-[#FFCCD5] text-[#7A6B68]"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-[#635552] italic">{photoResult.advice}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: 搜索食物 (Nutritionix / 食物库) */}
            {activeTab === "search" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-[#9A8A87]" />
                    <input
                      id="input-food-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                      placeholder="搜索食物 (如: 番茄炒蛋、全麦面包、鸡胸肉...)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF5F4] border border-[#F3E5E3] text-xs focus:bg-white focus:border-[#48BB78] focus:outline-hidden"
                    />
                  </div>
                  <button
                    id="btn-search-food"
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    disabled={isSearching}
                    className="px-4 py-2 bg-[#48BB78] hover:bg-[#38A169] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>搜索</span>
                  </button>
                </div>

                {/* Quick search shortcuts */}
                <div className="flex flex-wrap gap-1.5">
                  {["水煮蛋", "香煎鸡胸肉", "燕麦片", "低脂牛奶", "全麦吐司", "牛油果"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        handleSearchSubmit(tag);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#FAF5F4] hover:bg-[#EBFBEE] hover:text-[#2F855A] text-[#7A6B68] border border-[#EEDDD9] transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Search Results List */}
                {searchResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#EEDDD9] rounded-2xl p-2 bg-[#FFFDF9]">
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSearchFood(item)}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          selectedSearchFood?.food_name === item.food_name
                            ? "bg-[#EBFBEE] border border-[#A8E6CF]"
                            : "hover:bg-[#FAF5F4]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji || "🥗"}</span>
                          <div>
                            <h5 className="font-bold text-xs text-[#3E3230]">{item.food_name}</h5>
                            <span className="text-[10px] text-[#8C7A78]">
                              每{item.serving_qty}{item.serving_unit || "克"}: 蛋 {item.protein_g}g · 碳 {item.carbs_g}g · 脂 {item.fat_g}g
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[#48BB78]">
                            {item.calories}
                          </span>
                          <span className="text-[10px] text-[#9A8A87] ml-0.5">kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: 极速文字 / AI 自然语言 */}
            {activeTab === "quick" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <textarea
                    id="input-quick-text"
                    value={quickText}
                    onChange={(e) => setQuickText(e.target.value)}
                    placeholder="输入自然语言（例如：中午吃了一份黑椒牛柳意面加一杯无糖红茶，200克）"
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5F4] border border-[#F3E5E3] text-xs focus:bg-white focus:border-[#805AD5] focus:outline-hidden"
                  />
                  <button
                    id="btn-quick-parse"
                    type="button"
                    onClick={handleQuickNaturalParse}
                    disabled={isQuickAnalyzing}
                    className="w-full py-2 bg-gradient-to-r from-[#805AD5] to-[#9F7AEA] text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isQuickAnalyzing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>AI 正在自然语言解析营养...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>智能解析食物成分</span>
                      </>
                    )}
                  </button>
                </div>

                {quickParsedFoods.length > 0 && (
                  <div className="space-y-1.5 bg-[#FAF5FF] p-3 rounded-2xl border border-[#E9D8FD]">
                    <span className="text-xs font-bold text-[#805AD5]">
                      ✨ 已解析 {quickParsedFoods.length} 样食物:
                    </span>
                    {quickParsedFoods.map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-xs text-[#4A3E3D]">
                        <span>{f.emoji || "🥗"} {f.food_name} ({f.serving_weight_grams}g)</span>
                        <span className="font-bold text-[#805AD5]">{Math.round(f.nf_calories)} kcal</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shared Structured Editor Form for Final Confirmation */}
            <form onSubmit={handleSaveFood} className="space-y-4 pt-2 border-t border-[#F7EBE8]">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A6B68]">食物名称</label>
                  <input
                    id="input-confirm-food-name"
                    type="text"
                    required
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="如：香煎鸡胸肉"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5F4] border border-[#F3E5E3] text-xs font-bold text-[#3E3230] focus:bg-white focus:border-[#FF6B8B] focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#7A6B68]">所属餐次</label>
                  <select
                    id="select-confirm-meal-type"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF5F4] border border-[#F3E5E3] text-xs font-bold text-[#3E3230] focus:bg-white focus:border-[#FF6B8B] focus:outline-hidden"
                  >
                    <option value="早餐">🌅 早餐</option>
                    <option value="午餐">☀️ 午餐</option>
                    <option value="晚餐">🌙 晚餐</option>
                    <option value="加餐">🍵 加餐</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A6B68]">份量 (g)</label>
                  <input
                    id="input-confirm-portion"
                    type="number"
                    value={portionG}
                    onChange={(e) => setPortionG(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAF5F4] border border-[#F3E5E3] text-xs font-bold text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#FF6B8B]">热量 (kcal)</label>
                  <input
                    id="input-confirm-calories"
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FFF0F3] border border-[#FFCCD5] text-xs font-extrabold text-[#FF4D79] text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#3E3230]">图标 Emoji</label>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#FAF5F4] border border-[#F3E5E3] text-xs font-bold text-center"
                  />
                </div>
              </div>

              {/* Macros Breakdown Inputs */}
              <div className="grid grid-cols-4 gap-2 bg-[#FAF5F4] p-2.5 rounded-2xl border border-[#F3E5E3]">
                <div className="text-center">
                  <label className="text-[9px] font-bold text-[#D53F8C] block">蛋白 (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={proteinG}
                    onChange={(e) => setProteinG(Number(e.target.value))}
                    className="w-full text-center text-xs font-bold bg-white rounded-md py-1 mt-0.5 border border-[#FFD6DF]"
                  />
                </div>
                <div className="text-center">
                  <label className="text-[9px] font-bold text-[#DD6B20] block">碳水 (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbsG}
                    onChange={(e) => setCarbsG(Number(e.target.value))}
                    className="w-full text-center text-xs font-bold bg-white rounded-md py-1 mt-0.5 border border-[#FEEBC8]"
                  />
                </div>
                <div className="text-center">
                  <label className="text-[9px] font-bold text-[#2F855A] block">脂肪 (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fatG}
                    onChange={(e) => setFatG(Number(e.target.value))}
                    className="w-full text-center text-xs font-bold bg-white rounded-md py-1 mt-0.5 border border-[#C6F6D5]"
                  />
                </div>
                <div className="text-center">
                  <label className="text-[9px] font-bold text-[#805AD5] block">纤维 (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fiberG}
                    onChange={(e) => setFiberG(Number(e.target.value))}
                    className="w-full text-center text-xs font-bold bg-white rounded-md py-1 mt-0.5 border border-[#E9D8FD]"
                  />
                </div>
              </div>

              {nutritionAdvice && (
                <div className="text-xs text-[#8C7A78] bg-[#FFFDF9] p-2.5 rounded-xl border border-[#F5EAE8] flex items-center gap-2">
                  <span>💡</span>
                  <span>{nutritionAdvice}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-submit-diary-entry"
                type="submit"
                disabled={!foodName.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6B8B] via-[#FF8DA1] to-[#FF9AA2] text-white font-extrabold text-sm shadow-glow-pink hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>确认存入今日饮食日记</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
