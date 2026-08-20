import React, { useState } from "react";
import { BodyProfile, DayPlan, FoodDiaryEntry, MetabolicMetrics, WorkoutPlan } from "../types";
import { CalendarHeart, Droplets, CheckCircle2, Flame, Utensils, Dumbbell, Sparkles, Share2, Award, ArrowRight, Heart } from "lucide-react";
import confetti from "canvas-confetti";

interface MyPlanProps {
  profile: BodyProfile;
  metrics: MetabolicMetrics;
  diaryEntries: FoodDiaryEntry[];
  activeWorkout: WorkoutPlan | null;
  weekPlan: DayPlan[];
  waterIntake: number;
  onUpdateWaterIntake: (ml: number) => void;
  onToggleDayPlan: (dayNumber: number) => void;
  onNavigateTab: (tab: "planner" | "home" | "recommend" | "diary" | "workout") => void;
}

export const MyPlan: React.FC<MyPlanProps> = ({
  profile,
  metrics,
  diaryEntries,
  activeWorkout,
  weekPlan,
  waterIntake,
  onUpdateWaterIntake,
  onToggleDayPlan,
  onNavigateTab,
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const totalCaloriesLogged = diaryEntries.reduce((sum, e) => sum + e.calories, 0);
  const remainingCalories = metrics.targetCalories - totalCaloriesLogged;

  const handleAddWater = (amount = 250) => {
    const next = Math.min(3500, waterIntake + amount);
    onUpdateWaterIntake(next);
    if (next >= 2000 && waterIntake < 2000) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#90CDF4", "#63B3ED", "#4299E1", "#BEE3F8"],
        });
      } catch (_) {}
    }
  };

  const handleResetWater = () => {
    onUpdateWaterIntake(0);
  };

  const goalTitleMap = {
    fat_loss: "减脂塑形期 · 缺口 400 kcal",
    muscle_gain: "增肌紧致期 · 盈余 250 kcal",
    maintenance: "健康维持期 · 均衡代谢",
  };

  const completedDaysCount = weekPlan.filter((d) => d.completed).length;

  const handleShareCard = () => {
    setShareModalOpen(true);
  };

  const handleCopySummary = () => {
    const text = `🌸 FitGlow 今日健康打卡 🌸
📅 日期：${new Date().toLocaleDateString("zh-CN")}
🎯 身材目标：${goalTitleMap[profile.goal]}
🍽️ 饮食摄入：${totalCaloriesLogged} / ${metrics.targetCalories} kcal
💧 饮水量：${waterIntake} ml / 2000 ml
🏃 运动消耗：${activeWorkout ? `${activeWorkout.total_calories_burned} kcal` : "待开启"}
✨ 每一天都在变得更好、更轻盈！`;

    navigator.clipboard?.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto px-4 pt-4">
      {/* 1. Master Plan Hero Header */}
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-[#FFF9F5] to-[#F3E8FF] p-6 sm:p-8 border border-[#FFE4E8] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-bold text-[#D53F8C] border border-[#FFCCD5] shadow-xs">
              <CalendarHeart className="w-3.5 h-3.5" />
              <span>FitGlow 7日综合健康蓝图</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3E3230]">
              我的身材与饮食总览
            </h2>
            <p className="text-xs sm:text-sm text-[#7D6B68]">
              当前处于 <b>{goalTitleMap[profile.goal]}</b>，已连续打卡 <b>{completedDaysCount}/7</b> 天！
            </p>
          </div>

          <button
            onClick={handleShareCard}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-[#E2D5D2] hover:border-[#FF9AA2] text-xs font-bold text-[#5A4A47] hover:text-[#FF6B8B] shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4 text-[#FF6B8B]" />
            <span>生成今日打卡海报</span>
          </button>
        </div>

        {/* 3 Overview Mini Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Calorie Card */}
          <div
            onClick={() => onNavigateTab("diary")}
            className="p-4 rounded-2xl bg-white/90 border border-[#F3E5E3] hover:border-[#FFB7B2] transition-all cursor-pointer space-y-1 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#7D6B68]">
              <span>今日饮食摄入</span>
              <Utensils className="w-3.5 h-3.5 text-[#FF6B8B]" />
            </div>
            <div className="text-xl font-extrabold text-[#3E3230]">
              {totalCaloriesLogged} <span className="text-xs text-[#8C7A78]">/ {metrics.targetCalories} kcal</span>
            </div>
            <p className="text-[11px] text-[#8C7A78]">
              {remainingCalories >= 0 ? `尚余 ${remainingCalories} kcal` : `超标 ${Math.abs(remainingCalories)} kcal`}
            </p>
          </div>

          {/* Water Intake Card */}
          <div className="p-4 rounded-2xl bg-white/90 border border-[#F3E5E3] space-y-1 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#7D6B68]">
              <span>今日饮水量</span>
              <Droplets className="w-3.5 h-3.5 text-[#3182CE]" />
            </div>
            <div className="text-xl font-extrabold text-[#3182CE]">
              {waterIntake} <span className="text-xs text-[#8C7A78]">/ 2000 ml</span>
            </div>
            <p className="text-[11px] text-[#8C7A78]">
              {waterIntake >= 2000 ? "已达标！水润光彩 ✨" : `还需 ${Math.max(0, 2000 - waterIntake)} ml`}
            </p>
          </div>

          {/* Workout Card */}
          <div
            onClick={() => onNavigateTab("workout")}
            className="p-4 rounded-2xl bg-white/90 border border-[#F3E5E3] hover:border-[#B794F4] transition-all cursor-pointer space-y-1 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#7D6B68]">
              <span>运动方案状态</span>
              <Dumbbell className="w-3.5 h-3.5 text-[#805AD5]" />
            </div>
            <div className="text-xl font-extrabold text-[#3E3230]">
              {activeWorkout ? `${activeWorkout.total_calories_burned} kcal` : "待生成"}
            </div>
            <p className="text-[11px] text-[#8C7A78]">
              {activeWorkout ? `${activeWorkout.duration_min}分钟 · ${activeWorkout.location}` : "点击定制运动"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Cute Water Intake Tracker Widget */}
      <div className="bg-white rounded-3xl p-6 border border-[#F3E5E3] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💧</span>
            <div>
              <h3 className="font-bold text-base text-[#3E3230]">每日 2000ml 水润元气打卡</h3>
              <span className="text-xs text-[#8C7A78]">促进新陈代谢，让皮肤由内而外透亮发光</span>
            </div>
          </div>
          <button
            onClick={handleResetWater}
            className="text-[11px] text-[#9B8986] hover:text-[#E03164] font-semibold cursor-pointer"
          >
            重置今日
          </button>
        </div>

        {/* 8 Glasses visual grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, idx) => {
            const isFilled = waterIntake >= (idx + 1) * 250;
            return (
              <button
                key={idx}
                onClick={() => handleAddWater(250)}
                className={`py-3 px-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isFilled
                    ? "bg-[#EBF8FF] border-[#90CDF4] text-[#2B6CB0] shadow-xs scale-102"
                    : "bg-[#FAF7F5] border-transparent text-[#A0AEC0] hover:bg-[#F0F4F8]"
                }`}
              >
                <span className="text-xl">{isFilled ? "🥛" : "🥤"}</span>
                <span className="text-[10px] font-bold">第{idx + 1}杯</span>
                <span className="text-[9px] opacity-75">250ml</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="h-2 flex-1 max-w-md bg-[#FAF5F4] rounded-full overflow-hidden mr-4">
            <div
              style={{ width: `${Math.min(100, (waterIntake / 2000) * 100)}%` }}
              className="h-full bg-gradient-to-r from-[#90CDF4] to-[#3182CE] rounded-full"
            ></div>
          </div>
          <button
            onClick={() => handleAddWater(250)}
            className="px-4 py-2 rounded-2xl bg-[#3182CE] hover:bg-[#2B6CB0] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ 喝了一杯水 (250ml)</span>
          </button>
        </div>
      </div>

      {/* 3. 7-Day FitGlow Habit Calendar / Schedule */}
      <div className="bg-white rounded-3xl p-6 border border-[#F3E5E3] shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-[#FAF5F4] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <div>
              <h3 className="font-bold text-base text-[#3E3230]">7天循序渐进建议打卡表</h3>
              <span className="text-xs text-[#8C7A78]">点击圆圈勾选完成当日打卡</span>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#FFF0F3] text-xs font-extrabold text-[#E03164]">
            {completedDaysCount}/7 天已完成
          </div>
        </div>

        <div className="space-y-2.5">
          {weekPlan.map((day) => (
            <div
              key={day.dayNumber}
              onClick={() => onToggleDayPlan(day.dayNumber)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                day.completed
                  ? "bg-[#FAFDFB] border-[#C6F6D5]"
                  : "bg-[#FFFDF9] border-[#F5EAE8] hover:border-[#FFD6DF]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    day.completed
                      ? "bg-[#48BB78] border-[#48BB78] text-white shadow-xs"
                      : "border-[#D6C7C5] bg-white text-transparent"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#3E3230]">{day.dayName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF5F4] text-[10px] font-bold text-[#8C6D68]">
                      {day.theme}
                    </span>
                  </div>
                  <div className="text-xs text-[#7A6966] space-y-0.5">
                    <p className="flex items-center gap-1.5">
                      <span>🥗</span>
                      <span>饮食重点：{day.mealTip}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span>🏃‍♀️</span>
                      <span>运动建议：{day.workoutFocus}</span>
                    </p>
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-[#8C7A78] shrink-0">
                {day.completed ? "✨ 已打卡" : "待完成"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SHARE / POSTER MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm border border-[#F3E5E3] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Aesthetic Poster Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#FFF0F3] via-[#FFF9F5] to-[#F5F3FF] p-6 border border-[#FFCCD5] shadow-card space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF9AA2] to-[#FFDAC1] text-2xl flex items-center justify-center mx-auto shadow-sm">
                🌸
              </div>

              <div>
                <h3 className="text-xl font-black bg-gradient-to-r from-[#FF6B8B] via-[#B794F4] to-[#48BB78] bg-clip-text text-transparent">
                  FitGlow
                </h3>
                <p className="text-[11px] text-[#8C7A78] font-bold">今日元气蜕变打卡</p>
              </div>

              <div className="space-y-2 text-left bg-white/90 rounded-2xl p-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8C7A78]">打卡日期</span>
                  <span className="font-bold text-[#3E3230]">{new Date().toLocaleDateString("zh-CN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A78]">身材目标</span>
                  <span className="font-bold text-[#E03164]">{goalTitleMap[profile.goal]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A78]">饮食摄入</span>
                  <span className="font-bold text-[#3E3230]">{totalCaloriesLogged} / {metrics.targetCalories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C7A78]">水润补水</span>
                  <span className="font-bold text-[#3182CE]">{waterIntake} ml</span>
                </div>
              </div>

              <p className="text-xs text-[#7A5860] italic">
                “每一次坚持，都是在向更轻盈、更自信的自己靠近 ✨”
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="flex-1 py-2.5 rounded-2xl bg-[#FF6B8B] hover:bg-[#FF4D79] text-white font-bold text-xs shadow-glow-pink flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedNotification ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>已复制打卡文案！</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>一键复制打卡文案</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2.5 rounded-2xl bg-[#FAF7F5] font-bold text-xs text-[#6D5D5A] cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
