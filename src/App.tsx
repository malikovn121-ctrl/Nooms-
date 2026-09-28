import React, { useState, useEffect, useRef } from "react";
import { Pet, HealthLog, Reminder, AnalysisReport, Medication } from "./types";
import CalendarSlider from "./components/CalendarSlider";
import PetScanner from "./components/PetScanner";
import MetricsGrid from "./components/MetricsGrid";
import AnalysisReportModal from "./components/AnalysisReportModal";
import AddPetModal from "./components/AddPetModal";
import CameraView from "./components/CameraView";
import GroupsView from "./components/GroupsView";
import ProgressView from "./components/ProgressView";
import SettingsView from "./components/SettingsView";
import FloatingBottomNav, { NavTabId } from "./components/FloatingBottomNav";
import AppleActionSheet from "./components/AppleActionSheet";
import AddPetQuizModal from "./components/AddPetQuizModal";
import PaywallScreen from "./components/PaywallScreen";
import { Sparkles, Heart, Activity, ClipboardList, ShieldAlert, Check, Bell, Camera, X, XCircle, ChevronLeft, Users, Stethoscope, Settings, Globe, ChevronRight, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import catImg from "./assets/images/candid_cat_snap_1785492300647.jpg";
import dogImg from "./assets/images/candid_dog_framed_1785492882790.jpg";
import parrotImg from "./assets/images/candid_parrot_snap_1785492340213.jpg";
import petAiLogo from "./assets/images/pet_ai_logo.svg";
import profileIcon from "./assets/images/profile_icon.svg";
import onboardingPetsImg from "./assets/images/onboarding_pets_v4_1784287396849.jpg";
import phoneSnapDogImg from "./assets/images/candid_dog_framed_1785492882790.jpg";
import phoneSnapCatImg from "./assets/images/candid_cat_snap_1785492300647.jpg";
import phoneSnapRabbitImg from "./assets/images/candid_rabbit_snap_1785492315316.jpg";
import phoneSnapRodentImg from "./assets/images/candid_hamster_snap_1785492326254.jpg";
import phoneSnapBirdImg from "./assets/images/candid_parrot_snap_1785492340213.jpg";
import phoneSnapReptileImg from "./assets/images/candid_turtle_snap_1785492353236.jpg";
import phoneSnapUnicornImg from "./assets/images/candid_unicorn_snap_1785492366270.jpg";

// Default standard pets with photorealistic custom generated assets
const DEFAULT_PETS: Pet[] = [
  {
    id: "cat",
    name: "Мурзик",
    type: "cat",
    species: "Cat",
    emoji: "🐱",
    image: catImg,
    breed: "Шотландская вислоухая",
    age: "1-3",
    sex: "Male",
    weight: "4.2 кг",
  },
  {
    id: "dog",
    name: "Рекс",
    type: "dog",
    species: "Dog",
    emoji: "🐶",
    image: dogImg,
    breed: "Джек-рассел терьер",
    age: "1-3",
    sex: "Male",
    weight: "6.8 кг",
  },
  {
    id: "parrot",
    name: "Кеша",
    type: "parrot",
    species: "Bird",
    emoji: "🐦",
    image: parrotImg,
    breed: "Волнистый попугай",
    age: "Under 1",
    sex: "Male",
    weight: "35 г",
  },
];

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "pt-BR", name: "Português", flag: "🇧🇷" },
];

const TRANSLATIONS: Record<string, {
  ScanTitle: string;
  TrackTitle: string;
  GetStarted: string;
  AlreadyAccount: string;
  SignIn: string;
  Language: string;
  AnalyzeButton: string;
  StatusTitle: string;
  StreakTitle: string;
  WaterTitle: string;
  RemindersTitle: string;
  MedsTitle: string;
  ShowOnboardingButton: string;
  Continue: string;
}> = {
  ru: {
    ScanTitle: "Сканируйте питомца ежедневно —",
    TrackTitle: "Отслеживайте его здоровье.",
    GetStarted: "Начать работу",
    AlreadyAccount: "Уже есть аккаунт? ",
    SignIn: "Войти",
    Language: "Язык",
    AnalyzeButton: "Проверить питомца",
    StatusTitle: "Статус",
    StreakTitle: "Серия",
    WaterTitle: "Вода",
    RemindersTitle: "Напоминания",
    MedsTitle: "Лекарства",
    ShowOnboardingButton: "Показать экран приветствия",
    Continue: "Продолжить"
  },
  en: {
    ScanTitle: "Scan Your Pet Daily —",
    TrackTitle: "Track Their Health.",
    GetStarted: "Get started",
    AlreadyAccount: "Already have an account? ",
    SignIn: "Sign in",
    Language: "Language",
    AnalyzeButton: "Check Pet",
    StatusTitle: "Status",
    StreakTitle: "Streak",
    WaterTitle: "Water",
    RemindersTitle: "Reminders",
    MedsTitle: "Meds",
    ShowOnboardingButton: "Show welcome screen",
    Continue: "Continue"
  },
  fr: {
    ScanTitle: "Analysez votre animal au quotidien —",
    TrackTitle: "Suivez sa santé.",
    GetStarted: "Commencer",
    AlreadyAccount: "Vous avez déjà un compte ? ",
    SignIn: "Se connecter",
    Language: "Langue",
    AnalyzeButton: "Scanner",
    StatusTitle: "Statut",
    StreakTitle: "Série",
    WaterTitle: "Eau",
    RemindersTitle: "Rappels",
    MedsTitle: "Médocs",
    ShowOnboardingButton: "Afficher l'onboarding",
    Continue: "Continuer"
  },
  de: {
    ScanTitle: "Scanne dein Haustier täglich —",
    TrackTitle: "Verfolge seine Gesundheit.",
    GetStarted: "Loslegen",
    AlreadyAccount: "Hast du bereits ein Konto? ",
    SignIn: "Anmelden",
    Language: "Sprache",
    AnalyzeButton: "Scannen",
    StatusTitle: "Status",
    StreakTitle: "Serie",
    WaterTitle: "Wasser",
    RemindersTitle: "Erinnerungen",
    MedsTitle: "Medis",
    ShowOnboardingButton: "Willkommensbildschirm zeigen",
    Continue: "Weiter"
  },
  es: {
    ScanTitle: "Escanea a tu mascota a diario —",
    TrackTitle: "Sigue su salud.",
    GetStarted: "Empezar",
    AlreadyAccount: "¿Ya tienes una cuenta? ",
    SignIn: "Iniciar sesión",
    Language: "Idioma",
    AnalyzeButton: "Escanear",
    StatusTitle: "Estado",
    StreakTitle: "Racha",
    WaterTitle: "Agua",
    RemindersTitle: "Recordatorios",
    MedsTitle: "Medicina",
    ShowOnboardingButton: "Mostrar pantalla de bienvenida",
    Continue: "Continuar"
  },
  it: {
    ScanTitle: "Scansiona il tuo animale ogni giorno —",
    TrackTitle: "Monitora la sua salute.",
    GetStarted: "Inizia",
    AlreadyAccount: "Hai già un account? ",
    SignIn: "Accedi",
    Language: "Lingua",
    AnalyzeButton: "Scansiona",
    StatusTitle: "Stato",
    StreakTitle: "Serie",
    WaterTitle: "Acqua",
    RemindersTitle: "Rappelli",
    MedsTitle: "Farmaci",
    ShowOnboardingButton: "Mostra schermata iniziale",
    Continue: "Continua"
  },
  ja: {
    ScanTitle: "ペットを毎日スキャン —",
    TrackTitle: "健康状態を追跡します。",
    GetStarted: "始める",
    AlreadyAccount: "すでにアカウントをお持ちですか？ ",
    SignIn: "サインイン",
    Language: "言語",
    AnalyzeButton: "スキャン",
    StatusTitle: "ステータス",
    StreakTitle: "継続日数",
    WaterTitle: "水分補給",
    RemindersTitle: "リマインダー",
    MedsTitle: "お薬",
    ShowOnboardingButton: "初期画面を表示する",
    Continue: "続行"
  },
  ko: {
    ScanTitle: "반려동물을 매일 스캔하세요 —",
    TrackTitle: "건강을 추적하세요.",
    GetStarted: "시작하기",
    AlreadyAccount: "이미 계정이 있으신가요? ",
    SignIn: "로그인",
    Language: "언어",
    AnalyzeButton: "스캔",
    StatusTitle: "상태",
    StreakTitle: "스트릭",
    WaterTitle: "음수량",
    RemindersTitle: "알림",
    MedsTitle: "투약",
    ShowOnboardingButton: "웰컴 화면 표시",
    Continue: "계속"
  },
  zh: {
    ScanTitle: "每天扫描您的宠物 —",
    TrackTitle: "追踪它们的健康。",
    GetStarted: "开始",
    AlreadyAccount: "已经有账户了？ ",
    SignIn: "登录",
    Language: "语言",
    AnalyzeButton: "扫描",
    StatusTitle: "健康状态",
    StreakTitle: "连续打卡",
    WaterTitle: "饮水量",
    RemindersTitle: "日程提醒",
    MedsTitle: "用药记录",
    ShowOnboardingButton: "显示欢迎界面",
    Continue: "继续"
  },
  "pt-BR": {
    ScanTitle: "Escaneie seu pet diariamente —",
    TrackTitle: "Acompanhe a saúde dele.",
    GetStarted: "Começar",
    AlreadyAccount: "Já tem uma conta? ",
    SignIn: "Entrar",
    Language: "Idioma",
    AnalyzeButton: "Analisar",
    StatusTitle: "Status",
    StreakTitle: "Série",
    WaterTitle: "Água",
    RemindersTitle: "Alarmes",
    MedsTitle: "Remédios",
    ShowOnboardingButton: "Mostrar tela de boas-vindas",
    Continue: "Continuar"
  }
};

