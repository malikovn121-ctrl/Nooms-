import React, { useState } from "react";
import { HealthLog, Medication, Reminder, Pet, AnalysisReport, Group, getHealthScoreColor } from "../types";
import { Plus, Minus, Bell, Check, Droplets, Trophy, Pill, Trash2, X, Clock, ChevronLeft, ChevronRight, Users, XCircle, Heart, MessageSquare, Eye, Paperclip, ArrowUp, ChevronDown, MoreHorizontal, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Reply {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  time: string;
}

interface Message {
  id: string;
  groupId: string;
  authorName: string;
  authorAvatar: string;
  time: string;
  text: string;
  image?: string;
  likes: number;
  likedByMe?: boolean;
  views: number;
  replies: Reply[];
}

interface MetricsGridProps {
  pet: Pet;
  selectedDate: string; // YYYY-MM-DD
  healthLog: HealthLog;
  reminders: Reminder[];
  reportsList?: AnalysisReport[];
  onUpdateLog: (updatedLog: Partial<HealthLog>) => void;
  onAddReminder: (title: string, time: string, type: Reminder["type"]) => void;
  onToggleReminder: (reminderId: string) => void;
  onDeleteReminder: (reminderId: string) => void;
  onUpdateReminder: (reminderId: string, updatedFields: Partial<Reminder>) => void;
  onSelectReport?: (report: AnalysisReport) => void;
  onNavigateToAnalytics?: () => void;
  currentLanguage?: string;
  animateEntrance?: boolean;
}

const ThreePeopleIcon = ({ className = "w-16 h-16 text-black" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="currentColor" 
    className={className}
  >
    <defs>
      <mask id="three-people-mask">
        {/* Fill canvas with white (areas to keep) */}
        <rect x="0" y="0" width="100" height="100" fill="white" />
        {/* Cutout center person head with a gap */}
        <circle cx="50" cy="38" r="14.5" fill="black" />
        {/* Cutout center person body with a gap */}
        <path d="M27 78c0-14 10-22 23-22s23 8 23 22H27z" fill="black" />
      </mask>
    </defs>

    {/* Left and Right Persons underneath with mask applied */}
    <g mask="url(#three-people-mask)">
      {/* Left Person */}
      <circle cx="27" cy="46" r="9" />
      <path d="M11 78c0-10 7-16 16-16s16 6 16 16H11z" />
      
      {/* Right Person */}
      <circle cx="73" cy="46" r="9" />
      <path d="M57 78c0-10 7-16 16-16s16 6 16 16H57z" />
    </g>

    {/* Center Person on top */}
    <circle cx="50" cy="38" r="11" />
    <path d="M31 78c0-12 8.5-19 19-19s19 7 19 19H31z" />
  </svg>
);

const calculateStreak = (reports: AnalysisReport[]): number => {
  if (!reports || reports.length === 0) return 0;
  
  // Extract unique dates formatted as YYYY-MM-DD
  const uniqueDates = Array.from(new Set(reports.map(r => r.date.split("T")[0])));
  
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  
  let startStr = "";
  if (uniqueDates.includes(todayStr)) {
    startStr = todayStr;
  } else if (uniqueDates.includes(yesterdayStr)) {
    startStr = yesterdayStr;
  } else {
    return 0;
  }
  
  let streak = 0;
  let currentDate = startStr;
  
  while (uniqueDates.includes(currentDate)) {
    streak++;
    const d = new Date(currentDate + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    currentDate = d.toISOString().split("T")[0];
  }
  
  return streak;
};

const calculateBestStreak = (reports: AnalysisReport[]): number => {
  if (!reports || reports.length === 0) return 0;
  
  // Extract unique dates sorted in ascending order
  const uniqueDates = Array.from(new Set(reports.map(r => r.date.split("T")[0])))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;
  
  for (const dateStr of uniqueDates) {
    const currentDate = new Date(dateStr + "T00:00:00Z");
    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (24 * 60 * 60 * 1000));
      
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    prevDate = currentDate;
  }
  
  maxStreak = Math.max(maxStreak, currentStreak);
  
  const liveStreak = calculateStreak(reports);
  return Math.max(maxStreak, liveStreak);
};

const getCurrentWeekStatus = (reports: AnalysisReport[], weekDays: string[]) => {
  const today = new Date();
  const currentDay = today.getDay();
  // Distance from Monday
  const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMon);
  
  const scanDates = new Set(reports.map(r => r.date.split("T")[0]));
  
  return weekDays.map((dayName, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    const dateStr = dayDate.toISOString().split("T")[0];
    const hasScan = scanDates.has(dateStr);
    const isToday = dateStr === today.toISOString().split("T")[0];
    
    return {
      name: dayName,
      hasScan,
      isToday,
      dateStr
    };
  });
};

const METRICS_TRANSLATIONS: Record<string, {
  Status: string;
  Streak: string;
  ScanHistory: string;
  NoScansYet: string;
  Reminders: string;
  NoReminders: string;
  AddReminder: string;
  NewReminder: string;
  ChooseTime: string;
  ReminderFor: string;
  Create: string;
  Food: string;
  Walk: string;
  Vet: string;
  Water: string;
  Play: string;
  DrinkingMode: string;
  DrunkToday: string;
  TargetGoal: string;
  Done: string;
  ReduceWater: string;
  Medication: string;
  NewMedicine: string;
  MedicineName: string;
  AddToSchedule: string;
  TodaysSchedule: string;
  NoMeds: string;
  DaysStreak: string;
  WeekDays: string[];
}> = {
  en: {
    Status: "Status",
    Streak: "Streak",
    ScanHistory: "Scan History",
    NoScansYet: "Scans of your pet will be here",
    Reminders: "Reminders",
    NoReminders: "No scheduled reminders",
    AddReminder: "Add Reminder",
    NewReminder: "New Reminder",
    ChooseTime: "Select time",
    ReminderFor: "Reminder for...",
    Create: "Create",
    Food: "Food",
    Walk: "Walk",
    Vet: "Vet",
    Water: "Water",
    Play: "Play",
    DrinkingMode: "Water Intake",
    DrunkToday: "Drunk today",
    TargetGoal: "Recommended daily goal",
    Done: "Done",
    ReduceWater: "Reduce 50 ml",
    Medication: "Medications Intake",
    NewMedicine: "New Medicine",
    MedicineName: "Name",
    AddToSchedule: "Add to schedule",
    TodaysSchedule: "Today's schedule",
    NoMeds: "No medications scheduled for today",
    DaysStreak: "Days Streak",
    WeekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  },
  fr: {
    Status: "Statut",
    Streak: "Série",
    ScanHistory: "Historique",
    NoScansYet: "Les scans de votre animal seront ici",
    Reminders: "Rappels",
    NoReminders: "Aucun rappel prévu",
    AddReminder: "Ajouter un rappel",
    NewReminder: "Nouveau Rappel",
    ChooseTime: "Choisir l'heure",
    ReminderFor: "Rappel pour...",
    Create: "Créer",
    Food: "Nourriture",
    Walk: "Promenade",
    Vet: "Vétérinaire",
    Water: "Eau",
    Play: "Jeux",
    DrinkingMode: "Hydratation",
    DrunkToday: "Bu aujourd'hui",
    TargetGoal: "Objectif quotidien recommandé",
    Done: "Terminé",
    ReduceWater: "Retirer 50 ml",
    Medication: "Médicaments",
    NewMedicine: "Nouveau Médicament",
    MedicineName: "Nom",
    AddToSchedule: "Ajouter au programme",
    TodaysSchedule: "Programme du jour",
    NoMeds: "Aucun médicament prévu aujourd'hui",
    DaysStreak: "Jours de suite",
    WeekDays: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
  },
  de: {
    Status: "Status",
    Streak: "Serie",
    ScanHistory: "Verlauf",
    NoScansYet: "Hier finden Sie die Scans Ihres Haustieres",
    Reminders: "Erinnerungen",
    NoReminders: "Keine Erinnerungen geplant",
    AddReminder: "Erinnerung hinzufügen",
    NewReminder: "Neue Erinnerung",
    ChooseTime: "Zeit wählen",
    ReminderFor: "Erinnerung für...",
    Create: "Erstellen",
    Food: "Futter",
    Walk: "Gassi gehen",
    Vet: "Tierarzt",
    Water: "Wasser",
    Play: "Spielen",
    DrinkingMode: "Wasserbedarf",
    DrunkToday: "Heute getrunken",
    TargetGoal: "Empfohlener Tagesbedarf",
    Done: "Fertig",
    ReduceWater: "-50 ml abziehen",
    Medication: "Medikamente",
    NewMedicine: "Neues Medikament",
    MedicineName: "Name",
    AddToSchedule: "Zum Zeitplan hinzufügen",
    TodaysSchedule: "Zeitplan für heute",
    NoMeds: "Heute keine Medikamente geplant",
    DaysStreak: "Tage in Folge",
    WeekDays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
  },
  es: {
    Status: "Estado",
    Streak: "Racha",
    ScanHistory: "Historial de Análisis",
    NoScansYet: "Los análisis de tu mascota aparecerán aquí",
    Reminders: "Recordatorios",
    NoReminders: "No hay recordatorios programados",
    AddReminder: "Añadir recordatorio",
    NewReminder: "Nuevo Recordatorio",
    ChooseTime: "Seleccionar hora",
    ReminderFor: "Recordatorio para...",
    Create: "Crear",
    Food: "Comida",
    Walk: "Paseo",
    Vet: "Veterinario",
    Water: "Agua",
    Play: "Juegos",
    DrinkingMode: "Consumo de Agua",
    DrunkToday: "Bebido hoy",
    TargetGoal: "Meta recomendada",
    Done: "Listo",
    ReduceWater: "Reducir 50 ml",
    Medication: "Medicamentos",
    NewMedicine: "Nuevo Medicamento",
    MedicineName: "Nombre",
    AddToSchedule: "Añadir a la agenda",
    TodaysSchedule: "Agenda de hoy",
    NoMeds: "No hay medicamentos programados para hoy",
    DaysStreak: "Días Seguidos",
    WeekDays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  },
  it: {
    Status: "Stato",
    Streak: "Serie",
    ScanHistory: "Cronologia Scans",
    NoScansYet: "Le scansioni compariranno qui",
    Reminders: "Promemoria",
    NoReminders: "Nessun promemoria programmato",
    AddReminder: "Aggiungi promemoria",
    NewReminder: "Nuovo Promemoria",
    ChooseTime: "Seleziona orario",
    ReminderFor: "Promemoria per...",
    Create: "Crea",
    Food: "Cibo",
    Walk: "Passeggiata",
    Vet: "Veterinario",
    Water: "Acqua",
    Play: "Giochi",
    DrinkingMode: "Idratazione",
    DrunkToday: "Bevuto oggi",
    TargetGoal: "Obiettivo raccomandato",
    Done: "Fatto",
    ReduceWater: "Riduci 50 ml",
    Medication: "Farmaci",
    NewMedicine: "Nuovo Farmaco",
    MedicineName: "Nome",
    AddToSchedule: "Aggiungi al programma",
    TodaysSchedule: "Programma di oggi",
    NoMeds: "Nessun farmaco programmato per oggi",
    DaysStreak: "Giorni di fila",
    WeekDays: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]
  },
  ja: {
    Status: "ステータス",
    Streak: "継続日数",
    ScanHistory: "スキャン履歴",
    NoScansYet: "ここにペットのスキャン履歴が表示されます",
    Reminders: "リマインダー",
    NoReminders: "予定されているリマインダーはありません",
    AddReminder: "リマインダーを追加",
    NewReminder: "新しいリマインダー",
    ChooseTime: "時間を選択",
    ReminderFor: "リマインダー内容...",
    Create: "作成",
    Food: "ごはん",
    Walk: "お散歩",
    Vet: "病院",
    Water: "お水",
    Play: "遊ぶ",
    DrinkingMode: "水分補給",
    DrunkToday: "今日の水分摂取量",
    TargetGoal: "推奨される目標量",
    Done: "完了",
    ReduceWater: "50 ml 減らす",
    Medication: "お薬の記録",
    NewMedicine: "新しいお薬",
    MedicineName: "薬の名前",
    AddToSchedule: "スケジュールに追加",
    TodaysSchedule: "今日の予定",
    NoMeds: "今日予定されているお薬はありません",
    DaysStreak: "日連続スキャン",
    WeekDays: ["月", "火", "水", "木", "金", "土", "日"]
  },
  ko: {
    Status: "상태",
    Streak: "연속 기록",
    ScanHistory: "분석 내역",
    NoScansYet: "반려동물의 분석 기록이 여기에 표시됩니다",
    Reminders: "알림",
    NoReminders: "예정된 알림이 없습니다",
    AddReminder: "알림 추가",
    NewReminder: "새 알림",
    ChooseTime: "시간 선택",
    ReminderFor: "알림 내용...",
    Create: "생성",
    Food: "사료",
    Walk: "산책",
    Vet: "진료",
    Water: "물",
    Play: "놀이",
    DrinkingMode: "음수량 추적",
    DrunkToday: "오늘 마신 양",
    TargetGoal: "일일 권장량",
    Done: "완료",
    ReduceWater: "50 ml 줄이기",
    Medication: "투약 일지",
    NewMedicine: "새 의약품",
    MedicineName: "약 이름",
    AddToSchedule: "일정에 추가",
    TodaysSchedule: "오늘의 투약 일정",
    NoMeds: "오늘 예정된 투약이 없습니다",
    DaysStreak: "일 연속",
    WeekDays: ["월", "화", "수", "목", "금", "토", "일"]
  },
  zh: {
    Status: "状态",
    Streak: "连续天数",
    ScanHistory: "分析记录",
    NoScansYet: "您宠物的分析记录将显示在这里",
    Reminders: "提醒事项",
    NoReminders: "暂无预设提醒",
    AddReminder: "添加提醒",
    NewReminder: "新建提醒",
    ChooseTime: "选择时间",
    ReminderFor: "提醒内容...",
    Create: "创建",
    Food: "喂食",
    Walk: "遛狗",
    Vet: "看医",
    Water: "喂水",
    Play: "玩耍",
    DrinkingMode: "饮水管理",
    DrunkToday: "今日已饮",
    TargetGoal: "每日推荐目标",
    Done: "完成",
    ReduceWater: "减少 50 ml",
    Medication: "用药管理",
    NewMedicine: "新增药物",
    MedicineName: "药品名称",
    AddToSchedule: "添加到日程",
    TodaysSchedule: "今日用药日程",
    NoMeds: "今日无用药安排",
    DaysStreak: "天连续",
    WeekDays: ["一", "二", "三", "四", "五", "六", "日"]
  },
  "pt-BR": {
    Status: "Status",
    Streak: "Sequência",
    ScanHistory: "Histórico",
    NoScansYet: "Os exames do seu pet aparecerão aqui",
    Reminders: "Lembretes",
    NoReminders: "Sem lembretes agendados",
    AddReminder: "Adicionar lembrete",
    NewReminder: "Novo Lembrete",
    ChooseTime: "Escolher horário",
    ReminderFor: "Lembrete para...",
    Create: "Criar",
    Food: "Comida",
    Walk: "Passeio",
    Vet: "Vet",
    Water: "Água",
    Play: "Brincar",
    DrinkingMode: "Consumo de Água",
    DrunkToday: "Bebido hoje",
    TargetGoal: "Meta recomendada",
    Done: "Pronto",
    ReduceWater: "Reduzir 50 ml",
    Medication: "Medicamentos",
    NewMedicine: "Novo Medicamento",
    MedicineName: "Nome",
    AddToSchedule: "Adicionar ao cronograma",
    TodaysSchedule: "Cronograma de hoje",
    NoMeds: "Nenhum medicamento agendado para hoje",
    DaysStreak: "Dias Seguidos",
    WeekDays: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
  }
};

