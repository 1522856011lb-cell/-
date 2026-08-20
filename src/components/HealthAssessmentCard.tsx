import React, { useState, useEffect } from "react";
import { BodyProfile, ExerciseLogEntry, FoodDiaryEntry, HealthAssessment } from "../types";
import { loadHealthAssessment, saveHealthAssessment } from "../utils/storage";
import { Sparkles, RefreshCw, HeartPulse, CheckCircle2, AlertCircle, TrendingUp, Info } from "lucide-react";

interface HealthAssessmentCardProps {
  profile: BodyProfile;
  diaryEntries: FoodDiaryEntry[];
  exerciseLogs: ExerciseLogEntry[];
}

export const HealthAssessmentCard: React.FC<HealthAssessmentCardProps> = ({
  profile,
  diaryEntries,
  exerciseLogs,
}) => {
  const [assessment, setAssessment] = useState<HealthAssessment | null>(() => loadHealthAssessment());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          diary_entries: diaryEntries,
          exercise_logs: exerciseLogs,
        }),
      });

      if (!res.ok) {
        throw new Error("评估生成失败，请重试");
      }

      const data: HealthAssessment = await res.json();
      data.evaluated_at = new Date().toISOString();
      setAssessment(data);
      saveHealthAssessment(data);
    } catch (err: any) {
      console.error("fetchHealthAssessment error:", err);
      setError("AI 评估服务繁忙，请稍后刷新");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if not exists
  useEffect(() => {
    if (!assessment) {
      fetchHealthAssessment();
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return { ring: "#48BB78", text: "text-[#2F855A]", badge: "bg-[#E6F4EA] text-[#2F855A]", grade: "S 卓越" };
    if (score >= 80) return { ring: "#FF6B8B", text: "text-[#D53F8C]", badge: "bg-[#FFF0F3] text-[#D53F8C]", grade: "A 优秀" };
    if (score >= 70) return { ring: "#ED8936", text: "text-[#C05621]", badge: "bg-[#FFFAF0] text-[#C05621]", grade: "B 良好" };
    return { ring: "#ECC94B", text: "text-[#D69E2E]", badge: "bg-[#FEFCBF] text-[#744210]", grade: "C 待改善" };
  };

  const scoreInfo = getScoreColor(assessment?.score || 88);

  return (
    <div
      id="health-assessment-card"
      className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F3E5E3] shadow-card relative overflow-hidden space-y-5"
    >
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-[#FFCCD5]/20 to-[#E9D8FD]/20 blur-xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F7EAE8] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF6B8B] to-[#FFAAA5] flex items-center justify-center text-white shadow-2xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-[#3E3230]">AI 每日健康评估</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBFBEE] text-[#2F855A]">
                Gemini 3.7 驱动
              </span>
            </div>
            <p className="text-[11px] text-[#9B8986]">
              根据今日摄入量、三大营养素与运动消耗综合评估
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-assessment"
          onClick={fetchHealthAssessment}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF7F5] border border-[#EEDDD9] text-[#7A6B68] hover:text-[#3E3230] hover:bg-[#F5EFEA] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FF6B8B]" : ""}`} />
          <span>{loading ? "评估中..." : "重新评估"}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-3 border-[#FFCCD5] border-t-[#FF6B8B] animate-spin"></div>
          <p className="text-xs font-bold text-[#7D6B68]">
            AI 正在综合测算您今日的代谢缺口与营养达标率... ✨
          </p>
        </div>
      ) : assessment ? (
        <div className="space-y-5">
          {/* Score & Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-[#FAF7F5] rounded-3xl p-5 border border-[#F3E5E3]/60">
            {/* Score Ring */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-[#EEDDD9] pb-4 sm:pb-0 sm:pr-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* SVG Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E2E8F0]"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    stroke={scoreInfo.ring}
                    strokeWidth="3"
                    strokeDasharray={`${assessment.score}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-2xl font-black ${scoreInfo.text}`}>
                    {assessment.score}
                  </span>
                  <span className="text-[9px] text-[#A0AEC0] font-bold">综合评分</span>
                </div>
              </div>
              <span className={`mt-2 text-xs font-extrabold px-2.5 py-0.5 rounded-full ${scoreInfo.badge}`}>
                {scoreInfo.grade}
              </span>
            </div>

            {/* Summary Quote */}
            <div className="sm:col-span-8 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E03164]">
                <Sparkles className="w-4 h-4" />
                <span>AI 营养师今日点评</span>
              </div>
              <p className="text-sm font-semibold text-[#3E3230] leading-relaxed">
                {assessment.summary}
              </p>
            </div>
          </div>

          {/* Detailed Metric Bars */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#6D5D5A] px-1">核心营养与代谢指标达成情况：</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {assessment.details.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-3 border border-[#EEDDD9] flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#4A3E3D] block">{item.label}</span>
                    <div className="text-xs text-[#7A6B68] font-medium">
                      当前 <span className="font-bold text-[#3E3230]">{item.value}</span>
                      {item.unit && ` ${item.unit}`} / 目标 {item.target}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.status === "perfect"
                        ? "bg-[#EBFBEE] text-[#2F855A]"
                        : item.status === "good"
                        ? "bg-[#EBF8FF] text-[#2B6CB0]"
                        : "bg-[#FFF5F5] text-[#C53030]"
                    }`}
                  >
                    {item.status === "perfect"
                      ? "✨ 完美达标"
                      : item.status === "good"
                      ? "👍 状态良好"
                      : "⚠️ 建议关注"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions Box */}
          <div className="rounded-2xl bg-gradient-to-r from-[#FFF5F7] to-[#F5F3FF] p-4 border border-[#FFE4E8] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-extrabold text-[#D53F8C]">
              <span>💡</span>
              <span>贴心改善建议与明日行动：</span>
            </div>
            <p className="text-[#6D5D5A] leading-relaxed font-medium">
              {assessment.suggestions}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-[#8C7A78]">
          <p>暂无评估数据，点击上方“重新评估”立即生成今日报告</p>
        </div>
      )}
    </div>
  );
};
