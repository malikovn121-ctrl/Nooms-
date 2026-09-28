import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Camera } from "lucide-react";

export interface AppleActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPet: () => void;
  onCheckPet: () => void;
  currentLanguage?: string;
}

const ACTION_SHEET_TRANSLATIONS: Record<string, {
  addPet: string;
  checkPet: string;
  cancel: string;
}> = {
  en: {
    addPet: "+ Add Pet",
    checkPet: "Check Pet",
    cancel: "Cancel",
  },
  fr: {
    addPet: "+ Ajouter un animal",
    checkPet: "Vérifier l'animal",
    cancel: "Annuler",
  },
  de: {
    addPet: "+ Haustier hinzufügen",
    checkPet: "Haustier prüfen",
    cancel: "Abbrechen",
  },
  es: {
    addPet: "+ Añadir mascota",
    checkPet: "Revisar mascota",
    cancel: "Cancelar",
  },
  it: {
    addPet: "+ Aggiungi animale",
    checkPet: "Controlla animale",
    cancel: "Annulla",
  },
  ja: {
    addPet: "+ ペットを追加",
    checkPet: "ペットをチェック",
    cancel: "キャンセル",
  },
  ko: {
    addPet: "+ 반려동물 추가",
    checkPet: "반려동물 확인",
    cancel: "취소",
  },
  zh: {
    addPet: "+ 添加宠物",
    checkPet: "检查宠物",
    cancel: "取消",
  },
  "pt-BR": {
    addPet: "+ Adicionar Pet",
    checkPet: "Verificar Pet",
    cancel: "Cancelar",
  },
};

export default function AppleActionSheet({
  isOpen,
  onClose,
  onAddPet,
  onCheckPet,
  currentLanguage = "en",
}: AppleActionSheetProps) {
  const t = ACTION_SHEET_TRANSLATIONS[currentLanguage] || ACTION_SHEET_TRANSLATIONS.en;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
          {/* iOS Translucent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] cursor-pointer"
          />

          {/* iOS Action Sheet Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 w-full max-w-sm sm:max-w-md px-3 pb-6 flex flex-col gap-2 pointer-events-auto"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "SF Pro", "San Francisco", "Helvetica Neue", sans-serif',
            }}
          >
            {/* Primary Action Group (Frosted Glass Container) */}
            <div className="bg-white/85 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl backdrop-saturate-150 rounded-[14px] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-white/60 dark:border-0 divide-y divide-black/[0.08] dark:divide-white/10">
              {/* Option 1: Add Pet */}
              <button
                id="apple-sheet-add-pet"
                onClick={() => {
                  onClose();
                  onAddPet();
                }}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-[17px] tracking-tight font-medium text-[#007AFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors cursor-pointer"
              >
                <span>{t.addPet}</span>
                <Plus className="w-5 h-5 text-[#007AFF] stroke-[2.4]" />
              </button>

              {/* Option 2: Check Pet */}
              <button
                id="apple-sheet-check-pet"
                onClick={() => {
                  onClose();
                  onCheckPet();
                }}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-[17px] tracking-tight font-medium text-[#007AFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors cursor-pointer"
              >
                <span>{t.checkPet}</span>
                <Camera className="w-5 h-5 text-[#007AFF] stroke-[2.2]" />
              </button>
            </div>

            {/* Cancel Button (Separate Floating Card in true iOS style) */}
            <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[14px] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-white/60 dark:border-0">
              <button
                id="apple-sheet-cancel"
                onClick={onClose}
                className="w-full py-4 text-center text-[17px] tracking-tight font-bold text-[#007AFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:bg-black/[0.08] dark:active:bg-white/[0.1] transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
