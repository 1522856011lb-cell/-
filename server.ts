import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { AUTHENTIC_RECIPES, getPredefinedRecipe, RecipeData } from "./src/data/recipes.ts";
import { getAccurateDishImage } from "./src/utils/unsplash.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy Gemini client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Supabase server client helper
function getSupabaseServer(req?: express.Request): SupabaseClient | null {
  const url = (req?.headers["x-supabase-url"] as string) || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key = (req?.headers["x-supabase-key"] as string) || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (url && key && url.startsWith("http")) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.warn("Failed to create Supabase server client:", e);
      return null;
    }
  }
  return null;
}

// In-memory high-speed recipe cache
const inMemoryRecipeStore = new Map<string, any>();

// Helper to format recipe payload into unified schema
function formatRecipePayload(item: any): any {
  if (!item) return null;

  const dishName = item.dish_name || item.recipe_name || "营养轻食";
  const cookTime = Number(item.cooking_time_min || item.cook_time_min || item.cooking_time || 15);
  const prepTime = Number(item.prep_time_min || item.prep_time || 5);
  const tips = item.tips || (Array.isArray(item.chef_tips) ? item.chef_tips.join(" ") : "少油少盐，慢火温烹锁住营养。");

  // Normalize ingredients
  const ingredients = Array.isArray(item.ingredients)
    ? item.ingredients.map((ing: any) => ({
        name: typeof ing === "string" ? ing : ing.name || "优质食材",
        amount: typeof ing === "string" ? "适量" : ing.amount || "适量",
        notes: ing.notes || "",
        in_fridge: Boolean(ing.in_fridge),
      }))
    : [];

  // Normalize steps
  const steps = Array.isArray(item.steps)
    ? item.steps.map((st: any, idx: number) => {
        if (typeof st === "string") {
          return {
            step_number: idx + 1,
            title: `第 ${idx + 1} 步`,
            instruction: st,
            detail: st,
            image_keyword: `${dishName} 步骤${idx + 1}`,
          };
        }
        return {
          step_number: Number(st.step_number || idx + 1),
          title: st.title || `第 ${idx + 1} 步`,
          instruction: st.instruction || st.detail || "",
          detail: st.detail || st.instruction || "",
          image_keyword: st.image_keyword || `${dishName} 步骤${idx + 1}`,
          image_url: st.image_url || "",
        };
      })
    : [];

  return {
    id: item.id || `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    dish_name: dishName,
    recipe_name: dishName,
    subtitle: item.subtitle || `${cookTime}分钟高颜值快手健康料理`,
    category: item.category || "精选家常",
    cooking_time_min: cookTime,
    cook_time_min: cookTime,
    cooking_time: cookTime,
    prep_time_min: prepTime,
    difficulty: item.difficulty || "简单快手",
    servings: Number(item.servings || 1),
    calories: Number(item.calories || item.total_calories || 320),
    total_calories: Number(item.total_calories || item.calories || 320),
    protein_g: Number(item.protein_g || 22),
    carbs_g: Number(item.carbs_g || 18),
    fat_g: Number(item.fat_g || 8),
    fiber_g: Number(item.fiber_g || 3),
    ingredients,
    steps,
    tips,
    chef_tips: Array.isArray(item.chef_tips) ? item.chef_tips : [tips],
    image_url: (item.image_url && !item.image_url.includes("via.placeholder.com")) ? item.image_url : getAccurateDishImage(dishName),
    image_keyword: item.image_keyword || dishName,
    created_at: item.created_at || new Date().toISOString(),
  };
}

// Initialize in-memory cache from AUTHENTIC_RECIPES
for (const r of AUTHENTIC_RECIPES) {
  const formatted = formatRecipePayload(r);
  inMemoryRecipeStore.set(r.dish_name.toLowerCase(), formatted);
}

// Auto-seed Supabase if empty
let hasSeededSupabase = false;
async function seedDefaultRecipesIfEmpty(supabase: SupabaseClient) {
  if (hasSeededSupabase) return;
  try {
    const { count, error } = await supabase.from("recipes").select("*", { count: "exact", head: true });
    if (error) {
      // Table might not exist yet or no permission; quiet log
      return;
    }
    if (count === 0 || count === null) {
      console.log("Seeding 10+ authentic recipes to Supabase recipes table...");
      const rows = AUTHENTIC_RECIPES.map((r) => ({
        id: r.id,
        dish_name: r.dish_name,
        category: r.category,
        ingredients: r.ingredients,
        steps: r.steps,
        cooking_time_min: r.cooking_time_min,
        difficulty: r.difficulty,
        tips: r.tips,
        image_url: r.image_url || "",
        created_at: new Date().toISOString(),
      }));
      const { error: seedErr } = await supabase.from("recipes").upsert(rows, { onConflict: "dish_name" });
      if (!seedErr) {
        hasSeededSupabase = true;
        console.log(`Successfully seeded ${rows.length} authentic recipes to Supabase!`);
      }
    } else {
      hasSeededSupabase = true;
    }
  } catch (err) {
    // Ignore seed errors gracefully
  }
}

// Core Recipe Resolution Engine (Supabase -> Predefined Database -> Return null / 404)
// AI generation is completely removed to prevent inaccurate recipes.
async function resolveRecipeData(
  dishName: string,
  req?: express.Request,
  _goal?: string,
  _targetCalories?: number
): Promise<any> {
  const cleanName = (dishName || "").trim();
  if (!cleanName) return null;

  const lowerName = cleanName.toLowerCase();

  // 1. Check in-memory store for instant (<1ms) response
  if (inMemoryRecipeStore.has(lowerName)) {
    return inMemoryRecipeStore.get(lowerName);
  }

  // 2. Check Supabase 'recipes' table
  const supabase = getSupabaseServer(req);
  if (supabase) {
    try {
      // Trigger background seed check if not done
      seedDefaultRecipesIfEmpty(supabase).catch(() => {});

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .ilike("dish_name", cleanName)
        .limit(1)
        .maybeSingle();

      if (!error && data && data.ingredients) {
        const formatted = formatRecipePayload(data);
        inMemoryRecipeStore.set(lowerName, formatted);
        return formatted;
      }
    } catch (dbErr) {
      console.warn("Supabase query recipe error:", dbErr);
    }
  }

  // 3. Check predefined authentic recipes database
  const predefined = getPredefinedRecipe(cleanName);
  if (predefined) {
    const formatted = formatRecipePayload(predefined);
    inMemoryRecipeStore.set(lowerName, formatted);
    // Asynchronously insert into Supabase if DB is connected
    if (supabase) {
      Promise.resolve(
        supabase.from("recipes").upsert(
          {
            id: formatted.id,
            dish_name: formatted.dish_name,
            category: formatted.category,
            ingredients: formatted.ingredients,
            steps: formatted.steps,
            cooking_time_min: formatted.cooking_time_min,
            difficulty: formatted.difficulty,
            tips: formatted.tips,
            image_url: formatted.image_url,
            created_at: formatted.created_at,
          },
          { onConflict: "dish_name" }
        )
      )
        .then(() => {})
        .catch(() => {});
    }
    return formatted;
  }

  // If not found in authentic database, return null
  return null;
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // 1. Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "FitGlow Backend API" });
  });

  // 2. /api/estimate-food: Estimate food name, portion, calories & macros
  app.post("/api/estimate-food", async (req, res) => {
    try {
      const { text, portion_g } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Missing food description or text" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback calculation heuristic
        return res.json({
          food_name: text.slice(0, 30),
          portion_g: portion_g || 150,
          calories: Math.round((portion_g || 150) * 1.35),
          protein_g: Number(((portion_g || 150) * 0.12).toFixed(1)),
          carbs_g: Number(((portion_g || 150) * 0.15).toFixed(1)),
          fat_g: Number(((portion_g || 150) * 0.03).toFixed(1)),
          fiber_g: Number(((portion_g || 150) * 0.02).toFixed(1)),
          health_score: "A",
          advice: "富含营养，搭配均衡！",
        });
      }

      const prompt = `你是一位专业且亲切的可爱元气营养师。请分析用户输入的饮食描述："${text}"，预估其食物名称、份量（克）、总热量（千卡）、蛋白质（克）、碳水化合物（克）、脂肪（克）、膳食纤维（克），并给出一条简短温暖的营养小评语。如果用户指定了份量克数 ${portion_g || "未指定"}，请按此份量计算；若未指定则智能推断合理的1人份量。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              food_name: { type: Type.STRING, description: "规范简洁的食物名称，例如：香煎黑椒鸡胸肉配西兰花" },
              portion_g: { type: Type.NUMBER, description: "预估总重量/克" },
              calories: { type: Type.NUMBER, description: "总热量(kcal)" },
              protein_g: { type: Type.NUMBER, description: "蛋白质克数" },
              carbs_g: { type: Type.NUMBER, description: "碳水化合物克数" },
              fat_g: { type: Type.NUMBER, description: "脂肪克数" },
              fiber_g: { type: Type.NUMBER, description: "膳食纤维克数" },
              health_score: { type: Type.STRING, description: "健康等级如 A+, A, B+" },
              advice: { type: Type.STRING, description: "一句可爱温暖的营养分析点评" },
            },
            required: ["food_name", "portion_g", "calories", "protein_g", "carbs_g", "fat_g", "fiber_g"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("estimate-food error:", err);
      // Return safe fallback
      const { text, portion_g } = req.body;
      return res.json({
        food_name: text || "健康餐食",
        portion_g: portion_g || 150,
        calories: 220,
        protein_g: 18.5,
        carbs_g: 22.0,
        fat_g: 6.5,
        fiber_g: 3.5,
        health_score: "A",
        advice: "营养搭配很好，元气满满的一餐！✨",
      });
    }
  });

  // 3. /api/recommend-foods: Recommend 8-10 ins-style healthy foods based on user goals
  app.post("/api/recommend-foods", async (req, res) => {
    try {
      const { height_cm, weight_kg, goal, target_calories, category } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback default rich recipes
        return res.json(getDefaultRecommendedFoods(goal));
      }

      const prompt = `请为 FitGlow 应用（可爱 ins 风、追求高级感与健康轻食的女/男性）推荐 8-10 款日常极易买到、中国人常吃且高颜值、营养均衡的健康餐品/食材方案。
用户档案：
- 目标：${goal === "fat_loss" ? "减脂塑形（控卡高饱腹、高蛋白、高纤）" : goal === "muscle_gain" ? "增肌紧致（高蛋白、适度碳水、优质脂肪）" : "健康维持/轻体"}
- 身高：${height_cm || 165}cm，体重：${weight_kg || 55}kg
- 每日目标热量：约 ${target_calories || 1500} kcal
${category ? `- 用户特定偏好分类: ${category}` : ""}

核心要求：
1. 食材必须非常接地气、中国人日常菜市场或超市随手可买（例如：鸡蛋、豆腐、鸡胸肉、瘦牛肉、鲜虾、鲈鱼、西兰花、菠菜、番茄、黄瓜、紫薯、玉米、糙米饭、荞麦面、全麦馒头等），烹饪强调少油少盐、少糖鲜香。
2. 菜品命名具有精致 ins 治愈感（如：无油番茄虾仁滑蛋、清蒸香柠鲈鱼配杂粮饭、黑椒西兰花牛肉粒、暖胃菌菇豆腐嫩鸡汤、抹茶奇亚籽燕麦碗等）。
3. 每 100g 对应的热量、蛋白质、碳水、脂肪、膳食纤维克数需精准科学。
4. 包含食物亮点标签（例如："低GI饱腹", "家常高蛋白", "刮油高纤", "快手清爽" 等）。
5. 包含适宜餐次（早餐 / 午餐 / 晚餐 / 加餐）。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING, description: "食物/菜品名称" },
                category: { type: Type.STRING, description: "分类：高蛋白 / 优质碳水 / 减脂刮油 / 低卡甜点 / 能量轻食" },
                meal_type: { type: Type.STRING, description: "早餐 / 午餐 / 晚餐 / 加餐" },
                calories_per_100g: { type: Type.NUMBER, description: "每100克热量(kcal)" },
                protein_per_100g: { type: Type.NUMBER, description: "每100克蛋白质(g)" },
                carbs_per_100g: { type: Type.NUMBER, description: "每100克碳水(g)" },
                fat_per_100g: { type: Type.NUMBER, description: "每100克脂肪(g)" },
                fiber_per_100g: { type: Type.NUMBER, description: "每100克膳食纤维(g)" },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2-3个精致标签",
                },
                description: { type: Type.STRING, description: "一句诱人且治愈的食物描述" },
                suggested_portion_g: { type: Type.NUMBER, description: "推荐一份的食用克数，如180g" },
                emoji: { type: Type.STRING, description: "可爱的单个水果/食物emoji" },
              },
              required: [
                "id",
                "name",
                "category",
                "meal_type",
                "calories_per_100g",
                "protein_per_100g",
                "carbs_per_100g",
                "fat_per_100g",
                "fiber_per_100g",
                "tags",
                "description",
                "suggested_portion_g",
                "emoji",
              ],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json(parsed);
      }
      return res.json(getDefaultRecommendedFoods(goal));
    } catch (err: any) {
      console.error("recommend-foods error:", err);
      return res.json(getDefaultRecommendedFoods(req.body?.goal));
    }
  });

  // 4. /api/recipes: Authentic Database Recipe Endpoints (No AI Generation)
  app.get("/api/recipes/:dishName", async (req, res) => {
    try {
      const rawName = req.params.dishName || (req.query.name as string) || "";
      const dishName = decodeURIComponent(rawName).trim();
      if (!dishName) {
        return res.status(400).json({ error: "Missing dishName" });
      }
      const recipe = await resolveRecipeData(dishName, req);
      if (!recipe) {
        return res.status(404).json({
          error: "菜谱正在完善中，敬请期待！",
          dish_name: dishName,
        });
      }
      return res.json(recipe);
    } catch (err: any) {
      console.error("GET /api/recipes/:dishName error:", err);
      return res.status(404).json({
        error: "菜谱正在完善中，敬请期待！",
        dish_name: req.params.dishName,
      });
    }
  });

  app.get("/api/recipes", async (req, res) => {
    try {
      const rawName = (req.query.dish_name as string) || (req.query.name as string) || (req.query.dishName as string) || "";
      const dishName = decodeURIComponent(rawName).trim();
      if (dishName) {
        const recipe = await resolveRecipeData(dishName, req);
        if (!recipe) {
          return res.status(404).json({
            error: "菜谱正在完善中，敬请期待！",
            dish_name: dishName,
          });
        }
        return res.json(recipe);
      }
      // Return predefined authentic recipes list
      return res.json(AUTHENTIC_RECIPES.map((r) => formatRecipePayload(r)));
    } catch (err: any) {
      return res.json(AUTHENTIC_RECIPES.map((r) => formatRecipePayload(r)));
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const { dish_name, food_name } = req.body;
      const targetName = dish_name || food_name;
      if (!targetName) {
        return res.status(400).json({ error: "Missing dish_name or food_name" });
      }
      const recipe = await resolveRecipeData(targetName, req);
      if (!recipe) {
        return res.status(404).json({
          error: "菜谱正在完善中，敬请期待！",
          dish_name: targetName,
        });
      }
      return res.json(recipe);
    } catch (err: any) {
      return res.status(404).json({
        error: "菜谱正在完善中，敬请期待！",
        dish_name: req.body?.dish_name || req.body?.food_name,
      });
    }
  });

  // POST /api/generate-recipe (Maintained for backwards-compatibility; now strictly queries authentic database)
  app.post("/api/generate-recipe", async (req, res) => {
    try {
      const { food_name, dish_name } = req.body;
      const targetName = food_name || dish_name;
      if (!targetName) {
        return res.status(400).json({ error: "Missing food_name" });
      }
      const recipe = await resolveRecipeData(targetName, req);
      if (!recipe) {
        return res.status(404).json({
          error: "菜谱正在完善中，敬请期待！",
          dish_name: targetName,
        });
      }
      return res.json(recipe);
    } catch (err: any) {
      console.error("generate-recipe error:", err);
      return res.status(404).json({
        error: "菜谱正在完善中，敬请期待！",
        dish_name: req.body?.food_name,
      });
    }
  });

  // GET /api/dish-image?name=... - Returns the accurate authentic food image
  app.get("/api/dish-image", (req, res) => {
    const rawName = (req.query.name as string) || (req.query.dish_name as string) || (req.query.query as string) || "";
    const dishName = decodeURIComponent(rawName).trim();
    const imageUrl = getAccurateDishImage(dishName);
    return res.json({ dish_name: dishName, image_url: imageUrl });
  });

  // 5. /api/generate-workout: Generate tailored workout plan with MET calories
  app.post("/api/generate-workout", async (req, res) => {
    try {
      const { location, duration_min, weight_kg, goal, focus_area } = req.body;
      const userWeight = Number(weight_kg) || 55;
      const duration = Number(duration_min) || 30;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json(getDefaultWorkoutPlan(location, duration, userWeight, goal, focus_area));
      }

      const prompt = `请为 FitGlow 元气健康应用生成一份高质感、科学且易坚持的运动训练计划方案。
用户参数：
- 运动环境：${location === "gym" ? "健身房 (Gym，可使用哑铃、器械、龙门架等)" : "在家 (Home，自重、瑜伽垫、弹力带或小哑铃)"}
- 运动总时长：${duration} 分钟
- 训练重点：${focus_area || "全身燃脂塑形"}
- 用户体重：${userWeight} kg
- 健身目标：${goal === "fat_loss" ? "高效燃脂与心肺提升" : goal === "muscle_gain" ? "肌力增长与线条紧致" : "身心舒缓与代谢激活"}

要求：
1. 包含结构：热身激活 (Warm-up ~3-5min) -> 主训练 (Main Routine) -> 舒缓拉伸 (Cool-down ~3-5min)。
2. 每个动作注明：
   - 动作名称与目标肌群
   - 动作要领（如何发力，呼吸节奏，避免受伤的要点）
   - 组数/次数或持续时长（如：4组 × 12次 或 45秒）
   - MET 运动代谢当量值（例如轻度拉伸 MET=2.5，中强度力量 MET=5.0，HIIT/自重波比 MET=8.0）
   - 预估消耗热量（公式：MET * 3.5 * weightKg / 200 * duration_in_minutes）
   - exercise_gif: 动作对应的英文标准动图关键词（如：squat, push up, jumping jack, plank, lunge, dumbbell row, cobra stretch, glute bridge）
3. 计算本套训练总消耗热量(kcal)。
4. 附上一句极度治愈、充满元气的鼓励文案。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plan_title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              location: { type: Type.STRING },
              duration_min: { type: Type.NUMBER },
              total_calories_burned: { type: Type.NUMBER },
              intensity_level: { type: Type.STRING, description: "轻柔初学者 / 中度燃脂 / 高效塑形" },
              encouragement: { type: Type.STRING, description: "元气满满的鼓励句子，如：流汗是脂肪在哭泣，今天也是闪闪发光的小仙女/小达人哦！✨" },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    section: { type: Type.STRING, description: "热身激活 / 核心主训 / 舒缓拉伸" },
                    name: { type: Type.STRING, description: "动作名称" },
                    target_muscle: { type: Type.STRING, description: "主要刺激部位" },
                    reps_or_time: { type: Type.STRING, description: "如 3组 × 15次 或 40秒" },
                    duration_min: { type: Type.NUMBER, description: "该动作大约用时分钟数" },
                    met_value: { type: Type.NUMBER, description: "MET值，如 3.5 到 8.5" },
                    calories_burned: { type: Type.NUMBER, description: "该动作消耗热量(kcal)" },
                    instructions: { type: Type.STRING, description: "动作标准发力指引" },
                    breath_tip: { type: Type.STRING, description: "呼吸提示，如发力呼气，还原吸气" },
                    exercise_gif: { type: Type.STRING, description: "英文标准动作关键词，如 squat, push up, jumping jack, lunge, plank 等" },
                  },
                  required: ["name", "section", "target_muscle", "reps_or_time", "met_value", "calories_burned", "instructions"],
                },
              },
            },
            required: [
              "plan_title",
              "location",
              "duration_min",
              "total_calories_burned",
              "intensity_level",
              "encouragement",
              "exercises",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("generate-workout error:", err);
      return res.json(getDefaultWorkoutPlan(req.body?.location, req.body?.duration_min, req.body?.weight_kg, req.body?.goal, req.body?.focus_area));
    }
  });

  // 6. /api/health-assessment: AI Daily Health Assessment
  app.post("/api/health-assessment", async (req, res) => {
    try {
      const { profile, diary_entries = [], exercise_logs = [] } = req.body;
      const userProfile = profile || { height_cm: 165, weight_kg: 52.5, age: 24, gender: "female", activity_level: "light", goal: "fat_loss" };

      const totalCal = diary_entries.reduce((sum: number, e: any) => sum + (Number(e.calories) || 0), 0);
      const totalProtein = diary_entries.reduce((sum: number, e: any) => sum + (Number(e.protein_g) || 0), 0);
      const totalCarbs = diary_entries.reduce((sum: number, e: any) => sum + (Number(e.carbs_g) || 0), 0);
      const totalFat = diary_entries.reduce((sum: number, e: any) => sum + (Number(e.fat_g) || 0), 0);
      const totalBurned = exercise_logs.reduce((sum: number, e: any) => sum + (Number(e.calories_burned) || 0), 0);

      const ai = getGeminiClient();
      if (!ai) {
        return res.json(getDefaultHealthAssessment(userProfile, totalCal, totalProtein, totalCarbs, totalFat, totalBurned));
      }

      const prompt = `你是一位专业且充满元气的 ins 风格健康营养与运动专家。请根据用户今日的数据，进行全方位的每日健康评估：
用户档案：
- 性别：${userProfile.gender === "male" ? "男" : "女"}，年龄：${userProfile.age || 24}岁
- 身高：${userProfile.height_cm || 165}cm，体重：${userProfile.weight_kg || 52.5}kg
- 健身目标：${userProfile.goal === "fat_loss" ? "减脂塑形" : userProfile.goal === "muscle_gain" ? "增肌紧致" : "健康维持"}
- 活动强度：${userProfile.activity_level || "light"}

今日记录数据：
- 饮食总摄入：${totalCal} kcal（蛋白质 ${totalProtein}g，碳水 ${totalCarbs}g，脂肪 ${totalFat}g）
- 已记录菜品清单：${diary_entries.map((e: any) => `${e.meal_type}: ${e.food_name}(${e.portion_g}g, ${e.calories}kcal)`).join("; ") || "暂无记录"}
- 运动消耗：${totalBurned} kcal
- 运动记录：${exercise_logs.map((e: any) => `${e.exercise_name}(${e.duration_min}分钟, 消耗${e.calories_burned}kcal)`).join("; ") || "今日尚未记录运动"}

请评估：
1. 综合健康评分 (0-100的整数，如 85, 92)
2. 简短暖心的今日表现总评（1-2句话，可爱治愈但科学）
3. 五项细分维度的达标分析 (details)：
   - 热量摄入 vs 目标
   - 蛋白质达标率
   - 碳水脂肪比例
   - 运动热量消耗
   - 体重/体脂变化趋势
   每个细分维度包含 label, value, target, unit, status (只能为 "perfect" | "good" | "warning" | "info")
4. 一段体贴实用的夜间与明日改善建议 (suggestions)。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "0到100的综合健康得分" },
              summary: { type: Type.STRING, description: "元气温暖的总结点评" },
              details: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING, description: "当前值如 1450, 85, 48:22, 260" },
                    target: { type: Type.STRING, description: "目标值如 1500, 90, 50:20, 300" },
                    unit: { type: Type.STRING, description: "单位如 kcal, g, %, kcal" },
                    status: { type: Type.STRING, description: "只能为 perfect, good, warning, info" },
                  },
                  required: ["label", "value", "target", "unit", "status"],
                },
              },
              suggestions: { type: Type.STRING, description: "贴心具体的饮食或作息建议" },
            },
            required: ["score", "summary", "details", "suggestions"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("health-assessment error:", err);
      return res.json(getDefaultHealthAssessment(req.body?.profile, 1400, 75, 160, 45, 250));
    }
  });

  // 7. /api/daily-plan: Tailored Daily Plan (Remaining Meals + Workout)
  app.post("/api/daily-plan", async (req, res) => {
    try {
      const { profile, diary_entries = [], fridge_items = [], exercise_logs = [] } = req.body;
      const userProfile = profile || { height_cm: 165, weight_kg: 52.5, age: 24, goal: "fat_loss" };

      const ai = getGeminiClient();
      if (!ai) {
        return res.json(getDefaultDailyPlan(userProfile, diary_entries, fridge_items));
      }

      const loggedMealTypes = Array.from(new Set(diary_entries.map((e: any) => e.meal_type)));
      const fridgeNames = fridge_items.map((i: any) => `${i.food_name}(${i.quantity}${i.unit})`).join("、");

      const prompt = `你是一位高阶定制健康计划导师。请根据用户今日的实际摄入情况与冰箱现有食材，为用户量身打造今天剩余餐次的精准补充方案与运动建议。
用户档案：
- 目标：${userProfile.goal === "fat_loss" ? "减脂塑形" : userProfile.goal === "muscle_gain" ? "增肌紧致" : "健康维持"}
- 身高：${userProfile.height_cm || 165}cm，体重：${userProfile.weight_kg || 52.5}kg
- 今日已记录餐次：${loggedMealTypes.join("、") || "今日尚未记录任何餐次"}
- 今日已吃食物：${diary_entries.map((e: any) => `${e.food_name}(${e.calories}kcal)`).join("，") || "无"}
- 冰箱现有食材库存：${fridgeNames || "无特定库存"}
- 今日已完成运动：${exercise_logs.map((e: any) => `${e.exercise_name}(${e.duration_min}min)`).join("，") || "无"}

要求：
1. 分析今天还未吃或需要补充的餐次（如晚餐、加餐或午餐），优先建议利用用户【冰箱库存】中的食材进行低脂高营养搭配！
2. 每个餐次推荐 1-2 款精准食物/菜品，明确标注 food_name（名称）、portion_g（推荐食用克数）、reason（推荐理由，说明如何利用冰箱食材及营养互补）。
3. 给出今日专属的运动建议 (workout)，包含 exercise_name、duration_min、calories_burned、instructions。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              meals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    meal_type: { type: Type.STRING, description: "早餐 / 午餐 / 晚餐 / 加餐" },
                    suggestions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          food_name: { type: Type.STRING },
                          portion_g: { type: Type.NUMBER },
                          reason: { type: Type.STRING },
                        },
                        required: ["food_name", "portion_g", "reason"],
                      },
                    },
                  },
                  required: ["meal_type", "suggestions"],
                },
              },
              workout: {
                type: Type.OBJECT,
                properties: {
                  exercise_name: { type: Type.STRING },
                  duration_min: { type: Type.NUMBER },
                  calories_burned: { type: Type.NUMBER },
                  instructions: { type: Type.STRING },
                },
                required: ["exercise_name", "duration_min", "calories_burned", "instructions"],
              },
            },
            required: ["meals", "workout"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("daily-plan error:", err);
      return res.json(getDefaultDailyPlan(req.body?.profile, req.body?.diary_entries, req.body?.fridge_items));
    }
  });

  // 8. /api/daily-recommendation: Daily Dish Recommendation (Using Fridge Ingredients)
  app.post("/api/daily-recommendation", async (req, res) => {
    try {
      const { fridge_items = [], goal = "fat_loss", diary_entries = [], preferences = "" } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json(getDefaultDailyRecommendation(fridge_items, goal));
      }

      const fridgeList = fridge_items.map((i: any) => `${i.food_name}(${i.quantity}${i.unit})`).join("、");
      const loggedFoods = diary_entries.map((e: any) => e.food_name).join("、");

      const prompt = `你是一位顶级私厨营养顾问。请专门为用户推荐一道高颜值、绝佳口感的 ins 风格健康佳肴。
要求：
1. 优先使用用户【冰箱库存】中的现有食材：${fridgeList || "鸡胸肉、西蓝花、番茄、鸡蛋、燕麦"}。
2. 用户目标：${goal === "fat_loss" ? "减脂控卡" : goal === "muscle_gain" ? "增肌塑形" : "营养均衡"}。
3. 今天已经吃过的食物：${loggedFoods || "无"}（尽量避免重复）。
4. 偏好或禁忌：${preferences || "家常快手少油少盐"}。
5. 返回这道菜的名称 (dish_name)、图片搜索关键词 (image_keyword)、推荐理由 (reason，如"用你冰箱里的鸡胸肉和番茄，减脂又好吃✨")、以及详细食谱 (recipe)，包含食材列表（标记 in_fridge 是否来自冰箱）、烹饪步骤、时长（分钟）、难度、主厨小秘诀。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dish_name: { type: Type.STRING },
              image_keyword: { type: Type.STRING, description: "用于搜索高清美食图片的准确词汇" },
              reason: { type: Type.STRING, description: "温暖诱人的推荐理由" },
              recipe: {
                type: Type.OBJECT,
                properties: {
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING },
                        in_fridge: { type: Type.BOOLEAN, description: "是否在用户冰箱里已有" },
                      },
                      required: ["name", "amount"],
                    },
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  cooking_time: { type: Type.NUMBER, description: "烹饪用时(分钟)" },
                  difficulty: { type: Type.STRING, description: "新手友好 / 简单快手" },
                  tips: { type: Type.STRING, description: "主厨小贴士" },
                },
                required: ["ingredients", "steps", "cooking_time", "difficulty", "tips"],
              },
            },
            required: ["dish_name", "image_keyword", "reason", "recipe"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("daily-recommendation error:", err);
      return res.json(getDefaultDailyRecommendation(req.body?.fridge_items, req.body?.goal));
    }
  });

  // 9. /api/fridge-recipes: Smart recipes matched from current fridge ingredients
  app.post("/api/fridge-recipes", async (req, res) => {
    try {
      const { fridge_items = [] } = req.body;
      const itemNames: string[] = Array.isArray(fridge_items)
        ? fridge_items.map((i: any) => (typeof i === "string" ? i : i.food_name || i.name)).filter(Boolean)
        : [];

      const ai = getGeminiClient();
      if (!ai) {
        return res.json(getDefaultFridgeRecipes(itemNames));
      }

      const prompt = `用户当前冰箱里的全部食材清单：【${itemNames.join("、") || "鸡蛋、番茄、鸡胸肉、西蓝花、燕麦、酸奶"}】。
请基于用户冰箱里的现有食材（最大化利用现有库存食材），推荐 3-5 道可制作的美味低卡中式家常/轻食菜谱。
请返回 JSON 数组，每道菜包含：
1. dish_name: 菜品名称（如：爆汁番茄鲜虾滑蛋、蒜香黑椒鸡胸肉粒炒西蓝花）
2. image_keyword: 用于 Unsplash 美食图片检索的精准中文关键词（如：番茄炒蛋、黑椒鸡胸肉、西蓝花炒虾仁）
3. required_ingredients: 制作该菜品所需全部食材名称列表（如：["鸡蛋", "番茄", "西蓝花", "食用油", "盐"]）
4. missing_ingredients: 冰箱中暂缺需要额外准备的食材（如油盐葱蒜调料或配菜；若冰箱已有或无需额外材料则为空数组 []）
5. reason: 推荐理由（1-2句说明如何巧妙消耗现有食材及控卡亮点）
6. recipe: 详细图文食谱对象，包含：
   - cooking_time: 烹饪耗时（分钟，数字）
   - difficulty: 难度等级（如 "新手友好" / "简单快手" / "中等难度"）
   - tips: 减脂或口感提升的贴士
   - ingredients: 包含 name (名称), amount (份量), in_fridge (布尔值，是否在冰箱已有)
   - steps: 详细制作步骤数组，每项包含 step_number (序号), instruction (文字步骤说明), image_keyword (该步骤的图片检索关键词，如 "切番茄"、"热锅炒蛋"、"大火收汁")`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dish_name: { type: Type.STRING },
                image_keyword: { type: Type.STRING },
                required_ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                missing_ingredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                reason: { type: Type.STRING },
                recipe: {
                  type: Type.OBJECT,
                  properties: {
                    cooking_time: { type: Type.NUMBER },
                    difficulty: { type: Type.STRING },
                    tips: { type: Type.STRING },
                    ingredients: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          amount: { type: Type.STRING },
                          in_fridge: { type: Type.BOOLEAN },
                        },
                        required: ["name", "amount", "in_fridge"],
                      },
                    },
                    steps: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          step_number: { type: Type.INTEGER },
                          instruction: { type: Type.STRING },
                          image_keyword: { type: Type.STRING },
                        },
                        required: ["step_number", "instruction"],
                      },
                    },
                  },
                  required: ["cooking_time", "difficulty", "tips", "ingredients", "steps"],
                },
              },
              required: ["dish_name", "image_keyword", "required_ingredients", "missing_ingredients", "reason", "recipe"],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json(parsed);
      }
      return res.json(getDefaultFridgeRecipes(itemNames));
    } catch (err: any) {
      console.error("fridge-recipes error:", err);
      const { fridge_items = [] } = req.body;
      const itemNames = Array.isArray(fridge_items)
        ? fridge_items.map((i: any) => (typeof i === "string" ? i : i.food_name || i.name)).filter(Boolean)
        : [];
      return res.json(getDefaultFridgeRecipes(itemNames));
    }
  });

  // 10. /api/nutritionix/search: Instant food search
  app.get("/api/nutritionix/search", async (req, res) => {
    try {
      const query = (req.query.query as string || "").trim();
      if (!query) {
        return res.json({ common: [], branded: [] });
      }

      const appId = process.env.NUTRITIONIX_APP_ID;
      const apiKey = process.env.NUTRITIONIX_API_KEY;

      if (appId && apiKey) {
        try {
          const apiRes = await fetch(
            `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}&locale=zh_CN`,
            {
              headers: {
                "x-app-id": appId,
                "x-app-key": apiKey,
              },
            }
          );
          if (apiRes.ok) {
            const data = await apiRes.json();
            return res.json(data);
          }
        } catch (apiErr) {
          console.warn("Nutritionix direct search failed, using smart fallback:", apiErr);
        }
      }

      // Smart Gemini / Database Search Fallback
      const ai = getGeminiClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `请搜索与关键词 "${query}" 最相关的 5-8 种健康常见食物。请返回 JSON 格式，包含 common 数组，每项包含 food_name, serving_unit (如克/个/碗), serving_qty (数字，如 100 或 1), calories (千卡), protein_g (克), carbs_g (克), fat_g (克), fiber_g (克), emoji。`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                common: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      food_name: { type: Type.STRING },
                      serving_unit: { type: Type.STRING },
                      serving_qty: { type: Type.NUMBER },
                      calories: { type: Type.NUMBER },
                      protein_g: { type: Type.NUMBER },
                      carbs_g: { type: Type.NUMBER },
                      fat_g: { type: Type.NUMBER },
                      fiber_g: { type: Type.NUMBER },
                      emoji: { type: Type.STRING },
                    },
                    required: ["food_name", "serving_unit", "serving_qty", "calories", "protein_g", "carbs_g", "fat_g"],
                  },
                },
              },
              required: ["common"],
            },
          },
        });
        const parsed = JSON.parse(response.text || '{"common":[]}');
        return res.json(parsed);
      }

      return res.json({
        common: [
          { food_name: `${query} (标准份)`, serving_unit: "克", serving_qty: 100, calories: 130, protein_g: 8.5, carbs_g: 15.0, fat_g: 3.5, fiber_g: 2.0, emoji: "🥗" }
        ],
      });
    } catch (err: any) {
      console.error("nutritionix search error:", err);
      res.json({ common: [] });
    }
  });

  // 11. /api/nutritionix/natural: Natural language food nutrition parser
  app.post("/api/nutritionix/natural", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const appId = process.env.NUTRITIONIX_APP_ID;
      const apiKey = process.env.NUTRITIONIX_API_KEY;

      if (appId && apiKey) {
        try {
          const apiRes = await fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-app-id": appId,
              "x-app-key": apiKey,
            },
            body: JSON.stringify({ query }),
          });
          if (apiRes.ok) {
            const data = await apiRes.json();
            return res.json(data);
          }
        } catch (apiErr) {
          console.warn("Nutritionix natural parse fallback:", apiErr);
        }
      }

      // Gemini Natural Language Nutrition Parsing
      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          foods: [
            {
              food_name: query.slice(0, 25),
              serving_qty: 1,
              serving_unit: "份",
              serving_weight_grams: 150,
              nf_calories: 220,
              nf_protein: 15.0,
              nf_total_carbohydrate: 24.0,
              nf_total_fat: 6.0,
              nf_dietary_fiber: 3.5,
              emoji: "🥗",
            },
          ],
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `用户用自然语言记录了饮食："${query}"。请解析出其中包含的所有具体食物，精准推算每一项的名称、份量克数、总热量(kcal)、蛋白质(g)、碳水(g)、脂肪(g)、纤维(g)及对应的单个emoji。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foods: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    food_name: { type: Type.STRING },
                    serving_qty: { type: Type.NUMBER },
                    serving_unit: { type: Type.STRING },
                    serving_weight_grams: { type: Type.NUMBER },
                    nf_calories: { type: Type.NUMBER },
                    nf_protein: { type: Type.NUMBER },
                    nf_total_carbohydrate: { type: Type.NUMBER },
                    nf_total_fat: { type: Type.NUMBER },
                    nf_dietary_fiber: { type: Type.NUMBER },
                    emoji: { type: Type.STRING },
                  },
                  required: ["food_name", "serving_weight_grams", "nf_calories", "nf_protein", "nf_total_carbohydrate", "nf_total_fat"],
                },
              },
            },
            required: ["foods"],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{"foods":[]}');
      return res.json(parsed);
    } catch (err: any) {
      console.error("nutritionix natural error:", err);
      return res.json({
        foods: [
          {
            food_name: req.body?.query || "健康美味食物",
            serving_qty: 1,
            serving_unit: "份",
            serving_weight_grams: 150,
            nf_calories: 200,
            nf_protein: 12.0,
            nf_total_carbohydrate: 25.0,
            nf_total_fat: 5.0,
            nf_dietary_fiber: 3.0,
            emoji: "🥗",
          },
        ],
      });
    }
  });

  // 12. /api/identify-food: Gemini Vision AI Photo Food Recognition
  app.post("/api/identify-food", async (req, res) => {
    try {
      const { image_base64, notes } = req.body;
      if (!image_base64) {
        return res.status(400).json({ error: "Missing image data (base64)" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          food_name: "精致健康轻食盘",
          portion_g: 220,
          calories: 285,
          protein_g: 22.0,
          carbs_g: 26.5,
          fat_g: 8.5,
          fiber_g: 4.8,
          health_score: "A+",
          confidence: 0.95,
          detected_items: ["香煎鸡胸肉", "水煮西兰花", "番茄小食", "优质杂粮"],
          advice: "视觉搭配色彩斑斓，高蛋白低脂典范！✨",
          emoji: "🥗",
        });
      }

      // Clean base64 string
      const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");
      const mimeMatch = image_base64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

      const prompt = `你是一位顶级 AI 视觉营养学家。请仔细观察这张食物/餐品照片${notes ? `（用户补充备注："${notes}"）` : ""}，并给出最专业、精准的识别与估算结果：
1. food_name: 菜品/食物的核心名称（如：香煎黑椒鸡胸肉配水煮西兰花与藜麦饭）
2. portion_g: 预估总重量/克数（数字）
3. calories: 总热量(kcal)
4. protein_g: 蛋白质克数
5. carbs_g: 碳水化合物克数
6. fat_g: 脂肪克数
7. fiber_g: 膳食纤维克数
8. health_score: 健康等级（如 A+, A, B+）
9. confidence: 识别置信度（0.0 到 1.0 的浮点数）
10. detected_items: 识别出的食材组分清单数组（如 ["鸡胸肉", "西蓝花", "小番茄", "藜麦"]）
11. advice: 1-2句元气温暖、极具 ins 风格的营养评语与饮食建议
12. emoji: 最匹配的食物单个 emoji`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              food_name: { type: Type.STRING },
              portion_g: { type: Type.NUMBER },
              calories: { type: Type.NUMBER },
              protein_g: { type: Type.NUMBER },
              carbs_g: { type: Type.NUMBER },
              fat_g: { type: Type.NUMBER },
              fiber_g: { type: Type.NUMBER },
              health_score: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              detected_items: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              advice: { type: Type.STRING },
              emoji: { type: Type.STRING },
            },
            required: [
              "food_name",
              "portion_g",
              "calories",
              "protein_g",
              "carbs_g",
              "fat_g",
              "fiber_g",
              "confidence",
              "detected_items",
              "advice",
              "emoji",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("identify-food vision error:", err);
      return res.json({
        food_name: "自制元气轻食",
        portion_g: 200,
        calories: 250,
        protein_g: 18.0,
        carbs_g: 25.0,
        fat_g: 7.0,
        fiber_g: 4.0,
        health_score: "A",
        confidence: 0.9,
        detected_items: ["轻食组合", "蔬菜", "优质蛋白"],
        advice: "美味营养两不误，拍照超有食欲！📸✨",
        emoji: "🥑",
      });
    }
  });

  // 13. /api/daily-advice: Real-time actionable daily advice banner
  app.post("/api/daily-advice", async (req, res) => {
    try {
      const {
        today_calories = 0,
        today_protein = 0,
        today_carbs = 0,
        today_fat = 0,
        target_calories = 1500,
        target_protein = 90,
        target_carbs = 180,
        target_fat = 42,
        goal = "fat_loss",
        diary_entries = [],
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        const remainingProtein = Math.round(target_protein - today_protein);
        const remainingCal = Math.round(target_calories - today_calories);
        if (remainingProtein > 15) {
          return res.json({
            advice: `今天蛋白质还差约 ${remainingProtein}g，晚餐或加餐建议加一个水煮蛋或一块香煎鸡胸肉/低脂酸奶哦🥛✨`,
            focus_macro: "protein",
            status: "warning",
            icon: "🥩",
          });
        }
        if (remainingCal < 0) {
          return res.json({
            advice: `今日热量略微达标，晚餐建议选择高纤维水煮蔬菜或清爽菌菇汤，搭配15分钟舒缓拉伸更轻松哦🧘‍♀️🌿`,
            focus_macro: "calories",
            status: "info",
            icon: "✨",
          });
        }
        return res.json({
          advice: "今日营养搭配非常均衡！三大宏量比例完美，保持这个节奏你就是最闪耀的小仙女~🌸",
          focus_macro: "balanced",
          status: "perfect",
          icon: "🌟",
        });
      }

      const prompt = `用户今日的饮食营养记录：
- 目标：${goal === "fat_loss" ? "减脂塑形" : goal === "muscle_gain" ? "增肌紧致" : "健康维持"}
- 今日已摄入热量：${today_calories} kcal (目标 ${target_calories} kcal)
- 今日已摄入蛋白质：${today_protein}g (目标 ${target_protein}g)
- 今日已摄入碳水：${today_carbs}g (目标 ${target_carbs}g)
- 今日已摄入脂肪：${today_fat}g (目标 ${target_fat}g)
- 今日食物记录清单：${diary_entries.map((e: any) => `${e.meal_type}: ${e.food_name}`).join("; ") || "暂无"}

请给出 1-2 句极其具体、治愈、充满元气的即时建议（例如："蛋白质还差20g，晚餐加个水煮蛋或一杯高钙无糖燕麦奶哦🥛✨" 或 "碳水控制得很棒，下午能量不足可以来一小把巴旦木坚果！🥑"）。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              advice: { type: Type.STRING, description: "1-2句亲切治愈的即时营养小建议" },
              focus_macro: { type: Type.STRING, description: "重点关注的维度: protein / carbs / fat / calories / balanced" },
              status: { type: Type.STRING, description: "perfect / good / warning / info" },
              icon: { type: Type.STRING, description: "单字符 emoji" },
            },
            required: ["advice", "focus_macro", "status", "icon"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("daily-advice error:", err);
      return res.json({
        advice: "营养摄入很有规律，记得按时喝温水，今天也是元气满满的一天！🌿✨",
        focus_macro: "balanced",
        status: "good",
        icon: "💖",
      });
    }
  });

  // 14. /api/weekly-report: Comprehensive Weekly Health & Nutrition Review
  app.post("/api/weekly-report", async (req, res) => {
    try {
      const {
        profile = {},
        days_data = [],
        weight_history = [],
        total_workout_minutes = 120,
        total_burned_calories = 850,
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          weekly_grade: "A+",
          avg_daily_calories: 1480,
          target_calories: 1520,
          avg_daily_protein: 88,
          target_protein: 90,
          calorie_adherence_percent: 97,
          protein_adherence_percent: 98,
          total_workout_minutes: total_workout_minutes || 120,
          total_burned_calories: total_burned_calories || 850,
          weight_change_kg: -0.6,
          summary: "本周执行力超强！热量缺口控制在黄金区间，蛋白质摄入连续6天完美达标，体态明显更紧致轻盈！✨",
          highlights: ["蛋白质摄入达成率 98%", "累计消耗 850 kcal 运动热量", "体重稳步下降 0.6kg 无反弹"],
          next_week_action: "下周可尝试增加 1 次臀腿力量训练，并在早晨加入 10g 优质膳食纤维，继续保持闪光状态！🌸",
        });
      }

      const prompt = `你是一位高阶健康营养督导。请为用户生成一份充满成就感与科学洞察的【周度健康与饮食运动总结周报】。
用户档案：
- 目标：${profile.goal === "fat_loss" ? "减脂塑形" : profile.goal === "muscle_gain" ? "增肌紧致" : "健康维持"}
- 身高：${profile.height_cm || 165}cm，当前体重：${profile.weight_kg || 52.5}kg
- 过去7天数据概要：${JSON.stringify(days_data)}
- 体重历史：${JSON.stringify(weight_history)}
- 本周累计运动时长：${total_workout_minutes} 分钟，累计消耗：${total_burned_calories} kcal

请生成 JSON：
- weekly_grade: 本周表现评级（如 "S", "A+", "A"）
- avg_daily_calories: 日均摄入热量(kcal)
- target_calories: 每日目标热量(kcal)
- avg_daily_protein: 日均蛋白质(g)
- target_protein: 目标蛋白质(g)
- calorie_adherence_percent: 热量目标达成度(%)
- protein_adherence_percent: 蛋白质达成度(%)
- total_workout_minutes: 总运动分钟
- total_burned_calories: 总消耗热量
- weight_change_kg: 本周体重变化（如 -0.5 或 +0.2）
- summary: 一段治愈温馨、肯定付出的周报总结（2-3句话）
- highlights: 3条本周最耀眼的成就亮点
- next_week_action: 1-2条下周可以轻松落地的小升级建议`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weekly_grade: { type: Type.STRING },
              avg_daily_calories: { type: Type.NUMBER },
              target_calories: { type: Type.NUMBER },
              avg_daily_protein: { type: Type.NUMBER },
              target_protein: { type: Type.NUMBER },
              calorie_adherence_percent: { type: Type.NUMBER },
              protein_adherence_percent: { type: Type.NUMBER },
              total_workout_minutes: { type: Type.NUMBER },
              total_burned_calories: { type: Type.NUMBER },
              weight_change_kg: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              next_week_action: { type: Type.STRING },
            },
            required: [
              "weekly_grade",
              "avg_daily_calories",
              "target_calories",
              "avg_daily_protein",
              "target_protein",
              "calorie_adherence_percent",
              "protein_adherence_percent",
              "total_workout_minutes",
              "total_burned_calories",
              "weight_change_kg",
              "summary",
              "highlights",
              "next_week_action",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("weekly-report error:", err);
      return res.json({
        weekly_grade: "A",
        avg_daily_calories: 1500,
        target_calories: 1500,
        avg_daily_protein: 85,
        target_protein: 90,
        calorie_adherence_percent: 95,
        protein_adherence_percent: 94,
        total_workout_minutes: 90,
        total_burned_calories: 600,
        weight_change_kg: -0.4,
        summary: "本周保持了非常健康自律的生活习惯，热量和蛋白质摄入都很稳定，身体状态极佳！💖",
        highlights: ["持续打卡记录", "规律运动燃脂", "饮食清淡低负担"],
        next_week_action: "继续保持好心情，多喝温水，坚持自律带来长久改变！🌸",
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitGlow Server running on http://0.0.0.0:${PORT}`);
  });
}

