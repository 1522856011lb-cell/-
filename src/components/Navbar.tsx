import React from "react";
import { Sparkles, UtensilsCrossed, BookOpenCheck, Dumbbell, CalendarHeart, ShoppingBag, Settings, Refrigerator } from "lucide-react";
import { AppTheme } from "../types";

export type TabType = "planner" | "fridge" | "home" | "recommend" | "diary" | "workout" | "plan";

interface NavbarProps {
  currentTab: TabType;
  plateCount?: number;
  fridgeCount?: number;
  currentTheme?: AppTheme;
  onSelectTab: (tab: TabType) => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  plateCount = 0,
  fridgeCount = 0,
  currentTheme = "girly",
  onSelectTab,
  onOpenSettings,
}) => {
  const navItems = [
    {
      id: "planner" as TabType,
      label: "今日餐盘",
      icon: ShoppingBag,
      emoji: "🍽️",
      activeColor: "text-[#FF6B8B] bg-[#FFF0F3]",
      badge: plateCount > 0 ? plateCount : undefined,
    },
    {
      id: "fridge" as TabType,
      label: "冰箱管理",
      icon: Refrigerator,
      emoji: "🧊",
      activeColor: "text-[#319795] bg-[#E6FFFA]",
      badge: fridgeCount > 0 ? fridgeCount : undefined,
    },
    {
      id: "diary" as TabType,
      label: "今日饮食",
      icon: BookOpenCheck,
      emoji: "🥗",
      activeColor: "text-[#ED8936] bg-[#FFFAF0]",
    },
    {
      id: "recommend" as TabType,
      label: "AI推荐",
      icon: UtensilsCrossed,
      emoji: "🥑",
      activeColor: "text-[#48BB78] bg-[#EBFBEE]",
    },
    {
      id: "home" as TabType,
      label: "身体数据",
      icon: Sparkles,
      emoji: "✨",
      activeColor: "text-[#D53F8C] bg-[#FFF5F7]",
    },
    {
      id: "workout" as TabType,
      label: "运动方案",
      icon: Dumbbell,
      emoji: "🏃‍♀️",
      activeColor: "text-[#805AD5] bg-[#F7FAFC]",
    },
    {
      id: "plan" as TabType,
      label: "周计划",
      icon: CalendarHeart,
      emoji: "📋",
      activeColor: "text-[#319795] bg-[#E6FFFA]",
    },
  ];

  return (
    <>
      {/* Top Header for Desktop & Mobile Branding */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#F7EBE8] px-4 py-3 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div
            id="brand-logo"
            onClick={() => onSelectTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF9AA2] via-[#FFB7B2] to-[#FFDAC1] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl">{currentTheme === "beast" ? "⚡" : "🌸"}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#FF6B8B] via-[#B794F4] to-[#48BB78] bg-clip-text text-transparent">
                  FitGlow
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#FFE4E8] text-[#D53F8C]">
                  {currentTheme === "beast" ? "Beast Mode" : "v2.0"}
                </span>
              </div>
              <p className="text-[11px] text-[#8C7A78] hidden sm:block font-medium">
                {currentTheme === "beast"
                  ? "硬核黑武士 · 力量塑形与精准能耗"
                  : "可爱 ins 风 · 元气身材与饮食科学管理"}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-desktop-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? `${item.activeColor} shadow-sm scale-102 font-bold`
                      : "text-[#7A6B68] hover:text-[#4A3E3D] hover:bg-[#F9EFEA]/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "scale-110" : ""}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-[#FF6B8B] text-white text-[10px] font-bold flex items-center justify-center -ml-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Settings & Theme Action Buttons */}
          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                id="btn-open-settings"
                onClick={onOpenSettings}
                className="p-2 rounded-2xl bg-white border border-[#EEDDD9] text-[#7A6B68] hover:text-[#3E3230] hover:border-[#FFCCD5] shadow-2xs transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="设置与主题切换"
              >
                <Settings className="w-4 h-4 text-[#FF6B8B]" />
                <span className="hidden sm:inline">设置</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Floating Navigation for Mobile screens */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-lg border-t border-[#F2E4E1] px-2 py-2 safe-area-pb shadow-lg"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-mobile-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "scale-105 text-[#FF6B8B]"
                    : "text-[#9A8A87] hover:text-[#635552]"
                }`}
              >
                <div
                  className={`relative p-1.5 rounded-xl transition-all ${
                    isActive ? "bg-[#FFE4E8] text-[#FF4D79] shadow-sm" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B8B] text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] mt-0.5 font-semibold leading-none ${
                    isActive ? "text-[#FF4D79] font-bold" : ""
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
