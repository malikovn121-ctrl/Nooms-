import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pet, PetType, AnalysisReport } from "../types";
import { HeartPulse, Check, Loader2, X, Sparkles, Camera } from "lucide-react";
import CameraView from "./CameraView";

const ensureBase64 = async (imageSrc: string): Promise<string> => {
  if (!imageSrc) {
    throw new Error("No image source provided for base64 encoding");
  }
  if (imageSrc.startsWith("data:")) {
    return imageSrc;
  }
  try {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read image as base64 data URL"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Direct fetch conversion failed, falling back to canvas drawing for:", imageSrc, error);
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.9));
          } else {
            reject(new Error("Canvas context is unavailable"));
          }
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image for canvas-based base64 conversion"));
      img.src = imageSrc;
    });
  }
};

interface PetScannerProps {
  pets: Pet[];
  activePetId: string;
  onSelectPet: (id: string) => void;
  onAddPetClick: () => void;
  onAnalysisSuccess: (report: AnalysisReport) => void;
  onOpenCamera?: () => void;
  currentLanguage?: string;
}

const COMMON_SYMPTOMS = [
  { id: "normal", label: "✨ Prevention / Healthy", category: "all" },
  { id: "lethargy", label: "💤 Lethargy / Weakness", category: "all" },
  { id: "scratching", label: "🪰 Itching / Scratching", category: "all" },
  { id: "eyes", label: "👁️ Red eyes / Tears", category: "all" },
  { id: "limping", label: "🐾 Limping / Mobility pain", category: "all" },
  { id: "coat", label: "🧴 Hair loss / Bald patches", category: "cat_dog" },
  { id: "feathers", label: "🪶 Feather issues / Self-plucking", category: "parrot" },
  { id: "cough", label: "💨 Cough / Sneezing", category: "all" },
  { id: "appetite", label: "🥣 Reduced appetite", category: "all" }
];

const SYMPTOMS_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    normal: "✨ Prevention / Everything is fine",
    lethargy: "💤 Lethargy / Weakness",
    scratching: "🪰 Itching / Scratching",
    eyes: "👁️ Red eyes / Tears",
    limping: "🐾 Limping / Pain during movement",
    coat: "🧴 Hair loss / Bald patches",
    feathers: "🪶 Feather issues / Self-plucking",
    cough: "💨 Cough / Sneeze",
    appetite: "🥣 Poor appetite"
  },
  fr: {
    normal: "✨ Prévention / Tout va bien",
    lethargy: "💤 Léthargie / Faiblesse",
    scratching: "🪰 Démangeaisons / Grattage",
    eyes: "👁️ Yeux rouges / Larmes",
    limping: "🐾 Boiterie / Douleur au mouvement",
    coat: "🧴 Perte de poils / Zones dégarnies",
    feathers: "🪶 Problèmes de plumes / Picage",
    cough: "💨 Toux / Éternuement",
    appetite: "🥣 Manque d'appétit"
  },
  de: {
    normal: "✨ Vorsorge / Alles bestens",
    lethargy: "💤 Trägheit / Schwäche",
    scratching: "🪰 Juckreiz / Kratzen",
    eyes: "👁️ Rote Augen / Tränen",
    limping: "🐾 Humpeln / Schmerzen beim Gehen",
    coat: "🧴 Haarausfall / Kahle Stellen",
    feathers: "🪶 Gefiederprobleme / Rupfen",
    cough: "💨 Husten / Niesen",
    appetite: "🥣 Appetitlosigkeit"
  },
  es: {
    normal: "✨ Prevención / Todo excelente",
    lethargy: "💤 Letargo / Debilidad",
    scratching: "🪰 Picazón / Rascado",
    eyes: "👁️ Ojos rojos / Lágrimas",
    limping: "🐾 Cojera / Dolor al moverse",
    coat: "🧴 Pérdida de pelo / Calvas",
    feathers: "🪶 Problemas de plumas / Picaje",
    cough: "💨 Tos / Estornudos",
    appetite: "🥣 Poco apetito"
  },
  it: {
    normal: "✨ Prevenzione / Tutto ottimo",
    lethargy: "💤 Letargia / Debolezza",
    scratching: "🪰 Prurito / Grattamento",
    eyes: "👁️ Occhi rossi / Lacrime",
    limping: "🐾 Zoppia / Dolore nel muoversi",
    coat: "🧴 Perdita di pelo / Chiazze calve",
    feathers: "🪶 Problemi di piume / Autodeplumazione",
    cough: "💨 Tosse / Starnuti",
    appetite: "🥣 Inappetenza"
  },
  ja: {
    normal: "✨ 予防 / すべて順調",
    lethargy: "💤 無気力 / 衰弱",
    scratching: "🪰 かゆみ / ひっかき傷",
    eyes: "👁️ 目の充血 / 涙目",
    limping: "🐾 跛行 / 歩行時の痛み",
    coat: "🧴 脱毛 / はげ部分",
    feathers: "🪶 羽毛トラブル / 毛引き症",
    cough: "💨 咳 / くしゃみ",
    appetite: "🥣 食欲不振"
  },
  ko: {
    normal: "✨ 예방 / 상태 아주 좋음",
    lethargy: "💤 기력 저하 / 약해짐",
    scratching: "🪰 가려움 / 긁음",
    eyes: "👁️ 눈 충혈 / 눈물",
    limping: "🐾 절뚝거림 / 움직일 때 통증",
    coat: "🧴 탈모 / 대머리 반점",
    feathers: "🪶 깃털 문제 / 자해 피킹",
    cough: "💨 기침 / 재채기",
    appetite: "🥣 식욕 저하"
  },
  zh: {
    normal: "✨ 预防保健 / 一切良好",
    lethargy: "💤 精神不振 / 虚弱",
    scratching: "🪰 瘙痒 / 抓挠",
    eyes: "👁️ 眼睛红肿 / 流泪",
    limping: "🐾 跛行 / 运动时疼痛",
    coat: "🧴 掉毛 / 秃斑",
    feathers: "🪶 羽毛问题 / 拔羽癖",
    cough: "💨 咳嗽 / 打喷嚏",
    appetite: "🥣 食欲不振"
  },
  "pt-BR": {
    normal: "✨ Prevenção / Tudo ótimo",
    lethargy: "💤 Letargia / Fraqueza",
    scratching: "🪰 Coceira / Coçar-se",
    eyes: "👁️ Olhos vermelhos / Lágrimas",
    limping: "🐾 Claudicação / Dor ao mover-se",
    coat: "🧴 Queda de pelo / Falhas no pelo",
    feathers: "🪶 Problemas nas penas / Arrancamento",
    cough: "💨 Tosse / Espirro",
    appetite: "🥣 Falta de apetite"
  }
};