// Fallback high-quality data helpers
function getDefaultRecommendedFoods(goal?: string) {
  return [
    {
      id: "food_1",
      name: "无油番茄鲜虾滑蛋",
      category: "高蛋白",
      meal_type: "早餐",
      calories_per_100g: 92,
      protein_per_100g: 11.5,
      carbs_per_100g: 3.8,
      fat_per_100g: 3.2,
      fiber_per_100g: 1.2,
      tags: ["高蛋白", "家常快手", "鲜嫩爆汁"],
      description: "多汁沙瓤番茄融合Q弹大虾与蓬松滑蛋，少油少盐却鲜香浓郁，晨间元气首选！",
      suggested_portion_g: 200,
      emoji: "🍳",
    },
    {
      id: "food_2",
      name: "黑椒西蓝花炒牛肉粒",
      category: "高蛋白",
      meal_type: "午餐",
      calories_per_100g: 125,
      protein_per_100g: 16.8,
      carbs_per_100g: 4.5,
      fat_per_100g: 4.2,
      fiber_per_100g: 2.3,
      tags: ["优质红肉补铁", "高蛋白", "饱腹雕线条"],
      description: "鲜嫩牛里脊切丁配上爽脆西兰花，现磨黑胡椒爆香，低脂高蛋白超级满足。",
      suggested_portion_g: 220,
      emoji: "🥩",
    },
    {
      id: "food_3",
      name: "清蒸柠檬海鲈鱼配糙米饭",
      category: "高蛋白",
      meal_type: "午餐",
      calories_per_100g: 118,
      protein_per_100g: 14.5,
      carbs_per_100g: 12.0,
      fat_per_100g: 2.1,
      fiber_per_100g: 1.8,
      tags: ["清蒸低脂", "深海DHA", "高蛋白慢碳"],
      description: "清蒸锁住鱼肉天然鲜甜，几片青柠激发出清爽香气，搭配糙米饭饱腹感十足。",
      suggested_portion_g: 250,
      emoji: "🐟",
    },
    {
      id: "food_4",
      name: "暖胃菌菇嫩豆腐鸡胸汤",
      category: "减脂刮油",
      meal_type: "晚餐",
      calories_per_100g: 58,
      protein_per_100g: 8.5,
      carbs_per_100g: 2.2,
      fat_per_100g: 1.5,
      fiber_per_100g: 1.9,
      tags: ["极低热量", "暖胃刮油", "大碗喝无负担"],
      description: "白玉菇、蟹味菇与嫩豆腐慢煨，鸡胸肉丝鲜美滑嫩，热腾腾一碗喝完全身舒畅。",
      suggested_portion_g: 300,
      emoji: "🍲",
    },
    {
      id: "food_5",
      name: "凉拌鸡丝荞麦面 (减脂油醋汁)",
      category: "优质碳水",
      meal_type: "午餐",
      calories_per_100g: 105,
      protein_per_100g: 9.2,
      carbs_per_100g: 14.5,
      fat_per_100g: 1.2,
      fiber_per_100g: 2.6,
      tags: ["低GI慢消化", "开胃清爽", "夏日减脂"],
      description: "爽滑荞麦面拌上清脆黄瓜丝、胡萝卜丝与手撕鸡胸肉，酸辣清爽超解腻。",
      suggested_portion_g: 220,
      emoji: "🍜",
    },
    {
      id: "food_6",
      name: "蒸紫薯与甜玉米拼盘",
      category: "优质碳水",
      meal_type: "早餐",
      calories_per_100g: 95,
      protein_per_100g: 2.5,
      carbs_per_100g: 21.0,
      fat_per_100g: 0.6,
      fiber_per_100g: 3.1,
      tags: ["高花青素", "粗粮膳食纤维", "清甜软糯"],
      description: "粗粮天然清甜，蒸制保留全部营养与膳食纤维，肠道无负担好吸收。",
      suggested_portion_g: 160,
      emoji: "🌽",
    },
    {
      id: "food_7",
      name: "秋葵蒸蛋羹 (少油生抽)",
      category: "高蛋白",
      meal_type: "晚餐",
      calories_per_100g: 65,
      protein_per_100g: 6.8,
      carbs_per_100g: 2.1,
      fat_per_100g: 3.0,
      fiber_per_100g: 1.5,
      tags: ["滑嫩如布丁", "高黏蛋白养胃", "夜宵轻负担"],
      description: "秋葵切小星星漂浮在如镜面般光滑的鸡蛋羹上，温润养胃又补蛋白。",
      suggested_portion_g: 180,
      emoji: "⭐",
    },
    {
      id: "food_8",
      name: "抹茶奇亚籽无糖希腊酸奶碗",
      category: "低卡甜点",
      meal_type: "加餐",
      calories_per_100g: 96,
      protein_per_100g: 8.5,
      carbs_per_100g: 8.0,
      fat_per_100g: 2.8,
      fiber_per_100g: 3.5,
      tags: ["0蔗糖高蛋白", "肠道益生菌", "解馋下午茶"],
      description: "醇厚低脂希腊酸奶撒上一抹微苦宇治抹茶与饱腹奇亚籽，甜品级的治愈体验。",
      suggested_portion_g: 150,
      emoji: "🥣",
    },
  ];
}

