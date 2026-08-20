/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  AppTheme,
  BodyProfile,
  DayPlan,
  ExerciseLogEntry,
  FoodDiaryEntry,
  FridgeItem,
  MealPlateItem,
  UserStreak,
  WorkoutPlan as WorkoutPlanType,
} from "./types";
import {
  getMealReminders,
  getTheme,
  loadActiveWorkout,
  loadExerciseLogs,
  loadFoodDiary,
  loadFridgeItems,
  loadMealPlate,
  loadProfile,
  loadRecentFoodIds,
  loadStreak,
  loadWaterIntake,
  loadWeekPlan,
  saveActiveWorkout,
  saveExerciseLogs,
  saveFoodDiary,
  saveFridgeItems,
  saveMealPlate,
  saveProfile,
  saveTheme,
  saveWaterIntake,
  saveWeekPlan,
} from "./utils/storage";
import { calculateAllMetrics } from "./utils/calculations";
import { Navbar, TabType } from "./components/Navbar";
import { MealPlanner } from "./components/MealPlanner";
import { FridgeManagement } from "./components/FridgeManagement";
import { HomeMetrics } from "./components/HomeMetrics";
import { FoodRecommendations } from "./components/FoodRecommendations";
import { FoodDiary } from "./components/FoodDiary";
import { WorkoutPlan } from "./components/WorkoutPlan";
import { MyPlan } from "./components/MyPlan";
import { SettingsModal } from "./components/SettingsModal";

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>("planner");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<AppTheme>(() => getTheme());

  // App States with persistent local storage
  const [profile, setProfile] = useState<BodyProfile>(() => loadProfile());
  const [diaryEntries, setDiaryEntries] = useState<FoodDiaryEntry[]>(() => loadFoodDiary());
  const [plateItems, setPlateItems] = useState<MealPlateItem[]>(() => loadMealPlate());
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>(() => loadFridgeItems());
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogEntry[]>(() => loadExerciseLogs());
  const [userStreak, setUserStreak] = useState<UserStreak>(() => loadStreak());
  const [recentFoodIds, setRecentFoodIds] = useState<string[]>(() => loadRecentFoodIds());
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlanType | null>(() => loadActiveWorkout());
  const [waterIntake, setWaterIntake] = useState<number>(() => loadWaterIntake());
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>(() => loadWeekPlan());

  // Apply Theme on load & change
  useEffect(() => {
    if (theme === "beast") {
      document.documentElement.classList.add("theme-beast");
    } else {
      document.documentElement.classList.remove("theme-beast");
    }
  }, [theme]);

  // Periodic Meal Reminder Check (every 60 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const reminders = getMealReminders();
      if (!reminders.enabled || typeof Notification === "undefined" || Notification.permission !== "granted") {
        return;
      }
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      if (reminders.breakfastEnabled && reminders.breakfastTime === currentTimeStr) {
        new Notification("🌅 FitGlow 早餐提醒", {
          body: "元气满满的早晨！快来餐盘记录一份均衡的高蛋白早餐吧~ 🍳",
        });
      } else if (reminders.lunchEnabled && reminders.lunchTime === currentTimeStr) {
        new Notification("☀️ FitGlow 午餐提醒", {
          body: "该吃午餐啦！记得荤素搭配，摄入充足的优质蛋白与蔬菜~ 🥗",
        });
      } else if (reminders.snackEnabled && reminders.snackTime === currentTimeStr) {
        new Notification("🍵 FitGlow 加餐提醒", {
          body: "下午能量补给时间！来杯无糖黑咖啡或一小把坚果吧~ 🥑",
        });
      } else if (reminders.dinnerEnabled && reminders.dinnerTime === currentTimeStr) {
        new Notification("🌙 FitGlow 晚餐提醒", {
          body: "晚餐时间到！推荐清淡低盐少油，享受舒适放松的健康晚餐~ 🥣",
        });
      }
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  // Save changes to storage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveFoodDiary(diaryEntries);
  }, [diaryEntries]);

  useEffect(() => {
    saveMealPlate(plateItems);
  }, [plateItems]);

  useEffect(() => {
    saveFridgeItems(fridgeItems);
  }, [fridgeItems]);

  useEffect(() => {
    saveExerciseLogs(exerciseLogs);
  }, [exerciseLogs]);

  useEffect(() => {
    if (activeWorkout) {
      saveActiveWorkout(activeWorkout);
    }
  }, [activeWorkout]);

  useEffect(() => {
    saveWaterIntake(waterIntake);
  }, [waterIntake]);

  useEffect(() => {
    saveWeekPlan(weekPlan);
  }, [weekPlan]);

  // Derived metrics
  const metrics = calculateAllMetrics(profile);

  const handleUpdateProfile = (newProfile: BodyProfile) => {
    setProfile(newProfile);
  };

  const handleAddFoodEntry = (entry: Omit<FoodDiaryEntry, "id" | "created_at">) => {
    const newEntry: FoodDiaryEntry = {
      ...entry,
      id: "entry_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);
    setRecentFoodIds(loadRecentFoodIds());
  };

  const handleBatchAddDiaryEntries = (newEntries: Omit<FoodDiaryEntry, "id" | "created_at">[]) => {
    const created = newEntries.map((entry, index) => ({
      ...entry,
      id: "entry_" + Date.now() + "_" + index + "_" + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
    }));
    setDiaryEntries((prev) => [...created, ...prev]);
    setRecentFoodIds(loadRecentFoodIds());
  };

  const handleDeleteFoodEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleDayPlan = (dayNumber: number) => {
    setWeekPlan((prev) =>
      prev.map((d) => (d.dayNumber === dayNumber ? { ...d, completed: !d.completed } : d))
    );
  };

  // Fridge handlers
  const handleAddFridgeItem = (item: FridgeItem) => {
    setFridgeItems((prev) => [item, ...prev]);
  };

  const handleUpdateFridgeItem = (updated: FridgeItem) => {
    setFridgeItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteFridgeItem = (id: string) => {
    setFridgeItems((prev) => prev.filter((item) => item.id !== id));
  };

  // One-click Add to Plate Cart from Fridge / Daily Plan / Daily Recommendation
  const handleAddToPlate = (item: MealPlateItem) => {
    setPlateItems((prev) => [...prev, item]);
  };

  // One-click Start Workout from Daily Plan
  const handleStartWorkout = (workoutData: any) => {
    const newWorkout: WorkoutPlanType = {
      plan_title: workoutData.exercise_name || "AI 定制燃脂训练",
      subtitle: "今日元气燃脂训练",
      location: "home",
      duration_min: workoutData.duration_min || 25,
      total_calories_burned: workoutData.calories_burned || 160,
      intensity_level: "中等强度",
      encouragement: "每一次暴汗都是脂肪在燃烧，加油！🔥",
      exercises: [
        {
          id: `ex_${Date.now()}_1`,
          section: "热身准备",
          name: "原地小碎步 & 肩关节环绕",
          target_muscle: "激活全身肌肉与心肺",
          reps_or_time: "2分钟",
          duration_min: 2,
          met_value: 3.5,
          calories_burned: 15,
          instructions: "保持轻快节奏，脚尖点地，充分活动肩颈与踝关节。",
          breath_tip: "自然呼吸，不要屏气",
          exercise_gif: "warm up",
        },
        {
          id: `ex_${Date.now()}_2`,
          section: "核心主训",
          name: workoutData.exercise_name || "自重深蹲 & 跪姿俯卧撑",
          target_muscle: "臀腿塑形 / 上肢力量 / 核心稳定",
          reps_or_time: "3 组 × 15 次",
          duration_min: 15,
          met_value: 6.0,
          calories_burned: 110,
          instructions: workoutData.instructions || "屈髋屈膝下蹲至大腿与地面平行，呼气发力站起夹臀。",
          breath_tip: "下蹲吸气，站立呼气",
          exercise_gif: "squat",
        },
        {
          id: `ex_${Date.now()}_3`,
          section: "舒缓拉伸",
          name: "大拜式 & 婴儿式深层放松",
          target_muscle: "背部与臀腿深层放松",
          reps_or_time: "5分钟",
          duration_min: 5,
          met_value: 2.5,
          calories_burned: 20,
          instructions: "臀部坐于脚后跟，双臂向前延伸，深长呼气将身体放松交给地面。",
          breath_tip: "深吸慢呼，享受每一次呼吸的平静",
          exercise_gif: "yoga stretch",
        },
      ],
    };

    setActiveWorkout(newWorkout);
    setCurrentTab("workout");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col font-sans selection:bg-[#FFE4E8] selection:text-[#D53F8C]">
      {/* Navigation bar (Top for desktop, bottom for mobile) */}
      <Navbar
        currentTab={currentTab}
        plateCount={plateItems.length}
        fridgeCount={fridgeItems.length}
        currentTheme={theme}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto">
        {currentTab === "planner" && (
          <MealPlanner
            profile={profile}
            metrics={metrics}
            diaryEntries={diaryEntries}
            plateItems={plateItems}
            userStreak={userStreak}
            recentFoodIds={recentFoodIds}
            onUpdatePlateItems={setPlateItems}
            onBatchAddDiaryEntries={handleBatchAddDiaryEntries}
            onRefreshStreak={setUserStreak}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "fridge" && (
          <FridgeManagement
            items={fridgeItems}
            onAddItem={handleAddFridgeItem}
            onUpdateItem={handleUpdateFridgeItem}
            onDeleteItem={handleDeleteFridgeItem}
            onAddToPlate={handleAddToPlate}
            onNavigateToRecommend={() => setCurrentTab("home")}
          />
        )}

        {currentTab === "home" && (
          <HomeMetrics
            profile={profile}
            diaryEntries={diaryEntries}
            fridgeItems={fridgeItems}
            exerciseLogs={exerciseLogs}
            onUpdateProfile={handleUpdateProfile}
            onAddToPlate={handleAddToPlate}
            onStartWorkout={handleStartWorkout}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === "recommend" && (
          <FoodRecommendations
            profile={profile}
            targetCalories={metrics.targetCalories}
            onAddFoodEntry={handleAddFoodEntry}
          />
        )}

        {currentTab === "diary" && (
          <FoodDiary
            entries={diaryEntries}
            metrics={metrics}
            onAddEntry={handleAddFoodEntry}
            onDeleteEntry={handleDeleteFoodEntry}
          />
        )}

        {currentTab === "workout" && (
          <WorkoutPlan
            profile={profile}
            activePlan={activeWorkout}
            diaryEntries={diaryEntries}
            onSaveActivePlan={setActiveWorkout}
          />
        )}

        {currentTab === "plan" && (
          <MyPlan
            profile={profile}
            metrics={metrics}
            diaryEntries={diaryEntries}
            activeWorkout={activeWorkout}
            weekPlan={weekPlan}
            waterIntake={waterIntake}
            onUpdateWaterIntake={setWaterIntake}
            onToggleDayPlan={handleToggleDayPlan}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
      />

      {/* Subtle Cute Footer for Desktop */}
      <footer className="hidden md:block py-6 border-t border-[#F7EBE8] text-center text-xs text-[#9B8986]">
        <div className="flex items-center justify-center gap-2">
          <span>🌸 FitGlow · 可爱 ins 风身材与饮食管理</span>
          <span>·</span>
          <span>科学营养计算 & 120+ 中华地道食物库 & 智能冰箱与 Gemini 赋能</span>
        </div>
      </footer>
    </div>
  );
}

