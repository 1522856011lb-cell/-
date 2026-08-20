import React, { useState, useEffect } from "react";
import { BodyProfile, ExerciseLogEntry, FoodDiaryEntry, WeeklyReportData } from "../types";
import { loadWeeklyReport, saveWeeklyReport } from "../utils/storage";
import {
  FileText,
  Sparkles,
  Loader2,
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import confetti from "canvas-confetti";

interface WeeklyReportCardProps {
  profile: BodyProfile;
  diaryEntries: FoodDiaryEntry[];
  exerciseLogs: ExerciseLogEntry[];
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({
  profile,
  diaryEntries,
  exerciseLogs,
}) => {
  const [report, setReport] = useState<WeeklyReportData | null>(() => loadWeeklyReport());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Generate or regenerate weekly report
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          diary_entries: diaryEntries,
          exercise_logs: exerciseLogs,
        }),
      });

      if (res.ok) {
        const data: WeeklyReportData = await res.json();
        const updatedReport = {
          ...data,
          generated_at: new Date().toISOString(),
        };
        setReport(updatedReport);
        saveWeeklyReport(updatedReport);

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#A8E6CF", "#FFD3B6", "#FFAAA5", "#FF8B94"],
          });
        } catch (_) {}
      }
    } catch (e) {
      console.error("Weekly report generation error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="weekly-report-card"
      className="bg-white rounded-3xl p-6 border border-[#E9D8FD] shadow-card space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[#F5EDFD] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#F3E8FF] text-[#805AD5] flex items-center justify-center text-xl shadow-xs">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-[#3E3230]">AI 周度减脂健康复盘</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#805AD5] border border-[#DDD6FE]">
                每周日自动汇总
              </span>
            </div>
            <p className="text-xs text-[#8C7A78]">
              {report?.generated_at
                ? `上次生成: ${new Date(report.generated_at).toLocaleDateString()}`
                : "总结近7天热量摄入、运动消耗与体重趋势"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-generate-weekly-report"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#805AD5] to-[#9F7AEA] text-white text-xs font-bold shadow-xs hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI 正在全面复盘...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{report ? "更新本周周报" : "一键生成周报"}</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl hover:bg-[#F5EDFD] text-[#805AD5] transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {!report ? (
            <div className="text-center py-6 px-4 bg-[#FAF5FF] rounded-2xl border border-dashed border-[#DDD6FE] space-y-2">
              <p className="text-xs text-[#6B5A7D] font-medium">
                还没有生成本周的健康复盘报告哦！点击上方按钮，让 AI 为您梳理 7 天执行情况。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Grades & Metrics 4-Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#FAF5FF] border border-[#DDD6FE] rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] font-bold text-[#805AD5] block">本周综合评级</span>
                  <span className="text-2xl font-black text-[#6B46C1] mt-0.5 block">
                    {report.weekly_grade}
                  </span>
                </div>

                <div className="bg-[#FFF5F7] border border-[#FFCCD5] rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] font-bold text-[#E03164] block">日均摄入热量</span>
                  <span className="text-lg font-extrabold text-[#3E3230] mt-0.5 block">
                    {report.avg_daily_calories} <span className="text-[10px] text-[#8C7A78]">kcal</span>
                  </span>
                </div>

                <div className="bg-[#EBFBEE] border border-[#A8E6CF] rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] font-bold text-[#2F855A] block">累计运动时长</span>
                  <span className="text-lg font-extrabold text-[#3E3230] mt-0.5 block">
                    {report.total_workout_minutes} <span className="text-[10px] text-[#8C7A78]">分钟</span>
                  </span>
                </div>

                <div className="bg-[#FFFDF0] border border-[#FEEBC8] rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] font-bold text-[#DD6B20] block">累计消耗热量</span>
                  <span className="text-lg font-extrabold text-[#3E3230] mt-0.5 block">
                    {report.total_burned_calories} <span className="text-[10px] text-[#8C7A78]">kcal</span>
                  </span>
                </div>
              </div>

              {/* AI Summary Text */}
              <div className="bg-gradient-to-r from-[#FAF5FF] to-[#FFF5F7] p-4 rounded-2xl border border-[#E9D8FD] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B46C1]">
                  <span>💡</span>
                  <span>AI 深度总结</span>
                </div>
                <p className="text-xs text-[#3E3230] leading-relaxed font-medium">
                  {report.summary}
                </p>
              </div>

              {/* Highlights & Next Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#FAF7F5] rounded-2xl p-3.5 border border-[#F3E5E3] space-y-1.5">
                  <span className="text-xs font-bold text-[#3E3230] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#ED8936]" />
                    <span>本周亮点闪光点</span>
                  </span>
                  <ul className="space-y-1 text-xs text-[#635552]">
                    {report.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#48BB78] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF7F5] rounded-2xl p-3.5 border border-[#F3E5E3] space-y-1.5">
                  <span className="text-xs font-bold text-[#3E3230] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#3182CE]" />
                    <span>下周重点执行行动项</span>
                  </span>
                  <p className="text-xs text-[#635552] leading-relaxed font-medium">
                    {report.next_week_action}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