function getDefaultRecipe(foodName: string) {
  return {
    recipe_name: foodName,
    subtitle: "清新爆汁 · 15分钟高颜值快手健康料理",
    image_keyword: foodName,
    prep_time_min: 8,
    cook_time_min: 10,
    difficulty: "新手友好",
    servings: 1,
    total_calories: 340,
    protein_g: 26.5,
    carbs_g: 22.0,
    fat_g: 8.5,
    fiber_g: 4.2,
    ingredients: [
      { name: "主要食材/主料", amount: "150g", notes: "新鲜采购" },
      { name: "搭配时蔬 (如西蓝花/圣女果)", amount: "100g", notes: "洗净沥干" },
      { name: "橄榄油 (特级初榨)", amount: "3g", notes: "薄薄刷一层即可" },
      { name: "海盐与现磨黑胡椒", amount: "适量", notes: "调味增香" },
      { name: "新鲜柠檬片/罗勒叶", amount: "1瓣", notes: "点缀提鲜" },
    ],
    steps: [
      {
        step_number: 1,
        title: "食材预处理与锁鲜腌制",
        detail: "将食材洗净用厨房纸吸干水分。主料加入微量海盐、现磨黑胡椒和少许柠檬汁抓匀静置5分钟入味。",
      },
      {
        step_number: 2,
        title: "低温慢煎/空气炸锅快烘",
        detail: "不粘锅喷薄薄一层橄榄油，中火烧热后放入主料，每面煎制3-4分钟至金黄微焦，锁住鲜美汁水。",
      },
      {
        step_number: 3,
        title: "时蔬快炒与精致摆盘",
        detail: "利用锅底余香将搭配时蔬快速翻炒30秒保留清脆口感，盛入喜欢的浅色平盘，撒上海苔碎或芝麻即可出锅！",
      },
    ],
    chef_tips: [
      "✨ 控油小妙招：使用防漏喷雾油壶，每次仅需1-2喷，热量立刻立减80%！",
      "🌿 风味升级：出锅前擦少许青柠皮屑或迷迭香碎，香味瞬间提升高级西餐质感。",
    ],
  };
}

