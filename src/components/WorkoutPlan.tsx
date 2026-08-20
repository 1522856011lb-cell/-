import React, { useState, useEffect } from "react";
import { BodyProfile, WorkoutExercise, WorkoutPlan as WorkoutPlanType, ExerciseLogEntry, FoodDiaryEntry } from "../types";
import { STANDARD_EXERCISES, StandardExercise } from "../data/exercises";
import { getExerciseLogs, saveExerciseEntry, deleteExerciseEntry } from "../utils/storage";
import {
  Dumbbell,
  Home,
  Building2,
  Clock,
  Flame,
  Play,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Loader2,
  Heart,
  Trophy,
  Pause,
  Plus,
  Trash2,
  Activity,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import confetti from "canvas-confetti";

interface WorkoutPlanProps {
  profile: BodyProfile;
  activePlan: WorkoutPlanType | null;
  diaryEntries?: FoodDiaryEntry[];
  onSaveActivePlan: (plan: WorkoutPlanType) => void;
  onRefreshExerciseLogs?: () => void;
}

export const WorkoutPlan: React.FC<WorkoutPlanProps> = ({
  profile,
  activePlan,
  diaryEntries = [],
  onSaveActivePlan,
  onRefreshExerciseLogs,
}) => {
  const [activeTab, setActiveTab] = useState<"ai_plan" | "manual_log">("manual_log");

  // AI Workout Plan State
  const [location, setLocation] = useState<"home" | "gym">("home");
  const [durationMin, setDurationMin] = useState<number>(30);
  const [focusArea, setFocusArea] = useState<string>("全身燃脂塑形");
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlanType | null>(activePlan);

  // Companion Timer Mode
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>({});

  // Manual Exercise Log State
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(STANDARD_EXERCISES[0].id);
  const [manualDuration, setManualDuration] = useState<number>(30);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const durations = [15, 30, 45, 60];
  const focusAreas = ["全身燃脂塑形", "核心平腹紧致", "上肢天鹅臂与美背", "蜜桃臀与腿部线条", "身心舒缓与柔韧拉伸"];

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Load Exercise Logs
  useEffect(() => {
    setExerciseLogs(getExerciseLogs());
  }, []);

  const selectedExercise =
    STANDARD_EXERCISES.find((e) => e.id === selectedExerciseId) || STANDARD_EXERCISES[0];

  // MET calculation: MET * weight(kg) * (duration / 60)
  const calculatedManualCalories = Math.round(
    selectedExercise.met * profile.weight_kg * (manualDuration / 60)
  );

  // Today's total exercise calories burned
  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayExerciseLogs = exerciseLogs.filter((l) => l.logged_at.startsWith(todayDateStr));
  const totalBurnedToday = todayExerciseLogs.reduce((sum, l) => sum + l.calories_burned, 0);

  // Today's food calories logged
  const totalFoodIntake = diaryEntries.reduce((sum, e) => sum + e.calories, 0);
  const netCalories = totalFoodIntake - totalBurnedToday;

  // Handle Manual Log Submission
  const handleAddManualLog = () => {
    if (manualDuration <= 0) return;

    const newEntry: ExerciseLogEntry = {
      id: "ex_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      exercise_name: selectedExercise.name,
      category: selectedExercise.category,
      duration_min: manualDuration,
      met_value: selectedExercise.met,
      calories_burned: calculatedManualCalories,
      logged_at: new Date().toISOString(),
      emoji: selectedExercise.emoji,
    };

    saveExerciseEntry(newEntry);
    const updated = getExerciseLogs();
    setExerciseLogs(updated);
    if (onRefreshExerciseLogs) onRefreshExerciseLogs();

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#38A169", "#FF6B8B", "#FFD166", "#805AD5"],
      });
    } catch (_) {}

    showToast(`🔥 已成功记录「${selectedExercise.name}」${manualDuration}分钟，燃烧 ${calculatedManualCalories} kcal！`);
  };

  // Handle Delete Manual Log
  const handleDeleteLog = (id: string) => {
    deleteExerciseEntry(id);
    setExerciseLogs(getExerciseLogs());
    if (onRefreshExerciseLogs) onRefreshExerciseLogs();
    showToast("已删除该条运动记录 🍃");
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          duration_min: durationMin,
          weight_kg: profile.weight_kg,
          goal: profile.goal,
          focus_area: focusArea,
        }),
      });
      const data = await res.json();
      if (data && data.exercises) {
        setPlan(data);
        onSaveActivePlan(data);
        setCompletedExercises({});
      }
    } catch (e) {
      console.error("Generate workout error", e);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!plan && activeTab === "ai_plan") {
      handleGeneratePlan();
    }
  }, [activeTab]);

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && !timerPaused && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && secondsRemaining === 0) {
      if (plan && plan.exercises) {
        setCompletedExercises((prev) => ({ ...prev, [currentExerciseIndex]: true }));
        if (currentExerciseIndex < plan.exercises.length - 1) {
          setCurrentExerciseIndex((prev) => prev + 1);
          setSecondsRemaining(45);
        } else {
          setTimerActive(false);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#B794F4", "#FF8DA1", "#68D391", "#F6AD55"],
            });
          } catch (_) {}
        }
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerPaused, secondsRemaining, currentExerciseIndex, plan]);

  const toggleExerciseCheck = (idx: number) => {
    setCompletedExercises((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      return next;
    });
  };

  const startCompanionMode = (startIdx = 0) => {
    setCurrentExerciseIndex(startIdx);
    setSecondsRemaining(45);
    setTimerPaused(false);
    setTimerActive(true);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-4xl mx-auto px-4 pt-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[#3E3230] text-white text-xs sm:text-sm font-semibold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFD166]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Net Calories & Energy Balance Hero */}
      <div
        id="workout-summary-hero"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F5F8FF] via-[#FFF9F5] to-[#FFF0F3] p-5 sm:p-7 border border-[#FFE4E8] shadow-card space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#DDD6FE] text-xs font-bold text-[#805AD5] shadow-2xs mb-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>今日能量代谢平衡与 MET 精准测算</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E3230] tracking-tight">
              运动消耗与净热量
            </h1>
            <p className="text-xs sm:text-sm text-[#7D6B68] mt-0.5">
              根据您的实际体重 ({profile.weight_kg}kg) 与标准代谢当量 (MET) 实时计算燃卡
            </p>
          </div>

          {/* Net Balance Pill */}
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3.5 border border-[#FFE4E8] shadow-2xs text-center min-w-[150px]">
            <span className="text-[10px] font-bold text-[#8C7A78] uppercase">今日净摄入</span>
            <div className="text-2xl font-black text-[#FF6B8B] mt-0.5">
              {netCalories} <span className="text-xs font-bold text-[#3E3230]">kcal</span>
            </div>
            <span className="text-[10px] text-[#38A169] font-medium block">
              饮食 {totalFoodIntake} - 运动 {totalBurnedToday}
            </span>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-1">
          <div className="rounded-2xl bg-white/80 p-3 sm:p-4 border border-[#FFEAEA] text-center">
            <span className="text-[11px] text-[#8C7A78] block">今日摄入热量</span>
            <span className="text-lg sm:text-xl font-black text-[#3E3230] mt-0.5 block">
              {totalFoodIntake} <span className="text-xs font-normal">kcal</span>
            </span>
            <span className="text-[10px] text-[#FF6B8B] font-semibold">餐盘记录</span>
          </div>

          <div className="rounded-2xl bg-white/80 p-3 sm:p-4 border border-[#FFEAEA] text-center">
            <span className="text-[11px] text-[#8C7A78] block">今日运动消耗</span>
            <span className="text-lg sm:text-xl font-black text-[#38A169] mt-0.5 block flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-[#FF6B8B] fill-current" />
              {totalBurnedToday} <span className="text-xs font-normal">kcal</span>
            </span>
            <span className="text-[10px] text-[#38A169] font-semibold">
              {todayExerciseLogs.length} 项运动
            </span>
          </div>

          <div className="rounded-2xl bg-white/80 p-3 sm:p-4 border border-[#FFEAEA] text-center">
            <span className="text-[11px] text-[#8C7A78] block">运动总时长</span>
            <span className="text-lg sm:text-xl font-black text-[#805AD5] mt-0.5 block">
              {todayExerciseLogs.reduce((sum, l) => sum + l.duration_min, 0)}{" "}
              <span className="text-xs font-normal">分钟</span>
            </span>
            <span className="text-[10px] text-[#805AD5] font-semibold">持续流汗</span>
          </div>
        </div>
      </div>

      {/* 2. Mode Tabs: Manual Log vs AI Workout Generator */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#F7EBE8] w-fit">
        <button
          onClick={() => setActiveTab("manual_log")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === "manual_log"
              ? "bg-white text-[#FF6B8B] shadow-xs"
              : "text-[#7D6B68] hover:text-[#3E3230]"
          }`}
        >
          📝 手动记录运动 (MET计算)
        </button>
        <button
          onClick={() => setActiveTab("ai_plan")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === "ai_plan"
              ? "bg-white text-[#805AD5] shadow-xs"
              : "text-[#7D6B68] hover:text-[#3E3230]"
          }`}
        >
          🤖 AI 定制训练计划
        </button>
      </div>

      {/* 3. Tab Content 1: Manual Exercise Log Section */}
      {activeTab === "manual_log" && (
        <div className="space-y-6">
          {/* Manual Logger Form Card */}
          <div
            id="manual-exercise-form"
            className="rounded-3xl bg-white border border-[#FFE4E8] p-5 sm:p-7 shadow-card space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#FAF0EE] pb-3">
              <div>
                <h3 className="text-lg font-black text-[#3E3230] flex items-center gap-2">
                  <span>挑选运动与输入时长</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#2F855A] font-bold">
                    自动换算卡路里
                  </span>
                </h3>
                <p className="text-xs text-[#8C7A78] mt-0.5">
                  基于国际标准 MET 换算公式：消耗 = MET × 体重({profile.weight_kg}kg) × (时长/60)
                </p>
              </div>
            </div>

            {/* Exercise Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-[#6D5D5A] mb-2">
                选择运动类型 ({STANDARD_EXERCISES.length} 种常见运动)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {STANDARD_EXERCISES.map((ex) => {
                  const isSelected = ex.id === selectedExerciseId;
                  return (
                    <button
                      key={ex.id}
                      onClick={() => {
                        setSelectedExerciseId(ex.id);
                        setManualDuration(ex.defaultDurationMin);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-br from-[#FFF0F3] to-[#FFF5F7] border-[#FF6B8B] shadow-xs ring-1 ring-[#FFCCD5]"
                          : "bg-[#FFFDF9] border-[#EEDDD9] hover:border-[#FFCCD5]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{ex.emoji}</span>
                        <span className="text-[10px] font-bold text-[#805AD5] bg-[#F3E8FF] px-1.5 py-0.2 rounded-md">
                          MET {ex.met}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div
                          className={`text-xs font-extrabold line-clamp-1 ${
                            isSelected ? "text-[#D53F8C]" : "text-[#3E3230]"
                          }`}
                        >
                          {ex.name}
                        </div>
                        <div className="text-[10px] text-[#8C7A78] mt-0.5 line-clamp-1">
                          {ex.intensity}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Input & Calculation Output */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#FFFDF9] rounded-2xl p-4 border border-[#F5E5E2]">
              <div className="sm:col-span-6 space-y-2">
                <label className="block text-xs font-bold text-[#3E3230]">
                  运动时长 (分钟)
                </label>
                <div className="flex items-center gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setManualDuration(mins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        manualDuration === mins
                          ? "bg-[#FF6B8B] text-white border-[#FF6B8B]"
                          : "bg-white text-[#7D6B68] border-[#EEDDD9]"
                      }`}
                    >
                      {mins}分
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Math.max(1, Number(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 rounded-xl bg-white border border-[#EEDDD9] text-xs font-bold text-[#3E3230] text-center focus:outline-none focus:border-[#FF6B8B]"
                  />
                  <span className="text-xs text-[#8C7A78]">分</span>
                </div>
              </div>

              <div className="sm:col-span-6 flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 sm:border-l border-[#F0DFDC] pt-3 sm:pt-0 sm:pl-4">
                <div className="text-right">
                  <span className="text-[11px] text-[#8C7A78] block">预计燃烧热量</span>
                  <span className="text-2xl font-black text-[#FF6B8B]">
                    {calculatedManualCalories}{" "}
                    <span className="text-xs text-[#3E3230] font-normal">kcal</span>
                  </span>
                </div>

                <button
                  id="btn-add-exercise-log"
                  onClick={handleAddManualLog}
                  className="py-3 px-5 rounded-2xl bg-gradient-to-r from-[#FF6B8B] via-[#FF8DA1] to-[#FFAAA6] text-white text-xs sm:text-sm font-extrabold shadow-glow-pink hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>记录运动入账</span>
                </button>
              </div>
            </div>
          </div>

          {/* Today's Logged Exercises List */}
          <div
            id="today-exercise-history"
            className="rounded-3xl bg-white border border-[#FFE4E8] p-5 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#3E3230] flex items-center gap-2">
                <span>📋 今日运动打卡记录</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#D53F8C] font-bold">
                  共 {todayExerciseLogs.length} 条 · {totalBurnedToday} kcal
                </span>
              </h3>
            </div>

            {todayExerciseLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8C7A78] space-y-1">
                <p>🏃 今日暂未记录运动，完成训练后记得来打卡入账哦！</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayExerciseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl p-3 bg-[#FFFDF9] border border-[#F5E5E2] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{log.emoji || "🏃"}</span>
                      <div>
                        <div className="text-xs font-bold text-[#3E3230] flex items-center gap-2">
                          <span>{log.exercise_name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F3E8FF] text-[#7C3AED] font-semibold">
                            MET {log.met_value}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8C7A78] mt-0.5">
                          时长：{log.duration_min} 分钟 · 分类：{log.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-[#FF6B8B]">
                          -{log.calories_burned} kcal
                        </span>
                        <span className="text-[10px] text-[#8C7A78] block">
                          {log.logged_at.slice(11, 16)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 rounded-xl text-[#A89A97] hover:text-[#E53E3E] hover:bg-[#FFF5F5] cursor-pointer"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Tab Content 2: AI Workout Generator */}
      {activeTab === "ai_plan" && (
        <div className="space-y-6">
          {/* Header & Configuration Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3E5E3] shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FAF5F4] pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-xs font-bold text-[#805AD5] border border-[#DDD6FE]">
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Gemini 运动训练生成器</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E3230]">
                  个性化训练方案 · 精准 MET 燃卡
                </h2>
                <p className="text-xs text-[#8C7A78]">
                  根据你的环境与可用时间，量身定制无压力、高效率的运动序列
                </p>
              </div>
            </div>

            {/* Configuration Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-[#6D5D5A] mb-1.5">运动环境</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocation("home")}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      location === "home"
                        ? "bg-[#FFF0F3] border-[#FF9AA2] text-[#E03164] shadow-xs"
                        : "bg-[#FAF7F5] border-transparent text-[#7D6B68]"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>在家 / 宿舍</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocation("gym")}
                    className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      location === "gym"
                        ? "bg-[#F3E8FF] border-[#B794F4] text-[#7C3AED] shadow-xs"
                        : "bg-[#FAF7F5] border-transparent text-[#7D6B68]"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>健身房</span>
                  </button>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-[#6D5D5A] mb-1.5">训练时长</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {durations.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationMin(d)}
                      className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        durationMin === d
                          ? "bg-[#4A3E3D] text-white border-[#4A3E3D] shadow-xs"
                          : "bg-[#FAF7F5] border-transparent text-[#7D6B68]"
                      }`}
                    >
                      {d}分
                    </button>
                  ))}
                </div>
              </div>

              {/* Focus Area */}
              <div>
                <label className="block text-xs font-bold text-[#6D5D5A] mb-1.5">重点部位</label>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="w-full bg-[#FAF7F5] border border-[#EADBDA] rounded-2xl py-2.5 px-3 text-xs font-bold text-[#3E3230] outline-none"
                >
                  {focusAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#B794F4] via-[#9F7AEA] to-[#805AD5] hover:opacity-95 text-white font-bold text-sm shadow-glow-purple flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>AI 正在为你生成科学动作序列...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFF0F3]" />
                  <span>生成全新训练方案 (时长 {durationMin} 分钟)</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Companion Timer Floating Header (if active) */}
          {timerActive && plan && plan.exercises && (
            <div className="sticky top-16 z-30 bg-[#FFFDF9]/95 backdrop-blur-md rounded-3xl p-5 border-2 border-[#B794F4] shadow-xl space-y-3 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-pulse">⏱️</span>
                  <div>
                    <span className="text-xs font-bold text-[#805AD5]">跟练模式进行中</span>
                    <h3 className="font-extrabold text-base text-[#3E3230]">
                      {plan.exercises[currentExerciseIndex]?.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black font-mono text-[#805AD5]">
                    {secondsRemaining}s
                  </div>
                  <button
                    onClick={() => setTimerPaused(!timerPaused)}
                    className="w-9 h-9 rounded-2xl bg-[#F3E8FF] text-[#805AD5] flex items-center justify-center font-bold cursor-pointer"
                  >
                    {timerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setTimerActive(false)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F5] text-xs font-bold text-[#7D6B68] cursor-pointer"
                  >
                    退出
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#6D5D5A]">
                💡 提示：{plan.exercises[currentExerciseIndex]?.instructions}
              </p>
            </div>
          )}

          {/* Generated Plan Display */}
          {plan ? (
            <div className="space-y-5">
              {/* Plan Meta Summary Hero */}
              <div className="rounded-3xl bg-gradient-to-br from-[#F5F3FF] via-[#FFF9F5] to-[#FFF0F3] p-6 border border-[#DDD6FE] shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#805AD5]">{plan.location} · {plan.intensity_level}</span>
                    <h3 className="text-2xl font-extrabold text-[#3E3230]">{plan.plan_title}</h3>
                    <p className="text-xs text-[#8C7A78] mt-0.5">{plan.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-4 bg-white/80 px-4 py-2.5 rounded-2xl border border-[#DDD6FE]">
                    <div className="text-center">
                      <span className="text-[10px] text-[#8C7A78] block">总时长</span>
                      <span className="text-base font-extrabold text-[#3E3230]">{plan.duration_min} 分钟</span>
                    </div>
                    <div className="h-6 w-px bg-[#EADBDA]"></div>
                    <div className="text-center">
                      <span className="text-[10px] text-[#8C7A78] block">预估总消耗</span>
                      <span className="text-base font-extrabold text-[#E03164] flex items-center justify-center gap-0.5">
                        <Flame className="w-4 h-4" />
                        {plan.total_calories_burned} kcal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Encouragement Quote */}
                <div className="p-3.5 rounded-2xl bg-white/90 border border-[#FFD6DF] flex items-center gap-2.5 text-xs text-[#7A5860] font-medium">
                  <span className="text-lg">💖</span>
                  <span>{plan.encouragement || "今天也要加油哦！每一次流汗都是身材蜕变的美妙音符~"}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-[#6D5D5A]">
                    已完成 {Object.values(completedExercises).filter(Boolean).length} / {plan.exercises.length} 个动作
                  </span>
                  <button
                    onClick={() => startCompanionMode(0)}
                    className="px-4 py-2 rounded-2xl bg-[#805AD5] hover:bg-[#6B46C1] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>开启全流程跟练计时</span>
                  </button>
                </div>
              </div>

              {/* Timeline of Exercises */}
              <div className="space-y-3">
                {plan.exercises.map((ex, idx) => {
                  const isChecked = !!completedExercises[idx];
                  return (
                    <div
                      key={idx}
                      className={`bg-white rounded-3xl p-5 border transition-all ${
                        isChecked
                          ? "border-[#C6F6D5] bg-[#FAFDFB]"
                          : "border-[#F3E5E3] hover:border-[#DDD6FE]"
                      } shadow-card space-y-3`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleExerciseCheck(idx)}
                            className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-[#48BB78] border-[#48BB78] text-white"
                                : "border-[#D6C7C5] bg-white text-transparent hover:border-[#FF9AA2]"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ex.section.includes("热身")
                                    ? "bg-[#FFF0F3] text-[#E03164]"
                                    : ex.section.includes("主训")
                                    ? "bg-[#F3E8FF] text-[#7C3AED]"
                                    : "bg-[#E6F4EA] text-[#2F855A]"
                                }`}
                              >
                                {ex.section}
                              </span>
                              <h4
                                className={`font-bold text-base ${
                                  isChecked ? "text-[#9B8986] line-through" : "text-[#3E3230]"
                                }`}
                              >
                                {ex.name}
                              </h4>
                            </div>
                            <p className="text-xs text-[#8C7A78] font-medium">
                              部位：{ex.target_muscle} · 建议强度：{ex.reps_or_time}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF5F4] text-xs font-extrabold text-[#E03164]">
                            <Flame className="w-3 h-3" />
                            <span>{ex.calories_burned} kcal</span>
                          </div>
                          <span className="text-[10px] text-[#A89895] block mt-0.5">
                            MET {ex.met_value}
                          </span>
                        </div>
                      </div>

                      {/* GIF / visual animation indicator */}
                      {ex.exercise_gif && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F3E8FF]/60 text-[11px] font-semibold text-[#6B46C1] border border-[#E9D8FD]">
                          <span>🎬 动作分解指导：{ex.exercise_gif}</span>
                        </div>
                      )}

                      {/* Instruction details */}
                      <div className="bg-[#FAF7F5] rounded-2xl p-3 text-xs space-y-1 text-[#6D5D5A]">
                        <p className="leading-relaxed">{ex.instructions}</p>
                        {ex.breath_tip && (
                          <p className="text-[11px] text-[#805AD5] font-semibold flex items-center gap-1 pt-0.5">
                            <span>🌬️</span>
                            <span>呼吸节奏：{ex.breath_tip}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

