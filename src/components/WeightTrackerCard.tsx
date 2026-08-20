import React, { useState } from "react";
import { BodyProfile, WeightRecord } from "../types";
import { loadWeightRecords, saveWeightRecords } from "../utils/storage";
import { Scale, Plus, TrendingDown, TrendingUp, Sparkles, Check, Trash2, Calendar } from "lucide-react";
import confetti from "canvas-confetti";

interface WeightTrackerCardProps {
  profile: BodyProfile;
  onWeightChange: (newWeight: number) => void;
}

export const WeightTrackerCard: React.FC<WeightTrackerCardProps> = ({
  profile,
  onWeightChange,
}) => {
  const [records, setRecords] = useState<WeightRecord[]>(() => loadWeightRecords());
  const [modalOpen, setModalOpen] = useState(false);
  const [inputWeight, setInputWeight] = useState<number>(profile.weight_kg);
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [inputNote, setInputNote] = useState<string>("晨起空腹");

  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestRecord = sortedRecords[sortedRecords.length - 1];
  const firstRecord = sortedRecords[0];

  const weightChange = latestRecord && firstRecord
    ? Number((latestRecord.weight_kg - firstRecord.weight_kg).toFixed(1))
    : 0;

  const minWeight = sortedRecords.length ? Math.min(...sortedRecords.map((r) => r.weight_kg)) - 0.5 : 45;
  const maxWeight = sortedRecords.length ? Math.max(...sortedRecords.map((r) => r.weight_kg)) + 0.5 : 60;
  const range = Math.max(1, maxWeight - minWeight);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWeight) return;

    const newRecord: WeightRecord = {
      id: `wt_${Date.now()}`,
      weight_kg: Number(inputWeight.toFixed(1)),
      date: inputDate,
      note: inputNote || "日常记录",
    };

    // Filter out existing record with same date or append
    const updated = [...records.filter((r) => r.date !== inputDate), newRecord];
    setRecords(updated);
    saveWeightRecords(updated);
    onWeightChange(newRecord.weight_kg);

    try {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ["#A8E6CF", "#FFD3B6", "#FFAAA5"],
      });
    } catch (_) {}

    setModalOpen(false);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveWeightRecords(updated);
  };

  return (
    <div
      id="weight-tracker-card"
      className="bg-white rounded-3xl p-6 border border-[#B2F5EA] shadow-card space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[#E6FFFA] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E6FFFA] text-[#319795] flex items-center justify-center text-xl shadow-xs">
            ⚖️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-[#3E3230]">体重与体态趋势</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6FFFA] text-[#285E61] border border-[#B2F5EA]">
                晨起空腹更精准
              </span>
            </div>
            <p className="text-xs text-[#8C7A78]">
              当前体重: <b className="text-[#3E3230]">{latestRecord?.weight_kg || profile.weight_kg} kg</b> · 较初期变化:{" "}
              <span className={weightChange <= 0 ? "text-[#38A169] font-bold" : "text-[#E03164] font-bold"}>
                {weightChange <= 0 ? `↓ ${Math.abs(weightChange)} kg` : `↑ +${weightChange} kg`}
              </span>
            </p>
          </div>
        </div>

        <button
          id="btn-open-add-weight"
          onClick={() => {
            setInputWeight(latestRecord?.weight_kg || profile.weight_kg);
            setModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#319795] to-[#38B2AC] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>记录今日体重</span>
        </button>
      </div>

      {/* 7-Day Trend Chart Bars */}
      <div className="bg-[#F7FAFC] rounded-2xl p-4 border border-[#E2E8F0] space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#718096]">
          <span>近 7 次记录走势</span>
          <span>目标: {profile.goal === "fat_loss" ? "稳步下降 📉" : "平稳增肌 📈"}</span>
        </div>

        <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2">
          {sortedRecords.slice(-7).map((rec, i) => {
            const heightPct = Math.max(15, Math.min(100, Math.round(((rec.weight_kg - minWeight) / range) * 100)));
            const isLatest = i === sortedRecords.slice(-7).length - 1;

            return (
              <div key={rec.id} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#2D3748] text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap z-10 pointer-events-none">
                  {rec.weight_kg}kg ({rec.note || "日常"})
                </div>

                <span className="text-[10px] font-bold text-[#4A5568]">{rec.weight_kg}</span>
                <div className="w-full max-w-[28px] bg-white rounded-t-xl overflow-hidden border border-[#CBD5E0] h-20 flex items-end">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full transition-all duration-300 rounded-t-md ${
                      isLatest
                        ? "bg-gradient-to-t from-[#319795] to-[#4FD1C5]"
                        : "bg-gradient-to-t from-[#A0AEC0] to-[#CBD5E0]"
                    }`}
                  ></div>
                </div>
                <span className="text-[9px] text-[#A0AEC0] font-semibold whitespace-nowrap">
                  {rec.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for adding/updating weight */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-[#B2F5EA] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#E6FFFA] pb-2">
              <h4 className="font-extrabold text-sm text-[#234E52]">记录身体体重</h4>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs text-[#A0AEC0] hover:text-[#2D3748] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#4A5568]">体重数值 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  required
                  value={inputWeight}
                  onChange={(e) => setInputWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0] text-center text-lg font-black text-[#2D3748] focus:bg-white focus:border-[#319795] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4A5568]">记录日期</label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0] text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#4A5568]">备注状态</label>
                  <input
                    type="text"
                    value={inputNote}
                    onChange={(e) => setInputNote(e.target.value)}
                    placeholder="如：晨起空腹 / 运动后"
                    className="w-full px-2 py-1.5 rounded-lg bg-[#F7FAFC] border border-[#E2E8F0] text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#319795] to-[#38B2AC] text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存记录并更新体脂档案</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