function getDefaultWorkoutPlan(location?: string, duration?: number, weight?: number, goal?: string, focus?: string) {
  const dur = duration || 30;
  const wt = weight || 55;
  const isGym = location === "gym";

  return {
    plan_title: isGym ? "力量雕刻与燃脂轻塑计划" : "居家自重元气燃脂训练",
    subtitle: `${dur}分钟 · ${focus || "全身紧致"} · 活力唤醒`,
    location: isGym ? "健身房" : "居家/宿舍",
    duration_min: dur,
    total_calories_burned: Math.round((6.0 * 3.5 * wt / 200) * dur),
    intensity_level: "中度燃脂塑形",
    encouragement: "每一次呼吸都在变得更好！流汗的你超级迷人，加油哦~ ✨💪",
    exercises: [
      {
        id: "ex_1",
        section: "热身激活",
        name: "肩颈环绕与猫牛式伸展",
        target_muscle: "脊柱灵活度 / 肩颈放松",
        reps_or_time: "持续 2 分钟",
        duration_min: 2,
        met_value: 2.8,
        calories_burned: Math.round((2.8 * 3.5 * wt / 200) * 2),
        instructions: "四足跪姿，吸气抬头塌腰沉肩，呼气含胸拱背低头，感受脊柱一节节舒展开来。",
        breath_tip: "吸气延展，呼气卷曲，动作慢而平稳",
        exercise_gif: "stretch",
      },
      {
        id: "ex_2",
        section: "热身激活",
        name: "原地开合跳 / 垫脚轻跳",
        target_muscle: "心肺唤醒 / 下肢关节",
        reps_or_time: "持续 3 分钟",
        duration_min: 3,
        met_value: 5.5,
        calories_burned: Math.round((5.5 * 3.5 * wt / 200) * 3),
        instructions: "前脚掌轻柔落地，膝盖微曲保持弹性，双臂轻快向上拍合，让体温渐渐升高。",
        breath_tip: "保持均匀顺畅呼吸，不要憋气",
        exercise_gif: "jumping jack",
      },
      {
        id: "ex_3",
        section: "核心主训",
        name: isGym ? "高脚杯深蹲 (轻重量哑铃)" : "徒手相扑深蹲 (臀腿塑形)",
        target_muscle: "臀大肌 / 大腿前侧 / 核心稳定",
        reps_or_time: "4 组 × 15 次 (休息30秒)",
        duration_min: 8,
        met_value: 6.5,
        calories_burned: Math.round((6.5 * 3.5 * wt / 200) * 8),
        instructions: "双脚比肩略宽，脚尖外展30度。吸气屈髋屈膝下蹲至大腿与地面平行，呼气由脚后跟发力站起夹臀。",
        breath_tip: "下蹲吸气控速，起身呼气发力夹臀",
        exercise_gif: "squat",
      },
      {
        id: "ex_4",
        section: "核心主训",
        name: isGym ? "坐姿下拉 / 弹力带后拉" : "跪姿俯卧撑 / 俯卧W-Y伸展",
        target_muscle: "背部线条 / 改善圆肩驼背 / 美背",
        reps_or_time: "3 组 × 12 次",
        duration_min: 6,
        met_value: 5.0,
        calories_burned: Math.round((5.0 * 3.5 * wt / 200) * 6),
        instructions: "挺胸沉肩，大臂紧贴身体向后夹紧背阔肌，顶峰收缩停顿1秒后缓慢放回。",
        breath_tip: "拉回时呼气感受背部收拢，还原时吸气",
        exercise_gif: "push up",
      },
      {
        id: "ex_5",
        section: "核心主训",
        name: "死虫式核心对抗 / 慢速登山跑",
        target_muscle: "腹直肌 / 腹横肌收腹平坦",
        reps_or_time: "3 组 × 每侧 10 次",
        duration_min: 6,
        met_value: 6.0,
        calories_burned: Math.round((6.0 * 3.5 * wt / 200) * 6),
        instructions: "仰卧位下背部紧贴地面，对侧手脚缓慢向远端延伸，保持腹部核心全程收紧。",
        breath_tip: "呼气手脚下放延展，吸气归位",
        exercise_gif: "plank",
      },
      {
        id: "ex_6",
        section: "舒缓拉伸",
        name: "大拜式 & 鸽子式臀腿深层拉伸",
        target_muscle: "臀部肌群 / 下背部 / 全身舒缓",
        reps_or_time: "每侧保持 60 秒",
        duration_min: 5,
        met_value: 2.5,
        calories_burned: Math.round((2.5 * 3.5 * wt / 200) * 5),
        instructions: "一侧腿屈膝在前，另一侧腿向后伸直贴地，上身缓缓前倾下沉，深长呼吸释放肌肉疲劳。",
        breath_tip: "伴随深长呼气，把身体完全交给重力放松",
        exercise_gif: "yoga stretch",
      },
    ],
  };
}