export default function MetricsGrid({
  pet,
  selectedDate,
  healthLog,
  reminders,
  reportsList = [],
  onUpdateLog,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  onUpdateReminder,
  onSelectReport,
  onNavigateToAnalytics,
  currentLanguage = "en",
  animateEntrance = false,
}: MetricsGridProps) {
  const lang = currentLanguage;
  const t = METRICS_TRANSLATIONS[lang] || METRICS_TRANSLATIONS.en;
  // Active Bottom sheets states
  const [showMedsSheet, setShowMedsSheet] = useState(false);
  const [showRemindersSheet, setShowRemindersSheet] = useState(false);
  const [showWaterSheet, setShowWaterSheet] = useState(false);
  const [showStreakPage, setShowStreakPage] = useState(false);
  const [showStatusPage, setShowStatusPage] = useState(false);
  const [showStatusInfoModal, setShowStatusInfoModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // New Reminders UI States
  const [showNewReminderModal, setShowNewReminderModal] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [pickerHour, setPickerHour] = useState<number>(12);
  const [pickerMinute, setPickerMinute] = useState<number>(30);

  // Groups page and popups states - removed as requested

  // Form states inside sheets
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderType, setNewReminderType] = useState<Reminder["type"]>("food");

  const [newMedName, setNewMedName] = useState("");
  const [newMedTime, setNewMedTime] = useState("");

  const adjustWater = (amount: number) => {
    const updatedWater = Math.max(0, healthLog.waterIntake + amount);
    onUpdateLog({ waterIntake: updatedWater });
  };

  const handleToggleMed = (medId: string) => {
    const updatedMeds = healthLog.medications.map((med) =>
      med.id === medId ? { ...med, completed: !med.completed } : med
    );
    onUpdateLog({ medications: updatedMeds });
  };

  const handleRemoveMed = (medId: string) => {
    const updatedMeds = healthLog.medications.filter((med) => med.id !== medId);
    onUpdateLog({ medications: updatedMeds });
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName) return;

    const newMed: Medication = {
      id: Math.random().toString(36).substring(2, 9),
      name: newMedName,
      time: newMedTime || "12:00",
      completed: false,
    };

    onUpdateLog({ medications: [...healthLog.medications, newMed] });
    setNewMedName("");
    setNewMedTime("");
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle) return;
    onAddReminder(newReminderTitle, newReminderTime || "10:00", newReminderType);
    setNewReminderTitle("");
    setNewReminderTime("");
  };

  // Medication counts
  const totalMeds = healthLog.medications.length;
  const completedMeds = healthLog.medications.filter((m) => m.completed).length;
  const pendingMeds = totalMeds - completedMeds;

  // Check if we have scanning/analysis reports for the active pet
  const hasScans = reportsList && reportsList.length > 0;
  const latestReport = hasScans ? reportsList[0] : null;
  const score = hasScans ? (latestReport?.healthScore ?? 0) : 0;

  // Circular gauge config for Status Ring - Enlarged as requested
  const actRadius = 40;
  const actStroke = 13;
  const actCirc = actRadius * 2 * Math.PI;
  // If not scanned, fill is 0
  const actOffset = hasScans ? (actCirc - (score / 100) * actCirc) : actCirc;

  // Determine circle progress color dynamically based on health score percentage
  const statusRingColor = hasScans ? getHealthScoreColor(score) : "transparent";

  // Calculate consecutive daily analysis streak
  const streak = calculateStreak(reportsList);

  return (
    <div id="metrics-dashboard-grid" className="w-full max-w-md px-2.5 space-y-4 pb-8 select-none">
      
      {/* Two-Column Layout: Activity Ring & Medicines Intake */}
      <motion.div 
        initial={animateEntrance ? { opacity: 0, y: 36, scale: 0.94 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.12 }}
        className="grid grid-cols-2 gap-4"
      >
        
        {/* Left Side: Clean Status Ring Card */}
        <div 
          onClick={() => {
            if (onNavigateToAnalytics) {
              onNavigateToAnalytics();
            } else {
              setShowStatusPage(true);
            }
          }}
          className="bg-white rounded-[2.2rem] p-5 shadow-xs border border-black/[0.02] flex flex-col justify-between min-h-[165px] relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-transform"
        >
          {/* Header on top left in base font */}
          <div className="absolute top-4 left-5">
            <span className="text-lg font-bold text-[#1c1c1e] tracking-tight leading-none">{t.Status}</span>
          </div>

          {/* Progress Ring Graphic - placed cleanly below the title with no overlap */}
          <div className="relative flex items-center justify-center mt-9 pb-1">
            <svg height={actRadius * 2 + actStroke} width={actRadius * 2 + actStroke} className="transform -rotate-90">
              <circle
                className="chart-track-ring stroke-[#E5E5EA] dark:stroke-[#3A3A3C]"
                stroke="#E5E5EA"
                fill="transparent"
                strokeWidth={actStroke}
                r={actRadius}
                cx={actRadius + actStroke/2}
                cy={actRadius + actStroke/2}
              />
              <circle
                stroke={statusRingColor} // Blue when active, transparent/gray when inactive
                fill="transparent"
                strokeWidth={actStroke}
                strokeDasharray={actCirc + " " + actCirc}
                strokeDashoffset={actOffset}
                strokeLinecap="round"
                r={actRadius}
                cx={actRadius + actStroke/2}
                cy={actRadius + actStroke/2}
                className="transition-all duration-500"
              />
            </svg>
            
            {/* Display active status score or '--' if no scans yet in San Francisco font with medium/semi-bold weight */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className={`text-[22px] font-semibold tracking-tight ${hasScans ? "text-[#1c1c1e] dark:text-white" : "text-[#8E8E93] dark:text-[#98989D]"}`}
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
              >
                {hasScans ? `${score}%` : "--"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Streak Card (Tappable to see Streak Details Page) */}
        <div 
          onClick={() => setShowStreakPage(true)}
          className="bg-white rounded-[2.2rem] p-5 shadow-xs border border-black/[0.02] flex flex-col justify-between min-h-[165px] cursor-pointer hover:scale-[1.01] transition-transform relative overflow-hidden"
        >
          {/* Header on top left in base font */}
          <div className="absolute top-4 left-5">
            <span className="text-lg font-bold text-[#1c1c1e] tracking-tight leading-none">{t.Streak}</span>
          </div>

          {/* Flame Graphic and Streak Number - Centered lower down */}
          <div className="relative flex flex-col items-center justify-center mt-9 pb-1">
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Perfect official Tinder flame shape matching attached photo exactly */}
              <svg 
                viewBox="0 0 24 24" 
                className="w-[90px] h-[90px] select-none pointer-events-none" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M9.317 9.451c.045.073.123.12.212.12.06 0 .116-.021.158-.057l.015-.012c.39-.325.741-.66 1.071-1.017 3.209-3.483 1.335-7.759 1.32-7.799-.09-.21-.03-.459.15-.594.195-.135.435-.12.615.033 10.875 10.114 7.995 17.818 7.785 18.337-.87 3.141-4.335 5.414-8.444 5.53-.138.008-.242.008-.363.008-4.852 0-8.977-2.989-8.977-6.807v-.06c0-5.297 4.795-10.522 5.009-10.744.136-.149.345-.195.525-.105.18.076.297.255.291.451-.043 1.036.167 1.935.631 2.7v.015l.002.001z" 
                  fill="#FF8B00"
                />
              </svg>

              {/* Absolutely centered number in Geologica font inside plaque */}
              <div 
                className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 flex items-center justify-center select-none"
                style={{ fontFamily: "'Geologica', sans-serif" }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Outline layer (thick stroke behind) */}
                  <span 
                    className={`font-black tracking-tight text-center select-none ${
                      streak >= 10 ? "text-[36px] leading-none" : "text-[52px] leading-none"
                    }`}
                    style={{ 
                      WebkitTextStroke: "10px #FF8B00",
                      color: "#FF8B00",
                    }}
                  >
                    {streak}
                  </span>
                  {/* Fill layer (pristine white text on top) */}
                  <span 
                    className={`absolute font-black tracking-tight text-center text-white ${
                      streak >= 10 ? "text-[36px] leading-none" : "text-[52px] leading-none"
                    }`}
                  >
                    {streak}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Scans Section */}
      <motion.div 
        initial={animateEntrance ? { opacity: 0, y: 36, scale: 0.94 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.20 }}
        className="w-full flex flex-col space-y-3 pt-1"
      >
        {/* Unboxed Header with text 'Scans' on the left */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[21px] sm:text-[22px] font-bold text-[#1c1c1e] dark:text-white tracking-tight leading-none">
            Scans
          </span>
        </div>

        {/* If no scans done */}
        {!reportsList || reportsList.length === 0 ? (
          <div className="w-full bg-white rounded-[2.2rem] py-12 px-7 shadow-xs border border-black/[0.02] flex items-center justify-center text-center">
            <span className="text-[15px] font-semibold text-zinc-400">
              No scans done
            </span>
          </div>
        ) : (
          /* List of Scan Cards */
          <div className="flex flex-col space-y-3.5">
            {reportsList.map((report) => {
              const scanScore = Math.max(0, Math.min(100, report.healthScore ?? 85));
              const statusColor = getHealthScoreColor(scanScore);

              // Status text based on score
              const getStatusText = (score: number) => {
                if (lang === "ru") {
                  if (score >= 90) return "Отлично";
                  if (score >= 75) return "Хорошо";
                  if (score >= 50) return "Удовлетворительно";
                  return "Требует внимания";
                }
                if (score >= 90) return "Excellent";
                if (score >= 75) return "Good";
                if (score >= 50) return "Moderate";
                return "Needs Attention";
              };
              const statusText = getStatusText(scanScore);

              // Tip connected to the scan situation
              const getScanTip = () => {
                if (report.recommendations && report.recommendations.length > 0 && report.recommendations[0]) {
                  return report.recommendations[0];
                }
                if (report.summary) {
                  return report.summary;
                }
                if (lang === "ru") {
                  if (scanScore >= 90) return "Сохраняйте текущий рацион и активность для поддержания отличной формы.";
                  if (scanScore >= 75) return "Следите за чистой водой в миске и состоянием шерсти.";
                  if (scanScore >= 50) return "Обратите внимание на аппетит и запланируйте профилактический осмотр.";
                  return "Рекомендуется очная консультация с ветеринаром.";
                }
                if (scanScore >= 90) return "Maintain balanced nutrition and playful daily activity.";
                if (scanScore >= 75) return "Ensure fresh drinking water and monitor coat condition.";
                if (scanScore >= 50) return "Keep an eye on daily appetite and plan a routine checkup.";
                return "A consultation with your veterinarian is recommended.";
              };
              const tipContent = getScanTip();

              return (
                <div
                  key={report.id}
                  id={`scan-item-${report.id}`}
                  onClick={() => onSelectReport?.(report)}
                  className="w-full bg-white dark:bg-[#1c1c1e] rounded-[26px] p-2 pl-4 sm:pl-4.5 shadow-xs border border-black/[0.02] flex items-center justify-between cursor-pointer hover:shadow-md active:scale-[0.99] transition-all group min-h-[112px]"
                >
                  {/* Left: General state description in score color and tip */}
                  <div className="flex-1 flex flex-col justify-center pr-3 min-w-0">
                    <span
                      className="text-[18.5px] sm:text-[19.5px] font-bold tracking-tight leading-snug"
                      style={{ color: statusColor }}
                    >
                      {statusText}
                    </span>

                    {/* Subtext: Tip related to the checkup situation */}
                    <p className="text-[12.5px] sm:text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                        {lang === "ru" ? "Совет: " : "Tip: "}
                      </span>
                      {tipContent}
                    </p>
                  </div>

                  {/* Right: Rounded Square Photo with Date badge in bottom-right corner */}
                  <div className="w-[104px] h-[104px] rounded-[18px] overflow-hidden relative flex-shrink-0 bg-zinc-100 border border-black/[0.04]">
                    <img
                      src={report.photo}
                      alt={`Scan ${report.date}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {/* Date badge in bottom-right corner with concentric smooth curvature */}
                    <div className="absolute bottom-1.5 right-1.5 bg-black/65 backdrop-blur-md text-white text-[10px] sm:text-[10.5px] font-medium px-2 py-0.5 rounded-[10px] leading-tight select-none shadow-xs border border-white/10">
                      {(() => {
                        try {
                          const d = new Date(report.date);
                          if (isNaN(d.getTime())) return report.date;
                          return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
                            day: "numeric",
                            month: "short",
                          });
                        } catch {
                          return report.date;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Disclaimer under Scans cards */}
            <p className="text-[12px] sm:text-[12.5px] text-zinc-400 dark:text-zinc-500 leading-relaxed px-1.5 pt-1 text-left select-none">
              {lang === "ru"
                ? "*Приложение помогает выявлять возможные изменения в здоровье раньше благодаря ежедневным фотопроверкам, но результаты ИИ носят исключительно информационный характер и не заменяют консультацию или диагноз ветеринара."
                : "*The app helps detect potential health changes earlier through daily photo check-ups, but AI results are informational only and do not replace veterinary advice or diagnosis."}
            </p>
          </div>
        )}
      </motion.div>

      {/* Slide-Up Bottom Sheet for Medications Manager */}
      <AnimatePresence>
        {showMedsSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
              onClick={() => setShowMedsSheet(false)}
            />
            <motion.div
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.15 }}
              dragSnapToOrigin
              onDragEnd={(_event, info) => {
                if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                  setShowMedsSheet(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-md bg-white rounded-t-[44px] px-6 pt-3 pb-6 shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
              id="medications-bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
              <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white pointer-events-none" />

              {/* iOS Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-black/15 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-red-50 text-[#ff455e] rounded-xl flex items-center justify-center">
                    <Pill size={16} />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1c1c1e]">{t.Medication} ({pet.name})</h3>
                </div>
                <button
                  onClick={() => setShowMedsSheet(false)}
                  className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-black flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  <X size={14} className="text-zinc-600 dark:text-white" />
                </button>
              </div>

              {/* Medication Add form */}
              <form onSubmit={handleAddMed} className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100 space-y-2 mb-4">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">{t.NewMedicine}</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder={t.MedicineName}
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#ff455e]"
                  />
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#ff455e]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#ff455e] text-white font-bold text-xs py-2.5 rounded-full hover:bg-red-600 cursor-pointer text-center"
                >
                  {t.AddToSchedule}
                </button>
              </form>

              {/* List */}
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-2 block">{t.TodaysSchedule} ({selectedDate})</span>
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[220px] pr-1">
                {healthLog.medications.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-6">{t.NoMeds}</p>
                ) : (
                  healthLog.medications.map((med) => (
                    <div key={med.id} className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-150">
                      <button
                        onClick={() => handleToggleMed(med.id)}
                        className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                          med.completed
                            ? "bg-green-500 border-transparent text-white"
                            : "bg-white border-zinc-300 hover:border-zinc-400"
                        }`}
                      >
                        {med.completed && <Check size={14} />}
                      </button>
                      
                      <div className="flex-1 ml-3 flex flex-col">
                        <span className={`text-xs font-bold ${med.completed ? "line-through text-zinc-400" : "text-zinc-800"}`}>
                          {med.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {med.time}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveMed(med.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors p-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-Up Bottom Sheet for Reminders Manager */}
      <AnimatePresence>
        {showRemindersSheet && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
            {/* Smooth fading backdrop dimming and blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
              onClick={() => setShowRemindersSheet(false)}
            />
            
            {/* iOS style spring-loaded slide-up sheet */}
            <motion.div
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.15 }}
              dragSnapToOrigin
              onDragEnd={(_event, info) => {
                if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                  setShowRemindersSheet(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-full max-w-md mx-auto bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] text-black dark:text-white rounded-t-[44px] px-6 pt-3 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.15)] flex flex-col max-h-[85vh] z-10"
              id="reminders-popup"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
              <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

              {/* iOS Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">{t.Reminders}</h3>
                <button
                  onClick={() => setShowRemindersSheet(false)}
                  className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-black flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                >
                  <XCircle size={20} className="text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-white transition-colors" />
                </button>
              </div>

              {/* Reminders List */}
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px] pr-1 mb-6">
                {reminders.length === 0 ? (
                  <p className="text-xs text-zinc-400 dark:text-[#98989D] italic text-center py-10">{t.NoReminders}</p>
                ) : (
                  reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="flex items-center justify-between bg-zinc-50 dark:bg-[#19191B] p-4 rounded-2xl border border-zinc-100/80 dark:border-0 hover:border-zinc-200/60 transition-all duration-200"
                    >
                      <div className="flex-1 flex flex-col gap-0.5">
                        {/* Interactive Editable Time */}
                        <div className="flex items-center">
                          {editingReminderId === rem.id ? (
                            <input
                              type="time"
                              defaultValue={rem.time}
                              autoFocus
                              onBlur={(e) => {
                                if (e.target.value) {
                                  onUpdateReminder(rem.id, { time: e.target.value });
                                }
                                setEditingReminderId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.currentTarget.value) {
                                  onUpdateReminder(rem.id, { time: e.currentTarget.value });
                                  setEditingReminderId(null);
                                } else if (e.key === "Escape") {
                                  setEditingReminderId(null);
                                }
                              }}
                              className="text-base font-extrabold text-[#006AFF] bg-white dark:bg-[#202022] border border-zinc-300 dark:border-white/10 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-[#006AFF]/25 max-w-[90px]"
                            />
                          ) : (
                            <span
                              onClick={() => setEditingReminderId(rem.id)}
                              className="text-base font-extrabold text-[#006AFF] hover:underline cursor-pointer select-none"
                              title="Click to edit time"
                            >
                              {rem.time}
                            </span>
                          )}
                        </div>
                        {/* Task Title */}
                        <span className="text-xs text-zinc-500 dark:text-[#98989D] font-semibold tracking-wide mt-1">
                          {rem.title}
                        </span>
                      </div>

                      {/* Right side: custom toggle switch + delete button */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleReminder(rem.id)}
                          className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-250 ${
                            !rem.completed ? "bg-[#34C759]" : "bg-zinc-200 dark:bg-white/20"
                          }`}
                        >
                          <motion.div
                            layout
                            className="bg-white w-5 h-5 rounded-full shadow-sm"
                            animate={{ x: !rem.completed ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>

                        <button
                          onClick={() => onDeleteReminder(rem.id)}
                          className="text-zinc-300 dark:text-[#98989D] hover:text-red-500 transition-colors p-1.5 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add reminder button */}
              <button
                onClick={() => {
                  const now = new Date();
                  const currentHour = String(now.getHours()).padStart(2, "0");
                  const currentMin = String(now.getMinutes()).padStart(2, "0");
                  setNewReminderTime(`${currentHour}:${currentMin}`);
                  setShowNewReminderModal(true);
                }}
                className="w-full bg-[#006AFF]/10 dark:bg-[#006AFF]/20 hover:bg-[#006AFF]/15 dark:hover:bg-[#006AFF]/30 text-[#006AFF] dark:text-[#5aa0ff] font-extrabold text-sm py-4 rounded-2xl cursor-pointer transition-colors text-center border border-[#006AFF]/10 dark:border-0 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> {t.AddReminder}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-Up Bottom Sheet for New Reminder */}
      <AnimatePresence>
        {showNewReminderModal && (
          <div className="fixed inset-0 z-[60] flex flex-col justify-end overflow-hidden">
            {/* Smooth fading backdrop dimming and blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
              onClick={() => setShowNewReminderModal(false)}
            />
            
            {/* iOS style spring-loaded slide-up sheet */}
            <motion.div
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.15 }}
              dragSnapToOrigin
              onDragEnd={(_event, info) => {
                if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                  setShowNewReminderModal(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-full max-w-md mx-auto bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] text-black dark:text-white rounded-t-[44px] px-6 pt-3 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.15)] flex flex-col z-10"
              id="new-reminder-popup"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
              <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

              {/* iOS Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-2xl font-extrabold text-black dark:text-white tracking-tight">{t.NewReminder}</h3>
                <button
                  onClick={() => setShowNewReminderModal(false)}
                  className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-black flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                >
                  <XCircle size={20} className="text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-white transition-colors" />
                </button>
              </div>

              {/* Native Apple-like Time Selector */}
              <div className="flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#19191B] py-4 px-6 rounded-[2rem] border border-zinc-100 dark:border-0 mb-4 w-full">
                <span className="text-[11px] font-bold text-zinc-400 dark:text-[#98989D] uppercase tracking-wider mb-2">{t.ChooseTime}</span>
                <input
                  type="time"
                  value={newReminderTime}
                  onChange={(e) => setNewReminderTime(e.target.value)}
                  className="text-2xl font-extrabold text-black dark:text-white bg-white dark:bg-[#202022] border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 rounded-2xl px-6 py-3.5 text-center w-full select-none cursor-pointer"
                />
              </div>

              {/* Quick suggestions/chips ABOVE input field */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    { label: t.Food, type: "food", icon: "🥩" },
                    { label: t.Walk, type: "walk", icon: "🐕" },
                    { label: t.Vet, type: "vet", icon: "🏥" },
                    { label: t.Water, type: "water", icon: "💧" },
                    { label: t.Play, type: "walk", icon: "🧸" },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setNewReminderTitle(chip.label);
                        setNewReminderType(chip.type as Reminder["type"]);
                      }}
                      className={`transition-all text-xs font-bold px-3.5 py-1.5 rounded-full cursor-pointer ${
                        newReminderTitle === chip.label
                          ? "bg-[#006AFF] text-white"
                          : "bg-zinc-100 dark:bg-[#19191B] text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#242426]"
                      }`}
                    >
                      {chip.icon} {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* TextInput Form with placeholder */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    placeholder={t.ReminderFor}
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                    className="w-full text-sm font-semibold bg-zinc-50 dark:bg-[#19191B] border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 rounded-2xl px-4 py-3.5 transition-all text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#98989D]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newReminderTitle) return;
                    onAddReminder(newReminderTitle, newReminderTime || "12:00", newReminderType);
                    setNewReminderTitle("");
                    setShowNewReminderModal(false);
                  }}
                  className="w-full bg-[#006AFF] hover:bg-[#0057d1] text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-[#006AFF]/20 cursor-pointer transition-colors text-center block"
                >
                  {t.Create}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-Up Bottom Sheet for Water Tracker */}
      <AnimatePresence>
        {showWaterSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
              onClick={() => setShowWaterSheet(false)}
            />
            <motion.div
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.15 }}
              dragSnapToOrigin
              onDragEnd={(_event, info) => {
                if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                  setShowWaterSheet(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-md bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] text-black dark:text-white rounded-t-[44px] px-6 pt-3 pb-6 shadow-2xl relative z-10 flex flex-col"
              id="water-bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
              <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

              {/* iOS Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-blue-50 dark:bg-[#5856d6]/20 text-[#5856d6] dark:text-[#7d7aff] rounded-xl flex items-center justify-center">
                    <Droplets size={16} />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1c1c1e] dark:text-white">{t.DrinkingMode} ({pet.name})</h3>
                </div>
                <button
                  onClick={() => setShowWaterSheet(false)}
                  className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-black flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  <X size={14} className="text-zinc-600 dark:text-white" />
                </button>
              </div>

              <div className="bg-zinc-50 dark:bg-[#19191B] p-5 rounded-2xl border border-zinc-100 dark:border-0 flex flex-col items-center justify-center text-center space-y-2 mb-6">
                <span className="text-xs text-zinc-400 dark:text-[#98989D] font-bold uppercase tracking-wider">{t.DrunkToday}</span>
                <span className="text-4xl font-black text-zinc-800 dark:text-white font-mono">{healthLog.waterIntake} ml</span>
                <span className="text-[11px] text-zinc-400 dark:text-[#98989D] font-semibold">{t.TargetGoal}: {healthLog.waterTarget} ml</span>
              </div>

              {/* Increments buttons */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => adjustWater(50)}
                  className="bg-zinc-50 dark:bg-[#19191B] hover:bg-zinc-100 dark:hover:bg-[#252528] border border-zinc-150 dark:border-0 py-3 rounded-2xl font-bold text-xs text-[#5856d6] dark:text-[#7d7aff] cursor-pointer"
                >
                  +50 ml
                </button>
                <button
                  onClick={() => adjustWater(100)}
                  className="bg-zinc-50 dark:bg-[#19191B] hover:bg-zinc-100 dark:hover:bg-[#252528] border border-zinc-150 dark:border-0 py-3 rounded-2xl font-bold text-xs text-[#5856d6] dark:text-[#7d7aff] cursor-pointer"
                >
                  +100 ml
                </button>
                <button
                  onClick={() => adjustWater(250)}
                  className="bg-[#5856d6] hover:bg-[#4745c4] py-3 rounded-2xl font-bold text-xs text-white cursor-pointer"
                >
                  +250 ml
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => adjustWater(-50)}
                  className="flex-1 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 py-3 rounded-2xl font-bold text-xs cursor-pointer text-center"
                >
                  {t.ReduceWater}
                </button>
                <button
                  onClick={() => setShowWaterSheet(false)}
                  className="flex-1 bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/20 text-zinc-600 dark:text-white py-3 rounded-2xl font-bold text-xs cursor-pointer text-center"
                >
                  {t.Done}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Streak Page Overlay (Clean Light iOS Theme) */}
      <AnimatePresence>
        {showStreakPage && (
          <motion.div
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.15 }}
            dragSnapToOrigin
            onDragEnd={(_event, info) => {
              if (info.offset.y > 80 || (info.velocity.y > 200 && info.offset.y > 20)) {
                setShowStreakPage(false);
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 bg-[#F8F9FA] dark:bg-black z-[100] flex flex-col justify-between p-6 pt-3 overflow-y-auto select-none text-[#1c1c1e] dark:text-white"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
          >
            {/* iOS Drag Handle */}
            <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-2 flex-shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Header */}
            <div className="flex items-center justify-between w-full pt-1 relative">
              <button
                onClick={() => setShowStreakPage(false)}
                className="w-12 h-12 rounded-full bg-white dark:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-0 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer flex-shrink-0 z-10"
                title="Close"
              >
                <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
              </button>
              
              <span className="text-xl font-bold text-[#1c1c1e] dark:text-white tracking-tight absolute inset-x-0 text-center pointer-events-none">
                {t.Streak}
              </span>
              
              {/* Invisible spacer to maintain symmetry */}
              <div className="w-12 h-12 invisible flex-shrink-0" />
            </div>

            {/* Flame Content: Centered Tinder flame shape */}
            <div className="flex flex-col items-center justify-center my-auto py-6">
              <div className="relative flex items-center justify-center w-[250px] h-[250px]">
                {/* Tinder Flame Shape in vivid orange */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-[280px] h-[280px] select-none pointer-events-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.317 9.451c.045.073.123.12.212.12.06 0 .116-.021.158-.057l.015-.012c.39-.325.741-.66 1.071-1.017 3.209-3.483 1.335-7.759 1.32-7.799-.09-.21-.03-.459.15-.594.195-.135.435-.12.615.033 10.875 10.114 7.995 17.818 7.785 18.337-.87 3.141-4.335 5.414-8.444 5.53-.138.008-.242.008-.363.008-4.852 0-8.977-2.989-8.977-6.807v-.06c0-5.297 4.795-10.522 5.009-10.744.136-.149.345-.195.525-.105.18.076.297.255.291.451-.043 1.036.167 1.935.631 2.7v.015l.002.001z"
                    fill="#FF8B00"
                  />
                </svg>

                {/* Real-time solid overlapping layered numbers scaled up */}
                <div 
                  className="absolute bottom-[24px] left-1/2 -translate-x-1/2 flex items-center justify-center select-none"
                  style={{ fontFamily: "'Geologica', sans-serif" }}
                >
                  {/* Outline layer (thick stroke behind) */}
                  <span 
                    className={`font-black tracking-tight text-center select-none ${
                      streak >= 10 ? "text-[82px] leading-none" : "text-[112px] leading-none"
                    }`}
                    style={{ 
                      WebkitTextStroke: "16px #FF8B00",
                      color: "#FF8B00"
                    }}
                  >
                    {streak}
                  </span>
                  {/* Fill layer (pristine white text on top) */}
                  <span 
                    className={`absolute font-black tracking-tight text-center text-white ${
                      streak >= 10 ? "text-[82px] leading-none" : "text-[112px] leading-none"
                    }`}
                  >
                    {streak}
                  </span>
                </div>
              </div>
              
              {/* Title & Guidance note */}
              <div className="mt-6 text-center max-w-sm px-4">
                <h2 className="text-[28px] font-bold text-[#1c1c1e] dark:text-white tracking-tight leading-tight">
                  {t.DaysStreak}
                </h2>
                <p className="text-[14px] font-medium text-zinc-500 dark:text-[#98989D] mt-2 leading-relaxed">
                  {lang === "fr" ? "Vérifiez votre animal avec Pet AI chaque jour pour prolonger votre série" : lang === "de" ? "Scannen Sie Ihr Haustier täglich mit Pet AI, um Ihre Serie fortzusetzen" : lang === "es" ? "Analiza a tu mascota con Pet AI todos los días para aumentar tu racha" : lang === "it" ? "Controlla il tuo animale con Pet AI ogni giorno per aumentare la tua serie" : lang === "ja" ? "毎日Pet AIでペットをスキャンして継続日数を伸ばしましょう" : lang === "ko" ? "매일 Pet AI로 반려동물을 확인하고 연속 기록을 늘려보세요" : lang === "zh" ? "每天使用 Pet AI 检查宠物，保持您的连续天数" : lang === "pt-BR" ? "Analise seu pet com o Pet AI todos os dias para aumentar sua sequência" : "Check your pet with Pet AI every day to build your streak"}
                </p>
              </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="w-full space-y-4 max-w-sm mx-auto">
              
              {/* Two Stats/Milestones Cards Side by Side */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Next Milestone Box */}
                <div className="bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] rounded-[2rem] p-5 flex flex-col items-center justify-center text-center border border-black/[0.03] dark:border-0 shadow-xs dark:shadow-none" style={{ fontFamily: "'Geologica', sans-serif" }}>
                  <span className="text-[30px] font-black text-[#1c1c1e] dark:text-white leading-none">
                    {lang === "fr" ? "7 jours" : lang === "de" ? "7 Tage" : lang === "es" ? "7 días" : lang === "it" ? "7 giorni" : lang === "ja" ? "7日間" : lang === "ko" ? "7일" : lang === "zh" ? "7天" : lang === "pt-BR" ? "7 dias" : "7 days"}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 dark:text-[#98989D] mt-1.5 leading-tight">
                    {lang === "fr" ? "Prochain objectif" : lang === "de" ? "Nächstes Ziel" : lang === "es" ? "Próximo objetivo" : lang === "it" ? "Prossimo traguardo" : lang === "ja" ? "次の目標" : lang === "ko" ? "다음 마일스톤" : lang === "zh" ? "下个里程碑" : lang === "pt-BR" ? "Próximo Marco" : "Next Milestone"}
                  </span>
                </div>

                {/* Best Streak Box (dynamic) */}
                <div className="bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] rounded-[2rem] p-5 flex flex-col items-center justify-center text-center border border-black/[0.03] dark:border-0 shadow-xs dark:shadow-none" style={{ fontFamily: "'Geologica', sans-serif" }}>
                  <span className="text-[30px] font-black text-[#1c1c1e] dark:text-white leading-none">
                    {calculateBestStreak(reportsList)} {lang === "fr" ? "jours" : lang === "de" ? "Tage" : lang === "es" ? "días" : lang === "it" ? "giorni" : lang === "ja" ? "日" : lang === "ko" ? "일" : lang === "zh" ? "天" : lang === "pt-BR" ? "dias" : "days"}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 dark:text-[#98989D] mt-1.5 leading-tight">
                    {lang === "fr" ? "Meilleure série" : lang === "de" ? "Beste Serie" : lang === "es" ? "Mejor racha" : lang === "it" ? "Miglior serie" : lang === "ja" ? "ベスト継続日数" : lang === "ko" ? "최고 연속 기록" : lang === "zh" ? "最佳连续" : lang === "pt-BR" ? "Melhor Sequência" : "Best Streak"}
                  </span>
                </div>
              </div>

              {/* Share Streak Pill Button */}
              <button
                onClick={() => {
                  const shareText = lang === "fr"
                    ? `J'ai gardé ma série de soins pour animaux pendant ${streak} jours dans PetAI! 🔥`
                    : lang === "de"
                    ? `Ich habe meine Haustierpflege-Serie seit ${streak} Tagen in PetAI gehalten! 🔥`
                    : lang === "es"
                    ? `¡He mantenido mi racha de cuidado de mascotas durante ${streak} días en PetAI! 🔥`
                    : lang === "it"
                    ? `Ho mantenuto la mia serie di cura degli animali per ${streak} giorni in PetAI! 🔥`
                    : lang === "ja"
                    ? `PetAIでペットのお世話を${streak}日間継続中！🔥`
                    : lang === "ko"
                    ? `PetAI에서 반려동물 케어 기록을 ${streak}일 동안 연속 유지 중입니다! 🔥`
                    : lang === "zh"
                    ? `我已经在 PetAI 连续照看宠物达 ${streak} 天！🔥`
                    : lang === "pt-BR"
                    ? `Mantive minha sequência de cuidados com meu pet por ${streak} dias no PetAI! 🔥`
                    : `I have kept my pet care streak for ${streak} days in PetAI! 🔥`;

                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareText);
                    setCopiedToast("Streak copied to clipboard!");
                    setTimeout(() => setCopiedToast(null), 2400);
                  } else {
                    setCopiedToast(shareText);
                    setTimeout(() => setCopiedToast(null), 3200);
                  }
                }}
                className="w-full bg-[#18181B] dark:bg-white text-white dark:text-black font-bold text-[16px] py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 stroke-[2.4px] text-white dark:text-black fill-none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {lang === "fr" ? "Partager la série" : lang === "de" ? "Serie teilen" : lang === "es" ? "Compartir racha" : lang === "it" ? "Condividi serie" : lang === "ja" ? "記録をシェアする" : lang === "ko" ? "기록 공유하기" : lang === "zh" ? "分享连续天数" : lang === "pt-BR" ? "Compartilhar Sequência" : "Share Streak"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Status Page Overlay (Clean Light iOS Theme) */}
      <AnimatePresence>
        {showStatusPage && (
          <motion.div
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.15 }}
            dragSnapToOrigin
            onDragEnd={(_event, info) => {
              if (info.offset.y > 80 || (info.velocity.y > 200 && info.offset.y > 20)) {
                setShowStatusPage(false);
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 bg-[#F8F9FA] dark:bg-black z-[100] flex flex-col justify-between p-6 pt-3 overflow-y-auto select-none text-[#1c1c1e] dark:text-white"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif' }}
          >
            {/* iOS Drag Handle */}
            <div className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-2 flex-shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Header */}
            <div className="flex items-center justify-between w-full pt-1 relative">
              <button
                onClick={() => setShowStatusPage(false)}
                className="w-12 h-12 rounded-full bg-white dark:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-0 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer flex-shrink-0 z-10"
                title="Close"
              >
                <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
              </button>
              
              <span className="text-xl font-bold text-[#1c1c1e] dark:text-white tracking-tight absolute inset-x-0 text-center pointer-events-none">
                {t.Status}
              </span>
              
              <button
                onClick={() => setShowStatusInfoModal(true)}
                className="w-12 h-12 rounded-full bg-white dark:bg-[#1C1C1E] shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-0 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-[#242426] active:scale-95 transition-all cursor-pointer flex-shrink-0 z-10"
                title="Information"
              >
                <Info className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
              </button>
            </div>

            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center justify-center my-auto py-6">
              <div className="relative flex items-center justify-center w-[240px] h-[240px]">
                <svg height={240} width={240} className="transform -rotate-90">
                  {/* Track circle */}
                  <circle
                    className="chart-track-ring stroke-[#E5E5EA] dark:stroke-[#3A3A3C]"
                    stroke="#E5E5EA"
                    fill="transparent"
                    strokeWidth={16}
                    r={95}
                    cx={120}
                    cy={120}
                  />
                  {/* Progress arc */}
                  <circle
                    stroke={hasScans ? getHealthScoreColor(score) : "transparent"}
                    fill="transparent"
                    strokeWidth={16}
                    strokeDasharray={95 * 2 * Math.PI}
                    strokeDashoffset={hasScans ? (95 * 2 * Math.PI - (score / 100) * (95 * 2 * Math.PI)) : 95 * 2 * Math.PI}
                    strokeLinecap="round"
                    r={95}
                    cx={120}
                    cy={120}
                    className="transition-all duration-500"
                  />
                </svg>

                {/* Giant center number/percentage */}
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center select-none"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", sans-serif' }}
                >
                  <span className="text-[96px] font-black leading-none text-[#1c1c1e] dark:text-white tracking-tighter">
                    {hasScans ? score : "--"}
                  </span>
                  {hasScans && (
                    <span className="text-xs font-bold text-zinc-400 dark:text-[#98989D] mt-1 uppercase tracking-widest">
                      score
                    </span>
                  )}
                </div>
              </div>

              {/* Status Title & Description below the circle */}
              <div className="mt-7 text-center max-w-sm px-4">
                <h2 className="text-[28px] font-bold text-[#1c1c1e] dark:text-white tracking-tight leading-tight">
                  {(() => {
                    if (!hasScans) return "Waiting for scan";
                    if (score >= 90) return "Excellent";
                    if (score >= 75) return "Healthy";
                    if (score >= 60) return "Moderate";
                    return "Needs Attention";
                  })()}
                </h2>
                <p className="text-[14px] font-medium text-zinc-500 dark:text-[#98989D] mt-2 leading-relaxed">
                  {(() => {
                    if (!hasScans) {
                      return "Scan your pet's health with a photo to see a detailed status report.";
                    }
                    if (latestReport?.summary) return latestReport.summary;
                    if (score >= 90) {
                      return "All health indicators of your pet are in excellent condition. Regular checks help identify changes early.";
                    }
                    if (score >= 75) {
                      return "Your pet's health indicators are within the normal range. Continue regular care and balanced nutrition.";
                    }
                    if (score >= 60) {
                      return "Overall health is satisfactory. There are minor remarks regarding hydration or activity levels.";
                    }
                    return "It is recommended to pay extra attention to your pet's health and review our recommendations.";
                  })()}
                </p>
              </div>
            </div>

            {/* Bottom Section: Two Cards side-by-side and a full-width share button */}
            <div className="w-full space-y-4 max-w-sm mx-auto">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Left Card: Days Streak */}
                <div className="bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] rounded-[2rem] p-5 flex flex-col items-center justify-center text-center border border-black/[0.03] dark:border-0 shadow-xs dark:shadow-none" style={{ fontFamily: "'Geologica', sans-serif" }}>
                  <span className="text-[30px] font-black text-[#1c1c1e] dark:text-white leading-none">
                    {streak}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 dark:text-[#98989D] mt-1.5 leading-tight">
                    Days Streak
                  </span>
                </div>

                {/* Right Card: Total Scans */}
                <div className="bg-white dark:bg-gradient-to-b dark:from-[#202022] dark:to-[#1C1C1E] rounded-[2rem] p-5 flex flex-col items-center justify-center text-center border border-black/[0.03] dark:border-0 shadow-xs dark:shadow-none" style={{ fontFamily: "'Geologica', sans-serif" }}>
                  <span className="text-[30px] font-black text-[#1c1c1e] dark:text-white leading-none">
                    {reportsList.length}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 dark:text-[#98989D] mt-1.5 leading-tight">
                    Total Scans
                  </span>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={() => {
                  const shareText = `My pet health score is ${hasScans ? `${score}%` : "Pending"}! Streak: ${streak} days. Scan your pet too with Pet AI! 🐾`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareText);
                    setCopiedToast("Health status copied to clipboard!");
                    setTimeout(() => setCopiedToast(null), 2400);
                  } else {
                    setCopiedToast(shareText);
                    setTimeout(() => setCopiedToast(null), 3200);
                  }
                }}
                className="w-full bg-[#18181B] dark:bg-white text-white dark:text-black font-bold text-[16px] py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 stroke-[2.4px] text-white dark:text-black fill-none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Share
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Information Modal Popup */}
      <AnimatePresence>
        {showStatusInfoModal && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center select-none overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setShowStatusInfoModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.15 }}
              dragSnapToOrigin
              onDragEnd={(_event, info) => {
                if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                  setShowStatusInfoModal(false);
                }
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[44px] px-6 pt-3 pb-8 shadow-2xl border border-black/5 dark:border-white/10 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
              <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

              {/* iOS Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Health Score Status</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">How your pet's score is computed</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatusInfoModal(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-zinc-900 dark:text-white">Current Score</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{hasScans ? `${score}%` : "Pending scan"}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    This overall score reflects physical tone, ocular alertness, and coat condition from photo analysis combined with logged daily habits.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-bold">90–100%: Excellent</span>
                    <p className="text-[11px] opacity-80 mt-0.5">Optimal vitality & alertness</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                    <span className="font-bold">75–89%: Healthy</span>
                    <p className="text-[11px] opacity-80 mt-0.5">Normal baseline condition</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30">
                    <span className="font-bold">50–74%: Attention</span>
                    <p className="text-[11px] opacity-80 mt-0.5">Minor fatigue or signs</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30">
                    <span className="font-bold">&lt; 50%: Vet Visit</span>
                    <p className="text-[11px] opacity-80 mt-0.5">Clinical checkup advised</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowStatusInfoModal(false)}
                className="mt-5 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Copied Toast */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] px-4 py-2.5 bg-zinc-900/90 dark:bg-white/90 text-white dark:text-black text-sm font-medium rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 pointer-events-none"
          >
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{copiedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>


      
    </div>
  );
}
