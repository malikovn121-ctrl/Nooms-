import { useEffect, useState } from "react";
import { Check, X, Clock } from "lucide-react";

interface CalendarSliderProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange?: (dateStr: string) => void;
  currentLanguage?: string;
  selectedPhotoDays?: string[];
  completedPhotoDates?: string[];
  startDateStr?: string;
}

interface DayItem {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Sun, Mon...
  dayNum: number;
}

const LOCALIZED_DAYS: Record<string, string[]> = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  fr: ["D", "L", "M", "M", "J", "V", "S"],
  de: ["S", "M", "D", "M", "D", "F", "S"],
  es: ["D", "L", "M", "X", "J", "V", "S"],
  it: ["D", "L", "M", "M", "G", "V", "S"],
  ja: ["日", "月", "火", "水", "木", "金", "土"],
  ko: ["일", "월", "화", "수", "목", "금", "토"],
  zh: ["日", "一", "二", "三", "四", "五", "六"],
  "pt-BR": ["D", "S", "T", "Q", "Q", "S", "S"],
};

const DAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function CalendarSlider({
  selectedDate,
  currentLanguage = "en",
  selectedPhotoDays = [],
  completedPhotoDates = [],
  startDateStr = "",
}: CalendarSliderProps) {
  const [weekDays, setWeekDays] = useState<DayItem[]>([]);
  const [todayStr, setTodayStr] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const tStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setTodayStr(tStr);

    const getSunday = (date: Date) => {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      return d;
    };

    const todaySunday = getSunday(today);
    const dayLabels = LOCALIZED_DAYS[currentLanguage] || LOCALIZED_DAYS.en;

    const days: DayItem[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(todaySunday);
      d.setDate(todaySunday.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      days.push({
        dateStr,
        dayName: dayLabels[d.getDay()],
        dayNum: d.getDate(),
      });
    }

    setWeekDays(days);
  }, [currentLanguage]);

  return (
    <div
      id="calendar-slider-container"
      className="w-full -mx-1 mt-1 mb-4 select-none pointer-events-none"
    >
      <div className="w-full grid grid-cols-7 gap-1.5 items-center px-1">
        {weekDays.map((item) => {
          const isToday = item.dateStr === (todayStr || selectedDate);
          const isCompleted = completedPhotoDates.includes(item.dateStr);
          const isPast = item.dateStr < todayStr;
          const isFuture = item.dateStr > todayStr;

          return (
            <div
              key={item.dateStr}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-all h-[70px] w-full rounded-2xl select-none cursor-default ${
                isToday
                  ? "bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.04] dark:border-0"
                  : "bg-[#e5e5eb] dark:bg-[#19191B] border border-black/[0.03] dark:border-0"
              }`}
              id={`calendar-day-${item.dayNum}`}
            >
              {/* Day Name */}
              <span
                className={`text-[12.5px] font-bold tracking-tight mb-1.5 uppercase ${
                  isToday
                    ? "text-black dark:text-white"
                    : "text-[#6e6e78] dark:text-[#98989D]"
                }`}
              >
                {item.dayName}
              </span>

              {/* Status Display: Checkmark if completed, X if past missed, Clock if pending/future */}
              <div className="h-6 w-6 flex items-center justify-center">
                {isCompleted ? (
                  <Check className="w-5 h-5 text-emerald-500 stroke-[2.8]" />
                ) : isPast ? (
                  <X className="w-5 h-5 text-rose-500 stroke-[2.8]" />
                ) : (
                  <Clock
                    className={`w-[19px] h-[19px] ${
                      isToday
                        ? "text-zinc-500 dark:text-white"
                        : "text-[#6e6e78] dark:text-[#98989D]"
                    }`}
                    strokeWidth={2.3}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