function getDefaultHealthAssessment(profile: any, totalCal = 1380, totalProtein = 78, totalCarbs = 145, totalFat = 42, totalBurned = 240) {
  const targetCal = profile?.goal === "fat_loss" ? 1450 : profile?.goal === "muscle_gain" ? 1850 : 1600;
  const targetProtein = Math.round((profile?.weight_kg || 52.5) * (profile?.goal === "muscle_gain" ? 1.8 : 1.5));
  const proteinRatio = Math.min(100, Math.round((totalProtein / targetProtein) * 100));

  return {
    score: 89,
    summary: "今日营养配比与能量缺口保持在黄金区间，高蛋白低GI摄入优秀，代谢状态满分！✨",
    details: [
      {
        label: "热量摄入 vs 目标",
        value: `${totalCal}`,
        target: `${targetCal}`,
        unit: "kcal",
        status: totalCal <= targetCal ? "perfect" : "warning",
      },
      {
        label: "蛋白质达标率",
        value: `${totalProtein} (${proteinRatio}%)`,
        target: `${targetProtein}`,
        unit: "g",
        status: proteinRatio >= 80 ? "perfect" : "good",
      },
      {
        label: "碳水脂肪比例",
        value: `${totalCarbs}g / ${totalFat}g`,
        target: "50% / 25%",
        unit: "均衡",
        status: "perfect",
      },
      {
        label: "运动热量消耗",
        value: `${totalBurned}`,
        target: "200-300",
        unit: "kcal",
        status: totalBurned >= 200 ? "perfect" : "good",
      },
      {
        label: "代谢与体脂趋势",
        value: "稳步减脂中",
        target: "持续轻盈",
        unit: "",
        status: "perfect",
      },
    ],
    suggestions: "晚间记得多补充温白开水，睡前3小时尽量避免高盐食物以免晨起水肿。明天继续保持闪闪发光的状态哦~ 🌸",
  };
}