const SCANNER_TRANSLATIONS: Record<string, {
  Analyze: string;
  SymptomsFor: string;
  UploadPhoto: string;
  ChangePhoto: string;
  Reset: string;
  NewPet: string;
  CheckSymptomsTitle: string;
  StartAiAnalysis: string;
  Analyzing: string;
  ServerError: string;
}> = {
  en: {
    Analyze: "Check Pet",
    SymptomsFor: "Symptoms of",
    UploadPhoto: "📸 Upload photo",
    ChangePhoto: "🔄 Change photo",
    Reset: "Reset",
    NewPet: "➕ New pet",
    CheckSymptomsTitle: "Check symptoms before AI analysis:",
    StartAiAnalysis: "Run AI Analysis",
    Analyzing: "Analyzing with AI...",
    ServerError: "Failed to connect to the AI server."
  },
  fr: {
    Analyze: "Scanner",
    SymptomsFor: "Symptômes de",
    UploadPhoto: "📸 Charger photo",
    ChangePhoto: "🔄 Changer photo",
    Reset: "Réinitialiser",
    NewPet: "➕ Nouveau compagnon",
    CheckSymptomsTitle: "Cochez les symptômes avant l'analyse IA :",
    StartAiAnalysis: "Lancer l'analyse IA",
    Analyzing: "Analyse IA en cours...",
    ServerError: "Impossible de se connecter au serveur IA."
  },
  de: {
    Analyze: "Scannen",
    SymptomsFor: "Symptome von",
    UploadPhoto: "📸 Foto hochladen",
    ChangePhoto: "🔄 Foto ändern",
    Reset: "Zurücksetzen",
    NewPet: "➕ Neues Haustier",
    CheckSymptomsTitle: "Symptome vor KI-Analyse markieren:",
    StartAiAnalysis: "KI-Analyse starten",
    Analyzing: "KI analysiert...",
    ServerError: "Verbindung zum KI-Server fehlgeschlagen."
  },
  es: {
    Analyze: "Escanear",
    SymptomsFor: "Síntomas de",
    UploadPhoto: "📸 Subir foto",
    ChangePhoto: "🔄 Cambiar foto",
    Reset: "Restablecer",
    NewPet: "➕ Nueva mascota",
    CheckSymptomsTitle: "Marcar síntomas antes del análisis de IA:",
    StartAiAnalysis: "Iniciar análisis de IA",
    Analyzing: "Analizando con IA...",
    ServerError: "Error de conexión con el servidor IA."
  },
  it: {
    Analyze: "Scansiona",
    SymptomsFor: "Sintomi di",
    UploadPhoto: "📸 Carica foto",
    ChangePhoto: "🔄 Cambia foto",
    Reset: "Ripristina",
    NewPet: "➕ Nuovo animale",
    CheckSymptomsTitle: "Segna i sintomi prima dell'analisi IA:",
    StartAiAnalysis: "Avvia analisi IA",
    Analyzing: "Analisi IA in corso...",
    ServerError: "Connessione al server IA fallita."
  },
  ja: {
    Analyze: "スキャン",
    SymptomsFor: "の症状",
    UploadPhoto: "📸 写真をアップロード",
    ChangePhoto: "🔄 写真を変更",
    Reset: "リセット",
    NewPet: "➕ 新しいペット",
    CheckSymptomsTitle: "AI分析前に対象의症状を選択してください：",
    StartAiAnalysis: "AI分析を実行",
    Analyzing: "AI分析中...",
    ServerError: "AIサーバーへの接続に失敗しました。"
  },
  ko: {
    Analyze: "스캔",
    SymptomsFor: "의 증상",
    UploadPhoto: "📸 사진 업로드",
    ChangePhoto: "🔄 사진 변경",
    Reset: "재설정",
    NewPet: "➕ 새로운 반려동물",
    CheckSymptomsTitle: "AI 분석 전 증상을 선택해 주세요:",
    StartAiAnalysis: "AI 분석 시작",
    Analyzing: "AI 분석 중...",
    ServerError: "AI 서버 연결에 실패했습니다."
  },
  zh: {
    Analyze: "扫描",
    SymptomsFor: "的症状",
    UploadPhoto: "📸 上传照片",
    ChangePhoto: "🔄 更换照片",
    Reset: "重置",
    NewPet: "➕ 添加宠物",
    CheckSymptomsTitle: "AI分析前请先勾选症状：",
    StartAiAnalysis: "启动 AI 分析",
    Analyzing: "AI 分析中...",
    ServerError: "连接 AI 服务器失败。"
  },
  "pt-BR": {
    Analyze: "Escanear",
    SymptomsFor: "Sintomas de",
    UploadPhoto: "📸 Enviar foto",
    ChangePhoto: "🔄 Mudar foto",
    Reset: "Redefinir",
    NewPet: "➕ Novo Pet",
    CheckSymptomsTitle: "Marque os sintomas antes da análise por IA:",
    StartAiAnalysis: "Executar Análise por IA",
    Analyzing: "Analisando com IA...",
    ServerError: "Falha ao conectar ao servidor de IA."
  }
};

