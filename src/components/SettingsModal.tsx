import React, { useState, useEffect } from "react";
import { AppTheme, MealReminderSettings } from "../types";
import {
  getTheme,
  saveTheme,
  getMealReminders,
  saveMealReminders,
  loadUnsplashKey,
  saveUnsplashKey,
} from "../utils/storage";
import {
  Settings,
  Palette,
  Bell,
  BellRing,
  Sparkles,
  Check,
  Zap,
  Heart,
  Clock,
  X,
  Volume2,
  Image,
  Key,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}) => {
  const [reminders, setReminders] = useState<MealReminderSettings>(() => getMealReminders());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [testSent, setTestSent] = useState(false);
  const [unsplashKey, setUnsplashKey] = useState<string>(() => loadUnsplashKey());
  const [keySavedToast, setKeySavedToast] = useState(false);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotificationPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveUnsplashKey = (key: string) => {
    setUnsplashKey(key);
    saveUnsplashKey(key);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 2500);
  };

  const handleToggleTheme = (newTheme: AppTheme) => {
    onThemeChange(newTheme);
    saveTheme(newTheme);
    if (newTheme === "beast") {
      document.documentElement.classList.add("theme-beast");
    } else {
      document.documentElement.classList.remove("theme-beast");
    }
  };

  const handleSaveReminders = (newSettings: MealReminderSettings) => {
    setReminders(newSettings);
    saveMealReminders(newSettings);
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      alert("当前浏览器环境不支持桌面通知。");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        sendTestNotification();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendTestNotification = () => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("🌸 FitGlow 定时提醒测试", {
        body: "小可爱，该吃营养健康的午餐啦！记得在 FitGlow 餐盘打卡哦~ 🥗",
        icon: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=128&auto=format&fit=crop&q=80",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      requestNotificationPermission();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#FFE4E8] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#FAF0EE] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F3] text-[#FF6B8B] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-[#3E3230]">应用设置 & 偏好</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF5F4] text-[#8C7A78] hover:text-[#3E3230] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Dual UI Themes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E3230] flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#805AD5]" />
              <span>界面主题风格 (双版本自由切换)</span>
            </span>
            <span className="text-[10px] text-[#8C7A78]">即时生效</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Girly Theme */}
            <button
              onClick={() => handleToggleTheme("girly")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                currentTheme === "girly"
                  ? "bg-gradient-to-br from-[#FFF5F7] to-[#FFF0F3] border-[#FF6B8B] ring-2 ring-[#FFCCD5] shadow-xs"
                  : "bg-[#FFFDF9] border-[#EEDDD9] hover:border-[#FFCCD5]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">🌸</span>
                {currentTheme === "girly" && (
                  <span className="w-5 h-5 rounded-full bg-[#FF6B8B] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="mt-2">
                <div className="text-xs font-extrabold text-[#D53F8C]">元气甜美 ins 风</div>
                <div className="text-[10px] text-[#8C7A78] mt-0.5">
                  奶油白、马卡龙粉、淡紫薄荷绿、大圆角
                </div>
              </div>
            </button>

            {/* Beast Theme */}
            <button
              onClick={() => handleToggleTheme("beast")}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                currentTheme === "beast"
                  ? "bg-[#1E1E1E] text-white border-[#00FF66] ring-2 ring-[#00FF66]/50 shadow-xs"
                  : "bg-[#2A2A2A] text-gray-200 border-gray-700 hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">⚡</span>
                {currentTheme === "beast" && (
                  <span className="w-5 h-5 rounded-full bg-[#00FF66] text-black flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="mt-2">
                <div className="text-xs font-extrabold text-[#00FF66]">硬核黑武士风 (Beast)</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  深邃金属灰、荧光绿、力量感线条
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Meal Reminders & Notifications */}
        <div className="space-y-3 pt-2 border-t border-[#FAF0EE]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E3230] flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#ED8936]" />
              <span>三餐定时提醒 (浏览器通知)</span>
            </span>
            <button
              onClick={() =>
                handleSaveReminders({ ...reminders, enabled: !reminders.enabled })
              }
              className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                reminders.enabled
                  ? "bg-[#E6F4EA] text-[#2F855A]"
                  : "bg-[#F7EBE8] text-[#8C7A78]"
              }`}
            >
              {reminders.enabled ? "已开启" : "已暂停"}
            </button>
          </div>

          {/* Browser Permission Prompt if not granted */}
          {notificationPermission !== "granted" && (
            <div className="p-3 rounded-2xl bg-[#FFF9E6] border border-[#FFEBAA] flex items-center justify-between gap-2 text-xs text-[#8A6D3B]">
              <span>💡 需要允许浏览器通知权限以接收三餐提醒</span>
              <button
                onClick={requestNotificationPermission}
                className="px-2.5 py-1 rounded-xl bg-[#ED8936] text-white font-bold text-[11px] shrink-0 cursor-pointer"
              >
                授权通知
              </button>
            </div>
          )}

          {/* Reminder Time Slots */}
          <div className="space-y-2.5 bg-[#FFFDF9] rounded-2xl p-3.5 border border-[#F5E5E2]">
            {/* Breakfast */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-bold text-[#3E3230]">
                <input
                  type="checkbox"
                  checked={reminders.breakfastEnabled}
                  onChange={(e) =>
                    handleSaveReminders({
                      ...reminders,
                      breakfastEnabled: e.target.checked,
                    })
                  }
                  className="rounded text-[#FF6B8B]"
                />
                <span>🌅 早餐提醒时间</span>
              </label>
              <input
                type="time"
                value={reminders.breakfastTime}
                onChange={(e) =>
                  handleSaveReminders({
                    ...reminders,
                    breakfastTime: e.target.value,
                  })
                }
                className="px-2 py-1 rounded-lg border border-[#EEDDD9] text-xs font-semibold bg-white"
              />
            </div>

            {/* Lunch */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-bold text-[#3E3230]">
                <input
                  type="checkbox"
                  checked={reminders.lunchEnabled}
                  onChange={(e) =>
                    handleSaveReminders({
                      ...reminders,
                      lunchEnabled: e.target.checked,
                    })
                  }
                  className="rounded text-[#FF6B8B]"
                />
                <span>☀️ 午餐提醒时间</span>
              </label>
              <input
                type="time"
                value={reminders.lunchTime}
                onChange={(e) =>
                  handleSaveReminders({
                    ...reminders,
                    lunchTime: e.target.value,
                  })
                }
                className="px-2 py-1 rounded-lg border border-[#EEDDD9] text-xs font-semibold bg-white"
              />
            </div>

            {/* Afternoon Snack */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-bold text-[#3E3230]">
                <input
                  type="checkbox"
                  checked={reminders.snackEnabled}
                  onChange={(e) =>
                    handleSaveReminders({
                      ...reminders,
                      snackEnabled: e.target.checked,
                    })
                  }
                  className="rounded text-[#FF6B8B]"
                />
                <span>🍵 下午加餐提醒</span>
              </label>
              <input
                type="time"
                value={reminders.snackTime}
                onChange={(e) =>
                  handleSaveReminders({
                    ...reminders,
                    snackTime: e.target.value,
                  })
                }
                className="px-2 py-1 rounded-lg border border-[#EEDDD9] text-xs font-semibold bg-white"
              />
            </div>

            {/* Dinner */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-bold text-[#3E3230]">
                <input
                  type="checkbox"
                  checked={reminders.dinnerEnabled}
                  onChange={(e) =>
                    handleSaveReminders({
                      ...reminders,
                      dinnerEnabled: e.target.checked,
                    })
                  }
                  className="rounded text-[#FF6B8B]"
                />
                <span>🌙 晚餐提醒时间</span>
              </label>
              <input
                type="time"
                value={reminders.dinnerTime}
                onChange={(e) =>
                  handleSaveReminders({
                    ...reminders,
                    dinnerTime: e.target.value,
                  })
                }
                className="px-2 py-1 rounded-lg border border-[#EEDDD9] text-xs font-semibold bg-white"
              />
            </div>
          </div>

          {/* Test Notification Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={sendTestNotification}
              className="text-xs font-bold text-[#805AD5] hover:text-[#6B46C1] flex items-center gap-1.5 cursor-pointer py-1"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{testSent ? "测试提醒已发出 ✨" : "发送测试通知"}</span>
            </button>
          </div>
        </div>

        {/* 3. Unsplash Access Key for Recipe Photos */}
        <div className="space-y-3 pt-2 border-t border-[#FAF0EE]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3E3230] flex items-center gap-1.5">
              <Image className="w-4 h-4 text-[#FF6B8B]" />
              <span>高清菜谱图库配置 (Unsplash Key)</span>
            </span>
            {keySavedToast && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-fade-in">
                已自动保存 ✨
              </span>
            )}
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#EEDDD9] space-y-2">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="password"
                value={unsplashKey}
                placeholder="输入你的 Unsplash Access Key (选填)"
                onChange={(e) => handleSaveUnsplashKey(e.target.value)}
                className="flex-1 text-xs bg-white px-3 py-1.5 rounded-xl border border-[#EEDDD9] focus:outline-none focus:border-[#FF6B8B]"
              />
            </div>
            <p className="text-[10px] text-[#8C7A78] leading-relaxed">
              💡 填入 Access Key 可实时检索海量高清美食与做菜步骤图。若暂不填写，系统已自动内置精选高清轻食图库与占位图，完全不影响正常使用。
            </p>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6B8B] to-[#FFAAA6] text-white text-xs sm:text-sm font-extrabold shadow-glow-pink hover:opacity-95 cursor-pointer"
        >
          完成设置并保存
        </button>
      </div>
    </div>
  );
};