function getDefaultDailyPlan(profile: any, diaryEntries: any[] = [], fridgeItems: any[] = []) {
  const hasDinner = diaryEntries.some((e) => e.meal_type === "晚餐");
  const hasChickenInFridge = fridgeItems.some((i) => i.food_name?.includes("鸡胸肉"));
  const hasBroccoliInFridge = fridgeItems.some((i) => i.food_name?.includes("西蓝花"));
  const hasEggInFridge = fridgeItems.some((i) => i.food_name?.includes("蛋"));

  return {
    meals: [
      {
        meal_type: hasDinner ? "加餐" : "晚餐",
        suggestions: [
          {
            food_name: hasChickenInFridge && hasBroccoliInFridge
              ? "黑椒香煎鸡胸肉配蒜蓉西蓝花"
              : hasEggInFridge
              ? "无油番茄鲜虾滑蛋配糙米饭"
              : "暖胃菌菇嫩豆腐汤配杂粮",
            portion_g: 220,
            reason: hasChickenInFridge
              ? "优先消耗冰箱中的新鲜鸡胸肉与西蓝花，提供28g优质蛋白，低脂高饱腹"
              : "补充晚餐所需的高蛋白与膳食纤维，温和控卡不易发胖",
          },
          {
            food_name: "清蒸紫薯或甜玉米",
            portion_g: 100,
            reason: "补充低GI复合碳水，维持血糖平稳与夜间代谢",
          },
        ],
      },
      {
        meal_type: "加餐",
        suggestions: [
          {
            food_name: "无糖希腊酸奶配新鲜蓝莓",
            portion_g: 120,
            reason: "丰富益生菌与花青素抗氧化，满足解馋需求",
          },
        ],
      },
    ],
    workout: {
      exercise_name: "25分钟居家全身塑形 & 核心强化",
      duration_min: 25,
      calories_burned: 160,
      instructions: "深蹲 15次*3组 + 跪姿俯卧撑 12次*3组 + 平板支撑 45秒*3组，最后以猫牛式拉伸放松脊柱。",
    },
  };
}

