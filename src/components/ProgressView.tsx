import React, { useState, useMemo } from "react";
import { Pet, AnalysisReport, getHealthScoreColor, calculateStreak, isSameLocalDate } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Official custom Tinder-style flame icon matching the app's Streak card
const StreakFlameIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.317 9.451c.045.073.123.12.212.12.06 0 .116-.021.158-.057l.015-.012c.39-.325.741-.66 1.071-1.017 3.209-3.483 1.335-7.759 1.32-7.799-.09-.21-.03-.459.15-.594.195-.135.435-.12.615.033 10.875 10.114 7.995 17.818 7.785 18.337-.87 3.141-4.335 5.414-8.444 5.53-.138.008-.242.008-.363.008-4.852 0-8.977-2.989-8.977-6.807v-.06c0-5.297 4.795-10.522 5.009-10.744.136-.149.345-.195.525-.105.18.076.297.255.291.451-.043 1.036.167 1.935.631 2.7v.015l.002.001z"
      fill="#FF8B00"
    />
  </svg>
);

export interface DayTrendItem {
  index: number;
  dayOffset: number; // 0 = today, 1 = yesterday, etc.
  dayLabel: string;
  dateStr: string;
  isToday: boolean;
  hasCheck: boolean;
  score: number;
  barColor: string;
  report?: AnalysisReport;
  isAllowed: boolean; // whether accessible according to maxPastDays
}

interface WeeklyTrendChartProps {
  daysData: DayTrendItem[];
  selectedDayOffset: number;
  onSelectDayOffset: (offset: number) => void;
  maxPastDays: number;
}

