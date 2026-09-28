export type PetType = 'cat' | 'dog' | 'parrot' | 'rabbit' | 'rodent' | 'bird' | 'reptile' | 'other' | string;

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  image: string; // Base64 or local asset path
  breed?: string;
  age?: string;
  weight?: string;
  sex?: string;
  species?: string;
  emoji?: string;
  isCustom?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  completed: boolean;
  time: string;
}

export interface HealthLog {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  waterIntake: number; // in ml
  waterTarget: number; // in ml
  medications: Medication[];
  activityLevel: number; // percentage (0-100)
  pottyStatus?: string;
  symptoms?: string[];
  notes?: string;
}

export interface Reminder {
  id: string;
  petId: string;
  title: string;
  time: string;
  type: 'medication' | 'water' | 'vet' | 'walk' | 'food' | 'grooming';
  completed: boolean;
  date?: string; // If one-time reminder
}

export interface AnalysisReport {
  id: string;
  petId: string;
  date: string;
  photo: string; // Image used for analysis
  healthScore: number; // 0-100
  statusLabel: string; // "Excellent" | "Healthy" | "Needs Attention" | "Vet Recommended"
  summary: string;
  findings: Array<{
    category: string;
    status: 'good' | 'warning' | 'critical';
    details: string;
  }>;
  recommendations: string[];
  dietAdvice: string;
  followUp: string;
  symptomsAnalyzed?: string[];
  possibleDiseases?: string[];
  generalCondition?: string;
  bodyScore?: number; // 0-100
  eyesScore?: number; // 0-100
  skinScore?: number; // 0-100
  createdAt?: string;
}

export interface Group {
  id: string;
  name: string;
  username: string;
}

/**
 * Returns color according to rules:
 * below 50% – red (#FF3B30)
 * below 75% – orange (#FF9500)
 * below 90% – yellow (#FFCC00)
 * 90%+ – vibrant green (#30D158)
 */
export function getHealthScoreColor(score: number): string {
  if (score < 50) return "#FF3B30";
  if (score < 75) return "#FF9500";
  if (score < 90) return "#FFCC00";
  return "#30D158";
}

export function getReportLocalDateKey(reportDateStr: string): string {
  if (!reportDateStr) return "";
  if (reportDateStr.includes("T") || reportDateStr.includes(":")) {
    const dateObj = new Date(reportDateStr);
    if (!isNaN(dateObj.getTime())) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const match = reportDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return "";
}

export function isSameLocalDate(reportDateStr: string, targetDate: Date): boolean {
  if (!reportDateStr) return false;
  
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  if (reportDateStr.includes("T") || reportDateStr.includes(":")) {
    const reportDateObj = new Date(reportDateStr);
    if (!isNaN(reportDateObj.getTime())) {
      return (
        reportDateObj.getFullYear() === targetYear &&
        reportDateObj.getMonth() === targetMonth &&
        reportDateObj.getDate() === targetDay
      );
    }
  }

  const parts = reportDateStr.split("-");
  if (parts.length >= 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return y === targetYear && m === targetMonth && d === targetDay;
  }

  return false;
}

/**
 * Calculate consecutive daily photo analysis streak
 */
export function calculateStreak(reports: AnalysisReport[]): number {
  if (!reports || reports.length === 0) return 0;
  
  const uniqueDates = new Set(
    reports.map(r => getReportLocalDateKey(r.date)).filter(Boolean)
  );
  
  const now = new Date();
  const formatDay = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayKey = formatDay(now);
  const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayKey = formatDay(yesterdayDate);

  let currentKey = "";
  if (uniqueDates.has(todayKey)) {
    currentKey = todayKey;
  } else if (uniqueDates.has(yesterdayKey)) {
    currentKey = yesterdayKey;
  } else {
    return 0;
  }

  let streak = 0;
  let checkDate = currentKey === todayKey ? now : yesterdayDate;

  while (uniqueDates.has(formatDay(checkDate))) {
    streak++;
    checkDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate() - 1);
  }

  return streak;
}