function getDefaultDailyRecommendation(fridgeItems: any[] = [], goal = "fat_loss") {
  const hasChicken = fridgeItems.some((i) => i.food_name?.includes("鸡胸肉"));
  const hasTomato = fridgeItems.some((i) => i.food_name?.includes("番茄"));

  if (hasChicken && hasTomato) {
    return {
      dish_name: "无油爆汁番茄鸡胸肉粒",
      image_keyword: "番茄鸡胸肉",
      reason: "巧用你冰箱里的新鲜鸡胸肉与沙瓤番茄，酸甜开胃、爆汁鲜嫩，热量仅260kcal！✨",
      recipe: {
        ingredients: [
          { name: "鲜嫩鸡胸肉", amount: "180g", in_fridge: true },
          { name: "沙瓤多汁番茄", amount: "1-2个", in_fridge: true },
          { name: "大蒜 & 现磨黑胡椒", amount: "适量", in_fridge: true },
          { name: "特级初榨橄榄油", amount: "2g", in_fridge: true },
        ],
        steps: [
          "鸡胸肉切丁加入少许生抽、料酒、黑胡椒抓匀腌制8分钟",
          "番茄划十字烫皮切小块，锅中少许油煸炒出浓郁沙汁",
          "倒入鸡胸肉丁大火快炒至变色收浓汤汁，撒上葱花出锅！",
        ],
        cooking_time: 12,
        difficulty: "新手友好",
        tips: "番茄的天然果酸能软化肉质纤维，让鸡胸肉爆汁滑嫩完全不发柴！",
      },
    };
  }

  return {
    dish_name: "清蒸香柠鲈鱼配金针菇",
    image_keyword: "清蒸鲈鱼",
    reason: "高蛋白深海好鱼，清蒸锁住原汁原味，富含优质蛋白与不饱和脂肪酸，减脂期的天花板美食！🐟",
    recipe: {
      ingredients: [
        { name: "海鲈鱼柳", amount: "200g", in_fridge: false },
        { name: "新鲜柠檬片", amount: "3片", in_fridge: false },
        { name: "金针菇/香葱", amount: "80g", in_fridge: true },
        { name: "低钠蒸鱼豉油", amount: "1勺", in_fridge: true },
      ],
      steps: [
        { step_number: 1, instruction: "鱼柳两面划花刀，铺上柠檬片与葱丝去腥", image_keyword: "柠檬 鲈鱼 去腥" },
        { step_number: 2, instruction: "盘底铺金针菇，放上鱼柳，水开上锅大火蒸8分钟", image_keyword: "蒸鲈鱼 厨房" },
        { step_number: 3, instruction: "出锅淋一勺低钠蒸鱼豉油，滴2滴热橄榄油激发出香气即可享用！", image_keyword: "清蒸鲈鱼 摆盘" },
      ],
      cooking_time: 15,
      difficulty: "简单快手",
      tips: "蒸制时间严格控制在8分钟左右，肉质最是雪白幼嫩如豆腐！",
    },
  };
}

