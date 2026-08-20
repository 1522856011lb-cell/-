import { ActivityLevel, BodyProfile, Gender, Goal, MetabolicMetrics } from "../types";

/**
 * Calculates BMI (Body Mass Index)
 * Formula: weight (kg) / (height (m))^2
 */
export function calculateBMI(weightKg: number, heightCm: number): { value: number; category: MetabolicMetrics["bmiCategory"] } {
  if (!weightKg || !heightCm) {
    return {
      value: 20.5,
      category: {
        label: "标准身材",
        color: "text-[#68D391]",
        badgeBg: "bg-[#E6F4EA] border-[#A8E6CF]",
        advice: "身材比例非常棒，继续保持健康的作息与饮食！",
      },
    };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = {
    label: "标准身材",
    color: "text-[#48BB78]",
    badgeBg: "bg-[#E6F4EA] border-[#B2F5EA]",
    advice: "身材比例很匀称，注重线条雕刻与营养均衡即可！",
  };

  if (bmi < 18.5) {
    category = {
      label: "偏瘦体型",
      color: "text-[#805AD5]",
      badgeBg: "bg-[#F3E8FF] border-[#D6BCFA]",
      advice: "体脂偏低，可适当增加优质碳水与蛋白质，增强体质与活力！",
    };
  } else if (bmi >= 18.5 && bmi < 24.0) {
    category = {
      label: "理想标准",
      color: "text-[#38A169]",
      badgeBg: "bg-[#E6F4EA] border-[#A8E6CF]",
      advice: "BMI处于黄金健康区间，保持元气作息与适度运动！",
    };
  } else if (bmi >= 24.0 && bmi < 28.0) {
    category = {
      label: "微胖轻盈期",
      color: "text-[#DD6B20]",
      badgeBg: "bg-[#FFFAF0] border-[#FBD38D]",
      advice: "稍微制造300-500大卡的热量缺口，配合有氧+力量能很快看到紧致变化！",
    };
  } else {
    category = {
      label: "需减脂关注",
      color: "text-[#E53E3E]",
      badgeBg: "bg-[#FFF5F5] border-[#FEB2B2]",
      advice: "规律运动与健康减脂餐能有效改善代谢与体态，FitGlow陪伴你每一步！",
    };
  }

  return { value: bmi, category };
}

/**
 * Calculates Body Fat Percentage using Deurenberg Formula:
 * Body Fat % = 1.20 * BMI + 0.23 * Age - 10.8 * Gender - 5.4
 * (Gender: male = 1, female = 0)
 */
export function calculateBodyFatDeurenberg(bmi: number, age: number, gender: Gender): number {
  const genderFactor = gender === "male" ? 1 : 0;
  const fat = 1.2 * bmi + 0.23 * age - 10.8 * genderFactor - 5.4;
  return Number(Math.max(5, Math.min(50, fat)).toFixed(1));
}

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation:
 * Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === "male" ? base + 5 : base - 161;
  return Math.round(Math.max(800, bmr));
}

/**
 * Activity Level Multipliers for TDEE (Total Daily Energy Expenditure)
 */
export function getActivityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case "sedentary":
      return 1.2; // 久坐，很少运动
    case "light":
      return 1.375; // 轻度活动，每周1-3天轻量运动
    case "moderate":
      return 1.55; // 中度活动，每周3-5天中等运动
    case "heavy":
      return 1.725; // 高强度，每周6-7天高强度运动
    default:
      return 1.2;
  }
}

/**
 * Calculates TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = getActivityMultiplier(activityLevel);
  return Math.round(bmr * multiplier);
}

/**
 * Calculates Target Daily Calories based on Goal
 * - Fat Loss: TDEE - 400 kcal (Deficit 300-500 kcal, safe minimum 1200 kcal)
 * - Muscle Gain: TDEE + 250 kcal (Surplus 200-300 kcal)
 * - Maintenance: TDEE
 */
export function calculateTargetCalories(tdee: number, goal: Goal): number {
  if (goal === "fat_loss") {
    return Math.max(1200, Math.round(tdee - 400));
  } else if (goal === "muscle_gain") {
    return Math.round(tdee + 250);
  }
  return Math.round(tdee);
}

/**
 * Calculates Macronutrient Distributions (Protein, Carbs, Fat, Fiber)
 */
export function calculateMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal
): MetabolicMetrics["macros"] {
  // Protein multiplier based on goal
  let proteinPerKg = 1.8;
  if (goal === "fat_loss") proteinPerKg = 2.0;
  if (goal === "muscle_gain") proteinPerKg = 2.2;
  if (goal === "maintenance") proteinPerKg = 1.6;

  const proteinG = Math.round(weightKg * proteinPerKg);
  const proteinCal = proteinG * 4;

  // Fat: approx 25% of total target calories
  const fatCal = Math.round(targetCalories * 0.25);
  const fatG = Math.round(fatCal / 9);

  // Carbs: remainder calories
  const carbsCal = Math.max(0, targetCalories - (proteinCal + fatCal));
  const carbsG = Math.round(carbsCal / 4);

  // Daily recommended dietary fiber (around 25-30g)
  const fiberG = Math.round(Math.max(22, (targetCalories / 1000) * 14));

  const proteinPct = Math.round((proteinCal / targetCalories) * 100);
  const fatPct = Math.round((fatCal / targetCalories) * 100);
  const carbsPct = Math.max(0, 100 - (proteinPct + fatPct));

  return {
    proteinG,
    carbsG,
    fatG,
    fiberG,
    proteinCal,
    carbsCal,
    fatCal,
    proteinPct,
    carbsPct,
    fatPct,
  };
}

/**
 * Calculates complete metabolic metrics for a user profile
 */
export function calculateAllMetrics(profile: BodyProfile): MetabolicMetrics {
  const { value: bmi, category: bmiCategory } = calculateBMI(profile.weight_kg, profile.height_cm);
  const bodyFatPercent = calculateBodyFatDeurenberg(bmi, profile.age, profile.gender);
  const bmr = calculateBMR(profile.weight_kg, profile.height_cm, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activity_level);
  const targetCalories = calculateTargetCalories(tdee, profile.goal);
  const macros = calculateMacros(targetCalories, profile.weight_kg, profile.goal);

  return {
    bmi,
    bmiCategory,
    bodyFatPercent,
    bmr,
    tdee,
    targetCalories,
    macros,
  };
}

/**
 * Calculates calories burned using MET (Metabolic Equivalent of Task)
 * Formula: Calories = (MET * 3.5 * weightKg / 200) * durationInMinutes
 */
export function calculateMETCalories(metValue: number, weightKg: number, durationMin: number): number {
  const cal = (metValue * 3.5 * weightKg / 200) * durationMin;
  return Math.round(cal);
}
