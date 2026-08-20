import React, { useState } from "react";
import {
  ActivityLevel,
  BodyProfile,
  ExerciseLogEntry,
  FoodDiaryEntry,
  FridgeItem,
  Gender,
  Goal,
  MealPlateItem,
  MealType,
  MetabolicMetrics,
} from "../types";
import { calculateAllMetrics } from "../utils/calculations";
import { HealthAssessmentCard } from "./HealthAssessmentCard";
import { DailyPlanCard } from "./DailyPlanCard";
import { DailyRecommendationCard } from "./DailyRecommendationCard";
import { WeeklyReportCard } from "./WeeklyReportCard";
import { WeightTrackerCard } from "./WeightTrackerCard";
import { AccountSyncModal } from "./AccountSyncModal";
import { syncUserProfile } from "../utils/supabase";
import {
  Sparkles,
  ArrowRight,
  Flame,
  Scale,
  HeartPulse,
  PieChart,
  Info,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Cloud,
  Clock,
  DollarSign,
  Utensils,
  AlertCircle,
  Plus,
  Edit3,
  TrendingUp,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

interface HomeMetricsProps {
  profile: BodyProfile;
  diaryEntries?: FoodDiaryEntry[];
  fridgeItems?: FridgeItem[];
  exerciseLogs?: ExerciseLogEntry[];
  onUpdateProfile: (newProfile: BodyProfile) => void;
  onAddToPlate?: (item: MealPlateItem) => void;
  onStartWorkout?: (workoutData: any) => void;
  onNavigateTab: (tab: "planner" | "fridge" | "home" | "recommend" | "diary" | "workout" | "plan") => void;
}

export const HomeMetrics: React.FC<HomeMetricsProps> = ({
  profile,
  diaryEntries = [],
  fridgeItems = [],
  exerciseLogs = [],
  onUpdateProfile,
  onAddToPlate,
  onStartWorkout,
  onNavigateTab,
}) => {
  const [formData, setFormData] = useState<BodyProfile>({
    ...profile,
    taste_preference: profile.taste_preference || "清淡",
    allergies: profile.allergies || ["海鲜"],
    cooking_time: profile.cooking_time || "15-30分钟",
    budget: profile.budget || "中",
  });
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  // Profile form expand/collapse state
  const isProfileIncomplete = !profile.height_cm || !profile.weight_kg || !profile.age;
  const [isFormExpanded, setIsFormExpanded] = useState<boolean>(isProfileIncomplete);
  const [quickAddMealType, setQuickAddMealType] = useState<MealType>("早餐");
  const [quickAddSuccessMsg, setQuickAddSuccessMsg] = useState<string | null>(null);

  // Live calculated metrics
  const metrics: MetabolicMetrics = calculateAllMetrics(formData);

  // Diet calculations
  const loggedCalories = diaryEntries.reduce((sum, e) => sum + e.calories, 0);
  const loggedProtein = Number(diaryEntries.reduce((sum, e) => sum + e.protein_g, 0).toFixed(1));
  const loggedCarbs = Number(diaryEntries.reduce((sum, e) => sum + e.carbs_g, 0).toFixed(1));
  const loggedFat = Number(diaryEntries.reduce((sum, e) => sum + e.fat_g, 0).toFixed(1));
  const loggedFiber = Number(diaryEntries.reduce((sum, e) => sum + e.fiber_g, 0).toFixed(1));

  const remainingCalories = metrics.targetCalories - loggedCalories;
  const calorieProgressPct = Math.min(100, Math.round((loggedCalories / metrics.targetCalories) * 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    syncUserProfile(formData);
    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
      setIsFormExpanded(false);
    }, 1800);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12)
      return { text: "早安，元气小仙女/小达人！", emoji: "☀️", quote: "今天也要给身体补充满满活力哦~" };
    if (hour >= 12 && hour < 18)
      return { text: "午后阳光正好，记得补水哦！", emoji: "🌸", quote: "健康饮食是给身心最温柔的治愈。" };
    return { text: "晚上好，今天也辛苦啦！", emoji: "🌙", quote: "放慢呼吸，感受身体每一次轻盈蜕变。" };
  };

  const greeting = getGreeting();

  const activityDescriptions: Record<ActivityLevel, { title: string; desc: string; icon: string }> = {
    sedentary: { title: "久坐不动", desc: "办公室/学生，几乎不运动", icon: "🪑" },
    light: { title: "轻度运动", desc: "每周1-3天慢跑/快走/瑜伽", icon: "🚶‍♀️" },
    moderate: { title: "中度活跃", desc: "每周3-5天健身/有氧/跳绳", icon: "🏃‍♀️" },
    heavy: { title: "高强度", desc: "每周6-7天高频训练或重体力", icon: "🔥" },
  };

  const goalDescriptions: Record<Goal, { title: string; desc: string; badge: string; color: string }> = {
    fat_loss: {
      title: "减脂轻体",
      desc: "温和制造300-500 kcal热量缺口，控体脂雕线条",
      badge: "🔥 缺口 400 kcal",
      color: "bg-[#FFF0F3] text-[#E03164] border-[#FFD6DF]",
    },
    muscle_gain: {
      title: "增肌紧致",
      desc: "热量盈余200-300 kcal，提升代谢率与力量美感",
      badge: "💪 盈余 250 kcal",
      color: "bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]",
    },
    maintenance: {
      title: "健康维持",
      desc: "收支平衡，养成不易胖体质与持久活力",
      badge: "⚖️ 热量平衡",
      color: "bg-[#E6F4EA] text-[#2F855A] border-[#A8E6CF]",
    },
  };

  const allergyOptions = ["海鲜", "花生", "乳糖", "生麸质", "坚果", "牛羊肉", "辛辣", "大豆"];

  const toggleAllergy = (item: string) => {
    const current = formData.allergies || [];
    if (current.includes(item)) {
      setFormData({ ...formData, allergies: current.filter((a) => a !== item) });
    } else {
      setFormData({ ...formData, allergies: [...current, item] });
    }
  };

  // Quick foods list
  const quickFoods = [
    { name: "水煮蛋", portion_g: 50, calories: 72, protein_g: 6.3, carbs_g: 0.4, fat_g: 4.8, fiber_g: 0, emoji: "🥚" },
    { name: "香煎鸡胸肉", portion_g: 150, calories: 195, protein_g: 37.5, carbs_g: 0, fat_g: 3.6, fiber_g: 0, emoji: "🍗" },
    { name: "燕麦片 (熟)", portion_g: 100, calories: 68, protein_g: 2.5, carbs_g: 12.0, fat_g: 1.4, fiber_g: 1.7, emoji: "🥣" },
    { name: "脱脂牛奶", portion_g: 250, calories: 88, protein_g: 8.5, carbs_g: 12.5, fat_g: 0.5, fiber_g: 0, emoji: "🥛" },
    { name: "红富士苹果", portion_g: 200, calories: 104, protein_g: 0.6, carbs_g: 27.2, fat_g: 0.4, fiber_g: 4.8, emoji: "🍎" },
    { name: "白灼西兰花", portion_g: 150, calories: 51, protein_g: 4.2, carbs_g: 10.5, fat_g: 0.6, fiber_g: 3.9, emoji: "🥦" },
    { name: "无糖美式黑咖啡", portion_g: 250, calories: 5, protein_g: 0.3, carbs_g: 0.8, fat_g: 0.1, fiber_g: 0, emoji: "☕" },
    { name: "清蒸南瓜", portion_g: 150, calories: 39, protein_g: 1.5, carbs_g: 9.0, fat_g: 0.2, fiber_g: 2.1, emoji: "🎃" },
  ];

  const handleQuickAdd = (food: typeof quickFoods[0]) => {
    if (onAddToPlate) {
      onAddToPlate({
        cartItemId: `plate_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        id: `food_${food.name}`,
        name: food.name,
        portion_g: food.portion_g,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        fiber_g: food.fiber_g,
        meal_type: quickAddMealType,
        emoji: food.emoji,
      });

      setQuickAddSuccessMsg(`已将【${food.name}】加入【${quickAddMealType}】餐盘！`);
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
        });
      } catch (e) {}

      setTimeout(() => setQuickAddSuccessMsg(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto px-4 pt-4">
      {/* Quick Toast */}
      {quickAddSuccessMsg && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[#3E3230] text-white text-xs sm:text-sm font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFD166]" />
          <span>{quickAddSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP PRIORITY: 身体数据卡片 (Height, Weight, Age, Gender, Goal, BMI, BMR, TDEE, Calories, Macros) */}
      {/* ========================================================================= */}
      <div
        id="body-data-card"
        className="rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-[#FFF9F5] to-[#F5F3FF] p-5 sm:p-7 border border-[#FFE4E8] shadow-card relative overflow-hidden space-y-5"
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-gradient-to-br from-[#FFD6DF]/40 to-[#E9D8FD]/30 blur-2xl pointer-events-none"></div>

        {/* Header with Title & Action */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F7EBE8] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#FFCCD5] text-xs font-bold text-[#D53F8C] shadow-xs mb-1.5">
              <span>👤 身体数据与代谢档案</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B8B]"></span>
              <span className="text-[#6D5D5A]">第一优先级展示</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E3230] tracking-tight flex items-center gap-2">
              <span>{formData.gender === "female" ? "👧" : "👦"} 我的专属身体数据</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#7D6B68] font-medium mt-0.5">
              基于科学 Mifflin-St Jeor 公式实时计算你的代谢基础与营养配比
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-toggle-profile-form"
              onClick={() => setIsFormExpanded(!isFormExpanded)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                isFormExpanded
                  ? "bg-[#4A3E3D] text-white hover:bg-[#382F2E]"
                  : "bg-white hover:bg-[#FFF0F3] border border-[#FFCCD5] text-[#D53F8C]"
              }`}
            >
              {isFormExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>收起数据表单</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>{isProfileIncomplete ? "完善我的数据" : "完善 / 修改数据"}</span>
                </>
              )}
            </button>

            <button
              id="btn-open-sync-modal"
              onClick={() => setAccountModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-2.5 rounded-2xl bg-white/90 border border-[#DDD6FE] text-[#805AD5] text-xs font-bold hover:bg-[#F3E8FF] transition-all cursor-pointer"
              title="云端同步"
            >
              <Cloud className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Basic Profile Attributes Pills */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
          <div className="bg-white/90 p-2.5 rounded-2xl border border-[#FFEAEA] shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium">身高</span>
            <div className="text-sm font-black text-gray-800 mt-0.5">{formData.height_cm || "--"} <span className="text-[10px] font-normal text-gray-400">cm</span></div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-2xl border border-[#FFEAEA] shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium">体重</span>
            <div className="text-sm font-black text-gray-800 mt-0.5">{formData.weight_kg || "--"} <span className="text-[10px] font-normal text-gray-400">kg</span></div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-2xl border border-[#FFEAEA] shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium">年龄</span>
            <div className="text-sm font-black text-gray-800 mt-0.5">{formData.age || "--"} <span className="text-[10px] font-normal text-gray-400">岁</span></div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-2xl border border-[#FFEAEA] shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium">性别</span>
            <div className="text-sm font-black text-gray-800 mt-0.5">{formData.gender === "female" ? "女生 👧" : "男生 👦"}</div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-2xl border border-[#FFEAEA] shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium">身材目标</span>
            <div className="text-xs font-bold text-[#E03164] mt-1 truncate">{goalDescriptions[formData.goal].title}</div>
          </div>
          <div className="bg-white/90 p-2.5 rounded-2xl border border-[#FFEAEA] shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium">日常活动</span>
            <div className="text-xs font-bold text-[#7C3AED] mt-1 truncate">{activityDescriptions[formData.activity_level].title}</div>
          </div>
        </div>

        {/* Metabolic Calculations Cards (BMI, BMR, TDEE, Target Calories, Macros Target) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Target Calories Hero Box */}
          <div className="md:col-span-5 rounded-2xl bg-white p-4 sm:p-5 border border-[#FFCCD5] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D53F8C] uppercase tracking-wider">每日目标热量 (Target)</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[10px] font-bold text-[#E03164]">
                {goalDescriptions[formData.goal].badge}
              </span>
            </div>
            <div className="my-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-[#3E3230]">{metrics.targetCalories}</span>
                <span className="text-xs font-bold text-[#8C6D68]">kcal / 天</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F5EAEA] text-xs">
              <div>
                <span className="text-[10px] text-gray-400">总消耗 TDEE</span>
                <div className="font-bold text-gray-700">{metrics.tdee} kcal</div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400">基础代谢 BMR</span>
                <div className="font-bold text-gray-700">{metrics.bmr} kcal</div>
              </div>
            </div>
          </div>

          {/* BMI & Macros Target Breakdown */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* BMI & BMR Card */}
            <div className="bg-white p-4 rounded-2xl border border-[#FFEAEA] shadow-2xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7E6D6A]">BMI 身材指数</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${metrics.bmiCategory.badgeBg}`}>
                  {metrics.bmiCategory.label}
                </span>
              </div>
              <div className="text-2xl font-black text-[#3E3230]">{metrics.bmi}</div>
              <p className="text-[11px] text-[#8C7A78] leading-tight">{metrics.bmiCategory.advice}</p>
            </div>

            {/* Macros Target Ratio Card */}
            <div className="bg-white p-4 rounded-2xl border border-[#FFEAEA] shadow-2xs space-y-2.5">
              <span className="text-xs font-bold text-gray-700 block">三大宏量营养素目标</span>
              
              {/* Protein */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#D53F8C] mb-0.5">
                  <span>🥩 蛋白质</span>
                  <span>{metrics.macros.proteinG}g ({metrics.macros.proteinPct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#FFF0F3] rounded-full overflow-hidden">
                  <div style={{ width: `${metrics.macros.proteinPct}%` }} className="h-full bg-[#FF6B8B] rounded-full"></div>
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#DD6B20] mb-0.5">
                  <span>🌾 碳水化合物</span>
                  <span>{metrics.macros.carbsG}g ({metrics.macros.carbsPct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#FFFAF0] rounded-full overflow-hidden">
                  <div style={{ width: `${metrics.macros.carbsPct}%` }} className="h-full bg-[#ED8936] rounded-full"></div>
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-[#2F855A] mb-0.5">
                  <span>🥑 优质脂肪</span>
                  <span>{metrics.macros.fatG}g ({metrics.macros.fatPct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#F0FFF4] rounded-full overflow-hidden">
                  <div style={{ width: `${metrics.macros.fatPct}%` }} className="h-full bg-[#48BB78] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Full Profile Edit Form */}
        {isFormExpanded && (
          <div className="mt-4 pt-5 border-t border-[#F7EAE8] animate-fade-in">
            <div className="bg-white rounded-2xl p-5 border border-[#FFE4E8] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#F7EAE8] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <h3 className="font-bold text-base text-[#3E3230]">编辑身体档案与生活偏好</h3>
                </div>
                <span className="text-xs text-[#9B8986] font-semibold">修改后自动刷新每日摄入指标</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-[#6D5D5A] mb-1.5">生理性别</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="gender-female"
                      onClick={() => setFormData({ ...formData, gender: "female" })}
                      className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        formData.gender === "female"
                          ? "bg-[#FFF0F3] border-[#FF9AA2] text-[#E03164] shadow-xs"
                          : "bg-[#FAF7F5] border-transparent text-[#7E6D6A] hover:bg-[#F5EFEA]"
                      }`}
                    >
                      <span className="text-base">👧</span>
                      <span>女生 (Female)</span>
                    </button>
                    <button
                      type="button"
                      id="gender-male"
                      onClick={() => setFormData({ ...formData, gender: "male" })}
                      className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        formData.gender === "male"
                          ? "bg-[#F0F7FF] border-[#90CDF4] text-[#2B6CB0] shadow-xs"
                          : "bg-[#FAF7F5] border-transparent text-[#7E6D6A] hover:bg-[#F5EFEA]"
                      }`}
                    >
                      <span className="text-base">👦</span>
                      <span>男生 (Male)</span>
                    </button>
                  </div>
                </div>

                {/* Height, Weight, Age Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#6D5D5A] mb-1">
                      身高 <span className="text-[#A49491] font-normal">(cm)</span>
                    </label>
                    <input
                      type="number"
                      id="input-height"
                      min="100"
                      max="240"
                      step="0.5"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: Number(e.target.value) || 0 })}
                      className="w-full bg-[#FAF7F5] focus:bg-white border border-[#EADBDA] focus:border-[#FF9AA2] rounded-xl px-3 py-2 text-center font-bold text-[#3E3230] text-sm outline-hidden transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6D5D5A] mb-1">
                      体重 <span className="text-[#A49491] font-normal">(kg)</span>
                    </label>
                    <input
                      type="number"
                      id="input-weight"
                      min="30"
                      max="200"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: Number(e.target.value) || 0 })}
                      className="w-full bg-[#FAF7F5] focus:bg-white border border-[#EADBDA] focus:border-[#FF9AA2] rounded-xl px-3 py-2 text-center font-bold text-[#3E3230] text-sm outline-hidden transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6D5D5A] mb-1">
                      年龄 <span className="text-[#A49491] font-normal">(岁)</span>
                    </label>
                    <input
                      type="number"
                      id="input-age"
                      min="12"
                      max="100"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || 0 })}
                      className="w-full bg-[#FAF7F5] focus:bg-white border border-[#EADBDA] focus:border-[#FF9AA2] rounded-xl px-3 py-2 text-center font-bold text-[#3E3230] text-sm outline-hidden transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-bold text-[#6D5D5A] mb-1.5">日常活动水平 (TDEE 系数)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["sedentary", "light", "moderate", "heavy"] as ActivityLevel[]).map((level) => {
                      const info = activityDescriptions[level];
                      const isSelected = formData.activity_level === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          id={`activity-${level}`}
                          onClick={() => setFormData({ ...formData, activity_level: level })}
                          className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#F3E8FF] border-[#B794F4] shadow-xs"
                              : "bg-[#FAF7F5] border-transparent hover:bg-[#F5EFEA]"
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold text-xs text-[#3E3230]">
                            <span>{info.icon}</span>
                            <span>{info.title}</span>
                          </div>
                          <p className="text-[10px] text-[#7D6B68] mt-0.5 leading-tight">{info.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Goal */}
                <div>
                  <label className="block text-xs font-bold text-[#6D5D5A] mb-1.5">当前身材目标</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["fat_loss", "muscle_gain", "maintenance"] as Goal[]).map((g) => {
                      const info = goalDescriptions[g];
                      const isSelected = formData.goal === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          id={`goal-${g}`}
                          onClick={() => setFormData({ ...formData, goal: g })}
                          className={`py-2 px-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                            isSelected
                              ? `${info.color} shadow-xs`
                              : "bg-[#FAF7F5] border-transparent text-[#6D5D5A] hover:bg-[#F5EFEA]"
                          }`}
                        >
                          <div>{info.title}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Taste & Cooking Time & Allergies */}
                <div className="pt-2 border-t border-[#F7EBE8] space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#6D5D5A] mb-1">🍲 口味偏好</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {["清淡", "微辣", "甜香", "不忌口"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, taste_preference: t })}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            formData.taste_preference === t
                              ? "bg-[#FFF0F3] text-[#E03164] border-[#FFCCD5]"
                              : "bg-[#FAF7F5] text-[#7A6B68] border-transparent"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6D5D5A] mb-1">⏱️ 每日做饭时间</label>
                      <select
                        value={formData.cooking_time || "15-30分钟"}
                        onChange={(e) => setFormData({ ...formData, cooking_time: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF7F5] border border-[#F3E5E3] text-xs font-bold text-[#3E3230]"
                      >
                        <option value="<15分钟">&lt;15分钟 (极速快手)</option>
                        <option value="15-30分钟">15-30分钟 (标准)</option>
                        <option value="30分钟以上">30分钟以上 (精致煲煮)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#6D5D5A] mb-1">💰 食材预算</label>
                      <select
                        value={formData.budget || "中"}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF7F5] border border-[#F3E5E3] text-xs font-bold text-[#3E3230]"
                      >
                        <option value="低">经济实惠 (高性价比)</option>
                        <option value="中">标准均等 (均衡丰富)</option>
                        <option value="高">高品质有机食材</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6D5D5A] mb-1">🚫 忌口/过敏食材 (多选)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {allergyOptions.map((opt) => {
                        const active = formData.allergies?.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleAllergy(opt)}
                            className={`text-xs px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                              active
                                ? "bg-[#FFF0F3] border-[#FF9AA2] text-[#E03164] font-bold"
                                : "bg-[#FAF7F5] border-[#EEDDD9] text-[#7A6B68]"
                            }`}
                          >
                            {opt} {active ? "✓" : "+"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  id="btn-save-profile"
                  className="w-full py-2.5 rounded-2xl bg-[#4A3E3D] hover:bg-[#382F2E] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavedRecently ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#68D391]" />
                      <span>已成功保存并同步档案！</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#FFB7B2]" />
                      <span>保存我的身体数据并刷新指标</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SECOND PRIORITY: 今日饮食进度 (Today's Diet Progress) */}
      {/* ========================================================================= */}
      <div
        id="today-diet-progress-card"
        className="rounded-3xl bg-white p-5 sm:p-6 border border-[#FFE4E8] shadow-card space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F7EBE8] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥗</span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#3E3230] flex items-center gap-2">
                <span>今日饮食进度</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#D53F8C] font-bold">
                  {calorieProgressPct}%
                </span>
              </h3>
              <p className="text-xs text-[#8C7A78]">
                已记录 {diaryEntries.length} 项 · 每日目标 {metrics.targetCalories} kcal
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("planner")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF6B8B] to-[#FF8DA1] text-white text-xs font-bold shadow-xs hover:opacity-95 cursor-pointer self-start sm:self-auto"
          >
            <span>进入今日餐盘规划</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Calories Progress Ring & Macro Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Calorie Stats */}
          <div className="sm:col-span-4 bg-[#FFF9FA] p-4 rounded-2xl border border-[#FFE8EC] flex flex-col justify-between space-y-2">
            <span className="text-xs font-bold text-gray-500">🔥 今日摄入热量</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-gray-800">{loggedCalories}</span>
              <span className="text-xs text-gray-400">/ {metrics.targetCalories} kcal</span>
            </div>
            <div className="text-xs font-bold flex items-center justify-between border-t border-[#FFE4E8] pt-2">
              <span className="text-gray-500">剩余可摄入</span>
              <span className={remainingCalories >= 0 ? "text-emerald-600 font-extrabold" : "text-rose-600 font-extrabold"}>
                {remainingCalories >= 0 ? `${remainingCalories} kcal` : `超标 ${Math.abs(remainingCalories)} kcal`}
              </span>
            </div>
          </div>

          {/* 4 Macros Progress Breakdown */}
          <div className="sm:col-span-8 space-y-2.5 bg-[#FAF9F6] p-4 rounded-2xl border border-[#F0EBE5]">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#6C5CE7]">🥩 蛋白质</span>
                <span className="text-gray-700">
                  {loggedProtein} / {metrics.macros.proteinG}g ({Math.min(100, Math.round((loggedProtein / metrics.macros.proteinG) * 100))}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EDE9FE] overflow-hidden">
                <div
                  className="h-full bg-[#6C5CE7] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (loggedProtein / metrics.macros.proteinG) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#DD6B20]">🌾 碳水化合物</span>
                <span className="text-gray-700">
                  {loggedCarbs} / {metrics.macros.carbsG}g ({Math.min(100, Math.round((loggedCarbs / metrics.macros.carbsG) * 100))}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#FFEDD5] overflow-hidden">
                <div
                  className="h-full bg-[#DD6B20] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (loggedCarbs / metrics.macros.carbsG) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#38A169]">🥑 优质脂肪</span>
                <span className="text-gray-700">
                  {loggedFat} / {metrics.macros.fatG}g ({Math.min(100, Math.round((loggedFat / metrics.macros.fatG) * 100))}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#DCFCE7] overflow-hidden">
                <div
                  className="h-full bg-[#38A169] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (loggedFat / metrics.macros.fatG) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. THIRD PRIORITY: 快捷添加食物 (Quick Add Foods & Meal Type Selector) */}
      {/* ========================================================================= */}
      <div
        id="quick-add-food-card"
        className="rounded-3xl bg-white p-5 sm:p-6 border border-[#FFE4E8] shadow-card space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F7EBE8] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#3E3230] flex items-center gap-2">
                <span>快捷添加食物</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#D53F8C] font-bold">
                  一键入盘
                </span>
              </h3>
              <p className="text-xs text-[#8C7A78]">常用高蛋白/低卡食材，点击直接加入当前餐盘</p>
            </div>
          </div>

          {/* Meal Type Radio for Quick Add */}
          <div className="flex items-center gap-1 bg-[#FAF7F5] p-1 rounded-2xl border border-[#EEDDD9]">
            {(["早餐", "午餐", "晚餐", "加餐"] as MealType[]).map((mt) => (
              <button
                key={mt}
                type="button"
                onClick={() => setQuickAddMealType(mt)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  quickAddMealType === mt
                    ? "bg-[#FF6B8B] text-white shadow-xs"
                    : "text-[#7A6B68] hover:bg-white"
                }`}
              >
                {mt}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Food Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickFoods.map((food, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAdd(food)}
              className="p-3 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF5F7] border border-[#F5E5E2] hover:border-[#FFCCD5] transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-2xl group-hover:scale-110 transition-transform">{food.emoji}</span>
                <div className="truncate">
                  <div className="text-xs font-bold text-gray-800 truncate">{food.name}</div>
                  <div className="text-[10px] text-gray-400">
                    {food.portion_g}g · <b className="text-[#FF6B8B]">{food.calories}</b> kcal
                  </div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white border border-[#FFE4E8] flex items-center justify-center text-[#FF6B8B] group-hover:bg-[#FF6B8B] group-hover:text-white transition-colors shrink-0">
                <Plus className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Weight Tracker & Weekly Progress */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <WeightTrackerCard
            profile={formData}
            onWeightChange={(newWeight) => {
              const updated = { ...formData, weight_kg: newWeight };
              setFormData(updated);
              onUpdateProfile(updated);
            }}
          />
        </div>
        <div className="lg:col-span-7">
          <WeeklyReportCard
            profile={formData}
            diaryEntries={diaryEntries}
            exerciseLogs={exerciseLogs}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. Health Assessment & Daily Recipes Stack */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <HealthAssessmentCard
          profile={formData}
          diaryEntries={diaryEntries}
          exerciseLogs={exerciseLogs}
        />

        <DailyPlanCard
          profile={formData}
          diaryEntries={diaryEntries}
          fridgeItems={fridgeItems}
          exerciseLogs={exerciseLogs}
          onAddToPlate={onAddToPlate}
          onStartWorkout={onStartWorkout}
        />

        <DailyRecommendationCard
          fridgeItems={fridgeItems}
          diaryEntries={diaryEntries}
          goal={formData.goal}
          onAddToPlate={onAddToPlate}
        />
      </div>

      {/* Account Sync Modal */}
      <AccountSyncModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        profile={formData}
        diaryEntries={diaryEntries}
        exerciseLogs={exerciseLogs}
      />
    </div>
  );
};