function DigitSlot({ digit }: { digit: string; key?: React.Key }) {
  return (
    <div className="relative inline-flex items-center justify-center w-[40px] sm:w-[46px] h-[80px] sm:h-[92px] text-[68px] sm:text-[76px] font-extrabold tracking-tight text-black leading-none select-none overflow-visible">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: -46, opacity: 0, filter: "blur(20px)", scale: 0.9 }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ y: 42, opacity: 0, filter: "blur(0px)", scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 14,
            mass: 0.5,
          }}
          className="absolute inset-0 flex items-center justify-center text-[68px] sm:text-[76px] font-extrabold tracking-tight text-black leading-none select-none"
          style={{
            fontVariantNumeric: "tabular-nums",
            willChange: "transform, opacity, filter",
          }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function AnimatedBlurNumber({ value }: { value: number }) {
  const digits = String(value).split("");
  const total = digits.length;

  return (
    <div className="relative inline-flex items-baseline justify-center select-none py-2 px-1 overflow-visible">
      <div className="relative flex items-center justify-center gap-1 h-[80px] sm:h-[92px] overflow-visible">
        {digits.map((d, idx) => {
          const positionFromRight = total - 1 - idx;
          return <DigitSlot key={positionFromRight} digit={d} />;
        })}
      </div>
      <span
        className="text-[68px] sm:text-[76px] font-extrabold tracking-tight text-black leading-none ml-1.5 self-center select-none"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        %
      </span>
    </div>
  );
}

function SliderBlurNumber({ value }: { value: number }) {
  const digits = String(value).split("");
  const total = digits.length;

  return (
    <div className="relative inline-flex items-center justify-center select-none overflow-visible h-[36px]">
      <div className="relative flex items-center justify-center gap-[1.5px] h-[36px] overflow-visible">
        {digits.map((d, idx) => {
          const positionFromRight = total - 1 - idx;
          return (
            <div
              key={positionFromRight}
              className="relative inline-flex items-center justify-center w-[17px] h-[36px] text-[28px] font-extrabold tracking-tight text-black leading-none select-none overflow-visible"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={d}
                  initial={{ y: -18, opacity: 0, filter: "blur(12px)", scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ y: 16, opacity: 0, filter: "blur(0px)", scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 14,
                    mass: 0.5,
                  }}
                  className="absolute inset-0 flex items-center justify-center text-[28px] font-extrabold tracking-tight text-black leading-none select-none"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    willChange: "transform, opacity, filter",
                  }}
                >
                  {d}
                </motion.span>
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <span
        className="text-[28px] font-extrabold tracking-tight text-black leading-none select-none ml-[2.5px]"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        /Day
      </span>
    </div>
  );
}

const REFERRAL_OPTIONS = [
  {
    id: "tiktok",
    label: "TikTok",
    icon: (
      <svg className="w-5 h-5 fill-black shrink-0" viewBox="0 0 24 24">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.068-.102a2.895 2.895 0 0 1 2.373-4.538c.306 0 .602.048.88.138V9.387a6.37 6.37 0 0 0-.88-.062 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.335 6.335 0 0 0 6.34-6.34V8.472a8.214 8.214 0 0 0 4.771 1.636V6.686z" />
      </svg>
    ),
  },
  {
    id: "friend_family",
    label: "Friend or family",
    icon: <Users className="w-5 h-5 text-black shrink-0" strokeWidth={2.2} />,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: (
      <svg className="w-5 h-5 fill-black shrink-0" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: "app_store",
    label: "App Store",
    icon: (
      <svg className="w-5 h-5 text-black fill-none stroke-black shrink-0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M8.5 17.5l7-12" />
        <path d="M15.5 17.5l-2.5-4.5" />
        <path d="M11 10.5L8.5 6" />
        <path d="M4 14h16" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: (
      <svg className="w-5 h-5 fill-black shrink-0" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: (
      <svg className="w-5 h-5 fill-black shrink-0" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    label: "Twitter",
    icon: (
      <svg className="w-5 h-5 fill-black shrink-0" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "vet",
    label: "Vet",
    icon: <Stethoscope className="w-5 h-5 text-black shrink-0" strokeWidth={2.2} />,
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: (
      <svg className="w-5 h-5 fill-black shrink-0" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    id: "other",
    label: "Other",
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.5" stroke="black" strokeWidth="2" />
        <circle cx="8" cy="12" r="1.25" fill="black" />
        <circle cx="12" cy="12" r="1.25" fill="black" />
        <circle cx="16" cy="12" r="1.25" fill="black" />
      </svg>
    ),
  },
];

// Helpers for default configurations
function getDefaultMedications(type: string): Medication[] {
  if (type === "dog") {
    return [
      { id: "dog_med_1", name: "Капли от клещей", completed: false, time: "09:00" },
      { id: "dog_med_2", name: "Витамин D", completed: false, time: "13:00" },
    ];
  }
  if (type === "cat") {
    return [
      { id: "cat_med_1", name: "Паста для вывода шерсти", completed: false, time: "08:30" },
      { id: "cat_med_2", name: "Омега-3", completed: false, time: "18:00" },
    ];
  }
  return [
    { id: "parrot_med_1", name: "Минеральная подкормка", completed: false, time: "10:00" },
  ];
}

function getDefaultReminders(petId: string): Reminder[] {
  return [
    {
      id: "default_r_ai",
      petId,
      title: "Checking my pet in Pet AI",
      time: "12:30",
      type: "vet",
      completed: false,
    },
  ];
}

// Synchronous persistence helpers for robust multi-pet data preservation across reloads
function getInitialActivePetId(): string {
  try {
    const savedActiveId = localStorage.getItem("pethealth_active_pet_id");
    const storedPetsRaw = localStorage.getItem("pethealth_pets");
    const realUserPetRaw = localStorage.getItem("pethealth_real_user_pet");

    let availableIds: string[] = [];
    if (storedPetsRaw) {
      const parsed = JSON.parse(storedPetsRaw) as Pet[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        availableIds = parsed.map((p) => p.id);
      }
    }
    if (availableIds.length === 0 && realUserPetRaw) {
      const realPet = JSON.parse(realUserPetRaw) as Pet;
      if (realPet?.id) availableIds = [realPet.id];
    }
    if (availableIds.length === 0) {
      availableIds = DEFAULT_PETS.map((p) => p.id);
    }

    if (savedActiveId && availableIds.includes(savedActiveId)) {
      return savedActiveId;
    }
    if (availableIds.length > 0) {
      return availableIds[0];
    }
  } catch (e) {}
  return "dog";
}

function getInitialReportsList(targetPetId: string): AnalysisReport[] {
  try {
    const directKey = `pethealth_reports_${targetPetId}`;
    const stored = localStorage.getItem(directKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    const masterRaw = localStorage.getItem("pethealth_all_reports");
    if (masterRaw) {
      const masterList = JSON.parse(masterRaw) as AnalysisReport[];
      if (Array.isArray(masterList)) {
        const matching = masterList.filter((r) => (r.petId || "dog") === targetPetId);
        if (matching.length > 0) {
          localStorage.setItem(directKey, JSON.stringify(matching));
          return matching;
        }
      }
    }

    if (targetPetId !== "dog") {
      const dogReportsRaw = localStorage.getItem("pethealth_reports_dog");
      if (dogReportsRaw) {
        const dogReports = JSON.parse(dogReportsRaw) as AnalysisReport[];
        if (Array.isArray(dogReports) && dogReports.length > 0) {
          const migrated = dogReports.map((r) => ({ ...r, petId: targetPetId }));
          localStorage.setItem(directKey, JSON.stringify(migrated));
          return migrated;
        }
      }
    }
  } catch (e) {}

  const isRu = (localStorage.getItem("pethealth_language") || "ru") === "ru";
  const now = new Date();
  const samplePhoto = targetPetId === "cat" ? catImg : targetPetId === "parrot" ? parrotImg : dogImg;
  const sampleScore = targetPetId === "cat" ? 92 : targetPetId === "parrot" ? 96 : 94;

  const sampleReport: AnalysisReport = {
    id: `rep-${targetPetId}-init`,
    petId: targetPetId,
    date: now.toISOString(),
    createdAt: now.toISOString(),
    photo: samplePhoto,
    healthScore: sampleScore,
    bodyScore: sampleScore + 1 > 100 ? 100 : sampleScore + 1,
    eyesScore: sampleScore,
    skinScore: sampleScore - 2,
    statusLabel: isRu ? "Отличное" : "Healthy",
    summary: isRu
      ? "Шерсть чистая, глаза ясные, признаков патологий или воспалений не обнаружено."
      : "Coat is clean, eyes are clear, no signs of inflammation or abnormalities observed.",
    possibleDiseases: [],
    findings: [
      {
        category: isRu ? "Глаза и уши" : "Eyes & Ears",
        status: "good",
        details: isRu ? "Роговица чистая, выделений нет" : "Cornea clear, no discharge",
      },
      {
        category: isRu ? "Шерстный покров" : "Coat & Skin",
        status: "good",
        details: isRu ? "Здоровый блеск, раздражений нет" : "Healthy shine, no redness",
      },
      {
        category: isRu ? "Физическая форма" : "Body Condition",
        status: "good",
        details: isRu ? "Вес соответствует норме" : "Weight normal for breed",
      },
    ],
    recommendations: [
      isRu ? "Поддерживать текущий рацион и активность" : "Maintain current diet and exercise routine",
      isRu ? "Следующий плановый осмотр через 3 месяца" : "Next routine checkup in 3 months",
    ],
    dietAdvice: isRu ? "Сбалансированное питание премиум-класса с достаточным количеством клетчатки." : "Balanced premium food with adequate fiber intake.",
    followUp: isRu ? "Ежедневный визуальный осмотр и контроль питьевого режима." : "Daily visual inspection and hydration check.",
    generalCondition: isRu ? "Отличное" : "Excellent",
  };

  return [sampleReport];
}

function getInitialHealthLog(targetPetId: string, dateStr: string): HealthLog {
  try {
    const logKey = `pethealth_log_${targetPetId}_${dateStr}`;
    const storedLog = localStorage.getItem(logKey);
    if (storedLog) {
      const parsed = JSON.parse(storedLog);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch (e) {}
  return {
    id: `log-${targetPetId}-${dateStr}`,
    petId: targetPetId,
    date: dateStr,
    waterIntake: 85,
    waterTarget: 150,
    medications: getDefaultMedications(targetPetId),
    activityLevel: 50,
    pottyStatus: "normal",
    symptoms: [],
    notes: ""
  };
}

function getInitialReminders(targetPetId: string): Reminder[] {
  try {
    const stored = localStorage.getItem(`pethealth_reminders_${targetPetId}`) || localStorage.getItem("pethealth_reminders");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return getDefaultReminders(targetPetId);
}

function getInitialCompletedPhotoDates(targetPetId: string): string[] {
  try {
    const stored = localStorage.getItem(`pethealth_completed_photo_dates_${targetPetId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    const legacy = localStorage.getItem("pethealth_completed_photo_dates");
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) return parsedLegacy;
    }
    const reports = getInitialReportsList(targetPetId);
    if (reports.length > 0) {
      const dates = Array.from(new Set(reports.map((r) => (r.createdAt ? r.createdAt.split("T")[0] : r.date ? r.date.split("T")[0] : "")).filter(Boolean)));
      if (dates.length > 0) return dates;
    }
  } catch (e) {}
  return [];
}

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    const saved = localStorage.getItem("pethealth_language");
    return saved || "en";
  });
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en || TRANSLATIONS.ru;
  const [showLanguagePopup, setShowLanguagePopup] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    // Show welcome and questionnaire screens on first visit; remember completion in localStorage
    return localStorage.getItem("pethealth_session_onboarded") === "true";
  });
  const [quizStep, setQuizStep] = useState<number>(0);
  const [quizDirection, setQuizDirection] = useState<"forward" | "backward">("forward");
  const [selectedPetType, setSelectedPetType] = useState<string>("");
  const [petNameInput, setPetNameInput] = useState<string>("");
  const [selectedPetAge, setSelectedPetAge] = useState<string>("");
  const [selectedPetSex, setSelectedPetSex] = useState<string>("");
  const [selectedPetHealthChanges, setSelectedPetHealthChanges] = useState<string>("");
  const [selectedPetWorryChanges, setSelectedPetWorryChanges] = useState<string>("");
  const [selectedPhotoDays, setSelectedPhotoDays] = useState<string[]>(() => {
    const stored = localStorage.getItem("pethealth_selected_photo_days");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  });
  const [selectedReferralSource, setSelectedReferralSource] = useState<string>("");
  const [isBtnActive, setIsBtnActive] = useState<boolean>(false);

  // Step 10 & 11 state
  const [capturedFirstPhoto, setCapturedFirstPhoto] = useState<string | null>(null);
  const [showStep10Camera, setShowStep10Camera] = useState<boolean>(false);
  const [setupProgress, setSetupProgress] = useState<number>(0);
  const [checksPerDay, setChecksPerDay] = useState<number>(3);

  // Animation timeline state for Step 9 ("Pet Owner Anxiety" graph screen)
  const [graphAnimStage, setGraphAnimStage] = useState<number>(0);
  const [redVal, setRedVal] = useState<number>(0);
  const [greenVal, setGreenVal] = useState<number>(0);

  // Staged timeline triggers for Step 9
  useEffect(() => {
    if (quizStep === 9) {
      setGraphAnimStage(0);
      setRedVal(0);
      setGreenVal(0);

      const t1 = setTimeout(() => setGraphAnimStage(1), 220); // Header text
      const t2 = setTimeout(() => setGraphAnimStage(2), 580); // Subtitle text
      const t3 = setTimeout(() => setGraphAnimStage(3), 1000); // Card + Red bar grow in center
      const t4 = setTimeout(() => setGraphAnimStage(4), 2200); // Shift Red bar to left
      const t5 = setTimeout(() => setGraphAnimStage(5), 2800); // Green bar appears & grows
      const t6 = setTimeout(() => setGraphAnimStage(6), 3750); // Finish -> Continue button appears

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        clearTimeout(t6);
      };
    }
  }, [quizStep]);

  // Red percentage counter animation (0% -> 70%) when graphAnimStage >= 3
  useEffect(() => {
    if (quizStep === 9 && graphAnimStage >= 3) {
      let startTime: number | null = null;
      const duration = 850;
      let animFrame: number;

      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setRedVal(Math.round(eased * 70));

        if (progress < 1) {
          animFrame = requestAnimationFrame(animateCount);
        }
      };

      animFrame = requestAnimationFrame(animateCount);
      return () => cancelAnimationFrame(animFrame);
    }
  }, [quizStep, graphAnimStage >= 3]);

  // Green percentage counter animation (0% -> 30%) when graphAnimStage >= 5
  useEffect(() => {
    if (quizStep === 9 && graphAnimStage >= 5) {
      let startTime: number | null = null;
      const duration = 750;
      let animFrame: number;

      const animateCount = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setGreenVal(Math.round(eased * 30));

        if (progress < 1) {
          animFrame = requestAnimationFrame(animateCount);
        }
      };

      animFrame = requestAnimationFrame(animateCount);
      return () => cancelAnimationFrame(animFrame);
    }
  }, [quizStep, graphAnimStage >= 5]);

  // Timer for step 3 & step 7 Continue button to prevent rapid skipping
  useEffect(() => {
    if (quizStep === 3 || quizStep === 7) {
      setIsBtnActive(false);
      const timer = setTimeout(() => {
        setIsBtnActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [quizStep]);

  // Step 13 setup animation timeline (0% -> 100%)
  useEffect(() => {
    if (quizStep === 13) {
      setSetupProgress(0);
      let currentVal = 0;
      let stepTimeout: NodeJS.Timeout;
      let finishTimer: NodeJS.Timeout;

      const runNextStep = () => {
        if (currentVal >= 100) return;

        // Smooth increments +2 to +5 per step
        const jump = Math.floor(Math.random() * 4) + 2;
        currentVal = Math.min(100, currentVal + jump);
        setSetupProgress(currentVal);

        if (currentVal < 100) {
          // Cadence between 320ms and 460ms for a steady, smooth pace
          const nextDelay = Math.floor(Math.random() * 140) + 320;
          stepTimeout = setTimeout(runNextStep, nextDelay);
        } else {
          // Finish setup progress and transition to step 14 review plan
          finishTimer = setTimeout(() => {
            setQuizDirection("forward");
            setQuizStep(14);
          }, 600);
        }
      };

      stepTimeout = setTimeout(runNextStep, 150);

      return () => {
        if (stepTimeout) clearTimeout(stepTimeout);
        if (finishTimer) clearTimeout(finishTimer);
      };
    }
  }, [quizStep]);

  const finishOnboarding = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const emojiMap: Record<string, string> = {
      dog: "🐶",
      cat: "🐱",
      rabbit: "🐰",
      rodent: "🐹",
      bird: "🐦",
      reptile: "🐢",
      another: "🦄",
    };
    const speciesMap: Record<string, string> = {
      dog: "Dog",
      cat: "Cat",
      rabbit: "Rabbit",
      rodent: "Rodent",
      bird: "Bird",
      reptile: "Reptile",
      another: "Another",
    };

    const newPetId = Math.random().toString(36).substring(2, 9);
    const petName = petNameInput.trim() || (selectedPetType === "cat" ? "Мурка" : selectedPetType === "dog" ? "Бадди" : "Питомец");
    const newPet: Pet = {
      id: newPetId,
      name: petName,
      type: (selectedPetType || "dog") as any,
      species: speciesMap[selectedPetType] || "Dog",
      emoji: emojiMap[selectedPetType] || "🐶",
      sex: selectedPetSex || "Male",
      image: capturedFirstPhoto || (selectedPetType === "cat" ? catImg : selectedPetType === "dog" ? dogImg : parrotImg),
      breed: selectedPetType === "dog" ? "Джек-рассел терьер" : selectedPetType === "cat" ? "Шотландская вислоухая" : "Попугай",
      age: selectedPetAge || "1-3",
      weight: selectedPetType === "dog" ? "6.8 кг" : selectedPetType === "cat" ? "4.2 кг" : "35 г",
      isCustom: true,
    };
    // The user's real onboarded pet replaces demo dummy pets
    const initialRealPets = [newPet];
    setPets(initialRealPets);
    setActivePetId(newPet.id);
    localStorage.setItem("pethealth_pets", JSON.stringify(initialRealPets));
    localStorage.setItem("pethealth_real_user_pet", JSON.stringify(newPet));
    localStorage.setItem("pethealth_active_pet_id", newPet.id);

    localStorage.setItem("pethealth_selected_photo_days", JSON.stringify(selectedPhotoDays));
    localStorage.setItem("pethealth_onboarded_start_date", todayStr);
    setStartDateStr(todayStr);

    if (capturedFirstPhoto) {
      const existing = JSON.parse(localStorage.getItem("pethealth_completed_photo_dates") || "[]");
      if (!existing.includes(todayStr)) {
        const updated = [...existing, todayStr];
        localStorage.setItem("pethealth_completed_photo_dates", JSON.stringify(updated));
        setCompletedPhotoDates(updated);
      }
    }

    sessionStorage.removeItem("pethealth_revisit_onboarding");
    sessionStorage.setItem("pethealth_session_onboarded", "true");
    localStorage.setItem("pethealth_session_onboarded", "true");
    setHasAnimatedHome(false);
    setHasAnimatedGroups(false);
    setHasAnimatedProgress(false);
    setIsOnboarded(true);
  };
  const [pets, setPets] = useState<Pet[]>(() => {
    try {
      const storedPets = localStorage.getItem("pethealth_pets");
      const realUserPetRaw = localStorage.getItem("pethealth_real_user_pet");

      if (storedPets) {
        const parsed = JSON.parse(storedPets) as Pet[];
        const hasCustom = parsed.some((p) => p.isCustom);
        const filtered = hasCustom ? parsed.filter((p) => p.isCustom) : parsed;
        if (filtered.length > 0) {
          return filtered.map((p) => {
            if (p.id === "cat" && (!p.image || p.image.includes("/src/assets/images"))) return { ...p, image: catImg };
            if (p.id === "dog" && (!p.image || p.image.includes("/src/assets/images"))) return { ...p, image: dogImg };
            if (p.id === "parrot" && (!p.image || p.image.includes("/src/assets/images"))) return { ...p, image: parrotImg };
            return p;
          });
        }
      }

      if (realUserPetRaw) {
        const realPet = JSON.parse(realUserPetRaw) as Pet;
        return [realPet];
      }
    } catch (e) {}
    return DEFAULT_PETS;
  });
  const [activePetId, setActivePetId] = useState<string>(getInitialActivePetId);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [healthLog, setHealthLog] = useState<HealthLog | null>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const initPetId = getInitialActivePetId();
    return getInitialHealthLog(initPetId, dateStr);
  });
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const initPetId = getInitialActivePetId();
    return getInitialReminders(initPetId);
  });
  
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    return localStorage.getItem("pethealth_onboarded_start_date") || "";
  });
  const [completedPhotoDates, setCompletedPhotoDates] = useState<string[]>(() => {
    const initPetId = getInitialActivePetId();
    return getInitialCompletedPhotoDates(initPetId);
  });
  
  // Splash Screen State (brief intro on first visit)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    return !sessionStorage.getItem("pethealth_splash_shown");
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        sessionStorage.setItem("pethealth_splash_shown", "true");
        setShowSplash(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Modals state
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showAppleActionSheet, setShowAppleActionSheet] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [showAddPetQuizModal, setShowAddPetQuizModal] = useState(false);
  const [showQuickScanCamera, setShowQuickScanCamera] = useState(false);
  const [isQuickAnalyzing, setIsQuickAnalyzing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    return localStorage.getItem("pet_health_is_subscribed") === "true";
  });
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [reportsList, setReportsList] = useState<AnalysisReport[]>(() => {
    const initPetId = getInitialActivePetId();
    return getInitialReportsList(initPetId);
  });
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>("home");

  // Track tabs that have already played their initial entrance animation
  const [hasAnimatedHome, setHasAnimatedHome] = useState(false);
  const [hasAnimatedGroups, setHasAnimatedGroups] = useState(false);
  const [hasAnimatedProgress, setHasAnimatedProgress] = useState(false);
  const [hasAnimatedSettings, setHasAnimatedSettings] = useState(false);

  // Hydrate theme (system, dark, light) on app mount, strictly isolated from onboarding
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (!isOnboarded) {
        root.classList.remove("dark");
        root.classList.add("onboarding-scope");
        root.style.colorScheme = "light";
        return;
      }
      root.classList.remove("onboarding-scope");
      const savedTheme = localStorage.getItem("pethealth_theme_mode") || "system";
      let isDark = false;
      if (savedTheme === "dark") isDark = true;
      else if (savedTheme === "light") isDark = false;
      else isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (isDark) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
      }
    } catch {
      // ignore
    }
  }, [isOnboarded]);

  useEffect(() => {
    if (isOnboarded && !showSplash && activeNavTab === "home" && !hasAnimatedHome) {
      const timer = setTimeout(() => setHasAnimatedHome(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isOnboarded, showSplash, activeNavTab, hasAnimatedHome]);

  useEffect(() => {
    if (isOnboarded && !showSplash && activeNavTab === "groups" && !hasAnimatedGroups) {
      const timer = setTimeout(() => setHasAnimatedGroups(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isOnboarded, showSplash, activeNavTab, hasAnimatedGroups]);

  useEffect(() => {
    if (isOnboarded && !showSplash && activeNavTab === "progress" && !hasAnimatedProgress) {
      const timer = setTimeout(() => setHasAnimatedProgress(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isOnboarded, showSplash, activeNavTab, hasAnimatedProgress]);

  useEffect(() => {
    if (isOnboarded && !showSplash && activeNavTab === "settings" && !hasAnimatedSettings) {
      const timer = setTimeout(() => setHasAnimatedSettings(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isOnboarded, showSplash, activeNavTab, hasAnimatedSettings]);

  // Initialize selectedDate to today's local date YYYY-MM-DD
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  }, []);

  // Ensure activePetId is kept synchronized in localStorage
  useEffect(() => {
    if (activePetId) {
      try {
        localStorage.setItem("pethealth_active_pet_id", activePetId);
      } catch (e) {}
    }
  }, [activePetId]);

  const handleSelectPet = (id: string) => {
    setActivePetId(id);
    try {
      localStorage.setItem("pethealth_active_pet_id", id);
    } catch (e) {}
  };

  // Initialize and load pets from localStorage
  useEffect(() => {
    const storedPets = localStorage.getItem("pethealth_pets");
    const realUserPetRaw = localStorage.getItem("pethealth_real_user_pet");

    if (storedPets) {
      try {
        const parsed = JSON.parse(storedPets) as Pet[];
        const hasCustom = parsed.some((p) => p.isCustom);
        const petsToUse = hasCustom ? parsed.filter((p) => p.isCustom) : parsed;
        const synced = petsToUse.map((p) => {
          if (p.id === "cat" && (!p.image || p.image.includes("/src/assets/images"))) {
            return { ...p, image: catImg };
          }
          if (p.id === "dog" && (!p.image || p.image.includes("/src/assets/images"))) {
            return { ...p, image: dogImg };
          }
          if (p.id === "parrot" && (!p.image || p.image.includes("/src/assets/images"))) {
            return { ...p, image: parrotImg };
          }
          return p;
        });
        setPets(synced);
        localStorage.setItem("pethealth_pets", JSON.stringify(synced));

        const savedActive = localStorage.getItem("pethealth_active_pet_id");
        if (savedActive && synced.some((p) => p.id === savedActive)) {
          if (activePetId !== savedActive) {
            setActivePetId(savedActive);
          }
        } else if (synced.length > 0 && !synced.some((p) => p.id === activePetId)) {
          setActivePetId(synced[0].id);
          localStorage.setItem("pethealth_active_pet_id", synced[0].id);
        }
      } catch (e) {
        setPets(DEFAULT_PETS);
      }
    } else if (realUserPetRaw) {
      try {
        const realPet = JSON.parse(realUserPetRaw) as Pet;
        setPets([realPet]);
        setActivePetId(realPet.id);
        localStorage.setItem("pethealth_pets", JSON.stringify([realPet]));
        localStorage.setItem("pethealth_active_pet_id", realPet.id);
      } catch (e) {
        setPets(DEFAULT_PETS);
      }
    } else {
      setPets(DEFAULT_PETS);
      localStorage.setItem("pethealth_pets", JSON.stringify(DEFAULT_PETS));
    }
  }, []);

  // Save custom pets when list changes
  const handleAddPet = (newPet: Pet) => {
    const userOnlyPets = pets.filter((p) => p.isCustom && p.id !== newPet.id);
    const updated = [...userOnlyPets, { ...newPet, isCustom: true }];
    setPets(updated);
    setActivePetId(newPet.id);
    try {
      localStorage.setItem("pethealth_pets", JSON.stringify(updated));
      localStorage.setItem("pethealth_active_pet_id", newPet.id);
    } catch (e) {}
    setShowAddPetModal(false);
  };

  // Load health logs for active pet and active date
  useEffect(() => {
    if (!activePetId || !selectedDate) return;

    const logKey = `pethealth_log_${activePetId}_${selectedDate}`;
    const storedLog = localStorage.getItem(logKey);

    const activePet = pets.find((p) => p.id === activePetId) || pets[0];
    const defaultWaterTarget = activePet?.type === "parrot" ? 30 : 150;

    if (storedLog) {
      try {
        setHealthLog(JSON.parse(storedLog));
      } catch (e) {
        setHealthLog({
          id: Math.random().toString(36).substring(2, 9),
          petId: activePetId,
          date: selectedDate,
          waterIntake: 0,
          waterTarget: defaultWaterTarget,
          medications: getDefaultMedications(activePet?.type || "cat"),
          activityLevel: 50,
        });
      }
    } else {
      const initialLog: HealthLog = {
        id: Math.random().toString(36).substring(2, 9),
        petId: activePetId,
        date: selectedDate,
        waterIntake: 0,
        waterTarget: defaultWaterTarget,
        medications: getDefaultMedications(activePet?.type || "cat"),
        activityLevel: 50,
      };
      setHealthLog(initialLog);
      localStorage.setItem(logKey, JSON.stringify(initialLog));
    }
  }, [activePetId, selectedDate, pets]);

  // Load reminders for active pet
  useEffect(() => {
    if (!activePetId) return;

    const remindersKey = `pethealth_reminders_${activePetId}`;
    const storedReminders = localStorage.getItem(remindersKey);

    if (storedReminders) {
      try {
        setReminders(JSON.parse(storedReminders));
      } catch (e) {
        const defaultRem = getDefaultReminders(activePetId);
        setReminders(defaultRem);
        localStorage.setItem(remindersKey, JSON.stringify(defaultRem));
      }
    } else {
      const defaultRem = getDefaultReminders(activePetId);
      setReminders(defaultRem);
      localStorage.setItem(remindersKey, JSON.stringify(defaultRem));
    }
  }, [activePetId]);

  // Load analysis reports history for active pet
  useEffect(() => {
    if (!activePetId) return;
    try {
      const reportsKey = `pethealth_reports_${activePetId}`;
      const storedReports = localStorage.getItem(reportsKey);
      if (storedReports) {
        const parsed = JSON.parse(storedReports) as AnalysisReport[];
        if (Array.isArray(parsed)) {
          setReportsList(parsed);
          return;
        }
      }

      // Check master all_reports
      const allReportsRaw = localStorage.getItem("pethealth_all_reports");
      if (allReportsRaw) {
        const allParsed = JSON.parse(allReportsRaw) as AnalysisReport[];
        const matching = allParsed.filter((r) => (r.petId || "dog") === activePetId);
        if (matching.length > 0) {
          setReportsList(matching);
          localStorage.setItem(reportsKey, JSON.stringify(matching));
          return;
        }
      }

      // Check legacy dog reports if custom pet
      if (activePetId !== "dog") {
        const dogReportsRaw = localStorage.getItem("pethealth_reports_dog");
        if (dogReportsRaw) {
          const dogReports = JSON.parse(dogReportsRaw) as AnalysisReport[];
          if (Array.isArray(dogReports) && dogReports.length > 0) {
            const migrated = dogReports.map((r) => ({ ...r, petId: activePetId }));
            localStorage.setItem(reportsKey, JSON.stringify(migrated));
            setReportsList(migrated);
            return;
          }
        }
      }

      setReportsList([]);
    } catch (e) {
      setReportsList([]);
    }
  }, [activePetId]);

  // Update Health Log helper
  const handleUpdateLog = (updatedFields: Partial<HealthLog>) => {
    if (!healthLog || !activePetId || !selectedDate) return;

    const updatedLog = { ...healthLog, ...updatedFields, petId: activePetId, date: selectedDate };
    setHealthLog(updatedLog);

    const logKey = `pethealth_log_${activePetId}_${selectedDate}`;
    try {
      localStorage.setItem(logKey, JSON.stringify(updatedLog));
    } catch (e) {}
  };

  // Add Reminder Helper
  const handleAddReminder = (title: string, time: string, type: Reminder["type"]) => {
    const newRem: Reminder = {
      id: Math.random().toString(36).substring(2, 9),
      petId: activePetId,
      title,
      time,
      type,
      completed: false,
    };
    const updated = [...reminders, newRem];
    setReminders(updated);
    try {
      localStorage.setItem(`pethealth_reminders_${activePetId}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Toggle Reminder Helper
  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
    setReminders(updated);
    try {
      localStorage.setItem(`pethealth_reminders_${activePetId}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Update Reminder Helper (e.g. edit time or title)
  const handleUpdateReminder = (id: string, updatedFields: Partial<Reminder>) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, ...updatedFields } : r));
    setReminders(updated);
    try {
      localStorage.setItem(`pethealth_reminders_${activePetId}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Delete Reminder Helper
  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    try {
      localStorage.setItem(`pethealth_reminders_${activePetId}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Save report and add to history
  const handleAnalysisSuccess = (report: AnalysisReport) => {
    const targetPetId = report.petId || activePetId;
    setActiveReport(report);

    // Read directly from storage to prevent stale closure data loss
    let currentStoredList: AnalysisReport[] = [];
    try {
      const raw = localStorage.getItem(`pethealth_reports_${targetPetId}`);
      if (raw) {
        currentStoredList = JSON.parse(raw);
      } else {
        currentStoredList = reportsList.filter((r) => (r.petId || activePetId) === targetPetId);
      }
    } catch {
      currentStoredList = reportsList;
    }

    const filtered = currentStoredList.filter((r) => r.id !== report.id);
    const updatedReports = [report, ...filtered];

    setReportsList(updatedReports);
    try {
      localStorage.setItem(`pethealth_reports_${targetPetId}`, JSON.stringify(updatedReports));

      // Also update master all_reports collection
      const allRaw = localStorage.getItem("pethealth_all_reports") || "[]";
      const allReports: AnalysisReport[] = JSON.parse(allRaw);
      const updatedAll = [report, ...allReports.filter((r) => r.id !== report.id)];
      localStorage.setItem("pethealth_all_reports", JSON.stringify(updatedAll));
    } catch (e) {}

    // Update completed photo dates for this specific pet
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const petDatesKey = `pethealth_completed_photo_dates_${targetPetId}`;
    let existingDates: string[] = [];
    try {
      const storedDates = localStorage.getItem(petDatesKey);
      if (storedDates) existingDates = JSON.parse(storedDates);
    } catch {}

    if (!existingDates.includes(todayStr)) {
      existingDates = [...existingDates, todayStr];
      try {
        localStorage.setItem(petDatesKey, JSON.stringify(existingDates));
        localStorage.setItem("pethealth_completed_photo_dates", JSON.stringify(existingDates));
      } catch (e) {}
      setCompletedPhotoDates(existingDates);
    }
  };

  // Load completed photo dates for active pet
  useEffect(() => {
    if (!activePetId) return;
    try {
      const petDatesKey = `pethealth_completed_photo_dates_${activePetId}`;
      const stored = localStorage.getItem(petDatesKey);
      if (stored) {
        setCompletedPhotoDates(JSON.parse(stored));
      } else {
        const reportsKey = `pethealth_reports_${activePetId}`;
        const storedReports = localStorage.getItem(reportsKey);
        if (storedReports) {
          const parsed = JSON.parse(storedReports) as AnalysisReport[];
          const dates = Array.from(new Set(parsed.map((r) => (r.createdAt ? r.createdAt.split("T")[0] : r.date ? r.date.split("T")[0] : "")).filter(Boolean)));
          setCompletedPhotoDates(dates);
          localStorage.setItem(petDatesKey, JSON.stringify(dates));
        } else {
          setCompletedPhotoDates([]);
        }
      }
    } catch (e) {}
  }, [activePetId]);

  // Sync dates from reportsList into completedPhotoDates
  useEffect(() => {
    if (!activePetId) return;
    if (reportsList && reportsList.length > 0) {
      const reportDates = reportsList
        .map((r) => (r.createdAt ? r.createdAt.split("T")[0] : r.date ? r.date.split("T")[0] : ""))
        .filter(Boolean);

      if (reportDates.length > 0) {
        setCompletedPhotoDates((prev) => {
          const merged = Array.from(new Set([...prev, ...reportDates]));
          if (merged.length !== prev.length) {
            try {
              localStorage.setItem(`pethealth_completed_photo_dates_${activePetId}`, JSON.stringify(merged));
              localStorage.setItem("pethealth_completed_photo_dates", JSON.stringify(merged));
            } catch (e) {}
            return merged;
          }
          return prev;
        });
      }
    }
  }, [reportsList, activePetId]);

  // Clear report history for active pet
  const handleClearReportsHistory = () => {
    setReportsList([]);
    localStorage.removeItem(`pethealth_reports_${activePetId}`);
  };

  const activePet = pets.find((p) => p.id === activePetId) || (pets.length > 0 ? pets[0] : DEFAULT_PETS[0]);
  const currentLangObj = LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0];

  const handleTriggerCheckPet = () => {
    if (!isSubscribed) {
      setShowPaywallModal(true);
      return;
    }
    if (activeNavTab !== "home") {
      setActiveNavTab("home");
    }
    setShowQuickScanCamera(true);
  };

  const handleQuickScanCapture = async (capturedImageDataUrl: string) => {
    setShowQuickScanCamera(false);
    if (!activePet) return;
    setIsQuickAnalyzing(true);

    let imageToSend = capturedImageDataUrl;
    try {
      if (!imageToSend.startsWith("data:")) {
        const res = await fetch(imageToSend);
        const blob = await res.blob();
        imageToSend = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch (e) {
      console.warn("Direct base64 conversion fallback for quick scan:", e);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          image: imageToSend,
          petType: activePet.type,
          petName: activePet.name,
          symptoms: [],
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ошибка сервера при анализе");
      }

      const parsedReport: AnalysisReport = {
        id: Math.random().toString(36).substring(2, 9),
        petId: activePet.id,
        date: new Date().toISOString(),
        photo: imageToSend,
        healthScore: typeof data.healthScore === "number" ? data.healthScore : 90,
        bodyScore: typeof data.bodyScore === "number" ? data.bodyScore : Math.min(100, (typeof data.healthScore === "number" ? data.healthScore : 90) + 1),
        eyesScore: typeof data.eyesScore === "number" ? data.eyesScore : Math.min(100, (typeof data.healthScore === "number" ? data.healthScore : 90) + 2),
        skinScore: typeof data.skinScore === "number" ? data.skinScore : Math.max(30, (typeof data.healthScore === "number" ? data.healthScore : 90) - 1),
        statusLabel: typeof data.statusLabel === "string" ? data.statusLabel : "В норме",
        summary: typeof data.summary === "string" ? data.summary : "Анализ завершен.",
        findings: Array.isArray(data.findings)
          ? data.findings.map((f: any) => ({
              category: typeof f.category === "string" ? f.category : "Осмотр",
              status: f.status === "good" || f.status === "warning" || f.status === "critical" ? f.status : "good",
              details: typeof f.details === "string" ? f.details : "Параметры в норме.",
            }))
          : [],
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
        dietAdvice: typeof data.dietAdvice === "string" ? data.dietAdvice : "Рекомендации отсутствуют.",
        followUp: typeof data.followUp === "string" ? data.followUp : "Следите за состоянием питомца.",
        symptomsAnalyzed: [],
        possibleDiseases: Array.isArray(data.possibleDiseases) ? data.possibleDiseases : [],
        generalCondition: typeof data.generalCondition === "string" ? data.generalCondition : "Удовлетворительное.",
      };

      handleAnalysisSuccess(parsedReport);
    } catch (error: any) {
      console.error("Quick scan AI error:", error);
      alert(error.message || "Не удалось связаться с сервером AI.");
    } finally {
      setIsQuickAnalyzing(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[999999] bg-white flex items-center justify-center select-none font-sf">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[52px] sm:text-[60px] font-bold text-black tracking-tight select-none"
        >
          Petkit
        </motion.div>
      </div>
    );
  }

  if (!isOnboarded) {
    if (quizStep === 0) {
      // Initial Welcome page with F6F7F9 background
      return (
        <div className="w-full min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-between py-10 px-0 select-none overflow-hidden relative">
          {/* Language selector badge in the top right corner - beautiful clean badge (плашка) with no borders/shadow/text */}
          <div className="absolute top-6 right-6 z-30">
            <button
              onClick={() => setShowLanguagePopup(true)}
              className="flex items-center justify-center bg-zinc-200/60 hover:bg-zinc-200 w-11 h-11 rounded-full transition-all cursor-pointer active:scale-95 outline-none focus:outline-none"
            >
              <span className="text-2xl leading-none select-none">{currentLangObj.flag}</span>
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md flex flex-col items-start text-left mt-10 px-6"
          >
            <h1 className="text-[32px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000]">
              Scan Your Pet Daily —
            </h1>
            <h2 className="text-[32px] font-bold tracking-tight leading-tight mt-1.5 text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000]">
              Track Their Health.
            </h2>
          </motion.div>

          {/* Center Image - completely borderless, full horizontal width, with smooth gradients fading into the #F6F7F9 background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md flex justify-center my-4"
          >
            <div className="relative w-full aspect-[4/5] bg-[#F6F7F9] overflow-hidden flex items-center justify-center">
              <img
                src={onboardingPetsImg}
                alt="Welcome pets"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Smooth gradients fading into #F6F7F9 at top and bottom */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#F6F7F9] to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F6F7F9] to-transparent pointer-events-none z-10" />
            </div>
          </motion.div>

          {/* Bottom Button & Account option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md px-6 mb-4 flex flex-col items-center"
          >
            <button
              onClick={() => {
                setQuizDirection("forward");
                setQuizStep(1);
              }}
              className="relative overflow-hidden w-full bg-black hover:bg-zinc-900 text-white text-[22px] tracking-tight font-extrabold py-3.5 rounded-[1.75rem] shadow-lg shadow-zinc-950/15 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="relative z-10">Get started</span>
              {/* Soft, premium light sweep shimmer */}
              <motion.div
                className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-white/12 to-transparent -skew-x-[20deg] pointer-events-none"
                animate={{
                  left: ["-120%", "120%"],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 3.2,
                  ease: [0.25, 1, 0.5, 1], // Soft, elegant ease-out profile
                  repeatDelay: 3.0,
                }}
              />
            </button>
            
            <div className="text-center mt-4">
              <span className="text-sm font-semibold text-zinc-400">
                Already have an account?{" "}
              </span>
              <button 
                onClick={() => {
                  setQuizStep(1);
                }}
                className="text-sm font-extrabold text-black hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </motion.div>

          {/* Universal Slide-Up Language bottom sheet - rendered on onboarding screen too */}
          <AnimatePresence>
            {showLanguagePopup && (
              <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
                {/* Smooth fading backdrop dimming and blur */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                  onClick={() => setShowLanguagePopup(false)}
                />
                
                {/* Highly tactile, fully responsive, 1:1 finger controlled sheet */}
                <motion.div
                  drag="y"
                  dragDirectionLock
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ top: 0.15 }}
                  dragSnapToOrigin
                  onDragEnd={(event, info) => {
                    if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                      setShowLanguagePopup(false);
                    }
                  }}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  className="relative w-full max-w-md mx-auto bg-white rounded-t-[44px] px-6 pt-6 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.22)] flex flex-col z-10 select-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4 w-full">
                    <div className="flex items-center">
                      <h3 className="text-base font-extrabold text-[#1c1c1e]">
                        {t.Language}
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowLanguagePopup(false)}
                      className="w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/[0.03] flex items-center justify-center hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer flex-shrink-0 outline-none focus:outline-none"
                    >
                      <X className="w-5 h-5 text-black" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Languages list with separator lines */}
                  <div className="flex flex-col divide-y divide-zinc-100 max-h-[360px] overflow-y-auto pr-1">
                    {LANGUAGES.map((lang) => {
                      const isSelected = currentLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setCurrentLanguage(lang.code);
                            localStorage.setItem("pethealth_language", lang.code);
                            setShowLanguagePopup(false);
                          }}
                          className="flex items-center justify-between py-3.5 px-1 hover:bg-zinc-50 transition-colors cursor-pointer text-left w-full group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl select-none leading-none">{lang.flag}</span>
                            <span className={`text-[15px] font-semibold text-zinc-800 group-hover:text-black ${isSelected ? 'font-bold text-black' : ''}`}>
                              {lang.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check size={18} className="text-black stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Questionnaire screens for quizStep 1..13
    const canContinue = 
      quizStep === 1 ? !!selectedPetType :
      quizStep === 2 ? petNameInput.trim().length > 0 :
      quizStep === 3 ? isBtnActive :
      quizStep === 4 ? !!selectedPetAge :
      quizStep === 5 ? !!selectedPetSex :
      quizStep === 6 ? !!selectedPetHealthChanges :
      quizStep === 7 ? isBtnActive :
      quizStep === 8 ? !!selectedPetWorryChanges :
      quizStep === 9 ? graphAnimStage >= 6 :
      quizStep === 12 ? !!selectedReferralSource :
      quizStep === 13 ? true : true;

    const progressPercent = 
      quizStep === 1 ? "10%" : 
      quizStep === 2 ? "20%" : 
      quizStep === 3 ? "30%" :
      quizStep === 4 ? "40%" :
      quizStep === 5 ? "50%" :
      quizStep === 6 ? "60%" :
      quizStep === 7 ? "70%" :
      quizStep === 8 ? "80%" :
      quizStep === 9 ? "90%" :
      quizStep === 12 ? "98%" : "100%";

    const handleSelectPetType = (type: string) => {
      setSelectedPetType(type);
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    };

    const handleSelectPetAge = (age: string) => {
      setSelectedPetAge(age);
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    };

    const handleSelectPetSex = (sex: string) => {
      setSelectedPetSex(sex);
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    };

    const handleSelectPetHealthChanges = (val: string) => {
      setSelectedPetHealthChanges(val);
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    };

    const handleSelectPetWorryChanges = (val: string) => {
      setSelectedPetWorryChanges(val);
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    };

    const handleNextStep = () => {
      setQuizDirection("forward");
      if (quizStep === 9) {
        setQuizStep(12);
      } else if (quizStep === 12) {
        setQuizStep(13);
      } else if (quizStep === 13) {
        // Handled automatically when setupProgress reaches 100%
      } else if (quizStep === 14) {
        setQuizStep(15);
      } else if (quizStep === 15) {
        setQuizStep(16);
      } else if (quizStep === 16) {
        finishOnboarding();
      } else {
        setQuizStep((prev) => prev + 1);
      }
    };

    const cardContainerVariants = {
      hidden: {},
      show: {
        transition: {
          staggerChildren: 0.04,
          delayChildren: 0.02,
        },
      },
    };

    const cardItemVariants: any = {
      hidden: {
        opacity: 0,
        y: 12,
      },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.22,
          ease: [0.25, 1, 0.5, 1],
        },
      },
    };

    return (
      <div className="w-full h-[100dvh] bg-[#F6F7F9] flex flex-col justify-between pt-5 pb-3 font-sf select-none overflow-hidden relative">
        {/* Header Bar - shown only up to step 12 ("Where did you hear about us?") */}
        {quizStep > 0 && quizStep <= 12 && (
          <div className="w-full max-w-md mx-auto flex items-center justify-between px-6 pt-2 flex-none relative">
            {/* Arrow back with curved lines (Chevron style) */}
            <button
              onClick={() => {
                setQuizDirection("backward");
                setQuizStep((prev) => {
                  if (prev === 12) return 9;
                  return Math.max(0, prev - 1);
                });
              }}
              className="w-10 h-10 rounded-full bg-zinc-200/50 hover:bg-zinc-200/80 flex items-center justify-center transition-all cursor-pointer active:scale-95 border-none outline-none focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
            </button>

            {/* Progress bar in the middle (steps 1-12) */}
            <div className="flex-1 mx-4 h-[10px] bg-zinc-200/50 rounded-full relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-black rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: progressPercent }}
                transition={{ type: "spring", stiffness: 100, damping: 18 }}
              />
            </div>

            {/* Language selection badge */}
            <button
              onClick={() => setShowLanguagePopup(true)}
              className="flex items-center justify-center bg-zinc-200/50 hover:bg-zinc-200/80 w-10 h-10 rounded-full transition-all cursor-pointer active:scale-95 outline-none focus:outline-none"
            >
              <span className="text-xl leading-none select-none">{currentLangObj.flag}</span>
            </button>
          </div>
        )}

        {/* Question Area */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-start px-6 pt-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AnimatePresence mode="wait" custom={quizDirection}>
            {quizStep === 1 && (
              <motion.div
                key="step-1"
                custom={quizDirection}
                initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col justify-start"
              >
                <div className="mt-3 mb-5 overflow-hidden">
                  <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left w-full select-none">
                    Who is your pet?
                  </h1>
                </div>

                <div className="flex-1 pb-2 flex flex-col">
                  <motion.div
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-3"
                  >
                    {[
                      { id: "dog", label: "🐶 Dog" },
                      { id: "cat", label: "🐱 Cat" },
                      { id: "rabbit", label: "🐰 Rabbit" },
                      { id: "rodent", label: "🐹 Rodent" },
                      { id: "bird", label: "🐦 Bird" },
                      { id: "reptile", label: "🐢 Reptile" },
                      { id: "another", label: "🦄 Another" }
                    ].map((opt) => {
                      const isSelected = selectedPetType === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          variants={cardItemVariants}
                          onClick={() => handleSelectPetType(opt.id)}
                          whileTap={{ scale: 0.985 }}
                          className={`w-full py-[15px] px-6 rounded-[25px] bg-white text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                            isSelected 
                              ? "border-black shadow-[0_6px_18px_rgba(0,0,0,0.05)]" 
                              : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                          }`}
                        >
                          <span className="text-[18px] font-semibold text-black select-none">
                            {opt.label}
                          </span>
                          
                          {/* Circle checkmark indicator on right */}
                          <div className={`relative w-[26px] h-[26px] rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                            isSelected ? "border-transparent" : "border-zinc-200"
                          }`}>
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.18,
                                ease: [0.25, 1, 0.5, 1],
                              }}
                              className="absolute inset-0 bg-black rounded-full"
                            />
                            <svg
                              className="relative z-10 w-3.5 h-3.5 text-white pointer-events-none"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <motion.polyline
                                points="20 6 9 17 4 12"
                                initial={false}
                                animate={{
                                  pathLength: isSelected ? 1 : 0,
                                  opacity: isSelected ? 1 : 0,
                                }}
                                transition={{
                                  duration: 0.16,
                                  ease: "easeOut",
                                  delay: isSelected ? 0.04 : 0,
                                }}
                              />
                            </svg>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {quizStep === 2 && (
              <motion.div
                key="step-2"
                custom={quizDirection}
                initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col justify-start"
              >
                <div className="mt-3 mb-5 overflow-hidden">
                  <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left w-full select-none">
                    What is your pet's name?
                  </h1>
                </div>

                <div className="flex-1 pb-2 flex flex-col justify-center">
                  <input
                    type="text"
                    value={petNameInput}
                    onChange={(e) => setPetNameInput(e.target.value)}
                    placeholder="Pet’s name"
                    className={`w-full bg-white rounded-[28px] px-6 py-[20px] text-[20px] font-semibold text-black placeholder:text-zinc-300 outline-none focus:outline-none border-none shadow-none ${
                      petNameInput ? "text-center placeholder:text-center" : "text-left placeholder:text-left"
                    }`}
                    autoFocus
                  />
                </div>
              </motion.div>
            )}

            {quizStep === 3 && (
              <motion.div
                key="step-3"
                custom={quizDirection}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col items-center justify-center text-center pb-12 my-auto"
              >
                <motion.span
                  className="text-[96px] mb-4 select-none block"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  👏
                </motion.span>
                <h1 className="text-[36px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] mb-2 select-none">
                  Great!
                </h1>
                <p className="text-base font-semibold text-zinc-600 max-w-[280px] leading-relaxed select-none">
                  We will monitor the health of <span className="font-bold">{petNameInput}</span> together.
                </p>
              </motion.div>
            )}

            {quizStep === 4 && (
              <motion.div
                key="step-4"
                custom={quizDirection}
                initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col justify-start"
              >
                <div className="mt-3 mb-4 overflow-hidden">
                  <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left w-full select-none">
                    {selectedPetType === "cat"
                      ? "What is your cat's age?"
                      : selectedPetType === "dog"
                      ? "What is your dog's age?"
                      : selectedPetType === "rabbit"
                      ? "What is your rabbit's age?"
                      : "What is your pet's age?"}
                  </h1>
                </div>

                <div className="flex-1 pb-2 flex flex-col">
                  <motion.div
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-2.5"
                  >
                    {(() => {
                      let ageOptions = ["Under 1", "1-3", "4-7", "8-12", "13+", "I don't know for sure"];
                      if (selectedPetType === "rodent") {
                        // Hamster: remove options after 1-3, but add "4+"
                        ageOptions = ["Under 1", "1-3", "4+", "I don't know for sure"];
                      } else if (selectedPetType === "rabbit") {
                        // Rabbit: remove 13+, change 8-12 to 8-12+
                        ageOptions = ["Under 1", "1-3", "4-7", "8-12+", "I don't know for sure"];
                      } else if (selectedPetType === "reptile") {
                        // Turtle: replace 13+ with 13-100
                        ageOptions = ["Under 1", "1-3", "4-7", "8-12", "13-100", "I don't know for sure"];
                      }

                      return ageOptions.map((opt) => {
                        const isSelected = selectedPetAge === opt;
                        return (
                          <motion.button
                            key={opt}
                            variants={cardItemVariants}
                            onClick={() => handleSelectPetAge(opt)}
                            whileTap={{ scale: 0.985 }}
                            className={`w-full py-[13px] px-6 rounded-[25px] bg-white text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                              isSelected 
                                ? "border-black shadow-[0_6px_18px_rgba(0,0,0,0.05)]" 
                                : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                            }`}
                          >
                            <span className="text-[18px] font-semibold text-black select-none">
                              {opt}
                            </span>
                            
                            {/* Circle checkmark indicator on right */}
                            <div className={`relative w-[26px] h-[26px] rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                              isSelected ? "border-transparent" : "border-zinc-200"
                            }`}>
                              <motion.div
                                initial={false}
                                animate={{
                                  scale: isSelected ? 1 : 0,
                                  opacity: isSelected ? 1 : 0,
                                }}
                                transition={{
                                  duration: 0.18,
                                  ease: [0.25, 1, 0.5, 1],
                                }}
                                className="absolute inset-0 bg-black rounded-full"
                              />
                              <svg
                                className="relative z-10 w-3.5 h-3.5 text-white pointer-events-none"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <motion.polyline
                                  points="20 6 9 17 4 12"
                                  initial={false}
                                  animate={{
                                    pathLength: isSelected ? 1 : 0,
                                    opacity: isSelected ? 1 : 0,
                                  }}
                                  transition={{
                                    duration: 0.16,
                                    ease: "easeOut",
                                    delay: isSelected ? 0.04 : 0,
                                  }}
                                />
                              </svg>
                            </div>
                          </motion.button>
                        );
                      });
                    })()}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {quizStep === 5 && (
              <motion.div
                key="step-5"
                custom={quizDirection}
                initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col justify-start"
              >
                <div className="mt-3 mb-4 overflow-hidden">
                  <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left w-full select-none">
                    {selectedPetType === "cat"
                      ? "What is your cat's sex?"
                      : selectedPetType === "dog"
                      ? "What is your dog's sex?"
                      : selectedPetType === "rabbit"
                      ? "What is your rabbit's sex?"
                      : "What is your pet’s sex?"}
                  </h1>
                </div>

                <div className="flex-1 pb-2 flex flex-col">
                  <motion.div
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-2.5"
                  >
                    {[
                      "Male",
                      "Female",
                      "Prefer not to say"
                    ].map((opt) => {
                      const isSelected = selectedPetSex === opt;
                      return (
                        <motion.button
                          key={opt}
                          variants={cardItemVariants}
                          onClick={() => handleSelectPetSex(opt)}
                          whileTap={{ scale: 0.985 }}
                          className={`w-full py-[14px] px-6 rounded-[25px] bg-white text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                            isSelected 
                              ? "border-black shadow-[0_6px_18px_rgba(0,0,0,0.05)]" 
                              : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                          }`}
                        >
                          <span className="text-[18px] font-semibold text-black select-none">
                            {opt}
                          </span>
                          
                          {/* Circle checkmark indicator on right */}
                          <div className={`relative w-[26px] h-[26px] shrink-0 rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                            isSelected ? "border-transparent" : "border-zinc-200"
                          }`}>
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.18,
                                ease: [0.25, 1, 0.5, 1],
                              }}
                              className="absolute inset-0 bg-black rounded-full"
                            />
                            <svg
                              className="relative z-10 w-3.5 h-3.5 text-white pointer-events-none"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <motion.polyline
                                points="20 6 9 17 4 12"
                                initial={false}
                                animate={{
                                  pathLength: isSelected ? 1 : 0,
                                  opacity: isSelected ? 1 : 0,
                                }}
                                transition={{
                                  duration: 0.16,
                                  ease: "easeOut",
                                  delay: isSelected ? 0.04 : 0,
                                }}
                              />
                            </svg>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {quizStep === 6 && (
              <motion.div
                key="step-6"
                custom={quizDirection}
                initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col justify-start"
              >
                <div className="mt-3 mb-4 overflow-hidden">
                  <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left w-full select-none">
                    {selectedPetType === "cat"
                      ? "How often do you notice changes in your cat’s health?"
                      : selectedPetType === "dog"
                      ? "How often do you notice changes in your dog’s health?"
                      : selectedPetType === "rabbit"
                      ? "How often do you notice changes in your rabbit’s health?"
                      : "How often do you notice changes in your pet’s health?"}
                  </h1>
                </div>

                <div className="flex-1 pb-2 flex flex-col">
                  <motion.div
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-2.5"
                  >
                    {[
                      "Always",
                      "Sometimes",
                      "Rarely",
                      "Never"
                    ].map((opt) => {
                      const isSelected = selectedPetHealthChanges === opt;
                      return (
                        <motion.button
                          key={opt}
                          variants={cardItemVariants}
                          onClick={() => handleSelectPetHealthChanges(opt)}
                          whileTap={{ scale: 0.985 }}
                          className={`w-full py-[14px] px-6 rounded-[25px] bg-white text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                            isSelected 
                              ? "border-black shadow-[0_6px_18px_rgba(0,0,0,0.05)]" 
                              : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                          }`}
                        >
                          <span className="text-[18px] font-semibold text-black select-none">
                            {opt}
                          </span>
                          
                          {/* Circle checkmark indicator on right */}
                          <div className={`relative w-[26px] h-[26px] shrink-0 rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                            isSelected ? "border-transparent" : "border-zinc-200"
                          }`}>
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.18,
                                ease: [0.25, 1, 0.5, 1],
                              }}
                              className="absolute inset-0 bg-black rounded-full"
                            />
                            <svg
                              className="relative z-10 w-3.5 h-3.5 text-white pointer-events-none"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <motion.polyline
                                points="20 6 9 17 4 12"
                                initial={false}
                                animate={{
                                  pathLength: isSelected ? 1 : 0,
                                  opacity: isSelected ? 1 : 0,
                                }}
                                transition={{
                                  duration: 0.16,
                                  ease: "easeOut",
                                  delay: isSelected ? 0.04 : 0,
                                }}
                              />
                            </svg>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {quizStep === 7 && (() => {
              // Determine possessive phrase for [ ]
              const nameTrimmed = petNameInput.trim();
              let targetPossessive = "";
              if (nameTrimmed) {
                targetPossessive = `${nameTrimmed}’s`;
              } else if (selectedPetType === "cat") {
                targetPossessive = "your cat’s";
              } else if (selectedPetType === "dog") {
                targetPossessive = "your dog’s";
              } else if (selectedPetType === "rabbit") {
                targetPossessive = "your rabbit’s";
              } else {
                targetPossessive = "your pet’s";
              }

              // Text message depending on step 5 choice
              let titleText = "";
              let subtitleText = "";
              if (selectedPetHealthChanges === "Always" || selectedPetHealthChanges === "Often") {
                titleText = `Attentive to ${targetPossessive} health!`;
                subtitleText = `Pet AI helps you build a clearer picture of their health over time.`;
              } else if (selectedPetHealthChanges === "Sometimes") {
                titleText = `Track ${targetPossessive} health easily`;
                subtitleText = `Pet AI helps you turn occasional checks into a clearer picture over time.`;
              } else if (selectedPetHealthChanges === "Rarely") {
                titleText = `Stay on top of ${targetPossessive} health`;
                subtitleText = `Regular photo checks with Pet AI help you keep track effortlessly.`;
              } else {
                // "Never" or fallback
                titleText = `Start tracking ${targetPossessive} health`;
                subtitleText = `Photo checks with Pet AI make it simple to monitor their well-being.`;
              }

              // Select realistic casual smartphone snapshot photo based on step 1 pet selection
              let activePetPhoto = phoneSnapUnicornImg;
              if (selectedPetType === "dog") activePetPhoto = phoneSnapDogImg;
              else if (selectedPetType === "cat") activePetPhoto = phoneSnapCatImg;
              else if (selectedPetType === "rabbit") activePetPhoto = phoneSnapRabbitImg;
              else if (selectedPetType === "rodent") activePetPhoto = phoneSnapRodentImg;
              else if (selectedPetType === "bird") activePetPhoto = phoneSnapBirdImg;
              else if (selectedPetType === "reptile") activePetPhoto = phoneSnapReptileImg;
              else if (selectedPetType === "another") activePetPhoto = phoneSnapUnicornImg;

              return (
                <motion.div
                  key="step-7"
                  custom={quizDirection}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                  transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full flex-1 flex flex-col justify-between pt-1 overflow-hidden relative min-h-0"
                >
                  {/* Top Text message */}
                  <div className="mt-2 mb-2 overflow-hidden">
                    <motion.h1
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left w-full select-none"
                    >
                      {titleText}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.05 }}
                      className="text-[15px] sm:text-[16px] font-semibold text-zinc-600 leading-snug text-left w-full select-none mt-2"
                    >
                      {subtitleText}
                    </motion.p>
                  </div>

                  {/* Minimal Phone Outline Mockup frame sliding up smoothly from bottom */}
                  <div className="relative w-full flex-1 flex items-end justify-center overflow-hidden pt-1 px-4">
                    <motion.div
                      initial={{ y: 160, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                      className="relative w-full max-w-[270px] sm:max-w-[290px]"
                    >
                      {/* Outer Phone Frame Contour (matching user reference image outline) */}
                      <div className="relative w-full rounded-t-[48px] border-t-[5.5px] border-x-[5.5px] border-black bg-[#F6F7F9] p-2.5 pt-3 shadow-xl overflow-hidden">
                        
                        {/* Left side button stubs */}
                        <div className="absolute -left-[5.5px] top-[44px] w-[3px] h-[15px] bg-black rounded-l-sm" />
                        <div className="absolute -left-[5.5px] top-[70px] w-[3px] h-[24px] bg-black rounded-l-sm" />
                        <div className="absolute -left-[5.5px] top-[102px] w-[3px] h-[24px] bg-black rounded-l-sm" />
                        
                        {/* Right side power button stub */}
                        <div className="absolute -right-[5.5px] top-[80px] w-[3px] h-[34px] bg-black rounded-r-sm" />

                        {/* Top Dynamic Island notch cutout with taller height and rounded pill shape */}
                        <div className="w-[70px] h-[20px] bg-black rounded-full mx-auto mb-3 flex items-center justify-center shrink-0 z-10" />

                        {/* Inner 3:4 realistic pet photo container with rounded corners and scanner frame brackets */}
                        <div className="relative aspect-[3/4] w-full rounded-[30px] overflow-hidden bg-zinc-100 border border-black/5 shadow-inner">
                          <img
                            src={activePetPhoto}
                            alt="Pet casual snapshot"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-[30px]"
                          />

                          {/* Scanner Corner Brackets positioned directly at the 4 corners of the photo */}
                          <div className="absolute inset-0 pointer-events-none select-none z-10">
                            {/* Top-Left Bracket */}
                            <svg className="absolute top-3.5 left-3.5 w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]" viewBox="0 0 32 32" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                              <path d="M 28 4 L 16 4 A 12 12 0 0 0 4 16 L 4 28" />
                            </svg>
                            {/* Top-Right Bracket */}
                            <svg className="absolute top-3.5 right-3.5 w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]" viewBox="0 0 32 32" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                              <path d="M 4 4 L 16 4 A 12 12 0 0 1 28 16 L 28 28" />
                            </svg>
                            {/* Bottom-Left Bracket */}
                            <svg className="absolute bottom-3.5 left-3.5 w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]" viewBox="0 0 32 32" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                              <path d="M 4 4 L 4 16 A 12 12 0 0 0 16 28 L 28 28" />
                            </svg>
                            {/* Bottom-Right Bracket */}
                            <svg className="absolute bottom-3.5 right-3.5 w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]" viewBox="0 0 32 32" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                              <path d="M 28 4 L 28 16 A 12 12 0 0 1 16 28 L 4 28" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sharp localized fade at bottom junction matching background #F6F7F9 */}
                    <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#F6F7F9] via-[#F6F7F9]/90 to-transparent pointer-events-none z-10" />
                  </div>
                </motion.div>
              );
            })()}

            {quizStep === 8 && (
              <motion.div
                key="step-8"
                custom={quizDirection}
                initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col justify-start"
              >
                <div className="mt-3 mb-4 overflow-hidden">
                  <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left w-full select-none">
                    {selectedPetType === "cat"
                      ? "Do small changes in your cat worry you?"
                      : selectedPetType === "dog"
                      ? "Do small changes in your dog worry you?"
                      : selectedPetType === "rabbit"
                      ? "Do small changes in your rabbit worry you?"
                      : "Do small changes in your pet worry you?"}
                  </h1>
                </div>

                <div className="flex-1 pb-2 flex flex-col">
                  <motion.div
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-2.5"
                  >
                    {[
                      "Yes",
                      "Sometimes",
                      "No"
                    ].map((opt) => {
                      const isSelected = selectedPetWorryChanges === opt;
                      return (
                        <motion.button
                          key={opt}
                          variants={cardItemVariants}
                          onClick={() => handleSelectPetWorryChanges(opt)}
                          whileTap={{ scale: 0.985 }}
                          className={`w-full py-[14px] px-6 rounded-[25px] bg-white text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                            isSelected 
                              ? "border-black shadow-[0_6px_18px_rgba(0,0,0,0.05)]" 
                              : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                          }`}
                        >
                          <span className="text-[18px] font-semibold text-black select-none">
                            {opt}
                          </span>
                          
                          {/* Circle checkmark indicator on right */}
                          <div className={`relative w-[26px] h-[26px] shrink-0 rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                            isSelected ? "border-transparent" : "border-zinc-200"
                          }`}>
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.18,
                                ease: [0.25, 1, 0.5, 1],
                              }}
                              className="absolute inset-0 bg-black rounded-full"
                            />
                            <svg
                              className="relative z-10 w-3.5 h-3.5 text-white pointer-events-none"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <motion.polyline
                                points="20 6 9 17 4 12"
                                initial={false}
                                animate={{
                                  pathLength: isSelected ? 1 : 0,
                                  opacity: isSelected ? 1 : 0,
                                }}
                                transition={{
                                  duration: 0.16,
                                  ease: "easeOut",
                                  delay: isSelected ? 0.04 : 0,
                                }}
                              />
                            </svg>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {quizStep === 9 && (
              <motion.div
                key="step-9"
                custom={quizDirection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full flex-1 flex flex-col pt-1 px-1 select-none relative"
              >
                {/* Top Text Header & Subtitle */}
                <div className="w-full text-left px-2 mb-2 flex-none">
                  {graphAnimStage >= 1 && (
                    <motion.h1
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                      className="text-[25px] sm:text-[27px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left"
                    >
                      Catch changes before they become serious
                    </motion.h1>
                  )}

                  {graphAnimStage >= 2 && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                      className="text-[16px] sm:text-[17px] font-semibold text-zinc-600 mt-1.5 text-left"
                    >
                      Pet AI detects changes early
                    </motion.p>
                  )}
                </div>

                {/* Plashka Card Centered Container */}
                <div className="w-full flex-1 flex flex-col justify-center items-center my-auto">
                  {graphAnimStage >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 22, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full bg-white rounded-[32px] p-5 sm:p-6 border border-black/5 flex flex-col"
                    >
                      <h2 className="text-[16px] sm:text-[17px] font-bold text-zinc-900 text-left mb-5">
                        Health Checks
                      </h2>

                      {/* Chart Container Area */}
                      <div className="relative w-full h-[220px] flex items-end justify-between px-2 pt-8 pb-1 overflow-hidden">
                        {/* Baseline guide line */}
                        <div className="absolute inset-x-0 bottom-[38px] border-b border-dashed border-zinc-200 pointer-events-none" />

                        {/* Green Bar ("With Pet AI") */}
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 220, damping: 26 }}
                          className={`flex flex-col items-center z-10 ${
                            graphAnimStage < 4 ? "mx-auto" : ""
                          }`}
                          style={{ width: "115px" }}
                        >
                          {/* Label above bar */}
                          <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-[21px] sm:text-[23px] font-extrabold text-[#1AB13F] mb-1.5 tracking-tight"
                          >
                            20+/mo
                          </motion.span>

                          {/* Green Gradient Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "148px" }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full rounded-[20px]"
                            style={{
                              background: "linear-gradient(180deg, rgb(49, 255, 100) 0%, rgb(26, 177, 63) 100%)"
                            }}
                          />

                          {/* Sub label */}
                          <span className="text-[14px] sm:text-[15px] font-semibold text-black mt-2.5 text-center whitespace-nowrap">
                            With Pet AI
                          </span>
                        </motion.div>

                        {/* Red Bar ("Average") */}
                        {graphAnimStage >= 5 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center z-10"
                            style={{ width: "115px" }}
                          >
                            {/* Label above bar */}
                            <motion.span
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="text-[21px] sm:text-[23px] font-extrabold text-[#F20017] mb-1.5 tracking-tight"
                            >
                              1-2/mo
                            </motion.span>

                            {/* Red Gradient Bar */}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "64px" }}
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                              className="w-full rounded-[20px]"
                              style={{
                                background: "linear-gradient(180deg, rgb(255, 79, 79) 0%, rgb(242, 0, 23) 100%)"
                              }}
                            />

                            {/* Sub label */}
                            <span className="text-[14px] sm:text-[15px] font-semibold text-black mt-2.5 text-center whitespace-nowrap">
                              Average
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {quizStep === 12 && (
              <motion.div
                key="step-12"
                custom={quizDirection}
                initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col justify-start"
              >
                {/* Title */}
                <div className="mt-3 mb-4 overflow-hidden">
                  <h1 className="text-[27px] sm:text-[29px] font-bold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-t from-[#424242] to-[#000000] text-left w-full select-none">
                    Where did you hear about us?
                  </h1>
                </div>

                {/* Options List */}
                <div className="flex-1 pb-4 flex flex-col">
                  <motion.div
                    variants={cardContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-2.5"
                  >
                    {REFERRAL_OPTIONS.map((item) => {
                      const isSelected = selectedReferralSource === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          variants={cardItemVariants}
                          onClick={() => {
                            setSelectedReferralSource(item.id);
                            if (navigator.vibrate) {
                              navigator.vibrate(15);
                            }
                          }}
                          whileTap={{ scale: 0.985 }}
                          className={`w-full py-[15px] px-6 rounded-[25px] bg-white text-left flex items-center justify-between transition-colors duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer border-[2px] ${
                            isSelected
                              ? "border-black shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
                              : "border-transparent shadow-[0_3px_10px_rgba(0,0,0,0.02)]"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-5 h-5 flex items-center justify-center shrink-0 text-black">
                              {item.icon}
                            </div>
                            <span className="text-[18px] font-semibold text-black select-none truncate">
                              {item.label}
                            </span>
                          </div>

                          {/* Circle checkmark indicator on right */}
                          <div
                            className={`relative w-[26px] h-[26px] shrink-0 rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                              isSelected ? "border-transparent" : "border-zinc-200"
                            }`}
                          >
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isSelected ? 1 : 0,
                                opacity: isSelected ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.18,
                                ease: [0.25, 1, 0.5, 1],
                              }}
                              className="absolute inset-0 bg-black rounded-full"
                            />
                            <svg
                              className="relative z-10 w-3.5 h-3.5 text-white pointer-events-none"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <motion.polyline
                                points="20 6 9 17 4 12"
                                initial={false}
                                animate={{
                                  pathLength: isSelected ? 1 : 0,
                                  opacity: isSelected ? 1 : 0,
                                }}
                                transition={{
                                  duration: 0.16,
                                  ease: "easeOut",
                                  delay: isSelected ? 0.04 : 0,
                                }}
                              />
                            </svg>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {quizStep === 13 && (() => {
              const checklistItems = [
                { label: "Analyzing your answers", threshold: 25 },
                { label: "Creating your pet profile", threshold: 50 },
                { label: "Setting your check routine", threshold: 75 },
                { label: "Personalizing reminders", threshold: 100 },
              ];

              const activeSubtext = 
                setupProgress < 25 ? "Analyzing your answers..." :
                setupProgress < 50 ? "Creating your pet profile..." :
                setupProgress < 75 ? "Setting your check routine..." :
                setupProgress < 100 ? "Personalizing reminders..." : "Ready!";

              return (
                <motion.div
                  key="step-13"
                  custom={quizDirection}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full flex-1 flex flex-col justify-center items-center py-4 select-none px-1"
                >
                  {/* Top Percentage with Motion Blur Digit Effect */}
                  <div className="flex flex-col items-center justify-center mt-2 mb-1">
                    <AnimatedBlurNumber value={setupProgress} />
                    
                    <h2 className="text-[23px] sm:text-[25px] font-bold tracking-tight text-black text-center mt-2">
                      Setting everything up for you
                    </h2>
                  </div>

                  {/* Progress Bar & Subtext */}
                  <div className="w-full max-w-[295px] mt-4 mb-6 flex flex-col items-center">
                    <div className="w-full h-[9px] bg-zinc-200/70 rounded-full overflow-hidden relative">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, rgb(0,0,0) 0%, rgb(47,47,47) 100%)",
                        }}
                        animate={{ width: `${setupProgress}%` }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <span className="text-[13px] font-semibold text-zinc-400 mt-2 text-left w-full pl-0.5">
                      {activeSubtext}
                    </span>
                  </div>

                  {/* Plan Checklist Card */}
                  <div className="w-full bg-white rounded-[28px] p-2.5 border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col space-y-1">
                    {checklistItems.map((item, idx) => {
                      const isDone = setupProgress >= item.threshold;
                      const isCurrent = !isDone && (idx === 0 || setupProgress >= checklistItems[idx - 1].threshold);

                      return (
                        <div
                          key={item.label}
                          className={`flex items-center justify-between py-3.5 px-4 rounded-[18px] transition-all duration-300 ${
                            isCurrent
                              ? "bg-[#efeff1]"
                              : "bg-white"
                          }`}
                        >
                          <span
                            className={`text-[16px] sm:text-[17px] tracking-tight transition-colors duration-300 ${
                              isDone || isCurrent
                                ? "font-bold text-black"
                                : "font-medium text-zinc-400"
                            }`}
                          >
                            {item.label}
                          </span>

                          {/* Circle Checkmark Indicator */}
                          <div className={`relative w-[26px] h-[26px] shrink-0 rounded-full border-[1.5px] transition-colors duration-200 overflow-hidden flex items-center justify-center ${
                            isDone ? "border-transparent" : isCurrent ? "border-zinc-300" : "border-zinc-200"
                          }`}>
                            <motion.div
                              initial={false}
                              animate={{
                                scale: isDone ? 1 : 0,
                                opacity: isDone ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.18,
                                ease: [0.25, 1, 0.5, 1],
                              }}
                              className="absolute inset-0 bg-[#22c55e] rounded-full"
                            />
                            <svg
                              className="relative z-10 w-3.5 h-3.5 text-white pointer-events-none"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <motion.polyline
                                points="20 6 9 17 4 12"
                                initial={false}
                                animate={{
                                  pathLength: isDone ? 1 : 0,
                                  opacity: isDone ? 1 : 0,
                                }}
                                transition={{
                                  duration: 0.16,
                                  ease: "easeOut",
                                  delay: isDone ? 0.04 : 0,
                                }}
                              />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}

            {quizStep === 14 && (() => {
              let targetPetEn = "Pet";
              let targetPetRu = "Питомец";
              let checkedSuffixRu = "проверен";

              if (selectedPetType === "dog") {
                targetPetEn = "Dog";
                targetPetRu = "Собака";
                checkedSuffixRu = "проверена";
              } else if (selectedPetType === "cat") {
                targetPetEn = "Cat";
                targetPetRu = "Кошка";
                checkedSuffixRu = "проверена";
              } else if (selectedPetType === "rabbit") {
                targetPetEn = "Rabbit";
                targetPetRu = "Кролик";
                checkedSuffixRu = "проверен";
              }

              const item3Text = currentLanguage === "ru"
                ? `Готово! ${targetPetRu} ${checkedSuffixRu}`
                : `Done! ${targetPetEn} is checked`;

              const routineHeader = "ROUTINE";
              const planTitle = currentLanguage === "ru" ? "План здоровья вашего питомца" : "Your Pet’s Health Plan";
              const planSub = currentLanguage === "ru" ? "Вот как будут выглядеть ваши проверки" : "Here’s what your check-ins will look like";

              const DAYS_MAP = [
                { id: "Sunday", label: "S" },
                { id: "Monday", label: "M" },
                { id: "Tuesday", label: "T" },
                { id: "Wednesday", label: "W" },
                { id: "Thursday", label: "T" },
                { id: "Friday", label: "F" },
                { id: "Saturday", label: "S" },
              ];

              return (
                <motion.div
                  key="step-14"
                  custom={quizDirection}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full flex-1 flex flex-col justify-start items-center py-2 select-none px-1"
                >
                  {/* Top Title & Subtext */}
                  <div className="flex flex-col items-center justify-center mb-5 text-center">
                    <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-black leading-tight mb-1.5">
                      {planTitle}
                    </h1>
                    <p className="text-[15px] font-semibold text-zinc-500 max-w-[290px] leading-snug">
                      {planSub}
                    </p>
                  </div>

                  {/* Card 1: Routine Timeline Card */}
                  <div className="w-full bg-white rounded-[26px] p-4.5 sm:p-5 border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col mb-3.5">
                    <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-3.5 block">
                      {routineHeader}
                    </span>

                    <div className="relative flex flex-col space-y-4">
                      {/* Vertical Connecting Line perfectly centered behind icons */}
                      <div className="absolute left-[17px] -translate-x-1/2 top-[17px] bottom-[17px] w-[2px] bg-zinc-200 z-0" />

                      {/* Item 1: Filled Bell Icon in Black Circle */}
                      <div className="relative z-10 flex items-center space-x-3.5">
                        <div className="w-[34px] h-[34px] rounded-full bg-black flex items-center justify-center text-white shrink-0 shadow-xs">
                          <Bell className="w-[16px] h-[16px] text-white fill-white" />
                        </div>
                        <span className="text-[15px] sm:text-[16px] font-semibold text-zinc-900 tracking-tight">
                          Reminders Rings
                        </span>
                      </div>

                      {/* Item 2: Custom Filled Camera Icon in Black Circle */}
                      <div className="relative z-10 flex items-center space-x-3.5">
                        <div className="w-[34px] h-[34px] rounded-full bg-black flex items-center justify-center text-white shrink-0 shadow-xs">
                          <svg className="w-[17px] h-[17px] text-white" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M4 7C2.89543 7 2 7.89543 2 9V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V9C22 7.89543 21.1046 7 20 7H16.5L15.2 5.26667C14.75 4.66667 14 4 13.2 4H10.8C10 4 9.25 4.66667 8.8 5.26667L7.5 7H4Z"
                              fill="currentColor"
                            />
                            <circle cx="12" cy="13.5" r="4" fill="#000000" />
                            <circle cx="12" cy="13.5" r="2" fill="#FFFFFF" />
                            <circle cx="18" cy="9.5" r="1" fill="#000000" />
                          </svg>
                        </div>
                        <span className="text-[15px] sm:text-[16px] font-semibold text-zinc-900 tracking-tight">
                          Complete Photo Check
                        </span>
                      </div>

                      {/* Item 3: Green Check Circle */}
                      <div className="relative z-10 flex items-center space-x-3.5">
                        <div className="w-[34px] h-[34px] rounded-full bg-[#22c55e] flex items-center justify-center text-white shrink-0 shadow-xs">
                          <Check className="w-[18px] h-[18px] text-white stroke-[3]" />
                        </div>
                        <span className="text-[15px] sm:text-[16px] font-semibold text-zinc-900 tracking-tight">
                          {item3Text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Your Streak Plaque */}
                  <div className="w-full bg-white rounded-[28px] p-5 border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center text-center">
                    <h2 className="text-[21px] sm:text-[22px] font-bold text-[#1c1c1e] mb-1">
                      Your Streak
                    </h2>
                    
                    <p className="text-[14px] font-medium text-zinc-400 text-center leading-snug mb-4 max-w-[280px] mx-auto">
                      Check your pet daily to build your streak
                    </p>

                    {/* Circles for Sunday to Saturday */}
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full pt-1 pb-0.5">
                      {DAYS_MAP.map((dayItem) => {
                        const isSelected = selectedPhotoDays.includes(dayItem.id);
                        return (
                          <div
                            key={dayItem.id}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all select-none pointer-events-none ${
                              isSelected
                                ? "bg-white border-[1.5px] border-black text-black font-bold text-[15px] shadow-2xs"
                                : "bg-zinc-100/90 text-zinc-300 font-semibold text-[15px] border-none"
                            }`}
                          >
                            {dayItem.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {quizStep === 15 && (
              <motion.div
                key="step-15"
                custom={quizDirection}
                initial={{ opacity: 0, x: quizDirection === "forward" ? 35 : -35 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: quizDirection === "forward" ? -35 : 35 }}
                transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                className="w-full flex-1 flex flex-col items-center justify-center py-4 select-none"
              >
                {/* Centered Container with Title & Buttons */}
                <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center px-1">
                  {/* Centered Title directly above buttons */}
                  <h1 className="text-[28px] sm:text-[30px] font-bold tracking-tight text-black text-center mb-8 leading-tight">
                    Create Account
                  </h1>

                  {/* Buttons */}
                  <div className="w-full flex flex-col items-center gap-3.5">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={finishOnboarding}
                      className="w-full py-[18px] text-[17px] font-bold rounded-[50px] bg-black hover:bg-zinc-900 text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-none"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-15 69.5-34.3z" />
                      </svg>
                      <span>Sign in with Apple</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={finishOnboarding}
                      className="w-full py-[18px] text-[17px] font-bold rounded-[50px] bg-transparent hover:bg-zinc-100/60 border border-zinc-300 text-black active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-none"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </motion.button>

                    <button
                      onClick={finishOnboarding}
                      className="text-[15px] font-semibold text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer py-2 mt-2"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Area with Continue button */}
        <div className={`w-full max-w-md mx-auto px-6 mb-0 pb-[env(safe-area-inset-bottom,2px)] flex-none ${quizStep >= 15 ? 'min-h-0 pt-0 pb-1' : 'pt-1 min-h-[72px]'}`}>
          {quizStep === 9 ? (
            <AnimatePresence>
              {graphAnimStage >= 6 && (
                <motion.button
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  onClick={handleNextStep}
                  className="w-full py-[18px] text-[19px] tracking-tight font-bold rounded-[50px] bg-black hover:bg-zinc-900 text-white active:scale-[0.98] transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-lg"
                >
                  Continue
                </motion.button>
              )}
            </AnimatePresence>
          ) : quizStep === 10 ? (
            <div className="flex flex-col items-center gap-2 w-full pb-1">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (capturedFirstPhoto) {
                    setQuizStep(11);
                  } else {
                    setShowStep10Camera(true);
                  }
                }}
                className="w-full py-[18px] text-[19px] tracking-tight font-bold rounded-[50px] bg-black hover:bg-zinc-900 text-white active:scale-[0.98] transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-lg"
              >
                {capturedFirstPhoto ? "Continue" : "Scan Pet"}
              </motion.button>

              <button
                onClick={() => {
                  if (capturedFirstPhoto) {
                    setShowStep10Camera(true);
                  } else {
                    setQuizStep(11);
                  }
                }}
                className="text-[16px] font-semibold text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer py-1"
              >
                {capturedFirstPhoto ? "Re-take photo" : "Skip"}
              </button>
            </div>
          ) : quizStep === 11 || quizStep === 12 ? (
            <motion.button
              onClick={handleNextStep}
              disabled={!canContinue}
              className={`w-full py-[18px] text-[19px] tracking-tight font-bold rounded-[50px] transition-colors duration-300 flex items-center justify-center cursor-pointer ${
                canContinue 
                  ? "bg-black hover:bg-zinc-900 text-white active:scale-[0.98]" 
                  : "bg-[#E7E8E9] text-[#8E8E93] cursor-not-allowed"
              }`}
            >
              Continue
            </motion.button>
          ) : quizStep === 13 ? (
            <div className="h-4" />
          ) : quizStep === 14 ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleNextStep}
              className="w-full py-[18px] text-[19px] tracking-tight font-bold rounded-[50px] bg-black hover:bg-zinc-900 text-white active:scale-[0.98] transition-colors duration-300 flex items-center justify-center cursor-pointer shadow-lg"
            >
              Continue
            </motion.button>
          ) : quizStep === 15 ? (
            <div className="h-1" />
          ) : (
            <motion.button
              onClick={handleNextStep}
              disabled={!canContinue}
              animate={
                quizStep === 3 && isBtnActive
                  ? { y: [0, -10, 0] }
                  : { y: 0 }
              }
              transition={{
                duration: 0.35,
                ease: [0.25, 1, 0.5, 1],
              }}
              className={`w-full py-[18px] text-[19px] tracking-tight font-bold rounded-[50px] transition-colors duration-300 flex items-center justify-center cursor-pointer ${
                canContinue 
                  ? "bg-black hover:bg-zinc-900 text-white active:scale-[0.98]" 
                  : "bg-[#E7E8E9] text-[#8E8E93] cursor-not-allowed"
              }`}
            >
              Continue
            </motion.button>
          )}
        </div>

        {/* Universal Slide-Up Language bottom sheet */}
        <AnimatePresence>
          {showLanguagePopup && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                onClick={() => setShowLanguagePopup(false)}
              />
              
              <motion.div
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0 }}
                dragElastic={{ top: 0.15 }}
                dragSnapToOrigin
                onDragEnd={(event, info) => {
                  if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                    setShowLanguagePopup(false);
                  }
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                className="relative w-full max-w-md mx-auto bg-white dark:bg-[#1C1C1E] text-[#1c1c1e] dark:text-white rounded-t-[44px] px-6 pt-6 pb-8 shadow-[0_-16px_48px_rgba(0,0,0,0.22)] dark:shadow-[0_-16px_48px_rgba(0,0,0,0.6)] border-t border-black/[0.04] dark:border-white/10 flex flex-col z-10 select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4 w-full">
                  <div className="flex items-center">
                    <h3 className="text-base font-extrabold text-[#1c1c1e] dark:text-white">
                      {t.Language}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowLanguagePopup(false)}
                    className="w-12 h-12 rounded-full bg-white dark:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/[0.03] dark:border-none flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 active:scale-95 transition-all cursor-pointer flex-shrink-0 outline-none focus:outline-none"
                  >
                    <X className="w-5 h-5 text-black dark:text-white" strokeWidth={2} />
                  </button>
                </div>

                <div className="flex flex-col divide-y divide-zinc-100 max-h-[360px] overflow-y-auto pr-1">
                  {LANGUAGES.map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code);
                          localStorage.setItem("pethealth_language", lang.code);
                          setShowLanguagePopup(false);
                        }}
                        className="flex items-center justify-between py-3.5 px-1 hover:bg-zinc-50 transition-colors cursor-pointer text-left w-full group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl select-none leading-none">{lang.flag}</span>
                          <span className={`text-[15px] font-semibold text-zinc-800 group-hover:text-black ${isSelected ? 'font-bold text-black' : ''}`}>
                            {lang.name}
                          </span>
                        </div>
                        {isSelected && (
                          <Check size={18} className="text-black stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* CameraView Modal for Step 10 */}
        <AnimatePresence>
          {showStep10Camera && (
            <div className="fixed inset-0 z-50 bg-black">
              <CameraView
                pet={{
                  id: "temp",
                  name: petNameInput.trim() || "Pet",
                  type: (selectedPetType || "dog") as any,
                  image: selectedPetType === "cat" ? catImg : selectedPetType === "dog" ? dogImg : parrotImg,
                  breed: "Pet",
                  age: selectedPetAge || "1 year",
                  weight: "5 kg"
                }}
                onClose={() => setShowStep10Camera(false)}
                onCapture={(dataUrl) => {
                  setCapturedFirstPhoto(dataUrl);
                  setShowStep10Camera(false);
                }}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f4fa] dark:bg-[#000000] text-[#1c1c1e] dark:text-white flex flex-col items-center pt-3.5 pb-28 px-3 select-none overflow-x-hidden relative transition-colors duration-250">

      {/* Direct layout with exact spacing as in the screenshot */}
      <div className="w-full max-w-md flex flex-col items-center space-y-4">
        
        {/* Top Header: 'Petkit' brand on home screen */}
        {activeNavTab === "home" && (
          <header className="w-full flex items-center justify-between px-2 pt-1 pb-0.5">
            <div className="flex items-center">
              <h1 className="text-[31px] sm:text-[33px] font-bold tracking-tight text-[#1c1c1e] dark:text-white select-none leading-none font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif]">
                Petkit
              </h1>
            </div>
          </header>
        )}

        {/* Tab 1: Home View */}
        {activeNavTab === "home" && (
          <div className="w-full flex flex-col items-center space-y-4">
            {/* Overlapping Deck & Symptoms Core Analysis */}
            {pets.length > 0 && (
              <motion.div
                initial={!hasAnimatedHome ? { opacity: 0, y: 36, scale: 0.94 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.05 }}
                className="w-full"
              >
                <PetScanner
                  pets={pets}
                  activePetId={activePetId}
                  onSelectPet={handleSelectPet}
                  onAddPetClick={() => setShowAddPetModal(true)}
                  onAnalysisSuccess={handleAnalysisSuccess}
                  onOpenCamera={() => {
                    if (!isSubscribed) {
                      setShowPaywallModal(true);
                    } else {
                      setShowQuickScanCamera(true);
                    }
                  }}
                  currentLanguage={currentLanguage}
                />
              </motion.div>
            )}

            {/* Dynamic Health Logging Grid */}
            {healthLog && (
              <MetricsGrid
                pet={activePet}
                selectedDate={selectedDate}
                healthLog={healthLog}
                reminders={reminders}
                reportsList={reportsList}
                onUpdateLog={handleUpdateLog}
                onAddReminder={handleAddReminder}
                onToggleReminder={handleToggleReminder}
                onDeleteReminder={handleDeleteReminder}
                onUpdateReminder={handleUpdateReminder}
                onSelectReport={setActiveReport}
                onNavigateToAnalytics={() => {
                  setActiveNavTab("progress");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                currentLanguage={currentLanguage}
                animateEntrance={!hasAnimatedHome}
              />
            )}
          </div>
        )}

        {/* Tab 2: Groups View */}
        {activeNavTab === "groups" && (
          <GroupsView
            activePet={activePet}
            currentLanguage={currentLanguage}
            animateEntrance={!hasAnimatedGroups}
            reportsList={reportsList}
            pets={pets}
          />
        )}

        {/* Tab 3: Progress View */}
        {activeNavTab === "progress" && (
          <ProgressView
            activePet={activePet}
            reportsList={reportsList}
            currentLanguage={currentLanguage}
            animateEntrance={!hasAnimatedProgress}
            onSelectReport={setActiveReport}
            onOpenScan={() => setShowAppleActionSheet(true)}
          />
        )}

        {/* Tab 4: Settings View */}
        {activeNavTab === "settings" && (
          <SettingsView
            currentLanguage={currentLanguage}
            animateEntrance={!hasAnimatedSettings}
            pets={pets}
            activePetId={activePetId}
            onSelectPet={handleSelectPet}
            onAddPet={handleAddPet}
            isSubscribed={isSubscribed}
            onToggleSubscription={(val) => {
              setIsSubscribed(val);
              try {
                localStorage.setItem("pet_health_is_subscribed", val ? "true" : "false");
              } catch {}
            }}
          />
        )}
      </div>

      {/* Floating iOS-style Bottom Navigation Bar with swipe & drag support and '+' menu */}
      {!showPaywallModal && (
        <FloatingBottomNav
          activeTab={activeNavTab}
          onChangeTab={(tab) => {
            setIsAddMenuOpen(false);
            setActiveNavTab(tab);
          }}
          isAddMenuOpen={isAddMenuOpen}
          onToggleAddMenu={() => setIsAddMenuOpen((prev) => !prev)}
          onCloseAddMenu={() => setIsAddMenuOpen(false)}
          onAddPet={() => {
            setIsAddMenuOpen(false);
            setShowAddPetQuizModal(true);
          }}
          onCheckPet={() => {
            setIsAddMenuOpen(false);
            handleTriggerCheckPet();
          }}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Add Pet Onboarding Questions Modal (triggered from '+' button, then navigates to settings) */}
      <AddPetQuizModal
        isOpen={showAddPetQuizModal}
        onClose={() => {
          setShowAddPetQuizModal(false);
          setActiveNavTab("settings");
        }}
        onAddPet={(newPet) => {
          handleAddPet(newPet);
          setShowAddPetQuizModal(false);
          setActiveNavTab("settings");
        }}
      />

      {/* Quick Camera View for "Проверить питомца" */}
      <AnimatePresence>
        {showQuickScanCamera && activePet && (
          <CameraView
            pet={activePet}
            onClose={() => setShowQuickScanCamera(false)}
            onCapture={handleQuickScanCapture}
          />
        )}
      </AnimatePresence>

      {/* Paywall Subscription Screen for Check Pet */}
      <PaywallScreen
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onNavigateToSettings={() => {
          setShowPaywallModal(false);
          setActiveNavTab("settings");
        }}
        onSubscribe={() => {
          // Keep paywall active unless toggled in settings
        }}
        activePet={activePet}
        pets={pets}
        selectedPetType={selectedPetType}
        currentLanguage={currentLanguage}
      />

      {/* Quick AI Analysis In-Progress iOS Overlay */}
      <AnimatePresence>
        {isQuickAnalyzing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="bg-white rounded-[24px] p-6 shadow-2xl flex flex-col items-center gap-3 text-center max-w-xs border border-black/[0.04]"
            >
              <Loader2 className="w-9 h-9 text-[#007AFF] animate-spin" />
              <span className="text-[16px] font-bold text-[#1c1c1e]">
                {currentLanguage === "ru" ? "ИИ анализирует питомца..." : "AI analyzing pet..."}
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-Up Analysis report modal */}
      <AnimatePresence>
        {activeReport && (
          <AnalysisReportModal
            report={activeReport}
            pet={activePet}
            onClose={() => setActiveReport(null)}
            currentLanguage={currentLanguage}
          />
        )}
      </AnimatePresence>

      {/* Custom Pet creation Modal */}
      <AnimatePresence>
        {showAddPetModal && (
          <AddPetModal
            onClose={() => setShowAddPetModal(false)}
            onAddPet={handleAddPet}
          />
        )}
      </AnimatePresence>

      {/* Profile & Account Settings Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
              onClick={() => setShowProfileModal(false)}
            />

            <motion.div
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.15 }}
              dragSnapToOrigin
              onDragEnd={(_event, info) => {
                if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                  setShowProfileModal(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-t-[44px] sm:rounded-3xl p-6 pt-6 shadow-2xl border border-zinc-100 dark:border-white/10 flex flex-col select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Seamless bottom background extension so pulling up never cuts off the sheet */}
              <div className="absolute top-[99%] inset-x-0 h-[600px] bg-white dark:bg-[#1C1C1E] pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-100 border border-zinc-200 text-zinc-800">
                    <Settings className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-black tracking-tight">
                      Settings
                    </h3>
                    <p className="text-[12px] text-zinc-500 font-medium">
                      {pets.length} {pets.length === 1 ? "pet profile" : "pet profiles"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-black hover:bg-zinc-200 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-white hover:text-black transition-colors cursor-pointer"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Action list */}
              <div className="flex flex-col space-y-2 mt-1">
                {/* Language selection */}
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowLanguagePopup(true);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100/80 transition-colors w-full text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs border border-black/5 text-zinc-700">
                      <Globe size={18} />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-zinc-900">{t.Language || "Language"}</div>
                      <div className="text-[12px] text-zinc-500 font-medium">
                        {LANGUAGES.find((l) => l.code === currentLanguage)?.flag}{" "}
                        {LANGUAGES.find((l) => l.code === currentLanguage)?.name}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400 group-hover:text-black transition-colors" />
                </button>

                {/* Add new pet */}
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowAddPetModal(true);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100/80 transition-colors w-full text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs border border-black/5 text-zinc-700">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-zinc-900">Add Pet</div>
                      <div className="text-[12px] text-zinc-500 font-medium">Register a new pet card</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400 group-hover:text-black transition-colors" />
                </button>

                {/* Welcome Quiz / Onboarding Reset */}
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    sessionStorage.setItem("pethealth_revisit_onboarding", "true");
                    sessionStorage.removeItem("pethealth_session_onboarded");
                    localStorage.removeItem("pethealth_session_onboarded");
                    localStorage.removeItem("pethealth_onboarded_v3");
                    setQuizStep(0);
                    setHasAnimatedHome(false);
                    setHasAnimatedGroups(false);
                    setHasAnimatedProgress(false);
                    setIsOnboarded(false);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100/80 transition-colors w-full text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-xs border border-black/5 text-[#006AFF]">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-zinc-900">Welcome Screen</div>
                      <div className="text-[12px] text-zinc-500 font-medium">Revisit setup onboarding</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-zinc-400 group-hover:text-black transition-colors" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
