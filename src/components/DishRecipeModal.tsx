import React, { useState, useEffect } from "react";
import { fetchUnsplashImage, getAccurateDishImage, getAccurateStepImage } from "../utils/unsplash";
import {
  X,
  Clock,
  ChefHat,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Flame,
  Utensils,
  Share2,
  Heart,
  Loader2,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface DishRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishName: string;
  imageKeyword?: string;
  coverImageUrl?: string;
  reason?: string;
  recipe?: {
    cooking_time?: number;
    cook_time_min?: number;
    prep_time_min?: number;
    difficulty?: string;
    tips?: string;
    chef_tips?: string[];
    total_calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    ingredients?: { name: string; amount: string; in_fridge?: boolean; notes?: string }[];
    steps?: (
      | string
      | {
          step_number?: number;
          instruction?: string;
          detail?: string;
          title?: string;
          image_keyword?: string;
          image_url?: string;
        }
    )[];
  } | null;
  isLoading?: boolean;
  onAddToPlate?: () => void;
}

export const DishRecipeModal: React.FC<DishRecipeModalProps> = ({
  isOpen,
  onClose,
  dishName,
  imageKeyword,
  coverImageUrl,
  reason,
  recipe,
  isLoading = false,
  onAddToPlate,
}) => {
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [stepImages, setStepImages] = useState<Record<number, string>>({});
  const [isLiked, setIsLiked] = useState(false);
  const [addedToPlateSuccess, setAddedToPlateSuccess] = useState(false);

  // Load cover image
  useEffect(() => {
    if (!isOpen) return;

    if (coverImageUrl && !coverImageUrl.includes("via.placeholder.com")) {
      setCoverUrl(coverImageUrl);
    } else {
      const accurate = getAccurateDishImage(dishName || imageKeyword || "");
      setCoverUrl(accurate);
      // Optional async fallback
      if (imageKeyword || dishName) {
        fetchUnsplashImage(imageKeyword || dishName, dishName).then((url) => {
          if (url && !url.includes("via.placeholder.com")) {
            setCoverUrl(url);
          }
        });
      }
    }
  }, [isOpen, dishName, imageKeyword, coverImageUrl]);

  // Load step images
  useEffect(() => {
    if (!isOpen || !recipe || !recipe.steps) return;

    const newStepImages: Record<number, string> = {};
    const normalizedSteps: any[] = Array.isArray(recipe.steps)
      ? recipe.steps
      : typeof recipe.steps === "string"
      ? [recipe.steps]
      : [];

    normalizedSteps.forEach((step, idx) => {
      let stepText = "";
      let stepImageDirect = "";

      if (typeof step === "string") {
        stepText = step;
      } else if (step && typeof step === "object") {
        stepImageDirect = step.image_url || "";
        stepText = `${step.title || ""} ${step.instruction || ""} ${step.detail || ""}`;
      }

      if (stepImageDirect && !stepImageDirect.includes("via.placeholder.com")) {
        newStepImages[idx] = stepImageDirect;
      } else {
        // Use verified step action image
        newStepImages[idx] = getAccurateStepImage(stepText, idx);
      }
    });

    setStepImages(newStepImages);
  }, [isOpen, recipe, dishName]);

  if (!isOpen) return null;

  const cookingTime = recipe?.cooking_time || recipe?.cook_time_min || 15;
  const difficulty = recipe?.difficulty || "新手友好";
  const tips = recipe?.tips || (recipe?.chef_tips && recipe.chef_tips.join(" ")) || "少油慢煎，锁住食材原本的鲜甜与汁水~";

  const handleAddPlateClick = () => {
    if (onAddToPlate) {
      onAddToPlate();
      setAddedToPlateSuccess(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setAddedToPlateSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#FFE4E8] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#FAF0EE] z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#FFF0F3] text-[#FF6B8B] flex items-center justify-center text-sm shadow-xs font-bold">
              🍳
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-800 line-clamp-1">{dishName}</h2>
              <p className="text-[11px] text-[#FF6B8B] font-medium">✨ FitGlow 图文大厨教程</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-all ${
                isLiked ? "bg-[#FFF0F3] text-[#FF477E] scale-110" : "text-gray-400 hover:text-gray-600 bg-gray-50"
              }`}
              title="收藏食谱"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-[#FF477E]" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content (Card style: Image Top, Text Bottom) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#FF6B8B] animate-spin" />
              <p className="text-sm text-gray-500 font-medium">✨ 正在从正宗食谱库获取烹饪步骤...</p>
            </div>
          ) : !recipe || (recipe as any).error ? (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F3] text-[#FF6B8B] flex items-center justify-center text-3xl shadow-sm">
                🍳
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  《{dishName}》菜谱正在完善中
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  FitGlow 主厨正在核准该菜品的地道低卡烹饪方案，杜绝 AI 虚构步骤，确保每一道菜真实可靠！
                </p>
              </div>
              <div className="p-3.5 bg-[#FFF9EE] rounded-2xl border border-[#FFE8B8] text-left max-w-xs w-full flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <div className="text-xs font-bold text-[#D97706] mb-0.5">主厨快手减脂通用建议</div>
                  <p className="text-xs text-[#92400E] leading-relaxed">
                    推荐采用清蒸、白灼或少油快炒，烹饪中多用葱姜蒜及黑胡椒提鲜，既锁住食材原汁原味，又健康控卡。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Cover Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-md bg-[#FFF5F7] group">
                <img
                  src={coverUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"}
                  alt={dishName}
                  className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <div className="flex flex-wrap gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-[#FF6B8B] flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3" /> {cookingTime}分钟
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-[#6C5CE7] flex items-center gap-1 shadow-xs">
                      <ChefHat className="w-3 h-3" /> {difficulty}
                    </span>
                    {recipe?.total_calories && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-[#FF9F43] flex items-center gap-1 shadow-xs">
                        <Flame className="w-3 h-3" /> {recipe.total_calories} kcal
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-sm">{dishName}</h3>
                  {reason && <p className="text-xs text-white/90 mt-1 line-clamp-2 leading-relaxed">{reason}</p>}
                </div>
              </div>

              {/* Nutrition Summary (if available) */}
              {(recipe?.protein_g || recipe?.carbs_g || recipe?.fat_g) && (
                <div className="grid grid-cols-4 gap-2 bg-[#FFF8F9] p-3 rounded-2xl border border-[#FFE4E8]/60 text-center">
                  <div>
                    <div className="text-[10px] text-gray-400 font-medium">总热量</div>
                    <div className="text-xs font-bold text-gray-800 mt-0.5">{recipe.total_calories || "--"} kcal</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#6C5CE7] font-medium">蛋白质</div>
                    <div className="text-xs font-bold text-[#6C5CE7] mt-0.5">{recipe.protein_g}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#FF9F43] font-medium">碳水</div>
                    <div className="text-xs font-bold text-[#FF9F43] mt-0.5">{recipe.carbs_g}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#FF6B8B] font-medium">脂肪</div>
                    <div className="text-xs font-bold text-[#FF6B8B] mt-0.5">{recipe.fat_g}g</div>
                  </div>
                </div>
              )}

              {/* Ingredients List */}
              {Array.isArray(recipe?.ingredients) && recipe.ingredients.length > 0 && (
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#F0EBE5]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FF6B8B]" /> 食材清单与用量
                    </h4>
                    <span className="text-[11px] text-gray-400">共 {recipe.ingredients.length} 种材料</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {recipe.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                          ing.in_fridge
                            ? "bg-emerald-50/70 border-emerald-200/60 text-emerald-900"
                            : "bg-white border-gray-200/70 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[11px]">{ing.in_fridge ? "✅" : "🛒"}</span>
                          <span className="font-medium truncate">{ing.name}</span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono ml-1 shrink-0">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Illustrated Tutorial (Image Top, Text Bottom Card Style) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#FF6B8B]" /> 详细烹饪步骤 (图文)
                  </h4>
                  <span className="text-[11px] text-gray-400">跟着做零失败 ✨</span>
                </div>

                {Array.isArray(recipe?.steps) && recipe.steps.length > 0 ? (
                  <div className="space-y-4">
                    {recipe.steps.map((step, idx) => {
                      const stepNum = typeof step === "object" && step.step_number ? step.step_number : idx + 1;
                      const instruction =
                        typeof step === "string" ? step : step.instruction || step.detail || step.title || "";
                      const stepImg = stepImages[idx] || coverUrl;

                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-[#FFE8EC] shadow-xs overflow-hidden transition-all hover:shadow-md"
                        >
                          {/* Step Image (Top) */}
                          <div className="relative h-36 sm:h-40 w-full bg-gray-100 overflow-hidden">
                            <img
                              src={stepImg}
                              alt={`Step ${stepNum}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-bold flex items-center gap-1">
                              <span>第 {stepNum} 步</span>
                            </div>
                          </div>

                          {/* Step Instruction (Bottom) */}
                          <div className="p-3.5 bg-white">
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal">
                              {instruction}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-400">
                    暂无详细步骤，请尽情发挥你的厨艺！
                  </div>
                )}
              </div>

              {/* Chef Tips Box */}
              {tips && (
                <div className="p-3.5 bg-[#FFF9EE] rounded-2xl border border-[#FFE8B8] flex items-start gap-2.5">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <div className="text-xs font-bold text-[#D97706] mb-0.5">主厨减脂小贴士</div>
                    <p className="text-xs text-[#92400E] leading-relaxed">{tips}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#FAF0EE] flex items-center gap-3">
          {onAddToPlate && (
            <button
              onClick={handleAddPlateClick}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                addedToPlateSuccess
                  ? "bg-emerald-500 text-white shadow-emerald-200"
                  : "bg-gradient-to-r from-[#FF6B8B] to-[#FF8E53] text-white shadow-[#FF6B8B]/30 hover:opacity-95"
              }`}
            >
              {addedToPlateSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> 已加入今日餐盘
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> 加入今日餐盘打卡
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
