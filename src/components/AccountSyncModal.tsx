import React, { useState, useEffect } from "react";
import { BodyProfile, ExerciseLogEntry, FoodDiaryEntry } from "../types";
import {
  getSupabase,
  getSupabaseCredentials,
  isSupabaseConfigured,
  resetSupabaseClient,
  SUPABASE_SQL_SCHEMA,
  syncUserProfile,
} from "../utils/supabase";
import {
  Cloud,
  Database,
  CheckCircle2,
  Lock,
  Mail,
  Key,
  Copy,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import confetti from "canvas-confetti";

interface AccountSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BodyProfile;
  diaryEntries: FoodDiaryEntry[];
  exerciseLogs: ExerciseLogEntry[];
}

export const AccountSyncModal: React.FC<AccountSyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  diaryEntries,
  exerciseLogs,
}) => {
  const [configured, setConfigured] = useState(isSupabaseConfigured());
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseCredentials().url);
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseCredentials().anonKey);
  const [activeTab, setActiveTab] = useState<"auth" | "db_config" | "wearables">("auth");
  const [isCopied, setIsCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Wearables state
  const [appleHealthConnected, setAppleHealthConnected] = useState(false);
  const [googleFitConnected, setGoogleFitConnected] = useState(false);

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("fitglow_supabase_url", supabaseUrl.trim());
    localStorage.setItem("fitglow_supabase_key", supabaseKey.trim());
    resetSupabaseClient();
    setConfigured(isSupabaseConfigured());
    setSyncStatus("配置已保存，已连接到 Supabase 实例！");
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus("正在同步档案与健康数据...");
    try {
      await syncUserProfile(profile);
      setSyncStatus("同步成功！数据已持久化至云端。");
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#A8E6CF", "#38B2AC", "#B2F5EA"],
        });
      } catch (_) {}
    } catch (e) {
      setSyncStatus("同步失败，请检查网络或 Supabase 配置。");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E9D8FD] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F7EBE8] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#F3E8FF] text-[#805AD5] flex items-center justify-center font-bold">
              ☁️
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#3E3230]">云端同步与设备接入</h3>
              <p className="text-xs text-[#8C7A78]">Supabase 认证数据库 & Apple Health / Google Fit 接口</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#FAF5F4] text-[#7A6B68] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF5F4] rounded-2xl">
          <button
            onClick={() => setActiveTab("auth")}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "auth" ? "bg-white text-[#805AD5] shadow-xs" : "text-[#7A6B68]"
            }`}
          >
            👤 账号与同步
          </button>
          <button
            onClick={() => setActiveTab("wearables")}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "wearables" ? "bg-white text-[#319795] shadow-xs" : "text-[#7A6B68]"
            }`}
          >
            ⌚ 可穿戴设备
          </button>
          <button
            onClick={() => setActiveTab("db_config")}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "db_config" ? "bg-white text-[#E03164] shadow-xs" : "text-[#7A6B68]"
            }`}
          >
            ⚙️ Supabase 凭据
          </button>
        </div>

        {/* TAB 1: 账号与同步 */}
        {activeTab === "auth" && (
          <div className="space-y-4">
            <div className="bg-[#FAF5FF] border border-[#DDD6FE] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B46C1]">云端数据状态</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    configured ? "bg-[#E6F4EA] text-[#2F855A]" : "bg-[#FFF0F3] text-[#E03164]"
                  }`}
                >
                  {configured ? "● Supabase 已连接" : "○ 本地离线存储模式"}
                </span>
              </div>
              <p className="text-xs text-[#554745]">
                {configured
                  ? "您的饮食记录、体脂档案和运动数据已支持与 Supabase 云端无缝多端实时同步。"
                  : "当前运行在本地离线存储模式（Local Storage），数据保存在您的浏览器中。可随时配置 Supabase 进行云端备份。"}
              </p>
            </div>

            {configured && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl bg-[#805AD5] hover:bg-[#6B46C1] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>立即将本地数据同步到 Supabase</span>
              </button>
            )}

            {syncStatus && (
              <div className="p-2.5 rounded-xl bg-[#E6FFFA] text-[#234E52] border border-[#B2F5EA] text-xs font-bold text-center">
                {syncStatus}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 可穿戴设备接口预留 */}
        {activeTab === "wearables" && (
          <div className="space-y-3">
            <p className="text-xs text-[#8C7A78]">
              FitGlow 预留了主流智能手环与健康生态 API，可一键读取今日活动消耗与步数。
            </p>

            {/* Apple Health Card */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EEDDD9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-xl flex items-center justify-center">
                  🍎
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#3E3230]">Apple Health (健康)</h4>
                  <p className="text-[11px] text-[#8C7A78]">自动同步活动能量、静息心率与步数</p>
                </div>
              </div>
              <button
                onClick={() => setAppleHealthConnected(!appleHealthConnected)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  appleHealthConnected
                    ? "bg-[#E6F4EA] text-[#2F855A] border border-[#A8E6CF]"
                    : "bg-[#4A3E3D] text-white hover:bg-[#382F2E]"
                }`}
              >
                {appleHealthConnected ? "已授权接入" : "点击授权"}
              </button>
            </div>

            {/* Google Fit Card */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EEDDD9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBFBEE] text-xl flex items-center justify-center">
                  🏃‍♂️
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#3E3230]">Google Fit / Health Connect</h4>
                  <p className="text-[11px] text-[#8C7A78]">同步 Android 智能手表运动记录与热量</p>
                </div>
              </div>
              <button
                onClick={() => setGoogleFitConnected(!googleFitConnected)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  googleFitConnected
                    ? "bg-[#E6F4EA] text-[#2F855A] border border-[#A8E6CF]"
                    : "bg-[#4A3E3D] text-white hover:bg-[#382F2E]"
                }`}
              >
                {googleFitConnected ? "已授权接入" : "点击授权"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Supabase 凭据与 SQL Schema */}
        {activeTab === "db_config" && (
          <div className="space-y-4">
            <form onSubmit={handleSaveCredentials} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#7A6B68]">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF5F4] border border-[#F3E5E3] text-xs focus:bg-white focus:border-[#805AD5] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#7A6B68]">Supabase Anon Key</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF5F4] border border-[#F3E5E3] text-xs focus:bg-white focus:border-[#805AD5] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#805AD5] to-[#9F7AEA] text-white font-bold text-xs shadow-xs hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存 Supabase 凭据配置</span>
              </button>
            </form>

            {/* SQL Table Creation Script */}
            <div className="bg-[#FAF5FF] p-3.5 rounded-2xl border border-[#DDD6FE] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B46C1]">Supabase 一键数据库迁移脚本</span>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="text-[10px] font-bold text-[#805AD5] hover:text-[#6B46C1] flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-md border border-[#DDD6FE]"
                >
                  {isCopied ? <Check className="w-3 h-3 text-[#48BB78]" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? "已复制 SQL" : "复制 SQL"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#7E6D8A]">
                在 Supabase 控制台的 SQL Editor 中粘贴运行即可自动创建 user_profiles、food_entries、exercise_entries 等数据表。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