function WeeklyTrendChart({
  daysData,
  selectedDayOffset,
  onSelectDayOffset,
  maxPastDays,
}: WeeklyTrendChartProps) {
  return (
    <div className="w-full bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-xs border border-black/[0.04] flex flex-col select-none">
      {/* 7 Columns Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full items-end">
        {daysData.map((d) => {
          // Height between 32px (pill circle) and 88px based on percentage
          const barHeight = Math.max(32, Math.round((d.score / 100) * 88));
          const isClickable = d.dayOffset <= maxPastDays;

          return (
            <div
              key={d.index}
              onClick={() => {
                if (isClickable) {
                  onSelectDayOffset(d.dayOffset);
                }
              }}
              className={`flex flex-col items-center justify-end group ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {/* Vertical Chart Column Container */}
              <div className="h-[96px] sm:h-[106px] w-full flex flex-col items-center justify-end relative">
                {d.hasCheck ? (
                  /* Fully rounded pill bar whose height and color match health score percentage */
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}px` }}
                    transition={{ type: "spring", stiffness: 280, damping: 22, delay: d.index * 0.03 }}
                    style={{ backgroundColor: d.barColor }}
                    className="w-8 sm:w-9 rounded-full transition-transform duration-150 group-hover:scale-105 active:scale-95"
                  />
                ) : (
                  /* Gray circle matching the exact width of the chart bars for days without checks - identical color for all days */
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E5E5EA] transition-transform duration-150 group-hover:scale-105"
                  />
                )}
              </div>

              {/* Day of Week Label */}
              <span
                className={`mt-2.5 text-[11px] sm:text-[12px] tracking-tight leading-none ${
                  d.isToday ? "font-bold text-[#1C1C1E]" : "font-medium text-[#8E8E93]"
                }`}
              >
                {d.dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ProgressViewProps {
  activePet: Pet;
  reportsList: AnalysisReport[];
  currentLanguage: string;
  onOpenScan?: () => void;
  onSelectReport?: (report: AnalysisReport) => void;
  animateEntrance?: boolean;
}

export function ProgressView({ 
  activePet: _activePet, 
  reportsList, 
  currentLanguage, 
  onOpenScan,
  onSelectReport,
  animateEntrance = false 
}: ProgressViewProps) {
  // Check if first-time user: user registered within last 3 days or onboarded_start_date is recent
  const maxPastDays = useMemo(() => {
    try {
      const startDate = localStorage.getItem("pethealth_onboarded_start_date");
      if (!startDate) {
        return 3; // First time default: strictly up to 3 days back
      }
      const startD = new Date(startDate);
      if (isNaN(startD.getTime())) return 3;

      const now = new Date();
      const diffMs = now.getTime() - startD.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      // First-time users get maximum 3 days back; mature users can go back up to 6 days (full 7-day grid)
      if (diffDays <= 3) {
        return 3;
      }
      return 6;
    } catch {
      return 3;
    }
  }, []);

  // Selected day offset: 0 = today, 1 = yesterday, ..., max = maxPastDays
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const enDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Prepare 7-day trend dataset from 6 days ago (i=0) to today (i=6) strictly using real reports
  const daysData: DayTrendItem[] = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const dayOffset = 6 - i; // 6, 5, 4, 3, 2, 1, 0
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      d.setHours(12, 0, 0, 0);

      const isToday = dayOffset === 0;
      const dayLabel = enDays[d.getDay()];

      // Find real report for this specific day using timezone-safe local date matching
      const dayReport = reportsList?.find((r) => isSameLocalDate(r.date, d));
      const hasCheck = !!dayReport;
      const dayScore = dayReport ? dayReport.healthScore : 0;
      const barColor = hasCheck ? getHealthScoreColor(dayScore) : "#E5E5EA";
      const isAllowed = dayOffset <= maxPastDays;

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;

      return {
        index: i,
        dayOffset,
        dayLabel,
        dateStr,
        isToday,
        hasCheck,
        score: dayScore,
        barColor,
        report: dayReport,
        isAllowed,
      };
    });
  }, [reportsList, maxPastDays]);

  // Find active day item based on selectedDayOffset
  const selectedDayItem = useMemo(() => {
    return daysData.find((d) => d.dayOffset === selectedDayOffset) || daysData[6];
  }, [daysData, selectedDayOffset]);

  // Real report for active day (strictly from the selected day's report, no fake fallbacks)
  const activeReport = selectedDayItem.hasCheck ? (selectedDayItem.report || null) : null;
  const score = selectedDayItem.hasCheck ? selectedDayItem.score : 0;
  const ringColor = selectedDayItem.hasCheck ? getHealthScoreColor(score) : "#E5E5EA";

  // Format date: "Today", "Yesterday", or "DD.MM.YYYY"
  const displayDate = useMemo(() => {
    if (selectedDayOffset === 0) return "Today";
    if (selectedDayOffset === 1) return "Yesterday";
    try {
      const d = new Date();
      d.setDate(d.getDate() - selectedDayOffset);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return "Today";
    }
  }, [selectedDayOffset]);

  // Navigation handlers
  const canGoBack = selectedDayOffset < maxPastDays;
  const canGoForward = selectedDayOffset > 0; // cannot go forward past today

  const handlePrevDay = () => {
    if (canGoBack) {
      setSlideDirection("left");
      setSelectedDayOffset((prev) => prev + 1);
    }
  };

  const handleNextDay = () => {
    if (canGoForward) {
      setSlideDirection("right");
      setSelectedDayOffset((prev) => prev - 1);
    }
  };

  const handleSelectDayOffset = (offset: number) => {
    if (offset === selectedDayOffset) return;
    setSlideDirection(offset > selectedDayOffset ? "left" : "right");
    setSelectedDayOffset(offset);
  };

  // Circular gauge parameters
  const actRadius = 120;
  const actStroke = 24;
  const actCirc = actRadius * 2 * Math.PI;
  const actOffset = selectedDayItem.hasCheck ? actCirc - (score / 100) * actCirc : actCirc;

  // Streak calculation from real scans
  const streak = calculateStreak(reportsList);

  // Real sub-metrics derived directly from the day's veterinary report
  const bodyScore = selectedDayItem.hasCheck && activeReport
    ? (typeof activeReport.bodyScore === "number" && !isNaN(activeReport.bodyScore)
        ? activeReport.bodyScore
        : activeReport.healthScore)
    : 0;

  const eyesScore = selectedDayItem.hasCheck && activeReport
    ? (typeof activeReport.eyesScore === "number" && !isNaN(activeReport.eyesScore)
        ? activeReport.eyesScore
        : activeReport.healthScore)
    : 0;

  const skinScore = selectedDayItem.hasCheck && activeReport
    ? (typeof activeReport.skinScore === "number" && !isNaN(activeReport.skinScore)
        ? activeReport.skinScore
        : activeReport.healthScore)
    : 0;

  return (
    <div className="w-full max-w-md min-h-[calc(100vh-140px)] flex flex-col justify-start select-none pb-24">
      {/* Top Left Header - aligned with Groups & Petkit */}
      <div className="w-full flex items-center justify-between mb-4 sm:mb-5 px-1">
        <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight text-[#1c1c1e] leading-none font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
          Analytics
        </h1>
      </div>

      {/* Enlarged Circular Diagram with Left/Right Nav Arrows */}
      <motion.div 
        initial={animateEntrance ? { opacity: 0, y: 20, scale: 0.96 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.06 }}
        className="w-full flex items-center justify-center py-4 sm:py-6 relative px-1 sm:px-2"
      >
        {/* Left Navigation Arrow (Go back in time) - at the screen edge, no circular background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-start">
          {canGoBack && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.15, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] active:text-black transition-colors cursor-pointer outline-none bg-transparent"
            >
              <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.4} />
            </motion.button>
          )}
        </div>

        {/* Center Diagram with Animated Values */}
        <div 
          onClick={() => {
            if (selectedDayItem.hasCheck && activeReport && onSelectReport) {
              onSelectReport(activeReport);
            } else if (!selectedDayItem.hasCheck && onOpenScan) {
              onOpenScan();
            }
          }}
          className={`relative flex items-center justify-center mx-auto ${
            selectedDayItem.hasCheck && activeReport && onSelectReport
              ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
              : !selectedDayItem.hasCheck && onOpenScan
              ? "cursor-pointer hover:opacity-90 active:scale-[0.99] transition-all"
              : ""
          }`}
        >
          <svg 
            height={actRadius * 2 + actStroke} 
            width={actRadius * 2 + actStroke} 
            className="transform -rotate-90"
          >
            {/* Background Track Circle */}
            <circle
              className="chart-track-ring stroke-[#E5E5EA] dark:stroke-[#3A3A3C]"
              stroke="#E5E5EA"
              fill="transparent"
              strokeWidth={actStroke}
              r={actRadius}
              cx={actRadius + actStroke / 2}
              cy={actRadius + actStroke / 2}
            />
            {/* Filled Active Progress Arc */}
            <circle
              stroke={ringColor}
              fill="transparent"
              strokeWidth={actStroke}
              strokeDasharray={`${actCirc} ${actCirc}`}
              strokeDashoffset={actOffset}
              strokeLinecap="round"
              r={actRadius}
              cx={actRadius + actStroke / 2}
              cy={actRadius + actStroke / 2}
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center Column: Date on top, Pet Health Score in center, "Health status" below */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`diagram-text-${selectedDayOffset}`}
                initial={{ 
                  opacity: 0, 
                  x: slideDirection === "left" ? 22 : -22,
                  scale: 0.94 
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ 
                  opacity: 0, 
                  x: slideDirection === "left" ? -22 : 22,
                  scale: 0.94 
                }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex flex-col items-center justify-center"
              >
                {/* Date on top: Today, Yesterday, DD.MM.YYYY - matches diagram color */}
                <span 
                  className="text-[15px] sm:text-[16px] font-semibold tracking-tight mb-1 transition-colors duration-300"
                  style={{ color: selectedDayItem.hasCheck ? ringColor : "#8E8E93" }}
                >
                  {displayDate}
                </span>

                {/* Pet Health Score from Photo Analysis or No check */}
                {selectedDayItem.hasCheck ? (
                  <>
                    <span 
                      className="text-[60px] sm:text-[66px] font-bold text-[#1C1C1E] tracking-tight leading-none my-1"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
                    >
                      {score}%
                    </span>

                    {/* Gray label "Health status" */}
                    <span className="text-[14px] sm:text-[15px] font-medium text-[#8E8E93] tracking-tight mt-0.5">
                      Health status
                    </span>
                  </>
                ) : (
                  <span 
                    className="text-[52px] sm:text-[58px] font-medium text-[#8E8E93] tracking-tight leading-none my-2"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
                  >
                    —
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Navigation Arrow (Go forward in time, hidden if today) - at right edge without circle */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-end">
          {canGoForward && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.15, x: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextDay}
              aria-label="Next day"
              className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] active:text-black transition-colors cursor-pointer outline-none bg-transparent"
            >
              <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.4} />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* 4 Small Metrics Plaques below Circular Diagram */}
      <motion.div
        initial={animateEntrance ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.12 }}
        className="w-full px-2 mt-1 sm:mt-2"
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={`plaques-${selectedDayOffset}`}
            initial={{ opacity: 0.7, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.7, y: -4 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full"
          >
            {/* Plaque 1: Streak */}
            <div className="bg-white rounded-[24px] py-2 sm:py-2.5 px-1 sm:px-1.5 shadow-xs border border-black/[0.04] flex flex-col items-center justify-center text-center select-none">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <StreakFlameIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span 
                  className="text-[17px] sm:text-[19px] font-bold text-[#1C1C1E] tracking-tight leading-none"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
                >
                  {streak}
                </span>
              </div>
              <span className="text-[10.5px] sm:text-[11.5px] font-medium text-[#8E8E93] tracking-tight">
                Streak
              </span>
            </div>

            {/* Plaque 2: Body */}
            <div className="bg-white rounded-[24px] py-2 sm:py-2.5 px-1 sm:px-1.5 shadow-xs border border-black/[0.04] flex flex-col items-center justify-center text-center select-none">
              <div className="flex items-center justify-center mb-0.5">
                <span 
                  className="text-[17px] sm:text-[19px] font-bold text-[#1C1C1E] tracking-tight leading-none"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
                >
                  {selectedDayItem.hasCheck ? `${bodyScore}%` : "—"}
                </span>
              </div>
              <span className="text-[10.5px] sm:text-[11.5px] font-medium text-[#8E8E93] tracking-tight">
                Body
              </span>
            </div>

            {/* Plaque 3: Eyes */}
            <div className="bg-white rounded-[24px] py-2 sm:py-2.5 px-1 sm:px-1.5 shadow-xs border border-black/[0.04] flex flex-col items-center justify-center text-center select-none">
              <div className="flex items-center justify-center mb-0.5">
                <span 
                  className="text-[17px] sm:text-[19px] font-bold text-[#1C1C1E] tracking-tight leading-none"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
                >
                  {selectedDayItem.hasCheck ? `${eyesScore}%` : "—"}
                </span>
              </div>
              <span className="text-[10.5px] sm:text-[11.5px] font-medium text-[#8E8E93] tracking-tight">
                Eyes
              </span>
            </div>

            {/* Plaque 4: Skin */}
            <div className="bg-white rounded-[24px] py-2 sm:py-2.5 px-1 sm:px-1.5 shadow-xs border border-black/[0.04] flex flex-col items-center justify-center text-center select-none">
              <div className="flex items-center justify-center mb-0.5">
                <span 
                  className="text-[17px] sm:text-[19px] font-bold text-[#1C1C1E] tracking-tight leading-none"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
                >
                  {selectedDayItem.hasCheck ? `${skinScore}%` : "—"}
                </span>
              </div>
              <span className="text-[10.5px] sm:text-[11.5px] font-medium text-[#8E8E93] tracking-tight">
                Skin
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Weekly Trends Chart Plaque */}
      <motion.div
        initial={animateEntrance ? { opacity: 0, y: 16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.18 }}
        className="w-full px-1 mt-2.5 sm:mt-3"
      >
        <WeeklyTrendChart 
          daysData={daysData}
          selectedDayOffset={selectedDayOffset}
          onSelectDayOffset={handleSelectDayOffset}
          maxPastDays={maxPastDays}
        />
      </motion.div>
    </div>
  );
}

export default ProgressView;