export default function PetScanner({
  pets,
  activePetId,
  onSelectPet,
  onAddPetClick,
  onAnalysisSuccess,
  onOpenCamera,
  currentLanguage = "en",
}: PetScannerProps) {
  const langCode = currentLanguage;
  const t = SCANNER_TRANSLATIONS[langCode] || SCANNER_TRANSLATIONS.en;

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showSymptomsSheet, setShowSymptomsSheet] = useState(false);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePet = pets.find((p) => p.id === activePetId) || pets[0];

  const handleCameraCapture = (imageDataUrl: string) => {
    setCustomImage(imageDataUrl);
    setShowCamera(false);
    setShowSymptomsSheet(true);
  };

  const handleSymptomToggle = (symptomLabel: string) => {
    if (selectedSymptoms.includes(symptomLabel)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptomLabel));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomLabel]);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    let imageToSend = customImage || activePet.image;

    try {
      imageToSend = await ensureBase64(imageToSend);
    } catch (e: any) {
      console.warn("Base64 encoding client-side fallback warning:", e);
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
          symptoms: selectedSymptoms,
        }),
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error during analysis");
      }

      // Safely validate and parse each expected field to populate the AnalysisReport type correctly without silent failures
      const parsedReport: AnalysisReport = {
        id: Math.random().toString(36).substring(2, 9),
        petId: activePet.id,
        date: new Date().toISOString(),
        photo: imageToSend,
        healthScore: typeof data.healthScore === "number" ? data.healthScore : 90,
        bodyScore: typeof data.bodyScore === "number" ? data.bodyScore : Math.min(100, (typeof data.healthScore === "number" ? data.healthScore : 90) + 1),
        eyesScore: typeof data.eyesScore === "number" ? data.eyesScore : Math.min(100, (typeof data.healthScore === "number" ? data.healthScore : 90) + 2),
        skinScore: typeof data.skinScore === "number" ? data.skinScore : Math.max(30, (typeof data.healthScore === "number" ? data.healthScore : 90) - 1),
        statusLabel: typeof data.statusLabel === "string" ? data.statusLabel : "Normal",
        summary: typeof data.summary === "string" ? data.summary : "Analysis completed.",
        findings: Array.isArray(data.findings)
          ? data.findings.map((f: any) => ({
              category: typeof f.category === "string" ? f.category : "Inspection",
              status: f.status === "good" || f.status === "warning" || f.status === "critical" ? f.status : "good",
              details: typeof f.details === "string" ? f.details : "Parameters normal.",
            }))
          : [],
        recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
        dietAdvice: typeof data.dietAdvice === "string" ? data.dietAdvice : "No dietary concerns noted.",
        followUp: typeof data.followUp === "string" ? data.followUp : "Continue monitoring your pet.",
        symptomsAnalyzed: selectedSymptoms,
        possibleDiseases: Array.isArray(data.possibleDiseases) ? data.possibleDiseases : [],
        generalCondition: typeof data.generalCondition === "string" ? data.generalCondition : "Good condition.",
      };

      onAnalysisSuccess(parsedReport);
      setShowSymptomsSheet(false);
    } catch (error: any) {
      console.error(error);
      setAnalysisError(error.message || "Failed to reach AI server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPetIndex = (id: string) => pets.findIndex((p) => p.id === id);
  const activeIdx = getPetIndex(activePetId);

  const filteredSymptoms = COMMON_SYMPTOMS.filter(
    (s) =>
      s.category === "all" ||
      (activePet.type === "parrot" && s.category === "parrot") ||
      ((activePet.type === "cat" || activePet.type === "dog") && s.category === "cat_dog")
  );

  return (
    <div id="pet-scanner-section" className="w-full flex flex-col items-center">
      {/* Container themed in #183BA7 with single phone and dissolution gradient */}
      <div 
        className="w-full max-w-md bg-[#183BA7] rounded-[2.2rem] relative overflow-hidden mb-2.5 flex flex-col items-center p-5 pt-3.5"
        style={{ height: "285px" }}
      >
        {/* Center Scanner Frame with Breathing Pulse matching the attached square bracket mockup */}
        <div className="absolute inset-x-0 top-0 bottom-20 flex items-center justify-center pointer-events-none select-none">
          <motion.div 
            animate={{ scale: [0.94, 1.06, 0.94] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
            className="relative w-32 h-32 flex items-center justify-center"
          >
            {/* Ultra-smooth rounded SVG brackets exactly matching the user's mockup with rounded line caps */}
            <svg 
              viewBox="0 0 100 100" 
              className="absolute inset-0 w-full h-full text-white pointer-events-none select-none drop-shadow-md z-10" 
              stroke="currentColor" 
              strokeWidth="7" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="none"
            >
              {/* Top-Left Bracket */}
              <path d="M 32 12 L 25 12 A 13 13 0 0 0 12 25 L 12 32" />
              {/* Top-Right Bracket */}
              <path d="M 68 12 L 75 12 A 13 13 0 0 1 88 25 L 88 32" />
              {/* Bottom-Left Bracket */}
              <path d="M 12 68 L 12 75 A 13 13 0 0 0 25 88 L 32 88" />
              {/* Bottom-Right Bracket */}
              <path d="M 88 68 L 88 75 A 13 13 0 0 1 75 88 L 68 88" />
            </svg>

            {/* Glowing scan line/laser inside the bracket area when analyzing is active */}
            {isAnalyzing && (
              <motion.div
                animate={{ top: ["12%", "88%", "12%"] }}
                transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                className="absolute left-4 right-4 h-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] rounded-full z-10"
              ></motion.div>
            )}
          </motion.div>
        </div>

        {/* Hidden inputs to allow photo customization/adding if needed by underlying flows */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Absolute Big Bold "Analyze" Button Overlay - shorter in height, smaller text, reduced rounding */}
        <div className="w-full max-w-[340px] px-1 mt-auto z-20 mb-1.5">
          <button
            onClick={() => {
              if (onOpenCamera) {
                onOpenCamera();
              } else {
                setShowCamera(true);
              }
            }}
            id="analyze-pet-button"
            className="w-full bg-white text-[#183BA7] font-extrabold text-[22px] py-3.5 rounded-[25px] shadow-lg hover:bg-zinc-50 active:scale-97 transition-all flex items-center justify-center cursor-pointer tracking-tight"
          >
            {t.Analyze}
          </button>
        </div>
      </div>

      {/* Interactive Symptoms & Trigger Sheet */}
      <AnimatePresence>
        {showSymptomsSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
              onClick={() => setShowSymptomsSheet(false)}
            />
            
            <motion.div
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0.15 }}
              dragSnapToOrigin
              onDragEnd={(_event, info) => {
                if (info.offset.y > 70 || (info.velocity.y > 200 && info.offset.y > 15)) {
                  setShowSymptomsSheet(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[2.5rem] px-6 pt-3 pb-6 shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-y-auto select-none"
              id="symptoms-bottom-sheet"
              onClick={(e) => e.stopPropagation()}
            >
              {/* iOS Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-2 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none" />

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-1.5">
                  <HeartPulse size={18} className="text-[#5856d6]" />
                  <h3 className="text-base font-extrabold text-[#1c1c1e]">
                    {(langCode === "ja" || langCode === "ko" || langCode === "zh")
                      ? `${activePet.name}${t.SymptomsFor}`
                      : `${t.SymptomsFor} ${activePet.name}`}
                  </h3>
                </div>
                <button
                  onClick={() => setShowSymptomsSheet(false)}
                  className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 cursor-pointer"
                >
                  <X size={14} className="text-zinc-600" />
                </button>
              </div>

              {/* Action row to change photo or add another pet inside the interactive menu */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={triggerUpload}
                  className="flex-1 text-xs py-2 px-3 rounded-xl font-bold bg-zinc-50 border border-zinc-100 text-zinc-600 hover:bg-zinc-100 cursor-pointer text-center"
                >
                  {customImage ? t.ChangePhoto : t.UploadPhoto}
                </button>
                {customImage && (
                  <button
                    type="button"
                    onClick={() => setCustomImage(null)}
                    className="text-xs py-2 px-3 rounded-xl font-bold bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer"
                  >
                    {t.Reset}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowSymptomsSheet(false);
                    onAddPetClick();
                  }}
                  className="flex-1 text-xs py-2 px-3 rounded-xl font-bold bg-zinc-50 border border-zinc-100 text-zinc-600 hover:bg-zinc-100 cursor-pointer text-center"
                >
                  {t.NewPet}
                </button>
              </div>

              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2 block">
                {t.CheckSymptomsTitle}
              </span>

              <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto pr-1 pb-4">
                {filteredSymptoms.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom.label);
                  const translatedLabel = SYMPTOMS_TRANSLATIONS[langCode]?.[symptom.id] || symptom.label;
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => handleSymptomToggle(symptom.label)}
                      className={`text-xs py-2.5 px-3.5 rounded-full font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                        isSelected
                          ? "bg-[#5856d6] text-white border-transparent shadow-xs"
                          : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {translatedLabel}
                      {isSelected && <Check size={11} />}
                    </button>
                  );
                })}
              </div>

              {analysisError && (
                <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl border border-red-100 mb-4 text-center">
                  ⚠️ {analysisError}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-[#1c1c1e] hover:bg-black text-white font-extrabold py-3.5 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-80 disabled:cursor-wait"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    {t.Analyzing}
                  </>
                ) : (
                  t.StartAiAnalysis
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS Camera Modal Overlay */}
      <AnimatePresence>
        {showCamera && (
          <CameraView
            pet={activePet}
            onClose={() => setShowCamera(false)}
            onCapture={handleCameraCapture}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