function getDefaultFridgeRecipes(fridgeItems: string[]) {
  const hasChicken = fridgeItems.some((i) => i.includes("鸡胸") || i.includes("鸡肉"));
  const hasTomato = fridgeItems.some((i) => i.includes("番茄") || i.includes("西红柿"));
  const hasEgg = fridgeItems.some((i) => i.includes("蛋"));
  const hasBroccoli = fridgeItems.some((i) => i.includes("西蓝花") || i.includes("西兰花"));
  const hasOats = fridgeItems.some((i) => i.includes("燕麦"));
  const hasYogurt = fridgeItems.some((i) => i.includes("酸奶"));
  const hasShrimp = fridgeItems.some((i) => i.includes("虾"));

  const recipes = [];

  // Recipe 1: Tomato Eggs / Chicken
  if (hasTomato && hasEgg) {
    recipes.push({
      dish_name: "爆汁番茄滑蛋",
      image_keyword: "番茄炒蛋",
      required_ingredients: ["鸡蛋", "番茄", "少许生抽", "盐", "葱花"],
      missing_ingredients: ["葱花"],
      reason: "巧用冰箱里的多汁番茄与新鲜鸡蛋，酸甜开胃，只需8分钟，低卡高蛋白！🍳",
      recipe: {
        cooking_time: 8,
        difficulty: "新手友好",
        tips: "番茄先切小丁煸炒出沙汁，蛋液下锅微凝固即关火，口感最是滑嫩。",
        ingredients: [
          { name: "新鲜鸡蛋", amount: "2个", in_fridge: true },
          { name: "沙瓤番茄", amount: "2个", in_fridge: true },
          { name: "初榨橄榄油", amount: "3g", in_fridge: true },
          { name: "香葱与海盐", amount: "适量", in_fridge: false },
        ],
        steps: [
          { step_number: 1, instruction: "番茄洗净切成滚刀小块，鸡蛋打散加少许海盐搅拌均匀。", image_keyword: "切番茄 打鸡蛋" },
          { step_number: 2, instruction: "锅中倒入橄榄油烧热，倒入蛋液快速划散，8成熟盛出备用。", image_keyword: "炒鸡蛋 滑蛋" },
          { step_number: 3, instruction: "原锅下番茄炒出浓稠沙汁，倒回滑蛋快速翻匀撒上葱花出锅！", image_keyword: "番茄炒蛋 摆盘" },
        ],
      },
    });
  }

  // Recipe 2: Black Pepper Chicken Breast & Broccoli
  if (hasChicken || hasBroccoli) {
    recipes.push({
      dish_name: "蒜香黑椒香煎鸡胸肉粒炒西蓝花",
      image_keyword: "黑椒鸡胸肉 西蓝花",
      required_ingredients: ["鸡胸肉", "西蓝花", "大蒜", "黑胡椒粒", "生抽"],
      missing_ingredients: hasChicken && hasBroccoli ? [] : !hasChicken ? ["鲜嫩鸡胸肉"] : ["新鲜西蓝花"],
      reason: "经典的减脂王者搭配！30g+ 超高蛋白与丰富膳食纤维，黑椒爆香鲜嫩无敌。",
      recipe: {
        cooking_time: 12,
        difficulty: "简单快手",
        tips: "鸡胸肉切丁后加生抽料酒腌制5分钟，快速翻炒锁住肉汁，完全不柴！",
        ingredients: [
          { name: "鲜嫩鸡胸肉", amount: "180g", in_fridge: hasChicken },
          { name: "新鲜西蓝花", amount: "150g", in_fridge: hasBroccoli },
          { name: "蒜瓣 & 现磨黑胡椒", amount: "适量", in_fridge: true },
          { name: "低钠生抽 & 橄榄油", amount: "1勺", in_fridge: true },
        ],
        steps: [
          { step_number: 1, instruction: "鸡胸肉切成适口小丁，加生抽、黑胡椒粉和少许水淀粉抓匀腌制。", image_keyword: "鸡胸肉 腌制" },
          { step_number: 2, instruction: "西蓝花掰小朵，沸水加少许盐焯水40秒捞出沥干保持翠绿。", image_keyword: "焯水 西蓝花" },
          { step_number: 3, instruction: "热锅少许油爆香蒜末，倒入鸡肉丁大火煎炒变色，加入西蓝花炒匀收汁。", image_keyword: "鸡胸肉炒西蓝花" },
        ],
      },
    });
  }

  // Recipe 3: Oats / Yogurt Parfait Bowl
  if (hasOats || hasYogurt) {
    recipes.push({
      dish_name: "高纤无糖酸奶奇亚籽隔夜燕麦碗",
      image_keyword: "水果燕麦酸奶碗",
      required_ingredients: ["即食燕麦片", "希腊酸奶", "蓝莓/水果", "奇亚籽"],
      missing_ingredients: [],
      reason: "免开火超快手！高饱腹慢碳水搭配益生菌，肠道轻盈刮油好帮手。",
      recipe: {
        cooking_time: 3,
        difficulty: "新手友好",
        tips: "冷藏静置后燕麦会吸饱酸奶奶香，口感如慕斯蛋糕般丝滑！",
        ingredients: [
          { name: "纯燕麦片", amount: "40g", in_fridge: hasOats },
          { name: "低脂希腊酸奶", amount: "150g", in_fridge: hasYogurt },
          { name: "新鲜蓝莓/浆果", amount: "30g", in_fridge: true },
          { name: "奇亚籽/坚果碎", amount: "5g", in_fridge: true },
        ],
        steps: [
          { step_number: 1, instruction: "在可爱的玻璃罐中先铺上一层纯燕麦片与奇亚籽。", image_keyword: "燕麦 玻璃罐" },
          { step_number: 2, instruction: "淋上浓郁的希腊酸奶，用勺子轻轻搅拌让燕麦浸润。", image_keyword: "酸奶 燕麦碗" },
          { step_number: 3, instruction: "顶部铺满新鲜蓝莓与水果切片，随时享用元气早点！", image_keyword: "酸奶水果碗 成品" },
        ],
      },
    });
  }

  // Recipe 4: Low-fat Shrimp or Veggie Stew
  recipes.push({
    dish_name: "鲜甜菌菇嫩豆腐暖胃轻体汤",
    image_keyword: "豆腐菌菇汤",
    required_ingredients: ["嫩豆腐", "金针菇/香菇", "鸡蛋", "香葱", "白胡椒粉"],
    missing_ingredients: ["嫩豆腐"],
    reason: "鲜美清润、温胃暖身，整碗热量不足150大卡，晚间控卡刮油首选。✨",
    recipe: {
      cooking_time: 10,
      difficulty: "新手友好",
      tips: "蛋液要在水微沸时淋入并静置3秒再搅动，能形成漂亮的雪花蛋花。",
      ingredients: [
        { name: "嫩豆腐", amount: "150g", in_fridge: false },
        { name: "新鲜菌菇", amount: "80g", in_fridge: true },
        { name: "鸡蛋", amount: "1个", in_fridge: hasEgg },
        { name: "白胡椒粉与生抽", amount: "少许", in_fridge: true },
      ],
      steps: [
        { step_number: 1, instruction: "豆腐切小方块，菌菇洗净撕小朵备用。", image_keyword: "切豆腐 菌菇" },
        { step_number: 2, instruction: "锅中加500ml水烧开，倒入豆腐块和菌菇煮沸4分钟出鲜味。", image_keyword: "豆腐汤 煮沸" },
        { step_number: 3, instruction: "淋入打散的蛋液形成蛋花，加少许生抽、海盐和白胡椒粉调味出锅。", image_keyword: "菌菇豆腐汤 盛出" },
      ],
    },
  });

  return recipes.slice(0, 4);
}

startServer();

