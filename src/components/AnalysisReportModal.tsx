import React from "react";
import { motion } from "motion/react";
import { AnalysisReport, Pet } from "../types";
import { X } from "lucide-react";

interface AnalysisReportModalProps {
  report: AnalysisReport;
  pet: Pet;
  onClose: () => void;
  currentLanguage?: string;
}

const TRANSLATIONS: Record<
  string,
  {
    healthCheck: string;
    healthStatus: string;
    body: string;
    eyes: string;
    skin: string;
    excellent: string;
    good: string;
    needsAttention: string;
    critical: string;
    gotIt: string;
    today: string;
  }
> = {
  en: {
    healthCheck: "Health Check",
    healthStatus: "Health status",
    body: "Body",
    eyes: "Eyes",
    skin: "Skin",
    excellent: "Excellent",
    good: "Good",
    needsAttention: "Needs Attention",
    critical: "Critical",
    gotIt: "Got it",
    today: "Today",
  },
  ru: {
    healthCheck: "Итог проверки",
    healthStatus: "Состояние здоровья",
    body: "Тело",
    eyes: "Глаза",
    skin: "Кожа и шерсть",
    excellent: "Отлично",
    good: "Хорошо",
    needsAttention: "Требует внимания",
    critical: "Критично",
    gotIt: "Понятно",
    today: "Сегодня",
  },
  fr: {
    healthCheck: "Bilan de santé",
    healthStatus: "État de santé",
    body: "Corps",
    eyes: "Yeux",
    skin: "Pelage & Peau",
    excellent: "Excellent",
    good: "Bon",
    needsAttention: "Attention requise",
    critical: "Critique",
    gotIt: "Compris",
    today: "Aujourd'hui",
  },
  de: {
    healthCheck: "Gesundheitscheck",
    healthStatus: "Gesundheitszustand",
    body: "Körper",
    eyes: "Augen",
    skin: "Fell & Haut",
    excellent: "Ausgezeichnet",
    good: "Gut",
    needsAttention: "Aufmerksamkeit nötig",
    critical: "Kritisch",
    gotIt: "Verstanden",
    today: "Heute",
  },
  es: {
    healthCheck: "Chequeo de salud",
    healthStatus: "Estado de salud",
    body: "Cuerpo",
    eyes: "Ojos",
    skin: "Piel y pelaje",
    excellent: "Excelente",
    good: "Bueno",
    needsAttention: "Requiere atención",
    critical: "Crítico",
    gotIt: "Entendido",
    today: "Hoy",
  },
  it: {
    healthCheck: "Controllo salute",
    healthStatus: "Stato di salute",
    body: "Corpo",
    eyes: "Occhi",
    skin: "Pelle & Pelo",
    excellent: "Eccellente",
    good: "Buono",
    needsAttention: "Richiede attenzione",
    critical: "Critico",
    gotIt: "Ho capito",
    today: "Oggi",
  },
  ja: {
    healthCheck: "ヘルスチェック",
    healthStatus: "健康状態",
    body: "体型",
    eyes: "目",
    skin: "皮膚・被毛",
    excellent: "極めて良好",
    good: "良好",
    needsAttention: "注意が必要",
    critical: "重篤",
    gotIt: "了解",
    today: "今日",
  },
  ko: {
    healthCheck: "건강 검진 결과",
    healthStatus: "건강 상태",
    body: "신체",
    eyes: "눈",
    skin: "피부 및 털",
    excellent: "매우 우수",
    good: "좋음",
    needsAttention: "주의 필요",
    critical: "위험",
    gotIt: "확인",
    today: "오늘",
  },
  zh: {
    healthCheck: "健康检查结果",
    healthStatus: "健康状况",
    body: "身体",
    eyes: "眼睛",
    skin: "皮肤与毛发",
    excellent: "极佳",
    good: "良好",
    needsAttention: "需要关注",
    critical: "严重",
    gotIt: "知道了",
    today: "今天",
  },
  "pt-BR": {
    healthCheck: "Checagem de Saúde",
    healthStatus: "Estado de saúde",
    body: "Corpo",
    eyes: "Olhos",
    skin: "Pele e Pelagem",
    excellent: "Excelente",
    good: "Bom",
    needsAttention: "Requer Atenção",
    critical: "Crítico",
    gotIt: "Entendido",
    today: "Hoje",
  },
};

/**
 * Returns color matching the health score:
 * < 50%  – Red (#FF3B30)
 * 50-74% – Orange (#FF9500)
 * 75-89% – Yellow/Amber (#E5A100)
 * 90%+   – Green (#30D158)
 */
function getStatusColor(score: number): string {
  if (score < 50) return "#FF3B30";
  if (score < 75) return "#FF9500";
  if (score < 90) return "#E5A100";
  return "#30D158";
}

export default function AnalysisReportModal({
  report,
  pet,
  onClose,
  currentLanguage = "en",
}: AnalysisReportModalProps) {
  const lang = currentLanguage || "en";
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const score = Math.max(0, Math.min(100, Math.round(report.healthScore || 0)));
  const statusColor = getStatusColor(score);

  // Status word based on score percentage
  const getStatusWord = (): string => {
    if (score >= 90) return t.excellent;
    if (score >= 75) return t.good;
    if (score >= 50) return t.needsAttention;
    return t.critical;
  };
  const statusWord = getStatusWord();

  // Sub-metrics (Body, Eyes, Skin) derived from report or computed fallback
  const bodyScore =
    typeof report.bodyScore === "number" && !isNaN(report.bodyScore)
      ? Math.round(report.bodyScore)
      : score;
  const eyesScore =
    typeof report.eyesScore === "number" && !isNaN(report.eyesScore)
      ? Math.round(report.eyesScore)
      : Math.min(100, score + 2);
  const skinScore =
    typeof report.skinScore === "number" && !isNaN(report.skinScore)
      ? Math.round(report.skinScore)
      : Math.max(30, score - 1);

  // Date formatting for the top of the circular gauge
  const displayDate = (() => {
    if (!report.date) return t.today;
    try {
      const d = new Date(report.date);
      if (isNaN(d.getTime())) return t.today;
      const now = new Date();
      if (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      ) {
        return t.today;
      }
      return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return t.today;
    }
  })();

  // Description text
  const descriptionText =
    report.summary ||
    report.generalCondition ||
    (score >= 75
      ? `${pet.name || "Pet"} appears calm and alert with healthy coat texture and symmetrical posture.`
      : `Visual check suggests observing ${pet.name || "your pet"} for any behavioral or appetite shifts.`);

  // Tip text connected to recommendations or health score
  const tipText = (() => {
    if (report.recommendations && report.recommendations.length > 0 && report.recommendations[0]) {
      return report.recommendations[0];
    }
    if (lang === "ru") {
      if (score >= 90) return "Сохраняйте текущий сбалансированный рацион и активность для поддержания отличной формы.";
      if (score >= 75) return "Следите за чистой водой в миске и регулярной гигиеной шерсти.";
      if (score >= 50) return "Обратите внимание на аппетит и запланируйте профилактический осмотр.";
      return "Рекомендуется очная консультация с ветеринаром для детальной проверки.";
    }
    if (score >= 90) return "Maintain current balanced nutrition and playful daily activity.";
    if (score >= 75) return "Ensure fresh drinking water and monitor coat condition.";
    if (score >= 50) return "Keep an eye on daily appetite and plan a routine checkup.";
    return "A consultation with your veterinarian is recommended.";
  })();

  // Circular gauge parameters (slightly smaller than Analytics 120 radius)
  const actRadius = 76;
  const actStroke = 16;
  const actCirc = actRadius * 2 * Math.PI;
  const actOffset = actCirc - (score / 100) * actCirc;

  return (
    <div
      id="report-modal-backdrop"
      className="fixed inset-0 z-[100] flex flex-col justify-end overflow-hidden select-none"
    >
      {/* Translucent Backdrop matching other popups */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Slide-Up Popup Sheet matching Groups & Settings style: rounded-t-[44px] */}
      <motion.div
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.15 }}
        dragSnapToOrigin
        onDragEnd={(_event, info) => {
          if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
            onClose();
          }
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-md mx-auto bg-white dark:bg-[#1C1C1E] rounded-t-[44px] shadow-[0_-16px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.6)] z-10 select-none text-[#1c1c1e] dark:text-white transition-colors"
        id="report-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
        }}
      >
        {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
        <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

        {/* Scrollable sheet body with generous bottom padding and clean top padding */}
        <div className="w-full max-h-[85vh] overflow-y-auto overscroll-contain px-6 pt-5 pb-10">
          {/* Top Header with Signature 48px Circular Close Button matching Streak / Settings / Groups */}
          <div className="flex items-center justify-between w-full pt-1 mb-2 relative">
            <button
              id="close-analysis-report-btn-x"
              type="button"
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#2C2C2E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#3A3A3C] active:scale-95 transition-all cursor-pointer flex-shrink-0 z-10 outline-none focus:outline-none"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
            </button>

            <span className="text-[20px] sm:text-[21px] font-bold text-[#1c1c1e] dark:text-white tracking-tight absolute inset-x-0 text-center pointer-events-none">
              {t.healthCheck}
            </span>

            {/* Invisible symmetric spacer */}
            <div className="w-12 h-12 invisible flex-shrink-0" />
          </div>

          {/* 1. Circular Diagram (Slightly smaller than on Analytics) */}
          <div className="relative flex items-center justify-center mx-auto mt-4 mb-2 select-none">
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
                stroke={statusColor}
                fill="transparent"
                strokeWidth={actStroke}
                strokeDasharray={`${actCirc} ${actCirc}`}
                strokeDashoffset={actOffset}
                strokeLinecap="round"
                r={actRadius}
                cx={actRadius + actStroke / 2}
                cy={actRadius + actStroke / 2}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Center Column: Date on top, Pet Health Score in center, "Health status" below */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-2 overflow-hidden">
              {/* Date on top - enlarged for enhanced visibility */}
              <span
                className="text-[16px] sm:text-[17px] font-semibold tracking-tight mb-1 transition-colors duration-300"
                style={{ color: statusColor }}
              >
                {displayDate}
              </span>

              {/* Score in center */}
              <span
                className="text-[48px] sm:text-[52px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none my-0.5"
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
                }}
              >
                {score}%
              </span>

              {/* Gray label "Health status" */}
              <span className="text-[13px] sm:text-[14px] font-medium text-[#8E8E93] dark:text-[#98989D] tracking-tight mt-0.5">
                {t.healthStatus}
              </span>
            </div>
          </div>

          {/* 2. Specific Parts Assessment Plaques (Body, Eyes, Skin – without Streak) with increased top margin */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full mt-6 sm:mt-7">
            {/* Plaque 1: Body */}
            <div className="bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-[22px] py-2.5 sm:py-3 px-2 shadow-xs border border-transparent dark:border-white/5 flex flex-col items-center justify-center text-center select-none">
              <div className="flex items-center justify-center mb-0.5">
                <span
                  className="text-[18px] sm:text-[20px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
                  }}
                >
                  {bodyScore}%
                </span>
              </div>
              <span className="text-[11px] sm:text-[12px] font-medium text-[#8E8E93] dark:text-[#98989D] tracking-tight">
                {t.body}
              </span>
            </div>

            {/* Plaque 2: Eyes */}
            <div className="bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-[22px] py-2.5 sm:py-3 px-2 shadow-xs border border-transparent dark:border-white/5 flex flex-col items-center justify-center text-center select-none">
              <div className="flex items-center justify-center mb-0.5">
                <span
                  className="text-[18px] sm:text-[20px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
                  }}
                >
                  {eyesScore}%
                </span>
              </div>
              <span className="text-[11px] sm:text-[12px] font-medium text-[#8E8E93] dark:text-[#98989D] tracking-tight">
                {t.eyes}
              </span>
            </div>

            {/* Plaque 3: Skin */}
            <div className="bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-[22px] py-2.5 sm:py-3 px-2 shadow-xs border border-transparent dark:border-white/5 flex flex-col items-center justify-center text-center select-none">
              <div className="flex items-center justify-center mb-0.5">
                <span
                  className="text-[18px] sm:text-[20px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
                  }}
                >
                  {skinScore}%
                </span>
              </div>
              <span className="text-[11px] sm:text-[12px] font-medium text-[#8E8E93] dark:text-[#98989D] tracking-tight">
                {t.skin}
              </span>
            </div>
          </div>

          {/* 3. Condition Description Plaque: Word in status color + textual description */}
          <div className="w-full bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-[24px] p-4.5 sm:p-5 border border-transparent dark:border-white/5 flex flex-col text-left mt-3 select-none">
            <div className="flex items-center justify-between mb-1.5">
              <h4
                className="text-[19px] sm:text-[20px] font-bold tracking-tight"
                style={{ color: statusColor }}
              >
                {statusWord}
              </h4>
            </div>
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#6E6E73] dark:text-[#A1A1A6] font-normal">
              {descriptionText}
            </p>
          </div>

          {/* 4. Tip Plaque */}
          <div className="w-full bg-[#f5f4fa] dark:bg-[#2C2C2E] rounded-[24px] p-4.5 sm:p-5 border border-transparent dark:border-white/5 flex flex-col text-left mt-3 select-none">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[18px] sm:text-[19px] font-bold tracking-tight text-[#1C1C1E] dark:text-white">
                {lang === "ru" ? "Совет" : "Tip"}
              </h4>
            </div>
            <p className="text-[13.5px] sm:text-[14px] leading-relaxed text-[#6E6E73] dark:text-[#A1A1A6] font-normal">
              {tipText}
            </p>
          </div>

          {/* 5. Disclaimer */}
          <p className="text-[12px] sm:text-[12.5px] text-zinc-400 dark:text-zinc-500 leading-relaxed px-1.5 mt-3.5 mb-2 text-left select-none">
            {lang === "ru"
              ? "*Приложение помогает выявлять возможные изменения в здоровье раньше благодаря ежедневным фотопроверкам, но результаты ИИ носят исключительно информационный характер и не заменяют консультацию или диагноз ветеринара."
              : "*The app helps detect potential health changes earlier through daily photo check-ups, but AI results are informational only and do not replace veterinary advice or diagnosis."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
